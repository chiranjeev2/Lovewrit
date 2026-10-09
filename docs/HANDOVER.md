# Lovewrit System Handover & Technical Architecture State

**Last Updated:** October 8, 2026 (Production-Readiness Hardening Pass)  
**Active Branch:** `fix/prod-ready` (Target: merge to `main` with `--no-ff`)  
**Latest Production-Readiness Commits:**
- `c3564ab` feat(compliance): step 1 - scan and enforce 11 non-negotiables policy compliance
- `204a709` feat(api): step 2 - schema validation, rate limits, and hostile input test suite
- `7bb6bed` feat(security): step 3 - security headers, CSP, cookie security, and privacy suite
- `9916795` feat(error-handling): step 4 - custom error boundaries, not-found, loading, and PIN lockout
- `7fffc8f` feat(a11y): step 5 - accessibility, focus styles, WCAG contrast, and mobile tap targets
- `ea6af47` feat(perf): step 6 - performance audit, bundle sizes, and static asset verification
- `02b050d` feat(db): step 7 - prisma indexes, postgres readiness, and data inventory
- `0c0f788` feat(tooling): step 8 - code health, configurable browser path, and documentation update

---

## 1. Executive Summary & Purpose

Lovewrit is a high-craft platform for personal and devotional digital keepsakes. It allows buyers to create, personalize, preview, and share:
- **Digital Greeting Cards** (`/c/[slug]`): Interactive folding keepsake cards with envelope reveals, bilingual typography, sacred motifs, photo keepsakes, and audio voice messages.
- **Interactive Web Keepsakes** (`/p/[slug]`): Immersive multi-scene interactive web pages featuring background music, proposal game mechanics, milestone photo timelines, sacred memory candles, and guestbooks.
- **Creation Studio** (`/create/[templateId]`): Mobile-first 375px responsive customizer covering all 21 templates in the repository across romantic, celebratory, memorial, and devotional occasions.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (App Router, React Server Components, Route Handlers, Turbopack).
- **Database & ORM**: Prisma ORM with SQLite (`dev.db`) in local development and PostgreSQL (Supabase with connection pooling) in production.
- **Payments**: Razorpay Standard Checkout & HMAC-SHA256 Server Webhook processing.
- **Hosting**: Vercel staging (`*.vercel.app`) with custom production domain planned on/after 21 Oct 2026.
- **Language & Styling**: TypeScript 5 (strict mode, zero warnings, zero ts-ignore) and Tailwind CSS 4 with emotion-based palettes.
- **Export Pipeline**: Real-browser Puppeteer print-ready (300 DPI) PDF rasterization, PNG, and JPG exports.

---

## 3. STRICT NON-NEGOTIABLES (Inviolable Product Rules)

The following core rules are enforced across all components, APIs, and tests, and MUST NOT be bypassed or weakened:

1. **no video anywhere**: Lovewrit exclusively uses lightweight animated scenes, canvas effects, SVG, and high-resolution rasterized typography.
2. **no fake reviews, counters, social proof or strike-through discounts**: All displayed numbers must reflect real database records.
3. **devotional templates faith-neutral with no figurative depictions in finales**: Sacred devotional keepsakes use authentic scriptural verses, sacred motifs (Om, Bismillah, Ek Onkar, Cross), and respectful abstract light effects without figurative anthropomorphic depictions.
4. **no baby-sex/gender reveal anywhere (PCPNDT Act)**: Prenatal sex determination or gender reveal mechanics are strictly prohibited in compliance with Indian law. Godh bharai keepsakes celebrate maternal health and family blessing only.
5. **tribute/memorial pages fully unbranded with no ads, promo, referral, banners or countdowns and a pre-moderated wall**: Sacred memorial and tribute keepsakes (`isMemorial = true`) maintain solemn dignity with zero platform branding, zero upselling, zero banners, and mandatory host approval before guestbook entries appear publicly.
6. **RSVP only on event/invite occasions**: RSVP forms and guest headcount tracking are strictly scoped to invitation occasions (`isEventInviteOccasion`).
7. **IP-based region detection with no blocking geolocation prompt**: Currency and regional localization are determined silently via server-side edge headers (`x-vercel-ip-country`, `cf-ipcountry`) without interrupting the user with browser location permission popups.
8. **Lovewrit never processes tips**: Tip UPI IDs or PayPal usernames are rendered as direct buyer-to-recipient peer links; platform takes 0% cut and does not process tip transactions.
9. **no friends-list/encrypted-chat feature**: Keepsakes are focused private artifacts shared via direct link, not a social network or instant messaging client.
10. **invite "pressure to attend" is warm emotional pull, not guilt**: Invitation copy and event reminders focus on celebration and togetherness rather than guilt-inducing countdowns.
11. **real reviews only**: Testimonials and reviews must come from real verified purchasers.

