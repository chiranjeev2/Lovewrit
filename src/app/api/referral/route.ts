import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, getDeviceFingerprintLite } from "@/lib/security";

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
        return NextResponse.json(
          { valid: false, message: "Invalid referral code" },
          { status: 404 }
        );
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

    return NextResponse.json({ error: "Missing code or email parameter" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Referral query error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Referral query failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const preferredCode = body.preferredCode || body.code;
    const { name, email } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Valid email address required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

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
    if (preferredCode && typeof preferredCode === "string" && preferredCode.trim().length >= 3) {
      const candidate = preferredCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
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
            ownerEmail: cleanEmail,
            creatorIp,
            creatorFingerprint,
            updatedAt: new Date().toISOString(),
          }),
        },
        create: {
          key: `referral_owner:${finalCode}`,
          value: JSON.stringify({
            ownerEmail: cleanEmail,
            creatorIp,
            creatorFingerprint,
            createdAt: new Date().toISOString(),
          }),
        },
      });
    } catch (err) {
      console.warn("Could not save referral owner audit metadata:", err);
    }

    return NextResponse.json({
      success: true,
      record: newRecord,
      message: `Your referral code ${newRecord.code} has been created!`,
    });
  } catch (err: unknown) {
    console.error("Referral creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create referral code" },
      { status: 500 }
    );
  }
}

