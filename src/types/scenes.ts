import { z } from "zod";

export type SceneType =
  | "opener"
  | "balloon_pop"
  | "how_we_met"
  | "timeline"
  | "chat_story"
  | "memories"
  | "promises"
  | "arrow_heart"
  | "letter_unfold"
  | "wedding_story"
  | "event_details"
  | "personal_note"
  | "rsvp"
  | "forgive_reply"
  | "name_meaning"
  | "day_arrived"
  | "wishes"
  | "birthday_finale"
  | "godhbharai_blessings"
  | "baby_reveal"
  | "tribute_candle"
  | "what_they_taught_us"
  | "tribute_wall"
  | "party_theme"
  | "closing_prayer"
  | "devotional_blessing"
  | "devotional_significance"
  | "devotional_finale"
  | "finale";

// Base Zod Schema with text sanitization & length caps
const sanitizeText = (str: string, maxLen = 500) =>
  str.replace(/[<>]/g, "").trim().slice(0, maxLen);

export const BaseSceneSchema = z.object({
  id: z.string().max(50),
  type: z.enum([
    "opener",
    "balloon_pop",
    "how_we_met",
    "timeline",
    "chat_story",
    "memories",
    "promises",
    "arrow_heart",
    "letter_unfold",
    "wedding_story",
    "party_theme",
    "event_details",
    "personal_note",
    "rsvp",
    "forgive_reply",
    "name_meaning",
    "day_arrived",
    "wishes",
    "birthday_finale",
    "godhbharai_blessings",
    "baby_reveal",
    "tribute_candle",
    "what_they_taught_us",
    "tribute_wall",
    "closing_prayer",
    "devotional_blessing",
    "devotional_significance",
    "devotional_finale",
    "finale",
  ]),
  title: z.string().max(120).transform((v) => sanitizeText(v, 120)),
  subtitle: z.string().max(250).optional().transform((v) => v ? sanitizeText(v, 250) : undefined),
  enabled: z.boolean().default(true),
  required: z.boolean().optional(),
});

// 1. Balloon Pop Scene (Apology Pack)
export const BalloonPopSceneSchema = BaseSceneSchema.extend({
  type: z.literal("balloon_pop"),
  reasons: z
    .array(z.string().max(300).transform((v) => sanitizeText(v, 300)))
    .min(1)
    .max(8),
  completionTitle: z.string().max(100).default("I am so sorry 😞").transform((v) => sanitizeText(v, 100)),
  completionSubtitle: z.string().max(250).default("Every reason here is why you mean the world to me.").transform((v) => sanitizeText(v, 250)),
});

// 2. How We Met Scene (Romantic Pack)
export const HowWeMetSceneSchema = BaseSceneSchema.extend({
  type: z.literal("how_we_met"),
  storyText: z.string().max(1000).transform((v) => sanitizeText(v, 1000)),
  photoUrl: z.string().url().max(1000).optional(),
  location: z.string().max(120).optional().transform((v) => v ? sanitizeText(v, 120) : undefined),
  dateLabel: z.string().max(80).optional().transform((v) => v ? sanitizeText(v, 80) : undefined),
});

// 3. Our Life Together - Timeline Scene (Romantic Pack)
export const TimelineEventSchema = z.object({
  id: z.string().max(50),
  yearOrDate: z.string().max(50).transform((v) => sanitizeText(v, 50)),
  title: z.string().max(100).transform((v) => sanitizeText(v, 100)),
  description: z.string().max(350).transform((v) => sanitizeText(v, 350)),
  photoUrl: z.string().url().max(1000).optional(),
});

export const TimelineSceneSchema = BaseSceneSchema.extend({
  type: z.literal("timeline"),
  events: z.array(TimelineEventSchema).max(8),
});

// 4. Chat Story Scene (Romantic Pack - buyer text bubbles + screenshot image, NO video)
export const ChatMessageSchema = z.object({
  id: z.string().max(50),
  sender: z.enum(["buyer", "recipient"]),
  text: z.string().max(500).transform((v) => sanitizeText(v, 500)),
  timestamp: z.string().max(30).optional(),
  imageUrl: z.string().url().max(1000).optional(), // Strictly image screenshot, no video
});

