import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();

    if (!slug) {
      return NextResponse.json(
        { valid: false, error: "Missing gift slug" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { slug },
      include: {
        cardData: true,
        pageData: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { valid: false, error: "Original gift order not found" },
        { status: 404 }
      );
    }

    // Only allow regift discount for verified paid/delivered orders
    const isConfirmedPaid =
      order.status === "PAID" ||
      order.status === "DELIVERED" ||
      order.founderStatus === "COMPLETED";

    if (!isConfirmedPaid) {
      return NextResponse.json(
        {
          valid: false,
          error: "Original gift order has not been completed or paid.",
        },
        { status: 400 }
      );
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
      slug: order.slug,
    });
  } catch (error: unknown) {
    console.error("Error verifying reply regift:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

