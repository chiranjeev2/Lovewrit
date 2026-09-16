// Verification test script for Lovewrit multi-currency pricing matrix
import { PRICING_TIERS, calculateOrderTotal } from "./src/lib/currency.ts";

console.log("=================================================");
console.log("   LOVEWRIT MULTI-CURRENCY PRICING MATRIX AUDIT   ");
console.log("=================================================\n");

const REGIONS = [
  { key: "asia_africa", expectedCurrency: "INR", expectedSymbol: "₹" },
  { key: "americas", expectedCurrency: "USD", expectedSymbol: "$" },
  { key: "europe", expectedCurrency: "EUR", expectedSymbol: "€" },
  { key: "uk", expectedCurrency: "GBP", expectedSymbol: "£" },
];

let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Audit PRICING_TIERS object directly
console.log("--- 1. Direct Object Audit in PRICING_TIERS ---");

// Check Europe (specifically requested)
const eur = PRICING_TIERS.europe;
assert(eur.currency === "EUR", "Europe currency must be EUR");
assert(eur.symbol === "€", "Europe symbol must be € (not $)");
assert(eur.cardPrice === 2, "Europe Self-Service Card must be 2 (€2)");
assert(eur.pagePrice === 5, "Europe Self-Service Page must be 5 (€5)");
assert(eur.customCardPrice === 8, "Europe Custom Card must be 8 (€8, not $8)");
assert(eur.customPrice === 25, "Europe Custom Page must be 25 (€25)");
assert(eur.rushCardPrice === 22, "Europe Rush Card must be 22 (€22)");
assert(eur.rushPrice === 75, "Europe Rush Page must be 75 (€75)");
assert(eur.bundleAddonPrice === 3, "Europe Bundle Addon must be 3 (€3, not $3)");

// Check UK (specifically requested)
const gbp = PRICING_TIERS.uk;
assert(gbp.currency === "GBP", "UK currency must be GBP");
assert(gbp.symbol === "£", "UK symbol must be £ (not $)");
assert(gbp.cardPrice === 2, "UK Self-Service Card must be 2 (£2)");
assert(gbp.pagePrice === 5, "UK Self-Service Page must be 5 (£5)");
assert(gbp.customCardPrice === 8, "UK Custom Card must be 8 (£8)");
assert(gbp.customPrice === 25, "UK Custom Page must be 25 (£25)");
assert(gbp.rushCardPrice === 22, "UK Rush Card must be 22 (£22)");
assert(gbp.rushPrice === 75, "UK Rush Page must be 75 (£75)");
assert(gbp.bundleAddonPrice === 3, "UK Bundle Addon must be 3 (£3, not $3)");

// 2. Audit calculateOrderTotal function across all combinations
console.log("\n--- 2. calculateOrderTotal Execution Across All 4 Regions ---");

for (const { key, expectedCurrency, expectedSymbol } of REGIONS) {
  console.log(`\nTesting Region: [${key}] (${expectedCurrency} / ${expectedSymbol})`);

  // Tier 1: Digital Card (Self-Service)
  const t1 = calculateOrderTotal(key, "CARD", "SELF_SERVICE", false);
  assert(t1.currency === expectedCurrency, `T1 Card currency is ${expectedCurrency}`);
  assert(t1.symbol === expectedSymbol, `T1 Card symbol is ${expectedSymbol}`);
  console.log(`   Tier 1 (Card): ${t1.symbol}${t1.displayPrice} (unit: ${t1.totalUnit})`);

  // Tier 2: Interactive Page (Self-Service)
  const t2 = calculateOrderTotal(key, "PAGE", "SELF_SERVICE", false);
  assert(t2.currency === expectedCurrency, `T2 Page currency is ${expectedCurrency}`);
  assert(t2.symbol === expectedSymbol, `T2 Page symbol is ${expectedSymbol}`);
  console.log(`   Tier 2 (Page): ${t2.symbol}${t2.displayPrice} (unit: ${t2.totalUnit})`);

  // Tier 3: Custom Handcrafted Card
  const t3Card = calculateOrderTotal(key, "CARD", "CUSTOM", false);
  assert(t3Card.currency === expectedCurrency, `T3 Card currency is ${expectedCurrency}`);
  assert(t3Card.symbol === expectedSymbol, `T3 Card symbol is ${expectedSymbol}`);
  console.log(`   Tier 3 (Card): ${t3Card.symbol}${t3Card.displayPrice} (unit: ${t3Card.totalUnit})`);

  // Tier 3: Custom Handcrafted Page
  const t3Page = calculateOrderTotal(key, "PAGE", "CUSTOM", false);
  assert(t3Page.currency === expectedCurrency, `T3 Page currency is ${expectedCurrency}`);
  assert(t3Page.symbol === expectedSymbol, `T3 Page symbol is ${expectedSymbol}`);
  console.log(`   Tier 3 (Page): ${t3Page.symbol}${t3Page.displayPrice} (unit: ${t3Page.totalUnit})`);

  // Tier 4: Rush Card
  const t4Card = calculateOrderTotal(key, "CARD", "RUSH", false);
  assert(t4Card.currency === expectedCurrency, `T4 Card currency is ${expectedCurrency}`);
  assert(t4Card.symbol === expectedSymbol, `T4 Card symbol is ${expectedSymbol}`);
  console.log(`   Tier 4 (Card): ${t4Card.symbol}${t4Card.displayPrice} (unit: ${t4Card.totalUnit})`);

  // Tier 4: Rush Page
  const t4Page = calculateOrderTotal(key, "PAGE", "RUSH", false);
  assert(t4Page.currency === expectedCurrency, `T4 Page currency is ${expectedCurrency}`);
  assert(t4Page.symbol === expectedSymbol, `T4 Page symbol is ${expectedSymbol}`);
  console.log(`   Tier 4 (Page): ${t4Page.symbol}${t4Page.displayPrice} (unit: ${t4Page.totalUnit})`);

  // Bundle Addon with Tier 2 Page
  const bundle = calculateOrderTotal(key, "PAGE", "SELF_SERVICE", true);
  assert(bundle.currency === expectedCurrency, `Bundle currency is ${expectedCurrency}`);
  assert(bundle.symbol === expectedSymbol, `Bundle symbol is ${expectedSymbol}`);
  const expectedAddon = PRICING_TIERS[key].bundleAddonPrice;
  const expectedBase = PRICING_TIERS[key].pagePrice;
  assert(bundle.displayPrice === expectedBase + expectedAddon, `Bundle total is base + addon (${expectedBase} + ${expectedAddon} = ${bundle.displayPrice})`);
  console.log(`   Tier 2 + Bundle: ${bundle.symbol}${bundle.displayPrice} (base: ${bundle.symbol}${expectedBase}, addon: +${bundle.symbol}${expectedAddon})`);

  // Regift 50% discount with Tier 2 Page
  const regift = calculateOrderTotal(key, "PAGE", "SELF_SERVICE", false, true);
  assert(regift.isDiscounted === true, `Regift isDiscounted is true`);
  assert(regift.displayPrice === Math.round(expectedBase * 0.5), `Regift 50% price is half of base`);
  console.log(`   Tier 2 50% Regift: ${regift.symbol}${regift.displayPrice} (original: ${regift.symbol}${regift.originalDisplayPrice})`);
}

console.log("\n=================================================");
if (failed === 0) {
  console.log("🎉 ALL CURRENCY & TIER AUDIT CHECKS PASSED WITH 0 ERRORS!");
} else {
  console.error(`⚠️ AUDIT COMPLETED WITH ${failed} FAILURES.`);
  process.exit(1);
}
console.log("=================================================");