export const ChatStorySceneSchema = BaseSceneSchema.extend({
  type: z.literal("chat_story"),
  contactName: z.string().max(60).default("My Favorite Person").transform((v) => sanitizeText(v, 60)),
  messages: z.array(ChatMessageSchema).max(12),
});

// 5. Memories / Nostalgia Scene (Romantic Pack)
export const MemoryItemSchema = z.object({
  id: z.string().max(50),
  title: z.string().max(100).transform((v) => sanitizeText(v, 100)),
  caption: z.string().max(300).optional().transform((v) => v ? sanitizeText(v, 300) : undefined),
  photoUrl: z.string().url().max(1000),
});

export const MemoriesSceneSchema = BaseSceneSchema.extend({
  type: z.literal("memories"),
  memories: z.array(MemoryItemSchema).max(6),
});

// 6. Promises / Reasons Scene
export const PromisesSceneSchema = BaseSceneSchema.extend({
  type: z.literal("promises"),
  items: z.array(z.string().max(300).transform((v) => sanitizeText(v, 300))).max(10),
});

// 7. Arrow Heart Scene (Romantic Pack)
export const ArrowHeartSceneSchema = BaseSceneSchema.extend({
  type: z.literal("arrow_heart"),
  targetLabel: z.string().max(80).default("My Heart").transform((v) => sanitizeText(v, 80)),
  burstMessage: z.string().max(150).default("You have my whole heart forever ❤️").transform((v) => sanitizeText(v, 150)),
  isProposal: z.boolean().default(false),
  questionText: z.string().max(150).optional().transform((v) => v ? sanitizeText(v, 150) : undefined),
  yesText: z.string().max(60).optional().transform((v) => v ? sanitizeText(v, 60) : undefined),
  noText: z.string().max(40).optional().transform((v) => v ? sanitizeText(v, 40) : undefined),
});

// 8. Letter Unfold Scene (Universal)
export const LetterUnfoldSceneSchema = BaseSceneSchema.extend({
  type: z.literal("letter_unfold"),
  sealStyle: z.enum(["wax_crimson", "wax_gold", "silver_slate"]).default("wax_crimson"),
});

// 9. Forgive / Reply Scene (Apology Pack)
export const ForgiveReplySceneSchema = BaseSceneSchema.extend({
  type: z.literal("forgive_reply"),
  promptText: z.string().max(200).default("Can we start fresh?").transform((v) => sanitizeText(v, 200)),
  forgiveButtonText: z.string().max(50).default("I Forgive You ❤️").transform((v) => sanitizeText(v, 50)),
  replyPlaceholder: z.string().max(150).default("Write a note back...").transform((v) => sanitizeText(v, 150)),
});

// 10. Wedding Story Scene (Wedding Pack)
export const WeddingStorySceneSchema = BaseSceneSchema.extend({
  type: z.literal("wedding_story"),
  coupleStory: z.string().max(1000).transform((v) => sanitizeText(v, 1000)),
  photoUrl: z.string().url().max(1000).optional(),
  faithTag: z.string().max(100).optional().transform((v) => v ? sanitizeText(v, 100) : undefined),
  verseText: z.string().max(400).optional().transform((v) => v ? sanitizeText(v, 400) : undefined),
});

// 11. Party Theme & Dress Code Scene (Celebration & Kitty Party Pack - 100% secular, upbeat)
export const PartyThemeSceneSchema = BaseSceneSchema.extend({
  type: z.literal("party_theme"),
  partyTheme: z.string().max(100).default("Pastel Chic & High Tea Glam").transform((v) => sanitizeText(v, 100)),
  dressCode: z.string().max(150).default("Pastel hues, stylish hats & chic sunglasses 👒🕶️").transform((v) => sanitizeText(v, 150)),
  storyText: z.string().max(1000).default("Get ready for an afternoon of fabulous bites, sparkling drinks, hilarious games, and non-stop laughter with the gang!").transform((v) => sanitizeText(v, 1000)),
  highlights: z.array(z.string().max(200).transform((v) => sanitizeText(v, 200))).max(6).default([
    "Curated High-Tea spread & artisanal cocktails",
    "Exciting kitty party games & surprise prize hampers",
    "Polaroid photo station with fun accessories",
    "Unfiltered chit-chat, music & gossip session",
  ]),
  photoUrl: z.string().url().max(1000).optional(),
});

