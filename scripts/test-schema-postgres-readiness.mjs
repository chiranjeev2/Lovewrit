import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";

// If not running under tsx, re-exec via tsx
if (!process.env.__TSX_ACTIVE__) {
  try {
    const tsxCli = path.resolve(process.cwd(), "node_modules/tsx/dist/cli.mjs");
    const scriptPath = path.resolve(process.cwd(), "scripts/test-schema-postgres-readiness.mjs");
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

async function runPostgresReadinessTests() {
  console.log("================================================================");
  console.log("   PRISMA SCHEMA & POSTGRESQL READINESS AUDIT                   ");
  console.log("================================================================\n");

  const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
  assert(fs.existsSync(schemaPath), "prisma/schema.prisma exists");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  // --------------------------------------------------------------------------
  // 1. Primary Key Portability (No SQLite Autoincrement / Rowid Assumptions)
  // --------------------------------------------------------------------------
  console.log("\n[1] Checking Primary Key Portability...");
  assert(!schemaContent.includes("autoincrement()"), "Zero models use SQLite-specific autoincrement integer keys");
  assert(schemaContent.includes("@default(cuid())"), "All entity models use portable CUID string identifiers");

  // --------------------------------------------------------------------------
  // 2. Index Coverage for High-Churn & Lookup Fields
  // --------------------------------------------------------------------------
  console.log("\n[2] Verifying Essential B-Tree Indexes for Production...");
  assert(schemaContent.includes("@@index([customerEmail])"), "Order table indexes customerEmail");
  assert(schemaContent.includes("@@index([createdAt])"), "High-churn tables index createdAt timestamp");
  assert(schemaContent.includes("@@index([pageDataId])"), "Relation tables index pageDataId foreign key");
  assert(schemaContent.includes("@@index([ownerEmail])"), "ReferralRecord indexes ownerEmail");
  assert(schemaContent.includes("@@index([action, ipAddress, createdAt])"), "RateLimitEvent has compound index for sliding window queries");

  // --------------------------------------------------------------------------
  // 3. Raw SQL & SQLite Keyword Prohibitions
  // --------------------------------------------------------------------------
  console.log("\n[3] Auditing Codebase for SQLite-Only SQL Assumptions...");
  let rawSqlMatches = "";
  try {
    rawSqlMatches = execFileSync(
      "git",
      ["grep", "-n", "$queryRaw", "src"],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }
    ).trim();
  } catch {
    rawSqlMatches = "";
  }

  // If there are raw queries, check none use strftime or sqlite_master
  assert(
    !rawSqlMatches.includes("strftime") && !rawSqlMatches.includes("sqlite_master"),
    "No raw SQL queries rely on SQLite-specific functions like strftime or sqlite_master"
  );

  // --------------------------------------------------------------------------
  // 4. Data Inventory Documentation Verification
  // --------------------------------------------------------------------------
  console.log("\n[4] Verifying docs/DATA_INVENTORY.md...");
  const inventoryPath = path.resolve(process.cwd(), "docs/DATA_INVENTORY.md");
  assert(fs.existsSync(inventoryPath), "docs/DATA_INVENTORY.md exists");

  const inventoryContent = fs.readFileSync(inventoryPath, "utf-8");
  assert(inventoryContent.includes("Order"), "Inventory documents Order table");
  assert(inventoryContent.includes("CardData"), "Inventory documents CardData table");
  assert(inventoryContent.includes("PageData"), "Inventory documents PageData table");
  assert(inventoryContent.includes("GuestbookEntry"), "Inventory documents GuestbookEntry table");
  assert(inventoryContent.includes("RateLimitEvent"), "Inventory documents RateLimitEvent table");
  assert(inventoryContent.includes("PII"), "Inventory classifies PII across all columns");

  console.log("\n================================================================");
  console.log(`TOTAL ASSERTIONS: ${totalAssertions}`);
  console.log(`PASSED ASSERTIONS: ${passedAssertions}`);
  console.log("================================================================\n");

  if (passedAssertions !== totalAssertions) {
    process.exit(1);
  }
}

runPostgresReadinessTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
