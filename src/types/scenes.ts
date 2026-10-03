import { z } from "zod";

export type SceneType =
  | "opener"
  | "balloon_pop"
  | "chat_story"
  | "timeline"
  | "promises"
  | "arrow_heart"
  | "letter_unfold"
  | "wedding_story"
  | "event_details"
  | "rsvp"
  | "forgive_reply"
  | "finale";

// Base Zod Schema with text sanitization & length caps
const sanitizeText = (str: string, maxLen = 500) =>
  str.replace(/[<>]/g, "").trim().slice(0, maxLen);

export const BaseSceneSchema = z.object({
  id: z.string().max(50),
  type: z.enum([
    "opener",
    "balloon_pop",
    "chat_story",
    "timeline",
    "promises",
    "arrow_heart",
    "letter_unfold",
    "wedding_story",
    "event_details",
    "rsvp",
    "forgive_reply",
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

// 2. Chat Story Scene (Romantic Pack - buyer text bubbles + screenshot image, NO video)
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

// 3. Promises / Reasons Scene
export const PromisesSceneSchema = BaseSceneSchema.extend({
  type: z.literal("promises"),
  items: z.array(z.string().max(300).transform((v) => sanitizeText(v, 300))).max(10),
});

// 4. Arrow Heart Scene (Romantic Pack)
export const ArrowHeartSceneSchema = BaseSceneSchema.extend({
  type: z.literal("arrow_heart"),
  targetLabel: z.string().max(80).default("My Heart").transform((v) => sanitizeText(v, 80)),
  burstMessage: z.string().max(150).default("You have my whole heart forever ❤️").transform((v) => sanitizeText(v, 150)),
  isProposal: z.boolean().default(false),
});

// 5. Letter Unfold Scene (Universal)
export const LetterUnfoldSceneSchema = BaseSceneSchema.extend({
  type: z.literal("letter_unfold"),
  sealStyle: z.enum(["wax_crimson", "wax_gold", "silver_slate"]).default("wax_crimson"),
});

// 6. Forgive / Reply Scene (Apology Pack)
export const ForgiveReplySceneSchema = BaseSceneSchema.extend({
  type: z.literal("forgive_reply"),
  promptText: z.string().max(200).default("Can we start fresh?").transform((v) => sanitizeText(v, 200)),
  forgiveButtonText: z.string().max(50).default("I Forgive You ❤️").transform((v) => sanitizeText(v, 50)),
  replyPlaceholder: z.string().max(150).default("Write a note back...").transform((v) => sanitizeText(v, 150)),
});

// 7. Wedding Details & RSVP Scenes (Wedding Pack)
export const WeddingDetailsSceneSchema = BaseSceneSchema.extend({
  type: z.literal("event_details"),
  coupleStory: z.string().max(1000).optional().transform((v) => v ? sanitizeText(v, 1000) : undefined),
  faithBlessing: z.string().max(500).optional().transform((v) => v ? sanitizeText(v, 500) : undefined),
  personalNote: z.string().max(800).optional().transform((v) => v ? sanitizeText(v, 800) : undefined),
  venueName: z.string().max(150).optional().transform((v) => v ? sanitizeText(v, 150) : undefined),
  venueAddress: z.string().max(300).optional().transform((v) => v ? sanitizeText(v, 300) : undefined),
  venueMapUrl: z.string().max(1000).optional(),
  eventDate: z.string().max(60).optional(),
  eventTime: z.string().max(60).optional(),
});

export const RsvpSceneSchema = BaseSceneSchema.extend({
  type: z.literal("rsvp"),
  savedSeatCopy: z.string().max(250).default("We have saved a special seat just for you.").transform((v) => sanitizeText(v, 250)),
  showRsvpCount: z.boolean().default(false),
});

// Union of all Scene Schemas
export const SceneConfigSchema = z.discriminatedUnion("type", [
  BaseSceneSchema.extend({ type: z.literal("opener") }),
  BalloonPopSceneSchema,
  ChatStorySceneSchema,
  PromisesSceneSchema,
  ArrowHeartSceneSchema,
  LetterUnfoldSceneSchema,
  BaseSceneSchema.extend({ type: z.literal("wedding_story") }),
  WeddingDetailsSceneSchema,
  RsvpSceneSchema,
  ForgiveReplySceneSchema,
  BaseSceneSchema.extend({ type: z.literal("finale") }),
]);

export const ScenesArraySchema = z
  .array(SceneConfigSchema)
  .max(16, "Maximum 16 scenes permitted")
  .refine((scenes) => scenes.length >= 2, {
    message: "A scene flow must include at least an Opener and a Finale",
  });

export type SceneConfig = z.infer<typeof SceneConfigSchema>;
export type BalloonPopSceneConfig = z.infer<typeof BalloonPopSceneSchema>;
export type ChatStorySceneConfig = z.infer<typeof ChatStorySceneSchema>;
export type PromisesSceneConfig = z.infer<typeof PromisesSceneSchema>;
export type ArrowHeartSceneConfig = z.infer<typeof ArrowHeartSceneSchema>;
export type LetterUnfoldSceneConfig = z.infer<typeof LetterUnfoldSceneSchema>;
export type ForgiveReplySceneConfig = z.infer<typeof ForgiveReplySceneSchema>;
export type WeddingDetailsSceneConfig = z.infer<typeof WeddingDetailsSceneSchema>;
export type RsvpSceneConfig = z.infer<typeof RsvpSceneSchema>;

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
