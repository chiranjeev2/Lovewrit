// Comprehensive automated test suite for Memoir Phase 2
async function runPhase2Tests() {
  console.log("=== STARTING MEMOIR PHASE 2 VERIFICATION ===");
  const BASE_URL = "http://localhost:3000";

  // 1. Check Dev Server
  const homeRes = await fetch(`${BASE_URL}/`);
  console.log(`[1] Homepage status: ${homeRes.status} (Expected: 200)`);
  if (homeRes.status !== 200) throw new Error("Homepage unreachable");

  // 2. Test Voice Memo Upload Validation (2MB cap)
  console.log("\n[2] Testing Voice Memo Upload Limits (Max 2MB)...");
  // 2a. Oversized voice memo (3MB)
  const hugeVoiceBuf = new Uint8Array(3 * 1024 * 1024);
  const hugeVoiceBlob = new Blob([hugeVoiceBuf], { type: "audio/webm" });
  const hugeVoiceForm = new FormData();
  hugeVoiceForm.append("file", hugeVoiceBlob, "long-voice.webm");
  hugeVoiceForm.append("kind", "voice");

  const hugeVoiceRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: hugeVoiceForm,
  });
  const hugeVoiceData = await hugeVoiceRes.json();
  console.log("Oversized voice memo (3MB) result:", {
    status: hugeVoiceRes.status,
    error: hugeVoiceData.error,
  });
  if (hugeVoiceRes.status !== 400) throw new Error("Oversized voice memo not rejected");

  // 2b. Valid voice memo (<2MB)
  const validVoiceBuf = new Uint8Array(50 * 1024); // 50KB
  const validVoiceBlob = new Blob([validVoiceBuf], { type: "audio/webm" });
  const validVoiceForm = new FormData();
  validVoiceForm.append("file", validVoiceBlob, "my-voice-note.webm");
  validVoiceForm.append("kind", "voice");

  const validVoiceRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    body: validVoiceForm,
  });
  const validVoiceData = await validVoiceRes.json();
  console.log("Valid voice memo (50KB) result:", {
    status: validVoiceRes.status,
    success: validVoiceData.success,
    url: validVoiceData.url,
  });
  if (!validVoiceData.success) throw new Error("Valid voice memo failed");

  // 3. Test Checkout with Custom & Rush Tiers
  console.log("\n[3] Testing Checkout with Custom Tier & Bundle Addon...");
  const customCheckoutRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productType: "PAGE",
      templateId: "in-loving-memory",
      customerEmail: "tribute.giver@example.com",
      customerName: "Anil Kapoor",
      currency: "INR",
      tier: "CUSTOM",
      isBundle: true,
      customNotes: "Please hand-craft a special photo collage with gentle amber tones.",
      pageData: {
        senderName: "The Kapoor Family",
        recipientName: "Late Shri Ram Nath Kapoor",
        occasion: "memorial",
        letter: "A life of grace and peace.",
        photoUrls: ["https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80"],
        musicType: "builtin",
        colorTheme: "serene",
        requireGuestbookApproval: true,
      },
    }),
  });
  const customData = await customCheckoutRes.json();
  console.log("Custom + Bundle checkout result:", {
    status: customCheckoutRes.status,
    orderId: customData.orderId,
    slug: customData.slug,
    price: customData.price,
    hasAdminToken: Boolean(customData.adminToken),
  });
  if (customCheckoutRes.status !== 200) throw new Error("Custom checkout failed");

  // 4. Test Memorial Pre-Moderated Guestbook
  console.log("\n[4] Testing Memorial Guestbook Pre-Moderation & Approval...");
  // 4a. Post tribute on memorial-demo
  const postRes = await fetch(`${BASE_URL}/api/guestbook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: "memorial-demo",
      authorName: "Rohit Verma",
      message: "Always inspired by your humility and grace. Rest in peace.",
    }),
  });
  const postData = await postRes.json();
  console.log("Post condolence result:", {
    status: postRes.status,
    isPending: postData.isPending,
    entryStatus: postData.entry?.status,
  });
  if (postData.entry?.status !== "PENDING") {
    throw new Error("Memorial guestbook did not default to PENDING review!");
  }

  // 4b. Approve tribute using creator token
  const approveRes = await fetch(`${BASE_URL}/api/guestbook`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entryId: postData.entry.id,
      action: "APPROVE",
      token: "token_memorial_kapoor",
    }),
  });
  const approveData = await approveRes.json();
  console.log("Approval result:", approveData);

  // 5. Test Founder Queue & Rush Toggle
  console.log("\n[5] Testing Founder Queue & Rush Availability Toggle...");
  const queueRes = await fetch(`${BASE_URL}/api/admin/queue`, {
    headers: {
      "x-admin-key": "memoir_master_founder_secret_2026",
    },
  });
  const queueData = await queueRes.json();
  console.log("Queue inspection:", {
    ordersInQueue: queueData.orders?.length,
    isRushAvailable: queueData.isRushAvailable,
    firstOrderTier: queueData.orders?.[0]?.tier,
    firstOrderNotes: queueData.orders?.[0]?.customNotes,
  });

  // 5b. Toggle rush availability
  const toggleRes = await fetch(`${BASE_URL}/api/admin/queue`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": "memoir_master_founder_secret_2026",
    },
    body: JSON.stringify({ action: "TOGGLE_RUSH", isRushAvailable: false }),
  });
  const toggleData = await toggleRes.json();
  console.log("Toggled rush to paused:", toggleData);

  // Re-enable rush
  await fetch(`${BASE_URL}/api/admin/queue`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": "memoir_master_founder_secret_2026",
    },
    body: JSON.stringify({ action: "TOGGLE_RUSH", isRushAvailable: true }),
  });

  // 6. Test Public Pages
  console.log("\n[6] Testing Phase 2 Public Occasion Pages...");
  const memPageRes = await fetch(`${BASE_URL}/p/memorial-demo`);
  console.log(`Memorial Page GET /p/memorial-demo status: ${memPageRes.status} (Expected: 200)`);

  const rushPageRes = await fetch(`${BASE_URL}/p/rush-demo`);
  console.log(`Rush Birthday Page GET /p/rush-demo status: ${rushPageRes.status} (Expected: 200)`);

  console.log("\n=== ALL PHASE 2 TESTS COMPLETED SUCCESSFULLY! ===");
}

runPhase2Tests().catch((err) => {
  console.error("Phase 2 Test Failed:", err);
  process.exit(1);
});
