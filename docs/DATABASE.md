# Lovewrit Database Architecture & PostgreSQL Migration Guide

This document details the database schema, Prisma migration workflows, PostgreSQL/Supabase readiness, and the production deployment runbook.

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

## 2. PostgreSQL & Supabase Compatibility Audit

The Prisma schema is 100% PostgreSQL-compatible:
- **Primary Keys**: All tables use CUID strings (`@id @default(cuid())`), which are supported uniformly across SQLite, PostgreSQL, and MySQL.
- **Data Types**: All attributes use standard Prisma primitive types (`String`, `Int`, `Boolean`, `DateTime`) that translate directly to native PostgreSQL column types (`TEXT`, `INTEGER`, `BOOLEAN`, `TIMESTAMP WITH TIME ZONE`).
- **No Engine-Specific Types**: There are zero SQLite-only pragmas, SQLite-specific types, or unsupported database extensions.
- **Foreign Key Cascades**: All relations use standard `onDelete: Cascade`, translating cleanly to PostgreSQL `ON DELETE CASCADE` foreign keys.
- **Indexes**: Unique constraints (`slug`, `razorpayOrderId`, `orderId`, `code`) generate standard B-tree unique indexes in PostgreSQL.

---

## 3. Step-by-Step Migration from SQLite to Supabase / PostgreSQL

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
npx prisma migrate dev --name init_postgres
```

This creates the complete relational table structure, foreign key constraints, and unique indexes in PostgreSQL.

### Step 4: Data Export & Transfer (Optional for Existing Dev Data)
If existing development rows in `dev.db` need to be migrated to production:
1. Export existing SQLite records using Prisma client:
   ```bash
   npx tsx scripts/export-sqlite-data.mjs > data-backup.json
   ```
2. Switch `.env` to point `DATABASE_URL` to PostgreSQL.
3. Import records into PostgreSQL preserving IDs and foreign keys:
   ```bash
   npx tsx scripts/import-postgres-data.mjs < data-backup.json
   ```

---

## 4. Vercel Production Build & Migration Pipeline

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

## 5. Development Workflow Commands

- **Create new migration locally**:
  ```bash
  npm run db:migrate
  ```
- **Apply pending migrations to active database**:
  ```bash
  npm run db:deploy
  ```
- **Inspect database tables via Prisma Studio**:
  ```bash
  npx prisma studio
  ```

