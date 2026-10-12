import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".webm": "audio/webm",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
};

interface RouteContext {
  params: Promise<{ filename: string }>;
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { filename } = await context.params;

    if (!filename || typeof filename !== "string") {
      return new NextResponse("Filename required", { status: 400 });
    }

    // Security guard: strictly disallow directory traversal
    const safeBaseName = path.basename(filename);
    if (safeBaseName !== filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(uploadDir, safeBaseName);

    // Assert resolved path is strictly within the public/uploads directory
    if (!filePath.startsWith(uploadDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check file stats and existence
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        return new NextResponse("Not Found", { status: 404 });
      }
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }

    const ext = path.extname(safeBaseName).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const getRes = await GET(_req, context);
  return new NextResponse(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
