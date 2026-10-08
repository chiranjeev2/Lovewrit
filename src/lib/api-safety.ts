import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/security";

/**
 * Standard generic error responses that never leak stack traces, SQL errors,
 * file system paths, or environment variable names to the client.
 */
export function safeErrorResponse(
  message: string = "Invalid request",
  status: number = 400
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function safeServerErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: "An unexpected error occurred. Please try again later." },
    { status: 500 }
  );
}

/**
 * Payload size guard: Rejects requests exceeding maxBytes with HTTP 413.
 */
export function checkPayloadSize(req: NextRequest, maxBytes: number = 2 * 1024 * 1024): NextResponse | null {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return NextResponse.json(
      { error: "Payload too large. Please reduce upload size." },
      { status: 413 }
    );
  }
  return null;
}

/**
 * Persistent anti-abuse rate limiter with standard HTTP 429 and Retry-After header.
 */
export async function enforceRateLimit(
  req: NextRequest,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    const clientIp = getClientIp(req);
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    const count = await db.rateLimitEvent.count({
      where: {
        action,
        ipAddress: clientIp,
        createdAt: { gte: windowStart },
      },
    });

    if (count >= limit) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "Rate limit exceeded. Please wait before trying again." },
          {
            status: 429,
            headers: {
              "Retry-After": String(windowSeconds),
            },
          }
        ),
      };
    }

    // Record allowed event asynchronously
    await db.rateLimitEvent.create({
      data: {
        ipAddress: clientIp,
        action,
        allowed: true,
      },
    });

    return { allowed: true };
  } catch (err) {
    // Fail-open on database logging error to prevent service outage, while logging safely
    console.error("Rate limiter check note:", err instanceof Error ? err.name : "DB error");
    return { allowed: true };
  }
}

/**
 * Pure type & schema validators for public endpoints.
 */
export interface SafeValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_SLUG_REGEX = /^[a-zA-Z0-9_\-]{2,120}$/;

export function validateGuestbookInput(body: unknown): SafeValidationResult<{
  slug: string;
  authorName: string;
  message: string;
  attendance: "ATTENDING" | "REGRETS" | "MESSAGE_ONLY";
  headcount: number;
}> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, error: "Invalid request payload format" };
  }
  const b = body as Record<string, unknown>;

  // Reject unknown fields strictly
  const allowedKeys = new Set(["slug", "authorName", "message", "attendance", "headcount"]);
  for (const key of Object.keys(b)) {
    if (!allowedKeys.has(key)) {
      return { success: false, error: `Unrecognized field: ${key}` };
    }
  }

  if (typeof b.slug !== "string" || !SAFE_SLUG_REGEX.test(b.slug.trim())) {
    return { success: false, error: "Invalid or missing page slug" };
  }

  if (typeof b.authorName !== "string") {
    return { success: false, error: "Author name must be a string" };
  }
  const cleanAuthor = b.authorName.replace(/[\x00-\x1F\x7F]/g, "").trim();
  if (cleanAuthor.length === 0 || cleanAuthor.length > 60) {
    return { success: false, error: "Author name must be between 1 and 60 characters" };
  }

  if (typeof b.message !== "string") {
    return { success: false, error: "Message must be a string" };
  }
  const cleanMessage = b.message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
  if (cleanMessage.length === 0 || cleanMessage.length > 1500) {
    return { success: false, error: "Message must be between 1 and 1500 characters" };
  }

  const attendance =
    typeof b.attendance === "string" && ["ATTENDING", "REGRETS", "MESSAGE_ONLY"].includes(b.attendance)
      ? (b.attendance as "ATTENDING" | "REGRETS" | "MESSAGE_ONLY")
      : "ATTENDING";

  let headcount = 1;
  if (b.headcount !== undefined) {
    const parsed = parseInt(String(b.headcount), 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 50) {
      return { success: false, error: "Headcount must be an integer between 1 and 50" };
    }
    headcount = parsed;
  }

  return {
    success: true,
    data: {
      slug: b.slug.trim(),
      authorName: cleanAuthor,
      message: cleanMessage,
      attendance,
      headcount,
    },
  };
}

