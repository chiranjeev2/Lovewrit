import { execFileSync } from "child_process";
import path from "path";

// If not running under tsx, re-exec via tsx so TypeScript route handlers and @/ imports resolve
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-razorpay-flow.mjs");
    const stdout = execFileSync(
      process.execPath,
      [tsxCli, scriptPath],
      {
        env: { ...process.env, __TSX_ACTIVE__: "1" },
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    process.stdout.write(stdout);
    process.exit(0);
  } catch (err) {
    if (err.stdout) process.stdout.write(err.stdout.toString());
    if (err.stderr) process.stderr.write(err.stderr.toString());
    process.exit(err.status || 1);
  }
}

import crypto from "crypto";
const { NextRequest } = await import("next/server");
const { db } = await import("../src/lib/db");
const { POST: checkoutPOST } = await import("../src/app/api/checkout/route");
const { POST: verifyPOST, GET: verifyGET } = await import("../src/app/api/checkout/verify/route");
const { POST: webhookPOST } = await import("../src/app/api/webhooks/razorpay/route");
const {
  calculateOrderTotal,
  PRICING_TIERS,
  CURRENCY_TO_REGION,
} = await import("../src/lib/currency");
const razorpayModule = await import("../src/lib/razorpay");

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedAssertions++;
  console.log(`  ✓ ${message}`);
}

