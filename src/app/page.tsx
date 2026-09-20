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
  Layers,
  Crown,
  Smartphone,
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
              <span>Personalized Cards &amp; Mini-Websites for Life&apos;s Sacred Moments</span>
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

        {/* SERVICES & EXPERIENCES SHOWCASE */}
        <section id="services" className="py-16 sm:py-20 border-b border-neutral-900 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Our Services & Keepsakes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              Bespoke Digital Gifting Designed for Every Device
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2.5 leading-relaxed">
              From instant downloadable digital cards to interactive unboxing web-pages and sacred devotional invites, crafted for seamless viewing on phones, tablets, and desktops.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Service 1: Digital Keepsake Cards */}
            <div className="group rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/80 to-neutral-950 p-6 flex flex-col justify-between shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition duration-300">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-5 group-hover:scale-110 transition">
                  <Smartphone className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Instant Keepsake
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">
                  Digital Keepsake Cards
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  High-resolution digital cards with 4 portrait frame shapes, romantic typography, voice memos, and printable QR codes for physical gifting.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-emerald-400">From {pricing.symbol}{pricing.cardPrice}</span>
                <span className="text-[11px] text-neutral-500">Instant Download</span>
              </div>
            </div>

            {/* Service 2: Interactive Emotional Web-Pages */}
            <div className="group rounded-3xl border border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-neutral-900/90 to-neutral-950 p-6 flex flex-col justify-between shadow-xl hover:border-rose-500/70 hover:-translate-y-1 transition duration-300">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 mb-5 group-hover:scale-110 transition">
                  <Heart className="h-6 w-6 fill-rose-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Full Experience
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">
                  Interactive Unboxing Pages
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Dedicated emotional mini-websites with animated unboxing reveals, background audio soundtracks, voice notes, multi-photo collages, and guest replies.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-rose-400">From {pricing.symbol}{pricing.pagePrice}</span>
                <span className="text-[11px] text-neutral-500">Live URL & RSVP</span>
              </div>
            </div>

            {/* Service 3: Sacred Devotional Chowki & Invites */}
            <div className="group rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-neutral-900/90 to-neutral-950 p-6 flex flex-col justify-between shadow-xl hover:border-amber-500/60 hover:-translate-y-1 transition duration-300">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 mb-5 group-hover:scale-110 transition">
                  <Flame className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Devotional & Invites
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">
                  Devotional Chowki & Invites
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Religion-friendly Mata Ka Jagrata, Kirtan, and social invites with traditional Aarti music, auspicious Diya lighting, Google Maps pin, and event timing badges.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-amber-300">Cards & Pages</span>
                <span className="text-[11px] text-neutral-500">Venue Directions</span>
              </div>
            </div>

            {/* Service 4: Founder Handcrafted & Priority Rush */}
            <div className="group rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/80 to-neutral-950 p-6 flex flex-col justify-between shadow-xl hover:border-amber-500/50 hover:-translate-y-1 transition duration-300">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-5 group-hover:scale-110 transition">
                  <Crown className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Handcrafted & Rush
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">
                  Bespoke Founder Service
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Leave the design to our founder. Personal aesthetic curation, bespoke color harmonies, custom wording, and same-day priority dispatch within 12 hours.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300">
                <span className="font-semibold text-amber-400">From {pricing.symbol}{pricing.customPrice}</span>
                <span className="text-[11px] text-neutral-500">1-on-1 Review</span>
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES GALLERY */}
        <section id="templates" className="py-16 sm:py-20 mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section Header Block with clear vertical spacing */}
          <div className="max-w-2xl mb-8 space-y-2.5">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Occasion Collection
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Curated Occasions & Templates
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Select your occasion style, customize details & voice notes, and deliver unforgettable moments.
            </p>
          </div>

          {/* Dedicated Filter Controls Row (Responsive & Clearly Separated) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10 pb-5 border-b border-neutral-800/60">
            {/* Category tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/90 p-1.5 max-w-full">
              {[
                { id: "all", label: "All Occasions" },
                { id: "letters", label: "Letters & Notes (100% Free)" },
                { id: "devotional", label: "Devotional & Sacred" },
                { id: "couples", label: "Couples & Proposals" },
                { id: "birthdays", label: "Birthdays" },
                { id: "memorials", label: "Memorials" },
                { id: "invites", label: "Invites & Gatherings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === tab.id
                      ? "bg-rose-500 text-white shadow-sm font-semibold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Format Filter */}
            <div className="flex items-center space-x-1 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-1.5 shrink-0 self-start lg:self-auto">
              <button
                onClick={() => setFormatFilter("ALL")}
                className={`rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  formatFilter === "ALL"
                    ? "bg-neutral-700 text-white font-semibold"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFormatFilter("CARD")}
                className={`rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  formatFilter === "CARD"
                    ? "bg-neutral-700 text-white font-semibold"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setFormatFilter("PAGE")}
                className={`rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  formatFilter === "PAGE"
                    ? "bg-neutral-700 text-white font-semibold"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Pages
              </button>
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
                      {tmpl.isFreeCard ? (
                        <span className="rounded-lg bg-emerald-500/90 backdrop-blur-md border border-emerald-400/80 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          Card (100% FREE)
                        </span>
                      ) : (
                        hasCard && (
                          <span className="rounded-lg bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 px-2 py-0.5 text-[10px] font-medium text-neutral-200">
                            Card ({pricing.symbol}{pricing.cardPrice})
                          </span>
                        )
                      )}
                      {tmpl.hasAdOption ? (
                        <span className="rounded-lg bg-emerald-950/80 backdrop-blur-md border border-emerald-700/60 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                          Page (FREE w/ Ads)
                        </span>
                      ) : (
                        hasPage && (
                          <span className="rounded-lg bg-rose-950/80 backdrop-blur-md border border-rose-800/60 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                            Page ({pricing.symbol}{pricing.pagePrice})
                          </span>
                        )
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
                          <span>Interactive Dodging &quot;No&quot; Button</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Tier 1: Digital Card */}
            <div className="group relative rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-neutral-950 p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:border-emerald-500/50 hover:shadow-emerald-950/20 transition-all duration-300">
              <div>
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-4">
                  <span>Tier 1 • Instant</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Digital Card</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  High-res downloadable keepsake crafted for instant gifting and WhatsApp sharing.
                </p>

                <div className="mt-5 pb-5 border-b border-neutral-800/80">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-4xl font-bold tracking-tight text-white">
                      {pricing.symbol}{pricing.cardPrice}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">one-time</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
                    Zero wait time • Instant generation
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Instant PNG/JPG download</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400 shrink-0" />
                    <span>4 portrait frame shapes</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Printable physical QR Code</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Voice memo audio integration</span>
                  </li>
                </ul>
              </div>

              <a
                href="#templates"
                className="mt-8 block w-full text-center rounded-2xl bg-neutral-800/90 py-3 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-md"
              >
                Create Digital Card
              </a>
            </div>

            {/* Tier 2: Interactive Page (Most Popular) */}
            <div className="group relative rounded-3xl border-2 border-rose-500/60 bg-gradient-to-b from-rose-950/30 via-neutral-900/95 to-neutral-950 p-6 sm:p-7 flex flex-col justify-between shadow-2xl shadow-rose-950/50 hover:border-rose-400 lg:-translate-y-2 transition-all duration-300">
              {/* Floating Most Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg shadow-rose-500/40 flex items-center space-x-1.5 whitespace-nowrap">
                <Sparkles className="h-3 w-3" />
                <span>✨ Most Popular Keepsake</span>
              </div>

              <div>
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300 mb-4 mt-1">
                  <span>Tier 2 • Interactive Web</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Interactive Page</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Full emotional web experience with unboxing animations and custom audio soundtrack.
                </p>

                <div className="mt-5 pb-5 border-b border-rose-900/40">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-4xl font-bold tracking-tight text-white">
                      {pricing.symbol}{pricing.pagePrice}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">one-time</span>
                  </div>
                  <span className="text-[11px] text-rose-300 font-medium mt-1 block">
                    Bundle option: Add Card for only +{pricing.symbol}{pricing.bundleAddonPrice}
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400 shrink-0" />
                    <span>Unboxing opening reveals</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400 shrink-0" />
                    <span>Multi-photo montage collage (1-6)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400 shrink-0" />
                    <span>Background audio + voice memo</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400 shrink-0" />
                    <span>Interactive guestbook & RSVP wall</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-rose-400 shrink-0" />
                    <span>Timed reveal countdown locks</span>
                  </li>
                </ul>
              </div>

              <a
                href="#templates"
                className="mt-8 block w-full text-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Create Interactive Page
              </a>
            </div>

            {/* Tier 3: Custom Handcrafted */}
            <div className="group relative rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/25 via-neutral-900/90 to-neutral-950 p-6 sm:p-7 flex flex-col justify-between shadow-xl hover:border-amber-400 transition-all duration-300">
              <div>
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-4">
                  <Crown className="h-3 w-3 text-amber-400" />
                  <span>Tier 3 • Founder Curation</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Custom Tier</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Founder personal styling & layout curation delivered within 24-48 hours.
                </p>

                <div className="mt-5 pb-5 border-b border-amber-900/40">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-4xl font-bold tracking-tight text-amber-300">
                      {pricing.symbol}{pricing.customPrice}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">one-time</span>
                  </div>
                  <span className="text-[11px] text-amber-300/80 font-medium mt-1 block">
                    Cards: {pricing.symbol}{pricing.customCardPrice} • Pages: {pricing.symbol}{pricing.customPagePrice}
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-amber-400 shrink-0" />
                    <span>Founder personal touch & review</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-amber-400 shrink-0" />
                    <span>Bespoke color & layout tweaks</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-amber-400 shrink-0" />
                    <span>Custom special instructions honored</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-amber-400 shrink-0" />
                    <span>Direct proofing before live launch</span>
                  </li>
                </ul>
              </div>

              <a
                href="#templates"
                className="mt-8 block w-full text-center rounded-2xl bg-amber-500/20 border border-amber-500/50 py-3 text-xs font-bold text-amber-200 hover:bg-amber-500 hover:text-neutral-950 transition shadow-md"
              >
                Select Custom Tier
              </a>
            </div>

            {/* Tier 4: Emergency Priority Rush */}
            <div className="group relative rounded-3xl border border-red-500/60 bg-gradient-to-b from-red-950/30 via-neutral-900/90 to-neutral-950 p-6 sm:p-7 flex flex-col justify-between shadow-2xl shadow-red-950/40 hover:border-red-400 transition-all duration-300">
              <div className="absolute -top-3.5 right-6 rounded-full bg-red-600 px-3 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-md">
                ⚡ 12h Priority
              </div>

              <div>
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300 mb-4">
                  <span>Tier 4 • Emergency Rush</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Emergency Rush</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Same-day priority turnaround within 12 hours for urgent occasions.
                </p>

                <div className="mt-5 pb-5 border-b border-red-900/40">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-4xl font-bold tracking-tight text-red-400">
                      {pricing.symbol}{pricing.rushPrice}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">one-time</span>
                  </div>
                  <span className="text-[11px] text-red-300/80 font-medium mt-1 block">
                    Cards: {pricing.symbol}{pricing.rushCardPrice} • Pages: {pricing.symbol}{pricing.rushPagePrice}
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-red-400 shrink-0" />
                    <span>Founder top-of-queue priority</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-red-400 shrink-0" />
                    <span>Guaranteed same-day 12h dispatch</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-red-400 shrink-0" />
                    <span>Emergency direct support contact</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-red-400 shrink-0" />
                    <span>All custom tier benefits included</span>
                  </li>
                </ul>
              </div>

              <a
                href="#templates"
                className="mt-8 block w-full text-center rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Select Emergency Rush
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
