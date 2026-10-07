/**
 * Server startup environment variable verification.
 * 
 * Rules:
 * - When NODE_ENV === "production", validates presence of all mission-critical production secrets.
 * - Fails-closed with an error listing variable NAMES ONLY if any are missing.
 * - In non-production (development, test, QA), logs warnings for missing variables without crashing.
 * - Never prints, logs, or formats secret values.
 */

export const REQUIRED_PRODUCTION_VARS = [
  "DATABASE_URL",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "ADMIN_MASTER_KEY",
  "ADMIN_SESSION_SECRET",
] as const;

export interface EnvCheckResult {
  valid: boolean;
  missing: string[];
}

export function validateEnv(env: Record<string, string | undefined> = process.env): EnvCheckResult {
  const missing: string[] = [];

  for (const varName of REQUIRED_PRODUCTION_VARS) {
    const val = env[varName];
    if (!val || val.trim().length === 0) {
      missing.push(varName);
    }
  }

  const isProd = env.NODE_ENV === "production";

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(", ")}`;

    if (isProd) {
      console.error(`[CRITICAL STARTUP ERROR] ${message}`);
      throw new Error(`Production startup aborted. ${message}`);
    } else {
      console.warn(`[STARTUP WARNING] ${message}. Allowed in development/QA mode.`);
    }

    return { valid: false, missing };
  }

  return { valid: true, missing: [] };
}
