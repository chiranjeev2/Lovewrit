import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FunnelStep } from "@/lib/consent";
import {
  checkPayloadSize,
  enforceRateLimit,
  validateFunnelStepInput,
  safeErrorResponse,
  safeServerErrorResponse,
} from "@/lib/api-safety";

interface FunnelMetrics {
  visit: number;
  customizer: number;
  checkout: number;
  paid: number;
  lastUpdated: string;
}

const DEFAULT_METRICS: FunnelMetrics = {
  visit: 0,
  customizer: 0,
  checkout: 0,
  paid: 0,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    const setting = await db.platformSetting.findUnique({
      where: { key: "analytics_funnel" },
    });

    let metrics: FunnelMetrics = DEFAULT_METRICS;
    if (setting?.value) {
      try {
        metrics = JSON.parse(setting.value);
      } catch {
        // Fallback to default metrics
      }
    }

    // Calculate conversion rates
    const visitToCustomizer = metrics.visit > 0 ? ((metrics.customizer / metrics.visit) * 100).toFixed(1) : "0.0";
    const customizerToCheckout = metrics.customizer > 0 ? ((metrics.checkout / metrics.customizer) * 100).toFixed(1) : "0.0";
    const checkoutToPaid = metrics.checkout > 0 ? ((metrics.paid / metrics.checkout) * 100).toFixed(1) : "0.0";
    const overallConversion = metrics.visit > 0 ? ((metrics.paid / metrics.visit) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      metrics,
      conversionRates: {
        visitToCustomizer: `${visitToCustomizer}%`,
        customizerToCheckout: `${customizerToCheckout}%`,
        checkoutToPaid: `${checkoutToPaid}%`,
        overall: `${overallConversion}%`,
      },
    });
  } catch (err: unknown) {
    console.error("Funnel query note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const sizeErr = checkPayloadSize(req, 20 * 1024);
    if (sizeErr) return sizeErr;

    const rateLimit = await enforceRateLimit(req, "FUNNEL", 60, 60);
    if (!rateLimit.allowed && rateLimit.response) {
      return rateLimit.response;
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return safeErrorResponse("Malformed JSON in request body", 400);
    }

    const validation = validateFunnelStepInput(rawBody);
    if (!validation.success || !validation.data) {
      return safeErrorResponse(validation.error || "Invalid funnel step", 400);
    }

    const step: FunnelStep = validation.data.step;

    // Atomically increment funnel count in transaction
    const updatedMetrics = await db.$transaction(async (tx) => {
      const setting = await tx.platformSetting.findUnique({
        where: { key: "analytics_funnel" },
      });

      let current: FunnelMetrics = DEFAULT_METRICS;
      if (setting?.value) {
        try {
          current = JSON.parse(setting.value);
        } catch {
          // Fallback to default metrics
        }
      }

      current[step] = (current[step] || 0) + 1;
      current.lastUpdated = new Date().toISOString();

      await tx.platformSetting.upsert({
        where: { key: "analytics_funnel" },
        update: { value: JSON.stringify(current) },
        create: { key: "analytics_funnel", value: JSON.stringify(current) },
      });

      return current;
    });

    return NextResponse.json({
      success: true,
      step,
      count: updatedMetrics[step],
    });
  } catch (err: unknown) {
    console.error("Funnel tracking note:", err instanceof Error ? err.name : "Unknown");
    return safeServerErrorResponse();
  }
}
