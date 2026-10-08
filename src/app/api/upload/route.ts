import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import {
  checkPayloadSize,
  enforceRateLimit,
  detectMagicBytes,
  safeErrorResponse,
  safeServerErrorResponse,
} from "@/lib/api-safety";
import {
  validateImageFile,
  validateAudioFile,
  validateVoiceMemoFile,
} from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    // 1. Payload size guard (max 15MB total request body)
    const sizeErr = checkPayloadSize(req, 15 * 1024 * 1024);
    if (sizeErr) return sizeErr;

    // 2. Rate limit guard (max 20 uploads per minute per IP)
    const rateLimit = await enforceRateLimit(req, "UPLOAD", 20, 60);
    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response;
    }

    const formData = await req.formData();
    const files = formData.getAll("file");

    // 3. File count limit: exactly 1 file per upload request
    if (files.length === 0 || !files[0] || !(files[0] instanceof File)) {
      return safeErrorResponse("No file uploaded", 400);
    }
    if (files.length > 1) {
      return safeErrorResponse("Only one file may be uploaded per request", 400);
    }

    const file = files[0];
    const kind = ((formData.get("kind") as string) || "image").toLowerCase().trim(); // "image" | "audio" | "voice"

    if (!["image", "audio", "voice"].includes(kind)) {
      return safeErrorResponse("Invalid upload kind", 400);
    }

    // 4. Initial validation checks per declared size and MIME
    if (kind === "voice") {
      const validation = validateVoiceMemoFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });
      if (!validation.valid) {
        return safeErrorResponse(validation.error || "Invalid voice memo file", 400);
      }
    } else if (kind === "audio") {
      const validation = validateAudioFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });
      if (!validation.valid) {
        return safeErrorResponse(validation.error || "Invalid audio file", 400);
      }
    } else {
      const validation = validateImageFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });
      if (!validation.valid) {
        return safeErrorResponse(validation.error || "Invalid image file", 400);
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Deep Magic Bytes inspection (prevents extension spoofing & video disguise)
    const detected = detectMagicBytes(buffer);

    if (detected.format === "svg_or_html") {
      return safeErrorResponse("SVG and script-containing formats are strictly prohibited for security", 400);
    }

    if (kind === "image") {
      if (!detected.isImage) {
        return safeErrorResponse("File content does not match a valid image signature (JPEG, PNG, WEBP, HEIC)", 400);
      }
    } else {
      // Audio or voice
      if (!detected.isAudio) {
        return safeErrorResponse("File content does not match a valid audio signature (MP3, WAV, OGG, WEBM)", 400);
      }
    }

    // 6. Safe generated filename with path traversal protection
    const safeExtMap: Record<string, string> = {
      jpeg: ".jpg",
      png: ".png",
      webp: ".webp",
      heic: ".heic",
      mp3: ".mp3",
      wav: ".wav",
      ogg: ".ogg",
      webm: ".webm",
    };
    const extension = safeExtMap[detected.format] || ".bin";
    const safeIdentifier = nanoid(16);
    const filename = `${Date.now()}-${kind}-${safeIdentifier}${extension}`;

    const uploadDir = path.resolve(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.resolve(uploadDir, filename);

    // Path traversal assertion: target must strictly be inside uploadDir
    if (!filePath.startsWith(uploadDir)) {
      return safeErrorResponse("Illegal file path traversal attempt", 400);
    }

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      kind,
      size: file.size,
      mimeType: file.type,
    });
  } catch (err: unknown) {
    console.error("Upload error note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}
