import { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Extracts normalized client IP address from request headers.
 * 
 * TRUST MODEL & BEHAVIOR:
 * 1. Platform Trust (Vercel): When deployed on Vercel, Vercel's edge network terminates TLS,
 *    strips untrusted client headers, and appends/manages 'x-forwarded-for' such that the leftmost
 *    IP (first comma-separated entry) represents the verified client address. Vercel also injects
 *    the verified IP in 'x-real-ip'.
 * 2. Self-Hosted / Generic Edge: In environments outside Vercel, 'x-forwarded-for' is only as trustworthy
 *    as the ingress reverse-proxy (e.g. Cloudflare, AWS ALB, Nginx). Ingress proxies must be configured
 *    to sanitize/strip incoming client-provided 'x-forwarded-for' headers to prevent spoofing.
 * 3. Fallback: If neither header is present (e.g. direct local development or tests), falls back to '127.0.0.1'.
 * 4. Multi-Layer Defense: In anti-abuse contexts (referral credit & candle counters), Lovewrit does not
 *    rely solely on IP. IP rate-limiting is combined with client device cookies (24-hour retention),
 *    localStorage checks, and hashed device fingerprints (IP + User-Agent via getDeviceFingerprintLite)
 *    to prevent evasion via single header alterations.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Generates a privacy-friendly device fingerprint-lite hash (IP + User-Agent).
 * Does NOT collect persistent device identifiers or cookies.
 */
export function getDeviceFingerprintLite(req: NextRequest): string {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "unknown-agent";
  return crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex");
}
