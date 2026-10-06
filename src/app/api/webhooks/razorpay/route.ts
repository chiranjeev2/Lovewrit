import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await db.order.findUnique({
          where: { razorpayOrderId },
        });

        if (order && order.status !== "PAID") {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: "PAID",
              razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
            },
          });
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        const order = await db.order.findUnique({
          where: { razorpayOrderId },
        });

        if (order && order.status === "PENDING") {
          await db.order.update({
            where: { id: order.id },
            data: {
              status: "FAILED",
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("Razorpay webhook processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error" },
      { status: 500 }
    );
  }
}
