import { SceneConfig } from "@/types/scenes";

export interface SceneDefaultsOptions {
  senderName?: string;
  recipientName?: string;
  letter?: string;
  sampleReasons?: string[];
  templateId?: string;
  samplePhotos?: string[];
  location?: string;
}

export function getDefaultScenesForOccasion(
  occasion: string,
  options?: SceneDefaultsOptions
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

  const isRomantic = [
    "proposal",
    "anniversary",
    "couples",
    "reminiscing",
    "valentine",
    "forever-proposal",
    "be-my-girlfriend",
    "modern-romance",
    "sweet-reminiscing",
  ].includes(occasion) || (options?.templateId && ["forever-proposal", "be-my-girlfriend", "modern-romance", "sweet-reminiscing"].includes(options.templateId));

  if (isRomantic) {
    const isProposal = occasion === "proposal" || options?.templateId === "forever-proposal" || options?.templateId === "be-my-girlfriend";
    const samplePhotos = options?.samplePhotos && options.samplePhotos.length > 0
      ? options.samplePhotos
      : [
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
          "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
        ];

    return [
      {
        id: "romantic-opener",
        type: "opener",
        title: `For ${recipient}`,
        subtitle: `A timeless love story written by ${sender}`,
        enabled: true,
        required: true,
      },
      {
        id: "romantic-how-we-met",
        type: "how_we_met",
        title: "How We Met",
        subtitle: "The moment that changed everything",
        storyText: "It felt like an ordinary day until you walked in. From that very first glance, time slowed down. What started as a simple conversation quickly became the brightest chapter of my life.",
        photoUrl: samplePhotos[0],
        location: options?.location || "Where It All Began",
        dateLabel: "Our First Day",
        enabled: true,
      },
      {
        id: "romantic-timeline",
        type: "timeline",
        title: "Our Life Together",
        subtitle: "Every milestone a memory we built hand in hand",
        events: [
          {
            id: "tl-1",
            yearOrDate: "Chapter One",
            title: "First Unforgettable Date",
            description: "Laughing so hard over coffee that the café closed around us.",
            photoUrl: samplePhotos[0],
          },
          {
            id: "tl-2",
            yearOrDate: "Chapter Two",
            title: "Our First Getaway",
            description: "Getting lost together and finding out anywhere with you is home.",
            photoUrl: samplePhotos[1],
          },
          {
            id: "tl-3",
            yearOrDate: "Today & Always",
            title: "Growing Closer Every Day",
            description: "Every single morning with you is my favorite chapter yet.",
          },
        ],
        enabled: true,
      },
      {
        id: "romantic-chat",
        type: "chat_story",
        title: "Our Talks",
        subtitle: "The late-night conversations that stole my heart",
        contactName: recipient,
        messages: [
          {
            id: "chat-1",
            sender: "buyer",
            text: "Are you still awake?",
            timestamp: "11:42 PM",
          },
          {
            id: "chat-2",
            sender: "recipient",
            text: "Always for you. Thinking about our day ❤️",
            timestamp: "11:43 PM",
          },
          {
            id: "chat-3",
            sender: "buyer",
            text: "Just wanted to say you're my favorite person in the entire world.",
            timestamp: "11:44 PM",
          },
          {
            id: "chat-4",
            sender: "recipient",
            text: "You always know how to make me melt 🥰",
            timestamp: "11:45 PM",
          },
        ],
        enabled: true,
      },
      {
        id: "romantic-memories",
        type: "memories",
        title: "Favorite Memories",
        subtitle: "Moments I keep tucked away in my heart",
        memories: [
          {
            id: "mem-1",
            title: "Golden Hour Glow",
            caption: "Watching the sun dip below the horizon with you.",
            photoUrl: samplePhotos[1] || samplePhotos[0],
          },
          {
            id: "mem-2",
            title: "Spontaneous Adventures",
            caption: "The day we forgot the map and found something even better.",
            photoUrl: samplePhotos[2] || samplePhotos[0],
          },
        ],
        enabled: true,
      },
      {
        id: "romantic-promises",
        type: "promises",
        title: "Promises to Each Other",
        subtitle: "Vows I promise to uphold every single day",
        items: [
          "To choose you, even on the quiet, hard days.",
          "To always be your safest place to land.",
          "To celebrate every small victory and laugh at every mess.",
          "To never stop making you feel cherished and deeply loved.",
        ],
        enabled: true,
      },
      {
        id: "romantic-arrow-heart",
        type: "arrow_heart",
        title: isProposal ? "A Question From My Heart" : "Direct Hit",
        subtitle: isProposal ? "Aim Cupid's bow to unlock what comes next" : "Drag the bow to aim, release to shoot Cupid's arrow!",
        targetLabel: `${recipient}'s Heart`,
        burstMessage: isProposal ? "Will You Marry Me? 💍" : "You have my whole heart forever ❤️",
        isProposal,
        questionText: isProposal ? "Will you make me the happiest person and marry me?" : undefined,
        yesText: isProposal ? "YES! A Million Times Yes! 💍" : undefined,
        noText: isProposal ? "No" : undefined,
        enabled: true,
      },
      {
        id: "romantic-letter",
        type: "letter_unfold",
        title: "From My Deepest Heart",
        subtitle: "The complete letter I wrote for you",
        sealStyle: "wax_crimson",
        enabled: true,
      },
      {
        id: "romantic-finale",
        type: "finale",
        title: "Yours Forever",
        subtitle: `With all my heart, ${sender}`,
        enabled: true,
        required: true,
      },
    ];
  }

  const isBirthday = occasion === "birthday" || (options?.templateId && options.templateId.includes("birthday"));

  if (isBirthday) {
    const samplePhotos = options?.samplePhotos && options.samplePhotos.length > 0
      ? options.samplePhotos
      : [
          "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80",
          "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
        ];

    return [
      {
        id: "birthday-opener",
        type: "opener",
        title: `For ${recipient}`,
        subtitle: `A celebration of your life, light, and laughter, from ${sender}`,
        enabled: true,
        required: true,
      },
      {
        id: "birthday-name-meaning",
        type: "name_meaning",
        title: "The Meaning of Your Name",
        subtitle: "A name chosen with deep love and meaning",
        personName: recipient,
        meaningText: "Radiance, warmth, and a gentle strength that makes everyone around you feel cherished and at home.",
        originOrRoots: "Classical Origins",
        curatedPills: ["Radiant Light", "Joyful Spirit", "Kind Heart"],
        culturalNote: "Meanings may vary across traditions and families; chosen with love.",
        enabled: true,
      },
      {
        id: "birthday-day-arrived",
        type: "day_arrived",
        title: "The Day You Arrived",
        subtitle: "The world became so much brighter",
        storyText: "From the very first day you arrived, you brought a warmth and laughter that shaped our world. Every year since has been a gift to everyone who knows you.",
        birthDate: "2000-05-15",
        birthWeekday: "Monday",
        birthCity: options?.location || "Bengaluru",
        photoUrl: samplePhotos[0],
        enabled: true,
      },
      {
        id: "birthday-memories",
        type: "memories",
        title: "Moments of Joy",
        subtitle: "A few snapshots of memories we cherish forever",
        memories: [
          {
            id: "bm-1",
            title: "Golden Smiles",
            caption: "Every ordinary moment turned extraordinary with your laugh.",
            photoUrl: samplePhotos[0],
          },
          {
            id: "bm-2",
            title: "Sunlit Days",
            caption: "Adventures, conversations, and all the joy along the way.",
            photoUrl: samplePhotos[1],
          },
        ],
        enabled: true,
      },
      {
        id: "birthday-wishes",
        type: "wishes",
        title: "Wishes from Loved Ones",
        subtitle: "Words sent from the heart for your special day",
        wishes: [
          {
            id: "bw-1",
            senderName: sender,
            message: "May this upcoming year bring you boundless happiness, thrilling adventures, and all the peace your heart deserves.",
            relationship: "With Deep Love",
          },
          {
            id: "bw-2",
            senderName: "Family & Friends",
            message: "You are the brightest light in our circle. Never stop smiling, dreaming, and inspiring us all.",
            relationship: "Always in Your Corner",
          },
        ],
        enabled: true,
      },
      {
        id: "birthday-candle-finale",
        type: "birthday_finale",
        title: "Make a Birthday Wish 🎂",
        subtitle: "Hold down to blow the candle or use microphone",
        finaleType: "candle_blow",
        celebrationWish: "Happy Birthday! May your year be filled with wonder and boundless joy ✨",
        candleBlownMessage: "Make a wish — may all your dreams take flight! 🎂🎈",
        micBlowEnabled: false,
        enabled: true,
      },
      {
        id: "birthday-closing-finale",
        type: "finale",
        title: "Happy Birthday!",
        subtitle: `With all my heart and warmest wishes, ${sender}`,
        enabled: true,
        required: true,
      },
    ];
  }

  const isWedding = [
    "wedding",
    "wedding_invite",
    "invites",
    "godhbharai",
    "shubh_vivah",
    "shubh-vivah",
  ].includes(occasion) || (options?.templateId && ["godhbharai-blessings", "wedding-invite"].includes(options.templateId));

  if (isWedding) {
    const samplePhotos = options?.samplePhotos && options.samplePhotos.length > 0
      ? options.samplePhotos
      : [
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
        ];

    return [
      {
        id: "wedding-opener",
        type: "opener",
        title: `Invited by Name: ${recipient}`,
        subtitle: `You are cordially invited to celebrate with ${sender}`,
        enabled: true,
        required: true,
      },
      {
        id: "wedding-story",
        type: "wedding_story",
        title: "Our Story",
        subtitle: "Two souls, two families, one blessed journey",
        coupleStory: "From our very first conversation to every shared sunrise, our bond has grown into a lifelong devotion. With the love and blessings of our parents, we take this sacred step together.",
        photoUrl: samplePhotos[0],
        faithTag: "In Grace & Gratitude",
        verseText: "May this union be blessed with endless laughter, boundless peace, and eternal love.",
        enabled: true,
      },
      {
        id: "wedding-details",
        type: "event_details",
        title: "Celebration Details",
        subtitle: "When & Where We Gather",
        eventDate: "Saturday, 28 November 2026",
        eventTime: "6:30 PM Onwards",
        venueName: options?.location || "The Grand Heritage Palace",
        venueAddress: "Lake Pichola Road, Udaipur, Rajasthan",
        venueMapUrl: "https://maps.google.com/?q=Lake+Pichola+Udaipur",
        enabled: true,
      },
      {
        id: "wedding-personal-note",
        type: "personal_note",
        title: "Your Presence Means Everything",
        subtitle: "A personal note from our hearts",
        noteText: "A celebration is truly meaningful only when surrounded by the people who have shaped our lives. Having you with us on our most cherished day completes our happiness. We cannot wait to celebrate, laugh, and create memories together.",
        warmClosing: "With our deepest love and respect, The Couple & Families",
        enabled: true,
      },
      {
        id: "wedding-rsvp",
        type: "rsvp",
        title: "We Saved Your Seat",
        subtitle: "Kindly let us know if you can join our celebration",
        savedSeatCopy: "A seat at our table and a place in our hearts is warmly reserved for you.",
        showRsvpCount: true,
        rsvpCount: 48,
        enabled: true,
      },
      {
        id: "wedding-finale",
        type: "finale",
        title: "We Can't Wait to Celebrate With You",
        subtitle: `With warmest blessings, ${sender}`,
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
