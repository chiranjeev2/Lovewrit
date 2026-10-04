/**
 * Privacy-respecting, consent-aware analytics helper.
 * Strictly respects Do Not Track (DNT) and user consent settings.
 * Never collects PII, emails, or personal letters.
 */

export type FunnelStep = "visit" | "customizer" | "checkout" | "paid";

export interface FunnelEventPayload {
  step: FunnelStep;
  templateId?: string;
  productType?: "CARD" | "PAGE";
  tier?: string;
}

const CONSENT_KEY = "lovewrit_analytics_consent";

export function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;

  // Respect Global Do Not Track preference
  if (navigator.doNotTrack === "1" || (window as unknown as { doNotTrack?: string }).doNotTrack === "1") {
    const explicitStored = localStorage.getItem(CONSENT_KEY);
    return explicitStored === "granted";
  }

  const stored = localStorage.getItem(CONSENT_KEY);
  return stored === "granted";
}

export function setAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
}

export function hasUserDecidedConsent(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(CONSENT_KEY) !== null;
}

/**
 * Fires a privacy-friendly funnel step if user has consented.
 */
export async function trackFunnelStep(payload: FunnelEventPayload): Promise<void> {
  if (!getAnalyticsConsent()) {
    // Respect user privacy: silent return
    return;
  }

  try {
    // Send anonymous aggregate event
    await fetch("/api/analytics/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Fail silently without disturbing user experience
    console.debug("Funnel event dispatch skipped:", err);
  }
}
