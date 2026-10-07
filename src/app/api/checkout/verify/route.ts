import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  razorpay,
  isRazorpayConfigured,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { creditReferrerForOrder } from "@/lib/referral-reward";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id") || searchParams.get("order_id");
    const slug = searchParams.get("slug");

    if (!sessionId && !slug) {
      return NextResponse.json({ error: "Missing session or slug" }, { status: 400 });
    }

    // Dev simulation (Strictly forbidden in production)
    if (sessionId?.startsWith("sim_") && process.env.NODE_ENV === "production") {
      console.error(`[CRITICAL] Blocked simulated session verification attempt in production: ${sessionId}`);
      return NextResponse.json(
        { error: "Simulated sessions are strictly forbidden in production." },
        { status: 403 }
      );
    }

    let order = await db.order.findFirst({
      where: slug ? { slug } : { razorpayOrderId: sessionId! },
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

    // Dev simulation (Strictly forbidden in production)
    if (sessionId?.startsWith("sim_")) {
      if (process.env.NODE_ENV === "production") {
        console.error(`[CRITICAL] Blocked simulated session verification attempt in production: ${sessionId}`);
        return NextResponse.json(
          { error: "Simulated sessions are strictly forbidden in production." },
          { status: 403 }
        );
      }
      order = await db.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
        include: {
          cardData: true,
          pageData: true,
        },
      });
      await creditReferrerForOrder(order, req);
      return NextResponse.json({ success: true, order });
    }

    // Free/Founder bypass verification
    if (sessionId?.startsWith("free_") || sessionId?.startsWith("founder_")) {
      order = await db.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
        include: {
          cardData: true,
          pageData: true,
        },
      });
      await creditReferrerForOrder(order, req);
      return NextResponse.json({ success: true, order });
    }

    // Razorpay order status verification
    if (isRazorpayConfigured() && razorpay && sessionId) {
      try {
        const rzpOrder = await razorpay.orders.fetch(sessionId);
        if (rzpOrder.status === "paid") {
          order = await db.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
            include: {
              cardData: true,
              pageData: true,
            },
          });
          await creditReferrerForOrder(order, req);
          return NextResponse.json({ success: true, order });
        }
      } catch (e) {
        console.warn("Razorpay order status fetch note:", e);
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      slug,
      amount,
      currency,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay payment verification fields" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpayPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    let order = await db.order.findFirst({
      where: slug
        ? { slug }
        : orderId
        ? { id: orderId }
        : { razorpayOrderId: razorpay_order_id },
      include: {
        cardData: true,
        pageData: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check razorpayOrderId mismatch: order in db must match client-sent razorpay_order_id
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Order ID mismatch" },
        { status: 400 }
      );
    }

    // Check amount mismatch if provided
    if (amount !== undefined && Number(amount) !== order.amountTotal) {
      return NextResponse.json(
        { error: "Order amount mismatch" },
        { status: 400 }
      );
    }

    // Check currency mismatch if provided
    if (currency !== undefined && String(currency).toUpperCase() !== order.currency?.toUpperCase()) {
      return NextResponse.json(
        { error: "Order currency mismatch" },
        { status: 400 }
      );
    }

    // Idempotency: only transition to PAID and credit referrer once
    if (order.status !== "PAID") {
      order = await db.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
        },
        include: {
          cardData: true,
          pageData: true,
        },
      });

      await creditReferrerForOrder(order, req);
    }

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification error" },
      { status: 500 }
    );
  }
}
