# Lovewrit API Surface & Security Specification

This document inventories every HTTP route handler across Lovewrit, detailing its HTTP method, authentication model, rate limiting policies, and input validation rules.

---

## Public Non-Payment API Routes

### 1. `/api/guestbook`
- **Methods**: `GET`, `POST`, `PATCH`
- **Authentication**:
  - `GET`: Public (returns approved entries; or all entries if creator token or master admin session provided).
  - `POST`: Public (guest submission). Memorial pages (`isMemorial`) automatically forced to `PENDING` status.
  - `PATCH`: Public for `action: "FLAG"`; Host token (`order.adminToken`) or master admin session (`lovewrit_admin_session`) required for `APPROVE` or `DELETE`.
- **Rate Limit**:
  - `POST`: 15 requests / minute per client IP. Returns HTTP 429 with `Retry-After: 60`.
  - `PATCH`: 20 requests / minute per client IP. Returns HTTP 429 with `Retry-After: 60`.
- **Input Validation**:
  - Max body size: 200 KB (HTTP 413 if exceeded).
  - `slug`: Alphanumeric string, 2–120 characters (`/^[a-zA-Z0-9_\-]+$/`).
  - `authorName`: 1–60 characters, HTML tags stripped, emojis and RTL scripts preserved.
  - `message`: 1–1500 characters, script tags stripped.
  - `attendance`: Enum (`"ATTENDING" | "REGRETS" | "MESSAGE_ONLY"`).
  - `headcount`: Integer between 1 and 50.

### 2. `/api/reactions`
- **Methods**: `GET`, `POST`
- **Authentication**: Public.
- **Rate Limit**:
  - `POST`: 20 requests / minute per client IP. Returns HTTP 429 with `Retry-After: 60`.
- **Input Validation**:
  - Max body size: 100 KB (HTTP 413 if exceeded).
  - `slug` or `pageDataId`: Validated format, max 120 characters.
  - `senderName`: String, max 60 characters.
  - `reactionType`: Enum (`"text" | "voice" | "preset" | "emoji"`).
  - `message`: String, max 1000 characters.
  - `voiceUrl`: Upload URL starting with `/uploads/`, max 500 characters.

### 3. `/api/referral`
- **Methods**: `GET`, `POST`
- **Authentication**: Public.
- **Rate Limit**:
  - `POST`: 10 requests / minute per client IP. Max 3 active codes created per email (HTTP 429).
- **Input Validation**:
  - Max body size: 50 KB (HTTP 413 if exceeded).
  - `name`: 2–60 characters.
  - `email`: Valid RFC email regex, max 120 characters.
  - `preferredCode`: Optional uppercase alphanumeric candidate, 3–12 characters.

### 4. `/api/reply/verify`
- **Methods**: `GET`
- **Authentication**: Public.
- **Rate Limit**:
  - `GET`: 30 requests / minute per client IP. Returns HTTP 429 with `Retry-After: 60`.
- **Input Validation**:
  - `slug`: Alphanumeric string, 2–120 characters.

### 5. `/api/tribute/candle`
- **Methods**: `GET`, `POST`
- **Authentication**: Public.
- **Rate Limit**:
  - `POST`: 25 kindles per 24 hours per client IP (HTTP 429 with `Retry-After: 86400`). 24-hour client device cookie prevents duplicate submissions from same device.
- **Input Validation**:
  - Max body size: 50 KB (HTTP 413 if exceeded).
  - `slug`: Alphanumeric string, 2–120 characters.

### 6. `/api/upload`
- **Methods**: `POST`
- **Authentication**: Public (creation studio & voice messages).
- **Rate Limit**:
  - `POST`: 20 uploads / minute per client IP. Returns HTTP 429 with `Retry-After: 60`.
- **Input Validation**:
  - Max body size: 15 MB (HTTP 413 if exceeded).
  - Count limit: Exactly 1 file per upload request.
  - Size limits: Image <= 10 MB, Audio <= 15 MB, Voice memo <= 2 MB.
  - Deep Magic Bytes: Verified against binary signatures (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WEBP: `RIFF...WEBP`, HEIC: `ftyp`, MP3/WAV/OGG/WEBM audio).
  - Security exclusions: SVG, XML, HTML, and all video formats (`mp4`, `mkv`, `avi`, `mov`) are strictly prohibited and rejected.
  - Path traversal guard: Filenames generated via `Date.now() + kind + nanoid(16) + extension`. Destination verified to remain strictly within `public/uploads`.

### 7. `/api/analytics/funnel`
- **Methods**: `GET`, `POST`
- **Authentication**: Public (anonymous conversion tracking).
- **Rate Limit**:
  - `POST`: 60 requests / minute per client IP. Returns HTTP 429 with `Retry-After: 60`.
- **Input Validation**:
  - Max body size: 20 KB (HTTP 413 if exceeded).
  - `step`: Enum (`"visit" | "customizer" | "checkout" | "paid"`).

---

## Admin Protected Routes

### 8. `/api/admin/login`
- **Methods**: `POST`, `DELETE`
- **Authentication**: Owner-configured `ADMIN_MASTER_KEY` via `crypto.timingSafeEqual` with SHA-256 pre-hashing. Sets `lovewrit_admin_session` cookie (`HttpOnly`, `SameSite=Strict`, `Secure`).
- **Rate Limit**: Max 5 attempts per 15 minutes per client IP. Returns HTTP 429 with `Retry-After: 900`.
- **Input Validation**: Minimum 20 characters; blacklisted historical keys rejected.

### 9. `/api/admin/orders`
- **Methods**: `GET`
- **Authentication**: `lovewrit_admin_session` cookie or `ADMIN_MASTER_KEY` bearer token. Fails closed with HTTP 401 / 503.
- **Rate Limit**: Admin session bound.
- **Input Validation**: Query parameters sanitized.

### 10. `/api/admin/queue`
- **Methods**: `GET`, `PATCH`
- **Authentication**: Master admin session required.
- **Rate Limit**: Admin session bound.
- **Input Validation**: `orderId`, `status` (`"PENDING" | "PROCESSING" | "DELIVERED"`).

### 11. `/api/admin/occasions`
- **Methods**: `GET`, `POST`
- **Authentication**: Master admin session required.
- **Rate Limit**: Admin session bound.
- **Input Validation**: `key`, `name`, `theme`, `date`.

---

## Payment Routes (Frozen Architecture)

### 12. `/api/checkout`
- **Methods**: `POST`
- **Authentication**: Public checkout.
- **Rate Limit**: Server-side rate limiting on free orders (5 per 24 hours per IP).
- **Input Validation**: Server computes amount and currency via `calculateOrderTotal`; client `amount` ignored. Simulated checkouts rejected with HTTP 500 when `NODE_ENV === "production"`.

### 13. `/api/checkout/verify`
- **Methods**: `GET`, `POST`
- **Authentication**:
  - `GET`: Session ID check; `sim_` sessions rejected with HTTP 403 when `NODE_ENV === "production"`.
  - `POST`: Razorpay payment signature verified via `crypto.timingSafeEqual`. Validates matching `razorpayOrderId`, `amountTotal`, and `currency`. Idempotent single referral credit.

### 14. `/api/webhooks/razorpay`
- **Methods**: `POST`
- **Authentication**: HMAC-SHA256 signature verification over raw request body with `RAZORPAY_WEBHOOK_SECRET` via `crypto.timingSafeEqual`.
- **Rate Limit**: Webhook ingest; duplicate events idempotent.
- **Input Validation**: Structured Razorpay event payloads (`order.paid`, `payment.captured`, `payment.failed`).

