import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, getDeviceFingerprintLite } from "@/lib/security";
import {
  checkPayloadSize,
  enforceRateLimit,
  validateReferralCreateInput,
  safeErrorResponse,
  safeServerErrorResponse,
} from "@/lib/api-safety";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (code) {
      const record = await db.referralRecord.findUnique({
        where: { code },
        select: {
          id: true,
          code: true,
          ownerName: true,
          timesUsed: true,
          creditBalance: true,
        },
      });

      if (!record) {
        return safeErrorResponse("Invalid referral code", 404);
      }

      return NextResponse.json({
        valid: true,
        code: record.code,
        ownerName: record.ownerName,
        timesUsed: record.timesUsed,
        creditBalance: record.creditBalance,
        message: `Valid code from ${record.ownerName}! Discount applied.`,
      });
    }

    if (email) {
      const records = await db.referralRecord.findMany({
        where: { ownerEmail: email },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ records });
    }

    return safeErrorResponse("Missing code or email parameter", 400);
  } catch (err: unknown) {
    console.error("Referral query note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const sizeErr = checkPayloadSize(req, 50 * 1024);
    if (sizeErr) return sizeErr;

    const rateLimit = await enforceRateLimit(req, "REFERRAL_CREATE", 10, 60);
    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response;
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return safeErrorResponse("Malformed JSON in request body", 400);
    }

    const validation = validateReferralCreateInput(rawBody);
    if (!validation.success || !validation.data) {
      return safeErrorResponse(validation.error || "Invalid referral data", 400);
    }

    const { name: cleanName, email: cleanEmail, preferredCode } = validation.data;

    // Abuse Protection: Max 3 active codes created per email
    const existingCount = await db.referralRecord.count({
      where: { ownerEmail: cleanEmail },
    });
    if (existingCount >= 3) {
      return NextResponse.json(
        { error: "Maximum referral codes limit (3) reached for this email." },
        { status: 429 }
      );
    }

    // Generate or clean preferred code
    let finalCode = "";
    if (preferredCode && preferredCode.length >= 3) {
      const candidate = preferredCode.slice(0, 12);
      const existing = await db.referralRecord.findUnique({ where: { code: candidate } });
      if (!existing && candidate.length >= 3) {
        finalCode = candidate;
      }
    }

    if (!finalCode) {
      const prefix = cleanName.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5) || "GIFT";
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      finalCode = `${prefix}${randomSuffix}`;
    }

    // Ensure code uniqueness
    let attempt = 0;
    while (attempt < 5) {
      const exists = await db.referralRecord.findUnique({ where: { code: finalCode } });
      if (!exists) break;
      finalCode = `${finalCode.slice(0, 5)}${Math.floor(1000 + Math.random() * 9000)}`;
      attempt++;
    }

    const newRecord = await db.referralRecord.create({
      data: {
        code: finalCode,
        ownerName: cleanName,
        ownerEmail: cleanEmail,
        creditBalance: 0,
        timesUsed: 0,
      },
    });

    // Record creator IP and fingerprint-lite for abuse detection
    const creatorIp = getClientIp(req);
    const creatorFingerprint = getDeviceFingerprintLite(req);
    try {
      await db.platformSetting.upsert({
        where: { key: `referral_owner:${finalCode}` },
        update: {
          value: JSON.stringify({
            ip: creatorIp,
            fingerprint: creatorFingerprint,
            email: cleanEmail,
            createdAt: new Date().toISOString(),
          }),
        },
        create: {
          key: `referral_owner:${finalCode}`,
          value: JSON.stringify({
            ip: creatorIp,
            fingerprint: creatorFingerprint,
            email: cleanEmail,
            createdAt: new Date().toISOString(),
          }),
        },
      });
    } catch {
      // Non-blocking setting write
    }

    return NextResponse.json({
      success: true,
      code: newRecord.code,
      ownerName: newRecord.ownerName,
      message: `Your share code is ${newRecord.code}! Give friends ₹49 off, earn ₹49 credits.`,
    });
  } catch (err: unknown) {
    console.error("Referral creation note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}
