import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Memoir database with initial sample orders...");

  // 1. Sample Proposal Page
  await prisma.order.upsert({
    where: { slug: "proposal-demo" },
    update: {},
    create: {
      slug: "proposal-demo",
      customerEmail: "aarav@example.com",
      customerName: "Aarav Sharma",
      productType: "PAGE",
      templateId: "forever-proposal",
      status: "PAID",
      currency: "INR",
      amountTotal: 20000,
      region: "asia_africa",
      stripeSessionId: "sim_proposal_demo",
      pageData: {
        create: {
          senderName: "Aarav",
          recipientName: "Simran",
          occasion: "proposal",
          letter:
            "From the very first conversation over chai in Udaipur, I knew my search was over. Every single day with you is filled with light, laughter, and so much peace. I cannot picture my tomorrow without you. Will you make me the happiest person and marry me?",
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

  // 2. Sample Anniversary Digital Card
  await prisma.order.upsert({
    where: { slug: "anniversary-demo" },
    update: {},
    create: {
      slug: "anniversary-demo",
      customerEmail: "dev@example.com",
      customerName: "Dev Mehta",
      productType: "CARD",
      templateId: "golden-anniversary",
      status: "PAID",
      currency: "USD",
      amountTotal: 200,
      region: "americas",
      stripeSessionId: "sim_anniversary_demo",
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

  // 3. Sample Apology Card
  await prisma.order.upsert({
    where: { slug: "apology-demo" },
    update: {},
    create: {
      slug: "apology-demo",
      customerEmail: "kabir@example.com",
      customerName: "Kabir Singh",
      productType: "CARD",
      templateId: "from-my-heart",
      status: "PAID",
      currency: "GBP",
      amountTotal: 200,
      region: "uk",
      stripeSessionId: "sim_apology_demo",
      cardData: {
        create: {
          senderName: "Kabir",
          recipientName: "Meera",
          occasion: "sorry",
          message:
            "I hate seeing any sadness between us, especially when it was caused by my mistakes. You mean everything to me. I promise to listen better, love harder, and cherish you always. Please forgive me.",
          photoUrl:
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
          photoShape: "rounded",
          colorTheme: "sunset",
          location: "Our Favorite Coffee Shop",
          language: "en",
        },
      },
    },
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

