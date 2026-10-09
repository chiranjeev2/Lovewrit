# Lovewrit Database Architecture & PostgreSQL Migration Guide

This document details the database schema, Prisma migration workflows, PostgreSQL/Supabase readiness, index catalog, and the production deployment runbook.

---

## 1. Schema Overview & Models

The database schema is defined in [`prisma/schema.prisma`](file:///d:/projects/lovewrit/prisma/schema.prisma) and consists of 8 core models:

1. **`Order`**: Root transaction entity tracking keepsake type (`CARD` or `PAGE`), pricing tier (`SELF_SERVICE`, `CUSTOM`, `RUSH`), payment status (`PENDING`, `PAID`, `FAILED`), Razorpay order identifiers, currency, amount in smallest units, referral codes, and security tokens (`adminToken`, `pinCode`).
2. **`CardData`**: 1-to-1 relation with `Order` for Digital Greeting Cards (bilingual text, photos, color themes, stickers JSON, Om/Bismillah sacred motifs, reveal timestamps).
3. **`PageData`**: 1-to-1 relation with `Order` for Interactive Web Keepsakes (letter, multiple photos, audio tracks, proposal modes, timeline JSON, scenes engine configuration).
4. **`RecipientReaction`**: Feedback from gift recipients (text, voice, emoji).
5. **`ReferralRecord`**: Creator and customer referral codes, usage counters, and accumulated store credit balance.
6. **`GuestbookEntry`**: RSVPs and blessings left by guests for event keepsakes, with approval states (`PENDING`, `APPROVED`, `FLAGGED`).
7. **`RateLimitEvent`**: Audit log for security rate-limiting (daily IP creation limits, admin login protection, referral anti-abuse).
8. **`PlatformSetting`**: Key-value runtime platform configuration (e.g. emergency rush order toggle, referral creator binding metadata).

---

## 2. Migration History & Performance Indexes

The repository maintains an immutable Prisma migrations directory under [`prisma/migrations/`](file:///d:/projects/lovewrit/prisma/migrations):

### Migration Catalog:
1. **`20261007000000_init_schema`**:
   - Initial relational schema establishing all 8 tables, column types, default values, primary keys (`cuid()`), and unique constraints (`Order.slug`, `Order.razorpayOrderId`, `CardData.orderId`, `PageData.orderId`, `ReferralRecord.code`).
2. **`20261009000000_add_performance_indexes`**:
   - Adds 10 B-tree performance and search indexes to eliminate table scans on frequently filtered columns:
     - `GuestbookEntry_pageDataId_idx` on `GuestbookEntry(pageDataId)`
     - `GuestbookEntry_createdAt_idx` on `GuestbookEntry(createdAt)`
     - `Order_customerEmail_idx` on `Order(customerEmail)`
     - `Order_createdAt_idx` on `Order(createdAt)`
     - `Order_myReferralCode_idx` on `Order(myReferralCode)`
     - `RateLimitEvent_action_ipAddress_createdAt_idx` on `RateLimitEvent(action, ipAddress, createdAt)`
     - `RateLimitEvent_createdAt_idx` on `RateLimitEvent(createdAt)`
     - `RecipientReaction_pageDataId_idx` on `RecipientReaction(pageDataId)`
     - `RecipientReaction_createdAt_idx` on `RecipientReaction(createdAt)`
     - `ReferralRecord_ownerEmail_idx` on `ReferralRecord(ownerEmail)`

### Verification of Migration Integrity:
- **Zero Schema Drift**: Executing `npx prisma migrate status` confirms 2 migrations found, 0 pending, and schema up to date.
- **Clean Scratch Replay**: Verified by executing `prisma migrate deploy` on a fresh scratch database (`scratch_test.db`), confirming deterministic ordered replay from base schema to final indexed state without errors.

---

## 3. PostgreSQL & Supabase Compatibility Audit

The Prisma schema is 100% PostgreSQL-compatible:
- **Primary Keys**: All tables use CUID strings (`@id @default(cuid())`), which are supported uniformly across SQLite, PostgreSQL, and MySQL.
- **Data Types**: All attributes use standard Prisma primitive types (`String`, `Int`, `Boolean`, `DateTime`) that translate directly to native PostgreSQL column types (`TEXT`, `INTEGER`, `BOOLEAN`, `TIMESTAMP WITH TIME ZONE`).
- **No Engine-Specific Types**: There are zero SQLite-only pragmas, SQLite-specific types, or unsupported database extensions.
- **Foreign Key Cascades**: All relations use standard `onDelete: Cascade`, translating cleanly to PostgreSQL `ON DELETE CASCADE` foreign keys.
- **Indexes**: All composite and single-column indexes are pure standard B-tree indexes natively supported by PostgreSQL.

---

## 4. Step-by-Step Migration from SQLite to Supabase / PostgreSQL

### Step 1: Provision Managed PostgreSQL Database
1. Create a project in [Supabase](https://supabase.com) (or AWS RDS / Neon / Railway).
2. Navigate to **Project Settings** -> **Database**.
3. Copy the Connection Strings:
   - **Transaction Connection Pooler** (Port 6543, for serverless Next.js runtime):
     `DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"`
   - **Direct Session Connection** (Port 5432, for Prisma migrations):
     `DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"`

### Step 2: Configure Prisma for PostgreSQL
In `prisma/schema.prisma`, update the `datasource` block:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 3: Run Initial PostgreSQL Migrations
Execute the migration against the new database:

```bash
npx prisma migrate deploy
```

This applies both migrations in sequence, creating the complete relational table structure, foreign key constraints, unique indexes, and performance indexes in PostgreSQL.

---

## 5. Vercel Production Build & Migration Pipeline

The Vercel deployment pipeline is configured in [`package.json`](file:///d:/projects/lovewrit/package.json):

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy"
  }
}
```

### Build Execution Flow on Vercel:
1. `prisma generate`: Compiles the type-safe `@prisma/client` artifacts into `node_modules`.
2. `prisma migrate deploy`: Connects to `DATABASE_URL` (or `DIRECT_URL`) and applies any pending migrations idempotently. If the database is already up-to-date, it exits cleanly with code 0.
3. `next build`: Builds the production Next.js application bundle.

---

## 6. Development Workflow Commands

- **Create new migration locally**:
  ```bash
  npx prisma migrate dev
  ```
- **Apply pending migrations to active database**:
  ```bash
  npx prisma migrate deploy
  ```
- **Check migration drift and status**:
  ```bash
  npx prisma migrate status
  ```
- **Inspect database tables via Prisma Studio**:
  ```bash
  npx prisma studio
  ```
