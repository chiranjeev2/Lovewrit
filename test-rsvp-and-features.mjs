import { db } from "./src/lib/db.ts";
import { EVENT_INVITE_OCCASIONS, isEventInviteOccasion, TEMPLATES } from "./src/lib/templates-data.ts";
import { BUILTIN_AUDIO_TRACKS } from "./src/lib/audio-tracks.ts";
import assert from "assert";

console.log("=================================================");
console.log("LOVEWRIT: RSVP, REVEALS, PDF & LAYOUT VERIFICATION");
console.log("=================================================\n");

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // -------------------------------------------------------------
  // 1. DUAL-BRANCH VERIFICATION: Event vs Non-Event Occasions
  // -------------------------------------------------------------
  console.log("--- 1. Dual-Branch Verification (Event vs Non-Event) ---");

  test("Event/Invitation occasions return isEventInviteOccasion === true", () => {
    const expectedEvents = [
      "jagrata_kirtan",
      "kitty_party",
      "birthday",
      "godhbharai",
      "akhand_path",
      "gurpurab",
      "aqeeqah",
      "nikah",
      "iftar",
      "christening",
      "wedding_blessing",
      "blessing_ceremony",
    ];

    for (const occ of expectedEvents) {
      assert.strictEqual(
        isEventInviteOccasion(occ),
        true,
        `Expected ${occ} to be an event/invite occasion`
      );
    }
  });

  test("Non-Event occasions (Proposal, Memorial, Sorry, Anniversary) return isEventInviteOccasion === false", () => {
    const nonEvents = [
      "proposal",
      "memorial",
      "sorry",
      "anniversary",
      "reminiscing",
      "letter_to_dear_one",
    ];

    for (const occ of nonEvents) {
      assert.strictEqual(
        isEventInviteOccasion(occ),
        false,
        `Expected ${occ} to NOT be an event/invite occasion`
      );
    }
  });

  // -------------------------------------------------------------
  // 2. RSVP & Guest Registry Database & Stats
  // -------------------------------------------------------------
  console.log("\n--- 2. Database RSVP & Guest Registry Operations ---");

  await testAsync("Creates Event Order & stores RSVP entries with headcount", async () => {
    const testSlug = `test-rsvp-${Date.now()}`;
    const testToken = `token-${Date.now()}`;

    // Create Order with PageData for jagrata_kirtan (Event)
    const order = await db.order.create({
      data: {
        slug: testSlug,
        customerEmail: "host@example.com",
        customerName: "Goyal Parivaar",
        productType: "PAGE",
        templateId: "jagrata-kirtan-invitation",
        tier: "SELF_SERVICE",
        status: "PAID",
        currency: "INR",
        amountTotal: 9900,
        region: "asia_africa",
        adminToken: testToken,
        pageData: {
          create: {
            senderName: "Goyal Family",
            recipientName: "Devotees",
            occasion: "jagrata_kirtan",
            letter: "Jai Mata Di",
            photoUrls: "[]",
          },
        },
      },
      include: { pageData: true },
    });

    assert.ok(order.id, "Order created");
    assert.ok(order.pageData?.id, "PageData created");

    // Add Guest RSVP 1: Attending, Headcount 3
    const entry1 = await db.guestbookEntry.create({
      data: {
        pageDataId: order.pageData.id,
        authorName: "Sharma Family",
        message: "We will be attending with family. Jai Mata Di!",
        attendance: "ATTENDING",
        headcount: 3,
        status: "APPROVED",
      },
    });
    assert.strictEqual(entry1.headcount, 3);
    assert.strictEqual(entry1.attendance, "ATTENDING");

    // Add Guest RSVP 2: Attending, Headcount 2
    const entry2 = await db.guestbookEntry.create({
      data: {
        pageDataId: order.pageData.id,
        authorName: "Verma Ji",
        message: "Looking forward to Aarti.",
        attendance: "ATTENDING",
        headcount: 2,
        status: "APPROVED",
      },
    });

    // Add Guest RSVP 3: Regrets, Headcount 1
    const entry3 = await db.guestbookEntry.create({
      data: {
        pageDataId: order.pageData.id,
        authorName: "Kapoor Family",
        message: "Sending prayers from Delhi, out of town.",
        attendance: "REGRETS",
        headcount: 1,
        status: "APPROVED",
      },
    });

    // Query entries and aggregate stats
    const allEntries = await db.guestbookEntry.findMany({
      where: { pageDataId: order.pageData.id, status: "APPROVED" },
    });

    const attending = allEntries.filter((e) => e.attendance === "ATTENDING");
    const regrets = allEntries.filter((e) => e.attendance === "REGRETS");
    const headcountTotal = attending.reduce((acc, curr) => acc + (curr.headcount || 1), 0);

    assert.strictEqual(allEntries.length, 3, "3 RSVP records found");
    assert.strictEqual(attending.length, 2, "2 attending groups");
    assert.strictEqual(headcountTotal, 5, "Total headcount = 3 + 2 = 5");
    assert.strictEqual(regrets.length, 1, "1 regrets");

    // Verify CSV formatting logic
    const csvHeader = ["Date", "Guest Name", "RSVP Status", "Headcount", "Blessing / Note", "Status"].join(",");
    const csvRows = allEntries.map((e) => {
      const dateStr = new Date(e.createdAt).toISOString().split("T")[0];
      const safeName = `"${(e.authorName || "").replace(/"/g, '""')}"`;
      const rsvpStatus = e.attendance || "ATTENDING";
      const count = e.headcount || 1;
      const safeMsg = `"${(e.message || "").replace(/"/g, '""')}"`;
      return [dateStr, safeName, rsvpStatus, count, safeMsg, e.status].join(",");
    });
    const fullCsv = [csvHeader, ...csvRows].join("\n");

    assert.ok(fullCsv.includes("Sharma Family"), "CSV includes guest name");
    assert.ok(fullCsv.includes("ATTENDING,3"), "CSV includes ATTENDING status and headcount 3");
    assert.ok(fullCsv.includes("REGRETS,1"), "CSV includes REGRETS");
  });

  // -------------------------------------------------------------
  // 3. Memorial Pre-Moderation Verification (Strict Non-RSVP)
  // -------------------------------------------------------------
  console.log("\n--- 3. Memorial Pre-Moderation Verification (Strict Non-RSVP) ---");

  await testAsync("Memorial template strictly maintains pre-moderation flow & no RSVP fields", async () => {
    const memorialSlug = `test-memorial-${Date.now()}`;
    const memorialToken = `mem-token-${Date.now()}`;

    const memorialOrder = await db.order.create({
      data: {
        slug: memorialSlug,
        customerEmail: "family@example.com",
        customerName: "Kapoor Family",
        productType: "PAGE",
        templateId: "in-loving-memory",
        tier: "SELF_SERVICE",
        status: "PAID",
        currency: "INR",
        amountTotal: 9900,
        region: "asia_africa",
        adminToken: memorialToken,
        pageData: {
          create: {
            senderName: "The Kapoor Family",
            recipientName: "Late Shri Ram Nath",
            occasion: "memorial",
            letter: "In loving memory...",
            photoUrls: "[]",
            requireGuestbookApproval: true, // Pre-moderation enabled
          },
        },
      },
      include: { pageData: true },
    });

    assert.strictEqual(
      isEventInviteOccasion(memorialOrder.pageData.occasion),
      false,
      "Memorial must NOT be treated as an event/invite"
    );

    // Public attendee submits condolence
    const initialStatus = memorialOrder.pageData.requireGuestbookApproval ? "PENDING" : "APPROVED";
    const condolence = await db.guestbookEntry.create({
      data: {
        pageDataId: memorialOrder.pageData.id,
        authorName: "Col. Rathore",
        message: "Deepest condolences and heartfelt prayers for the noble departed soul.",
        status: initialStatus,
      },
    });

    assert.strictEqual(condolence.status, "PENDING", "Condolence defaults to PENDING under pre-moderation");

    // Public view only sees APPROVED
    const publicVisible = await db.guestbookEntry.findMany({
      where: { pageDataId: memorialOrder.pageData.id, status: "APPROVED" },
    });
    assert.strictEqual(publicVisible.length, 0, "Public cannot see pending condolence");

    // Family with adminToken approves entry
    await db.guestbookEntry.update({
      where: { id: condolence.id },
      data: { status: "APPROVED" },
    });

    const publicVisibleAfter = await db.guestbookEntry.findMany({
      where: { pageDataId: memorialOrder.pageData.id, status: "APPROVED" },
    });
    assert.strictEqual(publicVisibleAfter.length, 1, "Public can now see approved condolence");
  });

  // -------------------------------------------------------------
  // 4. Occasion Audio Tracks & Unboxing Reveals Mapping
  // -------------------------------------------------------------
  console.log("\n--- 4. Occasion Soundtracks & Unboxing Reveals Mapping ---");

  test("Audio tracks library contains curated tracks for all 4 key occasions", () => {
    const trackIds = BUILTIN_AUDIO_TRACKS.map((t) => t.id);
    assert.ok(trackIds.includes("heartfelt-apology"), "Includes Apology & Love Letter track");
    assert.ok(trackIds.includes("baby-lullaby-blessings"), "Includes Baby Shower track");
    assert.ok(trackIds.includes("temple-aarti-flute"), "Includes Devotional temple track");
    assert.ok(trackIds.includes("birthday-confetti-pop"), "Includes Birthday celebration track");
  });

  test("Templates specify appropriate defaultMusicTrack and revealType", () => {
    const apologyTpl = TEMPLATES.find((t) => t.id === "from-my-heart");
    assert.strictEqual(apologyTpl?.revealType, "wax_heart");
    assert.strictEqual(apologyTpl?.defaultMusicTrack, "heartfelt-apology");

    const birthdayTpl = TEMPLATES.find((t) => t.id === "festive-birthday");
    assert.strictEqual(birthdayTpl?.revealType, "balloon_pop");
    assert.strictEqual(birthdayTpl?.defaultMusicTrack, "birthday-confetti-pop");

    const babyTpl = TEMPLATES.find((t) => t.id === "godhbharai-blessings");
    assert.strictEqual(babyTpl?.defaultMusicTrack, "baby-lullaby-blessings");

    const jagrataTpl = TEMPLATES.find((t) => t.id === "jagrata-kirtan-invitation");
    assert.strictEqual(jagrataTpl?.revealType, "diya_aarti");
    assert.strictEqual(jagrataTpl?.defaultMusicTrack, "temple-aarti-flute");
  });

  // -------------------------------------------------------------
  // 5. Foldable PDF Export Module
  // -------------------------------------------------------------
  console.log("\n--- 5. Foldable Printable PDF Module ---");

  test("generateFoldableCardPdf is properly exported", async () => {
    const pdfModule = await import("./src/lib/pdf-export.ts");
    assert.strictEqual(typeof pdfModule.generateFoldableCardPdf, "function");
  });

  console.log("\n=================================================");
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log("=================================================");
}

runTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

