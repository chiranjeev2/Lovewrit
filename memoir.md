# Project Brief: Personalized Occasion Cards & Pages Platform

## What this is
A commercial web platform where customers order personalized digital cards and
mini-websites ("pages") for emotional occasions — primarily couples
(proposals, anniversaries, "sorry" messages, reminiscing) and secondarily
other life events (childbirth/godhbharai/baby showers, funerals, jagrata,
kirtan, kitty parties, birthdays, invites).

This is a **self-funded, bootstrapped** project. Build the smallest working
version first (Phase 1), not the entire feature list at once.

---

## Phase 1 (MVP — build this first)

Scope: **Digital Cards + Template Pages for Couples only.** No AI features
yet. No mobile app yet — web only, responsive.

### Core user flow
1. Customer lands on the site, browses a gallery of templates (couples-focused:
   proposal, anniversary, sorry, reminiscing).
2. Customer picks Digital Card or Template Page.
3. Customer fills a form: name(s), short heartfelt message, photo upload,
   color scheme choice, photo shape choice (oval/square/etc. for cards).
4. Customer selects language: English, Punjabi, or Hindi.
5. Customer pays via Stripe (one-time payment), with price shown based on
   detected region (see Pricing below).
6. System auto-generates:
   - A shareable unique link to the finished page/card
   - A downloadable JPG or PNG version
7. Customer receives both via on-screen confirmation + email.

### Card design requirements
- Central photo area with selectable shape (oval, square, rounded, etc.)
- Optional location field (used for invite-style cards later, not required
  for Phase 1 couples cards)
- Customizable heartfelt message text area
- Selectable color scheme / theme
- Output: downloadable JPG/PNG

### Template Page requirements (richer than a card)
- Supports: photo collage/montage, a message/letter area, optional background
  music track (from a small built-in library — no user upload needed yet)
- Proposal template variant: "Yes/No" button interaction — the "No" button
  visually dodges the cursor on hover/approach so it can't be clicked; "Yes"
  is the only real option
- Each page gets a unique shareable URL (e.g. yoursite.com/p/{short-id})

### Region-based pricing (Phase 1)
Detect region via a combination of:
- IP-based geolocation (best guess, shown before checkout)
- Currency actually used at Stripe checkout (source of truth, confirms/
  overrides region if there's a mismatch)

| Product | Asia/Africa | Americas | Europe | UK |
|---|---|---|---|---|
| Digital Card | ₹49 | $2 | €2 | £2 |
| Template Page | ₹200 | $10 | €10 | £10 |

(Custom and Emergency tiers below are Phase 2+ since they require manual
work from the founder, not pure automation.)

### Admin
- A single admin/"master key" account for the founder to view orders,
  manage templates, and see basic analytics. Keep this simple in Phase 1
  (a basic protected dashboard page is enough — no need for a full admin
  framework yet).

### Tech stack suggestion (adjust to your comfort level)
- **Frontend:** React (or Next.js for easier routing + SEO on the template
  gallery pages)
- **Backend:** Node.js/Express, or Next.js API routes to keep it one
  codebase
- **Database:** PostgreSQL or a simple hosted option like Supabase (handles
  DB + auth + file storage together, good for a solo bootstrapped build)
- **File storage:** Supabase Storage or Cloudflare R2 for uploaded photos
  and generated card images
- **Card/page image generation:** Server-side HTML-to-image rendering
  (e.g. a headless browser tool like Puppeteer, or a canvas-based library)
  to turn the customer's filled template into a downloadable JPG/PNG
- **Payments:** Stripe Checkout (supports multi-currency out of the box)
- **Hosting:** Vercel (frontend + API routes) — simplest option for a solo
  founder, generous free tier to start
- **Domain:** Buy from Namecheap or Google Domains equivalent, point DNS to
  Vercel

---

## Phase 2 (after Phase 1 is live and getting real orders)

- Add Custom Page tier (₹1000/$50/€50/£50) and Emergency/Rush tier
  (₹2000/$100/€100/£100/A$100) — these involve the founder manually
  personalizing a template per order, so build a simple order-queue/
  dashboard for this before launching the tier
- Add multi-template bundle option (2-3 variations per order, buyer picks
  favorite, one revision included)
- Expand occasions beyond couples: birthdays, funerals/memorials, invites,
  pregnancy/godhbharai/baby showers, jagrata/kirtan/kitty party cards
- Add venue/location field for invite-type cards
- Add features: voice message upload, countdown/timed page reveal,
  guestbook/reply wall for the recipient, QR code generator for the page
  link, multi-photo "chapters"/scrolling story format, auto-generated
  video from photos + music, occasion-specific curated soundtrack packs
- Design a dedicated "opening moment" intro animation/experience before
  the recipient sees the main page content (tone should match the
  occasion — playful for proposals, calm for memorials, festive for
  birthdays)
- Add a special/customizable features section as a distinct product area

## Phase 3 (once validated and scaling)

- Integrate AI (e.g. Gemini API or similar): AI-assisted heartfelt message
  writing (language-aware — English/Punjabi/Hindi), AI-stylized photo
  filters (e.g. Ghibli-style rendering)
- Auto-generate video downloads (photos + music, not just static images)
- Consider a mobile app once web traffic/orders justify the investment
- Expand template/language library further based on which occasions and
  languages are actually converting

---

## Instructions for the coding agent

Start with Phase 1 only. Build incrementally:
1. Set up the project skeleton (Next.js + chosen backend/DB)
2. Build the template gallery page (static content is fine to start —
   hardcode 3-5 couple templates)
3. Build the order form + file upload for photos
4. Build the card/page generation logic (server-side rendering to image)
5. Integrate Stripe Checkout with region-based pricing
6. Build the delivery flow (unique link + downloadable file)
7. Build a minimal admin view to see orders

Ask clarifying questions before Phase 2/3 features — do not build ahead of
what's specified above without checking in first.