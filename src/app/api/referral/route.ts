import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

