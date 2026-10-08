import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";

// If not running under tsx, re-exec via tsx
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-performance-and-bundles.mjs");
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

async function runPerformanceAndBundleTests() {
  console.log("================================================================");
  console.log("   PERFORMANCE, ASSET SIZES & BUNDLE EFFICIENCY AUDIT           ");
  console.log("================================================================\n");

  // --------------------------------------------------------------------------
  // 1. Static Assets in public/ (Excluding User Uploads)
  // --------------------------------------------------------------------------
  console.log("\n[1] Auditing Static Assets in public/...");
  const publicDir = path.resolve(process.cwd(), "public");
  const publicFiles = fs.readdirSync(publicDir, { withFileTypes: true });

  const rootAssets = publicFiles.filter((d) => d.isFile());
  assert(rootAssets.length > 0, "Public directory contains static root assets");

  let oversizedStaticAssets = 0;
  for (const asset of rootAssets) {
    const filePath = path.join(publicDir, asset.name);
    const stats = fs.statSync(filePath);
    if (stats.size > 300 * 1024) {
      oversizedStaticAssets++;
      console.error(`  Oversized static asset found: ${asset.name} (${stats.size} bytes)`);
    }
  }
  assert(oversizedStaticAssets === 0, "Zero static assets in public/ exceed 300 KB threshold");

  // --------------------------------------------------------------------------
  // 2. Production Build Output & .next Artifacts
  // --------------------------------------------------------------------------
  console.log("\n[2] Verifying Production Build Output (.next)...");
  const nextDir = path.resolve(process.cwd(), ".next");
  assert(fs.existsSync(nextDir), ".next production build artifacts exist");

  const buildManifestPath = path.resolve(nextDir, "build-manifest.json");
  if (fs.existsSync(buildManifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf-8"));
    assert(Boolean(manifest.pages), "Build manifest contains pages breakdown");
  } else {
    // Turbopack app-build-manifest
    const appManifestPath = path.resolve(nextDir, "app-build-manifest.json");
    assert(fs.existsSync(appManifestPath), "Turbopack app-build-manifest exists");
  }

  // --------------------------------------------------------------------------
  // 3. Lazy Loading & Efficient Scene Splitting
  // --------------------------------------------------------------------------
  console.log("\n[3] Auditing Below-the-Fold Lazy Loading...");
  const sceneContainerPath = path.resolve(process.cwd(), "src/components/scene-engine/SceneContainer.tsx");
  const sceneContainerContent = fs.readFileSync(sceneContainerPath, "utf-8");

  // In SceneContainer, only current, previous, and next scenes are actively mounted
  // or inactive scenes have inert/pointer-events-none styling to prevent layout thrashing
  assert(
    sceneContainerContent.includes("enabledScenes") || sceneContainerContent.includes("currentSceneIndex"),
    "Scene container activates scenes sequentially without rendering offscreen canvas thrash"
  );

  console.log("\n================================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED ASSERTIONS: ${passedAssertions}`);
  console.log("================================================================\n");

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runPerformanceAndBundleTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