// 12. Event Details Scene (Wedding & Celebration Packs)
export const EventDetailsSceneSchema = BaseSceneSchema.extend({
  type: z.literal("event_details"),
  eventDate: z.string().max(60).transform((v) => sanitizeText(v, 60)).optional(),
  eventTime: z.string().max(60).transform((v) => sanitizeText(v, 60)).optional(),
  venueName: z.string().max(150).transform((v) => sanitizeText(v, 150)).optional(),
  venueAddress: z.string().max(300).transform((v) => sanitizeText(v, 300)).optional(),
  venueMapUrl: z.string().max(1000).optional(),
  dressCode: z.string().max(150).transform((v) => sanitizeText(v, 150)).optional(),
  themeName: z.string().max(150).transform((v) => sanitizeText(v, 150)).optional(),
});

// 12. Personal Note Scene (Wedding Pack: "Your presence means everything")
export const PersonalNoteSceneSchema = BaseSceneSchema.extend({
  type: z.literal("personal_note"),
  noteText: z.string().max(800).transform((v) => sanitizeText(v, 800)),
  warmClosing: z.string().max(150).optional().transform((v) => v ? sanitizeText(v, 150) : undefined),
});

// 13. RSVP Scene (Wedding Pack: "We saved your seat")
export const RsvpSceneSchema = BaseSceneSchema.extend({
  type: z.literal("rsvp"),
  savedSeatCopy: z.string().max(250).default("We have saved a special seat just for you.").transform((v) => sanitizeText(v, 250)),
  showRsvpCount: z.boolean().default(false),
  rsvpCount: z.number().int().nonnegative().optional(),
});

// 14. Meaning of Their Name Scene (Birthday Pack)
export const NameMeaningSceneSchema = BaseSceneSchema.extend({
  type: z.literal("name_meaning"),
  personName: z.string().max(80).transform((v) => sanitizeText(v, 80)),
  meaningText: z.string().max(800).transform((v) => sanitizeText(v, 800)),
  originOrRoots: z.string().max(100).optional().transform((v) => v ? sanitizeText(v, 100) : undefined),
  curatedPills: z.array(z.string().max(80).transform((v) => sanitizeText(v, 80))).max(6).optional(),
  culturalNote: z.string().max(250).default("Meanings may vary across traditions and families; chosen with love.").transform((v) => sanitizeText(v, 250)),
});

// 15. The Day You Arrived Scene (Birthday Pack)
export const DayArrivedSceneSchema = BaseSceneSchema.extend({
  type: z.literal("day_arrived"),
  storyText: z.string().max(1000).transform((v) => sanitizeText(v, 1000)),
  birthDate: z.string().max(30).optional().transform((v) => v ? sanitizeText(v, 30) : undefined),
  birthWeekday: z.string().max(40).optional().transform((v) => v ? sanitizeText(v, 40) : undefined),
  birthCity: z.string().max(100).optional().transform((v) => v ? sanitizeText(v, 100) : undefined),
  photoUrl: z.string().url().max(1000).optional(),
});

// 16. Wishes from Loved Ones Scene (Birthday & Celebration)
export const WishItemSchema = z.object({
  id: z.string().max(50),
  senderName: z.string().max(80).transform((v) => sanitizeText(v, 80)),
  message: z.string().max(500).transform((v) => sanitizeText(v, 500)),
  relationship: z.string().max(50).optional().transform((v) => v ? sanitizeText(v, 50) : undefined),
});

export const WishesSceneSchema = BaseSceneSchema.extend({
  type: z.literal("wishes"),
  wishes: z.array(WishItemSchema).max(10),
});

