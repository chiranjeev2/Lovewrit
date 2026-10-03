import { SceneConfig } from "@/types/scenes";

export function getDefaultScenesForOccasion(
  occasion: string,
  options?: {
    senderName?: string;
    recipientName?: string;
    letter?: string;
    sampleReasons?: string[];
  }
): SceneConfig[] {
  const sender = options?.senderName || "John";
  const recipient = options?.recipientName || "Snow";

  if (occasion === "apology" || occasion === "sorry" || occasion === "from-my-heart") {
    const reasons = options?.sampleReasons && options.sampleReasons.length === 5
      ? options.sampleReasons
      : [
          "I deeply regret how my words made you feel.",
          "Our bond is more precious to me than any pride or argument.",
          "You have always shown me patience, and I failed to match your grace.",
          "I miss your laugh, your peace, and the warmth we share.",
          "I promise to listen with an open heart and earn back your trust.",
        ];

    return [
      {
        id: "apology-opener",
        type: "opener",
        title: `For ${recipient}`,
        subtitle: `A quiet, honest message from ${sender}`,
        enabled: true,
        required: true,
      },
      {
        id: "apology-balloons",
        type: "balloon_pop",
        title: "5 Reasons I Am Asking For Your Forgiveness",
        subtitle: "Tap each balloon gently to reveal what is in my heart",
        reasons,
        completionTitle: "I am so sorry 😞",
        completionSubtitle: "Every reason here is why you mean the world to me.",
        enabled: true,
      },
      {
        id: "apology-letter",
        type: "letter_unfold",
        title: "From My Deepest Heart",
        subtitle: "The complete letter I wrote for you",
        sealStyle: "wax_crimson",
        enabled: true,
      },
      {
        id: "apology-reply",
        type: "forgive_reply",
        title: "Can We Start Fresh?",
        subtitle: "Take your time — whenever you are ready",
        promptText: "Will you forgive me?",
        forgiveButtonText: "I Forgive You ❤️",
        replyPlaceholder: "Send a voice note or message back to John...",
        enabled: true,
      },
      {
        id: "apology-finale",
        type: "finale",
        title: "Always In My Heart",
        subtitle: "With deepest sincerity and love",
        enabled: true,
        required: true,
      },
    ];
  }

  // Default fallback scene structure for any occasion
  return [
    {
      id: "default-opener",
      type: "opener",
      title: `For ${recipient}`,
      subtitle: `With love from ${sender}`,
      enabled: true,
      required: true,
    },
    {
      id: "default-letter",
      type: "letter_unfold",
      title: "A Heartfelt Letter",
      subtitle: "Written especially for you",
      sealStyle: "wax_crimson",
      enabled: true,
    },
    {
      id: "default-finale",
      type: "finale",
      title: "Forever Cherished",
      subtitle: "Thank you for being part of my journey",
      enabled: true,
      required: true,
    },
  ];
}
