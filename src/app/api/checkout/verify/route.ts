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
    const creditReferrerIfNeeded = async (currentOrder: {
      referralCodeUsed?: string | null;
      customerEmail?: string;
      ipAddress?: string | null;
      currency?: string;
    }) => {
      const code = currentOrder.referralCodeUsed;
      if (!code) return;
      try {
        const refRecord = await db.referralRecord.findUnique({
          where: { code: code.toUpperCase() },
        });
        if (!refRecord) return;

        // Abuse Protection: Disallow self-referral
        if (
          currentOrder.customerEmail &&
          refRecord.ownerEmail.toLowerCase() === currentOrder.customerEmail.toLowerCase().trim()
        ) {
          console.warn(`[Referral Abuse] Self-referral attempt blocked for code ${code} by ${currentOrder.customerEmail}`);
          return;
        }

        // Fixed currency reward: ₹49 / $2 / €2 / £2
        const creditAmounts: Record<string, number> = {
          INR: 49,
          USD: 2,
          EUR: 2,
          GBP: 2,
        };
        const reward = creditAmounts[currentOrder.currency || "INR"] || 49;

        await db.referralRecord.update({
          where: { code: refRecord.code },
          data: {
            timesUsed: { increment: 1 },
            creditBalance: { increment: reward },
          },
        });
        console.log(`[Referral Credited] Added ${reward} credit to code ${code} for completed order`);
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
      await creditReferrerIfNeeded(order);
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
        await creditReferrerIfNeeded(order);
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