// 17. Birthday Finale Scene (Balloon Release OR Candle Blow)
export const BirthdayFinaleSceneSchema = BaseSceneSchema.extend({
  type: z.literal("birthday_finale"),
  finaleType: z.enum(["candle_blow", "balloon_release"]).default("candle_blow"),
  celebrationWish: z.string().max(300).default("Happy Birthday! Wishing you endless joy, laughter, and light ✨").transform((v) => sanitizeText(v, 300)),
  candleBlownMessage: z.string().max(200).default("Make a wish — may all your dreams take flight! 🎂🎈").transform((v) => sanitizeText(v, 200)),
  micBlowEnabled: z.boolean().default(false),
});

// 18. Godhbharai Blessings Scene
export const GodhbharaiBlessingsSceneSchema = BaseSceneSchema.extend({
  type: z.literal("godhbharai_blessings"),
  blessingText: z.string().max(1000).transform((v) => sanitizeText(v, 1000)),
  traditionalVerse: z.string().max(400).optional().transform((v) => v ? sanitizeText(v, 400) : undefined),
});

// 19. Baby Reveal / Hint Scene (Strictly due-date/name hint, NO gender/sex under PCPNDT Act)
export const BabyRevealSceneSchema = BaseSceneSchema.extend({
  type: z.literal("baby_reveal"),
  revealType: z.enum(["name_hint", "due_date_countdown", "scratch_card"]).default("due_date_countdown"),
  dueDate: z.string().max(50).optional().transform((v) => v ? sanitizeText(v, 50) : undefined),
  nameHint: z.string().max(150).optional().transform((v) => v ? sanitizeText(v, 150) : undefined),
  revealMessage: z.string().max(300).default("A sweet little miracle is on the way ✨").transform((v) => sanitizeText(v, 300)),
});

// 20. Sacred Tribute Candle Scene
export const TributeCandleSceneSchema = BaseSceneSchema.extend({
  type: z.literal("tribute_candle"),
  tributeName: z.string().max(100).transform((v) => sanitizeText(v, 100)),
  yearsSpan: z.string().max(60).optional().transform((v) => v ? sanitizeText(v, 60) : undefined),
  candleLitCount: z.number().int().nonnegative().default(1),
  candleMessage: z.string().max(300).default("In loving memory, an eternal flame burns warmly in our hearts.").transform((v) => sanitizeText(v, 300)),
  photoUrl: z.string().url().max(1000).optional(),
});

// 21. What They Taught Us Scene
export const WhatTheyTaughtUsSceneSchema = BaseSceneSchema.extend({
  type: z.literal("what_they_taught_us"),
  lessons: z.array(z.string().max(300).transform((v) => sanitizeText(v, 300))).max(8),
  closingThought: z.string().max(400).optional().transform((v) => v ? sanitizeText(v, 400) : undefined),
});

// 22. Closing Quiet Prayer Scene
export const ClosingPrayerSceneSchema = BaseSceneSchema.extend({
  type: z.literal("closing_prayer"),
  prayerText: z.string().max(1000).transform((v) => sanitizeText(v, 1000)),
  traditionTag: z.string().max(100).optional().transform((v) => v ? sanitizeText(v, 100) : undefined),
});

// 22b. Pre-moderated Tribute Wall Scene
export const TributeWallSceneSchema = BaseSceneSchema.extend({
  type: z.literal("tribute_wall"),
  wallTitle: z.string().max(100).default("Tribute Wall & Remembrances").transform((v) => sanitizeText(v, 100)),
  wallSubtitle: z.string().max(250).default("Leave a gentle message of condolence and cherished memory").transform((v) => sanitizeText(v, 250)),
  requireApproval: z.boolean().default(true),
});

// 23. Devotional Blessing Scene
export const DevotionalBlessingSceneSchema = BaseSceneSchema.extend({
  type: z.literal("devotional_blessing"),
  faith: z.enum(["hindu", "sikh", "muslim", "christian", "secular", "general", "jain"]).default("general"),
  verseTitle: z.string().max(120).optional().transform((v) => v ? sanitizeText(v, 120) : undefined),
  sourceCitation: z.string().max(150).optional().transform((v) => v ? sanitizeText(v, 150) : undefined),
  sacredText: z.string().max(800).transform((v) => sanitizeText(v, 800)),
  transliteration: z.string().max(600).optional().transform((v) => v ? sanitizeText(v, 600) : undefined),
  translationOrMeaning: z.string().max(800).optional().transform((v) => v ? sanitizeText(v, 800) : undefined),
});

