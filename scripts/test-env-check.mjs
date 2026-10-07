import { execFileSync } from "child_process";
import path from "path";

// If not running under tsx, re-exec via tsx so TypeScript imports resolve
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-env-check.mjs");
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

const { validateEnv, REQUIRED_PRODUCTION_VARS } = await import("../src/lib/env-check");

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

async function runEnvCheckTests() {
  console.log("=== RUNNING STARTUP ENVIRONMENT VARIABLE SECURITY TESTS ===");

  // 1. Required Variables List Integrity
  console.log("\n[1] Testing Required Production Variables List...");
  const expectedVars = [
    "DATABASE_URL",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "NEXT_PUBLIC_RAZORPAY_KEY_ID",
    "ADMIN_MASTER_KEY",
    "ADMIN_SESSION_SECRET",
  ];
  for (const v of expectedVars) {
    assert(REQUIRED_PRODUCTION_VARS.includes(v), `Required production variable list includes ${v}`);
  }

  // 2. Production Mode Passes When Fully Configured
  console.log("\n[2] Testing Production Validation When Fully Configured...");
  const fullMockProdEnv = {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://user:pass@localhost:5432/mydb",
    RAZORPAY_KEY_ID: "rzp_live_test_key",
    RAZORPAY_KEY_SECRET: "mock_secret_key_123456",
    RAZORPAY_WEBHOOK_SECRET: "mock_webhook_secret_789",
    NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_live_test_key",
    ADMIN_MASTER_KEY: "owner_passphrase_min_20_chars_long",
    ADMIN_SESSION_SECRET: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
  };

  const fullResult = validateEnv(fullMockProdEnv);
  assert(fullResult.valid === true, "Validation passes with valid=true in production when all secrets present");
  assert(fullResult.missing.length === 0, "Zero missing variables reported");

  // 3. Production Mode Fails Closed Listing Variable Names Only
  console.log("\n[3] Testing Production Mode Fails Closed with Missing Variables...");
  const incompleteProdEnv = {
    NODE_ENV: "production",
    DATABASE_URL: "postgresql://user:pass@localhost:5432/mydb",
    // Missing Razorpay & Admin secrets
  };

  let threwError = false;
  let thrownMessage = "";
  try {
    validateEnv(incompleteProdEnv);
  } catch (err) {
    threwError = true;
    thrownMessage = err.message;
  }

  assert(threwError, "validateEnv strictly throws in production when variables are missing");
  assert(thrownMessage.includes("RAZORPAY_KEY_ID"), "Error message lists missing variable NAME RAZORPAY_KEY_ID");
  assert(thrownMessage.includes("ADMIN_MASTER_KEY"), "Error message lists missing variable NAME ADMIN_MASTER_KEY");
  assert(thrownMessage.includes("ADMIN_SESSION_SECRET"), "Error message lists missing variable NAME ADMIN_SESSION_SECRET");
  assert(!thrownMessage.includes("postgresql://"), "Error message contains zero values/connection string leaks");

  // 4. Non-Production Mode (Dev/QA) Warns But Does Not Throw
  console.log("\n[4] Testing Non-Production Mode Warns Without Crashing...");
  const devEnv = {
    NODE_ENV: "development",
    // All variables missing
  };

  let devThrew = false;
  let devResult;
  try {
    devResult = validateEnv(devEnv);
  } catch {
    devThrew = true;
  }

  assert(!devThrew, "validateEnv does not throw in development mode");
  assert(devResult && devResult.valid === false, "Returns valid=false indicating incomplete config");
  assert(devResult && devResult.missing.length === REQUIRED_PRODUCTION_VARS.length, "All missing variables identified");

  console.log(`\n=== ENV CHECK TEST SUITE COMPLETE: ${passedAssertions} / ${totalAssertions} assertions green ===\n`);
}

runEnvCheckTests().catch((err) => {
  console.error("Env check test suite failed:", err);
  process.exit(1);
});

