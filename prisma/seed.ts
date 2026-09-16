import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Lovewrit database with Phase 1 & Phase 2 demo orders...");

  // 1. Proposal Page Demo
  await prisma.order.upsert({
    where: { slug: "proposal-demo" },
    update: {},
    create: {
      slug: "proposal-demo",
      customerEmail: "aarav@example.com",
      customerName: "Aarav Sharma",
      productType: "PAGE",
      templateId: "forever-proposal",
      tier: "SELF_SERVICE",
      status: "PAID",
      currency: "INR",
      amountTotal: 20000,
      region: "asia_africa",
      stripeSessionId: "sim_proposal_demo",
      adminToken: "token_proposal_demo",
      pageData: {
        create: {
          senderName: "Aarav",
          recipientName: "Simran",
          occasion: "proposal",
          letter:
            "From the very first conversation over chai in Udaipur, I knew my search was over. Every single day with you is filled with light, laughter, and so much peace. Will you make me the happiest person and marry me?",
          photoUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
            "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
          ]),
          musicTrack:
            "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112191.mp3",
          musicType: "builtin",
          isProposal: true,
          colorTheme: "rose",
          language: "en",
        },
      },
    },
  });

  // 2. Anniversary Card Demo
  await prisma.order.upsert({
    where: { slug: "anniversary-demo" },
    update: {},
    create: {
      slug: "anniversary-demo",
      customerEmail: "dev@example.com",
      customerName: "Dev Mehta",
      productType: "CARD",
      templateId: "golden-anniversary",
      tier: "SELF_SERVICE",
      status: "PAID",
      currency: "USD",
      amountTotal: 200,
      region: "americas",
      stripeSessionId: "sim_anniversary_demo",
      adminToken: "token_anniversary_demo",
      cardData: {
        create: {
          senderName: "Dev",
          recipientName: "Ananya",
          occasion: "anniversary",
          message:
            "Three wonderful years, and I still fall for you a little more every day. Thank you for building this beautiful dream of a life with me. Happy Anniversary!",
          photoUrl:
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
          photoShape: "oval",
          colorTheme: "champagne",
          location: "Marine Drive, Mumbai",
          language: "en",
        },
      },
    },
  });

  // 3. Phase 2: Memorial Tribute with Pre-Moderated Guestbook
  const memorialOrder = await prisma.order.upsert({
    where: { slug: "memorial-demo" },
    update: {},
    create: {
      slug: "memorial-demo",
      customerEmail: "kapoor.family@example.com",
      customerName: "Vikas Kapoor",
      productType: "PAGE",
      templateId: "in-loving-memory",
      tier: "CUSTOM",
      founderStatus: "COMPLETED",
      status: "PAID",
      currency: "INR",
      amountTotal: 100000,
      region: "asia_africa",
      stripeSessionId: "sim_memorial_demo",
      adminToken: "token_memorial_kapoor",
      customNotes: "Please make the tone extra gentle and serene with candlelight aesthetic.",
      pageData: {
        create: {
          senderName: "The Kapoor Family",
          recipientName: "Late Shri Ram Nath Kapoor",
          occasion: "memorial",
          letter:
            "In sacred memory of a grandfather, father, and mentor whose gentle wisdom and unconditional love shaped four generations. Your teachings live on in every heartbeat of our family.",
          photoUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80",
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
          ]),
          musicTrack:
            "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=cinematic-atmosphere-score-2-22136.mp3",
          musicType: "builtin",
          isProposal: false,
          colorTheme: "serene",
          requireGuestbookApproval: true,
          venueName: "Shanti Van, New Delhi",
          language: "en",
        },
      },
    },
    include: { pageData: true },
  });

  if (memorialOrder.pageData) {
    // Seed an approved condolence and a pending one
    await prisma.guestbookEntry.createMany({
      data: [
        {
          pageDataId: memorialOrder.pageData.id,
          authorName: "Sharma Family",
          message: "A truly noble soul who always greeted everyone with folded hands and a warm smile. Our deepest prayers and heartfelt condolences to the entire Kapoor family.",
          status: "APPROVED",
        },
        {
          pageDataId: memorialOrder.pageData.id,
          authorName: "Dr. Alok Verma",
          message: "Respected Bauji was a pillar of strength in our neighborhood. May his sacred soul attain eternal peace (Om Shanti).",
          status: "PENDING",
        },
      ],
    });
  }

  // 4. Phase 2: Emergency Rush Order Demo in Founder Queue
  await prisma.order.upsert({
    where: { slug: "rush-demo" },
    update: {},
    create: {
      slug: "rush-demo",
      customerEmail: "priority.buyer@example.com",
      customerName: "Vikram Singhania",
      productType: "PAGE",
      templateId: "festive-birthday",
      tier: "RUSH",
      status: "PAID",
      founderStatus: "QUEUED",
      currency: "USD",
      amountTotal: 10000,
      region: "americas",
      stripeSessionId: "sim_rush_demo",
      adminToken: "token_rush_vikram",
      customNotes: "URGENT: Today is my fiancée's 25th birthday! Need the balloon pop unboxing and our song 'Sunset Love' hand-timed by 8:00 PM tonight.",
      pageData: {
        create: {
          senderName: "Vikram",
          recipientName: "Natasha",
          occasion: "birthday",
          letter:
            "Happy 25th Birthday my love! To the woman who makes every second feel like pure magic. Get ready for an unforgettable year ahead!",
          photoUrls: JSON.stringify([
            "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
          ]),
          musicType: "builtin",
          isProposal: false,
          colorTheme: "festive",
          language: "en",
        },
      },
    },
  });

  // Ensure default rush_available setting exists
  await prisma.platformSetting.upsert({
    where: { key: "rush_available" },
    update: { value: "true" },
    create: { key: "rush_available", value: "true" },
  });

  console.log("Phase 2 database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
