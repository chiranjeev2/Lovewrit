import { execFileSync } from "child_process";
import path from "path";

// If not running under tsx, re-exec via tsx so TypeScript route handlers and @/ imports resolve
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-guestbook-auth.mjs");
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
const { POST: guestbookPOST, GET: guestbookGET, PATCH: guestbookPATCH } = await import("../src/app/api/guestbook/route");
const { POST: adminLoginPOST } = await import("../src/app/api/admin/login/route");
const { generateAdminSessionToken, ADMIN_COOKIE_NAME } = await import("../src/lib/admin-auth");

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

async function runGuestbookAndAdminSecurityTests() {
  console.log("=== RUNNING GUESTBOOK AUTH & ADMIN LOGIN SECURITY TESTS ===");

  const TEST_ADMIN_KEY = "owner_test_secure_passphrase_2026_xYz987";
  process.env.ADMIN_MASTER_KEY = TEST_ADMIN_KEY;

  // --------------------------------------------------------------------------
  // 1. Setup Test Published Page with Guestbook Approval Required
  // --------------------------------------------------------------------------
  console.log("\n[1] Setting Up Test Keepsake Order & Guestbook Target...");
  const testSlug = `gb_${Date.now()}`;
  const hostAdminToken = `token_${Date.now()}_host`;

  const order = await db.order.create({
    data: {
      slug: testSlug,
      adminToken: hostAdminToken,
      customerEmail: `host_${Date.now()}@example.com`,
      customerName: "Host User",
      productType: "PAGE",
      templateId: "forever-valentine",
      tier: "SELF_SERVICE",
      status: "PAID",
      amountTotal: 9900,
      currency: "INR",
      region: "asia_africa",
      pageData: {
        create: {
          senderName: "Host User",
          recipientName: "Beloved",
          occasion: "anniversary",
          letter: "A warm celebration note.",
          photoUrls: JSON.stringify([]),
          requireGuestbookApproval: true, // Requires approval before public display
        },
      },
    },
    include: { pageData: true },
  });

  assert(Boolean(order && order.pageData), "Test order and pageData created successfully");

  // --------------------------------------------------------------------------
  // 2. Public Posting (No Admin Session, No Token Required)
  // --------------------------------------------------------------------------
  console.log("\n[2] Testing Public Guestbook Posting (No Auth Required)...");
  const publicPostReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: testSlug,
      authorName: "Public Guest Priya",
      message: "Sending warmest wishes to you both!",
      attendance: "ATTENDING",
      headcount: 2,
    }),
  });

  const postRes = await guestbookPOST(publicPostReq);
  const postData = await postRes.json();

  assert(postRes.status === 200 && postData.success === true, "Public user posts to guestbook without session (200 OK)");
  assert(postData.isPending === true, "Entry correctly set to PENDING when requireApproval=true");
  const entryId = postData.entry.id;

  // 2b. Public GET only shows APPROVED entries (pending is hidden)
  const publicGetReq = new NextRequest(`http://localhost:3000/api/guestbook?slug=${testSlug}`, {
    method: "GET",
  });
  const getRes = await guestbookGET(publicGetReq);
  const getData = await getRes.json();
  assert(
    getData.entries.length === 0,
    "Public view without host token hides unapproved pending guestbook entries"
  );

  // --------------------------------------------------------------------------
  // 3. Host Moderation via order.adminToken (Without Master Admin Session)
  // --------------------------------------------------------------------------
  console.log("\n[3] Testing Host Approval via order.adminToken (Without Admin Session)...");
  const hostApproveReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      entryId,
      action: "APPROVE",
      token: hostAdminToken, // Host token only, no master admin session
    }),
  });

  const approveRes = await guestbookPATCH(hostApproveReq);
  const approveData = await approveRes.json();

  assert(approveRes.status === 200 && approveData.success === true, "Host approves entry using adminToken without admin session");

  const entryAfterApprove = await db.guestbookEntry.findUnique({ where: { id: entryId } });
  assert(entryAfterApprove?.status === "APPROVED", "Entry status updated to APPROVED");

  // Public GET now shows approved entry
  const publicGetAfterApprove = await guestbookGET(publicGetReq);
  const getDataAfter = await publicGetAfterApprove.json();
  assert(getDataAfter.entries.length === 1, "Public view now includes approved entry");

  // --------------------------------------------------------------------------
  // 4. Unauthorized Moderation Fails Closed
  // --------------------------------------------------------------------------
  console.log("\n[4] Testing Unauthorized Moderation Fails Closed (403)...");
  const unauthApproveReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      entryId,
      action: "DELETE",
      token: "invalid_forged_host_token",
    }),
  });
  const unauthRes = await guestbookPATCH(unauthApproveReq);
  assert(unauthRes.status === 403, "Moderation with invalid token strictly rejected with 403");

  const noTokenReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      entryId,
      action: "DELETE",
    }),
  });
  const noTokenRes = await guestbookPATCH(noTokenReq);
  assert(noTokenRes.status === 403, "Moderation without token or admin session strictly rejected with 403");

  // --------------------------------------------------------------------------
  // 5. Public Flagging (Anyone Can Flag Inappropriate Content)
  // --------------------------------------------------------------------------
  console.log("\n[5] Testing Public Flagging Allowed Without Authentication...");
  const flagReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      entryId,
      action: "FLAG",
    }),
  });
  const flagRes = await guestbookPATCH(flagReq);
  const flagData = await flagRes.json();
  assert(flagRes.status === 200 && flagData.success === true, "Public user can flag entry for moderation (200 OK)");

  const entryAfterFlag = await db.guestbookEntry.findUnique({ where: { id: entryId } });
  assert(entryAfterFlag?.status === "FLAGGED", "Entry status updated to FLAGGED");

  // --------------------------------------------------------------------------
  // 6. Master Admin Session Moderation (Works Without Creator Token)
  // --------------------------------------------------------------------------
  console.log("\n[6] Testing Master Admin Session Moderates Without Creator Token...");
  const adminTokenStr = generateAdminSessionToken();
  const adminDeleteReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      cookie: `${ADMIN_COOKIE_NAME}=${adminTokenStr}`,
    },
    body: JSON.stringify({
      entryId,
      action: "DELETE", // Master admin deletes without token
    }),
  });
  const adminDeleteRes = await guestbookPATCH(adminDeleteReq);
  const adminDeleteData = await adminDeleteRes.json();
  assert(
    adminDeleteRes.status === 200 && adminDeleteData.success === true,
    "Master admin session successfully moderates without creator token"
  );

  const entryAfterDelete = await db.guestbookEntry.findUnique({ where: { id: entryId } });
  assert(entryAfterDelete === null, "Entry deleted from database by master admin");

  // --------------------------------------------------------------------------
  // 7. Admin Login Rate Limiting, Fail-Closed & Leak Protection
  // --------------------------------------------------------------------------
  console.log("\n[7] Testing Admin Login Security: Fail-Closed, Rate Limits & Zero Leaks...");

  // 7a. Fail closed if unconfigured or blacklisted
  const origKey = process.env.ADMIN_MASTER_KEY;
  try {
    process.env.ADMIN_MASTER_KEY = "";
    const unconfiguredReq = new NextRequest("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ masterKey: "some_candidate_key_here" }),
    });
    const unconfiguredRes = await adminLoginPOST(unconfiguredReq);
    assert(
      unconfiguredRes.status === 503,
      "Admin login strictly returns 503 when master key is unconfigured"
    );

    // Short key (<20 chars) rejected fail-closed
    process.env.ADMIN_MASTER_KEY = "short_key_under_20";
    const shortKeyReq = new NextRequest("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ masterKey: "short_key_under_20" }),
    });
    const shortKeyRes = await adminLoginPOST(shortKeyReq);
    assert(
      shortKeyRes.status === 503,
      "Admin login strictly returns 503 when master key is shorter than 20 characters"
    );
  } finally {
    process.env.ADMIN_MASTER_KEY = origKey;
  }

  // 7b. Invalid key returns 401 without key leakage
  const badLoginReq = new NextRequest("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ masterKey: "wrong_test_passphrase_12345" }),
  });
  const badLoginRes = await adminLoginPOST(badLoginReq);
  const badLoginData = await badLoginRes.json();
  assert(badLoginRes.status === 401, "Invalid master key returns 401 Unauthorized");
  assert(
    !JSON.stringify(badLoginData).includes(TEST_ADMIN_KEY),
    "Response body contains zero leaks of server master key"
  );

  // 7c. Rate limiting on repeated failed logins
  const rapidIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;
  let rateLimited = false;
  for (let i = 0; i < 7; i++) {
    const attemptReq = new NextRequest("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": rapidIp,
        "user-agent": `AttackerProbe_${rapidIp}`,
      },
      body: JSON.stringify({ masterKey: `wrong_attempt_${i}_1234567890` }),
    });
    const attemptRes = await adminLoginPOST(attemptReq);
    if (attemptRes.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert(rateLimited, "Repeated failed login attempts trigger 429 Too Many Requests");

  console.log(`\n=== GUESTBOOK AUTH & ADMIN SECURITY COMPLETE: ${passedAssertions} / ${totalAssertions} assertions green ===\n`);
}

runGuestbookAndAdminSecurityTests().catch((err) => {
  console.error("Guestbook & admin security test suite failed:", err);
  process.exit(1);
});
