/**
 * Guest Personalization Helpers for Interactive Pages & Wedding Invites
 */

import { sanitizeGuestName } from "./sanitize";
export { sanitizeGuestName };

export interface GuestInviteLink {
  guestName: string;
  url: string;
}

export function generateGuestLinks(
  baseUrl: string,
  slug: string,
  guestNamesRaw: string[] | string
): GuestInviteLink[] {
  const namesArray = Array.isArray(guestNamesRaw)
    ? guestNamesRaw
    : guestNamesRaw
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean);

  const cleanBase = baseUrl.replace(/\/$/, "");

  return namesArray.map((raw) => {
    const cleanName = sanitizeGuestName(raw, 60);
    const encoded = encodeURIComponent(cleanName);
    return {
      guestName: cleanName,
      url: `${cleanBase}/p/${slug}?guest=${encoded}`,
    };
  });
}
