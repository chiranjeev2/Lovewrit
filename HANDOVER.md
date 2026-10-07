# Lovewrit System Handover & Technical Architecture State

**Last Updated:** October 2026 (Post-Razorpay Migration & Hardening Pass)  
**Target Branch:** `main` (Production Ready)

---

## 1. Executive Summary & Purpose

Lovewrit is a high-craft platform for personal and devotional digital keepsakes. It allows buyers to create, personalize, preview, and share:
- **Digital Greeting Cards** (`/c/[slug]`): Interactive folding cards with envelopes, bilingual messages, sacred motifs, photo reveals, and audio notes.
- **Interactive Web Keepsakes** (`/p/[slug]`): Immersive multi-scene web experiences featuring music, proposal mechanics, photo masonry, milestone timelines, memory candles, and interactive guestbooks.
- **Creation Studio** (`/create/[templateId]`): Real-time live customizer supporting 20 real templates across religious, cultural, romantic, and milestone occasions.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router, Server Components, Route Handlers).
- **Language**: TypeScript 5 (Strict mode, zero lint errors, zero ts-ignore).
- **Styling**: Tailwind CSS 4 with custom emotion-tailored color palettes.
- **Animation**: Framer Motion 13 + Canvas Confetti.
- **Database & ORM**: Prisma ORM with SQLite in development and PostgreSQL (Supabase) in production.
- **Payments**: Razorpay Standard Checkout & HMAC-SHA256 Server Webhooks.
- **Export Engine**: Browser-rendered PDF rasterization (300 DPI print-ready), PNG, and JPG exports.

---

## 3. Branch & Repository State

- `feature/scene-engine`: Fully merged into `main`. Delivers dynamic multi-scene web keepsake rendering with fallback modes for reduced motion and legacy orders.
- `feature/razorpay`: Fully merged into `main`. Replaced legacy Stripe packages with native Razorpay order creation, client modal integration, HMAC payment verification, and webhook handlers.
- `main`: Canonical production branch with all migrations applied and all quality verification gates green.

---

## 4. STRICT NON-NEGOTIABLES (Inviolable Product Rules)

The following core rules are enforced across all components, APIs, and tests, and MUST NOT be bypassed or weakened:

1. **Sacred Memorial Separation (Zero Commercialization)**:
   - Memorial, tribute, and condolence pages (`isMemorial = true`) MUST NEVER display commercial banners, reply CTAs, upsell prompts, 50% discount offers, or celebratory confetti.
   - Sacred motifs (Om, Bismillah, Ek Onkar, Cross) must only render on their respective culturally authentic templates.
2. **Server-Side Pricing Authority**:
   - Client-sent `amount` or `currency` parameters in checkout payloads are strictly ignored. The server computes the order total exclusively via `calculateOrderTotal` from `src/lib/currency.ts`.
3. **Zero Hardcoded Secrets & Zero Secret Logging**:
   - There must be no fallback, hardcoded, or default `ADMIN_MASTER_KEY` anywhere in source code, tests, documentation, or git history.
   - All legacy default keys are permanently blacklisted by SHA-256 hash.
   - Secret keys and connection strings MUST NEVER be logged, echoed, or included in API error responses.
4. **Production Simulation Guard**:
   - Simulated sessions (`sim_*`) are strictly forbidden when `NODE_ENV === "production"`. Any simulation attempt in production fails closed immediately with HTTP 500 / 403.
5. **Timing-Safe Cryptographic Verification**:
   - All payment signatures, webhook signatures, and admin master key comparisons use `crypto.timingSafeEqual` with pre-hashed equal-length buffers to eliminate timing side-channels.
6. **Mobile Viewport Containment**:
   - All customizer, card, and published pages must contain layout cleanly within 375px mobile viewports without horizontal scrollbars or overflow.

---

## 5. Payments Architecture & Razorpay Integration (Updated)

### Route Handlers
- **`POST /api/checkout`**: Resolves geo/currency, calculates price server-side, creates database `Order`, and calls `razorpay.orders.create`. If Razorpay rejects a non-INR currency, error details are logged server-side and returned cleanly to the buyer without silently falling back to INR.
- **`POST /api/checkout/verify`**: Verifies HMAC-SHA256 signature (`orderId|paymentId`), checks for `razorpayOrderId`, `amount`, and `currency` mismatches against the database order, updates status to `PAID`, and triggers referral crediting idempotently.
- **`GET /api/checkout/verify`**: Status check endpoint supporting order lookup by slug or session ID, blocked for `sim_` sessions in production.
- **`POST /api/webhooks/razorpay`**: Validates webhook HMAC signature against raw request body (`req.text()`). Handles `payment.captured` and `order.paid` dual events idempotently, crediting referrers exactly once. Unhandled events return HTTP 200 `{ received: true }` with no state modification.