---

## 4. Multi-Currency Pricing Architecture

| Occasion / Product Tier | INR (Asia & Africa) | USD (Americas) | EUR (Europe) | GBP (United Kingdom) |
| :--- | :--- | :--- | :--- | :--- |
| **Digital Card (Self-Service)** | ₹49 | $2 | €2 | £2 |
| **Published Page (Self-Service)** | ₹99 | $5 | €5 | £5 |
| **Custom Handcrafted Card** | ₹149 | $8 | €8 | £8 |
| **Custom Handcrafted Page** | ₹499 | $25 | €25 | £25 |
| **Emergency Rush Card (12h)** | ₹449 | $22 | €22 | £22 |
| **Emergency Rush Page (12h)** | ₹1,459 | $75 | €75 | £75 |
| **Card + Page Bundle Add-on** | +₹49 | +$3 | +€3 | +£3 |
| **Referral Credit (Fixed)** | ₹49 | $2 | €2 | £2 |
| **Regift Reply Discount** | 50% Off | 50% Off | 50% Off | 50% Off |

### Pricing & Refund Policies:
- **Server Authority**: Order total is computed strictly server-side by `calculateOrderTotal` (`src/lib/currency.ts`). Client-sent `amount` or `currency` parameters in checkout payloads are ignored.
- **No-Refund Policy**: Digital keepsakes and custom handcrafted services operate under a strict no-refund policy once rendered, personalized, or delivered.
- **Domain Launch Date**: Custom production domain deployment is planned on/after 21 Oct 2026.

---

## 5. PARKED Components (Strict Freeze Enforced)

The following components were placed under strict freeze during the production-readiness pass and were NOT modified:
- **Payment Processing Core**:
  - `src/app/api/checkout/**` (Order creation, verification, Razorpay integration).
  - `src/app/api/webhooks/**` (Razorpay webhook verification, signature checks, event handling).
  - `src/lib/razorpay.ts` (Razorpay client singleton and HMAC calculation).
  - `src/lib/referral-reward.ts` (Referral ledger allocations and credits).
  - `scripts/test-razorpay-flow.mjs` (Payment test suite).
- **Admin Authentication Core**:
  - `src/lib/admin-auth.ts` (Timing-safe authentication, blacklists, session cookies).
  - `src/app/api/admin/login/**` (Admin login endpoint).
- **Pricing Tables**:
  - `src/lib/currency.ts` (All pricing tier constants and currency conversion matrix).
- **Deployment Scripts**:
  - No new external paid services, deployment wrappers, or automated env-push scripts.

---

## 6. Mandatory Environment Variables

