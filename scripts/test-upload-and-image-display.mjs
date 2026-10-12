import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";
import assert from "assert";

// If not running under tsx, re-exec via tsx so TypeScript route handlers and @/ imports resolve
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-upload-and-image-display.mjs");
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
const { POST: uploadPOST } = await import("../src/app/api/upload/route");
const { GET: uploadsGET } = await import("../src/app/uploads/[filename]/route");
const { SafeMediaUrlSchema, parseAndValidateScenesJson } = await import("../src/types/scenes");
const { getDefaultScenesForOccasion, syncPhotosToScenes } = await import("../src/lib/scene-defaults");

console.log("================================================================");
console.log("   UPLOAD AND IMAGE DISPLAY VERIFICATION SUITE                  ");
console.log("================================================================\n");

let passed = 0;
let total = 0;

function check(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function checkAsync(desc, fn) {
  total++;
  try {
    await fn();
    console.log(`  PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function run() {
  console.log("[1] Testing SafeMediaUrlSchema & Scenes Zod Validation with /uploads/ paths...");

  check("SafeMediaUrlSchema accepts relative /uploads/ path", () => {
    const res = SafeMediaUrlSchema.safeParse("/uploads/1791823609650-image-test.jpg");
    assert.strictEqual(res.success, true);
  });

  check("SafeMediaUrlSchema accepts full https:// URL", () => {
    const res = SafeMediaUrlSchema.safeParse("https://images.unsplash.com/photo-12345");
    assert.strictEqual(res.success, true);
  });

  check("SafeMediaUrlSchema accepts local blob: URL", () => {
    const res = SafeMediaUrlSchema.safeParse("blob:http://localhost:3000/some-guid");
    assert.strictEqual(res.success, true);
  });

  check("SafeMediaUrlSchema rejects arbitrary non-URL text", () => {
    const res = SafeMediaUrlSchema.safeParse("just-plain-text-not-a-url");
    assert.strictEqual(res.success, false);
  });

  check("parseAndValidateScenesJson accepts scenes containing /uploads/ paths", () => {
    const scenes = getDefaultScenesForOccasion("anniversary");
    const updatedScenes = syncPhotosToScenes(scenes, ["/uploads/my-photo-1.jpg", "/uploads/my-photo-2.jpg"]);
    const jsonStr = JSON.stringify(updatedScenes);
    const parsed = parseAndValidateScenesJson(jsonStr);
    assert.ok(parsed, "Expected parsed scenes to not be null");
    assert.strictEqual(parsed.length, scenes.length);
  });

  console.log("\n[2] Testing syncPhotosToScenes photo propagation...");

  check("syncPhotosToScenes propagates user photos to How We Met scene", () => {
    const scenes = getDefaultScenesForOccasion("anniversary");
    const synced = syncPhotosToScenes(scenes, ["/uploads/romantic-photo.jpg"]);
    const howWeMet = synced.find((s) => s.type === "how_we_met");
    assert.ok(howWeMet, "Expected how_we_met scene to exist");
    assert.strictEqual(howWeMet.photoUrl, "/uploads/romantic-photo.jpg");
  });

  check("syncPhotosToScenes propagates user photos to Timeline events", () => {
    const scenes = getDefaultScenesForOccasion("anniversary");
    const userPhotos = ["/uploads/user-1.jpg", "/uploads/user-2.jpg"];
    const synced = syncPhotosToScenes(scenes, userPhotos);
    const timeline = synced.find((s) => s.type === "timeline");
    assert.ok(timeline, "Expected timeline scene to exist");
    assert.strictEqual(timeline.events[0].photoUrl, "/uploads/user-1.jpg");
    assert.strictEqual(timeline.events[1].photoUrl, "/uploads/user-2.jpg");
  });

  check("syncPhotosToScenes propagates user photos to Memories scene", () => {
    const scenes = getDefaultScenesForOccasion("anniversary");
    const userPhotos = ["/uploads/mem-1.jpg", "/uploads/mem-2.jpg"];
    const synced = syncPhotosToScenes(scenes, userPhotos);
    const memories = synced.find((s) => s.type === "memories");
    assert.ok(memories, "Expected memories scene to exist");
    assert.strictEqual(memories.memories[0].photoUrl, "/uploads/mem-1.jpg");
  });

  console.log("\n[3] Testing upload route handler & dynamic /uploads/ file server...");

  // Generate a valid 1x1 PNG fixture with valid PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  let uploadedFilename = "";

  await checkAsync("POST /api/upload accepts valid PNG and writes to disk", async () => {
    const file = new File([validPngBuffer], "test-avatar.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "image");

    const req = new NextRequest("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await uploadPOST(req);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.url.startsWith("/uploads/"));
    uploadedFilename = data.filename;

    const onDiskPath = path.resolve(process.cwd(), "public", "uploads", uploadedFilename);
    assert.ok(fs.existsSync(onDiskPath), "Uploaded file must exist in public/uploads/");
  });

  await checkAsync("GET /uploads/[filename] serves uploaded file with HTTP 200 and image/png Content-Type", async () => {
    assert.ok(uploadedFilename, "Filename must be present from upload test");
    const req = new NextRequest(`http://localhost:3000/uploads/${uploadedFilename}`, {
      method: "GET",
    });

    const res = await uploadsGET(req, { params: Promise.resolve({ filename: uploadedFilename }) });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "image/png");
    assert.strictEqual(res.headers.get("cache-control"), "public, max-age=31536000, immutable");
    assert.strictEqual(res.headers.get("x-content-type-options"), "nosniff");

    const bodyBuffer = Buffer.from(await res.arrayBuffer());
    assert.strictEqual(bodyBuffer.length, validPngBuffer.length);
  });

  await checkAsync("GET /uploads/[filename] returns 404 for non-existent file", async () => {
    const req = new NextRequest("http://localhost:3000/uploads/non-existent-file-999.jpg", {
      method: "GET",
    });

    const res = await uploadsGET(req, { params: Promise.resolve({ filename: "non-existent-file-999.jpg" }) });
    assert.strictEqual(res.status, 404);
  });

  await checkAsync("GET /uploads/[filename] rejects directory traversal with 403 Forbidden", async () => {
    const req = new NextRequest("http://localhost:3000/uploads/..%2F..%2Fpackage.json", {
      method: "GET",
    });

    const res = await uploadsGET(req, { params: Promise.resolve({ filename: "../../package.json" }) });
    assert.strictEqual(res.status, 403);
  });

  // Clean up test file
  if (uploadedFilename) {
    const p = path.resolve(process.cwd(), "public", "uploads", uploadedFilename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  console.log("\n================================================================");
  console.log(`TOTAL ASSERTIONS: ${total}`);
  console.log(`PASSED ASSERTIONS: ${passed}`);
  console.log("================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("FATAL SUITE ERROR:", e);
  process.exit(1);
});
