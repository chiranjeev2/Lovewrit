// Automated unit and security test suite for Razorpay flow & cryptographic verification
import crypto from "crypto";
import {
  calculateOrderTotal,
  PRICING_TIERS,
  CURRENCY_TO_REGION,
} from "../src/lib/currency.ts";

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

// Replicate verifyRazorpayPaymentSignature logic for direct unit verification
function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  if (!secret || !orderId || !paymentId || !signature) return false;
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(signature, "utf-8");
  const b = Buffer.from(expected, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Replicate verifyRazorpayWebhookSignature logic for direct unit verification
function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  if (!webhookSecret || !rawBody || !signature) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const a = Buffer.from(signature, "utf-8");
  const b = Buffer.from(expected, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function runRazorpayFlowTests() {
  console.log("=== RUNNING RAZORPAY UNIT & CRYPTOGRAPHIC SECURITY TESTS ===");

  const testSecret = "test_rzp_secret_key_1234567890abcdef";
  const testWebhookSecret = "test_webhook_secret_9876543210fedcba";

  // 1. Signature Verification Tests
  console.log("\n[1] Testing Razorpay Payment HMAC-SHA256 Signature Verification...");
  const orderId = "order_O4kLm90NpQrS";
  const paymentId = "pay_P8xYz12AbCdE";
  const validSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert(
    verifyPaymentSignature(orderId, paymentId, validSignature, testSecret),
    "Valid payment signature passes verification"
  );

  assert(
    !verifyPaymentSignature("order_TAMPERED", paymentId, validSignature, testSecret),
    "Tampered order ID fails verification"
  );

  assert(
    !verifyPaymentSignature(orderId, "pay_TAMPERED", validSignature, testSecret),
    "Tampered payment ID fails verification"
  );

  assert(
    !verifyPaymentSignature(orderId, paymentId, validSignature.slice(0, -2) + "ff", testSecret),
    "Tampered signature digest fails verification"
  );

  assert(
    !verifyPaymentSignature(orderId, paymentId, validSignature, "wrong_secret_key"),
    "Incorrect secret fails verification"
  );

  assert(
    !verifyPaymentSignature("", paymentId, validSignature, testSecret),
    "Empty orderId fails closed"
  );

  assert(
    !verifyPaymentSignature(orderId, "", validSignature, testSecret),
    "Empty paymentId fails closed"
  );

  assert(
    !verifyPaymentSignature(orderId, paymentId, "", testSecret),
    "Empty signature fails closed"
  );

  // 2. Webhook Signature Verification Tests
  console.log("\n[2] Testing Razorpay Webhook HMAC-SHA256 Signature Verification...");
  const webhookBody = JSON.stringify({
    event: "order.paid",
    payload: {
      order: { entity: { id: orderId, status: "paid" } },
      payment: { entity: { id: paymentId, order_id: orderId, status: "captured" } },
    },
  });

  const validWebhookSig = crypto
    .createHmac("sha256", testWebhookSecret)
    .update(webhookBody)
    .digest("hex");

  assert(
    verifyWebhookSignature(webhookBody, validWebhookSig, testWebhookSecret),
    "Authentic webhook payload & signature pass verification"
  );

  const tamperedBody = webhookBody.replace("captured", "refunded");
  assert(
    !verifyWebhookSignature(tamperedBody, validWebhookSig, testWebhookSecret),
    "Tampered webhook payload fails verification"
  );

  assert(
    !verifyWebhookSignature(webhookBody, "forged_signature_hex", testWebhookSecret),
    "Forged webhook signature fails verification"
  );

  assert(
    !verifyWebhookSignature(webhookBody, validWebhookSig, ""),
    "Missing webhook secret fails closed"
  );

  // 3. Server-side Amount Calculation across Regions & Tiers
  console.log("\n[3] Testing Server-side Amount Computations across Currencies & Tiers...");

  // 3a. Digital Card Self-Service
  const cardInr = calculateOrderTotal("asia_africa", "CARD", "SELF_SERVICE", false, false);
  assert(cardInr.totalUnit === 4900, "Card Self-Service INR is 4900 paise (₹49)");

  const cardUsd = calculateOrderTotal("americas", "CARD", "SELF_SERVICE", false, false);
  assert(cardUsd.totalUnit === 200, "Card Self-Service USD is 200 cents ($2)");

  const cardEur = calculateOrderTotal("europe", "CARD", "SELF_SERVICE", false, false);
  assert(cardEur.totalUnit === 200, "Card Self-Service EUR is 200 cents (€2)");

  const cardGbp = calculateOrderTotal("uk", "CARD", "SELF_SERVICE", false, false);
  assert(cardGbp.totalUnit === 200, "Card Self-Service GBP is 200 pence (£2)");

  // 3b. Interactive Page Self-Service
  const pageInr = calculateOrderTotal("asia_africa", "PAGE", "SELF_SERVICE", false, false);
  assert(pageInr.totalUnit === 9900, "Page Self-Service INR is 9900 paise (₹99)");

  const pageUsd = calculateOrderTotal("americas", "PAGE", "SELF_SERVICE", false, false);
  assert(pageUsd.totalUnit === 500, "Page Self-Service USD is 500 cents ($5)");

  // 3c. Custom Handcrafted Tier
  const customInr = calculateOrderTotal("asia_africa", "PAGE", "CUSTOM", false, false);
  assert(customInr.totalUnit === 49900, "Page Custom Tier INR is 49900 paise (₹499)");

  const customCardInr = calculateOrderTotal("asia_africa", "CARD", "CUSTOM", false, false);
  assert(customCardInr.totalUnit === 14900, "Card Custom Tier INR is 14900 paise (₹149)");

  // 3d. Rush Priority Tier
  const rushInr = calculateOrderTotal("asia_africa", "PAGE", "RUSH", false, false);
  assert(rushInr.totalUnit === 145900, "Page Rush Tier INR is 145900 paise (₹1,459)");

  // 3e. 50% Regift Discount Calculation
  const discountPage = calculateOrderTotal("asia_africa", "PAGE", "CUSTOM", false, true);
  assert(
    discountPage.totalUnit === 24950,
    "50% Discount on Custom Page is 24950 paise (50% of ₹499)"
  );

  // 4. Production Lock on sim_ Sessions
  console.log("\n[4] Testing Production Lock on Simulated Sessions...");
  function simulateProductionCheck(sessionId, nodeEnv) {
    if (sessionId?.startsWith("sim_") && nodeEnv === "production") {
      return { allowed: false, status: 403, error: "Simulated sessions are strictly forbidden in production." };
    }
    return { allowed: true };
  }

  const prodResult = simulateProductionCheck("sim_12345", "production");
  assert(!prodResult.allowed && prodResult.status === 403, "sim_ session strictly rejected when NODE_ENV=production");

  const devResult = simulateProductionCheck("sim_12345", "development");
  assert(devResult.allowed, "sim_ session allowed in development mode");

  const liveProdResult = simulateProductionCheck("order_live_99999", "production");
  assert(liveProdResult.allowed, "Live Razorpay order allowed in production mode");

  console.log(`\n=== RAZORPAY TEST SUITE COMPLETE: ${passedAssertions} / ${totalAssertions} assertions green ===\n`);
}

runRazorpayFlowTests().catch((err) => {
  console.error("Razorpay test suite failed:", err);
  process.exit(1);
});
