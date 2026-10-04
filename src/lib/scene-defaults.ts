import { SceneConfig } from "@/types/scenes";
import { getDefaultVerseForFaith } from "@/lib/devotional-verses";

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

  const isGodhbharai =
    occasion === "godhbharai" ||
    (options?.templateId && options.templateId.includes("godhbharai"));

  if (isGodhbharai) {
    return [
      {
        id: "godhbharai-opener",
        type: "opener",
        title: `For ${recipient}`,
        subtitle: `An auspicious celebration of new life, motherhood, and blessings, from ${sender}`,
        enabled: true,
        required: true,
      },
      {
        id: "godhbharai-blessings",
        type: "godhbharai_blessings",
        title: "Sacred Ashirwad & Blessings",
        subtitle: "May divine grace protect and nurture both mother and child",
        traditionalVerse: "ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः • May all beings be blessed with peace, health, and radiant grace.",
        blessingText: "As we gather to celebrate this sacred milestone, we invoke the timeless blessings of elders and loved ones for radiant health, joy, and peace for the mother and the arrival of our little miracle.",
        enabled: true,
      },
      {
        id: "godhbharai-baby-reveal",
        type: "baby_reveal",
        title: "A Sweet Reveal",
        subtitle: "Scratch the card to reveal our little secret ✨",
        revealType: "scratch_card",
        dueDate: "Autumn 2026",
        nameHint: "Starts with the letter 'A' • Symbolizing dawn & new beginnings",
        revealMessage: "A tiny soul is on their way to fill our lives with boundless laughter, love, and wonder.",
        enabled: true,
      },
      {
        id: "godhbharai-wishes",
        type: "wishes",
        title: "Blessings from Elders & Family",
        subtitle: "Warm notes of love and prayer from near and far",
        wishes: [
          {
            id: "gw-1",
            senderName: "Dadi & Nani",
            message: "May mother and child always be blessed with good health, prosperity, and endless joy.",
            relationship: "Grandmothers",
          },
          {
            id: "gw-2",
            senderName: sender,
            message: "We cannot wait to shower our little angel with infinite hugs, bedtime stories, and unconditional love.",
            relationship: "Family",
          },
        ],
        enabled: true,
      },
      {
        id: "godhbharai-details",
        type: "event_details",
        title: "Ceremony Schedule & Venue",
        subtitle: "Join us in performing the auspicious rituals",
        eventDate: "Sunday, November 8, 2026",
        eventTime: "Rituals: 10:30 AM • Mahaprasad & Lunch: 12:30 PM",
        venueName: options?.location || "Grand Imperial Banquet Hall",
        venueAddress: "Sector 17, Chandigarh",
        venueMapUrl: "https://maps.google.com",
        enabled: true,
      },
      {
        id: "godhbharai-rsvp",
        type: "rsvp",
        title: "We Saved Your Seat",
        subtitle: "Please let us know if you will grace us with your presence",
        savedSeatCopy: "A seat of honor and a place in our hearts is warmly reserved for you.",
        showRsvpCount: true,
        rsvpCount: 36,
        enabled: true,
      },
      {
        id: "godhbharai-finale",
        type: "finale",
        title: "With All Our Gratitude & Love",
        subtitle: `Your blessings mean the world to our growing family, ${sender}`,
        enabled: true,
        required: true,
      },
    ];
  }

  const isMemorial =
    occasion === "memorial" ||
    occasion === "tribute" ||
    (options?.templateId && ["in-loving-memory", "sacred-tribute"].includes(options.templateId));

  if (isMemorial) {
    const samplePhotos = options?.samplePhotos && options.samplePhotos.length > 0
      ? options.samplePhotos
      : [
          "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
          "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
        ];

    return [
      {
        id: "memorial-opener",
        type: "opener",
        title: `In Loving Memory of ${recipient}`,
        subtitle: `A sacred tribute to a beautiful soul, honoring their timeless journey • Remembered with love by ${sender}`,
        enabled: true,
        required: true,
      },
      {
        id: "memorial-candle",
        type: "tribute_candle",
        title: "Eternal Flame of Remembrance",
        subtitle: "A light that never dims in our hearts",
        tributeName: recipient,
        yearsSpan: "1948 – 2024",
        candleLitCount: 42,
        candleMessage: "In loving memory, an eternal flame burns warmly in our hearts. Your wisdom, gentle laughter, and unconditional kindness continue to light our path.",
        photoUrl: samplePhotos[0],
        enabled: true,
      },
      {
        id: "memorial-life-photos",
        type: "timeline",
        title: "Life in Photos",
        subtitle: "A journey of warmth, devotion, and gentle moments",
        events: [
          {
            id: "tl-1",
            yearOrDate: "1968",
            title: "Early Beginnings & Youth",
            description: "A bright smile and a heart filled with curiosity and boundless dreams.",
            photoUrl: samplePhotos[0],
          },
          {
            id: "tl-2",
            yearOrDate: "1994",
            title: "Devotion to Family & Home",
            description: "Building a home rooted in kindness, patient guidance, and unshakeable love.",
            photoUrl: samplePhotos[1] || samplePhotos[0],
          },
          {
            id: "tl-3",
            yearOrDate: "2018",
            title: "Years of Wisdom & Blessing",
            description: "Surrounded by grandchildren and generations inspired by their quiet strength.",
            photoUrl: samplePhotos[0],
          },
        ],
        enabled: true,
      },
      {
        id: "memorial-cherished-memories",
        type: "memories",
        title: "Cherished Memories",
        subtitle: "The precious moments that will forever stay with us",
        memories: [
          {
            id: "mem-1",
            title: "Warmth Around the Table",
            caption: "Every gathering was brighter with their stories, warm tea, and gentle laughter.",
            photoUrl: samplePhotos[1] || samplePhotos[0],
          },
          {
            id: "mem-2",
            title: "Quiet Evenings & Sage Advice",
            caption: "Always listening with patience, offering kindness and reassurance before judgment.",
            photoUrl: samplePhotos[0],
          },
        ],
        enabled: true,
      },
      {
        id: "memorial-what-they-taught-us",
        type: "what_they_taught_us",
        title: "What They Taught Us",
        subtitle: "The virtues, life lessons, and quiet wisdom left behind",
        lessons: [
          "To treat every soul with quiet dignity and unconditional kindness.",
          "That true wealth lies in simple honesty, good deeds, and loving family.",
          "To remain calm through life's storms and never lose faith in tomorrow.",
          "To give freely without ever expecting anything in return.",
        ],
        closingThought: "These timeless lessons live on in every choice we make and every kindness we share.",
        enabled: true,
      },
      {
        id: "memorial-tribute-wall",
        type: "tribute_wall",
        title: "Tribute Wall & Condolences",
        subtitle: "Leave a gentle message of love, memory, and prayer for the family",
        wallTitle: "Words of Remembrance",
        wallSubtitle: "Condolences and fond memories from loved ones and friends",
        requireApproval: true,
        enabled: true,
      },
      {
        id: "memorial-closing-prayer",
        type: "closing_prayer",
        title: "Rest in Eternal Peace",
        subtitle: "May divine peace and grace wrap their soul in eternal light",
        prayerText: "May their noble soul find eternal peace, wrapped in divine grace and boundless light.\nThough physically parted, their gentle warmth and timeless love remain forever etched into our spirits.",
        traditionTag: "In Sacred Remembrance",
        enabled: true,
        required: true,
      },
    ];
  }

  const isWedding = [
    "wedding",
    "wedding_invite",
    "invites",
    "shubh_vivah",
    "shubh-vivah",
  ].includes(occasion) || (options?.templateId && ["wedding-invite"].includes(options.templateId));

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

  const isCelebration = [
    "kitty_party",
    "kitty",
    "celebration",
    "party",
    "high_tea",
    "social_gathering",
  ].includes(occasion) || (options?.templateId && ["chic-kitty-party", "kitty-party"].includes(options.templateId));

  if (isCelebration) {
    const samplePhotos = options?.samplePhotos && options.samplePhotos.length > 0
      ? options.samplePhotos
      : [
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
          "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
        ];

    return [
      {
        id: "kitty-opener",
        type: "opener",
        title: `Invited by Name: ${recipient}`,
        subtitle: `You are cordially invited to an afternoon of laughter, treats & chic vibes with ${sender}`,
        enabled: true,
        required: true,
      },
      {
        id: "kitty-theme",
        type: "party_theme",
        title: "The Vibe & Dress Code",
        subtitle: "Fabulous bites, sparkling drinks & non-stop laughter",
        partyTheme: "Pastel Chic & High Tea Glam",
        dressCode: "Pastel hues, stylish hats & chic sunglasses 👒🕶️",
        storyText: "It's time for our favorite friends and tribe to gather! Leave the daily rush behind and join us for an afternoon filled with mouth-watering treats, playful party games, bubbly conversations, and unforgettable memories.",
        highlights: [
          "Curated High-Tea spread & artisanal cocktails",
          "Exciting kitty party games & surprise prize hampers",
          "Polaroid photo station with fun accessories",
          "Non-stop music, chit-chat & gossip session",
        ],
        photoUrl: samplePhotos[0],
        enabled: true,
      },
      {
        id: "kitty-details",
        type: "event_details",
        title: "Party Venue & Schedule",
        subtitle: "Where the celebration begins • Mark your calendars!",
        eventDate: "Saturday, 21 November 2026",
        eventTime: "3:30 PM – 7:00 PM",
        venueName: options?.location || "Olive Bistro & Terrace Lounge",
        venueAddress: "Road 46, Jubilee Hills, Hyderabad",
        venueMapUrl: "https://maps.google.com/?q=Olive+Bistro+Hyderabad",
        dressCode: "Pastel Chic & Hats 👒",
        themeName: "High Tea Glam",
        enabled: true,
      },
      {
        id: "kitty-personal-note",
        type: "personal_note",
        title: "Can't Wait to See You!",
        subtitle: `A personal note from ${sender}`,
        noteText: "Our gathering wouldn't be the same without your fabulous energy, warm smile, and infectious laughter. Come ready to feast, play, and make memories that will have us smiling for months to come!",
        warmClosing: `With so much excitement and love, ${sender} 💕`,
        enabled: true,
      },
      {
        id: "kitty-rsvp",
        type: "rsvp",
        title: "We Saved Your Seat!",
        subtitle: "Kindly let us know if you can join the fun",
        savedSeatCopy: "A spot at our table, a welcome cocktail, and a personalized party hamper are waiting for you!",
        showRsvpCount: true,
        rsvpCount: 16,
        enabled: true,
      },
      {
        id: "kitty-finale",
        type: "finale",
        title: "See You on the Party Floor! 🥂",
        subtitle: `Get ready for an unforgettable celebration with ${sender}`,
        enabled: true,
        required: true,
      },
    ];
  }

  const isDevotional = [
    "devotional",
    "religious",
    "jagrata_kirtan",
    "akhand_path",
    "gurpurab",
    "aqeeqah",
    "nikah",
    "iftar",
    "christening",
    "wedding_blessing",
    "blessing_ceremony",
    "pooja",
    "katha",
    "satsang",
  ].includes(occasion) || (options?.templateId && [
    "jagrata-kirtan-invitation",
    "sikh-akhand-path",
    "sikh-gurpurab",
    "muslim-aqeeqah",
    "muslim-nikah",
    "muslim-iftar",
    "christian-christening",
    "christian-wedding-blessing",
    "secular-blessing-ceremony",
  ].includes(options.templateId));

  if (isDevotional) {
    let faith: "hindu" | "sikh" | "muslim" | "christian" | "secular" = "hindu";
    if (
      occasion === "akhand_path" ||
      occasion === "gurpurab" ||
      options?.templateId === "sikh-akhand-path" ||
      options?.templateId === "sikh-gurpurab"
    ) {
      faith = "sikh";
    } else if (
      occasion === "aqeeqah" ||
      occasion === "nikah" ||
      occasion === "iftar" ||
      options?.templateId === "muslim-aqeeqah" ||
      options?.templateId === "muslim-nikah" ||
      options?.templateId === "muslim-iftar"
    ) {
      faith = "muslim";
    } else if (
      occasion === "christening" ||
      occasion === "wedding_blessing" ||
      options?.templateId === "christian-christening" ||
      options?.templateId === "christian-wedding-blessing"
    ) {
      faith = "christian";
    } else if (
      occasion === "blessing_ceremony" ||
      options?.templateId === "secular-blessing-ceremony"
    ) {
      faith = "secular";
    }

    const verse = getDefaultVerseForFaith(faith);

    // Faith-specific text configurations
    let openerTitle = `ॐ Sadar Nimantran for ${recipient}`;
    let openerSub = `With the divine grace and blessings of the Almighty, invited by ${sender}`;
    let significanceTitle = "Mata Ki Chowki, Jagrata & Aarti Mahotsav";
    let storyText = "We warmly invite you and your family to gather in prayer and devotion. Let us sing bhajans, seek divine blessings for health and prosperity, and celebrate the sacred presence among us.";
    let traditions = [
      "Shri Ganesha Vandana & Deep Prajwalan",
      "Akhand Jyoti & Devotional Bhajan Kirtan",
      "Maha Aarti, Bhog & Pavitra Prasad",
    ];
    let etiquetteNote = "Devotees are requested to remove footwear before entering the prayer hall. Modest attire appreciated.";
    let venueName = options?.location || "Shri Sanatan Dharam Mandir Hall";
    let eventDate = "Saturday, 24 October 2026";
    let eventTime = "7:30 PM Onwards";
    let venueAddress = "Civil Lines, Near Model Town";
    let venueMapUrl = "https://maps.google.com";
    let ritualType: "diya_aarti" | "shabad_ardas" | "dua_blessing" | "choral_benediction" | "gratitude_reflection" = "diya_aarti";
    let blessingWish = "May the divine flame illuminate your life with infinite joy, good health, and peace.";

    if (faith === "sikh") {
      openerTitle = `ੴ Sat Sri Akaal, ${recipient}`;
      openerSub = `Sadar Nimantran with the divine blessings of Sri Guru Granth Sahib Ji, from ${sender}`;
      significanceTitle = "Akhand Path Sahib & Kirtan Samagam";
      storyText = "With humble hearts and boundless gratitude, we invite you to join our family for the sacred Akhand Path Sahib. Come sit in the divine presence of the Guru and partake in Sangat and Pangat.";
      traditions = [
        "Arambh of Sri Akhand Path Sahib",
        "Gurbani Kirtan by Ragi Jatha",
        "Samapti, Anand Sahib, Ardas & Hukamnama",
        "Guru Ka Langar served continuously",
      ];
      etiquetteNote = "Kindly cover your head with a rumal/dupatta and remove shoes before entering the Darbar Hall.";
      venueName = options?.location || "Gurdwara Sri Guru Singh Sabha";
      eventDate = "Sunday, 15 November 2026";
      eventTime = "10:00 AM Onwards";
      venueAddress = "Grand Trunk Road, Model Town";
      ritualType = "shabad_ardas";
      blessingWish = "Nanak Naam Chardi Kala, Tere Bhane Sarbat Da Bhala ੴ May Waheguru bless you and your family with peace and abundance.";
    } else if (faith === "muslim") {
      openerTitle = `Assalamu Alaikum, ${recipient}`;
      openerSub = `With prayers for peace, barakah & joy from ${sender}`;
      significanceTitle = "Auspicious Celebration & Mubarak Gathering";
      storyText = "All praise belongs to Allah (SWT). We warmly request the honor of your presence and heartfelt duas to celebrate this blessed milestone with our family.";
      traditions = [
        "Recitation of Holy Quran & Duas",
        "Khatam & Family Supplications",
        "Festive Feast & Warm Hospitality",
      ];
      etiquetteNote = "Modest attire requested. Separate seating arrangements available for family comfort.";
      venueName = options?.location || "Al-Noor Banquet & Community Hall";
      eventDate = "Saturday, 12 December 2026";
      eventTime = "7:30 PM";
      venueAddress = "Jubilee Hills, Road 36";
      ritualType = "dua_blessing";
      blessingWish = "May Allah (SWT) grant your home endless barakah, guidance, and peace. Ameen 🌙";
    } else if (faith === "christian") {
      openerTitle = `Grace & Peace to You, ${recipient}`;
      openerSub = `A blessed invitation to celebrate God's grace together with ${sender}`;
      significanceTitle = "Sacred Service & Celebration of Grace";
      storyText = "We warmly welcome you to witness and celebrate this holy milestone. Together in fellowship and thanksgiving, we praise God for His unending kindness and guidance.";
      traditions = [
        "Opening Hymn & Scripture Reading",
        "Sacred Blessing & Dedication Prayer",
        "Choral Benediction & Fellowship Luncheon",
      ];
      etiquetteNote = "All are warmly welcome in modest attire. The church doors open 30 minutes prior to service.";
      venueName = options?.location || "Grace Cathedral Fellowship Chapel";
      eventDate = "Sunday, 22 November 2026";
      eventTime = "11:00 AM";
      venueAddress = "Cathedral Road, Richmond Town";
      ritualType = "choral_benediction";
      blessingWish = "The Lord bless you and keep you; may His light and love guide your steps always 🕊️";
    } else if (faith === "secular") {
      openerTitle = `Warm Greetings, ${recipient}`;
      openerSub = `You are cordially invited to celebrate a milestone of unity with ${sender}`;
      significanceTitle = "A Gathering of Gratitude & Unity";
      storyText = "Good food, dear friends, and warm memories. We cordially invite you to join us in marking this meaningful life milestone. Your presence and good wishes are our greatest gift.";
      traditions = [
        "Welcome Toast & Story of Milestone",
        "Words of Gratitude & Reflection",
        "Celebration Meal & Music",
      ];
      etiquetteNote = "Casual or semi-formal attire. Comfortable footwear recommended for garden walk.";
      venueName = options?.location || "The Glass House Gardens";
      eventDate = "Sunday, 20 December 2026";
      eventTime = "12:30 PM";
      venueAddress = "Valley View Estate, North Ridge";
      ritualType = "gratitude_reflection";
      blessingWish = "May warmth, laughter, and compassionate understanding fill all your days ✨";
    }

    return [
      {
        id: "devotional-opener",
        type: "opener",
        title: openerTitle,
        subtitle: openerSub,
        enabled: true,
        required: true,
      },
      {
        id: "devotional-blessing",
        type: "devotional_blessing",
        title: "Sacred Scripture & Blessing",
        subtitle: "Timeless wisdom and benediction",
        faith,
        verseTitle: verse.title,
        sourceCitation: verse.source,
        sacredText: verse.scriptureText,
        transliteration: verse.transliteration,
        translationOrMeaning: verse.meaning,
        enabled: true,
      },
      {
        id: "devotional-significance",
        type: "devotional_significance",
        title: "Spiritual Significance & Schedule",
        subtitle: "Why this sacred occasion is celebrated",
        faith,
        significanceTitle,
        storyText,
        traditions,
        etiquetteNote,
        venueName,
        eventDate,
        eventTime,
        venueAddress,
        venueMapUrl,
        enabled: true,
      },
      {
        id: "devotional-finale",
        type: "devotional_finale",
        title: "Sacred Offering & Benediction",
        subtitle: "Closing blessing for all present",
        faith,
        ritualType,
        blessingWish,
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