In production (`NODE_ENV === "production"`), the server startup hook in [`src/instrumentation.ts`](file:///d:/projects/lovewrit/src/instrumentation.ts) strictly validates that the following 7 environment variable NAMES are defined (failing closed on boot with zero secret leakage if missing):

1. `DATABASE_URL`: Connection string for PostgreSQL database (Supabase pooler).
2. `RAZORPAY_KEY_ID`: Server-side Razorpay Key ID for API requests.
3. `RAZORPAY_KEY_SECRET`: Server-side Razorpay Key Secret for orders and HMAC signatures.
4. `RAZORPAY_WEBHOOK_SECRET`: Secret configured in Razorpay Dashboard for webhook payload signatures.
5. `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Client-safe Razorpay Key ID for initializing the checkout modal.
6. `ADMIN_MASTER_KEY`: Owner-chosen master admin passphrase (minimum 20 characters).
7. `ADMIN_SESSION_SECRET`: Cryptographically random 256-bit hex secret for signing admin session cookies.

---

## 7. Admin Authentication & Key Security

- **Owner-Configured Secret**: Configured locally via `npm run admin:set-key` (`scripts/set-admin-secrets.mjs`) with masked input, double confirmation, minimum 20-character length, and automatic generation of `ADMIN_SESSION_SECRET`.
- **Git History Notice**: The old default master key was present in historical Git commits prior to `2fc055e`. The project owner MUST choose a fresh, unique passphrase and rotate any historical credentials. The old key hash is permanently blacklisted in `src/lib/admin-auth.ts`.
- **Timing-Safe Verification**: All key comparisons utilize `crypto.timingSafeEqual` with pre-hashed SHA-256 buffers.
- **Session Tokens**: Authenticated sessions set `lovewrit_admin_session` cookies with `HttpOnly`, `SameSite=Strict`, and `Secure` attributes.
- **Rate Limiting**: Failed admin login attempts are rate-limited to 5 attempts per 15 minutes per IP (HTTP 429).
- **Fail-Closed**: Unconfigured or invalid keys fail closed with HTTP 503 / 401 without leaking server secret strings.

---

## 8. Two-Tier Moderation Architecture

1. **Host Moderation (`order.adminToken`)**:
   - Buyers receive an unguessable 16-character `adminToken` in their order creation payload.
   - Hosts use this token via `PATCH /api/guestbook` to approve (`APPROVE`) or delete (`DELETE`) entries on their own published page without needing access to the master platform admin dashboard.
2. **Master Platform Admin (`lovewrit_admin_session`)**:
   - Platform owners authenticate via `/api/admin/login` to access the master admin queue (`/admin`), view all orders (`/api/admin/orders`), toggle rush delivery status, and moderate any content platform-wide.
3. **Public Pre-Moderation**:
   - Guestbook submissions on memorial/tribute pages are held in `PENDING` status until approved by the host. Any public visitor can flag inappropriate entries (`action: "FLAG"`).

---

## 9. Verification Status: Logs vs. Real Deployments

### Verified by Automated Logs:
The entire platform is backed by a centralized 28-suite QA runner (`scripts/run-all-qa.js`). Every suite is verified with clean exits (code 0) in automated QA logs (`qa-logs/`):

#### Baseline Platform Suites (21 Suites):
1. **TypeScript Typecheck**: `npx tsc --noEmit` - 0 errors across all ts/tsx files.
2. **Currency Matrix Audit**: `test-currency-matrix.mjs` - 86 / 86 assertions across 4 regions.
3. **Guest Security & Sanitization**: `scripts/test-guest-sanitization.mjs` - 10 / 10 assertions (XSS tags stripped, emojis/RTL preserved, 60 char cap).
4. **Client IP Trust Model**: `scripts/test-client-ip-trust.mjs` - 13 / 13 assertions (Vercel edge headers, non-shared fallback).
5. **Simulated Session Production Guard**: `scripts/test-sim-session-security.mjs` - 3 / 3 assertions (unreachable when NODE_ENV=production).
6. **Client Secret Leak Audit**: `scripts/test-client-secret-leak.mjs` - 5 / 5 assertions (zero secret leaks).
7. **Startup Environment Verification**: `scripts/test-env-check.mjs` - 17 / 17 assertions (fail-closed, zero leaks).
8. **Razorpay Flow & Security Suite**: `scripts/test-razorpay-flow.mjs` - 71 / 71 assertions (HMAC-SHA256 signatures, webhooks, server pricing).
9. **Admin Master Key Security**: `scripts/test-admin-key-security.mjs` - 28 / 28 assertions (timing-safe, zero leaks, fail-closed).
10. **Guestbook Auth & Admin Security**: `scripts/test-guestbook-auth.mjs` - 18 / 18 assertions (host token moderation, admin session, pre-moderation).
11. **Referral & Candle Anti-Abuse**: `scripts/test-referral-and-candle.mjs` - 24 / 24 assertions (concurrency atomic rate limits).
12. **Browser Exports (PDF/PNG/JPG)**: `scripts/verify-real-browser-exports.js` - 4 / 4 exports valid; Foldable PDF < 10 MB.
13. **PDF Rasterization & Sharpness**: `scripts/verify-pdf-rasterization.mjs` - 2 / 2 pages non-blank, DPI >= 150.
14. **Layout & Accessibility Audit**: `scripts/verify-viewport-layout-and-accessibility.mjs` - 252 / 252 checks across 21 templates x 3 page types x 4 viewports (0 overflow, 0 clipped, 0 tap target failures).
15. **Studio Customizer 375px & Order Flow**: `scripts/test-all-8-customizers.mjs` - 21 / 21 templates verified on mobile.
16. **B1 Birthday Pack**: `scripts/verify-birthday-scene-engine.js` - 18 / 18 assertions.
17. **B2 Godhbharai Pack**: `scripts/verify-godhbharai-scene-engine.js` - 16 / 16 assertions.
18. **B3 Sacred Tribute Pack**: `scripts/verify-sacred-tribute-scene-engine.js` - 23 / 23 assertions.
19. **B4 Kitty Celebration Pack**: `scripts/verify-kitty-celebration-scene-engine.js` - 16 / 16 assertions.
20. **B5 Religious Devotional Pack**: `scripts/verify-devotional-scene-engine.js` - 20 / 20 assertions.
21. **Phase C1 Growth Suite**: `scripts/verify-phase-c1-growth.js` - 15 / 15 assertions.

#### Production-Readiness Suites Added in Final Pass (7 Suites):
22. **11 Non-Negotiables Policy Compliance**: `scripts/test-policy-compliance.mjs` - 18 / 18 assertions (zero video, zero fake counters/reviews, zero gender reveal, memorial unbranding, RSVP invite scoping).
23. **Public API Safety & Hostile Input Guard**: `scripts/test-public-api-safety.mjs` - 31 / 31 assertions (hostile payloads, type validation, magic bytes, SQL/NoSQL injection guards).
24. **Security Headers, CSP & Privacy Audit**: `scripts/test-security-headers-and-privacy.mjs` - 29 / 29 assertions (strict CSP, HSTS, frame-ancestors, cookie flags, PII logger masking).
25. **Error Boundaries, Not-Found & Empty States**: `scripts/test-error-and-empty-states.mjs` - 30 / 30 assertions (calm 404/500 screens, zero stack traces, 5-attempt PIN lockout, empty state recovery).
26. **Accessibility & Mobile Standards**: `scripts/test-accessibility-and-mobile.mjs` - 11 / 11 assertions (contrast >= 4.5:1, 44x44px mobile tap targets, focus-visible outlines, img alt, form labels).
27. **Performance, Bundles & Static Assets**: `scripts/test-performance-and-bundles.mjs` - 5 / 5 assertions (zero static files > 300 KB, clean Turbopack build manifest).
28. **Database Schema & PostgreSQL Readiness**: `scripts/test-schema-postgres-readiness.mjs` - 16 / 16 assertions (B-tree indexing across all foreign keys, CUID string portability, full data inventory).

### Unverified / Production Limitations:
- **NO real payment has been processed (test mode only)**: Gateway orders, signatures, and webhooks have been verified against simulated client HTTP boundaries. No live financial credit card or UPI transaction has been charged against a live merchant account.
- **NO deployment has been performed**: Builds have been verified locally with Turbopack and staging flags; no live deployment to a production Vercel project or Supabase PostgreSQL instance has been executed.
- **NO physical phone was tested**: Mobile viewports, customizer flows, and touch target sizes have been verified exclusively in automated Chromium / Edge headless browser emulation at 375px; no physical mobile handset was tested.
- **Domain Setup**: Custom domain registration and DNS propagation are planned on/after 21 Oct 2026.

---

## 10. Owner Actions Checklist Before Production Go-Live

The project owner must execute the following operations prior to accepting live customer payments and traffic:

1. **Rotate Master Admin Key**: Run `npm run admin:set-key` locally to set a fresh, secret `ADMIN_MASTER_KEY` (minimum 20 characters). This automatically generates a matching cryptographically random `ADMIN_SESSION_SECRET`.
2. **Configure Vercel Environment Variables**: Populate the 7 required production variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `ADMIN_MASTER_KEY`
   - `ADMIN_SESSION_SECRET`
3. **Configure Razorpay Test & Live Keys**: Create Razorpay API keys in the Razorpay Dashboard. Configure the webhook endpoint `/api/webhooks/razorpay` subscribing to the three critical events:
   - `payment.captured`
   - `order.paid`
   - `payment.failed`
4. **Enable International Currencies in Razorpay**: Check and enable multi-currency support (USD, EUR, GBP) in the Razorpay Dashboard to accept international card payments.
5. **Perform Real Test-Mode Payment on Mobile**: Execute at least one real test-mode payment on an actual physical Android phone at 375px viewport to verify modal responsiveness, native UPI intent handling, and keyboard behavior.
6. **Migrate to PostgreSQL / Supabase**: Provision a managed production PostgreSQL database (e.g. Supabase), run `prisma migrate deploy`, and verify connection pooling (`pgbouncer`) on port 6543 / direct URL on port 5432.
7. **Conduct Cultural & Faith Reviews**: Have devotional templates reviewed by appropriate faith practitioners (Hindu, Muslim, Sikh, Christian) to ensure ongoing reverence and scriptural accuracy.
8. **Native Indic Typography Review**: Have a native Hindi and Punjabi reader review exported PDF sample prints to ensure accurate conjunct ligatures and aesthetic standards.
9. **Legal Review**: Complete lawyer review of Terms of Service, Privacy Policy, PCPNDT Act compliance, and the digital goods no-refund policy.
10. **Enable Live Mode**: Switch Razorpay keys from test mode to live mode only after the production domain is live on/after 21 Oct 2026.
