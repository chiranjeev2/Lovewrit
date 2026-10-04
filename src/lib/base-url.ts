/**
 * Resolves the application base URL dynamically.
 * Prioritizes NEXT_PUBLIC_BASE_URL env var everywhere, with client origin fallback,
 * Vercel deployment URL fallback, and localhost:3000 development fallback.
 * Strictly avoids any hardcoded production domains.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
