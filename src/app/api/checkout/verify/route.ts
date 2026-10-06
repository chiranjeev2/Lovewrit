import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  razorpay,
  isRazorpayConfigured,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { getClientIp, getDeviceFingerprintLite } from "@/lib/security";

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

    // Helper to credit referrer if a referral code was used
    const creditReferrerIfNeeded = async (currentOrder: {
      id: string;
      referralCodeUsed?: string | null;
      customerEmail?: string;
      ipAddress?: string | null;
      currency?: string;
      amountTotal: number;
      tier?: string;
      isAdSupported?: boolean;
    }) => {
      const code = currentOrder.referralCodeUsed;
      if (!code) return;

      // 1. Strict Gating: Credit applies ONLY to paid orders (never free/ad-supported)
      if (currentOrder.amountTotal <= 0 || currentOrder.isAdSupported || currentOrder.tier === "FREE") {
        console.log(`[Referral Ignored] Order ${currentOrder.id} is free / zero-amount. Referral credit not granted.`);
        return;
      }

      // 2. Strict Gating: One credit per paid order (prevent double-crediting)
      const existingCreditLog = await db.rateLimitEvent.findFirst({
        where: { action: `REFERRAL_CREDITED:${currentOrder.id}` },
      });
      if (existingCreditLog) {
        console.log(`[Referral Ignored] Order ${currentOrder.id} already received referral credit.`);
        return;
      }

      try {
        const refRecord = await db.referralRecord.findUnique({
          where: { code: code.toUpperCase() },
        });
        if (!refRecord) return;

        const buyerIp = getClientIp(req);
        const buyerFingerprint = getDeviceFingerprintLite(req);

        // 3. Abuse Protection: Self-referral by Email
        if (
          currentOrder.customerEmail &&
          refRecord.ownerEmail.toLowerCase() === currentOrder.customerEmail.toLowerCase().trim()
        ) {
          console.warn(`[Referral Abuse] Self-referral attempt blocked for code ${code} by email: ${currentOrder.customerEmail}`);
          await db.rateLimitEvent.create({
            data: {
              ipAddress: buyerIp,
              email: currentOrder.customerEmail,
              action: "REFERRAL_ABUSE_BLOCKED",
              allowed: false,
              reason: "SELF_REFERRAL_EMAIL_MATCH",
            },
          });
          return;
        }

        // 4. Abuse Protection: IP / Device Fingerprint-lite Match
        const ownerSetting = await db.platformSetting.findUnique({
          where: { key: `referral_owner:${code.toUpperCase()}` },
        });
        if (ownerSetting?.value) {
          try {
            const ownerMeta = JSON.parse(ownerSetting.value);
            if (ownerMeta.creatorIp && ownerMeta.creatorIp === buyerIp && buyerIp !== "127.0.0.1") {
              console.warn(`[Referral Abuse] Self-referral blocked: IP ${buyerIp} matches code owner.`);
              await db.rateLimitEvent.create({
                data: {
                  ipAddress: buyerIp,
                  email: currentOrder.customerEmail,
                  action: "REFERRAL_ABUSE_BLOCKED",
                  allowed: false,
                  reason: "SELF_REFERRAL_IP_MATCH",
                },
              });
              return;
            }
            if (ownerMeta.creatorFingerprint && ownerMeta.creatorFingerprint === buyerFingerprint) {
              console.warn(`[Referral Abuse] Self-referral blocked: Device fingerprint matches code owner.`);
              await db.rateLimitEvent.create({
                data: {
                  ipAddress: buyerIp,
                  email: currentOrder.customerEmail,
                  action: "REFERRAL_ABUSE_BLOCKED",
                  allowed: false,
                  reason: "SELF_REFERRAL_FINGERPRINT_MATCH",
                },
              });
              return;
            }
          } catch (e) {
            console.warn("Could not parse owner metadata for referral check:", e);
          }
        }

        // 5. Abuse Protection: Rate-limit credit grants per IP per 24 hours (max 3/day)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyCreditsCount = await db.rateLimitEvent.count({
          where: {
            action: "REFERRAL_CREDIT_GRANTED",
            ipAddress: buyerIp,
            createdAt: { gte: oneDayAgo },
          },
        });
        if (dailyCreditsCount >= 3) {
          console.warn(`[Referral Abuse] Daily IP referral limit (3) exceeded for ${buyerIp}`);
          await db.rateLimitEvent.create({
            data: {
              ipAddress: buyerIp,
              email: currentOrder.customerEmail,
              action: "REFERRAL_ABUSE_BLOCKED",
              allowed: false,
              reason: "DAILY_IP_LIMIT_EXCEEDED",
            },
          });
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

        // Atomically update balance and log audit events
        await db.referralRecord.update({
          where: { code: refRecord.code },
          data: {
            timesUsed: { increment: 1 },
            creditBalance: { increment: reward },
          },
        });

        await db.rateLimitEvent.create({
          data: {
            ipAddress: buyerIp,
            email: currentOrder.customerEmail,
            action: "REFERRAL_CREDIT_GRANTED",
            allowed: true,
            reason: `ORDER_${currentOrder.id}_REWARD_${reward}`,
          },
        });

        await db.rateLimitEvent.create({
          data: {
            ipAddress: buyerIp,
            email: currentOrder.customerEmail,
            action: `REFERRAL_CREDITED:${currentOrder.id}`,
            allowed: true,
            reason: `CODE_${code}`,
          },
        });

        console.log(`[Referral Credited] Added ${reward} credit to code ${code} for completed paid order`);
      } catch (err) {
        console.error("Failed to credit referrer:", err);
      }
    };

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
      await creditReferrerIfNeeded(order);
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
      await creditReferrerIfNeeded(order);
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
          await creditReferrerIfNeeded(order);
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

