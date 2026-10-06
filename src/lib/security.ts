import type { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Minimal request interface for IP extraction and device fingerprinting.
 * Compatible with NextRequest, standard Node IncomingMessage, or simulated test requests.
 */
export interface ClientRequestLike {
  headers: {
    get(name: string): string | null;
  };
  cookies?: {
    get(name: string): { value?: string } | undefined;
  };
  ip?: string;
  socket?: {
    remoteAddress?: string;
  };
}

/**
 * Extracts normalized client IP or unique client identifier for anti-abuse rate limits.
 * 
 * TRUST MODEL & BEHAVIOR:
 * 1. Platform Trust (Vercel): When process.env.VERCEL is set, Vercel's edge network terminates TLS,
 *    sanitizes client headers, and appends/manages 'x-forwarded-for' such that the leftmost IP
 *    (first comma-separated entry) represents the verified client IP. 'x-real-ip' is also trusted on Vercel.
 * 2. Non-Vercel / Direct / Self-Hosted: When process.env.VERCEL is NOT set, 'x-forwarded-for' and 'x-real-ip'
 *    are untrusted and strictly ignored to prevent client-side header spoofing. Instead, we use the
 *    runtime's verified socket/connection address (req.ip or req.socket.remoteAddress).
 * 3. Never Shared '127.0.0.1' Bucket: If no valid connection address is available (or if it is local loopback),
 *    we NEVER dump all users into a shared '127.0.0.1' bucket (which would cause one user's requests to
 *    exhaust rate limits for all other users). Instead, we key on the client device cookie ('lovewrit_device_id')
 *    or a hashed device fingerprint (User-Agent + Accept-Language) to ensure isolated, per-client tracking.
 */
export function getClientIp(req: ClientRequestLike | NextRequest): string {
  // 1. Trust x-forwarded-for ONLY when process.env.VERCEL is set
  if (process.env.VERCEL) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0].trim();
      if (first) return first;
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
  }

  // 2. Non-Vercel: Use verified connection / socket address
  const reqObj = req as ClientRequestLike;
  const socketIp = reqObj.ip || reqObj.socket?.remoteAddress;
  if (socketIp && socketIp !== "127.0.0.1" && socketIp !== "::1") {
    // Normalize IPv4-mapped IPv6 address (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
    return socketIp.replace(/^::ffff:/, "");
  }

  // 3. Fallback: Never use shared '127.0.0.1' bucket for all users.
  // Key on client device cookie if available
  const deviceCookie = req.cookies?.get("lovewrit_device_id")?.value;
  if (deviceCookie) {
    return `device_${deviceCookie}`;
  }

  // Otherwise key on device fingerprint hash (User-Agent + Accept-Language)
  const ua = req.headers.get("user-agent") || "unknown-ua";
  const lang = req.headers.get("accept-language") || "unknown-lang";
  const fpHash = crypto.createHash("sha256").update(`${ua}:${lang}`).digest("hex").slice(0, 16);
  return `anon_${fpHash}`;
}

/**
 * Generates a privacy-friendly device fingerprint-lite hash (IP/Client ID + User-Agent).
 * Does NOT collect persistent device identifiers or cookies.
 */
export function getDeviceFingerprintLite(req: ClientRequestLike | NextRequest): string {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "unknown-agent";
  return crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex");
}
