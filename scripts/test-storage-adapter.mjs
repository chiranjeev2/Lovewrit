import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";

// If not running under tsx, re-exec via tsx
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-storage-adapter.mjs");
    const stdout = execFileSync(
      process.execPath,
      [tsxCli, scriptPath],
      {
        env: { ...process.env, __TSX_ACTIVE__: "1" },
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    process.stdout.write(stdout);
    process.exit(0);
  } catch (err) {
    if (err.stdout) process.stdout.write(err.stdout.toString());
    if (err.stderr) process.stderr.write(err.stderr.toString());
    process.exit(err.status || 1);
  }
}

const { LocalStorageDriver, S3StorageDriver, getStorageAdapter } = await import("../src/lib/storage");
const { SafeMediaUrlSchema } = await import("../src/types/scenes");
const { NextRequest } = await import("next/server");
const { POST: uploadPOST } = await import("../src/app/api/upload/route");
const { GET: uploadsStaticGET } = await import("../src/app/uploads/[filename]/route");

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedAssertions++;
  console.log(`  ✓ ${message}`);
}

async function runStorageTests() {
  console.log("=== RUNNING STORAGE ADAPTER & UPLOAD CONTRACT TESTS ===");

  // --------------------------------------------------------------------------
  // 1. Storage Interface Contract Against Local Driver
  // --------------------------------------------------------------------------
  console.log("\n[1] Testing Local Storage Driver Contract...");
  const tempDir = path.resolve(process.cwd(), "qa-logs", "test-local-storage");
  const localDriver = new LocalStorageDriver(tempDir);

  assert(localDriver.driverName === "local", "Driver identifies as 'local'");

  // Put operation
  const testBuffer = Buffer.from("test image payload content 12345");
  const filename = "unit-test-image.png";
  const putResult = await localDriver.put({
    filename,
    buffer: testBuffer,
    mimeType: "image/png",
  });

  assert(putResult.key === filename, `put() returns correct key: ${putResult.key}`);
  assert(putResult.url === `/uploads/${filename}`, `put() returns correct local relative URL: ${putResult.url}`);
  assert(fs.existsSync(path.join(tempDir, filename)), "File persisted to target local directory");
  assert(fs.readFileSync(path.join(tempDir, filename)).equals(testBuffer), "Persisted file content matches input buffer");

  // getUrl operation
  const getUrlResult = localDriver.getUrl(filename);
  assert(getUrlResult === `/uploads/${filename}`, `getUrl() returns /uploads/${filename}`);

  // Delete operation
  const deleted = await localDriver.delete(filename);
  assert(deleted === true, "delete() removes existing file and returns true");
  assert(!fs.existsSync(path.join(tempDir, filename)), "File no longer exists after delete()");

  // Delete nonexistent file returns false
  const deleteMissing = await localDriver.delete("non-existent-file.png");
  assert(deleteMissing === false, "delete() returns false for missing file");

  // Path traversal prevention in local driver
  let traversalThrew = false;
  try {
    await localDriver.put({
      filename: "../../../evil.png",
      buffer: testBuffer,
      mimeType: "image/png",
    });
  } catch {
    traversalThrew = true;
  }
  // LocalStorageDriver uses path.basename so filename cannot traverse
  assert(!fs.existsSync(path.resolve(tempDir, "..", "evil.png")), "Path traversal cannot write outside upload directory");

  // --------------------------------------------------------------------------
  // 2. S3 Driver Contract Against Mocked HTTP Boundary
  // --------------------------------------------------------------------------
  console.log("\n[2] Testing S3 Storage Driver Against Mocked HTTP Boundary...");
  console.log("  [NOTICE] MOCK BOUNDARY ONLY: Zero real bucket calls or network requests were made.");

  const capturedRequests = [];
  const mockFetch = async (url, init) => {
    capturedRequests.push({ url, init });
    return {
      ok: true,
      status: 200,
      text: async () => "<xml>success</xml>",
    };
  };

  const s3Config = {
    endpoint: "https://mock-account-id.r2.cloudflarestorage.com",
    bucket: "lovewrit-keepsakes-test",
    accessKeyId: "mock_test_access_key_123",
    secretAccessKey: "mock_test_secret_key_4567890abcdef",
    region: "auto",
    publicBaseUrl: "https://cdn.lovewrit.com",
    fetchFn: mockFetch,
  };

  const s3Driver = new S3StorageDriver(s3Config);
  assert(s3Driver.driverName === "s3", "S3 Driver identifies as 's3'");

  // S3 Put
  const s3PutResult = await s3Driver.put({
    filename: "keepsake-photo.jpg",
    buffer: Buffer.from("binary photo content"),
    mimeType: "image/jpeg",
  });

  assert(s3PutResult.key === "keepsake-photo.jpg", "S3 put() returns correct key");
  assert(s3PutResult.url === "https://cdn.lovewrit.com/keepsake-photo.jpg", `S3 put() resolves configured publicBaseUrl: ${s3PutResult.url}`);
  assert(capturedRequests.length === 1, "Mock HTTP boundary intercepted exactly 1 request");

  const putReq = capturedRequests[0];
  assert(putReq.init.method === "PUT", "HTTP method is PUT");
  assert(putReq.url.includes("mock-account-id.r2.cloudflarestorage.com/lovewrit-keepsakes-test/keepsake-photo.jpg"), "Target URL contains bucket and key");
  assert(putReq.init.headers["Authorization"].startsWith("AWS4-HMAC-SHA256"), "Authorization header uses AWS4-HMAC-SHA256 signature");
  assert(Boolean(putReq.init.headers["x-amz-date"]), "x-amz-date header present");
  assert(Boolean(putReq.init.headers["x-amz-content-sha256"]), "x-amz-content-sha256 header present");

  // S3 getUrl without publicBaseUrl falls back to endpoint/bucket
  const s3FallbackDriver = new S3StorageDriver({
    ...s3Config,
    publicBaseUrl: undefined,
  });
  const fallbackUrl = s3FallbackDriver.getUrl("test.jpg");
  assert(fallbackUrl === "https://mock-account-id.r2.cloudflarestorage.com/lovewrit-keepsakes-test/test.jpg", "Fallback URL resolves to endpoint/bucket/key");

  // S3 Delete
  const s3Deleted = await s3Driver.delete("keepsake-photo.jpg");
  assert(s3Deleted === true, "S3 delete() completes successfully against mock boundary");
  assert(capturedRequests.length === 2, "Mock HTTP boundary intercepted 2nd request");
  const deleteReq = capturedRequests[1];
  assert(deleteReq.init.method === "DELETE", "HTTP method is DELETE");

  // --------------------------------------------------------------------------
  // 3. Factory Function & Environment Configuration
  // --------------------------------------------------------------------------
  console.log("\n[3] Testing Storage Adapter Factory Function...");
  const defaultAdapter = getStorageAdapter({});
  assert(defaultAdapter.driverName === "local", "Default adapter is LocalStorageDriver");

  const s3Adapter = getStorageAdapter({
    STORAGE_DRIVER: "s3",
    STORAGE_ENDPOINT: "https://r2.example.com",
    STORAGE_BUCKET: "my-bucket",
    STORAGE_ACCESS_KEY_ID: "key_id",
    STORAGE_SECRET_ACCESS_KEY: "secret_key",
  });
  assert(s3Adapter.driverName === "s3", "Factory instantiates S3StorageDriver when STORAGE_DRIVER=s3");

  let missingConfigThrew = false;
  try {
    getStorageAdapter({ STORAGE_DRIVER: "s3" });
  } catch {
    missingConfigThrew = true;
  }
  assert(missingConfigThrew, "Factory throws descriptive error when STORAGE_DRIVER=s3 but credentials missing");

  // --------------------------------------------------------------------------
  // 4. SafeMediaUrlSchema Extension Check
  // --------------------------------------------------------------------------
  console.log("\n[4] Testing SafeMediaUrlSchema URL Acceptance...");
  assert(SafeMediaUrlSchema.safeParse("/uploads/photo-123.jpg").success, "Accepts relative /uploads/... URL");
  assert(SafeMediaUrlSchema.safeParse("https://cdn.lovewrit.com/photo-123.jpg").success, "Accepts public CDN URL");
  assert(SafeMediaUrlSchema.safeParse("https://pub-r2.cloudflarestorage.com/photo.jpg").success, "Accepts R2 storage URL");
  assert(!SafeMediaUrlSchema.safeParse("javascript:alert(1)").success, "Rejects javascript: pseudo-protocol");
  assert(!SafeMediaUrlSchema.safeParse("vbscript:test").success, "Rejects vbscript: pseudo-protocol");

  // --------------------------------------------------------------------------
  // 5. Upload Route Rejects Hostile Files as Before
  // --------------------------------------------------------------------------
  console.log("\n[5] Testing Upload Route Hostile File Rejection...");

  // Hostile SVG upload
  const svgFormData = new FormData();
  const svgBlob = new Blob(['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'], { type: "image/svg+xml" });
  svgFormData.append("file", svgBlob, "evil.svg");
  svgFormData.append("kind", "image");

  const svgReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    body: svgFormData,
  });
  const svgRes = await uploadPOST(svgReq);
  assert(svgRes.status === 400, "Upload route rejects SVG file with HTTP 400");
  const svgData = await svgRes.json();
  assert(svgData.error.includes("strictly prohibited"), "Rejection message explains SVG is prohibited");

  // Hostile disguised executable
  const exeFormData = new FormData();
  const exeBlob = new Blob(["MZ\x90\x00\x03\x00\x00\x00"], { type: "image/jpeg" });
  exeFormData.append("file", exeBlob, "malware.jpg");
  exeFormData.append("kind", "image");

  const exeReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    body: exeFormData,
  });
  const exeRes = await uploadPOST(exeReq);
  assert(exeRes.status === 400, "Upload route rejects binary disguised as JPEG with HTTP 400");

  // --------------------------------------------------------------------------
  // 6. Old /uploads/ URL Still Renders
  // --------------------------------------------------------------------------
  console.log("\n[6] Testing Existing /uploads/ Static Route Compatibility...");
  const publicUploadsDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }

  const legacyFilename = "legacy-regression-test-sample.jpg";
  const legacyFilePath = path.join(publicUploadsDir, legacyFilename);
  // Valid JPEG header bytes: FF D8 FF E0
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]);
  fs.writeFileSync(legacyFilePath, validJpeg);

  const staticReq = new NextRequest(`http://localhost:3000/uploads/${legacyFilename}`);
  const staticRes = await uploadsStaticGET(staticReq, {
    params: Promise.resolve({ filename: legacyFilename }),
  });

  assert(staticRes.status === 200, "Existing /uploads/[filename] URL returns HTTP 200");
  assert(staticRes.headers.get("content-type") === "image/jpeg", "Content-Type is image/jpeg");
  assert(staticRes.headers.get("x-content-type-options") === "nosniff", "Includes nosniff header");

  // Cleanup sample file
  try {
    fs.unlinkSync(legacyFilePath);
  } catch {}

  console.log(`\n=== STORAGE ADAPTER TESTS COMPLETE: ${passedAssertions} / ${totalAssertions} assertions green ===\n`);
}

runStorageTests().catch((err) => {
  console.error("Storage adapter tests failed:", err);
  process.exit(1);
});

