import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FunnelStep } from "@/lib/consent";

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
      } catch (e) {
        console.warn("Could not parse analytics_funnel setting:", e);
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
    console.error("Funnel analytics query error:", err);
    return NextResponse.json({ error: "Failed to load funnel analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const step: FunnelStep = body.step;

    if (!["visit", "customizer", "checkout", "paid"].includes(step)) {
      return NextResponse.json({ error: "Invalid funnel step" }, { status: 400 });
    }

    const setting = await db.platformSetting.findUnique({
      where: { key: "analytics_funnel" },
    });

    let current: FunnelMetrics = DEFAULT_METRICS;
    if (setting?.value) {
      try {
        current = JSON.parse(setting.value);
      } catch {
        current = DEFAULT_METRICS;
      }
    }

    current[step] = (current[step] || 0) + 1;
    current.lastUpdated = new Date().toISOString();

    await db.platformSetting.upsert({
      where: { key: "analytics_funnel" },
      update: { value: JSON.stringify(current) },
      create: { key: "analytics_funnel", value: JSON.stringify(current) },
    });

    return NextResponse.json({ success: true, recordedStep: step });
  } catch (err: unknown) {
    console.error("Funnel analytics record error:", err);
    return NextResponse.json({ error: "Failed to record funnel step" }, { status: 500 });
  }
}