### Multi-Currency Pricing Engine
- Supported regions: `asia_africa` (INR / ₹), `americas` (USD / $), `europe` (EUR / €), `uk` (GBP / £).
- Tiers: Self-Service (₹49 Card, ₹99 Page), Custom Handcrafted (₹149 Card, ₹499 Page), Emergency Rush (₹449 Card, ₹1,459 Page), Bundle Add-on (+₹49 / +$3).
- Referral discounts apply fixed credit matching the Digital Card price (₹49 / $2 / €2 / £2).
- Verified 50% Regift reply perk applies half-price discounts to recipients replying to a paid keepsake.

---

## 6. Admin Authentication & Keys (Updated)

- **Owner-Chosen Master Key**: Set via interactive CLI script `npm run admin:set-key` (`scripts/set-admin-secrets.mjs`) with masked input, double confirmation, and minimum 20-character enforcement.
- **Blacklist Enforcement**: Keys matching blacklisted legacy default hashes are refused.
- **Session Security**: Generates random 256-bit `ADMIN_SESSION_SECRET`. Session tokens use HMAC-SHA256 timestamps stored in strict `httpOnly`, `sameSite=strict`, `secure` cookies (`lovewrit_admin_session`).
- **Brute-Force Rate Limiting**: Max 5 failed attempts per 15 minutes per IP/device identity (HTTP 429).
- **Fail-Closed**: Unconfigured or invalid keys return HTTP 503 / 401 with zero leak of server secrets.

---

## 7. Keepsake Engine & Interactive Features

- **20 Real Templates**: Spanning wedding, anniversary, proposal, birthday, godh bharai, memorial, kitty party, Jagrata, Sikh Ardas, Muslim Dua, and Christian blessings.
- **Scene Engine**: Modular multi-scene player (`src/components/scene-engine/`) rendering interactive openers, blessing steps, milestone photo galleries, and personalized finales.
- **Memory Candle**: Atomic interactive candle lighting with concurrent abuse protection and live counts.

---

## 8. Database & Migrations (Updated)

- **Prisma Schema**: 8 models (`Order`, `CardData`, `PageData`, `RecipientReaction`, `ReferralRecord`, `GuestbookEntry`, `RateLimitEvent`, `PlatformSetting`) defined in [`prisma/schema.prisma`](file:///d:/projects/lovewrit/prisma/schema.prisma).
- **Prisma Migrations**: Managed via `prisma/migrations/20261007000000_init_schema/migration.sql`.
- **Automated Vercel Pipeline**: `npm run build` runs `prisma generate && prisma migrate deploy && next build`.
- **PostgreSQL / Supabase Ready**: Documented in [`docs/DATABASE.md`](file:///d:/projects/lovewrit/docs/DATABASE.md) with connection pooler and direct URL configurations.

---

## 9. Startup Environment Verification (Updated)

- **Startup Hook**: [`src/instrumentation.ts`](file:///d:/projects/lovewrit/src/instrumentation.ts) calls `validateEnv()` on process boot.
- **Production Validation**: In `NODE_ENV === "production"`, validates all 7 mandatory variables: `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `ADMIN_MASTER_KEY`, `ADMIN_SESSION_SECRET`.
- **Error Safety**: Fails closed listing variable NAMES ONLY.
- **Template**: Documented in [`.env.example`](file:///d:/projects/lovewrit/.env.example) with empty values and single comment lines.

---

## 10. Guestbook & Moderation

- **Public Posting**: `POST /api/guestbook` open to all guests with name, RSVP status, headcount, and blessings.
- **Public Viewing**: `GET /api/guestbook` displays approved entries and aggregates RSVP headcount statistics.
- **Host Moderation**: Hosts approve or delete entries using `order.adminToken` via `PATCH /api/guestbook` without requiring platform admin privileges.
- **Community Moderation**: Any visitor can flag offensive notes (`action: "FLAG"`).
- **Master Admin Session**: Master admins can moderate entries platform-wide.

---

## 11. Production Operations & Runbook (Updated)

Detailed step-by-step operational instructions for deploying to Vercel and configuring Supabase and Razorpay are documented in [`docs/DEPLOY_CHECKLIST.md`](file:///d:/projects/lovewrit/docs/DEPLOY_CHECKLIST.md).

### Key Commands:
```bash
# Configure owner secrets locally
npm run admin:set-key

# Run comprehensive QA test suite
npm run qa

# Run Prisma migrations locally
npm run db:migrate

# Apply migrations to production database
npm run db:deploy

# Full production build
npm run build
```

