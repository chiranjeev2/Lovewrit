import { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Extracts normalized client IP address from request headers.
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
