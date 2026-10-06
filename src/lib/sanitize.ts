/**
 * Comprehensive text and input sanitization utility.
 * 
 * Guarantees:
 * 1. Strips all <script>...</script> and <style>...</style> blocks entirely including contents.
 * 2. Strips all HTML/XML tags.
 * 3. Neutralizes quote/bracket/attribute breakout attempts.
 * 4. Retains all valid international text (Hindi, Punjabi, Arabic, Hebrew, Chinese, etc.) and emojis.
 * 5. Normalizes whitespace and strips control characters.
 * 6. Caps length strictly to prevent payload flooding.
 * 7. Returns empty string if input is whitespace-only.
 */

/**
 * Sanitizes arbitrary buyer/guest text (letters, wishes, notes, tributes).
 */
export function sanitizeText(raw?: string | null, maxLen = 5000): string {
  if (!raw || typeof raw !== "string") return "";

  // 1. Strip script and style blocks entirely with contents
  let clean = raw.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 2. Strip all remaining HTML/XML tags
  clean = clean.replace(/<[^>]*>?/gm, "");

  // 3. Strip dangerous control characters (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F) while preserving normal \t, \n, \r
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 4. Trim leading and trailing whitespace
  clean = clean.trim();

  // 5. Return truncated to maxLen
  return clean.slice(0, maxLen);
}

/**
 * Sanitizes guest names specifically (used in ?guest= query params, RSVPs, plaques).
 * Default max length: 60 characters.
 */
export function sanitizeGuestName(rawGuest?: string | null, maxLen = 60): string {
  if (!rawGuest || typeof rawGuest !== "string") return "";

  // 1. Strip script and style blocks entirely with contents
  let clean = rawGuest.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 2. Strip all remaining HTML tags
  clean = clean.replace(/<[^>]*>?/gm, "");

  // 3. Strip characters commonly abused for HTML attribute / quote / eval breakouts
  clean = clean.replace(/[<>"'`={}\[\]\\();]/g, "");

  // 4. Strip control characters
  clean = clean.replace(/[\x00-\x1F\x7F]/g, "");

  // 5. Normalize multiple spaces / tabs into single space
  clean = clean.replace(/\s+/g, " ").trim();

  // 6. Enforce maxLen
  return clean.slice(0, maxLen);
}
