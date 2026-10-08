import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  checkPayloadSize,
  enforceRateLimit,
  validateReactionInput,
  safeErrorResponse,
  safeServerErrorResponse,
} from "@/lib/api-safety";

export async function POST(req: NextRequest) {
  try {
    const sizeErr = checkPayloadSize(req, 100 * 1024);
    if (sizeErr) return sizeErr;

    const rateLimit = await enforceRateLimit(req, "REACTION", 20, 60);
    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response;
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return safeErrorResponse("Malformed JSON in request body", 400);
    }

    const validation = validateReactionInput(rawBody);
    if (!validation.success || !validation.data) {
      return safeErrorResponse(validation.error || "Invalid reaction data", 400);
    }

    const { slug, pageDataId, senderName, reactionType, message, voiceUrl } = validation.data;

    let targetPageDataId = pageDataId;

    if (!targetPageDataId && slug) {
      const order = await db.order.findUnique({
        where: { slug },
        include: { pageData: true },
      });
      targetPageDataId = order?.pageData?.id;
    }

    if (!targetPageDataId) {
      return safeErrorResponse("Target page not found for reaction", 404);
    }

    const reaction = await db.recipientReaction.create({
      data: {
        pageDataId: targetPageDataId,
        senderName,
        reactionType,
        message: message || null,
        voiceUrl: voiceUrl || null,
      },
    });

    return NextResponse.json({ success: true, reaction });
  } catch (err: unknown) {
    console.error("Reaction submission note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();
    const pageDataId = searchParams.get("pageDataId")?.trim();

    let targetPageDataId: string | null | undefined = pageDataId;
    if (!targetPageDataId && slug) {
      const order = await db.order.findUnique({
        where: { slug },
        include: { pageData: true },
      });
      targetPageDataId = order?.pageData?.id;
    }

    if (!targetPageDataId) {
      return NextResponse.json({ reactions: [] });
    }

    const reactions = await db.recipientReaction.findMany({
      where: { pageDataId: targetPageDataId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ reactions });
  } catch (err: unknown) {
    console.error("Reaction fetch note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}