// 23b. Devotional Event Significance & Schedule Scene
export const DevotionalSignificanceSceneSchema = BaseSceneSchema.extend({
  type: z.literal("devotional_significance"),
  faith: z.enum(["hindu", "sikh", "muslim", "christian", "secular", "general", "jain"]).default("general"),
  significanceTitle: z.string().max(120).default("Sacred Significance & Rituals").transform((v) => sanitizeText(v, 120)),
  storyText: z.string().max(1000).transform((v) => sanitizeText(v, 1000)),
  traditions: z.array(z.string().max(200).transform((v) => sanitizeText(v, 200))).max(6).default([
    "Sacred prayer & congregational recitation",
    "Devotional music & shanti recitation",
    "Prasad & community feast celebration",
  ]),
  etiquetteNote: z.string().max(250).optional().transform((v) => v ? sanitizeText(v, 250) : undefined),
  eventDate: z.string().max(60).optional().transform((v) => v ? sanitizeText(v, 60) : undefined),
  eventTime: z.string().max(60).optional().transform((v) => v ? sanitizeText(v, 60) : undefined),
  venueName: z.string().max(150).optional().transform((v) => v ? sanitizeText(v, 150) : undefined),
  venueAddress: z.string().max(300).optional().transform((v) => v ? sanitizeText(v, 300) : undefined),
  venueMapUrl: z.string().max(1000).optional(),
});

// 24. Devotional Finale Scene
export const DevotionalFinaleSceneSchema = BaseSceneSchema.extend({
  type: z.literal("devotional_finale"),
  faith: z.enum(["hindu", "sikh", "muslim", "christian", "secular", "general", "jain"]).default("general"),
  ritualType: z.enum([
    "diya_aarti",
    "flower_offering",
    "peace_candle",
    "sacred_prayer",
    "shabad_ardas",
    "dua_blessing",
    "choral_benediction",
    "gratitude_reflection",
    "jain_navkar",
  ]).default("peace_candle"),
  blessingWish: z.string().max(300).default("May divine grace and peace surround you always.").transform((v) => sanitizeText(v, 300)),
});

// Union of all Scene Schemas
export const SceneConfigSchema = z.discriminatedUnion("type", [
  BaseSceneSchema.extend({ type: z.literal("opener") }),
  BalloonPopSceneSchema,
  HowWeMetSceneSchema,
  TimelineSceneSchema,
  ChatStorySceneSchema,
  MemoriesSceneSchema,
  PromisesSceneSchema,
  ArrowHeartSceneSchema,
  LetterUnfoldSceneSchema,
  WeddingStorySceneSchema,
  PartyThemeSceneSchema,
  EventDetailsSceneSchema,
  PersonalNoteSceneSchema,
  RsvpSceneSchema,
  ForgiveReplySceneSchema,
  NameMeaningSceneSchema,
  DayArrivedSceneSchema,
  WishesSceneSchema,
  BirthdayFinaleSceneSchema,
  GodhbharaiBlessingsSceneSchema,
  BabyRevealSceneSchema,
  TributeCandleSceneSchema,
  WhatTheyTaughtUsSceneSchema,
  TributeWallSceneSchema,
  ClosingPrayerSceneSchema,
  DevotionalBlessingSceneSchema,
  DevotionalSignificanceSceneSchema,
  DevotionalFinaleSceneSchema,
  BaseSceneSchema.extend({ type: z.literal("finale") }),
]);

