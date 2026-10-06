// Automated security test: Scan for client secret leaks and ensure RAZORPAY_KEY_SECRET is server-only
import fs from "fs";
import path from "path";

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

async function runLeakScan() {
  console.log("=== RUNNING CLIENT SECRET LEAK SCAN AUDIT ===");

  // 1. Verify NEXT_PUBLIC_ env vars do not expose secrets
  console.log("\n[1] Auditing NEXT_PUBLIC_ environment variables...");
  const envKeys = Object.keys(process.env);
  const leakedNextPublic = envKeys.filter(
    (k) =>
      k.startsWith("NEXT_PUBLIC_") &&
      (k.includes("SECRET") || k.includes("PRIVATE") || k.includes("PASSWORD"))
  );
  assert(
    leakedNextPublic.length === 0,
    `Zero secret keys exposed under NEXT_PUBLIC_ prefix (found: ${leakedNextPublic.join(", ") || "none"})`
  );

  // 2. Verify .env.example does not expose real API secrets
  console.log("\n[2] Auditing .env.example...");
  const envExamplePath = path.resolve(".env.example");
  if (fs.existsSync(envExamplePath)) {
    const envExample = fs.readFileSync(envExamplePath, "utf-8");
    assert(
      !envExample.includes("rzp_live_") && !envExample.includes("rzp_test_secret"),
      ".env.example contains no real Razorpay live/test secrets"
    );
    assert(
      !envExample.includes("sk_live_") && !envExample.includes("sk_test_secret"),
      ".env.example contains no active payment gateway secret keys"
    );
  }

  // 3. Scan src/ directory for any accidental hardcoded secrets
  console.log("\n[3] Scanning src/ source files for hardcoded secrets...");
  const srcDir = path.resolve("src");
  let foundSecretLeak = false;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") ||
          entry.name.endsWith(".tsx") ||
          entry.name.endsWith(".js") ||
          entry.name.endsWith(".jsx"))
      ) {
        const content = fs.readFileSync(fullPath, "utf-8");
        // Look for suspicious patterns
        if (content.includes("RAZORPAY_KEY_SECRET=") || content.includes("rzp_live_secret")) {
          console.error(`Suspicious secret found in ${fullPath}`);
          foundSecretLeak = true;
        }
      }
    }
  }

  scanDir(srcDir);
  assert(!foundSecretLeak, "Zero hardcoded secret credentials found in src/ codebase");

  // 4. Verify checkout API response schema never includes keySecret
  console.log("\n[4] Checking /api/checkout response contract...");
  const checkoutRoutePath = path.resolve("src/app/api/checkout/route.ts");
  const checkoutContent = fs.readFileSync(checkoutRoutePath, "utf-8");
  assert(
    !checkoutContent.includes("keySecret") && !checkoutContent.includes("RAZORPAY_KEY_SECRET"),
    "/api/checkout response payload never references RAZORPAY_KEY_SECRET"
  );

  console.log(`\n=== LEAK SCAN COMPLETE: ${passedAssertions} / ${totalAssertions} assertions green ===\n`);
}

runLeakScan().catch((err) => {
  console.error("Leak scan failed:", err);
  process.exit(1);
});
