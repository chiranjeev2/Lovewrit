# Lovewrit Database Architecture & PostgreSQL Migration Guide

This document details the database schema, dual-provider architecture (SQLite for local dev/QA, PostgreSQL for production Supabase), Prisma migration workflows, index catalog, and the production deployment runbook.

---

## 1. Schema Overview & Models

The database schema defines 8 core models:

1. **`Order`**: Root transaction entity tracking keepsake type (`CARD` or `PAGE`), pricing tier (`SELF_SERVICE`, `CUSTOM`, `RUSH`), payment status (`PENDING`, `PAID`, `FAILED`), Razorpay order identifiers, currency, amount in smallest units, referral codes, and security tokens (`adminToken`, `pinCode`).
2. **`CardData`**: 1-to-1 relation with `Order` for Digital Greeting Cards (bilingual text, photos, color themes, stickers JSON, Om/Bismillah sacred motifs, reveal timestamps).
3. **`PageData`**: 1-to-1 relation with `Order` for Interactive Web Keepsakes (letter, multiple photos, audio tracks, proposal modes, timeline JSON, scenes engine configuration).
4. **`RecipientReaction`**: Feedback from gift recipients (text, voice, emoji).
5. **`ReferralRecord`**: Creator and customer referral codes, usage counters, and accumulated store credit balance.
6. **`GuestbookEntry`**: RSVPs and blessings left by guests for event keepsakes, with approval states (`PENDING`, `APPROVED`, `FLAGGED`).
7. **`RateLimitEvent`**: Audit log for security rate-limiting (daily IP creation limits, admin login protection, referral anti-abuse).
8. **`PlatformSetting`**: Key-value runtime platform configuration (e.g. emergency rush order toggle, referral creator binding metadata).

---

## 2. Dual-Provider Architecture (Zero Schema Drift)

To ensure zero drift between local SQLite development and PostgreSQL production environments, Lovewrit maintains two synchronised schemas:
- [`prisma/schema.sqlite.prisma`](file:///d:/projects/lovewrit/prisma/schema.sqlite.prisma): Configured with `provider = "sqlite"` and `url = env("DATABASE_URL")`. Default in dev and automated QA test runs.
- [`prisma/schema.postgresql.prisma`](file:///d:/projects/lovewrit/prisma/schema.postgresql.prisma): Configured with `provider = "postgresql"`, `url = env("DATABASE_URL")`, and `directUrl = env("DIRECT_URL")`.
- [`prisma/schema.prisma`](file:///d:/projects/lovewrit/prisma/schema.prisma): The active schema file read by Prisma CLI.

### Provider Switching Commands:
```bash
# Switch active schema to PostgreSQL and regenerate client
npm run db:use-postgres

# Switch active schema to SQLite and regenerate client
npm run db:use-sqlite
```

The synchronization script ([`scripts/sync-prisma-schemas.js`](file:///d:/projects/lovewrit/scripts/sync-prisma-schemas.js)) programmatically parses all models, attributes, fields, types, indexes, and relations across both files. Automated tests assert that both schemas remain 100% identical in model structure.

---

## 3. Migration Sets

### SQLite Migrations (`prisma/migrations/`):
1. `20261007000000_init_schema`: Base relational tables and unique constraints.
2. `20261009000000_add_performance_indexes`: 10 B-tree performance and search indexes.

### PostgreSQL Migrations (`prisma/migrations-postgres/`):
Dedicated PostgreSQL DDL migration set generated via `prisma migrate diff`:
1. `20261007000000_init_schema`: Creates tables, primary keys (`CONSTRAINT ... PRIMARY KEY ("id")`), foreign keys with cascade deletes, and unique indexes on PostgreSQL.
2. `20261009000000_add_performance_indexes`: Creates all 10 B-tree performance indexes in PostgreSQL syntax.

---

## 4. Production Supabase / PostgreSQL Deployment Runbook

Follow these exact steps when deploying Lovewrit to production on Supabase:

### Step 1: Provision Managed Database in Supabase
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Navigate to **Project Settings** -> **Database**.
3. Under **Connection string**, obtain both URIs:
   - **Transaction Pooler (Port 6543)** — Required for `DATABASE_URL` in serverless Next.js runtimes:
     ```env
     DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
     ```
   - **Direct Session (Port 5432)** — Required for `DIRECT_URL` to run Prisma migrations:
     ```env
     DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
     ```

### Step 2: Set Environment Variables in Hosting Dashboard
Add both variables to the hosting provider (e.g. Vercel dashboard):
- `DATABASE_URL`: Transaction pooler URI on port 6543 with `pgbouncer=true`.
- `DIRECT_URL`: Direct connection URI on port 5432.

### Step 3: Switch Schema and Apply Migrations
Before deploying or building the production bundle:
```bash
# 1. Switch active schema to PostgreSQL
npm run db:use-postgres

# 2. Deploy migrations to the Supabase instance
npx prisma migrate deploy --schema prisma/schema.postgresql.prisma
```

---

## 5. Development Workflow Commands

- **Check Schema Drift**:
  ```bash
  node scripts/sync-prisma-schemas.js
  ```
- **Apply pending migrations to active database**:
  ```bash
  npm run db:deploy
  ```
- **Inspect database tables via Prisma Studio**:
  ```bash
  npx prisma studio
  ```
