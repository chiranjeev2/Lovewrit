import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, pageDataId, senderName, reactionType = "text", message, voiceUrl } = body;

    let targetPageDataId = pageDataId;

    if (!targetPageDataId && slug) {
      const order = await db.order.findUnique({
        where: { slug },
        include: { pageData: true },
      });
      targetPageDataId = order?.pageData?.id;
    }

    if (!targetPageDataId) {
      return NextResponse.json(
        { error: "Target page not found for reaction" },
        { status: 404 }
      );
    }

    const reaction = await db.recipientReaction.create({
      data: {
        pageDataId: targetPageDataId,
        senderName: senderName?.trim() || "Recipient",
        reactionType: reactionType || "text",
        message: message?.trim() || null,
        voiceUrl: voiceUrl || null,
      },
    });

    return NextResponse.json({ success: true, reaction });
  } catch (err: unknown) {
    console.error("Reaction submission error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record reaction" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const pageDataId = searchParams.get("pageDataId");

    let targetPageDataId: string | null | undefined = pageDataId;
    if (!targetPageDataId && slug) {
      const order = await db.order.findUnique({
        where: { slug },
        include: { pageData: true },
      });
      targetPageDataId = order?.pageData?.id;
    }

    if (!targetPageDataId) {
      return NextResponse.json(
        { error: "Target page not found" },
        { status: 404 }
      );
    }

    const resolvedPageDataId: string = targetPageDataId;
    const reactions = await db.recipientReaction.findMany({
      where: { pageDataId: resolvedPageDataId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reactions });
  } catch (err: unknown) {
    console.error("Fetch reactions error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}
