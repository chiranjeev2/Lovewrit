export type OccasionType =
  | "proposal"
  | "anniversary"
  | "sorry"
  | "reminiscing"
  | "birthday"
  | "memorial"
  | "godhbharai"
  | "jagrata_kirtan"
  | "kitty_party"
  | "letter_to_dear_one"
  | "akhand_path"
  | "gurpurab"
  | "aqeeqah"
  | "nikah"
  | "iftar"
  | "christening"
  | "wedding_blessing"
  | "blessing_ceremony";

export const EVENT_INVITE_OCCASIONS: OccasionType[] = [
  "jagrata_kirtan",
  "kitty_party",
  "birthday",
  "godhbharai",
  "akhand_path",
  "gurpurab",
  "aqeeqah",
  "nikah",
  "iftar",
  "christening",
  "wedding_blessing",
  "blessing_ceremony",
];

export function isEventInviteOccasion(occasion?: string): boolean {
  if (!occasion) return false;
  return EVENT_INVITE_OCCASIONS.includes(occasion as OccasionType);
}

export type ColorThemeKey =
  | "rose"
  | "midnight"
  | "sunset"
  | "emerald"
  | "champagne"
  | "serene"
  | "festive"
  | "scroll"
  | "modern"
  | "saffron"
  | "sacred_emerald"
  | "celestial"
  | "warm_neutral";
export type PhotoShapeKey = "oval" | "square" | "rounded" | "circle";
export type RevealType =
  | "velvet_box"
  | "champagne_seal"
  | "wax_heart"
  | "vintage_ribbon"
  | "balloon_pop"
  | "memorial_candle"
  | "golden_invite"
  | "diya_aarti"
  | "cupid_arrow"
  | "scroll_unfurl"
  | "ik_onkar_seal"
  | "crescent_seal"
  | "dove_cross_seal"
  | "botanical_seal"
export type FontFamilyKey = "serif" | "handwriting" | "sans";
export type CardBorderStyleKey = "classic" | "floral" | "minimal_line" | "festive_gold";
export type AmbientEffectKey = "none" | "petals" | "stars" | "rain";
export type SeasonalKey = "valentines" | "diwali" | "rakhi" | "christmas" | "new_year";

export interface StickerOption {
  id: string;
  emoji: string;
  label: string;
  category?: "romance" | "celebration" | "devotional" | "nature";
}

export interface StickerCategoryGroup {
  category: "romance" | "celebration" | "devotional" | "nature";
  stickers: StickerOption[];
}

export const STICKER_SETS: StickerCategoryGroup[] = [
  {
    category: "romance",
    stickers: [
      { id: "heart", emoji: "❤️", label: "Heart", category: "romance" },
      { id: "rose", emoji: "🌹", label: "Rose", category: "romance" },
      { id: "sparkling_heart", emoji: "💖", label: "Sparkling Heart", category: "romance" },
      { id: "cupid", emoji: "💘", label: "Cupid's Arrow", category: "romance" },
      { id: "ring", emoji: "💍", label: "Ring", category: "romance" },
    ],
  },
  {
    category: "celebration",
    stickers: [
      { id: "party", emoji: "🎉", label: "Party Popper", category: "celebration" },
      { id: "balloon", emoji: "🎈", label: "Balloon", category: "celebration" },
      { id: "champagne", emoji: "🥂", label: "Cheers", category: "celebration" },
      { id: "cake", emoji: "🎂", label: "Cake", category: "celebration" },
      { id: "sparkles", emoji: "✨", label: "Sparkles", category: "celebration" },
    ],
  },
  {
    category: "devotional",
    stickers: [
      { id: "diya", emoji: "🪔", label: "Diya Lamp", category: "devotional" },
      { id: "namaste", emoji: "🙏", label: "Namaste", category: "devotional" },
      { id: "crescent", emoji: "🌙", label: "Crescent", category: "devotional" },
      { id: "dove", emoji: "🕊️", label: "Dove", category: "devotional" },
      { id: "om", emoji: "🕉️", label: "Om", category: "devotional" },
    ],
  },
  {
    category: "nature",
    stickers: [
      { id: "flower", emoji: "🌸", label: "Cherry Blossom", category: "nature" },
      { id: "sunflower", emoji: "🌻", label: "Sunflower", category: "nature" },
      { id: "leaf", emoji: "🌿", label: "Botanical Leaf", category: "nature" },
      { id: "star", emoji: "⭐", label: "Star", category: "nature" },
      { id: "flame", emoji: "🔥", label: "Flame", category: "nature" },
    ],
  },
];