export function validateReactionInput(body: unknown): SafeValidationResult<{
  slug?: string;
  pageDataId?: string;
  senderName: string;
  reactionType: string;
  message?: string;
  voiceUrl?: string;
}> {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid reaction request format" };
  }
  const b = body as Record<string, unknown>;

  const slug = typeof b.slug === "string" && SAFE_SLUG_REGEX.test(b.slug.trim()) ? b.slug.trim() : undefined;
  const pageDataId = typeof b.pageDataId === "string" && b.pageDataId.trim().length <= 64 ? b.pageDataId.trim() : undefined;

  if (!slug && !pageDataId) {
    return { success: false, error: "Either slug or pageDataId must be provided" };
  }

  const senderName = typeof b.senderName === "string" ? b.senderName.trim().slice(0, 60) : "Recipient";
  const reactionType = typeof b.reactionType === "string" && ["text", "voice", "preset", "emoji"].includes(b.reactionType)
    ? b.reactionType
    : "text";

  const message = typeof b.message === "string" ? b.message.trim().slice(0, 1000) : undefined;
  const voiceUrl = typeof b.voiceUrl === "string" && b.voiceUrl.startsWith("/uploads/") ? b.voiceUrl.trim().slice(0, 500) : undefined;

  return {
    success: true,
    data: {
      slug,
      pageDataId,
      senderName,
      reactionType,
      message,
      voiceUrl,
    },
  };
}

export function validateReferralCreateInput(body: unknown): SafeValidationResult<{
  name: string;
  email: string;
  preferredCode?: string;
}> {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid referral request format" };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || b.name.trim().length < 2 || b.name.trim().length > 60) {
    return { success: false, error: "Name must be between 2 and 60 characters" };
  }
  if (typeof b.email !== "string" || !EMAIL_REGEX.test(b.email.trim()) || b.email.trim().length > 120) {
    return { success: false, error: "Valid email address required" };
  }

  const preferredCode =
    typeof b.preferredCode === "string" && b.preferredCode.trim().length >= 3
      ? b.preferredCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)
      : undefined;

  return {
    success: true,
    data: {
      name: b.name.trim(),
      email: b.email.trim().toLowerCase(),
      preferredCode,
    },
  };
}

export function validateFunnelStepInput(body: unknown): SafeValidationResult<{ step: "visit" | "customizer" | "checkout" | "paid" }> {
  if (!body || typeof body !== "object") {
    return { success: false, error: "Invalid analytics request format" };
  }
  const b = body as Record<string, unknown>;
  if (typeof b.step !== "string" || !["visit", "customizer", "checkout", "paid"].includes(b.step)) {
    return { success: false, error: "Invalid funnel step" };
  }
  return {
    success: true,
    data: { step: b.step as "visit" | "customizer" | "checkout" | "paid" },
  };
}

/**
 * File magic byte signatures for upload validation.
 */
export function detectMagicBytes(buffer: Buffer): { format: string; isImage: boolean; isAudio: boolean } {
  if (buffer.length < 8) return { format: "unknown", isImage: false, isAudio: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { format: "jpeg", isImage: true, isAudio: false };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { format: "png", isImage: true, isAudio: false };
  }

  // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { format: "webp", isImage: true, isAudio: false };
  }

  // HEIF / HEIC: ....ftypheic or ftypmif1
  if (buffer.length >= 12) {
    const ftyp = buffer.toString("ascii", 4, 12);
    if (ftyp.includes("heic") || ftyp.includes("mif1") || ftyp.includes("msf1") || ftyp.includes("heix")) {
      return { format: "heic", isImage: true, isAudio: false };
    }
  }

  // MP3: ID3 or FF FB/F3/F2
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    return { format: "mp3", isImage: false, isAudio: true };
  }
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return { format: "mp3", isImage: false, isAudio: true };
  }

  // WAV: RIFF....WAVE
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x41 &&
    buffer[10] === 0x56 &&
    buffer[11] === 0x45
  ) {
    return { format: "wav", isImage: false, isAudio: true };
  }

  // OGG: OggS (4F 67 67 53)
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return { format: "ogg", isImage: false, isAudio: true };
  }

  // WEBM / EBML: 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { format: "webm", isImage: false, isAudio: true };
  }

  // SVG / XML / HTML detection (strictly rejected)
  const headerStr = buffer.slice(0, 100).toString("utf-8").toLowerCase();
  if (headerStr.includes("<svg") || headerStr.includes("<?xml") || headerStr.includes("<html") || headerStr.includes("<script")) {
    return { format: "svg_or_html", isImage: false, isAudio: false };
  }

  return { format: "unknown", isImage: false, isAudio: false };
}
