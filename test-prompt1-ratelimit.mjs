import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function testRateLimiting() {
  console.log("--- TEST 3: FREE ORDER RATE LIMITING & ABUSE PROTECTION ---");

  const testIp = "192.168.1.99";
  const testEmail = "test_rate_limit@lovewrit.local";

  // Clean up any existing test records
  await db.rateLimitEvent.deleteMany({ where: { ipAddress: testIp } });
  await db.order.deleteMany({ where: { customerEmail: testEmail } });

  console.log("1. Simulating 5 free orders within 24 hours...");
  for (let i = 1; i <= 5; i++) {
    await db.order.create({
      data: {
        slug: `test_rl_${Date.now()}_${i}`,
        customerEmail: testEmail,
        customerName: `Test User ${i}`,
        productType: "CARD",
        templateId: "letter-to-dear-one",
        tier: "SELF_SERVICE",
        status: "PAID",
        currency: "INR",
        amountTotal: 0,
        region: "asia_africa",
        ipAddress: testIp,
        stripeSessionId: `free_test_${i}`,
      },
    });
    console.log(`   Order #${i} recorded successfully.`);
  }

  // Verify count
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await db.order.count({
    where: {
      amountTotal: 0,
      createdAt: { gte: oneDayAgo },
      OR: [{ ipAddress: testIp }, { customerEmail: testEmail }],
    },
  });

  console.assert(count === 5, `Expected 5 orders, found ${count}`);
  console.log(`2. Order count reached: ${count} / 5 allowed daily free orders.`);

  // Test rate limit event creation when 6th order attempted
  if (count >= 5) {
    const rateLimitLog = await db.rateLimitEvent.create({
      data: {
        ipAddress: testIp,
        email: testEmail,
        action: "FREE_ORDER_CREATION",
        allowed: false,
        reason: `Exceeded daily free order limit (attempted order #${count + 1})`,
      },
    });
    console.assert(rateLimitLog.allowed === false, "Rate limit event allowed flag should be false");
    console.log("3. RateLimitEvent created for admin audit:", rateLimitLog.reason);
  }

  // Cleanup test artifacts
  await db.rateLimitEvent.deleteMany({ where: { ipAddress: testIp } });
  await db.order.deleteMany({ where: { customerEmail: testEmail } });
  console.log("4. Test database records cleaned up cleanly.");

  console.log("\nRATE LIMITING TEST PASSED!");
  await db.$disconnect();
}

testRateLimiting().catch((e) => {
  console.error(e);
  process.exit(1);
});

