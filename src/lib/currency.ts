export type RegionKey = "asia_africa" | "americas" | "europe" | "uk";
export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";
export type ProductType = "CARD" | "PAGE";
export type TierType = "SELF_SERVICE" | "CUSTOM" | "RUSH";

export interface PricingTier {
  region: RegionKey;
  regionLabel: string;
  currency: CurrencyCode;
  symbol: string;
  cardPrice: number;         // ₹49 / $2 / €2 / £2
  pagePrice: number;         // ₹200 / $10 / €10 / £10
  customPrice: number;       // ₹1000 / $50 / €50 / £50
  rushPrice: number;         // ₹2000 / $100 / €100 / £100
  bundleAddonPrice: number;  // ₹99 / $5 / €5 / £5
  cardPriceUnit: number;     // In smallest currency units (paise / cents / pence)
  pagePriceUnit: number;
  customPriceUnit: number;
  rushPriceUnit: number;
  bundleAddonUnit: number;
}

export const PRICING_TIERS: Record<RegionKey, PricingTier> = {
  asia_africa: {
    region: "asia_africa",
    regionLabel: "Asia & Africa",
    currency: "INR",
    symbol: "₹",
    cardPrice: 49,
    pagePrice: 200,
    customPrice: 1000,
    rushPrice: 2000,
    bundleAddonPrice: 99,
    cardPriceUnit: 4900,
    pagePriceUnit: 20000,
    customPriceUnit: 100000,
    rushPriceUnit: 200000,
    bundleAddonUnit: 9900,
  },
  americas: {
    region: "americas",
    regionLabel: "Americas",
    currency: "USD",
    symbol: "$",
    cardPrice: 2,
    pagePrice: 10,
    customPrice: 50,
    rushPrice: 100,
    bundleAddonPrice: 5,
    cardPriceUnit: 200,
    pagePriceUnit: 1000,
    customPriceUnit: 5000,
    rushPriceUnit: 10000,
    bundleAddonUnit: 500,
  },
  europe: {
    region: "europe",
    regionLabel: "Europe",
    currency: "EUR",
    symbol: "€",
    cardPrice: 2,
    pagePrice: 10,
    customPrice: 50,
    rushPrice: 100,
    bundleAddonPrice: 5,
    cardPriceUnit: 200,
    pagePriceUnit: 1000,
    customPriceUnit: 5000,
    rushPriceUnit: 10000,
    bundleAddonUnit: 500,
  },
  uk: {
    region: "uk",
    regionLabel: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    cardPrice: 2,
    pagePrice: 10,
    customPrice: 50,
    rushPrice: 100,
    bundleAddonPrice: 5,
    cardPriceUnit: 200,
    pagePriceUnit: 1000,
    customPriceUnit: 5000,
    rushPriceUnit: 10000,
    bundleAddonUnit: 500,
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

export function calculateOrderTotal(
  region: RegionKey,
  productType: ProductType,
  tier: TierType = "SELF_SERVICE",
  isBundle = false
): { totalUnit: number; displayPrice: number; currency: CurrencyCode; symbol: string } {
  const p = PRICING_TIERS[region];
  let unit = 0;
  let display = 0;

  if (tier === "RUSH") {
    unit = p.rushPriceUnit;
    display = p.rushPrice;
  } else if (tier === "CUSTOM") {
    unit = p.customPriceUnit;
    display = p.customPrice;
  } else {
    // SELF_SERVICE
    if (productType === "CARD") {
      unit = p.cardPriceUnit;
      display = p.cardPrice;
    } else {
      unit = p.pagePriceUnit;
      display = p.pagePrice;
    }
  }

  if (isBundle) {
    unit += p.bundleAddonUnit;
    display += p.bundleAddonPrice;
  }

  return {
    totalUnit: unit,
    displayPrice: display,
    currency: p.currency,
    symbol: p.symbol,
  };
}
