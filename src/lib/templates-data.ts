export type OccasionType =
  | "proposal"
  | "anniversary"
  | "sorry"
  | "reminiscing"
  | "birthday"
  | "memorial"
  | "godhbharai"
  | "jagrata_kirtan"
  | "kitty_party";

export type ColorThemeKey = "rose" | "midnight" | "sunset" | "emerald" | "champagne" | "serene" | "festive";
export type PhotoShapeKey = "oval" | "square" | "rounded" | "heart" | "circle";
export type RevealType =
  | "velvet_box"
  | "champagne_seal"
  | "wax_heart"
  | "vintage_ribbon"
  | "balloon_pop"
  | "memorial_candle"
  | "golden_invite"
  | "diya_aarti"
  | "cupid_arrow";

export interface ColorTheme {
  id: ColorThemeKey;
  name: string;
  bgGradient: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
  borderStyle: string;
  tagColor: string;
}

export const COLOR_THEMES: Record<ColorThemeKey, ColorTheme> = {
  rose: {
    id: "rose",
    name: "Blush Rose",
    bgGradient: "from-rose-950 via-pink-950 to-neutral-950",
    cardBg: "bg-rose-950/70 border-rose-800/40 text-rose-50",
    textColor: "text-rose-100",
    accentColor: "#f43f5e",
    borderStyle: "border-rose-400/30",
    tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  midnight: {
    id: "midnight",
    name: "Midnight Romance",
    bgGradient: "from-slate-950 via-indigo-950 to-neutral-950",
    cardBg: "bg-slate-900/80 border-indigo-700/40 text-indigo-50",
    textColor: "text-indigo-100",
    accentColor: "#818cf8",
    borderStyle: "border-indigo-400/30",
    tagColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  sunset: {
    id: "sunset",
    name: "Tuscan Sunset",
    bgGradient: "from-amber-950 via-orange-950 to-neutral-950",
    cardBg: "bg-amber-950/70 border-amber-800/40 text-amber-50",
    textColor: "text-amber-100",
    accentColor: "#f59e0b",
    borderStyle: "border-amber-400/30",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Luxe",
    bgGradient: "from-emerald-950 via-teal-950 to-neutral-950",
    cardBg: "bg-emerald-950/70 border-emerald-800/40 text-emerald-50",
    textColor: "text-emerald-100",
    accentColor: "#10b981",
    borderStyle: "border-emerald-400/30",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  champagne: {
    id: "champagne",
    name: "Champagne Gold",
    bgGradient: "from-stone-950 via-yellow-950 to-neutral-950",
    cardBg: "bg-stone-900/80 border-yellow-700/40 text-yellow-50",
    textColor: "text-yellow-100",
    accentColor: "#eab308",
    borderStyle: "border-yellow-400/30",
    tagColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  serene: {
    id: "serene",
    name: "Serene Tranquil (Memorial)",
    bgGradient: "from-neutral-950 via-stone-900 to-neutral-950",
    cardBg: "bg-neutral-900/80 border-stone-700/40 text-stone-100",
    textColor: "text-stone-200",
    accentColor: "#d6d3d1",
    borderStyle: "border-stone-500/30",
    tagColor: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  },
  festive: {
    id: "festive",
    name: "Festive Joy (Birthday & Events)",
    bgGradient: "from-purple-950 via-pink-950 to-neutral-950",
    cardBg: "bg-purple-950/70 border-pink-700/40 text-pink-50",
    textColor: "text-pink-100",
    accentColor: "#ec4899",
    borderStyle: "border-pink-400/30",
    tagColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
};

export interface TemplateDefinition {
  id: string;
  name: string;
  subtitle: string;
  occasion: OccasionType;
  category: "couples" | "birthdays" | "memorials" | "invites";
  supportedFormats: ("CARD" | "PAGE")[];
  defaultTheme: ColorThemeKey;
  defaultShape: PhotoShapeKey;
  coverImage: string;
  samplePhotos: string[];
  sampleSender: string;
  sampleRecipient: string;
  sampleMessage: string;
  sampleLocation?: string;
  venueRequired?: boolean;
  hasInteractiveDodging?: boolean;
  revealType: RevealType;
  badge?: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  // --- COUPLES ---
  {
    id: "forever-proposal",
    name: "The Forever Proposal",
    subtitle: "Interactive proposal page with playful dodging 'No' button & velvet box reveal",
    occasion: "proposal",
    category: "couples",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "rose",
    defaultShape: "heart",
    coverImage: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    ],
    sampleSender: "Aarav",
    sampleRecipient: "Simran",
    sampleMessage: "From the very first conversation, I knew you were the one. Every sunrise is brighter with you. Will you make me the happiest person and marry me?",
    sampleLocation: "Udaipur, Lake Pichola",
    hasInteractiveDodging: true,
    revealType: "velvet_box",
    badge: "Most Popular",
  },
  {
    id: "golden-anniversary",
    name: "Golden Anniversary",
    subtitle: "Celebrate your love story with champagne gold sparkles and an emotional photo timeline",
    occasion: "anniversary",
    category: "couples",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "champagne",
    defaultShape: "oval",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80",
    ],
    sampleSender: "Dev",
    sampleRecipient: "Ananya",
    sampleMessage: "Three wonderful years, and I still fall for you a little more every day. Thank you for building this beautiful dream of a life with me. Happy Anniversary!",
    sampleLocation: "Marine Drive, Mumbai",
    hasInteractiveDodging: false,
    revealType: "champagne_seal",
    badge: "Staff Pick",
  },
  {
    id: "from-my-heart",
    name: "From My Heart (I'm Sorry)",
    subtitle: "A sincere, tender apology card & letter with warm candlelight glow and gentle wax seal reveal",
    occasion: "sorry",
    category: "couples",
    supportedFormats: ["CARD", "PAGE"],
    defaultTheme: "sunset",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80",
    ],
    sampleSender: "Kabir",
    sampleRecipient: "Meera",
    sampleMessage: "I hate seeing any sadness between us, especially when it was caused by my foolishness. You mean everything to me. I promise to listen better, love harder, and cherish you always. Please forgive me.",
    sampleLocation: "Our Favorite Coffee Shop",
    hasInteractiveDodging: false,
    revealType: "wax_heart",
  },
  {
    id: "sweet-reminiscing",
    name: "Sweet Reminiscing",
    subtitle: "A nostalgic memory lane journey with scrapbook ribbon reveal and curated photo stream",
    occasion: "reminiscing",
    category: "couples",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "midnight",
    defaultShape: "square",
    coverImage: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
    ],
    sampleSender: "Rohan",
    sampleRecipient: "Priya",
    sampleMessage: "Remember when we got completely drenched in the rain and laughed until our stomachs hurt? Here is a small collection of my favorite memories with you. Every single one is gold.",
    sampleLocation: "Shimla Hills",
    hasInteractiveDodging: false,
    revealType: "vintage_ribbon",
  },
  {
    id: "modern-romance",
    name: "Modern Romance",
    subtitle: "Chic editorial typography and sleek frames for couples who love timeless modern elegance",
    occasion: "anniversary",
    category: "couples",
    supportedFormats: ["CARD", "PAGE"],
    defaultTheme: "emerald",
    defaultShape: "circle",
    coverImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
      "https://images.unsplash.com/photo-1513279922550-250c2129b13a?w=800&q=80",
    ],
    sampleSender: "Vikram",
    sampleRecipient: "Tara",
    sampleMessage: "You make ordinary days feel like poetry. To the love that grows deeper and calmer with every passing year. Forever grateful for you.",
    sampleLocation: "Goa Sunset Beach",
    hasInteractiveDodging: false,
    revealType: "velvet_box",
  },

  // --- PHASE 2: BIRTHDAYS ---
  {
    id: "festive-birthday",
    name: "Festive Birthday Celebration",
    subtitle: "Joyful birthday countdown with balloon pop unboxing, confetti shower, and group wishes",
    occasion: "birthday",
    category: "birthdays",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "festive",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
    ],
    sampleSender: "Karan & Family",
    sampleRecipient: "Riya",
    sampleMessage: "Happy Birthday to the brightest soul we know! May this year bring endless adventures, boundless joy, and all your dreams into reality. Keep shining!",
    sampleLocation: "Sky Lounge, Bengaluru",
    venueRequired: false,
    hasInteractiveDodging: false,
    revealType: "balloon_pop",
    badge: "New in Phase 2",
  },

  // --- PHASE 2: MEMORIALS ---
  {
    id: "in-loving-memory",
    name: "In Loving Memory (Sacred Tribute)",
    subtitle: "A serene, respectful tribute page with candle-lighting reveal and pre-moderated condolence wall",
    occasion: "memorial",
    category: "memorials",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "serene",
    defaultShape: "oval",
    coverImage: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
    ],
    sampleSender: "The Kapoor Family",
    sampleRecipient: "Late Shri Ram Nath Kapoor",
    sampleMessage: "In loving memory of a life so beautifully lived and a heart so deeply loved. Your wisdom, warmth, and gentle smile continue to guide us each and every day.",
    sampleLocation: "Shanti Van, New Delhi",
    venueRequired: false,
    hasInteractiveDodging: false,
    revealType: "memorial_candle",
    badge: "Pre-Moderated",
  },

  // --- PHASE 2: INVITES (BABY SHOWER / GODHBHARAI) ---
  {
    id: "godhbharai-blessings",
    name: "Godhbharai & Baby Shower Invite",
    subtitle: "Pastel celebratory invitation with baby lullaby soundtrack, venue map directions & RSVP registry",
    occasion: "godhbharai",
    category: "invites",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "champagne",
    defaultShape: "heart",
    coverImage: "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80",
    ],
    sampleSender: "Pooja & Sameer",
    sampleRecipient: "Honored Friends & Family",
    sampleMessage: "A tiny miracle is on the way! Please join us with your heartfelt blessings and warm love as we celebrate the Godhbharai ceremony of Pooja.",
    sampleLocation: "Grand Imperial Banquet Hall, Chandigarh",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "golden_invite",
    badge: "Venue & RSVP",
  },

  // --- PHASE 2: DEVOTIONAL (JAGRATA & KIRTAN) ---
  {
    id: "jagrata-kirtan-invitation",
    name: "Mata Ka Jagrata & Kirtan Invite",
    subtitle: "Auspicious devotional invitation with traditional Aarti/Bhajan soundtrack, Diya lighting & temple map",
    occasion: "jagrata_kirtan",
    category: "invites",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "sunset",
    defaultShape: "square",
    coverImage: "https://images.unsplash.com/photo-1609137144822-4a004f2f01f3?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1609137144822-4a004f2f01f3?w=800&q=80",
    ],
    sampleSender: "Goyal Parivaar",
    sampleRecipient: "Sadar Nimantran",
    sampleMessage: "Jai Mata Di! You and your family are cordially invited to seek the divine blessings of Maa Durga on the auspicious occasion of Mata Ki Chowki & Jagrata.",
    sampleLocation: "Shri Sanatan Dharam Mandir, Amritsar",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "diya_aarti",
    badge: "Devotional",
  },

  // --- PHASE 2: SOCIAL (KITTY PARTY & GATHERINGS) ---
  {
    id: "chic-kitty-party",
    name: "Chic Kitty Party & High-Tea Invite",
    subtitle: "Vibrant high-tea social gathering invite with dress-code theme, RSVP headcount & venue pin",
    occasion: "kitty_party",
    category: "invites",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "rose",
    defaultShape: "circle",
    coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    ],
    sampleSender: "Shalini & Friends",
    sampleRecipient: "The Glam Tribe",
    sampleMessage: "It's time for laughter, gossip, delicious bites, and fabulous games! Join us for our monthly High Tea Kitty Party. Dress code: Pastel Chic!",
    sampleLocation: "Olive Bistro, Hyderabad",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "golden_invite",
    badge: "RSVP Enabled",
  },
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
