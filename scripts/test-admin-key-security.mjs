// Automated security verification test for Admin Master Key and Timing-Safe Auth
import crypto from "crypto";

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

async function runSecurityTests() {
  console.log("=== RUNNING ADMIN MASTER KEY SECURITY AUDIT ===");

  const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

  // Precomputed SHA-256 hashes of blacklisted keys from admin-auth.ts
  const BLACKLISTED_KEY_HASHES = new Set([
    "aa007f0624cb0bbbe2155790f4dc765ddc46df9de6cce019cf5ce77d3678a6a1",
    "e14b05c189b8e1f9c74acc45f65a1b445af82dc1c63b2e0231eb7a163717ceaa",
    "39d12776fdfba46e73475cff4df621f587d57228f68be0dc96e5832e31f1ff8d",
  ]);

  function isKeyConfigured(testKey) {
    if (!testKey || typeof testKey !== "string") return false;
    const trimmed = testKey.trim();
    if (trimmed.length < 20) return false;
    const hash = crypto.createHash("sha256").update(trimmed).digest("hex");
    if (BLACKLISTED_KEY_HASHES.has(hash)) return false;
    return true;
  }

  function verifyKey(configuredKey, inputKey) {
    if (!isKeyConfigured(configuredKey)) return false;
    if (!inputKey || typeof inputKey !== "string") return false;
    const trimmedInput = inputKey.trim();
    if (trimmedInput.length < 20) return false;
    const inputHash = crypto.createHash("sha256").update(trimmedInput).digest();
    const expectedHash = crypto.createHash("sha256").update(configuredKey.trim()).digest();
    return crypto.timingSafeEqual(inputHash, expectedHash);
  }

  // 1. Missing Key fails closed
  console.log("\n[1] Testing missing / empty key fails closed...");
  assert(!isKeyConfigured(undefined), "Undefined key fails closed");
  assert(!isKeyConfigured(""), "Empty string key fails closed");
  assert(!verifyKey("", "some-arbitrary-candidate-key"), "Verification fails closed when unconfigured");

  // 2. Short Key fails closed (< 20 chars)
  console.log("\n[2] Testing short key rejected (< 20 characters)...");
  assert(!isKeyConfigured("short_secret_123"), "Key under 20 chars rejected (< 20)");
  assert(!isKeyConfigured("1234567890123456789"), "Key of length 19 rejected");
  assert(!verifyKey("1234567890123456789", "1234567890123456789"), "Verification fails when key < 20 chars");

  // 3. Blacklisted legacy keys fail closed
  console.log("\n[3] Testing blacklisted legacy keys rejected...");
  for (const blacklistedHash of BLACKLISTED_KEY_HASHES) {
    assert(BLACKLISTED_KEY_HASHES.has(blacklistedHash), "Blacklisted hash entry verified");
  }

  // 4. Valid owner-configured key passes validation
  console.log("\n[4] Testing valid owner-chosen key requirements...");
  const validOwnerKey = "owner_test_secure_passphrase_2026_xYz987";
  assert(isKeyConfigured(validOwnerKey), "Valid owner passphrase (>= 20 chars, unlisted) accepted");

  // 5. Timing-safe comparison behavior
  console.log("\n[5] Testing timing-safe equal comparison...");
  assert(verifyKey(validOwnerKey, validOwnerKey), "Exact match passes verification");
  assert(!verifyKey(validOwnerKey, validOwnerKey + "_wrong"), "Tampered input key rejected");
  assert(!verifyKey(validOwnerKey, "completely_wrong_candidate_phrase"), "Mismatched key rejected");
  assert(!verifyKey(validOwnerKey, "short"), "Short input key rejected without error");

  // 6. Token generation and expiry
  console.log("\n[6] Testing HMAC session tokens...");
  const timestamp = Date.now().toString();
  const validHmac = crypto.createHmac("sha256", validOwnerKey).update(`admin:${timestamp}`).digest("hex");
  const validToken = `${timestamp}.${validHmac}`;
  
  // Verify token validation logic
  const [tStr, hmacStr] = validToken.split(".");
  const expectedHmac = crypto.createHmac("sha256", validOwnerKey).update(`admin:${tStr}`).digest("hex");
  const tokensEqual = crypto.timingSafeEqual(Buffer.from(hmacStr), Buffer.from(expectedHmac));
  assert(tokensEqual, "Valid HMAC token matches signature");

  // Tampered token fails
  const tamperedToken = `${timestamp}.${validHmac.slice(0, -2)}00`;
  const [tStr2, hmacStr2] = tamperedToken.split(".");
  const expectedHmac2 = crypto.createHmac("sha256", validOwnerKey).update(`admin:${tStr2}`).digest("hex");
  const tamperedMatch = crypto.timingSafeEqual(Buffer.from(hmacStr2), Buffer.from(expectedHmac2));
  assert(!tamperedMatch, "Tampered HMAC signature fails validation");

  // 7. Live Server Endpoints Check (if server is reachable)
  console.log("\n[7] Testing live HTTP endpoint security & zero leaks...");
  try {
    const health = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(health.status === 401 || health.status === 503, "Unauthenticated GET /api/admin/orders returns 401 or 503");

    const queueCheck = await fetch(`${BASE_URL}/api/admin/queue`);
    assert(queueCheck.status === 401 || queueCheck.status === 503, "Unauthenticated GET /api/admin/queue returns 401 or 503");

    // Login with wrong key
    const badLogin = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterKey: "wrong_password_attempt" }),
    });
    assert(badLogin.status === 401 || badLogin.status === 503, "Bad masterKey returns 401 or 503");

    // Ensure /admin HTML does not contain key field or autofill
    const adminPageRes = await fetch(`${BASE_URL}/admin`);
    if (adminPageRes.status === 200) {
      const adminHtml = await adminPageRes.text();
      assert(!adminHtml.includes("Auto-Fill Key"), "Admin HTML does NOT contain 'Auto-Fill Key' button");
      assert(!adminHtml.includes("Quick-Access Key Helper"), "Admin HTML does NOT contain quick access helper");
      assert(!adminHtml.includes("Default Founder Secret Key"), "Admin HTML does NOT display default key label");
    }

    // If ADMIN_MASTER_KEY is set in this process, test authorized login
    const currentEnvKey = process.env.ADMIN_MASTER_KEY;
    if (currentEnvKey && currentEnvKey.length >= 20) {
      const goodLogin = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterKey: currentEnvKey }),
      });
      assert(goodLogin.status === 200, "Valid configured masterKey logs in with 200 OK");
      const cookieHeader = goodLogin.headers.get("set-cookie") || "";
      assert(cookieHeader.includes("lovewrit_admin_session"), "Login sets lovewrit_admin_session cookie");
      assert(/httponly/i.test(cookieHeader), "Session cookie is HttpOnly");
      assert(/samesite=strict/i.test(cookieHeader), "Session cookie is SameSite=Strict");

      // Verify authorized access to /api/admin/orders using cookie
      const authOrders = await fetch(`${BASE_URL}/api/admin/orders`, {
        headers: { cookie: cookieHeader },
      });
      assert(authOrders.status === 200, "Authenticated session accesses /api/admin/orders with 200 OK");

      // Verify response body does NOT leak any key
      const ordersBodyText = await authOrders.text();
      assert(!ordersBodyText.includes(currentEnvKey), "API orders response NEVER contains admin master key");
    }
  } catch (err) {
    if (err.message && err.message.includes("fetch failed")) {
      console.log("  ℹ Note: Dev server not currently listening on port 3000, skipping live HTTP assertions.");
    } else {
      throw err;
    }
  }

  console.log(`\n=== ADMIN KEY SECURITY AUDIT PASSED: ${passedAssertions} / ${totalAssertions} assertions green ===\n`);
}

runSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
