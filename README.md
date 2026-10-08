# Lovewrit • Personalized Occasions & Digital Keepsakes

Lovewrit is a full-stack commercial web platform for creating, personalizing, and sharing intimate digital greeting cards and multimedia keepsake mini-websites for life's meaningful moments.

---

## Key Features

- **21 Occasion Templates**:
  - Full thematic coverage: Romantic proposals, anniversaries, birthdays, godhbharai (baby showers), sacred tributes/memorials, kitty party celebrations, and religious devotionals (Hindu, Sikh, Muslim, Christian).
  - Respectful context separation: Sacred memorial and devotional pages enforce solemn tones, zero celebratory animations, and pre-moderated tributes.
- **2 Distinct Fulfillment Formats**:
  - **Digital Card**: High-resolution greeting cards with customizable layouts, frames, photo badges, heartfelt messages, and 1-click printable foldable PDF or PNG export.
  - **Interactive Page**: Multimedia keepsake mini-websites featuring immersive unboxing reveals, scene engine playback, background music, rich photo collages (masonry, filmstrip, timeline), voice notes, and interactive guestbooks.
- **Scene Engine (29 Dynamic Scenes)**:
  - Multi-scene animated storytelling engine supporting custom scene flows, configurable transitions, audio synchronization, and reduced-motion fallbacks.
- **Multi-Currency Commercial Tier Pricing**:
  - Tier 1 (Digital Card Self-Service): ₹49 / $2 / €2 / £2
  - Tier 2 (Interactive Page Self-Service): ₹99 / $5 / €5 / £5
  - Tier 3 (Custom Handcrafted Founder Edition): ₹499 / $25 / €25 / £25 (Card: ₹149 / $8 / €8 / £8)
  - Tier 4 (Custom Emergency Rush Priority): ₹1,459 / $75 / €75 / £75 (Card: ₹449 / $22 / €22 / £22)
  - Bundle Addon: +₹49 / +$3 / +€3 / +£3
- **Payment Infrastructure (Razorpay)**:
  - Server-computed pricing: client amounts are strictly ignored.
  - Cryptographic HMAC-SHA256 signature verification with constant-time equality comparisons (`timingSafeEqual`).
  - Idempotent order verification and webhook processing.
  - Automatic referral credit allocations (awarded exactly once per order).
- **Interactive Features & Social Growth**:
  - 50% regift loop: recipients can reply with their own keepsake at half price, validated against completed paid orders.
  - Guestbook and memorial candle lighting with atomic rate limiting, strict XSS HTML stripping, and host moderation.
  - Hindi & Punjabi phonetic keyboards for bilingual messaging.
  - PIN protection with 5-attempt brute-force lockouts.
- **Security & Privacy**:
  - Strict Content Security Policy (CSP), HSTS, no-sniff, and framed permissions policy.
  - Zero client secret leakage.
  - Admin authentication powered by owner-chosen `ADMIN_MASTER_KEY` (timing-safe, minimum 20 characters).

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS, Lucide Icons, Canvas Confetti
- **Database**: Prisma ORM (SQLite for local development, schema indexed and fully compatible with PostgreSQL)
- **Payments**: Razorpay Node SDK with custom server-side HMAC validation
- **PDF & Canvas Rendering**: jsPDF and sharp for high-DPI rasterization and foldable export generation

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Database Setup

```bash
npx prisma db push
```

### 3. Environment Variables

Create `.env` in the root:

```env
DATABASE_URL="file:./dev.db"
# Owner-chosen random secret (minimum 20 characters)
ADMIN_MASTER_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Razorpay credentials (server-only)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
```

### 4. Running the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Dashboard

- **Admin URL**: `/admin`
- **Authentication**: Requires `ADMIN_MASTER_KEY` configured in the server environment (must be at least 20 characters).
- Features:
  - Real-time order metrics, revenue tracking, and customer search.
  - Founder fulfillment queue for Custom & Rush tiers.
  - Emergency rush availability toggle.
  - Free test order launcher (Founder Pass).

---

## Quality Assurance & Testing

Run all quality checks and test suites:

```bash
# Typecheck
npx tsc --noEmit

# Linting
npx eslint . --max-warnings 0

# Production build
npm run build

# Comprehensive 28-suite QA runner
npm run qa
```
