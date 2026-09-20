import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const slug = searchParams.get("slug");

    if (!sessionId && !slug) {
      return NextResponse.json({ error: "Missing session or slug" }, { status: 400 });
    }

    let order = await db.order.findFirst({
      where: slug ? { slug } : { stripeSessionId: sessionId! },
      include: {
        cardData: true,
        pageData: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order already marked PAID, return directly
    if (order.status === "PAID") {
      return NextResponse.json({ success: true, order });
    }

    // Helper to credit referrer if a referral code was used
    const creditReferrerIfNeeded = async (usedCode?: string | null) => {
      if (!usedCode) return;
      try {
        await db.referralRecord.update({
          where: { code: usedCode },
          data: {
            timesUsed: { increment: 1 },
            creditBalance: { increment: 49 }, // Fixed cash reward ₹49 / $2 / €2 / £2
          },
        });
      } catch (err) {
        console.error("Failed to credit referrer:", err);
      }
    };

    // Dev simulation or Free/Founder bypass verification
    if (sessionId?.startsWith("sim_") || sessionId?.startsWith("free_") || sessionId?.startsWith("founder_")) {
      order = await db.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
        include: {
          cardData: true,
          pageData: true,
        },
      });
      await creditReferrerIfNeeded(order.referralCodeUsed);
      return NextResponse.json({ success: true, order });
    }

    // Stripe verification
    if (isStripeConfigured() && stripe && sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        order = await db.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
          include: {
            cardData: true,
            pageData: true,
          },
        });
        await creditReferrerIfNeeded(order.referralCodeUsed);
        return NextResponse.json({ success: true, order });
      }
    }

    return NextResponse.json({
      success: false,
      status: order.status,
      order,
    });
  } catch (err: unknown) {
    console.error("Order verification error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification error" },
      { status: 500 }
    );
  }
}

