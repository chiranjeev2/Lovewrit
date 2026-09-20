# Project Brief: Lovewrit — Personalized Occasion Cards & Pages Platform

## What this is
A commercial web platform where customers order personalized digital cards and mini-websites ("pages") for emotional occasions — primarily couples (proposals, anniversaries, "sorry" messages, reminiscing) and secondarily other life events (childbirth/godhbharai/baby showers, memorials, jagrata/kirtan, kitty parties, birthdays, event invites).

This is a **self-funded, bootstrapped** project built incrementally from Phase 1 MVP to Phase 2 Commercial Edition.

---

## 1. Fulfillment Tiers & Multi-Currency Pricing Matrix (Updated)

| Tier | Asia & Africa (INR) | Americas (USD) | Europe (EUR) | UK (GBP) | Fulfillment & Details |
|---|---|---|---|---|---|
| **Tier 1: Digital Card (Self-Service)** | **₹49** | **$2** | **€2** | **£2** | Automated instant generation, 1-3 photo polaroid layout, high-res PNG download, unique link |
| **Tier 2: Interactive Page (Self-Service)** | **₹99** | **$5** | **€5** | **£5** | Automated mini-site, 1-6 photo collage (masonry/timeline/filmstrip), background music, countdown surprise, voice memo |
| **Tier 3: Custom Handcrafted (Founder Styled)** | **₹499** (Card: ₹149) | **$25** (Card: $8) | **€25** (Card: €8) | **£25** (Card: £8) | Handcrafted founder review, custom typography, color adjustments, special buyer instructions (24-48h) |
| **Tier 4: Custom Emergency Rush** | **₹1,459** (Card: ₹449) | **$75** (Card: $22) | **€75** (Card: €22) | **£75** (Card: £22) | Priority queue jump, same-day expedited delivery (6-12h), founder priority queue toggle |
| **Multi-Template Bundle Addon** | **+₹49** | **+$3** | **+€3** | **+£3** | 2-3 variations with favorite pick |

---

## 2. Platform Architecture & Feature Specifications

### Core Engine & Tech Stack
- **Frontend & Fullstack API:** Next.js 16 (App Router, Turbopack, React 19, TypeScript, Tailwind CSS)
- **Database:** Prisma ORM with SQLite (local development) / PostgreSQL (production)
- **Payments:** Stripe Checkout with multi-currency handling + Founder VIP master key bypass
- **Audio & Media:** Web Audio API, native HTML5 media recorder, client-side dynamic preview canvas

### Phase 1 Features (Completed)
1. **Couples Occasion Catalog**:
   - Romantic Proposal (`midnight-rose`, `be-my-girlfriend`)
   - Anniversary Celebration (`golden-anniversary`, `modern-romance`)
   - Apology / Forgiveness (`from-my-heart`)
   - Memory Lane / Nostalgia (`sweet-reminiscing`)
2. **Digital Card vs Interactive Page Formats**:
   - Card: Framed polaroid cards, selectable shapes (oval, square, rounded, circle), high-res PNG/JPEG export.
   - Page: Full-bleed emotional mini-website, animated entrance reveals, soundtrack playback.
3. **Region Detection & Multi-Currency**:
   - Auto-detects INR (₹), USD ($), EUR (€), GBP (£).

### Phase 2 Commercial Features (Completed)
1. **Multi-Photo Arrangement Tray & One-by-One Upload**:
   - Upload multiple photos simultaneously or add them one-by-one via `+ Add One Photo`.
   - Visual photo management tray with thumbnails, `#1 Cover` badge, and `← Left` / `Right →` reordering controls.
   - Limit enforcement: up to 3 photos for Digital Cards, up to 6 photos for Interactive Pages.
2. **Dynamic Occasion & Theme Customizer**:
   - Switching occasions automatically swaps color themes, sample heartfelt letters, and sample photos.
   - Proposal customizer (Marry Me, Be My Girlfriend, Be My Boyfriend, Go On A Date) with dodging "No" button appears strictly on romantic proposal occasions.
3. **Confirmed-Only 50% Regift Discount**:
   - Viral reply loop: recipient viewing their card/page can click *"Reply with Gift (50% OFF)"*.
   - Strictly locked against genuine paid orders in the database — no arbitrary promo code entry loopholes.
4. **Founder VIP Master Pass**:
   - Master key `lovewrit_master_founder_secret_2026` allows the founder to generate unlimited free test cards/pages with instant ₹0 bypass.
   - Dedicated template launcher in `/admin` with persistent `localStorage` access.
5. **Expanded Life Occasions**:
   - Birthdays: `festive-birthday` with balloon pop unboxing & celebratory music.
   - Memorials: `in-loving-memory` with serene candle-lighting reveal & pre-moderated condolence wall.
   - Baby Showers / Godhbharai: `godhbharai-blessings` with baby lullaby soundtrack & venue directions.
   - Devotional: `jagrata-kirtan-invitation` with traditional Aarti/Bhajan soundtrack & temple map.
   - Social: `chic-kitty-party` with high-tea theme, dress code, & RSVP registry.
6. **Voice Memo Upload & Direct Recording**:
   - In-browser microphone recorder allowing buyers to speak their emotions directly into the gift (max 2MB / 90s).
7. **Timed Surprise Countdown Reveal**:
   - Reveal countdown timer with 1-click presets ("Tonight at Midnight", "Tomorrow Morning", "In 24 Hours", "This Weekend").
8. **QR Code Generator**:
   - Instant scan-ready QR code modal with 1-click PNG download for physical cards and gift boxes.
9. **Multilingual Keyboard Support**:
   - On-screen phonetic virtual keyboards for Hindi and Punjabi script entry.
10. **Founder Fulfillment Queue & Rush Availability Switch**:
    - Dedicated `/admin` tab for tracking and fulfilling Custom and Rush orders with priority badges.
11. **Interactive RSVP & Guest Registry**:
    - Dual-branch architecture: live attendance counter, headcount selector (`1` to `5+`), blessing/note submission, and host 1-click CSV export on event/invitation templates.
12. **Occasion-Specific Unboxing Reveals & Curated Audio**:
    - Tailored interactive reveal rituals: Wax-sealed envelope unsealing for Apology/Letter, Diya flame lighting ceremony (*दीप प्रज्वलन*) for Devotional, Marigold petal shower for Baby Showers, and Balloon pop for Birthdays with paired ambient tracks.
13. **Foldable Printable PDF Keepsake Export**:
    - Standard 5×7" bi-fold greeting card (10×7" flat landscape sheet) featuring front design, inside heartfelt message (bilingual & handwriting support), and back panel with digital keepsake QR code.
14. **Legal Compliance & Checkout Protection**:
    - Dedicated `/privacy`, `/terms`, and `/faq` routes linked in footer, with a mandatory checkout agreement checkbox blocking payment until accepted.

---

## 3. Roadmap & Strategic Direction

### Phase 3 (Scaling & Automation)
- **AI-Powered Heartfelt Writing Assistant**: Multilingual emotion-guided letter writer (English, Hindi, Punjabi) powered by Gemini API.
- **AI Stylized Photos**: Optional cartoon/Ghibli/watercolor artistic filters for user photos.
- **Automated Video Montage Generator**: Server-side MP4 generation compiling photos, message captions, and audio into an exportable video for Instagram/WhatsApp status.
- **Production Cloud Deployment & Custom Domain**: PostgreSQL migration (Supabase/Neon), production Stripe webhooks, and live domain configuration.
- **Mobile Native App**: React Native / Flutter wrapper once web sales reach target volume.