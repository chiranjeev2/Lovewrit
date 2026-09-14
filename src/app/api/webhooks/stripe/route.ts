import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ message: "Stripe not configured" }, { status: 200 });
  }

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } else {
      event = JSON.parse(payload);
    }
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const slug = session.metadata?.slug;

    if (orderId) {
      await db.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
    } else if (slug) {
      await db.order.update({
        where: { slug },
        data: { status: "PAID" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
