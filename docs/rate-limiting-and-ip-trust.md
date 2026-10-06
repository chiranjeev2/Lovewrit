# Rate Limiting & Client IP Trust Model

## 1. Architectural Overview

Lovewrit uses client IP and device identity for anti-abuse protections:
- **Referral Credits:** Preventing self-referral abuse and daily credit granting caps.
- **Tribute Candles:** Limiting lighting to 1 per device per 24 hours, and 25 per IP per day for shared family/work networks.
- **Moderation Actions:** Memorial tribute wall submissions.

## 2. Header Trust Matrix

| Platform / Environment | `x-forwarded-for` Trust | Resolution Mechanism |
| :--- | :--- | :--- |
| **Vercel Edge Network** (`process.env.VERCEL` is set) | **Trusted** | Leftmost IP in `x-forwarded-for` (managed and sanitized by Vercel edge proxy) or `x-real-ip`. |
| **Non-Vercel / Direct / Self-Hosted** (`process.env.VERCEL` not set) | **Untrusted** | Ignored to prevent header spoofing. Relies on runtime socket/connection address (`req.ip` or `socket.remoteAddress`). |
| **No Connection Address / Local Loopback** (`127.0.0.1`, `::1`) | **Isolated Per-Client Fallback** | **Never dumps into a shared '127.0.0.1' bucket.** Keys on device cookie (`lovewrit_device_id`) or hashed device fingerprint (`anon_<sha256(UA:Lang)>`). |

## 3. Guarantees Against Rate-Limit Collisions

1. **No Shared Loopback Pool:** Multiple users browsing behind a local proxy or client without socket IP will never share a single rate-limiting quota.
2. **Multi-Layer Verification:** IP rate-limiting is always paired with device-level cookies (24h TTL) and device fingerprints so that modifying a single header cannot circumvent protections.

