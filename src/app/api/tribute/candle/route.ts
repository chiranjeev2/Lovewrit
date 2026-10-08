import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/security";
import {
  checkPayloadSize,
  safeErrorResponse,
  safeServerErrorResponse,
} from "@/lib/api-safety";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();

    if (!slug || !/^[a-zA-Z0-9_\-]+$/.test(slug) || slug.length > 120) {
      return safeErrorResponse("Missing or invalid slug parameter", 400);
    }

    // Read stored atomic count or initialize with default 1
    const setting = await db.platformSetting.findUnique({
      where: { key: `candle_count:${slug}` },
    });
    const count = setting?.value ? parseInt(setting.value, 10) || 1 : 1;

    // Check device cookie
    const candleCookie = req.cookies.get(`tribute_candle_${slug}`)?.value;
    const alreadyLit = Boolean(candleCookie);

    return NextResponse.json({
      count,
      alreadyLit,
    });
  } catch (err: unknown) {
    console.error("Candle count query note:", err instanceof Error ? err.name : "Unknown");
    return NextResponse.json({ count: 1, alreadyLit: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sizeErr = checkPayloadSize(req, 50 * 1024);
    if (sizeErr) return sizeErr;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return safeErrorResponse("Malformed JSON in request body", 400);
    }

    const slug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!slug || !/^[a-zA-Z0-9_\-]+$/.test(slug) || slug.length > 120) {
      return safeErrorResponse("Missing or invalid slug parameter", 400);
    }

    const clientIp = getClientIp(req);
    const cookieName = `tribute_candle_${slug}`;
    const hasDeviceCookie = Boolean(req.cookies.get(cookieName)?.value);

    // Read current atomic count
    const setting = await db.platformSetting.findUnique({
      where: { key: `candle_count:${slug}` },
    });
    const currentCount = setting?.value ? parseInt(setting.value, 10) || 1 : 1;

    // 1. Device Check: If this device already lit a candle in the last 24h, return calm state (no error toast)
    if (hasDeviceCookie) {
      return NextResponse.json({
        success: true,
        count: currentCount,
        alreadyLit: true,
        message: "A candle is already glowing in their memory from this device.",
      });
    }

    // 2. Server IP Rate Limit: Max 25 candle lights per IP per tribute per 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ipLightsCount = await db.rateLimitEvent.count({
      where: {
        action: `CANDLE_LIT:${slug}`,
        ipAddress: clientIp,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (ipLightsCount >= 25) {
      return NextResponse.json(
        {
          success: true,
          count: currentCount,
          alreadyLit: true,
          message: "Sacred candles have already been kindled from this network today.",
        },
        {
          status: 429,
          headers: { "Retry-After": "86400" },
        }
      );
    }

    // 3. Atomically increment the counter via transaction
    const newCount = await db.$transaction(async (tx) => {
      const existing = await tx.platformSetting.findUnique({
        where: { key: `candle_count:${slug}` },
      });
      const countNow = existing?.value ? parseInt(existing.value, 10) || 1 : 1;
      const incremented = countNow + 1;
      await tx.platformSetting.upsert({
        where: { key: `candle_count:${slug}` },
        update: { value: incremented.toString() },
        create: { key: `candle_count:${slug}`, value: incremented.toString() },
      });
      return incremented;
    });

    // Record rate limit audit event
    await db.rateLimitEvent.create({
      data: {
        ipAddress: clientIp,
        action: `CANDLE_LIT:${slug}`,
        allowed: true,
        reason: `COUNT_${newCount}`,
      },
    });

    const response = NextResponse.json({
      success: true,
      count: newCount,
      alreadyLit: true,
      message: "Your flame burns in loving remembrance.",
    });

    // Set 24h cookie on client device
    response.cookies.set(cookieName, "true", {
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err: unknown) {
    console.error("Candle kindling note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}
