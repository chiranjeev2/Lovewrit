export type RegionKey = "asia_africa" | "americas" | "europe" | "uk";
export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";
export type ProductType = "CARD" | "PAGE";
export type TierType = "SELF_SERVICE" | "CUSTOM" | "RUSH";

export interface PricingTier {
  region: RegionKey;
  regionLabel: string;
  currency: CurrencyCode;
  symbol: string;
  // Self-Service
  cardPrice: number;             // ₹49 / $2 / €2 / £2
  pagePrice: number;             // ₹99 / $5 / €5 / £5
  // Custom Handcrafted (Split properly between Card & Page)
  customPrice: number;           // ₹499 / $25 / €25 / £25 (Page default)
  customCardPrice: number;       // ₹149 / $8 / €8 / £8
  customPagePrice: number;       // ₹499 / $25 / €25 / £25
  // Custom Emergency Rush (Split properly between Card & Page)
  rushPrice: number;             // ₹1459 / $75 / €75 / £75 (Page default)
  rushCardPrice: number;         // ₹449 / $22 / €22 / £22
  rushPagePrice: number;         // ₹1459 / $75 / €75 / £75
  // Bundle addon
  bundleAddonPrice: number;      // ₹49 / $3 / €3 / £3

  cardPriceUnit: number;
  pagePriceUnit: number;
  customCardPriceUnit: number;
  customPagePriceUnit: number;
  rushCardPriceUnit: number;
  rushPagePriceUnit: number;
  bundleAddonUnit: number;
}

export const PRICING_TIERS: Record<RegionKey, PricingTier> = {
  asia_africa: {
    region: "asia_africa",
    regionLabel: "Asia & Africa",
    currency: "INR",
    symbol: "₹",
    cardPrice: 49,
    pagePrice: 99,
    customPrice: 499,
    customCardPrice: 149,
    customPagePrice: 499,
    rushPrice: 1459,
    rushCardPrice: 449,
    rushPagePrice: 1459,
    bundleAddonPrice: 49,

    cardPriceUnit: 4900,
    pagePriceUnit: 9900,
    customCardPriceUnit: 14900,
    customPagePriceUnit: 49900,
    rushCardPriceUnit: 44900,
    rushPagePriceUnit: 145900,
    bundleAddonUnit: 4900,
  },
  americas: {
    region: "americas",
    regionLabel: "Americas",
    currency: "USD",
    symbol: "$",
    cardPrice: 2,
    pagePrice: 5,
    customPrice: 25,
    customCardPrice: 8,
    customPagePrice: 25,
    rushPrice: 75,
    rushCardPrice: 22,
    rushPagePrice: 75,
    bundleAddonPrice: 3,

    cardPriceUnit: 200,
    pagePriceUnit: 500,
    customCardPriceUnit: 800,
    customPagePriceUnit: 2500,
    rushCardPriceUnit: 2200,
    rushPagePriceUnit: 7500,
    bundleAddonUnit: 300,
  },
  europe: {
    region: "europe",
    regionLabel: "Europe",
    currency: "EUR",
    symbol: "€",
    cardPrice: 2,
    pagePrice: 5,
    customPrice: 25,
    customCardPrice: 8,
    customPagePrice: 25,
    rushPrice: 75,
    rushCardPrice: 22,
    rushPagePrice: 75,
    bundleAddonPrice: 3,

    cardPriceUnit: 200,
    pagePriceUnit: 500,
    customCardPriceUnit: 800,
    customPagePriceUnit: 2500,
    rushCardPriceUnit: 2200,
    rushPagePriceUnit: 7500,
    bundleAddonUnit: 300,
  },
  uk: {
    region: "uk",
    regionLabel: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    cardPrice: 2,
    pagePrice: 5,
    customPrice: 25,
    customCardPrice: 8,
    customPagePrice: 25,
    rushPrice: 75,
    rushCardPrice: 22,
    rushPagePrice: 75,
    bundleAddonPrice: 3,

    cardPriceUnit: 200,
    pagePriceUnit: 500,
    customCardPriceUnit: 800,
    customPagePriceUnit: 2500,
    rushCardPriceUnit: 2200,
    rushPagePriceUnit: 7500,
    bundleAddonUnit: 300,
  },
};

export const CURRENCY_TO_REGION: Record<CurrencyCode, RegionKey> = {
  INR: "asia_africa",
  USD: "americas",
  EUR: "europe",
  GBP: "uk",
};

export function detectRegion(countryCode?: string | null, timezone?: string | null): RegionKey {
  if (countryCode) {
    const code = countryCode.toUpperCase();
    if (code === "GB") return "uk";
    if (["IN", "PK", "BD", "LK", "NP", "AE", "SA", "NG", "KE", "ZA", "EG"].includes(code)) return "asia_africa";
    if (["US", "CA", "MX", "BR", "AR", "CO", "CL", "AU", "NZ"].includes(code)) return "americas";
    if (["DE", "FR", "IT", "ES", "NL", "BE", "SE", "PL", "IE", "AT", "PT", "CH"].includes(code)) return "europe";
  }

  if (timezone) {
    if (timezone.includes("London") || timezone.includes("Belfast")) return "uk";
    if (timezone.includes("Calcutta") || timezone.includes("Kolkata") || timezone.includes("Asia") || timezone.includes("Africa")) {
      return "asia_africa";
    }
    if (timezone.includes("America") || timezone.includes("Pacific") || timezone.includes("Eastern") || timezone.includes("Central") || timezone.includes("Australia") || timezone.includes("Sydney") || timezone.includes("Melbourne")) {
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
  isBundle = false,
  isRegiftDiscount = false
): {
  totalUnit: number;
  displayPrice: number;
  currency: CurrencyCode;
  symbol: string;
  isDiscounted: boolean;
  originalDisplayPrice?: number;
} {
  const p = PRICING_TIERS[region];
  let unit = 0;
  let display = 0;

  if (tier === "RUSH") {
    if (productType === "CARD") {
      unit = p.rushCardPriceUnit;
      display = p.rushCardPrice;
    } else {
      unit = p.rushPagePriceUnit;
      display = p.rushPagePrice;
    }
  } else if (tier === "CUSTOM") {
    if (productType === "CARD") {
      unit = p.customCardPriceUnit;
      display = p.customCardPrice;
    } else {
      unit = p.customPagePriceUnit;
      display = p.customPagePrice;
    }
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

  let isDiscounted = false;
  let originalDisplayPrice: number | undefined;

  // 50% OFF Regift Discount
  if (isRegiftDiscount) {
    originalDisplayPrice = display;
    unit = Math.round(unit * 0.5);
    display = Math.round(display * 0.5);
    isDiscounted = true;
  }

  return {
    totalUnit: unit,
    displayPrice: display,
    currency: p.currency,
    symbol: p.symbol,
    isDiscounted,
    originalDisplayPrice,
  };
}
