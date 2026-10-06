import crypto from "crypto";
import { NextRequest } from "next/server";
import { getClientIp } from "@/lib/security";

export const ADMIN_COOKIE_NAME = "lovewrit_admin_session";

// Precomputed SHA-256 hashes of previous default/known keys (strictly blacklisted)
const BLACKLISTED_KEY_HASHES = new Set([
  "aa007f0624cb0bbbe2155790f4dc765ddc46df9de6cce019cf5ce77d3678a6a1",
  "e14b05c189b8e1f9c74acc45f65a1b445af82dc1c63b2e0231eb7a163717ceaa",
  "39d12776fdfba46e73475cff4df621f587d57228f68be0dc96e5832e31f1ff8d",
]);

/**
 * Checks whether the server environment has a valid owner-configured ADMIN_MASTER_KEY.
 * Must be present, at least 20 characters, and not in the blacklist of legacy/default keys.
 */
export function isServerAdminKeyConfigured(): boolean {
  const envKey = process.env.ADMIN_MASTER_KEY;
  if (!envKey || typeof envKey !== "string") {
    return false;
  }
  const trimmed = envKey.trim();
  if (trimmed.length < 20) {
    return false;
  }
  const hash = crypto.createHash("sha256").update(trimmed).digest("hex");
  if (BLACKLISTED_KEY_HASHES.has(hash)) {
    return false;
  }
  return true;
}

/**
 * Compares an input key against the configured ADMIN_MASTER_KEY using timing-safe comparison.
 * Hashes both sides to SHA-256 before comparing equal-length buffers.
 */
export function verifyAdminMasterKey(providedKey?: string | null): boolean {
  if (!isServerAdminKeyConfigured() || !providedKey || typeof providedKey !== "string") {
    return false;
  }
  const envKey = process.env.ADMIN_MASTER_KEY!.trim();
  const input = providedKey.trim();

  if (input.length < 20) {
    return false;
  }

  const inputHash = crypto.createHash("sha256").update(input).digest();
  const expectedHash = crypto.createHash("sha256").update(envKey).digest();

  return crypto.timingSafeEqual(inputHash, expectedHash);
}

/**
 * Generates an HMAC-signed session token for the authenticated admin session cookie.
 */
export function generateAdminSessionToken(): string {
  if (!isServerAdminKeyConfigured()) {
    throw new Error("Cannot generate admin session token: ADMIN_MASTER_KEY is not configured.");
  }
  const envKey = process.env.ADMIN_MASTER_KEY!.trim();
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac("sha256", envKey).update(`admin:${timestamp}`).digest("hex");
  return `${timestamp}.${hmac}`;
}

/**
 * Verifies the admin session cookie token. Short expiry (2 hours).
 */
export function verifyAdminSessionToken(token?: string | null, maxAgeMs = 2 * 60 * 60 * 1000): boolean {
  if (!isServerAdminKeyConfigured() || !token || typeof token !== "string") {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [timestampStr, receivedHmac] = parts;
  if (!timestampStr || !receivedHmac) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs || timestamp > Date.now() + 5000) {
    return false;
  }

  const envKey = process.env.ADMIN_MASTER_KEY!.trim();
  const expectedHmac = crypto.createHmac("sha256", envKey).update(`admin:${timestampStr}`).digest("hex");

  const a = Buffer.from(receivedHmac, "utf-8");
  const b = Buffer.from(expectedHmac, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Validates request authorization for admin API endpoints.
 * Returns { authorized, serviceUnavailable }.
 */
export function isRequestAdminAuthorized(req: NextRequest): { authorized: boolean; serviceUnavailable: boolean } {
  if (!isServerAdminKeyConfigured()) {
    return { authorized: false, serviceUnavailable: true };
  }

  // 1. Session cookie check
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken && verifyAdminSessionToken(cookieToken)) {
    return { authorized: true, serviceUnavailable: false };
  }

  // 2. Header key check (e.g. for CLI/scripts)
  const headerKey = req.headers.get("x-admin-key");
  if (headerKey && verifyAdminMasterKey(headerKey)) {
    return { authorized: true, serviceUnavailable: false };
  }

  return { authorized: false, serviceUnavailable: false };
}

const loginRateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate-limits admin login attempts by client IP and device cookie (5 attempts per 15 minutes).
 */
export async function checkAdminLoginRateLimit(req: NextRequest): Promise<{ allowed: boolean; remaining: number }> {
  const clientIp = getClientIp(req);
  const deviceId = req.cookies.get("lovewrit_device_id")?.value;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;

  const keysToCheck = [`ip:${clientIp}`];
  if (deviceId) {
    keysToCheck.push(`dev:${deviceId}`);
  }

  for (const key of keysToCheck) {
    const record = loginRateLimitMap.get(key);
    if (record && record.resetAt > now) {
      if (record.count >= maxAttempts) {
        return { allowed: false, remaining: 0 };
      }
    }
  }

  let minRemaining = maxAttempts;
  for (const key of keysToCheck) {
    const record = loginRateLimitMap.get(key);
    if (!record || record.resetAt <= now) {
      loginRateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      minRemaining = Math.min(minRemaining, maxAttempts - 1);
    } else {
      record.count += 1;
      minRemaining = Math.min(minRemaining, Math.max(0, maxAttempts - record.count));
    }
  }

  return { allowed: true, remaining: minRemaining };
}
