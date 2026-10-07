import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getClientIp, getDeviceFingerprintLite } from "@/lib/security";

export interface OrderForReferralCredit {
  id: string;
  referralCodeUsed?: string | null;
  customerEmail?: string | null;
  ipAddress?: string | null;
  currency?: string | null;
  amountTotal: number;
  tier?: string | null;
  isAdSupported?: boolean;
}

export async function creditReferrerForOrder(
  currentOrder: OrderForReferralCredit,
  req?: NextRequest | Request
): Promise<boolean> {
  const code = currentOrder.referralCodeUsed;
  if (!code) return false;

  // 1. Strict Gating: Credit applies ONLY to paid orders (never free/ad-supported)
  if (currentOrder.amountTotal <= 0 || currentOrder.isAdSupported || currentOrder.tier === "FREE") {
    console.log(`[Referral Ignored] Order ${currentOrder.id} is free / zero-amount. Referral credit not granted.`);
    return false;
  }

  // 2. Strict Gating: One credit per paid order (prevent double-crediting)
  const existingCreditLog = await db.rateLimitEvent.findFirst({
    where: { action: `REFERRAL_CREDITED:${currentOrder.id}` },
  });
  if (existingCreditLog) {
    console.log(`[Referral Ignored] Order ${currentOrder.id} already received referral credit.`);
    return false;
  }

  try {
    const refRecord = await db.referralRecord.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!refRecord) return false;

    let buyerIp = currentOrder.ipAddress || "127.0.0.1";
    let buyerFingerprint = "";

    if (req && "headers" in req) {
      try {
        buyerIp = getClientIp(req as NextRequest);
        buyerFingerprint = getDeviceFingerprintLite(req as NextRequest);
      } catch {
        // Fallback to order IP if NextRequest context unavailable
      }
    }

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
      return false;
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
              email: currentOrder.customerEmail || "",
              action: "REFERRAL_ABUSE_BLOCKED",
              allowed: false,
              reason: "SELF_REFERRAL_IP_MATCH",
            },
          });
          return false;
        }
        if (ownerMeta.creatorFingerprint && ownerMeta.creatorFingerprint === buyerFingerprint) {
          console.warn(`[Referral Abuse] Self-referral blocked: Device fingerprint matches code owner.`);
          await db.rateLimitEvent.create({
            data: {
              ipAddress: buyerIp,
              email: currentOrder.customerEmail || "",
              action: "REFERRAL_ABUSE_BLOCKED",
              allowed: false,
              reason: "SELF_REFERRAL_FINGERPRINT_MATCH",
            },
          });
          return false;
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
          email: currentOrder.customerEmail || "",
          action: "REFERRAL_ABUSE_BLOCKED",
          allowed: false,
          reason: "DAILY_IP_LIMIT_EXCEEDED",
        },
      });
      return false;
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
        email: currentOrder.customerEmail || "",
        action: "REFERRAL_CREDIT_GRANTED",
        allowed: true,
        reason: `ORDER_${currentOrder.id}_REWARD_${reward}`,
      },
    });

    await db.rateLimitEvent.create({
      data: {
        ipAddress: buyerIp,
        email: currentOrder.customerEmail || "",
        action: `REFERRAL_CREDITED:${currentOrder.id}`,
        allowed: true,
        reason: `CODE_${code}`,
      },
    });

    console.log(`[Referral Credited] Added ${reward} credit to code ${code} for completed paid order`);
    return true;
  } catch (err) {
    console.error("Failed to credit referrer:", err);
    return false;
  }
}

