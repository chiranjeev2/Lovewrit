// Automated test script for Lovewrit New Enhancements
async function runNewEnhancementsTests() {
  console.log("=== STARTING LOVEWRIT NEW ENHANCEMENTS TEST SUITE ===");
  const BASE_URL = "http://localhost:3000";

  // 1. Test Split Pricing & 50% Regift Discount via API
  console.log("\n[1] Testing Split Pricing & 50% Discount on Checkout API...");

  // 1a. Custom Digital Card (Expected in INR: ₹299 = 29900 paise)
  const customCardRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productType: "CARD",
      templateId: "forever-proposal",
      customerEmail: "custom.card@example.com",
      customerName: "Rohan Varma",
      currency: "INR",
      tier: "CUSTOM",
      cardData: {
        senderName: "Rohan",
        recipientName: "Priya",
        occasion: "proposal",
        message: "You have my heart forever",
      },
    }),
  });
  const customCardData = await customCardRes.json();
  console.log("Custom Digital Card Order created:", {
    status: customCardRes.status,
    orderId: customCardData.orderId,
    slug: customCardData.slug,
    price: customCardData.price,
  });

  const cardVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify?slug=${customCardData.slug}`);
  const cardVerify = await cardVerifyRes.json();
  if (cardVerify.order?.amountTotal !== 29900) {
    throw new Error(`Expected Custom Card price 29900 paise, got ${cardVerify.order?.amountTotal}`);
  }

  // 1b. Custom Interactive Page (Expected in INR: ₹1,000 = 100000 paise)
  const customPageRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productType: "PAGE",
      templateId: "forever-proposal",
      customerEmail: "custom.page@example.com",
      customerName: "Rohan Varma",
      currency: "INR",
      tier: "CUSTOM",
      pageData: {
        senderName: "Rohan",
        recipientName: "Priya",
        occasion: "proposal",
        letter: "Forever begins now",
        collageLayout: "timeline",
      },
    }),
  });
  const customPageData = await customPageRes.json();
  console.log("Custom Interactive Page Order created:", {
    status: customPageRes.status,
    orderId: customPageData.orderId,
    slug: customPageData.slug,
    price: customPageData.price,
  });
  const pageVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify?slug=${customPageData.slug}`);
  const pageVerify = await pageVerifyRes.json();
  if (pageVerify.order?.amountTotal !== 100000) {
    throw new Error(`Expected Custom Page price 100000 paise, got ${pageVerify.order?.amountTotal}`);
  }

  // 1c. 50% Regift Discount via Coupon "REGIFT50" on Custom Page (Expected: ₹500 = 50000 paise)
  const regiftRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productType: "PAGE",
      templateId: "forever-proposal",
      customerEmail: "regift.fan@example.com",
      customerName: "Kavya Sharma",
      currency: "INR",
      tier: "CUSTOM",
      couponCode: "REGIFT50",
      pageData: {
        senderName: "Kavya",
        recipientName: "Aman",
        occasion: "anniversary",
        letter: "Happy 5th Anniversary!",
        collageLayout: "filmstrip",
      },
    }),
  });
  const regiftData = await regiftRes.json();
  console.log("50% Regift Discount Order created:", {
    status: regiftRes.status,
    orderId: regiftData.orderId,
    slug: regiftData.slug,
    price: regiftData.price,
  });

  const regiftVerifyRes = await fetch(`${BASE_URL}/api/checkout/verify?slug=${regiftData.slug}`);
  const regiftVerify = await regiftVerifyRes.json();
  if (regiftVerify.order?.amountTotal !== 50000) {
    throw new Error(`Expected 50% discount price 50000 paise, got ${regiftVerify.order?.amountTotal}`);
  }

  // 2. Verify Order and Retrieval of Collage Layout
  console.log("\n[2] Verifying Order Retrieval & collageLayout persistence...");
  const verifyRes = await fetch(`${BASE_URL}/api/checkout/verify?slug=${regiftData.slug}`);
  const verifyData = await verifyRes.json();
  console.log("Order verification result:", {
    status: verifyRes.status,
    orderStatus: verifyData.order?.status,
    productType: verifyData.order?.productType,
    collageLayout: verifyData.order?.pageData?.collageLayout,
  });
  if (verifyData.order?.pageData?.collageLayout !== "filmstrip") {
    throw new Error(`Expected collageLayout 'filmstrip', got ${verifyData.order?.pageData?.collageLayout}`);
  }

  // 3. Test Founder Admin Portal Login with Master Key
  console.log("\n[3] Testing Admin Founder Portal Authentication...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ masterKey: "lovewrit_master_founder_secret_2026" }),
  });
  const adminLoginData = await adminLoginRes.json();
  console.log("Admin Login result:", {
    status: adminLoginRes.status,
    success: adminLoginData.success,
  });
  if (!adminLoginData.success) {
    throw new Error("Founder login with master key failed");
  }

  // 4. Test Success Page & Public Page Rendering
  console.log("\n[4] Testing Success Page and Public Experience rendering...");
  const successPageRes = await fetch(`${BASE_URL}/checkout/success?slug=${regiftData.slug}`);
  console.log(`Success page status: ${successPageRes.status} (Expected: 200)`);
  if (successPageRes.status !== 200) throw new Error("Success page returned non-200");

  const pageViewRes = await fetch(`${BASE_URL}/p/${regiftData.slug}`);
  console.log(`Public Page experience status: ${pageViewRes.status} (Expected: 200)`);
  if (pageViewRes.status !== 200) throw new Error("Public page returned non-200");

  console.log("\n=== ALL LOVEWRIT NEW ENHANCEMENTS VERIFIED SUCCESSFULLY! ===");
}

runNewEnhancementsTests().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
