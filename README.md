# Lovewrit • Personalized Occasions & Digital Keepsakes

Lovewrit is a commercial web platform where customers create, personalize, and share intimate digital greeting cards and multimedia keepsake mini-websites for life's most meaningful moments.

---

## 🌟 Key Features

- **2 Distinct Fulfillment Formats**:
  - **Digital Card**: Polaroid-style photo keepsake with custom shapes (oval, square, rounded, circle), heartfelt message, and 1-click high-res PNG/JPEG export.
  - **Interactive Page**: Full mini-website with entrance unboxing reveals, background music, rich photo collages (masonry, memory lane timeline, 35mm filmstrip), voice memos, and recipient reply guestbooks.
- **4 Commercial Tiers Across 4 Currencies**:
  - **Tier 1 (Digital Card Self-Service)**: ₹49 / $2 / €2 / £2
  - **Tier 2 (Interactive Page Self-Service)**: ₹99 / $5 / €5 / £5
  - **Tier 3 (Custom Handcrafted Founder Edition)**: ₹499 / $25 / €25 / £25 (Card: ₹149 / $8 / €8 / £8)
  - **Tier 4 (Custom Emergency Rush Priority)**: ₹1,459 / $75 / €75 / £75 (Card: ₹449 / $22 / €22 / £22)
  - **Bundle Addon**: +₹49 / +$3 / +€3 / +£3
- **Multi-Photo Arrangement Tray**:
  - Upload multiple photos at once or add them one-by-one (`+ Add One Photo`).
  - Interactive reordering controls (`← Left`, `Right →`), order badges (`★ #1 Cover`, `#2`, etc.), and individual delete buttons.
- **Dynamic Occasion Engine**:
  - Automatically updates themes, sample messages, and photos when selecting occasions.
  - Interactive proposal question selector (Marry Me, Be My Girlfriend, Be My Boyfriend, Go On A Date) with dodging "No" mechanics.
- **Strictly Confirmed 50% Regift Reply Loop**:
  - Recipient can reply with their own gift and receive 50% off, verified strictly against completed paid orders in the database.
- **Founder VIP Master Pass**:
  - Founder secret key (`lovewrit_master_founder_secret_2026`) enables unlimited free testing with instant order bypass and dedicated template launcher in `/admin`.
- **Emotional Media**:
  - In-browser microphone voice recorder.
  - Timed countdown reveals for surprise moments.
  - Instant scan-ready QR code modal with PNG download.
  - Hindi & Punjabi on-screen phonetic keyboards.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS, Lucide Icons, Canvas Confetti
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Payments**: Stripe Checkout (multi-currency handling: INR, USD, EUR, GBP)
- **Image Generation**: HTML-to-Image client rendering

---

## 🚀 Getting Started

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
ADMIN_MASTER_KEY="lovewrit_master_founder_secret_2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Stripe configuration (falls back to mock success in dev):
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Running the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Admin Dashboard & Founder Pass

- **Admin URL**: `/admin`
- **Master Key**: `lovewrit_master_founder_secret_2026`
- Features:
  - Full order management & metrics
  - Founder order fulfillment queue for Custom & Rush tiers
  - Emergency Rush availability pause switch
  - Direct 1-click **Create Free Lovewrit (Founder Pass)** template launcher

---

## 🧪 Build & Test

```bash
# Verify TypeScript & Next.js production build:
npm run build
```
