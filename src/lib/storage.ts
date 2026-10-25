import { writeFile, mkdir, unlink, stat } from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StoragePutOptions {
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

export interface StoragePutResult {
  url: string;
  key: string;
}

export interface StorageAdapter {
  readonly driverName: "local" | "s3";
  put(options: StoragePutOptions): Promise<StoragePutResult>;
  getUrl(key: string): string;
  delete(key: string): Promise<boolean>;
}

export interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
  fetchFn?: typeof fetch;
}

/**
 * Local filesystem storage driver.
 * Stores files in public/uploads and serves via relative URL /uploads/[filename].
 * Default for development and QA suites.
 */
export class LocalStorageDriver implements StorageAdapter {
  readonly driverName = "local" as const;
  private readonly uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.resolve(process.cwd(), "public", "uploads");
  }

  async put(options: StoragePutOptions): Promise<StoragePutResult> {
    const { filename, buffer } = options;
    const safeBaseName = path.basename(filename);

    await mkdir(this.uploadDir, { recursive: true });
    const targetPath = path.resolve(this.uploadDir, safeBaseName);

    // Path traversal safety assertion
    if (!targetPath.startsWith(this.uploadDir)) {
      throw new Error("Illegal file path traversal attempt");
    }

    await writeFile(targetPath, buffer);
    return {
      url: `/uploads/${safeBaseName}`,
      key: safeBaseName,
    };
  }

  getUrl(key: string): string {
    const safeBaseName = path.basename(key);
    return `/uploads/${safeBaseName}`;
  }

  async delete(key: string): Promise<boolean> {
    const safeBaseName = path.basename(key);
    const targetPath = path.resolve(this.uploadDir, safeBaseName);

    if (!targetPath.startsWith(this.uploadDir)) {
      return false;
    }

    try {
      await stat(targetPath);
      await unlink(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * S3-compatible cloud object storage driver (AWS S3, Cloudflare R2, Supabase Storage).
 * Implements AWS Signature V4 REST authentication over standard fetch.
 * Activated in production when STORAGE_DRIVER === "s3".
 */
export class S3StorageDriver implements StorageAdapter {
  readonly driverName = "s3" as const;
  private readonly config: S3Config;
  private readonly fetchImpl: typeof fetch;

  constructor(config: S3Config) {
    this.config = config;
    this.fetchImpl = config.fetchFn || fetch;
  }

  private sha256Hex(data: string | Buffer): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private hmacSha256(key: Buffer | string, data: string): Buffer {
    return crypto.createHmac("sha256", key).update(data).digest();
  }

  private getSigningKey(secretKey: string, dateStamp: string, region: string): Buffer {
    const kDate = this.hmacSha256(`AWS4${secretKey}`, dateStamp);
    const kRegion = this.hmacSha256(kDate, region);
    const kService = this.hmacSha256(kRegion, "s3");
    return this.hmacSha256(kService, "aws4_request");
  }

  private buildSignedHeaders(
    method: string,
    canonicalUri: string,
    headers: Record<string, string>,
    payloadHash: string,
    now: Date
  ): Record<string, string> {
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substring(0, 8);
    const region = this.config.region || "auto";

    const allHeaders: Record<string, string> = {
      ...headers,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
    };

    const sortedHeaderKeys = Object.keys(allHeaders).map((k) => k.toLowerCase()).sort();
    const canonicalHeaders = sortedHeaderKeys.map((k) => `${k}:${allHeaders[k].trim()}\n`).join("");
    const signedHeaders = sortedHeaderKeys.join(";");

    const canonicalRequest = [
      method,
      canonicalUri,
      "", // Query string
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      this.sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = this.getSigningKey(this.config.secretAccessKey, dateStamp, region);
    const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      ...allHeaders,
      Authorization: authorization,
    };
  }

  async put(options: StoragePutOptions): Promise<StoragePutResult> {
    const { filename, buffer, mimeType } = options;
    const safeBaseName = path.basename(filename);
    const key = safeBaseName;

    const endpointUrl = new URL(this.config.endpoint);
    const bucket = this.config.bucket;
    const canonicalUri = `/${bucket}/${encodeURIComponent(key)}`;
    const targetUrl = `${endpointUrl.origin}${canonicalUri}`;

    const payloadHash = this.sha256Hex(buffer);
    const now = new Date();

    const signedHeaders = this.buildSignedHeaders(
      "PUT",
      canonicalUri,
      {
        host: endpointUrl.host,
        "content-type": mimeType || "application/octet-stream",
      },
      payloadHash,
      now
    );

    const response = await this.fetchImpl(targetUrl, {
      method: "PUT",
      headers: signedHeaders,
      body: new Uint8Array(buffer),
    });

    if (!response.ok) {
      throw new Error(`S3 storage PUT failed with status HTTP ${response.status}`);
    }

    const publicUrl = this.getUrl(key);
    return { url: publicUrl, key };
  }

  getUrl(key: string): string {
    const safeBaseName = path.basename(key);
    if (this.config.publicBaseUrl && this.config.publicBaseUrl.trim().length > 0) {
      const base = this.config.publicBaseUrl.replace(/\/+$/, "");
      return `${base}/${encodeURIComponent(safeBaseName)}`;
    }
    const endpointUrl = new URL(this.config.endpoint);
    return `${endpointUrl.origin}/${this.config.bucket}/${encodeURIComponent(safeBaseName)}`;
  }

  async delete(key: string): Promise<boolean> {
    const safeBaseName = path.basename(key);
    const endpointUrl = new URL(this.config.endpoint);
    const bucket = this.config.bucket;
    const canonicalUri = `/${bucket}/${encodeURIComponent(safeBaseName)}`;
    const targetUrl = `${endpointUrl.origin}${canonicalUri}`;

    const payloadHash = this.sha256Hex("");
    const now = new Date();

    const signedHeaders = this.buildSignedHeaders(
      "DELETE",
      canonicalUri,
      {
        host: endpointUrl.host,
      },
      payloadHash,
      now
    );

    try {
      const response = await this.fetchImpl(targetUrl, {
        method: "DELETE",
        headers: signedHeaders,
      });
      return response.ok || response.status === 204 || response.status === 404;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function returning configured storage adapter.
 * Uses local disk by default, or S3 if STORAGE_DRIVER === "s3".
 */
export function getStorageAdapter(customEnv: Record<string, string | undefined> = process.env): StorageAdapter {
  const driver = (customEnv.STORAGE_DRIVER || "local").toLowerCase().trim();

  if (driver === "s3") {
    const endpoint = customEnv.STORAGE_ENDPOINT || "";
    const bucket = customEnv.STORAGE_BUCKET || "";
    const accessKeyId = customEnv.STORAGE_ACCESS_KEY_ID || "";
    const secretAccessKey = customEnv.STORAGE_SECRET_ACCESS_KEY || "";
    const region = customEnv.STORAGE_REGION || "auto";
    const publicBaseUrl = customEnv.STORAGE_PUBLIC_BASE_URL || "";

    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3 storage driver requested but required configuration variables are missing (STORAGE_ENDPOINT, STORAGE_BUCKET, STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY)"
      );
    }

    return new S3StorageDriver({
      endpoint,
      bucket,
      accessKeyId,
      secretAccessKey,
      region,
      publicBaseUrl,
    });
  }

  return new LocalStorageDriver();
}
