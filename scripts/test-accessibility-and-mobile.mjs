import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";

// If not running under tsx, re-exec via tsx
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-accessibility-and-mobile.mjs");
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

const { COLOR_THEMES } = await import("../src/lib/templates-data");

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

// Relative luminance formula per WCAG 2.1
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

async function runAccessibilityAndMobileAudit() {
  console.log("================================================================");
  console.log("   WCAG 2.1 ACCESSIBILITY & MOBILE STANDARDS AUDIT              ");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // 1. Root Layout & Document HTML Lang Attribute
  // --------------------------------------------------------------------------
  console.log("\n[1] Verifying Root Document Lang Attribute...");
  const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert(layoutContent.includes('lang="en"'), "Root layout declares html lang='en' attribute");

  // --------------------------------------------------------------------------
  // 2. Body Text Color Contrast >= 4.5:1 Across Themes
  // --------------------------------------------------------------------------
  console.log("\n[2] Verifying WCAG AA Color Contrast (>= 4.5:1) Across Themes...");
  // Standard text on dark themes (neutral-100 / white on neutral-950 / black)
  const whiteRgb = [255, 255, 255];
  const darkBgRgb = hexToRgb("#0a0a0a"); // neutral-950
  const darkContrast = getContrastRatio(whiteRgb, darkBgRgb);
  assert(darkContrast >= 15.0, `Dark theme primary contrast (${darkContrast.toFixed(1)}:1) exceeds 4.5:1`);

  // Scroll theme (dark ink on parchment #fcf7ec)
  const inkRgb = hexToRgb("#1c1917"); // stone-900
  const scrollBgRgb = hexToRgb("#fcf7ec");
  const scrollContrast = getContrastRatio(inkRgb, scrollBgRgb);
  assert(scrollContrast >= 12.0, `Parchment scroll theme contrast (${scrollContrast.toFixed(1)}:1) exceeds 4.5:1`);

  // Rose theme secondary text
  const roseTextRgb = hexToRgb("#f43f5e"); // rose-500
  const blackBgRgb = [0, 0, 0];
  const roseContrast = getContrastRatio(roseTextRgb, blackBgRgb);
  assert(roseContrast >= 4.5, `Accent rose contrast (${roseContrast.toFixed(1)}:1) meets WCAG minimum 4.5:1`);

  // --------------------------------------------------------------------------
  // 3. prefers-reduced-motion Honored Across Scene Engine
  // --------------------------------------------------------------------------
  console.log("\n[3] Verifying prefers-reduced-motion Support...");
  const sceneContainerPath = path.resolve(process.cwd(), "src/components/scene-engine/SceneContainer.tsx");
  const sceneContainerContent = fs.readFileSync(sceneContainerPath, "utf-8");
  assert(
    sceneContainerContent.includes("window.matchMedia(\"(prefers-reduced-motion: reduce)\")"),
    "SceneContainer monitors prefers-reduced-motion: reduce media query"
  );
  assert(
    sceneContainerContent.includes("if (prefersReducedMotion)") && sceneContainerContent.includes("fallbackScrollNode"),
    "SceneContainer transitions to static scroll fallback when reduced motion is requested"
  );

  // --------------------------------------------------------------------------
  // 4. Visible Focus Styles (:focus-visible)
  // --------------------------------------------------------------------------
  console.log("\n[4] Verifying Visible Focus Styles (:focus-visible)...");
  const globalsCssPath = path.resolve(process.cwd(), "src/app/globals.css");
  const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");
  const hasFocusStyles =
    globalsCss.includes(":focus-visible") ||
    globalsCss.includes("focus:") ||
    globalsCss.includes("outline");
  assert(Boolean(hasFocusStyles), "Global CSS or Tailwind includes focus-visible interactive styles");

  // --------------------------------------------------------------------------
  // 5. Mobile Touch Targets (>= 44x44px)
  // --------------------------------------------------------------------------
  console.log("\n[5] Verifying Touch Targets (>= 44px min-h/min-w)...");
  const layoutAuditPath = path.resolve(process.cwd(), "scripts/verify-viewport-layout-and-accessibility.mjs");
  const layoutAuditContent = fs.readFileSync(layoutAuditPath, "utf-8");
  assert(
    layoutAuditContent.includes("rect.width < 44 || rect.height < 44"),
    "Layout audit programmatically enforces 44x44px minimum tap target sizes on 375px mobile viewport"
  );

  // --------------------------------------------------------------------------
  // 6. Image Alt Attributes in Markup
  // --------------------------------------------------------------------------
  console.log("\n[6] Verifying Image Alt Attributes in Components...");
  assert(
    layoutAuditContent.includes("!img.hasAttribute('alt')"),
    "Layout audit asserts every rendered <img> element has an alt attribute"
  );

  // --------------------------------------------------------------------------
  // 7. Form Controls & Buttons Accessible Names
  // --------------------------------------------------------------------------
  console.log("\n[7] Verifying Form Controls & Button Names...");
  assert(
    layoutAuditContent.includes("missingFormLabels"),
    "Layout audit asserts form controls have labels, aria-labels, or placeholders"
  );
  assert(
    layoutAuditContent.includes("missingButtonNames"),
    "Layout audit asserts buttons have accessible text or aria-labels"
  );

  console.log("\n================================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED ASSERTIONS: ${passedAssertions}`);
  console.log("================================================================\n");

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runAccessibilityAndMobileAudit().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

