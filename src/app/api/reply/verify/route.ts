import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  enforceRateLimit,
  safeErrorResponse,
  safeServerErrorResponse,
} from "@/lib/api-safety";

export async function GET(req: NextRequest) {
  try {
    const rateLimit = await enforceRateLimit(req, "REPLY_VERIFY", 30, 60);
    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response;
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();

    if (!slug || slug.length < 2 || slug.length > 120 || !/^[a-zA-Z0-9_\-]+$/.test(slug)) {
      return safeErrorResponse("Missing or invalid gift slug", 400);
    }

    const order = await db.order.findUnique({
      where: { slug },
      include: {
        cardData: true,
        pageData: true,
      },
    });

    if (!order) {
      return safeErrorResponse("Original gift order not found", 404);
    }

    // Only allow regift discount for verified paid/delivered orders
    const isConfirmedPaid =
      order.status === "PAID" ||
      order.status === "DELIVERED" ||
      order.founderStatus === "COMPLETED";

    if (!isConfirmedPaid) {
      return safeErrorResponse("Original gift order has not been completed or paid.", 400);
    }

    const senderName =
      order.cardData?.senderName ||
      order.pageData?.senderName ||
      order.customerName;

    const occasion =
      order.cardData?.occasion ||
      order.pageData?.occasion ||
      "moment";

    return NextResponse.json({
      valid: true,
      senderName,
      occasion,
      discount: 0.5,
      message: `Verified! You receive 50% off to reply to ${senderName}.`,
    });
  } catch (err: unknown) {
    console.error("Reply verify note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}
