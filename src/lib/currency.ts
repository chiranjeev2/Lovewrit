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
  pagePrice: number;             // ₹200 / $10 / €10 / £10
  // Custom Handcrafted (Split properly between Card & Page!)
  customPrice: number;           // ₹1000 / $50 / €50 / £50 (Page default)
  customCardPrice: number;       // ₹299 / $15 / €15 / £15
  customPagePrice: number;       // ₹1000 / $50 / €50 / £50
  // Custom Emergency Rush (Split properly between Card & Page!)
  rushPrice: number;             // ₹2000 / $100 / €100 / £100 (Page default)
  rushCardPrice: number;         // ₹599 / $30 / €30 / £30
  rushPagePrice: number;         // ₹2000 / $100 / €100 / £100
  // Bundle addon
  bundleAddonPrice: number;      // ₹99 / $5 / €5 / £5

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
    pagePrice: 200,
    customPrice: 1000,
    customCardPrice: 299,
    customPagePrice: 1000,
    rushPrice: 2000,
    rushCardPrice: 599,
    rushPagePrice: 2000,
    bundleAddonPrice: 99,

    cardPriceUnit: 4900,
    pagePriceUnit: 20000,
    customCardPriceUnit: 29900,
    customPagePriceUnit: 100000,
    rushCardPriceUnit: 59900,
    rushPagePriceUnit: 200000,
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
    customCardPrice: 15,
    customPagePrice: 50,
    rushPrice: 100,
    rushCardPrice: 30,
    rushPagePrice: 100,
    bundleAddonPrice: 5,

    cardPriceUnit: 200,
    pagePriceUnit: 1000,
    customCardPriceUnit: 1500,
    customPagePriceUnit: 5000,
    rushCardPriceUnit: 3000,
    rushPagePriceUnit: 10000,
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
    customCardPrice: 15,
    customPagePrice: 50,
    rushPrice: 100,
    rushCardPrice: 30,
    rushPagePrice: 100,
    bundleAddonPrice: 5,

    cardPriceUnit: 200,
    pagePriceUnit: 1000,
    customCardPriceUnit: 1500,
    customPagePriceUnit: 5000,
    rushCardPriceUnit: 3000,
    rushPagePriceUnit: 10000,
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
    customCardPrice: 15,
    customPagePrice: 50,
    rushPrice: 100,
    rushCardPrice: 30,
    rushPagePrice: 100,
    bundleAddonPrice: 5,

    cardPriceUnit: 200,
    pagePriceUnit: 1000,
    customCardPriceUnit: 1500,
    customPagePriceUnit: 5000,
    rushCardPriceUnit: 3000,
    rushPagePriceUnit: 10000,
    bundleAddonUnit: 500,
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
