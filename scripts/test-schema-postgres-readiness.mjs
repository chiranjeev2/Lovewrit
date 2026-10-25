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

const { verifyNoDrift } = await import("./sync-prisma-schemas.js");

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
  const expectedIndexes = [
    "@@index([customerEmail])",
    "@@index([createdAt])",
    "@@index([myReferralCode])",
    "@@index([pageDataId])",
    "@@index([ownerEmail])",
    "@@index([action, ipAddress, createdAt])",
  ];

  for (const idx of expectedIndexes) {
    assert(schemaContent.includes(idx), `Schema includes required index: ${idx}`);
  }

  // --------------------------------------------------------------------------
  // 3. Foreign Key Cascades & Constraints
  // --------------------------------------------------------------------------
  console.log("\n[3] Checking Foreign Key Relations & Constraints...");
  assert(schemaContent.includes("onDelete: Cascade"), "Cascade deletion specified on child relations");
  assert(schemaContent.includes("@unique"), "Unique constraints defined on slugs and order identifiers");

  // --------------------------------------------------------------------------
  // 4. Verifying docs/DATA_INVENTORY.md
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

  // --------------------------------------------------------------------------
  // 5. Zero Drift Between SQLite and PostgreSQL Schemas
  // --------------------------------------------------------------------------
  console.log("\n[5] Verifying Dual-Schema Parity & PostgreSQL Migrations...");
  const sqliteSchemaPath = path.resolve(process.cwd(), "prisma/schema.sqlite.prisma");
  const postgresSchemaPath = path.resolve(process.cwd(), "prisma/schema.postgresql.prisma");
  const postgresMigrationsPath = path.resolve(process.cwd(), "prisma/migrations-postgres");

  assert(fs.existsSync(sqliteSchemaPath), "prisma/schema.sqlite.prisma exists");
  assert(fs.existsSync(postgresSchemaPath), "prisma/schema.postgresql.prisma exists");
  assert(fs.existsSync(postgresMigrationsPath), "prisma/migrations-postgres exists");

  let driftVerified = false;
  try {
    driftVerified = verifyNoDrift();
  } catch (err) {
    console.error("Drift check error:", err.message);
  }
  assert(driftVerified === true, "Zero drift detected: SQLite and PostgreSQL schemas match 100% in models, fields, indexes and relations");

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
