import { calculateOrderTotal, PRICING_TIERS } from "./src/lib/currency.ts";
import { STICKER_SETS } from "./src/lib/templates-data.ts";
import { db } from "./src/lib/db.ts";

async function runTests() {
  console.log("--- BATCH FEATURES VERIFICATION ---\n");

  // 1. Referral discount calculation verification
  console.log("1. Testing Referral Discount in Currency Engine:");
  for (const region of ["asia_africa", "americas", "europe", "uk"]) {
    const p = PRICING_TIERS[region];
    // Test on Page (Self-service)
    const pagePricing = calculateOrderTotal(region, "PAGE", "SELF_SERVICE", false, false, {
      referralDiscount: true,
    });
    const expectedDisplay = p.pagePrice - p.cardPrice;
    const expectedUnit = p.pagePriceUnit - p.cardPriceUnit;

    if (pagePricing.displayPrice !== expectedDisplay || pagePricing.totalUnit !== expectedUnit) {
      throw new Error(
        `Referral discount failed for region ${region}: expected ${expectedDisplay}, got ${pagePricing.displayPrice}`
      );
    }
    console.log(
      `✓ Region ${region}: Original ${p.symbol}${p.pagePrice} - ${p.symbol}${p.cardPrice} = ${p.symbol}${pagePricing.displayPrice} (unit: ${pagePricing.totalUnit})`
    );
  }

  // 2. Sticker sets verification
  console.log("\n2. Testing Sticker Sets:");
  if (STICKER_SETS.length < 20) {
    throw new Error(`Expected at least 20 stickers in STICKER_SETS, got ${STICKER_SETS.length}`);
  }
  const categories = new Set(STICKER_SETS.map((s) => s.category));
  console.log(`✓ Total stickers: ${STICKER_SETS.length} across categories: ${Array.from(categories).join(", ")}`);

  // 3. Database schema verification
  console.log("\n3. Testing Database Models & Fields:");
  const testEmail = `test_referral_${Date.now()}@example.com`;
  const testCode = `TESTREF_${Date.now().toString().slice(-4)}`;

  // Create referral record
  const referral = await db.referralRecord.create({
    data: {
      code: testCode,
      ownerEmail: testEmail,
      ownerName: "Referral Partner",
      creditBalance: 0,
      timesUsed: 0,
    },
  });
  console.log(`✓ Created ReferralRecord with code: ${referral.code}`);

  // Create an order with PIN, nickname, tip links, and referralCodeUsed
  const testSlug = `test_${Date.now()}`;
  const order = await db.order.create({
    data: {
      slug: testSlug,
      customerEmail: testEmail,
      customerName: "Test Buyer",
      productType: "PAGE",
      templateId: "chic-kitty-party",
      currency: "INR",
      amountTotal: 5000,
      region: "asia_africa",
      pinCode: "1234",
      nickname: "Guddu",
      tipUpiId: "sender@okaxis",
      tipPaypalUsername: "senderpaypal",
      referralCodeUsed: testCode,
      myReferralCode: `MYREF_${Date.now().toString().slice(-4)}`,
      pageData: {
        create: {
          senderName: "Test Sender",
          recipientName: "Test Recipient",
          occasion: "kitty_party",
          letter: "Let's party and celebrate!",
          photoUrls: JSON.stringify([]),
          fontFamily: "handwriting",
          ambientEffect: "petals",
          milestoneVenue: "First Date Cafe",
        },
      },
    },
    include: { pageData: true },
  });
  console.log(`✓ Created Order with PIN (${order.pinCode}), Nickname (${order.nickname}), Tip UPI (${order.tipUpiId})`);

  // Test RecipientReaction
  const reaction = await db.recipientReaction.create({
    data: {
      pageDataId: order.pageData.id,
      senderName: "Happy Recipient",
      reactionType: "text",
      message: "This made me smile so much! Thank you!",
    },
  });
  console.log(`✓ Created RecipientReaction: "${reaction.message}" for PageData ID ${reaction.pageDataId}`);

  // Clean up test data
  await db.recipientReaction.delete({ where: { id: reaction.id } });
  await db.order.delete({ where: { id: order.id } });
  await db.referralRecord.delete({ where: { id: referral.id } });
  console.log("✓ Cleaned up test database records");

  console.log("\nALL BATCH FEATURE TESTS PASSED SUCCESSFULLY! 🚀");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