async function runPaymentIntegrationTests() {
  console.log("=== RUNNING REAL ROUTE HANDLER PAYMENT & RAZORPAY INTEGRATION TESTS ===");

  const TEST_SECRET = "test_rzp_secret_key_1234567890abcdef";
  const TEST_WEBHOOK_SECRET = "test_webhook_secret_9876543210fedcba";
  process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;

  // --------------------------------------------------------------------------
  // 1. Client-Sent Amount / Currency Ignored in Checkout
  // --------------------------------------------------------------------------
  console.log("\n[1] Testing Client-Sent Amount & Manipulated Currency Ignored in Real Checkout Route...");
  const fakeEmail = `buyer_${Date.now()}@example.com`;
  const checkoutReq = new NextRequest("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      productType: "CARD",
      templateId: "forever-valentine",
      customerEmail: fakeEmail,
      customerName: "Real Test Buyer",
      amount: 1, // Maliciously low client-sent amount
      currency: "FORGED_CURRENCY", // Unsupported currency
    }),
  });

  const checkoutRes = await checkoutPOST(checkoutReq);
  const checkoutData = await checkoutRes.json();

  assert(checkoutRes.status === 200, "Real checkout POST handler returns 200");
  assert(
    checkoutData.amount === 4900,
    `Client-sent amount: 1 was ignored; server-calculated 4900 paise (₹49) applied (got ${checkoutData.amount})`
  );
  assert(
    checkoutData.currency === "INR",
    `Unsupported client currency was ignored; resolved to region default INR (got ${checkoutData.currency})`
  );

  // --------------------------------------------------------------------------
  // 2. Verify Route Rejections (Amount, Currency, Order ID Mismatch)
  // --------------------------------------------------------------------------
  console.log("\n[2] Testing Real Verify Route Rejects Mismatched Fields...");
  const targetOrderId = checkoutData.orderId;
  const targetSlug = checkoutData.slug;
  const targetRzpOrder = checkoutData.razorpayOrderId;
  const fakePaymentId = "pay_test_payment_99999";

  const validSig = crypto
    .createHmac("sha256", TEST_SECRET)
    .update(`${targetRzpOrder}|${fakePaymentId}`)
    .digest("hex");

  // 2a. razorpay_order_id mismatch
  const mismatchOrderIdReq = new NextRequest("http://localhost:3000/api/checkout/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: targetSlug,
      razorpay_order_id: "order_completely_different_123",
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: crypto
        .createHmac("sha256", TEST_SECRET)
        .update(`order_completely_different_123|${fakePaymentId}`)
        .digest("hex"),
    }),
  });
  const mismatchOrderRes = await verifyPOST(mismatchOrderIdReq);
  const mismatchOrderData = await mismatchOrderRes.json();
  assert(
    mismatchOrderRes.status === 400 && mismatchOrderData.error.includes("Order ID mismatch"),
    "Verify rejects razorpay_order_id mismatch with 400"
  );

  // 2b. Amount mismatch
  const mismatchAmountReq = new NextRequest("http://localhost:3000/api/checkout/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: targetSlug,
      razorpay_order_id: targetRzpOrder,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: validSig,
      amount: 999999, // Mismatched amount
    }),
  });
  const mismatchAmountRes = await verifyPOST(mismatchAmountReq);
  const mismatchAmountData = await mismatchAmountRes.json();
  assert(
    mismatchAmountRes.status === 400 && mismatchAmountData.error.includes("amount mismatch"),
    "Verify rejects amount mismatch with 400"
  );

  // 2c. Currency mismatch
  const mismatchCurrencyReq = new NextRequest("http://localhost:3000/api/checkout/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: targetSlug,
      razorpay_order_id: targetRzpOrder,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: validSig,
      currency: "USD", // Mismatched currency (order is INR)
    }),
  });
  const mismatchCurrencyRes = await verifyPOST(mismatchCurrencyReq);
  const mismatchCurrencyData = await mismatchCurrencyRes.json();
  assert(
    mismatchCurrencyRes.status === 400 && mismatchCurrencyData.error.includes("currency mismatch"),
    "Verify rejects currency mismatch with 400"
  );

  // --------------------------------------------------------------------------
  // 3. Verify Idempotency & Referral Credit (Single Credit on Second Call)
  // --------------------------------------------------------------------------
  console.log("\n[3] Testing Verify Route Idempotency & Single Referral Credit...");
  const refCode = `REF${Date.now().toString().slice(-6)}`;
  await db.referralRecord.create({
    data: {
      code: refCode,
      ownerEmail: `referrer_${Date.now()}@example.com`,
      ownerName: "Referrer Person",
      creditBalance: 0,
      timesUsed: 0,
    },
  });

  const refBuyerEmail = `refbuyer_${Date.now()}@example.com`;
  const buyerIp3 = `198.51.100.${Math.floor(Math.random() * 150 + 20)}`;
  const ua3 = `TestClientAgent_${Date.now()}_3`;
  const checkoutWithRefReq = new NextRequest("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": buyerIp3,
      "user-agent": ua3,
    },
    body: JSON.stringify({
      productType: "PAGE",
      templateId: "forever-valentine",
      customerEmail: refBuyerEmail,
      customerName: "Referral Buyer",
      referralCode: refCode,
    }),
  });
  const refCheckoutRes = await checkoutPOST(checkoutWithRefReq);
  const refCheckoutData = await refCheckoutRes.json();

  const refRzpOrderId = refCheckoutData.razorpayOrderId;
  const refPaymentId = "pay_ref_paid_123456";
  const refValidSig = crypto
    .createHmac("sha256", TEST_SECRET)
    .update(`${refRzpOrderId}|${refPaymentId}`)
    .digest("hex");

  // Call 1: First verify invocation
  const verify1Req = new NextRequest("http://localhost:3000/api/checkout/verify", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": buyerIp3,
      "user-agent": ua3,
    },
    body: JSON.stringify({
      slug: refCheckoutData.slug,
      razorpay_order_id: refRzpOrderId,
      razorpay_payment_id: refPaymentId,
      razorpay_signature: refValidSig,
    }),
  });
  const verify1Res = await verifyPOST(verify1Req);
  const verify1Data = await verify1Res.json();
  assert(verify1Res.status === 200 && verify1Data.success === true, "First verify call transitions order to PAID");

  const refAfterFirst = await db.referralRecord.findUnique({ where: { code: refCode } });
  assert(refAfterFirst?.creditBalance === 49, "Referrer credited ₹49 on first verification");
  assert(refAfterFirst?.timesUsed === 1, "Referrer timesUsed incremented to 1");

  // Call 2: Second verify invocation (idempotency check)
  const verify2Req = new NextRequest("http://localhost:3000/api/checkout/verify", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": buyerIp3,
      "user-agent": ua3,
    },
    body: JSON.stringify({
      slug: refCheckoutData.slug,
      razorpay_order_id: refRzpOrderId,
      razorpay_payment_id: refPaymentId,
      razorpay_signature: refValidSig,
    }),
  });
  const verify2Res = await verifyPOST(verify2Req);
  const verify2Data = await verify2Res.json();
  assert(verify2Res.status === 200 && verify2Data.success === true, "Second verify call returns success (idempotent)");

  const refAfterSecond = await db.referralRecord.findUnique({ where: { code: refCode } });
  assert(
    refAfterSecond?.creditBalance === 49 && refAfterSecond?.timesUsed === 1,
    "Second verify call DOES NOT double-credit referrer (still ₹49, timesUsed: 1)"
  );

  // --------------------------------------------------------------------------
  // 4. Webhook Dual Events (payment.captured + order.paid exactly once credit)
  // --------------------------------------------------------------------------
  console.log("\n[4] Testing Webhook Dual Events (payment.captured + order.paid) Credit Referrer Exactly Once...");
  const webhookRefCode = `WB${Date.now().toString().slice(-6)}`;
  await db.referralRecord.create({
    data: {
      code: webhookRefCode,
      ownerEmail: `webhook_owner_${Date.now()}@example.com`,
      ownerName: "Webhook Referrer",
      creditBalance: 0,
      timesUsed: 0,
    },
  });

  const webhookBuyerEmail = `wbbuyer_${Date.now()}@example.com`;
  const buyerIp4 = `198.51.100.${Math.floor(Math.random() * 150 + 20)}`;
  const ua4 = `TestClientAgent_${Date.now()}_4`;
  const wbCheckoutReq = new NextRequest("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": buyerIp4,
      "user-agent": ua4,
    },
    body: JSON.stringify({
      productType: "PAGE",
      templateId: "forever-valentine",
      customerEmail: webhookBuyerEmail,
      customerName: "Webhook Buyer",
      referralCode: webhookRefCode,
    }),
  });
  const wbCheckoutRes = await checkoutPOST(wbCheckoutReq);
  const wbCheckoutData = await wbCheckoutRes.json();
  const wbOrderId = wbCheckoutData.razorpayOrderId;
  const wbPaymentId = `pay_wb_${Date.now()}`;

  // 4a. Event 1: payment.captured
  const capturedPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      order: { entity: { id: wbOrderId, status: "paid" } },
      payment: { entity: { id: wbPaymentId, order_id: wbOrderId, status: "captured" } },
    },
  });
  const capturedSig = crypto
    .createHmac("sha256", TEST_WEBHOOK_SECRET)
    .update(capturedPayload)
    .digest("hex");

  const capturedReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-razorpay-signature": capturedSig,
      "x-forwarded-for": buyerIp4,
      "user-agent": ua4,
    },
    body: capturedPayload,
  });
  const capturedRes = await webhookPOST(capturedReq);
  assert(capturedRes.status === 200, "Webhook payment.captured returns 200");

  const wbRecordAfter1 = await db.referralRecord.findUnique({ where: { code: webhookRefCode } });
  assert(wbRecordAfter1?.creditBalance === 49, "Webhook payment.captured credits referrer ₹49");

  // 4b. Event 2: order.paid for the same order
  const orderPaidPayload = JSON.stringify({
    event: "order.paid",
    payload: {
      order: { entity: { id: wbOrderId, status: "paid" } },
      payment: { entity: { id: wbPaymentId, order_id: wbOrderId, status: "captured" } },
    },
  });
  const orderPaidSig = crypto
    .createHmac("sha256", TEST_WEBHOOK_SECRET)
    .update(orderPaidPayload)
    .digest("hex");

  const orderPaidReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-razorpay-signature": orderPaidSig,
      "x-forwarded-for": buyerIp4,
      "user-agent": ua4,
    },
    body: orderPaidPayload,
  });
  const orderPaidRes = await webhookPOST(orderPaidReq);
  assert(orderPaidRes.status === 200, "Webhook order.paid returns 200");

  const wbRecordAfter2 = await db.referralRecord.findUnique({ where: { code: webhookRefCode } });
  assert(
    wbRecordAfter2?.creditBalance === 49 && wbRecordAfter2?.timesUsed === 1,
    "payment.captured and order.paid for the same order credit referrer exactly once"
  );

  // --------------------------------------------------------------------------
  // 5. Webhook Signature & Unknown Event Security
  // --------------------------------------------------------------------------
  console.log("\n[5] Testing Webhook Signature Rejection & Unknown Event Handlers...");
  // 5a. Bad signature
  const badSigReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-razorpay-signature": "bad_forged_signature_hex",
    },
    body: orderPaidPayload,
  });
  const badSigRes = await webhookPOST(badSigReq);
  assert(badSigRes.status === 400, "Webhook with invalid signature returns 400");

  // 5b. Missing signature
  const noSigReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: orderPaidPayload,
  });
  const noSigRes = await webhookPOST(noSigReq);
  assert(noSigRes.status === 400, "Webhook without signature header returns 400");

  // 5c. Unknown event with valid signature
  const unknownPayload = JSON.stringify({
    event: "dummy.unrecognized_event_type",
    payload: { something: 123 },
  });
  const unknownSig = crypto
    .createHmac("sha256", TEST_WEBHOOK_SECRET)
    .update(unknownPayload)
    .digest("hex");

  const unknownReq = new NextRequest("http://localhost:3000/api/webhooks/razorpay", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-razorpay-signature": unknownSig,
    },
    body: unknownPayload,
  });
  const unknownRes = await webhookPOST(unknownReq);
  const unknownData = await unknownRes.json();
  assert(unknownRes.status === 200 && unknownData.received === true, "Unknown event returns 200 with no state change");

  // --------------------------------------------------------------------------
  // 6. Pricing Matrix: All Regions, Tiers, Bundles, Referral Credits, 50% Regift
  // --------------------------------------------------------------------------
  console.log("\n[6] Testing calculateOrderTotal across Regions, Tiers, Bundles & Referral Discounts...");
  const regions = ["asia_africa", "americas", "europe", "uk"];

  // 6a. Regional price table check
  for (const reg of regions) {
    const tierConfig = PRICING_TIERS[reg];
    const cardSelf = calculateOrderTotal(reg, "CARD", "SELF_SERVICE", false, false);
    const pageSelf = calculateOrderTotal(reg, "PAGE", "SELF_SERVICE", false, false);
    const customPage = calculateOrderTotal(reg, "PAGE", "CUSTOM", false, false);
    const customCard = calculateOrderTotal(reg, "CARD", "CUSTOM", false, false);
    const rushPage = calculateOrderTotal(reg, "PAGE", "RUSH", false, false);
    const bundleCard = calculateOrderTotal(reg, "CARD", "SELF_SERVICE", true, false);

    assert(cardSelf.totalUnit === tierConfig.cardPriceUnit, `${reg} Card self-service unit price matches config`);
    assert(pageSelf.totalUnit === tierConfig.pagePriceUnit, `${reg} Page self-service unit price matches config`);
    assert(customPage.totalUnit === tierConfig.customPagePriceUnit, `${reg} Custom page unit price matches config`);
    assert(customCard.totalUnit === tierConfig.customCardPriceUnit, `${reg} Custom card unit price matches config`);
    assert(rushPage.totalUnit === tierConfig.rushPagePriceUnit, `${reg} Rush page unit price matches config`);
    assert(bundleCard.totalUnit === tierConfig.cardPriceUnit + tierConfig.bundleAddonUnit, `${reg} Bundle addon adds exactly bundleAddonUnit`);

    // Referral discount on Page
    const refDiscountPage = calculateOrderTotal(reg, "PAGE", "SELF_SERVICE", false, false, { referralDiscount: true });
    assert(
      refDiscountPage.totalUnit === tierConfig.pagePriceUnit - tierConfig.cardPriceUnit,
      `${reg} Referral discount subtracts card tier price unit`
    );
  }

  // 6b. INR Specific Price Table Assertions (₹49, ₹99, ₹499, ₹149, ₹1459, bundle +₹49)
  const inrCard = calculateOrderTotal("asia_africa", "CARD", "SELF_SERVICE");
  const inrPage = calculateOrderTotal("asia_africa", "PAGE", "SELF_SERVICE");
  const inrCustomPage = calculateOrderTotal("asia_africa", "PAGE", "CUSTOM");
  const inrCustomCard = calculateOrderTotal("asia_africa", "CARD", "CUSTOM");
  const inrRushPage = calculateOrderTotal("asia_africa", "PAGE", "RUSH");
  const inrBundle = calculateOrderTotal("asia_africa", "PAGE", "SELF_SERVICE", true);

  assert(inrCard.totalUnit === 4900 && inrCard.displayPrice === 49, "INR Card is ₹49 (4900 paise)");
  assert(inrPage.totalUnit === 9900 && inrPage.displayPrice === 99, "INR Page is ₹99 (9900 paise)");
  assert(inrCustomPage.totalUnit === 49900 && inrCustomPage.displayPrice === 499, "INR Custom Page is ₹499 (49900 paise)");
  assert(inrCustomCard.totalUnit === 14900 && inrCustomCard.displayPrice === 149, "INR Custom Card is ₹149 (14900 paise)");
  assert(inrRushPage.totalUnit === 145900 && inrRushPage.displayPrice === 1459, "INR Rush Page is ₹1,459 (145900 paise)");
  assert(inrBundle.totalUnit === 9900 + 4900, "INR Page + Bundle Addon is ₹148 (₹99 + ₹49)");

  // 6c. USD Equivalents ($2, $5, $25, $8, $75, bundle +$3)
  const usdCard = calculateOrderTotal("americas", "CARD", "SELF_SERVICE");
  const usdPage = calculateOrderTotal("americas", "PAGE", "SELF_SERVICE");
  const usdCustomPage = calculateOrderTotal("americas", "PAGE", "CUSTOM");
  const usdCustomCard = calculateOrderTotal("americas", "CARD", "CUSTOM");
  const usdRushPage = calculateOrderTotal("americas", "PAGE", "RUSH");
  const usdBundle = calculateOrderTotal("americas", "PAGE", "SELF_SERVICE", true);

  assert(usdCard.totalUnit === 200 && usdCard.displayPrice === 2, "USD Card is $2 (200 cents)");
  assert(usdPage.totalUnit === 500 && usdPage.displayPrice === 5, "USD Page is $5 (500 cents)");
  assert(usdCustomPage.totalUnit === 2500 && usdCustomPage.displayPrice === 25, "USD Custom Page is $25 (2500 cents)");
  assert(usdCustomCard.totalUnit === 800 && usdCustomCard.displayPrice === 8, "USD Custom Card is $8 (800 cents)");
  assert(usdRushPage.totalUnit === 7500 && usdRushPage.displayPrice === 75, "USD Rush Page is $75 (7500 cents)");
  assert(usdBundle.totalUnit === 500 + 300, "USD Page + Bundle Addon is $8 ($5 + $3)");

  // 6d. 50% Regift Discount Calculation
  const regiftPage = calculateOrderTotal("asia_africa", "PAGE", "CUSTOM", false, true);
  assert(regiftPage.totalUnit === 24950 && regiftPage.displayPrice === 250, "50% Regift discount halves custom page price");

  // --------------------------------------------------------------------------
  // 7. Production Lock on sim_ Sessions
  // --------------------------------------------------------------------------
  console.log("\n[7] Testing Production Lock on Simulated Sessions in Real Routes...");
  const oldNodeEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";

    // 7a. Real checkout in production mode without live gateway rejects simulation
    const prodCheckoutReq = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productType: "CARD",
        templateId: "forever-valentine",
        customerEmail: `prod_${Date.now()}@test.com`,
        customerName: "Prod Buyer",
      }),
    });
    const prodCheckoutRes = await checkoutPOST(prodCheckoutReq);
    assert(
      prodCheckoutRes.status === 500,
      "POST /api/checkout strictly rejects simulation when NODE_ENV=production"
    );

    // 7b. Real verify GET in production mode rejects sim_ session
    const prodVerifyReq = new NextRequest("http://localhost:3000/api/checkout/verify?session_id=sim_blocked_123", {
      method: "GET",
    });
    const prodVerifyRes = await verifyGET(prodVerifyReq);
    assert(
      prodVerifyRes.status === 403,
      "GET /api/checkout/verify strictly returns 403 for sim_ session when NODE_ENV=production"
    );
  } finally {
    process.env.NODE_ENV = oldNodeEnv;
  }

  // --------------------------------------------------------------------------
  // 8. Razorpay Gateway Error on Non-INR Currency (Clear Error, Server Log, No Silent Switch)
  // --------------------------------------------------------------------------
  console.log("\n[8] Testing Razorpay Gateway Error on Non-INR Currency Preserves Currency & Exposes Clear Error...");
  // Simulate Razorpay gateway error by injecting a temporary rejecting mock on orders.create
  const originalRazorpay = razorpayModule.razorpay;
  try {
    // Force isRazorpayConfigured to true by setting env vars
    process.env.RAZORPAY_KEY_ID = "rzp_test_mock_key_id";
    process.env.RAZORPAY_KEY_SECRET = TEST_SECRET;

    // Mock orders.create to throw international currency error for USD
    razorpayModule.setRazorpayClient({
      orders: {
        create: async () => {
          const err = new Error("International currency USD is not enabled for this account");
          err.statusCode = 400;
          err.error = {
            code: "BAD_REQUEST_ERROR",
            description: "International currency USD is not enabled for this account",
          };
          throw err;
        },
      },
    });

    const currencyReq = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productType: "CARD",
        templateId: "forever-valentine",
        customerEmail: `intl_${Date.now()}@example.com`,
        customerName: "International Buyer",
        currency: "USD",
      }),
    });

    const currencyRes = await checkoutPOST(currencyReq);
    const currencyData = await currencyRes.json();

    assert(currencyRes.status === 400, "Non-INR gateway rejection returns status 400");
    assert(
      currencyData.currency === "USD",
      `Currency is NOT silently switched to INR (remained USD)`
    );
    assert(
      currencyData.code === "BAD_REQUEST_ERROR",
      "Server-side error code BAD_REQUEST_ERROR preserved in response"
    );
    assert(
      currencyData.error.includes("USD: International currency USD is not enabled"),
      "Buyer receives clear descriptive error explaining currency issue"
    );
  } finally {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    razorpayModule.setRazorpayClient(originalRazorpay);
  }

  console.log(`\n=== RAZORPAY TEST SUITE COMPLETE: ${passedAssertions} / ${totalAssertions} assertions green ===\n`);
}

runPaymentIntegrationTests().catch((err) => {
  console.error("Payment integration test suite failed:", err);
  process.exit(1);
});
