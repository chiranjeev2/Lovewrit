import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";

// If not running under tsx, re-exec via tsx
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-error-and-empty-states.mjs");
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

async function runErrorAndEmptyStatesTests() {
  console.log("================================================================");
  console.log("   ERROR BOUNDARIES, NOT-FOUND & EMPTY STATES TEST SUITE        ");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // 1. Root Error Boundary (app/error.tsx)
  // --------------------------------------------------------------------------
  console.log("\n[1] Verifying app/error.tsx...");
  const errorPath = path.resolve(process.cwd(), "src/app/error.tsx");
  assert(fs.existsSync(errorPath), "src/app/error.tsx exists");

  const errorContent = fs.readFileSync(errorPath, "utf-8");
  assert(errorContent.includes('"use client"'), "error.tsx is a client component");
  assert(errorContent.includes("reset"), "error.tsx accepts reset prop for retry affordance");
  assert(!errorContent.includes("error.stack"), "error.tsx never reflects error.stack to UI");
  assert(errorContent.includes("Return to Homepage") || errorContent.includes("Return Home"), "error.tsx provides navigation affordance back home");

  // --------------------------------------------------------------------------
  // 2. Global Error Boundary (app/global-error.tsx)
  // --------------------------------------------------------------------------
  console.log("\n[2] Verifying app/global-error.tsx...");
  const globalErrorPath = path.resolve(process.cwd(), "src/app/global-error.tsx");
  assert(fs.existsSync(globalErrorPath), "src/app/global-error.tsx exists");

  const globalErrorContent = fs.readFileSync(globalErrorPath, "utf-8");
  assert(globalErrorContent.includes('"use client"'), "global-error.tsx is a client component");
  assert(globalErrorContent.includes("<html") && globalErrorContent.includes("<body"), "global-error.tsx renders root html/body shell");
  assert(!globalErrorContent.includes("error.stack"), "global-error.tsx never reflects error.stack");

  // --------------------------------------------------------------------------
  // 3. Not Found Handler (app/not-found.tsx)
  // --------------------------------------------------------------------------
  console.log("\n[3] Verifying app/not-found.tsx...");
  const notFoundPath = path.resolve(process.cwd(), "src/app/not-found.tsx");
  assert(fs.existsSync(notFoundPath), "src/app/not-found.tsx exists");

  const notFoundContent = fs.readFileSync(notFoundPath, "utf-8");
  assert(
    notFoundContent.includes("Gift Not Found or Link Expired") || notFoundContent.includes("Page Not Found"),
    "not-found.tsx displays calm, neutral message"
  );
  assert(
    !notFoundContent.includes("🎉") && !notFoundContent.includes("🥳"),
    "not-found.tsx avoids celebratory emojis to respect memorial/tribute tone"
  );
  assert(notFoundContent.includes("Return to Homepage"), "not-found.tsx provides return home link");
  assert(notFoundContent.includes("Create a New Keepsake"), "not-found.tsx provides create new keepsake link");

  // --------------------------------------------------------------------------
  // 4. Root Loading State (app/loading.tsx)
  // --------------------------------------------------------------------------
  console.log("\n[4] Verifying app/loading.tsx...");
  const loadingPath = path.resolve(process.cwd(), "src/app/loading.tsx");
  assert(fs.existsSync(loadingPath), "src/app/loading.tsx exists");

  const loadingContent = fs.readFileSync(loadingPath, "utf-8");
  assert(loadingContent.includes("Loading Keepsake") || loadingContent.includes("animate-spin"), "loading.tsx provides elegant loading indicator");

  // --------------------------------------------------------------------------
  // 5. PIN Protection & Lockout Edge Case
  // --------------------------------------------------------------------------
  console.log("\n[5] Verifying PIN Lockout & Rate Limit Implementation...");
  const pageViewPath = path.resolve(process.cwd(), "src/app/p/[slug]/page.tsx");
  const pageViewContent = fs.readFileSync(pageViewPath, "utf-8");

  assert(pageViewContent.includes("pinAttempts"), "Page view tracks PIN entry attempts");
  assert(pageViewContent.includes("lockoutTimer"), "Page view implements lockoutTimer");
  assert(pageViewContent.includes("nextAttempts >= 5"), "Page view locks out after 5 consecutive incorrect attempts");
  assert(pageViewContent.includes("disabled={lockoutTimer > 0}"), "Page view disables input and button during lockout");

  const cardViewPath = path.resolve(process.cwd(), "src/app/c/[slug]/page.tsx");
  const cardViewContent = fs.readFileSync(cardViewPath, "utf-8");

  assert(cardViewContent.includes("pinAttempts"), "Card view tracks PIN entry attempts");
  assert(cardViewContent.includes("lockoutTimer"), "Card view implements lockoutTimer");
  assert(cardViewContent.includes("nextAttempts >= 5"), "Card view locks out after 5 consecutive incorrect attempts");
  assert(cardViewContent.includes("disabled={lockoutTimer > 0}"), "Card view disables input and button during lockout");

  // --------------------------------------------------------------------------
  // 6. Scene Engine Reduced-Motion & Error Fallback
  // --------------------------------------------------------------------------
  console.log("\n[6] Verifying Scene Engine Graceful Fallbacks...");
  const sceneContainerPath = path.resolve(process.cwd(), "src/components/scene-engine/SceneContainer.tsx");
  const sceneContainerContent = fs.readFileSync(sceneContainerPath, "utf-8");

  assert(sceneContainerContent.includes("prefers-reduced-motion"), "SceneContainer checks prefers-reduced-motion media query");
  assert(sceneContainerContent.includes("fallbackScrollNode"), "SceneContainer falls back to FallbackStaticScroll on reduced motion");
  assert(sceneContainerContent.includes("<SceneErrorBoundary"), "SceneContainer wraps interactive scenes in SceneErrorBoundary");

  const errorBoundaryPath = path.resolve(process.cwd(), "src/components/scene-engine/SceneErrorBoundary.tsx");
  const errorBoundaryContent = fs.readFileSync(errorBoundaryPath, "utf-8");
  assert(errorBoundaryContent.includes("getDerivedStateFromError"), "SceneErrorBoundary catches scene render exceptions");
  assert(errorBoundaryContent.includes("this.props.fallback"), "SceneErrorBoundary renders fallback on error rather than blank screen");

  // --------------------------------------------------------------------------
  // 7. Audio Autoplay Protection
  // --------------------------------------------------------------------------
  console.log("\n[7] Verifying Audio Autoplay Policy Fallback...");
  assert(sceneContainerContent.includes(".catch("), "SceneContainer handles audio play() rejection gracefully without crashing");

  console.log("\n================================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED ASSERTIONS: ${passedAssertions}`);
  console.log("================================================================\n");

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runErrorAndEmptyStatesTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

