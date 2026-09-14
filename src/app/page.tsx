"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { TEMPLATES, TemplateDefinition, OccasionType } from "@/lib/templates-data";
import { PRICING_TIERS } from "@/lib/currency";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  Heart,
  Sparkles,
  ArrowRight,
  Music,
  Check,
  Download,
  Share2,
  Gift,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  const { currency, region, t } = useApp();
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<"ALL" | "CARD" | "PAGE">("ALL");

  const pricing = PRICING_TIERS[region];

  // Filter templates
  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesOccasion =
      selectedOccasion === "all" || template.occasion === selectedOccasion;
    const matchesFormat =
      formatFilter === "ALL" || template.supportedFormats.includes(formatFilter);
    return matchesOccasion && matchesFormat;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-neutral-900">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-rose-600/20 via-pink-600/15 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-72 h-72 bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 relative z-10">
            {/* Tagline Pill */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-300 backdrop-blur-md mb-6 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t.tagline}</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-neutral-400 leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* Price Highlight Banner */}
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-2 text-xs backdrop-blur-xl">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-neutral-800/80 text-neutral-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Detected Region: <strong>{pricing.regionLabel}</strong></span>
              </div>
              <div className="px-3 py-1.5 text-rose-300 font-semibold">
                Digital Cards from {pricing.symbol}{pricing.cardPrice}
              </div>
              <span className="text-neutral-600">•</span>
              <div className="px-3 py-1.5 text-amber-300 font-semibold">
                Interactive Pages from {pricing.symbol}{pricing.pagePrice}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#templates"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition"
              >
                <span>{t.exploreTemplates}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 px-6 py-3.5 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
              >
                {t.howItWorks}
              </a>
            </div>
          </div>
        </section>

        {/* TEMPLATE GALLERY SECTION */}
        <section id="templates" className="py-16 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
                Couples Collection
              </span>
              <h2 className="font-serif text-3xl font-bold text-white mt-1">
                Choose Your Template
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Select a style, customize your message & photos, and get instant delivery.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Occasion tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/80 p-1">
                {[
                  { id: "all", label: t.filterAll },
                  { id: "proposal", label: t.filterProposal },
                  { id: "anniversary", label: t.filterAnniversary },
                  { id: "sorry", label: t.filterSorry },
                  { id: "reminiscing", label: t.filterReminiscing },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedOccasion(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                      selectedOccasion === tab.id
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Format Filter */}
              <div className="flex items-center space-x-1 rounded-xl border border-neutral-800 bg-neutral-900/80 p-1">
                <button
                  onClick={() => setFormatFilter("ALL")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    formatFilter === "ALL"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFormatFilter("CARD")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    formatFilter === "CARD"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setFormatFilter("PAGE")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    formatFilter === "PAGE"
                      ? "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Pages
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((tmpl) => {
              const hasCard = tmpl.supportedFormats.includes("CARD");
              const hasPage = tmpl.supportedFormats.includes("PAGE");

              return (
                <div
                  key={tmpl.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-900/60 shadow-xl transition-all duration-300 hover:border-rose-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10"
                >
                  {/* Thumbnail / Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-800">
                    <img
                      src={tmpl.coverImage}
                      alt={tmpl.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                    {/* Badge */}
                    {tmpl.badge && (
                      <div className="absolute top-3 left-3 rounded-full bg-rose-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-white shadow-md">
                        {tmpl.badge}
                      </div>
                    )}

                    {/* Formats pill */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
                      {hasCard && (
                        <span className="rounded-lg bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 px-2 py-0.5 text-[10px] font-medium text-neutral-200">
                          Digital Card ({pricing.symbol}{pricing.cardPrice})
                        </span>
                      )}
                      {hasPage && (
                        <span className="rounded-lg bg-rose-950/80 backdrop-blur-md border border-rose-800/60 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                          Interactive Page ({pricing.symbol}{pricing.pagePrice})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-rose-200 transition">
                      {tmpl.name}
                    </h3>
                    <p className="mt-2 text-xs text-neutral-400 leading-relaxed flex-1">
                      {tmpl.subtitle}
                    </p>

                    {/* Features List */}
                    <div className="my-4 space-y-1.5 border-t border-neutral-800/80 pt-4 text-[11px] text-neutral-300">
                      {tmpl.hasInteractiveDodging && (
                        <div className="flex items-center text-rose-300">
                          <Check className="mr-1.5 h-3.5 w-3.5 text-rose-400" />
                          <span>Interactive Dodging "No" Button</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                        <span>
                          {tmpl.revealType === "velvet_box"
                            ? "Velvet Box & Petals Opening"
                            : tmpl.revealType === "champagne_seal"
                            ? "Gold Foil Seal Opening"
                            : tmpl.revealType === "wax_heart"
                            ? "Candlelit Wax Heart Reveal"
                            : "Vintage Ribbon Untie Reveal"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                        <span>Curated Music or Custom Song Upload</span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-2">
                      <Link
                        href={`/create/${tmpl.id}`}
                        className="flex w-full items-center justify-center rounded-xl bg-neutral-800 px-4 py-3 text-xs font-semibold text-white transition hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/20"
                      >
                        <span>{t.useTemplate}</span>
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 border-t border-neutral-900 bg-neutral-900/40">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Simple 3-Step Process
            </span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">
              How Memoir Works
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-md mx-auto">
              Zero coding or design skills required. Create and deliver your moment in 2 minutes.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Pick Format & Template
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Choose a high-res Digital Card or an interactive Template Page. Select from our couples-focused romantic themes.
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Personalize & Add Music
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Fill in your names, write your heartfelt words, upload photos, choose shapes, and pick a romantic soundtrack (or upload your song).
                </p>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Instant Link & Download
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Pay securely with fair regional pricing. Instantly get a unique shareable link (`/p/xyz`) and high-res image download.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TABLE SECTION */}
        <section id="pricing" className="py-20 border-t border-neutral-900 mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Transparent & Accessible
            </span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">
              Fair Region-Based Pricing
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Prices automatically adapt to your geographic region with multi-currency checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Digital Card Tier */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Tier 1
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  Digital Card
                </h3>
                <p className="mt-2 text-xs text-neutral-400">
                  Ideal for quick, beautiful keepsakes and social sharing.
                </p>

                <div className="mt-6 flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-white">
                    {pricing.symbol}{pricing.cardPrice}
                  </span>
                  <span className="text-xs text-neutral-500">one-time payment</span>
                </div>

                <ul className="mt-6 space-y-2 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400" />
                    <span>Selectable photo shapes (oval, square, rounded, heart, circle)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400" />
                    <span>Curated romantic color palettes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400" />
                    <span>Instant high-res PNG/JPG download</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400" />
                    <span>Permanent shareable link</span>
                  </li>
                </ul>
              </div>

              <a
                href="#templates"
                className="mt-8 block text-center rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-xs font-semibold text-white hover:bg-neutral-700 transition"
              >
                Create a Card
              </a>
            </div>

            {/* Interactive Page Tier */}
            <div className="relative rounded-3xl border border-rose-500/50 bg-gradient-to-b from-rose-950/40 to-neutral-900/80 p-8 flex flex-col justify-between shadow-2xl shadow-rose-950/50">
              <div className="absolute -top-3 right-6 rounded-full bg-rose-500 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Full Experience
              </div>

              <div>
                <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  Tier 2
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  Interactive Page
                </h3>
                <p className="mt-2 text-xs text-neutral-400">
                  Full emotional experience with music, unboxing reveal & collage.
                </p>

                <div className="mt-6 flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-white">
                    {pricing.symbol}{pricing.pagePrice}
                  </span>
                  <span className="text-xs text-neutral-500">one-time payment</span>
                </div>

                <ul className="mt-6 space-y-2 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400" />
                    <span>Interactive opening moment (wax seal / velvet box reveal)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400" />
                    <span>Multi-photo montage collage</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400" />
                    <span>Background music (built-in tracks or upload your song)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400" />
                    <span>Proposal playful dodging "No" button interaction</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400" />
                    <span>Confetti celebration & high-res keepsake download</span>
                  </li>
                </ul>
              </div>

              <a
                href="#templates"
                className="mt-8 block text-center rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition"
              >
                Create an Interactive Page
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
