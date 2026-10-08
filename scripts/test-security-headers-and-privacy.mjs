import { execFileSync } from "child_process";
import path from "path";

// If not running under tsx, re-exec via tsx
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-security-headers-and-privacy.mjs");
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

const { default: nextConfig } = await import("../next.config");
const { redactSensitiveData } = await import("../src/lib/logger");
const { sanitizeGuestName } = await import("../src/lib/sanitize");

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

async function runSecurityHeadersAndPrivacyTests() {
  console.log("================================================================");
  console.log("   SECURITY HEADERS, PRIVACY & PII REDACTION SUITE              ");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // 1. Security Headers Configuration Audit
  // --------------------------------------------------------------------------
  console.log("\n[1] Verifying next.config.ts Security Headers...");

  assert(typeof nextConfig.headers === "function", "nextConfig defines custom headers() function");
  const headersList = await nextConfig.headers();
  assert(Array.isArray(headersList) && headersList.length > 0, "headers() returns array of route headers");

  const globalHeaderGroup = headersList.find((h) => h.source === "/:path*");
  assert(Boolean(globalHeaderGroup), "Global header group for '/:path*' is defined");

  const headersMap = new Map();
  for (const h of globalHeaderGroup.headers) {
    headersMap.set(h.key.toLowerCase(), h.value);
  }

  // 1a. X-Content-Type-Options: nosniff
  assert(
    headersMap.get("x-content-type-options") === "nosniff",
    "X-Content-Type-Options is set to 'nosniff'"
  );

  // 1b. Referrer-Policy: strict-origin-when-cross-origin
  assert(
    headersMap.get("referrer-policy") === "strict-origin-when-cross-origin",
    "Referrer-Policy is set to 'strict-origin-when-cross-origin'"
  );

  // 1c. X-Frame-Options: SAMEORIGIN
  assert(
    headersMap.get("x-frame-options") === "SAMEORIGIN",
    "X-Frame-Options is set to 'SAMEORIGIN'"
  );

  // 1d. Permissions-Policy
  const permissionsPolicy = headersMap.get("permissions-policy") || "";
  assert(
    permissionsPolicy.includes("camera=()") && permissionsPolicy.includes("microphone=(self)"),
    "Permissions-Policy restricts camera and scopes microphone to (self)"
  );

  // 1e. Strict-Transport-Security (HSTS)
  const hsts = headersMap.get("strict-transport-security") || "";
  assert(
    hsts.includes("max-age=31536000") && hsts.includes("includeSubDomains"),
    "HSTS is configured with max-age=31536000 and includeSubDomains"
  );

  // 1f. Content-Security-Policy
  const csp = headersMap.get("content-security-policy") || "";
  assert(csp.includes("default-src 'self'"), "CSP specifies default-src 'self'");
  assert(csp.includes("checkout.razorpay.com"), "CSP permits Razorpay checkout domain in script-src / frame-src");
  assert(csp.includes("img-src") && csp.includes("blob:") && csp.includes("data:"), "CSP allows blob: and data: for images and media");
  assert(csp.includes("font-src") && csp.includes("https://fonts.gstatic.com"), "CSP allows fonts domain");
  assert(!csp.includes("'unsafe-eval'"), "Production CSP strictly excludes 'unsafe-eval'");

  // --------------------------------------------------------------------------
  // 2. PII Redaction & Safe Logger Tests
  // --------------------------------------------------------------------------
  console.log("\n[2] Testing PII Redaction Logger Helper...");

  const rawLogWithEmail = "Buyer completed order for customer john.doe@example.com successfully";
  const redactedEmail = redactSensitiveData(rawLogWithEmail);
  assert(!redactedEmail.includes("john.doe@example.com"), "Logger redacts email address from log strings");
  assert(redactedEmail.includes("[REDACTED_EMAIL]"), "Logger substitutes [REDACTED_EMAIL] placeholder");

  const rawLogWithPhone = "Contact phone number provided was +1-555-867-5309 for verification";
  const redactedPhone = redactSensitiveData(rawLogWithPhone);
  assert(!redactedPhone.includes("555-867-5309"), "Logger redacts phone numbers from log strings");
  assert(redactedPhone.includes("[REDACTED_PHONE]"), "Logger substitutes [REDACTED_PHONE] placeholder");

  const rawLogWithToken = "Authorization header received: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
  const redactedToken = redactSensitiveData(rawLogWithToken);
  assert(!redactedToken.includes("eyJhbGciOi"), "Logger redacts Bearer authorization token values");
  assert(redactedToken.includes("Bearer [REDACTED_TOKEN]"), "Logger substitutes Bearer [REDACTED_TOKEN]");

  const rawLogWithSecret = "System initialized with key=super_secret_master_admin_pass_999";
  const redactedSecret = redactSensitiveData(rawLogWithSecret);
  assert(!redactedSecret.includes("super_secret_master_admin_pass_999"), "Logger redacts key/secret parameter values");

  // --------------------------------------------------------------------------
  // 3. Guest Personalization (?guest=) Sanitization & Escaping Tests
  // --------------------------------------------------------------------------
  console.log("\n[3] Testing ?guest= parameter sanitization...");

  const xssGuest = "<script>alert('xss')</script>Aarav";
  const cleanXssGuest = sanitizeGuestName(xssGuest);
  assert(!cleanXssGuest.includes("<script>"), "sanitizeGuestName strips script tags completely");
  assert(cleanXssGuest.includes("Aarav"), "sanitizeGuestName preserves valid name characters");

  const breakoutGuest = `Alice" onclick="alert(1)" '><svg onload=alert(2)>`;
  const cleanBreakoutGuest = sanitizeGuestName(breakoutGuest);
  assert(!cleanBreakoutGuest.includes("<") && !cleanBreakoutGuest.includes(">"), "sanitizeGuestName strips HTML tags and brackets");
  assert(!cleanBreakoutGuest.includes('"') && !cleanBreakoutGuest.includes("'"), "sanitizeGuestName strips quotes to prevent attribute breakout");

  const longGuest = "G".repeat(120);
  const cleanLongGuest = sanitizeGuestName(longGuest, 60);
  assert(cleanLongGuest.length <= 60, "sanitizeGuestName enforces maxLen cap of 60 characters");

  const internationalNames = ["गुरप्रीत सिंह", "आराध्या शर्मा", "فاطمة", "陈静"];
  for (const name of internationalNames) {
    const clean = sanitizeGuestName(name);
    assert(clean.length > 0 && clean === name, `sanitizeGuestName preserves international name '${name}'`);
  }

  console.log("\n================================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED ASSERTIONS: ${passedAssertions}`);
  console.log("================================================================\n");

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runSecurityHeadersAndPrivacyTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
