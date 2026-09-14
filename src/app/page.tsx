"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { TEMPLATES } from "@/lib/templates-data";
import { PRICING_TIERS } from "@/lib/currency";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import {
  Heart,
  Sparkles,
  ArrowRight,
  Music,
  Check,
  Zap,
  Clock,
  Mic,
  QrCode,
  ShieldCheck,
  Flame,
  PartyPopper,
} from "lucide-react";

export default function HomePage() {
  const { currency, region, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<"ALL" | "CARD" | "PAGE">("ALL");

  const pricing = PRICING_TIERS[region];

  // Filter templates
  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesFormat =
      formatFilter === "ALL" || template.supportedFormats.includes(formatFilter);
    return matchesCategory && matchesFormat;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-neutral-900">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-rose-600/20 via-amber-600/15 to-transparent blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 relative z-10">
            {/* Tagline Pill */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-300 backdrop-blur-md mb-6 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personalized Cards & Mini-Websites for Life's Sacred Moments</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
              Celebrate, Remember & Invite With Heartfelt Meaning
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-neutral-400 leading-relaxed">
              From romantic proposals and anniversaries to joyous birthdays, sacred memorials, baby showers, and jagrata invites. Handcrafted keepsakes with music, voice notes, and unboxing reveals.
            </p>

            {/* Price Highlight Banner */}
            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-2 text-xs backdrop-blur-xl">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-neutral-800/80 text-neutral-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Region: <strong>{pricing.regionLabel}</strong></span>
              </div>
              <div className="px-3 py-1.5 text-rose-300 font-semibold">
                Cards from {pricing.symbol}{pricing.cardPrice}
              </div>
              <span className="text-neutral-600">•</span>
              <div className="px-3 py-1.5 text-amber-300 font-semibold">
                Pages from {pricing.symbol}{pricing.pagePrice}
              </div>
              <span className="text-neutral-600">•</span>
              <div className="px-3 py-1.5 text-emerald-300 font-semibold">
                Custom from {pricing.symbol}{pricing.customPrice}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#templates"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition"
              >
                <span>Explore All Templates</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>

              <a
                href="#pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 px-6 py-3.5 text-sm font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
              >
                View All 4 Tiers
              </a>
            </div>
          </div>
        </section>

        {/* TEMPLATES GALLERY */}
        <section id="templates" className="py-16 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
                Occasion Collection
              </span>
              <h2 className="font-serif text-3xl font-bold text-white mt-1">
                Curated Occasions & Templates
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Select your occasion style, customize details & voice notes, and deliver unforgettable moments.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/80 p-1">
                {[
                  { id: "all", label: "All Occasions" },
                  { id: "couples", label: "Couples & Proposals" },
                  { id: "birthdays", label: "Birthdays" },
                  { id: "memorials", label: "Memorials" },
                  { id: "invites", label: "Invites & Chowki" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === tab.id
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
                    formatFilter === "ALL" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFormatFilter("CARD")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    formatFilter === "CARD" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setFormatFilter("PAGE")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    formatFilter === "PAGE" ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Pages
                </button>
              </div>
            </div>
          </div>

          {/* Grid of 10 Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((tmpl) => {
              const hasCard = tmpl.supportedFormats.includes("CARD");
              const hasPage = tmpl.supportedFormats.includes("PAGE");

              return (
                <div
                  key={tmpl.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-900/60 shadow-xl transition-all duration-300 hover:border-rose-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-800">
                    <img
                      src={tmpl.coverImage}
                      alt={tmpl.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                    {tmpl.badge && (
                      <div className="absolute top-3 left-3 rounded-full bg-rose-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-white shadow-md">
                        {tmpl.badge}
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
                      {hasCard && (
                        <span className="rounded-lg bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 px-2 py-0.5 text-[10px] font-medium text-neutral-200">
                          Card ({pricing.symbol}{pricing.cardPrice})
                        </span>
                      )}
                      {hasPage && (
                        <span className="rounded-lg bg-rose-950/80 backdrop-blur-md border border-rose-800/60 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                          Page ({pricing.symbol}{pricing.pagePrice})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-rose-200 transition">
                      {tmpl.name}
                    </h3>
                    <p className="mt-2 text-xs text-neutral-400 leading-relaxed flex-1">
                      {tmpl.subtitle}
                    </p>

                    <div className="my-4 space-y-1.5 border-t border-neutral-800/80 pt-4 text-[11px] text-neutral-300">
                      {tmpl.hasInteractiveDodging && (
                        <div className="flex items-center text-rose-300">
                          <Check className="mr-1.5 h-3.5 w-3.5 text-rose-400" />
                          <span>Interactive Dodging "No" Button</span>
                        </div>
                      )}
                      {tmpl.occasion === "memorial" && (
                        <div className="flex items-center text-emerald-300">
                          <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                          <span>Pre-Moderated Family Condolence Wall</span>
                        </div>
                      )}
                      {tmpl.venueRequired && (
                        <div className="flex items-center text-amber-300">
                          <Check className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                          <span>Venue Maps Directions & RSVP Enabled</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                        <span>Voice Note & Printable QR Code Support</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Link
                        href={`/create/${tmpl.id}`}
                        className="flex w-full items-center justify-center rounded-xl bg-neutral-800 px-4 py-3 text-xs font-semibold text-white transition hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/20"
                      >
                        <span>Customize This Template</span>
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PRICING TABLE: 4 TIERS */}
        <section id="pricing" className="py-20 border-t border-neutral-900 mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Fair Region-Based Pricing
            </span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">
              Choose The Perfect Tier For Your Moment
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              From automated instant keepsakes to founder handcrafted priority delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tier 1: Digital Card */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Tier 1 • Automated
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">Digital Card</h3>
                <p className="mt-2 text-xs text-neutral-400">High-res downloadable keepsake.</p>
                <div className="mt-4 flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-white">
                    {pricing.symbol}{pricing.cardPrice}
                  </span>
                  <span className="text-[11px] text-neutral-500">one-time</span>
                </div>
                <ul className="mt-6 space-y-2 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                    <span>Instant PNG/JPG download</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                    <span>5 photo frame shapes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-emerald-400" />
                    <span>Printable QR Code</span>
                  </li>
                </ul>
              </div>
              <a
                href="#templates"
                className="mt-8 block text-center rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-white hover:bg-neutral-700"
              >
                Create Card
              </a>
            </div>

            {/* Tier 2: Template Page */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  Tier 2 • Automated
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">Interactive Page</h3>
                <p className="mt-2 text-xs text-neutral-400">Full emotional web experience.</p>
                <div className="mt-4 flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-white">
                    {pricing.symbol}{pricing.pagePrice}
                  </span>
                  <span className="text-[11px] text-neutral-500">one-time</span>
                </div>
                <ul className="mt-6 space-y-2 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-rose-400" />
                    <span>Unboxing opening reveals</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-rose-400" />
                    <span>Multi-photo montage collage</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-rose-400" />
                    <span>Music + Voice Memo notes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-rose-400" />
                    <span>Guestbook reply wall</span>
                  </li>
                </ul>
              </div>
              <a
                href="#templates"
                className="mt-8 block text-center rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-white hover:bg-neutral-700"
              >
                Create Page
              </a>
            </div>

            {/* Tier 3: Custom Handcrafted */}
            <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-neutral-900/80 p-6 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  Tier 3 • Founder Styled
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">Custom Tier</h3>
                <p className="mt-2 text-xs text-neutral-400">Delivered within 24-48 hours.</p>
                <div className="mt-4 flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-amber-300">
                    {pricing.symbol}{pricing.customPrice}
                  </span>
                  <span className="text-[11px] text-neutral-500">one-time</span>
                </div>
                <ul className="mt-6 space-y-2 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-amber-400" />
                    <span>Founder personal touch & review</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-amber-400" />
                    <span>Bespoke color & layout tweaks</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-amber-400" />
                    <span>Special instructions included</span>
                  </li>
                </ul>
              </div>
              <a
                href="#templates"
                className="mt-8 block text-center rounded-xl bg-amber-600/30 border border-amber-500/50 py-2.5 text-xs font-semibold text-amber-200 hover:bg-amber-600 hover:text-white transition"
              >
                Select Custom
              </a>
            </div>

            {/* Tier 4: Emergency Rush */}
            <div className="relative rounded-3xl border border-red-500/50 bg-gradient-to-b from-red-950/40 to-neutral-900/90 p-6 flex flex-col justify-between shadow-2xl shadow-red-950/50">
              <div className="absolute -top-3 right-4 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                Priority
              </div>
              <div>
                <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">
                  Tier 4 • Rush
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">Emergency Rush</h3>
                <p className="mt-2 text-xs text-neutral-400">Same-Day Priority (within 12h).</p>
                <div className="mt-4 flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-red-400">
                    {pricing.symbol}{pricing.rushPrice}
                  </span>
                  <span className="text-[11px] text-neutral-500">one-time</span>
                </div>
                <ul className="mt-6 space-y-2 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-red-400" />
                    <span>Founder top-of-queue priority</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-red-400" />
                    <span>Same-day expedited delivery</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-3.5 w-3.5 text-red-400" />
                    <span>Emergency direct support</span>
                  </li>
                </ul>
              </div>
              <a
                href="#templates"
                className="mt-8 block text-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:scale-105 transition"
              >
                Select Rush
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
