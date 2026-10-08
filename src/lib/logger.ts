/**
 * Privacy-protecting logger utility.
 * Redacts PII (emails, phone numbers, bearer tokens, passwords) before printing to stdout/stderr.
 */

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const BEARER_PATTERN = /Bearer\s+[a-zA-Z0-9_\-.]+/gi;
const SECRET_PATTERN = /(password|secret|key|token|auth)\s*[:=]\s*["']?([^"',\s]+)/gi;

export function redactSensitiveData(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(EMAIL_PATTERN, "[REDACTED_EMAIL]")
    .replace(PHONE_PATTERN, "[REDACTED_PHONE]")
    .replace(BEARER_PATTERN, "Bearer [REDACTED_TOKEN]")
    .replace(SECRET_PATTERN, "$1=[REDACTED_SECRET]");
}

function formatArg(arg: unknown): unknown {
  if (typeof arg === "string") {
    return redactSensitiveData(arg);
  }
  if (arg instanceof Error) {
    return `${arg.name}: ${redactSensitiveData(arg.message)}`;
  }
  if (typeof arg === "object" && arg !== null) {
    try {
      const serialized = JSON.stringify(arg);
      return JSON.parse(redactSensitiveData(serialized));
    } catch {
      return "[Object]";
    }
  }
  return arg;
}

export const safeLogger = {
  log: (...args: unknown[]) => {
    console.log(...args.map(formatArg));
  },
  warn: (...args: unknown[]) => {
    console.warn(...args.map(formatArg));
  },
  error: (...args: unknown[]) => {
    console.error(...args.map(formatArg));
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(...args.map(formatArg));
    }
  },
};

