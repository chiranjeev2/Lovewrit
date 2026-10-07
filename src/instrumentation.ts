/**
 * Next.js Instrumentation hook executed once at server initialization.
 * Validates required environment variables and runtime configuration.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || !process.env.NEXT_RUNTIME) {
    const { validateEnv } = await import("@/lib/env-check");
    validateEnv();
  }
}

