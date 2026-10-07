# Architecture & Hardening Decisions

This document records architectural, security, and verification decisions made during the final hardening pass on \`main\`.

---

## 1. Integrity Check of Last Merge

### File Recreation and Integrity Audit
- In the prior run, four files were verified and restored to match their exact intended content:
  - \`docs/payments.md\` (544 bytes)
  - \`scripts/test-admin-key-security.mjs\` (7,832 bytes)
  - \`scripts/test-client-secret-leak.mjs\` (3,432 bytes)
  - \`scripts/test-razorpay-flow.mjs\` (7,780 bytes)
- **What was lost**: Nothing was lost in application or test code. The files were restored verbatim from Git history.
- **Cookie Casing Assertion Change**:
  - Original: \`assert(cookieHeader.includes("SameSite=Strict"), ...)\`
  - Updated: \`assert(/samesite=strict/i.test(cookieHeader), ...)\`
  - **Rationale & Proof of Non-Weakening**: Per RFC 6265 Section 5.2, cookie attribute names and values (such as \`HttpOnly\`, \`SameSite=strict\`) are case-insensitive. Next.js / \`NextResponse.cookies.set({ sameSite: "strict" })\` emits lowercase \`SameSite=strict\` in the HTTP \`Set-Cookie\` header. The regex test enforces that the cookie contains the mandatory \`SameSite=Strict\` attribute without failing due to letter casing differences emitted across varying Node/Next.js versions.

### ESLint Rules Audit against Pre-Razorpay Commit (9bb9821)
- In commit \`9bb9821\`, the following rules had been turned off in \`eslint.config.mjs\`:
  1. \`react-hooks/purity\`
  2. \`react-hooks/set-state-in-effect\`
  3. \`react-hooks/exhaustive-deps\`
  4. \`@typescript-eslint/no-unused-vars\`
  5. \`@next/next/no-img-element\`
- **Remediation**: All 5 rules were re-enabled by deleting the rule overrides from \`eslint.config.mjs\` in commit \`f78d639\`. All 38 underlying source files were refactored at source in commit \`5a5c1d3\` (replacing impure Date.now() calls in render with deferred state, wrapping effects with proper dependencies, cleaning unused variables/imports, and replacing \`<img>\` tags with Next.js \`<Image>\` components).
- Current status: Zero disabled rules, 0 errors, 0 warnings.

---

## 2. Payment Integration Tests & Gateway Boundary Hardening

### Real Route Handlers Execution
- Migrated payment tests in `scripts/test-razorpay-flow.mjs` from replicated mock math to directly importing and invoking the real Next.js route handlers (`POST` in `src/app/api/checkout/route.ts`, `POST` and `GET` in `src/app/api/checkout/verify/route.ts`, and `POST` in `src/app/api/webhooks/razorpay/route.ts`).
- Mocking boundary: Gateway calls to Razorpay are intercepted strictly at the HTTP/client boundary via `setRazorpayClient` in `src/lib/razorpay.ts`.

### Security & Idempotency Rules Enforced
1. **Client-Sent Amount & Currency Ignored**:
   - `POST /api/checkout` calculates `totalUnit` strictly via server-side pricing engine (`calculateOrderTotal`). Client-sent `amount` in payload is ignored. Unsupported currencies default to the detected region currency.
2. **Strict Verification Mismatch Checks**:
   - `POST /api/checkout/verify` checks for `razorpay_order_id` mismatch with the database order, rejecting with HTTP 400.
   - If `amount` or `currency` are supplied by caller in verify request, they must match `order.amountTotal` and `order.currency`, else HTTP 400 is returned.
3. **Idempotency & Single Referral Credit**:
   - Extracted shared atomic referral crediting helper into `src/lib/referral-reward.ts` (`creditReferrerForOrder`).
   - Transitioning an order to `PAID` via `POST /api/checkout/verify` credits the referrer once. A second verify call returns `{ success: true, order }` without double-crediting.
   - For webhooks, receiving both `payment.captured` and `order.paid` for the same order credits the referrer exactly once via `REFERRAL_CREDITED:${order.id}` atomic audit gating.
4. **Webhook Signature Security**:
   - Missing or forged `x-razorpay-signature` returns HTTP 400.
   - Raw request body (`req.text()`) is used for HMAC-SHA256 signature verification.
   - Unknown/unhandled events return HTTP 200 `{ received: true }` with no database state change.
5. **Pricing Engine Coverage & 50% Regift**:
   - Pricing unit assertions cover all 4 regions (`asia_africa`, `americas`, `europe`, `uk`), all product tiers (`CARD`, `PAGE`, `SELF_SERVICE`, `CUSTOM`, `RUSH`), bundle add-ons, and referral discounts (₹49 / $2 / €2 / £2).
   - The 50% Regift feature is actively supported in product code (`/c/[slug]`, `/p/[slug]`, `/create/[templateId]`, `/api/reply/verify`) and verified to halve the order price.
6. **Production Lock on Simulated Sessions**:
   - Both `POST /api/checkout` and `GET /api/checkout/verify` strictly fail-closed with HTTP 500 / HTTP 403 respectively when `NODE_ENV=production` and `sim_` session or simulation is attempted.
7. **Non-INR Gateway Rejections**:
   - When Razorpay orders API returns an error for non-INR currencies, the error code and description are logged server-side, a clear error message is returned to the buyer, and the currency is preserved without silently converting to INR.

---

## 3. Admin & Key Management Architecture

### Git History Audit of Legacy Master Keys
- Ran `git log --all -S <blacklisted-hash> --name-only` to audit historical presence of default master keys.
- **Finding**: Legacy default keys existed in commits prior to `2fc055e`. They were fully purged from active code, templates, tests, and environment documentation in commit `2fc055e`.
- **Compromise Status & Remediation**: All legacy default keys are treated as compromised. Their SHA-256 digests (`aa007f...`, `e14b05...`, `39d127...`) are hardcoded into `BLACKLISTED_KEY_HASHES` across `src/lib/admin-auth.ts` and `scripts/set-admin-secrets.mjs`. Any configuration using these keys fails closed immediately (HTTP 503).

### Owner Secret Generation Tool (`scripts/set-admin-secrets.mjs`)
- Added npm command: `npm run admin:set-key` -> `node scripts/set-admin-secrets.mjs`.
- **Interactive Security**: Prompts for master key using masked terminal input (no character echoing). Prompts twice for confirmation. Requires a minimum length of 20 characters. Refuses any key whose SHA-256 digest matches blacklisted legacy defaults.
- **Session Secret Generation**: Generates a high-entropy 256-bit `ADMIN_SESSION_SECRET` via `crypto.randomBytes(32).toString("hex")`.
- **Storage Safety**: Asserts that `.env` is ignored by Git using `git check-ignore .env` before writing. Updates `.env` locally without printing or logging secret values.

### Guestbook Authorization & Moderation Model
- Validated and tested in `scripts/test-guestbook-auth.mjs`:
  1. **Public Posting**: `POST /api/guestbook` is completely open to all guests. No admin token or session cookie is required.
  2. **Public Viewing**: `GET /api/guestbook` returns approved entries for all visitors. Pending entries are shielded from public view when `requireGuestbookApproval=true`.
  3. **Host Moderation**: Hosts approve or delete entries using their keepsake's secret `order.adminToken` via `PATCH /api/guestbook`. No master admin session is required for hosts to moderate their own guestbook.
  4. **Community Flagging**: Any visitor can flag an abusive entry (`action: "FLAG"`) without authentication.
  5. **Master Admin Oversight**: Authenticated master admin sessions can approve or delete entries across any keepsake without requiring the host's token.
  6. **Fail-Closed Protection**: Any moderation attempt with an invalid token or missing credentials strictly fails closed with HTTP 403 Forbidden.
  7. **Admin Login Hardening**: Rate limiting enforces max 5 failed attempts per 15 minutes (HTTP 429), timing-safe SHA-256 comparison prevents timing side-channels, and error responses never leak key values.


