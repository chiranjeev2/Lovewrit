export type OccasionType = "proposal" | "anniversary" | "sorry" | "reminiscing";
export type ColorThemeKey = "rose" | "midnight" | "sunset" | "emerald" | "champagne";
export type PhotoShapeKey = "oval" | "square" | "rounded" | "heart" | "circle";

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
};

export interface TemplateDefinition {
  id: string;
  name: string;
  subtitle: string;
  occasion: OccasionType;
  supportedFormats: ("CARD" | "PAGE")[];
  defaultTheme: ColorThemeKey;
  defaultShape: PhotoShapeKey;
  coverImage: string;
  samplePhotos: string[];
  sampleSender: string;
  sampleRecipient: string;
  sampleMessage: string;
  sampleLocation?: string;
  hasInteractiveDodging?: boolean;
  revealType: "velvet_box" | "champagne_seal" | "wax_heart" | "vintage_ribbon";
  badge?: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "forever-proposal",
    name: "The Forever Proposal",
    subtitle: "A breathtaking interactive proposal page with playful dodging 'No' button & rose petal reveal",
    occasion: "proposal",
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
    sampleMessage: "From the very first conversation, I knew you were the one. Every sunrise is brighter with you. Will you make me the happiest person and be mine forever?",
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
];

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
