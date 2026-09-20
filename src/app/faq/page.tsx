import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Frequently Asked Questions (FAQ) | Lovewrit",
  description: "Answers to common questions about Lovewrit cards, interactive pages, pricing, privacy, and printing.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "What is Lovewrit?",
      a: "Lovewrit lets you create personalized digital cards and interactive web pages for special moments — proposals, anniversaries, apologies, birthdays, memorials, devotional invitations, and more. Each one is delivered as a shareable link and a downloadable image (and, for some products, a printable PDF).",
    },
    {
      q: "What's the difference between a Digital Card and an Interactive Page?",
      a: "A Digital Card is a single, beautifully designed image with your photo, message, and chosen style — quick and simple. An Interactive Page is a richer mini-website experience that can include collages, music, voice messages, animations, and playful interactions, built around your chosen occasion.",
    },
    {
      q: "How much does it cost?",
      a: "Pricing depends on the product and your region, shown in your local currency at checkout. We offer a free tier (the \"Letter to a Dear One\" Digital Card is always free), instant Digital Cards and Interactive Pages at low prices, and Custom or Rush tiers if you'd like it personally handcrafted or delivered faster.",
    },
    {
      q: "Is anything actually free?",
      a: "Yes — the \"Letter to a Dear One\" Digital Card is completely free, with no ads and no hidden cost. The Interactive Page version of this product is also free to view, supported by ads, or you can pay a small fee to remove ads entirely.",
    },
    {
      q: "How fast will I get my card or page?",
      a: "Digital Cards and Interactive Pages on our standard tiers are generated instantly after payment. Custom (handcrafted) orders are typically delivered within 24-48 hours. Emergency Rush orders are prioritized and typically delivered same-day, within our stated operating hours — check the product page for current turnaround details.",
    },
    {
      q: "What languages are supported?",
      a: "English, Hindi, and Punjabi are currently supported, including on-screen keyboards for writing your message directly in Hindi or Punjabi script.",
    },
    {
      q: "Can I include religious or devotional content?",
      a: "Yes. We offer devotional and invitation templates across several faiths, including Hindu, Sikh, Muslim, and Christian occasions, as well as a secular option with no religious symbols for those who prefer it.",
    },
    {
      q: "What happens with the \"No\" button on proposal pages?",
      a: "On proposal-themed pages, the \"No\" button playfully moves out of reach so that it can't be directly clicked — it's meant as a lighthearted design feature. If you don't want to answer \"Yes,\" you're never obligated to — you can simply close the page at any time.",
    },
    {
      q: "Can I get a refund?",
      a: "Because each order is instant and personalized, we do not offer refunds once an order is placed. If something goes wrong technically and you never receive your finished card or page, please contact us and we'll make it right.",
    },
    {
      q: "Will my link be private?",
      a: "Your card or page is only accessible to people who have the link — it isn't searchable or listed publicly. Please only share the link with people you intend to see it. Some products also offer optional PIN protection for extra privacy.",
    },
    {
      q: "Can I print my card or page?",
      a: "Yes. Digital Cards and Pages can be downloaded as high-resolution images, and select products also offer a foldable, print-ready PDF version sized for standard greeting card printing.",
    },
    {
      q: "Is my payment information safe?",
      a: "Yes. Payments are processed securely by our third-party payment provider. We never see or store your full card details.",
    },
    {
      q: "How do I contact support?",
      a: "Email us any time at founder@lovewrit.com.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center text-xs text-neutral-400 hover:text-rose-400 transition mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="border-b border-neutral-800 pb-8 mb-8">
            <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 mb-4">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help & Answers</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400">
              Clear answers to common questions about Lovewrit cards, interactive pages, pricing, and printing.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-5 sm:p-6 backdrop-blur-sm space-y-2.5 transition hover:border-neutral-700"
              >
                <h2 className="font-serif text-base sm:text-lg font-bold text-white">
                  {faq.q}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-neutral-300">
                  {faq.a.includes("founder@lovewrit.com") ? (
                    <>
                      Email us any time at{" "}
                      <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline font-semibold">
                        founder@lovewrit.com
                      </a>
                      .
                    </>
                  ) : (
                    faq.a
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

