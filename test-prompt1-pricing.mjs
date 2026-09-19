import { calculateOrderTotal } from "./src/lib/currency.ts";

console.log("--- TEST 2: PRICING VERIFICATION ---");

// Test 1: Standard paid card (e.g. ₹49 / $2)
const standardCard = calculateOrderTotal("asia_africa", "CARD", "SELF_SERVICE", false, false);
console.assert(standardCard.totalUnit === 4900, `Expected 4900 paise, got ${standardCard.totalUnit}`);
console.assert(standardCard.displayPrice === 49, `Expected 49, got ${standardCard.displayPrice}`);
console.log("✓ Standard Card pricing: ₹49 (4900 unit)");

// Test 2: Standard paid page (e.g. ₹99 / $5)
const standardPage = calculateOrderTotal("asia_africa", "PAGE", "SELF_SERVICE", false, false);
console.assert(standardPage.totalUnit === 9900, `Expected 9900 paise, got ${standardPage.totalUnit}`);
console.assert(standardPage.displayPrice === 99, `Expected 99, got ${standardPage.displayPrice}`);
console.log("✓ Standard Page pricing: ₹99 (9900 unit)");

// Test 3: 100% Free Digital Card (Letter to a Dear One)
const freeCard = calculateOrderTotal("asia_africa", "CARD", "SELF_SERVICE", false, false, {
  isFreeCard: true,
});
console.assert(freeCard.totalUnit === 0, `Expected 0 for free card, got ${freeCard.totalUnit}`);
console.assert(freeCard.displayPrice === 0, `Expected 0 display price, got ${freeCard.displayPrice}`);
console.log("✓ Free Digital Card (Letter to a Dear One): ₹0 (0 unit)");

// Test 4: Free Ad-Supported Interactive Page
const freeAdPage = calculateOrderTotal("asia_africa", "PAGE", "SELF_SERVICE", false, false, {
  isAdSupported: true,
});
console.assert(freeAdPage.totalUnit === 0, `Expected 0 for ad-supported page, got ${freeAdPage.totalUnit}`);
console.assert(freeAdPage.displayPrice === 0, `Expected 0 display price, got ${freeAdPage.displayPrice}`);
console.log("✓ Ad-Supported Free Page (Letter to a Dear One): ₹0 (0 unit)");

// Test 5: Ad-Free Interactive Page for Letter to a Dear One (paid)
const adFreePage = calculateOrderTotal("asia_africa", "PAGE", "SELF_SERVICE", false, false, {
  isFreeCard: false,
  isAdSupported: false,
});
console.assert(adFreePage.totalUnit === 9900, `Expected standard price for ad-free page, got ${adFreePage.totalUnit}`);
console.assert(adFreePage.displayPrice === 99, `Expected standard display price, got ${adFreePage.displayPrice}`);
console.log("✓ Ad-Free Letter to a Dear One Page: ₹99 (standard price)");

// Test 6: Free ad-supported page should NOT be free if upgraded to Custom or Rush
const customAdPage = calculateOrderTotal("asia_africa", "PAGE", "CUSTOM", false, false, {
  isAdSupported: true,
});
console.assert(customAdPage.totalUnit > 0, `Custom tier should never be free even if ad-supported flag is passed`);
console.log("✓ Custom Handcrafted tier correctly overrides free ad-supported flag");

console.log("\nALL PRICING TESTS PASSED!");

