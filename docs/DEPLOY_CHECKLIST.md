# Lovewrit Production Deployment Checklist & Operational Runbook

This runbook outlines the required chronological steps to deploy Lovewrit to production on Vercel with a managed PostgreSQL database (Supabase) and Razorpay payments gateway.

Items requiring manual human intervention in external dashboards are explicitly labeled **[Owner Action]**. Steps handled automatically by the codebase or build pipeline are labeled **[Automated]**.

---

## Pre-Flight Architecture Overview

```
[Buyer / Browser (Mobile 375px+)]
              │
              ▼
    [Vercel Edge Network]
              │
              ├── Next.js App Router (SSR + Server Components)
              │     └── src/instrumentation.ts (Startup Env Guard)
              │
              ├── API Route Handlers
              │     ├── POST /api/checkout (Order calculation & RZP order creation)
              │     ├── POST /api/checkout/verify (HMAC payment verification & idempotency)
              │     └── POST /api/webhooks/razorpay (order.paid & payment.captured handling)
              │
              ├── Database Layer (Prisma ORM)
              │     └── Supabase / PostgreSQL (Port 6543 Pooled, Port 5432 Direct)
              │
              └── External Services
                    ├── Razorpay Payment Gateway (Checkout modal & Webhooks)
                    └── Self-contained PDF/PNG export engine
```

---

## Step 1: Managed PostgreSQL Database Setup

1. **[Owner Action] Provision PostgreSQL Database**:
   - Log into [Supabase](https://supabase.com) (or AWS RDS / Neon / Railway).
   - Create a new project (e.g. `lovewrit-production`).
   - Select a primary region close to target buyers (e.g., `ap-south-1` Mumbai for India or `us-east-1` for global).
2. **[Owner Action] Retrieve Connection Strings**:
   - Navigate to **Project Settings** -> **Database**.
   - Copy the **Transaction Pooler Connection String** (Port 6543) for serverless execution:
     `DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"`
   - Copy the **Direct Session Connection String** (Port 5432) for Prisma migrations:
     `DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"`
3. **[Automated] Schema Migrations**:
   - Migrations are stored in [`prisma/migrations`](file:///d:/projects/lovewrit/prisma/migrations).
   - When the Vercel build script runs, `prisma migrate deploy` automatically executes against `DATABASE_URL` to create all tables and indexes.

---

## Step 2: Generate Owner Secrets Locally

1. **[Owner Action] Generate Admin Secrets**:
   - On a secure development terminal, run:
     ```bash
     npm run admin:set-key
     ```
   - Enter your chosen master passphrase (min 20 characters, unlisted).
   - Confirm passphrase when prompted.
   - This writes `ADMIN_MASTER_KEY` and a cryptographically generated 256-bit `ADMIN_SESSION_SECRET` to local `.env`.
   - Copy both values for entry into Vercel (never commit them to Git).

---

## Step 3: Vercel Project Setup & Build Configuration

1. **[Owner Action] Import Repository**:
   - In the [Vercel Dashboard](https://vercel.com), click **Add New** -> **Project**.
   - Select the `lovewrit` GitHub repository.
   - Choose the `main` branch as the Production Branch.
2. **[Automated] Build and Output Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: [`package.json`](file:///d:/projects/lovewrit/package.json) defines `"build": "prisma generate && prisma migrate deploy && next build"`
   - Output Directory: `.next` (default)
3. **[Owner Action] Configure Environment Variables**:
   In Vercel **Project Settings** -> **Environment Variables**, add the following:

   | Variable Name | Environment | Description / Example |
   |---|---|---|
   | `DATABASE_URL` | Production, Preview | PostgreSQL transaction pooler URL (Port 6543) |
   | `DIRECT_URL` | Production, Preview | PostgreSQL direct connection URL (Port 5432) |
   | `RAZORPAY_KEY_ID` | Production, Preview | Live Razorpay key (`rzp_live_...`) or test key |
   | `RAZORPAY_KEY_SECRET` | Production, Preview | Live Razorpay secret key |
   | `RAZORPAY_WEBHOOK_SECRET` | Production, Preview | Webhook HMAC secret from Razorpay dashboard |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Production, Preview | Client-side Razorpay key (`rzp_live_...`) |
   | `ADMIN_MASTER_KEY` | Production, Preview | Owner-chosen admin passphrase (from Step 2) |
   | `ADMIN_SESSION_SECRET` | Production, Preview | 256-bit random hex secret (from Step 2) |
   | `NEXT_PUBLIC_APP_URL` | Production, Preview | Public domain (e.g. `https://lovewrit.com`) |

4. **[Automated] Startup Validation**:
   - Next.js server boot runs `src/instrumentation.ts`. If any of these 7 required production variables are missing, startup halts with a clear error listing the missing variable names.

---

## Step 4: Razorpay Dashboard & Webhook Setup

1. **[Owner Action] Obtain Razorpay API Credentials**:
   - Log into [Razorpay Dashboard](https://dashboard.razorpay.com).
   - Navigate to **Settings** -> **API Keys**.
   - Generate or copy Key ID and Key Secret.
2. **[Owner Action] Configure Webhook Endpoint**:
   - Navigate to **Settings** -> **Webhooks** -> **Add New Webhook**.
   - **Webhook URL**: `https://<YOUR_DOMAIN>/api/webhooks/razorpay`
   - **Secret**: Enter a high-entropy passphrase (e.g. 32 characters) and paste the exact same value into Vercel as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events**: Select:
     - `order.paid`
     - `payment.captured`
     - `payment.failed`
   - Click **Save**.
3. **[Automated] Webhook Security**:
   - The route handler [`src/app/api/webhooks/razorpay/route.ts`](file:///d:/projects/lovewrit/src/app/api/webhooks/razorpay/route.ts) reads the raw request text, validates the HMAC-SHA256 signature against `RAZORPAY_WEBHOOK_SECRET`, marks the order `PAID`, and credits the referrer exactly once.

---

## Step 5: Trigger Production Deployment

1. **[Owner Action] Deploy to Production**:
   - In Vercel, click **Deploy** (or push a commit to `main`).
2. **[Automated] CI/CD Build Execution**:
   - Vercel installs dependencies with `npm install`.
   - Runs `prisma generate` to compile Prisma client.
   - Runs `prisma migrate deploy` against `DATABASE_URL`.
   - Runs `next build` to compile pages and server route handlers.

---

## Step 6: Post-Deployment Smoke Test (Android 375px & End-to-End Payment)

1. **[Owner Action] Viewport Verification (Mobile 375px)**:
   - On an Android device (or Chrome DevTools emulating 375px width):
   - Visit `https://<YOUR_DOMAIN>/create/forever-valentine`.
   - Verify layout: navigation headers, preview canvas, personalization inputs, and pricing summaries fit within 375px without horizontal viewport overflow.
2. **[Owner Action] Test Payment Gateway**:
   - With Razorpay in Test Mode (using test keys `rzp_test_...`):
   - Complete checkout with a test card / UPI ID.
   - Verify Razorpay modal opens with the correct currency and amount.
   - Complete test payment; verify immediate redirect to `/checkout/success`.
3. **[Owner Action] Webhook & Moderation Smoke Test**:
   - Confirm order status updates to `PAID` in database.
   - Access the published keepsakes `/p/[slug]` and card view `/c/[slug]`.
   - Post a test RSVP to the guestbook; verify host approval using the keepsake's secret admin link.
   - Visit `https://<YOUR_DOMAIN>/admin` and test login with `ADMIN_MASTER_KEY`.
