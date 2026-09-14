import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import {
  validateImageFile,
  validateAudioFile,
  validateVoiceMemoFile,
} from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string) || "image"; // "image" | "audio" | "voice"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validation checks per requirement
    if (kind === "voice") {
      const validation = validateVoiceMemoFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    } else if (kind === "audio") {
      const validation = validateAudioFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    } else {
      const validation = validateImageFile({
        size: file.size,
        type: file.type,
        name: file.name,
      });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize extension
    const ext =
      path.extname(file.name) ||
      (kind === "image" ? ".jpg" : kind === "voice" ? ".webm" : ".mp3");
    const sanitizedExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
    const filename = `${Date.now()}-${kind}-${nanoid(8)}${sanitizedExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
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
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process upload" },
      { status: 500 }
    );
  }
}
