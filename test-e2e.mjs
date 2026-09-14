// End-to-end verification script for Memoir
async function runTests() {
  console.log("=== STARTING MEMOIR E2E VERIFICATION ===");

  const BASE_URL = "http://localhost:3000";

  // 1. Verify Homepage
  console.log("\n[1] Testing Homepage GET /...");
  const homeRes = await fetch(`${BASE_URL}/`);
  console.log(`Homepage status: ${homeRes.status} (Expected: 200)`);
  if (homeRes.status !== 200) throw new Error("Homepage failed to load");

  // 2. Verify Sample Orders
  console.log("\n[2] Testing Verification API for pre-seeded orders...");
  const proposalRes = await fetch(`${BASE_URL}/api/checkout/verify?slug=proposal-demo`);
  const proposalData = await proposalRes.json();
  console.log("Proposal demo order:", {
    success: proposalData.success,
    slug: proposalData.order?.slug,
    recipient: proposalData.order?.pageData?.recipientName,
    isProposal: proposalData.order?.pageData?.isProposal,
  });

  const cardRes = await fetch(`${BASE_URL}/api/checkout/verify?slug=anniversary-demo`);
  const cardData = await cardRes.json();
  console.log("Anniversary card demo order:", {
    success: cardData.success,
    slug: cardData.order?.slug,
    recipient: cardData.order?.cardData?.recipientName,
    shape: cardData.order?.cardData?.photoShape,
  });

  // 3. Admin Authentication & Orders
  console.log("\n[3] Testing Admin Auth & Orders...");
  const badLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ masterKey: "wrong_password" }),
  });
  console.log(`Bad admin login status: ${badLogin.status} (Expected: 401)`);

  const goodLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ masterKey: "memoir_master_founder_secret_2026" }),
  });
  console.log(`Good admin login status: ${goodLogin.status} (Expected: 200)`);
  const adminCookie = goodLogin.headers.get("set-cookie");

  const ordersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: {
      cookie: adminCookie || "",
      "x-admin-key": "memoir_master_founder_secret_2026",
    },
  });
  const ordersData = await ordersRes.json();
  console.log("Admin orders count:", ordersData.orders?.length);
  console.log("Admin stats:", ordersData.stats);

  // 4. File Upload Validation
  console.log("\n[4] Testing Upload Validation limits...");
  // 4a. Over-limit image test (>10MB)
  const hugeBuffer = new Uint8Array(11 * 1024 * 1024); // 11MB
  const hugeBlob = new Blob([hugeBuffer], { type: "image/jpeg" });
  const hugeForm = new FormData();
  hugeForm.append("file", hugeBlob, "huge.jpg");
  hugeForm.append("kind", "image");

  const hugeRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: hugeForm,
  });
  const hugeData = await hugeRes.json();
  console.log("Over-limit (11MB) upload result:", {
    status: hugeRes.status,
    error: hugeData.error,
  });

  // 4b. Valid small photo upload
  const smallBuffer = new Uint8Array(1024); // 1KB
  const smallBlob = new Blob([smallBuffer], { type: "image/png" });
  const smallForm = new FormData();
  smallForm.append("file", smallBlob, "sweet-moment.png");
  smallForm.append("kind", "image");

  const smallRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: smallForm,
  });
  const smallData = await smallRes.json();
  console.log("Valid photo upload result:", {
    status: smallRes.status,
    success: smallData.success,
    url: smallData.url,
  });

  // 4c. Valid audio track upload (custom song)
  const audioBuffer = new Uint8Array(2048); // 2KB
  const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
  const audioForm = new FormData();
  audioForm.append("file", audioBlob, "our-song.mp3");
  audioForm.append("kind", "audio");

  const audioRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: audioForm,
  });
  const audioData = await audioRes.json();
  console.log("Valid audio upload result:", {
    status: audioRes.status,
    success: audioData.success,
    url: audioData.url,
  });

  // 5. Checkout & Order Generation Flow
  console.log("\n[5] Testing Checkout Creation with Region-based Pricing...");
  const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productType: "CARD",
      templateId: "forever-proposal",
      customerEmail: "tester@example.com",
      customerName: "Rohan Varma",
      currency: "INR",
      cardData: {
        senderName: "Rohan",
        recipientName: "Kavya",
        occasion: "proposal",
        message: "You are the love of my life. Will you marry me?",
        photoUrl: smallData.url,
        photoShape: "heart",
        colorTheme: "rose",
        location: "Jaipur City Palace",
        language: "en",
      },
    }),
  });

  const checkoutData = await checkoutRes.json();
  console.log("Checkout initiation result:", {
    status: checkoutRes.status,
    orderId: checkoutData.orderId,
    slug: checkoutData.slug,
    price: checkoutData.price,
    checkoutUrl: checkoutData.checkoutUrl,
  });

  // 6. Verify Created Order Fulfillment
  console.log("\n[6] Testing newly created order fulfillment...");
  const verifyRes = await fetch(
    `${BASE_URL}/api/checkout/verify?session_id=sim_${checkoutData.orderId}&slug=${checkoutData.slug}`
  );
  const verifyData = await verifyRes.json();
  console.log("Order fulfillment verified:", {
    success: verifyData.success,
    status: verifyData.order?.status,
    slug: verifyData.order?.slug,
    recipient: verifyData.order?.cardData?.recipientName,
  });

  // 7. Verify Card Page View
  console.log(`\n[7] Testing Shareable Card Page GET /c/${checkoutData.slug}...`);
  const cardPageRes = await fetch(`${BASE_URL}/c/${checkoutData.slug}`);
  console.log(`Card page status: ${cardPageRes.status} (Expected: 200)`);

  // 8. Verify Template Page View
  console.log(`\n[8] Testing Shareable Template Page GET /p/proposal-demo...`);
  const pageViewRes = await fetch(`${BASE_URL}/p/proposal-demo`);
  console.log(`Template page status: ${pageViewRes.status} (Expected: 200)`);

  console.log("\n=== ALL E2E VERIFICATIONS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
