export type RegionKey = "asia_africa" | "americas" | "europe" | "uk";
export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";
export type ProductType = "CARD" | "PAGE";

export interface PricingTier {
  region: RegionKey;
  regionLabel: string;
  currency: CurrencyCode;
  symbol: string;
  cardPrice: number;       // Display amount (e.g. 49 or 2)
  pagePrice: number;       // Display amount (e.g. 200 or 10)
  cardPriceUnit: number;   // Stripe smallest unit (paise / cents / pence)
  pagePriceUnit: number;
}

export const PRICING_TIERS: Record<RegionKey, PricingTier> = {
  asia_africa: {
    region: "asia_africa",
    regionLabel: "Asia & Africa",
    currency: "INR",
    symbol: "₹",
    cardPrice: 49,
    pagePrice: 200,
    cardPriceUnit: 4900,
    pagePriceUnit: 20000,
  },
  americas: {
    region: "americas",
    regionLabel: "Americas",
    currency: "USD",
    symbol: "$",
    cardPrice: 2,
    pagePrice: 10,
    cardPriceUnit: 200,
    pagePriceUnit: 1000,
  },
  europe: {
    region: "europe",
    regionLabel: "Europe",
    currency: "EUR",
    symbol: "€",
    cardPrice: 2,
    pagePrice: 10,
    cardPriceUnit: 200,
    pagePriceUnit: 1000,
  },
  uk: {
    region: "uk",
    regionLabel: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    cardPrice: 2,
    pagePrice: 10,
    cardPriceUnit: 200,
    pagePriceUnit: 1000,
  },
};

export const CURRENCY_TO_REGION: Record<CurrencyCode, RegionKey> = {
  INR: "asia_africa",
  USD: "americas",
  EUR: "europe",
  GBP: "uk",
};

/**
 * Detect region from timezone or country code
 */
export function detectRegion(countryCode?: string | null, timezone?: string | null): RegionKey {
  if (countryCode) {
    const code = countryCode.toUpperCase();
    if (code === "GB") return "uk";
    if (["IN", "PK", "BD", "LK", "NP", "AE", "SA", "NG", "KE", "ZA", "EG"].includes(code)) return "asia_africa";
    if (["US", "CA", "MX", "BR", "AR", "CO", "CL"].includes(code)) return "americas";
    if (["DE", "FR", "IT", "ES", "NL", "BE", "SE", "PL", "IE", "AT", "PT", "CH"].includes(code)) return "europe";
  }

  if (timezone) {
    if (timezone.includes("London") || timezone.includes("Belfast")) return "uk";
    if (timezone.includes("Calcutta") || timezone.includes("Kolkata") || timezone.includes("Asia") || timezone.includes("Africa")) {
      return "asia_africa";
    }
    if (timezone.includes("America") || timezone.includes("Pacific") || timezone.includes("Eastern") || timezone.includes("Central")) {
      return "americas";
    }
    if (timezone.includes("Europe")) return "europe";
  }

  return "americas";
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const symbol = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }[currency];

  return `${symbol}${amount}`;
}