export const ScenesArraySchema = z
  .array(SceneConfigSchema)
  .max(16, "Maximum 16 scenes permitted")
  .refine((scenes) => scenes.length >= 2, {
    message: "A scene flow must include at least an Opener and a Finale",
  })
  .refine((scenes) => {
    // Total image cap per page: max 12 total images across all scenes
    let totalImages = 0;
    for (const sc of scenes) {
      if (sc.type === "how_we_met" && sc.photoUrl) totalImages++;
      if (sc.type === "wedding_story" && sc.photoUrl) totalImages++;
      if (sc.type === "party_theme" && sc.photoUrl) totalImages++;
      if (sc.type === "day_arrived" && sc.photoUrl) totalImages++;
      if (sc.type === "tribute_candle" && sc.photoUrl) totalImages++;
      if (sc.type === "timeline") {
        totalImages += sc.events.filter((e) => Boolean(e.photoUrl)).length;
      }
      if (sc.type === "chat_story") {
        totalImages += sc.messages.filter((m) => Boolean(m.imageUrl)).length;
      }
      if (sc.type === "memories") {
        totalImages += sc.memories.filter((m) => Boolean(m.photoUrl)).length;
      }
    }
    return totalImages <= 12;
  }, {
    message: "A page can contain a maximum of 12 images in total across all scenes.",
  });

export type SceneConfig = z.infer<typeof SceneConfigSchema>;
export type BalloonPopSceneConfig = z.infer<typeof BalloonPopSceneSchema>;
export type HowWeMetSceneConfig = z.infer<typeof HowWeMetSceneSchema>;
export type TimelineSceneConfig = z.infer<typeof TimelineSceneSchema>;
export type ChatStorySceneConfig = z.infer<typeof ChatStorySceneSchema>;
export type MemoriesSceneConfig = z.infer<typeof MemoriesSceneSchema>;
export type PromisesSceneConfig = z.infer<typeof PromisesSceneSchema>;
export type ArrowHeartSceneConfig = z.infer<typeof ArrowHeartSceneSchema>;
export type LetterUnfoldSceneConfig = z.infer<typeof LetterUnfoldSceneSchema>;
export type ForgiveReplySceneConfig = z.infer<typeof ForgiveReplySceneSchema>;
export type WeddingStorySceneConfig = z.infer<typeof WeddingStorySceneSchema>;
export type PartyThemeSceneConfig = z.infer<typeof PartyThemeSceneSchema>;
export type EventDetailsSceneConfig = z.infer<typeof EventDetailsSceneSchema>;
export type PersonalNoteSceneConfig = z.infer<typeof PersonalNoteSceneSchema>;
export type RsvpSceneConfig = z.infer<typeof RsvpSceneSchema>;
export type NameMeaningSceneConfig = z.infer<typeof NameMeaningSceneSchema>;
export type DayArrivedSceneConfig = z.infer<typeof DayArrivedSceneSchema>;
export type WishesSceneConfig = z.infer<typeof WishesSceneSchema>;
export type BirthdayFinaleSceneConfig = z.infer<typeof BirthdayFinaleSceneSchema>;
export type GodhbharaiBlessingsSceneConfig = z.infer<typeof GodhbharaiBlessingsSceneSchema>;
export type BabyRevealSceneConfig = z.infer<typeof BabyRevealSceneSchema>;
export type TributeCandleSceneConfig = z.infer<typeof TributeCandleSceneSchema>;
export type WhatTheyTaughtUsSceneConfig = z.infer<typeof WhatTheyTaughtUsSceneSchema>;
export type TributeWallSceneConfig = z.infer<typeof TributeWallSceneSchema>;
export type ClosingPrayerSceneConfig = z.infer<typeof ClosingPrayerSceneSchema>;
export type DevotionalBlessingSceneConfig = z.infer<typeof DevotionalBlessingSceneSchema>;
export type DevotionalSignificanceSceneConfig = z.infer<typeof DevotionalSignificanceSceneSchema>;
export type DevotionalFinaleSceneConfig = z.infer<typeof DevotionalFinaleSceneSchema>;


/**
 * Validates, caps, and parses scenes JSON string safely.
 * Returns null if invalid or exceeds 60KB limit.
 */
export function parseAndValidateScenesJson(jsonStr?: string | null): SceneConfig[] | null {
  if (!jsonStr || typeof jsonStr !== "string") return null;
  if (jsonStr.length > 60000) return null; // 60KB hard cap

  try {
    const raw = JSON.parse(jsonStr);
    const parsed = ScenesArraySchema.safeParse(raw);
    if (!parsed.success) {
      console.warn("Scene validation failed:", parsed.error.format());
      return null;
    }
    return parsed.data;
  } catch (err) {
    console.warn("Invalid scenes JSON:", err);
    return null;
  }
}

