/**
 * Occasion Calendar for Indian gifting & celebration moments.
 * Supports live countdown banners, admin-editable dates, and automatic expiration.
 * STRICT NON-NEGOTIABLE: NEVER displayed on memorial / sacred tribute pages.
 */

export interface OccasionEvent {
  id: string;
  name: string;
  tagline: string;
  targetDate: string; // ISO string e.g. "2026-10-29T23:59:59"
  templateId: string;
  badgeEmoji: string;
  accentColor?: string;
  isCustom?: boolean;
}

export const DEFAULT_OCCASIONS: OccasionEvent[] = [
  {
    id: "karwa-chauth-2026",
    name: "Karwa Chauth",
    tagline: "Celebrate sacred love, fasting & timeless devotion",
    targetDate: "2026-10-29T23:59:59+05:30",
    templateId: "forever-proposal",
    badgeEmoji: "🌙",
    accentColor: "from-rose-500/20 to-amber-500/20",
  },
  {
    id: "diwali-2026",
    name: "Diwali • Festival of Lights",
    tagline: "Send luminous blessings, Lakshmi puja wishes & family love",
    targetDate: "2026-11-08T23:59:59+05:30",
    templateId: "jagrata-kirtan-invitation",
    badgeEmoji: "🪔",
    accentColor: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "bhai-dooj-2026",
    name: "Bhai Dooj",
    tagline: "Cherish sibling bonds with heartfelt letters and memories",
    targetDate: "2026-11-10T23:59:59+05:30",
    templateId: "sweet-reminiscing",
    badgeEmoji: "🌸",
    accentColor: "from-yellow-500/20 to-rose-500/20",
  },
  {
    id: "gurpurab-2026",
    name: "Guru Nanak Gurpurab",
    tagline: "Lakh Lakh Vadhaiyan • Share divine Gurbani & Langar invites",
    targetDate: "2026-11-27T23:59:59+05:30",
    templateId: "sikh-gurpurab",
    badgeEmoji: "ੴ",
    accentColor: "from-yellow-500/20 to-amber-500/20",
  },
  {
    id: "new-year-2027",
    name: "New Year 2027",
    tagline: "Step into the new year with gratitude, resolutions & love",
    targetDate: "2027-01-01T00:00:00+05:30",
    templateId: "chic-kitty-party",
    badgeEmoji: "🥂",
    accentColor: "from-purple-500/20 to-indigo-500/20",
  },
  {
    id: "valentines-2027",
    name: "Valentine's Day",
    tagline: "Pour your heart into a private love letter & keepsake page",
    targetDate: "2027-02-14T23:59:59+05:30",
    templateId: "forever-proposal",
    badgeEmoji: "💌",
    accentColor: "from-rose-500/25 to-pink-500/25",
  },
  {
    id: "raksha-bandhan-2027",
    name: "Raksha Bandhan",
    tagline: "Celebrate the unbreakable bond of protection and laughter",
    targetDate: "2027-08-28T23:59:59+05:30",
    templateId: "sweet-reminiscing",
    badgeEmoji: "✨",
    accentColor: "from-amber-500/20 to-rose-500/20",
  },
];

/**
 * Returns the earliest upcoming occasion that has not passed yet.
 * Returns null if all occasions have expired.
 */
export function getActiveUpcomingOccasion(
  occasions: OccasionEvent[] = DEFAULT_OCCASIONS,
  now: Date = new Date()
): OccasionEvent | null {
  const futureOccasions = occasions.filter((occ) => {
    const target = new Date(occ.targetDate);
    return target.getTime() > now.getTime();
  });

  if (futureOccasions.length === 0) return null;

  // Sort by earliest targetDate
  futureOccasions.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  return futureOccasions[0];
}

/**
 * Calculates remaining days, hours, minutes, and seconds until target date.
 */
export function calculateTimeRemaining(targetDateIso: string, now: Date = new Date()) {
  const diff = new Date(targetDateIso).getTime() - now.getTime();
  if (diff <= 0) {
    return { isPast: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { isPast: false, days, hours, minutes, seconds };
}
