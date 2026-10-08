import { execFileSync } from "child_process";
import path from "path";

// If not running under tsx, re-exec via tsx so TypeScript route handlers and @/ imports resolve
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-public-api-safety.mjs");
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

const { NextRequest } = await import("next/server");
const { db } = await import("../src/lib/db");

// Import route handlers
const { POST: guestbookPOST } = await import("../src/app/api/guestbook/route");
const { POST: reactionsPOST } = await import("../src/app/api/reactions/route");
const { POST: referralPOST, GET: referralGET } = await import("../src/app/api/referral/route");
const { GET: replyVerifyGET } = await import("../src/app/api/reply/verify/route");
const { POST: candlePOST, GET: candleGET } = await import("../src/app/api/tribute/candle/route");
const { POST: uploadPOST } = await import("../src/app/api/upload/route");
const { POST: funnelPOST } = await import("../src/app/api/analytics/funnel/route");
const { GET: adminOrdersGET } = await import("../src/app/api/admin/orders/route");

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedAssertions++;
  console.log(`  PASS: ${message}`);
}

async function runPublicApiSafetyTests() {
  console.log("================================================================");
  console.log("   PUBLIC API SAFETY & HOSTILE INPUT VALIDATION SUITE           ");
  console.log("================================================================\n");

  const testSlug = `safety_${Date.now()}`;
  const testOrder = await db.order.create({
    data: {
      slug: testSlug,
      adminToken: `admin_${Date.now()}`,
      customerEmail: `safety_${Date.now()}@test.com`,
      customerName: "Safety Tester",
      productType: "PAGE",
      templateId: "forever-valentine",
      tier: "SELF_SERVICE",
      status: "PAID",
      amountTotal: 9900,
      currency: "INR",
      region: "asia_africa",
      pageData: {
        create: {
          senderName: "Safety Tester",
          recipientName: "Test Target",
          occasion: "anniversary",
          letter: "Test letter",
          photoUrls: "[]",
          requireGuestbookApproval: false,
        },
      },
    },
    include: { pageData: true },
  });

  // --------------------------------------------------------------------------
  // 1. /api/guestbook Hostile Input Tests
  // --------------------------------------------------------------------------
  console.log("\n[1] Testing /api/guestbook with hostile inputs...");

  // 1a. Malformed JSON payload
  const malformedGbReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{\"slug\": \"test\", \"broken_json: true",
  });
  const malformedGbRes = await guestbookPOST(malformedGbReq);
  const malformedGbData = await malformedGbRes.json();
  assert(malformedGbRes.status === 400, "Guestbook rejects malformed JSON with HTTP 400");
  assert(typeof malformedGbData.error === "string" && !malformedGbData.stack, "Guestbook returns safe error without stack trace");

  // 1b. Oversized declared payload (HTTP 413)
  const oversizedGbReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": String(10 * 1024 * 1024), // 10MB
    },
    body: JSON.stringify({ slug: testSlug, authorName: "Tester", message: "Hi" }),
  });
  const oversizedGbRes = await guestbookPOST(oversizedGbReq);
  assert(oversizedGbRes.status === 413, "Guestbook rejects declared 10MB payload with HTTP 413 Payload Too Large");

  // 1c. Hostile unknown fields injection
  const unknownFieldReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: testSlug,
      authorName: "Valid Name",
      message: "Valid Message",
      __proto__: { admin: true },
      isAdmin: true,
      role: "superuser",
    }),
  });
  const unknownFieldRes = await guestbookPOST(unknownFieldReq);
  assert(unknownFieldRes.status === 400, "Guestbook strictly rejects unknown fields");

  // 1d. Hostile Script Tags & SQL-like strings sanitized safely
  const xssGbReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: testSlug,
      authorName: "<script>alert('xss')</script>John Doe",
      message: "Great work! <script>fetch('http://attacker.com')</script> ' OR 1=1 --",
      attendance: "ATTENDING",
      headcount: 2,
    }),
  });
  const xssGbRes = await guestbookPOST(xssGbReq);
  const xssGbData = await xssGbRes.json();
  assert(xssGbRes.status === 200 && xssGbData.success === true, "Guestbook accepts post with sanitized content");
  assert(!xssGbData.entry.authorName.includes("<script>"), "Author name has script tags stripped");
  assert(!xssGbData.entry.message.includes("<script>"), "Message has script tags stripped");

  // 1e. Excessive author name length cap (> 60 chars)
  const longNameReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: testSlug,
      authorName: "A".repeat(61),
      message: "Valid message",
    }),
  });
  const longNameRes = await guestbookPOST(longNameReq);
  assert(longNameRes.status === 400, "Guestbook rejects author name > 60 chars");

  // 1f. Excessive message length cap (> 1500 chars)
  const longMsgReq = new NextRequest("http://localhost:3000/api/guestbook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: testSlug,
      authorName: "Valid Author",
      message: "M".repeat(1501),
    }),
  });
  const longMsgRes = await guestbookPOST(longMsgReq);
  assert(longMsgRes.status === 400, "Guestbook rejects message > 1500 chars");

  // --------------------------------------------------------------------------
  // 2. /api/reactions Hostile Input Tests
  // --------------------------------------------------------------------------
  console.log("\n[2] Testing /api/reactions with hostile inputs...");

  // 2a. Malformed JSON
  const badJsonReactionReq = new NextRequest("http://localhost:3000/api/reactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{ bad_json ",
  });
  const badJsonReactionRes = await reactionsPOST(badJsonReactionReq);
  assert(badJsonReactionRes.status === 400, "Reactions route rejects malformed JSON with HTTP 400");

  // 2b. Missing target slug & pageDataId
  const noTargetReactionReq = new NextRequest("http://localhost:3000/api/reactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ senderName: "Sender", reactionType: "text" }),
  });
  const noTargetReactionRes = await reactionsPOST(noTargetReactionReq);
  assert(noTargetReactionRes.status === 400, "Reactions route requires target slug or pageDataId");

  // 2c. Non-existent slug returns 404 cleanly
  const missingSlugReq = new NextRequest("http://localhost:3000/api/reactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug: "nonexistent-slug-xyz-999", senderName: "Alice", reactionType: "emoji" }),
  });
  const missingSlugRes = await reactionsPOST(missingSlugReq);
  assert(missingSlugRes.status === 404, "Reactions route returns 404 for unknown slug without crashing");

  // 2d. SQL injection string in sender name handled safely without DB error
  const sqlInjectReactionReq = new NextRequest("http://localhost:3000/api/reactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug: testSlug,
      senderName: "Robert'); DROP TABLE orders;--",
      reactionType: "text",
      message: "Testing SQL injection immunity",
    }),
  });
  const sqlInjectRes = await reactionsPOST(sqlInjectReactionReq);
  const sqlInjectData = await sqlInjectRes.json();
  assert(sqlInjectRes.status === 200 && sqlInjectData.success === true, "SQL injection string safely stored without executing query");

  // --------------------------------------------------------------------------
  // 3. /api/referral Input Safety Tests
  // --------------------------------------------------------------------------
  console.log("\n[3] Testing /api/referral input validation...");

  // 3a. Invalid email format
  const badEmailRefReq = new NextRequest("http://localhost:3000/api/referral", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Referrer Name", email: "not-an-email" }),
  });
  const badEmailRefRes = await referralPOST(badEmailRefReq);
  assert(badEmailRefRes.status === 400, "Referral POST rejects invalid email address");

  // 3b. Name too short (< 2 chars)
  const shortNameRefReq = new NextRequest("http://localhost:3000/api/referral", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "X", email: "valid@example.com" }),
  });
  const shortNameRefRes = await referralPOST(shortNameRefReq);
  assert(shortNameRefRes.status === 400, "Referral POST rejects name shorter than 2 chars");

  // 3c. GET referral with non-existent code returns 404
  const badCodeGetReq = new NextRequest("http://localhost:3000/api/referral?code=DOESNOTEXIST99", {
    method: "GET",
  });
  const badCodeGetRes = await referralGET(badCodeGetReq);
  assert(badCodeGetRes.status === 404, "Referral GET returns 404 for non-existent referral code");

  // --------------------------------------------------------------------------
  // 4. /api/reply/verify Input Safety Tests
  // --------------------------------------------------------------------------
  console.log("\n[4] Testing /api/reply/verify parameter sanitization...");

  // 4a. Path traversal attempt in slug
  const pathTraversalReplyReq = new NextRequest("http://localhost:3000/api/reply/verify?slug=../../etc/passwd", {
    method: "GET",
  });
  const pathTraversalReplyRes = await replyVerifyGET(pathTraversalReplyReq);
  assert(pathTraversalReplyRes.status === 400, "Reply verify rejects path traversal sequence in slug");

  // 4b. XSS script tag in slug
  const xssReplyReq = new NextRequest("http://localhost:3000/api/reply/verify?slug=<script>alert(1)</script>", {
    method: "GET",
  });
  const xssReplyRes = await replyVerifyGET(xssReplyReq);
  assert(xssReplyRes.status === 400, "Reply verify rejects script tags in slug");

  // --------------------------------------------------------------------------
  // 5. /api/tribute/candle Input Safety Tests
  // --------------------------------------------------------------------------
  console.log("\n[5] Testing /api/tribute/candle...");

  // 5a. Missing slug in candle POST
  const noSlugCandleReq = new NextRequest("http://localhost:3000/api/tribute/candle", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  const noSlugCandleRes = await candlePOST(noSlugCandleReq);
  assert(noSlugCandleRes.status === 400, "Candle POST rejects missing slug");

  // 5b. Path traversal in candle GET
  const badCandleGetReq = new NextRequest("http://localhost:3000/api/tribute/candle?slug=../secret", {
    method: "GET",
  });
  const badCandleGetRes = await candleGET(badCandleGetReq);
  assert(badCandleGetRes.status === 400, "Candle GET rejects illegal slug characters");

  // --------------------------------------------------------------------------
  // 6. /api/upload File Sniffing & Path Traversal Tests
  // --------------------------------------------------------------------------
  console.log("\n[6] Testing /api/upload file safety & magic bytes...");

  // 6a. Empty upload (no file)
  const emptyFormData = new FormData();
  const emptyUploadReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    body: emptyFormData,
  });
  const emptyUploadRes = await uploadPOST(emptyUploadReq);
  assert(emptyUploadRes.status === 400, "Upload rejects request with no file attached");

  // 6b. Disguised SVG file upload (prohibited for XSS protection)
  const svgContent = "<svg xmlns='http://www.w3.org/2000/svg'><script>alert('xss')</script></svg>";
  const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
  const svgFormData = new FormData();
  svgFormData.append("file", svgBlob, "vector.svg");
  svgFormData.append("kind", "image");

  const svgUploadReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    body: svgFormData,
  });
  const svgUploadRes = await uploadPOST(svgUploadReq);
  assert(svgUploadRes.status === 400, "Upload strictly rejects SVG / XML script vectors");

  // 6c. Disguised video file renamed to .jpg (magic byte inspection catches it)
  // An MP4 file starts with ftypisom or similar, not JPEG FF D8 FF
  const fakeJpgBuffer = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
  const fakeJpgBlob = new Blob([fakeJpgBuffer], { type: "image/jpeg" });
  const fakeJpgFormData = new FormData();
  fakeJpgFormData.append("file", fakeJpgBlob, "video.jpg");
  fakeJpgFormData.append("kind", "image");

  const fakeJpgReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    body: fakeJpgFormData,
  });
  const fakeJpgRes = await uploadPOST(fakeJpgReq);
  assert(fakeJpgRes.status === 400, "Upload rejects fake image whose magic bytes do not match image signatures");

  // 6d. Real valid PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
    0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54,
    0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
    0x0d, 0x0a, 0x2d, 0xb4,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  const validPngBlob = new Blob([validPngBuffer], { type: "image/png" });
  const validPngFormData = new FormData();
  validPngFormData.append("file", validPngBlob, "valid-avatar.png");
  validPngFormData.append("kind", "image");

  const validPngReq = new NextRequest("http://localhost:3000/api/upload", {
    method: "POST",
    body: validPngFormData,
  });
  const validPngRes = await uploadPOST(validPngReq);
  const validPngData = await validPngRes.json();
  assert(validPngRes.status === 200 && validPngData.success === true, "Upload accepts legitimate PNG verified by magic bytes");
  assert(validPngData.url.startsWith("/uploads/"), "Upload returns safe URL path");

  // --------------------------------------------------------------------------
  // 7. /api/analytics/funnel Validation Tests
  // --------------------------------------------------------------------------
  console.log("\n[7] Testing /api/analytics/funnel validation...");

  const badStepReq = new NextRequest("http://localhost:3000/api/analytics/funnel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step: "arbitrary_attacker_step" }),
  });
  const badStepRes = await funnelPOST(badStepReq);
  assert(badStepRes.status === 400, "Funnel POST rejects invalid step enum values");

  const validStepReq = new NextRequest("http://localhost:3000/api/analytics/funnel", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step: "customizer" }),
  });
  const validStepRes = await funnelPOST(validStepReq);
  const validStepData = await validStepRes.json();
  assert(validStepRes.status === 200 && validStepData.success === true, "Funnel POST accepts valid enum step");

  // --------------------------------------------------------------------------
  // 8. /api/admin/orders Unauthorized Error Safety
  // --------------------------------------------------------------------------
  console.log("\n[8] Testing /api/admin/orders error handling and unauthorized protection...");

  const unauthOrdersReq = new NextRequest("http://localhost:3000/api/admin/orders", {
    method: "GET",
  });
  const unauthOrdersRes = await adminOrdersGET(unauthOrdersReq);
  const unauthOrdersData = await unauthOrdersRes.json();
  assert(unauthOrdersRes.status === 401, "Admin orders returns HTTP 401 when unauthenticated");
  assert(unauthOrdersData.error && unauthOrdersData.error.toLowerCase().includes("unauthorized"), "Admin orders returns clean error message without internal detail");

  // --------------------------------------------------------------------------
  // 9. Rate Limiter Enforcement Verification (429 with Retry-After)
  // --------------------------------------------------------------------------
  console.log("\n[9] Testing rate limiting threshold enforcement...");

  const rateLimitTargetIp = `rate_test_${Date.now()}`;
  let wasRateLimited = false;
  let retryAfterHeader = null;

  // Make rapid referral create calls with same IP to trigger rate limit (limit is 10/min)
  for (let i = 0; i < 15; i++) {
    const rateReq = new NextRequest("http://localhost:3000/api/referral", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cookie": `lovewrit_device_id=${rateLimitTargetIp}`,
      },
      body: JSON.stringify({
        name: `Rate Tester ${i}`,
        email: `ratetest_${Date.now()}_${i}@test.com`,
      }),
    });
    const res = await referralPOST(rateReq);
    if (res.status === 429) {
      wasRateLimited = true;
      retryAfterHeader = res.headers.get("Retry-After");
      break;
    }
  }

  assert(wasRateLimited === true, "Rate limit triggers HTTP 429 when threshold exceeded");
  assert(Boolean(retryAfterHeader), "HTTP 429 response includes Retry-After header");

  console.log("\n================================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED ASSERTIONS: ${passedAssertions}`);
  console.log("================================================================\n");

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runPublicApiSafetyTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