export const ALL_STICKERS: StickerOption[] = STICKER_SETS.flatMap((g) => g.stickers);

export type ProposalQuestionKey =
  | "marry_me"
  | "be_my_girlfriend"
  | "be_my_boyfriend"
  | "go_on_date";

export interface ProposalQuestionOption {
  id: ProposalQuestionKey;
  label: string;
  question: string;
  subtitle: string;
  yesText: string;
  noText: string;
  celebrateHeading: string;
  celebrateSub: string;
}

export const PROPOSAL_QUESTIONS: Record<ProposalQuestionKey, ProposalQuestionOption> = {
  marry_me: {
    id: "marry_me",
    label: "Marry Me",
    question: "Will you marry me?",
    subtitle: "Choose carefully... but love only knows one answer!",
    yesText: "YES! A Million Times Yes! 💍",
    noText: "No",
    celebrateHeading: "THEY SAID YES! 💍🎉",
    celebrateSub: "Here's to beginning the greatest adventure of your lives together!",
  },
  be_my_girlfriend: {
    id: "be_my_girlfriend",
    label: "Be My Girlfriend",
    question: "Will you be my girlfriend? 🌹",
    subtitle: "Every moment with you feels like pure magic...",
    yesText: "YES! I'd love to be your girlfriend! ❤️",
    noText: "No",
    celebrateHeading: "SHE SAID YES! Best Girlfriend Ever! ❤️🎉",
    celebrateSub: "Our forever starts today. Every day is sweeter with you!",
  },
  be_my_boyfriend: {
    id: "be_my_boyfriend",
    label: "Be My Boyfriend",
    question: "Will you be my boyfriend? 💖",
    subtitle: "Life is so much more joyful with you by my side...",
    yesText: "YES! A thousand times yes! 💖",
    noText: "No",
    celebrateHeading: "HE SAID YES! Best Boyfriend Ever! 💖🎉",
    celebrateSub: "So lucky to have you by my side forever and always!",
  },
  go_on_date: {
    id: "go_on_date",
    label: "Go On A Date",
    question: "Will you go on a date with me? 🥂",
    subtitle: "Good wine, great memories, and just the two of us...",
    yesText: "YES! It's a date! ✨",
    noText: "No",
    celebrateHeading: "IT'S A DATE! 🥂🎉",
    celebrateSub: "Can't wait to spend an unforgettable evening together!",
  },
};

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
  scroll: {
    id: "scroll",
    name: "Medieval Parchment Scroll",
    bgGradient: "from-[#22160d] via-[#332214] to-[#1a1008]",
    cardBg: "bg-[#fcf7ec] border-[#8c6227] text-[#2c1a0e] shadow-amber-950/40",
    textColor: "text-[#3b2312]",
    accentColor: "#991b1b", // Royal crimson wax seal
    borderStyle: "border-[#8c6227]/80 shadow-md",
    tagColor: "bg-[#8c6227]/20 text-[#6d4518] border-[#8c6227]/40",
  },
  modern: {
    id: "modern",
    name: "Modern Minimalist",
    bgGradient: "from-neutral-950 via-zinc-900 to-neutral-950",
    cardBg: "bg-neutral-900/90 border-neutral-700/50 text-neutral-100",
    textColor: "text-neutral-200",
    accentColor: "#e2e8f0",
    borderStyle: "border-neutral-600/40",
    tagColor: "bg-neutral-800 text-neutral-300 border-neutral-700",
  },
  saffron: {
    id: "saffron",
    name: "Royal Saffron & Gold",
    bgGradient: "from-amber-950 via-yellow-950 to-neutral-950",
    cardBg: "bg-amber-950/80 border-amber-600/50 text-amber-50 shadow-amber-950/40",
    textColor: "text-amber-100",
    accentColor: "#f59e0b",
    borderStyle: "border-amber-500/40",
    tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  sacred_emerald: {
    id: "sacred_emerald",
    name: "Sacred Emerald & Gold",
    bgGradient: "from-emerald-950 via-teal-950 to-neutral-950",
    cardBg: "bg-emerald-950/80 border-emerald-700/50 text-emerald-50 shadow-emerald-950/40",
    textColor: "text-emerald-100",
    accentColor: "#10b981",
    borderStyle: "border-emerald-500/40",
    tagColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  celestial: {
    id: "celestial",
    name: "Celestial Ivory & Sky Blue",
    bgGradient: "from-slate-950 via-sky-950/40 to-neutral-950",
    cardBg: "bg-slate-900/80 border-sky-600/40 text-sky-50 shadow-sky-950/30",
    textColor: "text-sky-100",
    accentColor: "#38bdf8",
    borderStyle: "border-sky-400/30",
    tagColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  warm_neutral: {
    id: "warm_neutral",
    name: "Warm Earth & Sand",
    bgGradient: "from-stone-950 via-neutral-900 to-stone-950",
    cardBg: "bg-stone-900/80 border-stone-700/40 text-stone-100",
    textColor: "text-stone-200",
    accentColor: "#a8a29e",
    borderStyle: "border-stone-500/30",
    tagColor: "bg-stone-500/20 text-stone-300 border-stone-500/30",
  },
};

export interface TemplateDefinition {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  occasion: OccasionType;
  category: "couples" | "birthdays" | "memorials" | "invites" | "letters" | "devotional";
  supportedFormats: ("CARD" | "PAGE")[];
  defaultTheme: ColorThemeKey;
  defaultShape: PhotoShapeKey;
  coverImage: string;
  samplePhotos: string[];
  sampleSender: string;
  sampleRecipient: string;
  sampleMessage: string;
  sampleLocation?: string;
  sampleEventDate?: string;
  sampleEventTime?: string;
  venueRequired?: boolean;
  hasInteractiveDodging?: boolean;
  revealType: RevealType;
  badge?: string;
  isFreeCard?: boolean;
  hasAdOption?: boolean;
  faith?: "hindu" | "sikh" | "muslim" | "christian" | "secular";
  showOmMotifSupported?: boolean;
  showBismillahSupported?: boolean;
  seasonalKey?: SeasonalKey;
  seasonalTag?: string; // e.g. "Limited Valentine's Drop"
  defaultMusicTrack?: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  // --- COUPLES ---
  {
    id: "forever-proposal",
    name: "The Forever Proposal",
    subtitle: "Interactive proposal page with playful dodging 'No' button & velvet box reveal",
    icon: "💍",
    occasion: "proposal",
    category: "couples",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "rose",
    defaultShape: "rounded",
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
    id: "be-my-girlfriend",
    name: "Be My Girlfriend / Boyfriend",
    subtitle: "Playful romantic reveal with dodging 'No' button, sweet memories, and Cupid's arrow",
    icon: "💘",
    occasion: "proposal",
    category: "couples",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "rose",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    ],
    sampleSender: "Kabir",
    sampleRecipient: "Ananya",
    sampleMessage: "Every single day with you feels effortless and warm. I can't imagine my life without your smile. Will you be my girlfriend?",
    sampleLocation: "Our Favorite Sunset Spot",
    hasInteractiveDodging: true,
    revealType: "cupid_arrow",
    badge: "Romantic Hit",
    seasonalKey: "valentines",
    seasonalTag: "Valentine's Season",
  },
  {
    id: "golden-anniversary",
    name: "Golden Anniversary",
    subtitle: "Celebrate your love story with champagne gold sparkles and an emotional photo timeline",
    icon: "🥂",
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
    icon: "💌",
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
    defaultMusicTrack: "heartfelt-apology",
  },
  {
    id: "sweet-reminiscing",
    name: "Sweet Reminiscing",
    subtitle: "A nostalgic memory lane journey with scrapbook ribbon reveal and curated photo stream",
    icon: "🎞️",
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
    icon: "✨",
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
    icon: "🎂",
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
    defaultMusicTrack: "birthday-confetti-pop",
    badge: "New in Phase 2",
  },

  // --- PHASE 2: MEMORIALS ---
  {
    id: "in-loving-memory",
    name: "In Loving Memory (Sacred Tribute)",
    subtitle: "A serene, respectful tribute page with candle-lighting reveal and pre-moderated condolence wall",
    icon: "🕯️",
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
    icon: "👶",
    occasion: "godhbharai",
    category: "invites",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "champagne",
    defaultShape: "rounded",
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
    defaultMusicTrack: "baby-lullaby-blessings",
    badge: "Venue & RSVP",
  },

  // --- STANDALONE SERVICE: LETTER TO A DEAR ONE (100% FREE CARD / AD-SUPPORTED OR AD-FREE PAGE) ---
  {
    id: "letter-to-dear-one",
    name: "Letter to a Dear One",
    subtitle: "A timeless, heartfelt letter to someone who holds a sacred place in your soul. Completely 100% Free digital card.",
    icon: "📜",
    occasion: "letter_to_dear_one",
    category: "letters",
    supportedFormats: ["CARD", "PAGE"],
    defaultTheme: "scroll",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80",
    ],
    sampleSender: "Aditya",
    sampleRecipient: "My Dearest Friend",
    sampleMessage: "I wanted to write this letter to tell you something I rarely say out loud — your presence in my life has been one of my greatest blessings. Through every storm and sunny day, thank you for being you.",
    sampleLocation: "Written with Love",
    hasInteractiveDodging: false,
    revealType: "scroll_unfurl",
    defaultMusicTrack: "quill-acoustic",
    badge: "100% FREE",
    isFreeCard: true,
    hasAdOption: true,
  },

  // --- DEVOTIONAL: HINDU ---
  {
    id: "jagrata-kirtan-invitation",
    name: "Mata Ka Jagrata & Kirtan Invite",
    subtitle: "Auspicious devotional invitation with traditional Aarti/Bhajan soundtrack, Diya lighting, optional Om (ॐ) motif & temple map",
    icon: "🙏",
    occasion: "jagrata_kirtan",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "sunset",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80",
    ],
    sampleSender: "Goyal Parivaar",
    sampleRecipient: "Sadar Nimantran (सादर आमंत्रण)",
    sampleMessage: "🚩 Jai Mata Di 🚩 With the divine grace and blessings of Maa Durga, we cordially invite you and your family to Mata Ki Chowki & Jagrata. Bhajan, Aarti & Prasad distribution to follow.",
    sampleLocation: "Shri Sanatan Dharam Mandir, Amritsar",
    sampleEventDate: "Saturday, 24 October 2026",
    sampleEventTime: "8:00 PM Onwards",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "diya_aarti",
    defaultMusicTrack: "temple-aarti-flute",
    badge: "Hindu Devotional",
    faith: "hindu",
    showOmMotifSupported: true,
    seasonalKey: "diwali",
    seasonalTag: "Festive & Sacred",
  },

  // --- DEVOTIONAL: SIKH ---
  {
    id: "sikh-akhand-path",
    name: "Akhand Path & Kirtan Samagam Invite",
    subtitle: "Sacred Sikh invitation with ੴ Ik Onkar emblem, divine Gurbani audio, saffron palette & Langar details",
    icon: "ੴ",
    occasion: "akhand_path",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "saffron",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&q=80",
    ],
    sampleSender: "The Gill Parivaar",
    sampleRecipient: "Sadar Nimantran (ਸਤਿਕਾਰ ਸਹਿਤ ਸੱਦਾ)",
    sampleMessage: "ੴ ਸਤਿਨਾਮੁ ਵਾਹਿਗੁਰੂ ੴ\nWith the divine blessings of Sri Guru Granth Sahib Ji, we cordially invite you and your family to the Akhand Path Sahib and Kirtan Samagam. Guru Ka Langar will be served continuously.",
    sampleLocation: "Gurdwara Sri Guru Singh Sabha, Model Town",
    sampleEventDate: "Sunday, 15 November 2026",
    sampleEventTime: "10:00 AM Onwards",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "ik_onkar_seal",
    badge: "Sikh Devotional",
    faith: "sikh",
  },
  {
    id: "sikh-gurpurab",
    name: "Gurpurab Celebration & Langar Invite",
    subtitle: "Joyous Gurpurab celebration invitation with ੴ motif, divine shabad audio & Gurdwara details",
    icon: "ੴ",
    occasion: "gurpurab",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "saffron",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&q=80",
    ],
    sampleSender: "Khalsa Sangat",
    sampleRecipient: "Pyari Sangat Ji (ਪਿਆਰੀ ਸੰਗਤ ਜੀ)",
    sampleMessage: "ੴ Lakh Lakh Vadhaiyan on the auspicious occasion of Gurpurab! Join us for Akhand Kirtan, Katha Vichar, and community Langar sewa.",
    sampleLocation: "Gurdwara Sahib Hall, Sector 18",
    sampleEventDate: "Friday, 27 November 2026",
    sampleEventTime: "6:00 PM Onwards",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "ik_onkar_seal",
    badge: "Gurpurab Special",
    faith: "sikh",
  },

  // --- DEVOTIONAL: MUSLIM ---
  {
    id: "muslim-aqeeqah",
    name: "Aqeeqah Ceremony & Feast Invite",
    subtitle: "Warm Islamic invitation celebrating the blessing of a newborn with crescent motifs, optional Bismillah & doa",
    icon: "🌙",
    occasion: "aqeeqah",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "sacred_emerald",
    defaultShape: "oval",
    coverImage: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80",
    ],
    sampleSender: "Tariq & Fatima Khan",
    sampleRecipient: "Respected Family & Friends",
    sampleMessage: "By the grace and mercy of Allah (SWT), we have been blessed with a healthy baby boy. You are warmly invited to the Aqeeqah ceremony and lunch.",
    sampleLocation: "Al-Noor Banquet Lounge, Jubilee Hills",
    sampleEventDate: "Sunday, 8 November 2026",
    sampleEventTime: "1:00 PM",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "crescent_seal",
    badge: "Muslim Blessing",
    faith: "muslim",
    showBismillahSupported: true,
  },
  {
    id: "muslim-nikah",
    name: "Nikah & Wedding Blessing Invite",
    subtitle: "Solemn and elegant marriage celebration invitation with crescent motif, optional Bismillah & sacred doa",
    icon: "☪",
    occasion: "nikah",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "sacred_emerald",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80",
    ],
    sampleSender: "The Khan & Siddiqui Families",
    sampleRecipient: "Honored Guests & Elders",
    sampleMessage: "We joyfully request the honor of your presence and warm prayers to celebrate the sacred union of Nikah. Your blessings mean the world to our families.",
    sampleLocation: "Royal Palm Palace, Banjara Hills",
    sampleEventDate: "Saturday, 12 December 2026",
    sampleEventTime: "7:30 PM",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "crescent_seal",
    badge: "Sacred Nikah",
    faith: "muslim",
    showBismillahSupported: true,
  },
  {
    id: "muslim-iftar",
    name: "Iftar Community Gathering Invite",
    subtitle: "Blessed Ramadan sunset feast invitation with crescent motif, optional Bismillah & prayer details",
    icon: "🌙",
    occasion: "iftar",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "sacred_emerald",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80",
    ],
    sampleSender: "Zubair & Family",
    sampleRecipient: "Brothers, Sisters & Friends",
    sampleMessage: "Ramadan Kareem! Please join us for a blessed evening to break our fast together at Iftar, offer Maghrib prayers, and share a warm dinner.",
    sampleLocation: "Zubair Residence, Green Valley",
    sampleEventDate: "Friday, 19 March 2027",
    sampleEventTime: "6:15 PM (Sunset)",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "crescent_seal",
    badge: "Ramadan Mubarak",
    faith: "muslim",
    showBismillahSupported: true,
  },

  // --- DEVOTIONAL: CHRISTIAN ---
  {
    id: "christian-christening",
    name: "Christening & Baptism Invite",
    subtitle: "Graceful invitation celebrating holy baptism with sacred dove motif, choral audio & church directions",
    icon: "🕊️",
    occasion: "christening",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "celestial",
    defaultShape: "oval",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    ],
    sampleSender: "David & Sarah Johnson",
    sampleRecipient: "Beloved Family & Friends",
    sampleMessage: "We invite you to witness and celebrate the Holy Baptism of our child. May God bless this sacred day with peace, love, and joy.",
    sampleLocation: "St. Mary's Cathedral, Church Street",
    sampleEventDate: "Sunday, 22 November 2026",
    sampleEventTime: "11:00 AM",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "dove_cross_seal",
    badge: "Holy Baptism",
    faith: "christian",
  },
  {
    id: "christian-wedding-blessing",
    name: "Wedding Blessing & Matrimony Invite",
    subtitle: "Solemn church matrimony invitation with tasteful cross emblem, sacred vows & choral soundtrack",
    icon: "✝",
    occasion: "wedding_blessing",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "celestial",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    ],
    sampleSender: "The Matthew & Thomas Families",
    sampleRecipient: "Honored Guests",
    sampleMessage: "'Therefore what God has joined together, let no one separate.' We invite you to share in the joy of our Holy Matrimony as we unite in Christ's love.",
    sampleLocation: "Grace Community Chapel, Bangalore",
    sampleEventDate: "Saturday, 5 December 2026",
    sampleEventTime: "4:30 PM",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "dove_cross_seal",
    badge: "Holy Matrimony",
    faith: "christian",
  },

  // --- DEVOTIONAL: SECULAR / NON-RELIGIOUS ---
  {
    id: "secular-blessing-ceremony",
    name: "Blessing Ceremony & Celebration Invite",
    subtitle: "A warm, inclusive celebration invitation with neutral elegant aesthetics and zero religious symbols",
    icon: "🌿",
    occasion: "blessing_ceremony",
    category: "devotional",
    supportedFormats: ["PAGE", "CARD"],
    defaultTheme: "warm_neutral",
    defaultShape: "rounded",
    coverImage: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    samplePhotos: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    ],
    sampleSender: "The Sharma-Kapoor Family",
    sampleRecipient: "Dear Friends & Family",
    sampleMessage: "Good food, dear friends, and warm blessings. We cordially invite you to celebrate this meaningful life milestone with our family. Your presence is our greatest gift.",
    sampleLocation: "The Glass House Gardens, Pune",
    sampleEventDate: "Sunday, 20 December 2026",
    sampleEventTime: "12:30 PM",
    venueRequired: true,
    hasInteractiveDodging: false,
    revealType: "botanical_seal",
    badge: "Non-Religious",
    faith: "secular",
  },

  // --- SOCIAL (KITTY PARTY & GATHERINGS) ---
  {
    id: "chic-kitty-party",
    name: "Chic Kitty Party & High-Tea Invite",
    subtitle: "Vibrant high-tea social gathering invite with dress-code theme, RSVP headcount & venue pin",
    icon: "☕",
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
