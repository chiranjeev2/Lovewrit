"use client";

import React, { useState, useRef } from "react";
import { COLOR_THEMES, ColorThemeKey, ProposalQuestionKey, PROPOSAL_QUESTIONS } from "@/lib/templates-data";
import {
  Heart,
  Sparkles,
  Music,
  MapPin,
  CheckCircle,
  Navigation,
  X,
  Maximize2,
  Film,
  Camera,
  Calendar,
  Clock,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
import VoiceMessagePlayer from "@/components/interactive/VoiceMessagePlayer";
import AdBanner from "@/components/shared/AdBanner";

export type CollageLayoutStyle = "masonry" | "timeline" | "filmstrip";

interface PagePreviewProps {
  senderName: string;
  recipientName: string;
  occasion: string;
  letter: string;
  photoUrls: string[];
  colorTheme: ColorThemeKey;
  collageLayout?: CollageLayoutStyle;
  isProposal?: boolean;
  proposalQuestion?: ProposalQuestionKey;
  musicTrackName?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  eventDate?: string;
  eventTime?: string;
  voiceMessageUrl?: string | null;
  previewOnly?: boolean;
  showOmMotif?: boolean;
  showBismillah?: boolean;
  isAdSupported?: boolean;
}

export default function PagePreview({
  senderName,
  recipientName,
  occasion,
  letter,
  photoUrls = [],
  colorTheme,
  collageLayout = "masonry",
  isProposal = false,
  proposalQuestion = "marry_me",
  musicTrackName,
  venueName,
  venueAddress,
  venueMapUrl,
  eventDate,
  eventTime,
  voiceMessageUrl,
  previewOnly = false,
  showOmMotif = false,
  showBismillah = false,
  isAdSupported = false,
}: PagePreviewProps) {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.rose;
  const proposalConfig = PROPOSAL_QUESTIONS[proposalQuestion] || PROPOSAL_QUESTIONS.marry_me;

  // Proposal interaction states
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDodged, setIsDodged] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [loveCount, setLoveCount] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dodging "No" button logic
  const dodgeNoButton = () => {
    if (previewOnly) return;
    const maxX = 120;
    const maxY = 60;
    const randomX = (Math.random() - 0.5) * 2 * maxX;
    const randomY = (Math.random() - 0.5) * 2 * maxY;

    setNoButtonPos({ x: randomX, y: randomY });
    setIsDodged(true);
  };

  const handleYes = () => {
    setAccepted(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#f43f5e", "#ec4899", "#ffd700", "#ffffff"],
      });
    }, 400);
  };

  const handleSendLove = () => {
    setLoveCount((c) => c + 1);
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.8 },
      colors: ["#f43f5e", "#ec4899", "#ffd700", "#fda4af"],
      shapes: ["circle"],
    });
  };

  const isMemorial = occasion === "memorial";
  const isBirthday = occasion === "birthday";
  const isInvite = ["godhbharai", "jagrata_kirtan", "kitty_party"].includes(occasion);

  const photos =
    photoUrls.length > 0
      ? photoUrls
      : [
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
          "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
        ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-[32px] border ${theme.borderStyle} bg-gradient-to-b ${theme.bgGradient} p-6 sm:p-12 text-white shadow-2xl transition-all duration-300`}
    >
      {/* Background ambient orbs */}
      <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-300">
              A Lovewrit Experience
            </span>
            <h4 className="font-serif text-sm font-bold text-white capitalize">
              {occasion.replace("_", " ")}
            </h4>
          </div>
        </div>

        {musicTrackName && (
          <div className="mt-3 sm:mt-0 flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs backdrop-blur-md">
            <Music className="h-3.5 w-3.5 text-rose-400 animate-spin" />
            <span className="text-[11px] text-neutral-300 truncate max-w-[150px]">
              {musicTrackName}
            </span>
          </div>
        )}
      </div>

      {/* Hero Headline */}
      <div className="relative z-10 my-10 text-center">
        <span className="inline-block rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-rose-300 mb-3">
          {isMemorial ? "In Blessed Remembrance" : `To ${recipientName || "Honored One"}`}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          {isMemorial
            ? "A Life Beautifully Remembered"
            : isBirthday
            ? "Wishing You The Happiest Birthday!"
            : isInvite
            ? "Cordially Invited To Celebrate"
            : "Every Moment With You Is A Gift"}
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-neutral-300">
          {isMemorial
            ? `Cherished forever by ${senderName || "Family & Friends"}`
            : `Presented with love by ${senderName || "Always"}`}
        </p>
      </div>

      {/* Venue & Maps Card (for Event Invites) */}
      {(venueName || venueAddress) && (
        <div className="relative z-10 mx-auto max-w-xl rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-xl my-6 text-center">
          <div className="flex items-center justify-center space-x-1.5 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <MapPin className="h-4 w-4" />
            <span>Event Venue Details</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white">{venueName}</h3>
          {venueAddress && <p className="text-xs text-neutral-300 mt-1">{venueAddress}</p>}
          {venueMapUrl && (
            <div className="mt-3">
              <a
                href={venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-3.5 py-1.5 text-xs text-amber-200 hover:bg-amber-500/30 transition"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Get Driving Directions</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Voice Message Player (if recorded) */}
      {voiceMessageUrl && (
        <div className="relative z-10 my-6">
          <VoiceMessagePlayer audioUrl={voiceMessageUrl} senderName={senderName} />
        </div>
      )}

      {/* Photo Montage Collage with 3 Distinct Layout Styles */}
      <div className="relative z-10 my-10">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center space-x-2 text-rose-300">
            <Camera className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {collageLayout === "timeline"
                ? "Our Story & Memory Lane"
                : collageLayout === "filmstrip"
                ? "Cinematic Memories Filmstrip"
                : "Cherished Moments Montage"}
            </span>
          </div>
          <span className="text-[10px] text-neutral-400">
            Click any photo to zoom in
          </span>
        </div>

        {/* 1. MASONRY / POLAROID LAYOUT */}
        {collageLayout === "masonry" && (
          <div
            className={`grid gap-5 ${
              photos.length === 1
                ? "grid-cols-1 max-w-md mx-auto"
                : photos.length === 2
                ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto"
            }`}
          >
            {photos.slice(0, 6).map((img, i) => {
              const rotation = i % 3 === 0 ? "-rotate-1" : i % 3 === 1 ? "rotate-2" : "-rotate-2";
              return (
                <div
                  key={i}
                  onClick={() => setLightboxImage(img)}
                  className={`group relative cursor-pointer overflow-hidden rounded-3xl border ${theme.borderStyle} bg-neutral-900/80 p-2 shadow-2xl transition duration-300 hover:scale-[1.03] hover:z-20 ${rotation} hover:rotate-0`}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-950">
                    <img
                      src={img}
                      alt={`Moment ${i + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-3.5">
                      <span className="text-xs font-medium text-white">
                        Memory #{i + 1}
                      </span>
                      <Maximize2 className="h-3.5 w-3.5 text-white/80" />
                    </div>
                  </div>
                  <div className="pt-2.5 pb-1 px-2 text-center">
                    <span className="font-serif text-xs text-neutral-300 italic">
                      {["Pure joy together", "Unforgettable day", "Holding you close", "Our favorite memory", "Forever by your side", "Every laugh shared"][i % 6]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. TIMELINE / MEMORY LANE LAYOUT */}
        {collageLayout === "timeline" && (
          <div className="relative max-w-2xl mx-auto py-4">
            {/* Central glowing vertical timeline spine */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-rose-500/20 via-rose-500/60 to-rose-500/20" />

            <div className="space-y-10">
              {photos.slice(0, 6).map((img, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`relative flex items-center ${
                      isEven ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    {/* Timeline Node center dot */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/50 z-10 border-2 border-neutral-950 text-[10px] font-bold">
                      {i + 1}
                    </div>

                    {/* Content Card (takes half width) */}
                    <div className={`w-1/2 ${isEven ? "pr-8 text-right" : "pl-8 text-left"}`}>
                      <div
                        onClick={() => setLightboxImage(img)}
                        className={`group cursor-pointer inline-block rounded-2xl border ${theme.borderStyle} bg-neutral-900/90 p-2.5 shadow-xl transition duration-300 hover:scale-105`}
                      >
                        <div className="relative aspect-video w-48 sm:w-60 overflow-hidden rounded-xl bg-neutral-950">
                          <img
                            src={img}
                            alt={`Chapter ${i + 1}`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Maximize2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] font-semibold text-rose-300">
                          Chapter {i + 1}: {["First Spark", "Golden Hours", "Sweet Adventures", "Overcoming Together", "Endless Smiles", "Always & Forever"][i % 6]}
                        </div>
                      </div>
                    </div>

                    {/* Empty placeholder for alignment */}
                    <div className="w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. FILMSTRIP VINTAGE LAYOUT */}
        {collageLayout === "filmstrip" && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-4 sm:p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center space-x-2 text-neutral-400 text-[11px] font-mono mb-3">
              <Film className="h-4 w-4 text-rose-400" />
              <span>35MM MEMORY REEL • KODAK PORTRA VIBE</span>
            </div>

            {/* Sprocket holes top */}
            <div className="flex justify-between space-x-2 py-1 mb-2 border-b border-neutral-800/80 overflow-x-hidden">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div key={idx} className="h-3 w-4 rounded-sm bg-neutral-800 shrink-0" />
              ))}
            </div>

            {/* Film Frames Reel */}
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin">
              {photos.slice(0, 6).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxImage(img)}
                  className="group relative shrink-0 cursor-pointer rounded-xl border border-neutral-800 bg-neutral-900 p-2 shadow-xl transition duration-300 hover:scale-105 hover:border-rose-500/50"
                >
                  <div className="relative h-48 w-48 sm:h-56 sm:w-56 overflow-hidden rounded-lg bg-black">
                    <img
                      src={img}
                      alt={`Film Frame ${i + 1}`}
                      className="h-full w-full object-cover sepia-[0.15] contrast-105 transition duration-500 group-hover:scale-105 group-hover:sepia-0"
                    />
                    <div className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-neutral-300">
                      EXP 0{i + 1}A
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
                    <span>FRAME #{i + 1}</span>
                    <span className="text-rose-400/80">35MM</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sprocket holes bottom */}
            <div className="flex justify-between space-x-2 py-1 mt-2 border-t border-neutral-800/80 overflow-x-hidden">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div key={idx} className="h-3 w-4 rounded-sm bg-neutral-800 shrink-0" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-white backdrop-blur hover:bg-neutral-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Zoomed Moment"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain mx-auto"
            />
            <div className="p-3 text-center">
              <span className="font-serif text-xs text-neutral-300">
                A moment frozen in time • Lovewrit Keepsake
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Heartfelt Message / Letter Section */}
      <div className="relative z-10 mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-xl shadow-2xl my-10">
        <div className="flex items-center space-x-2 text-rose-300 mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">
            {isMemorial ? "Eulogy & Remembrance" : isInvite ? "Event Note" : "Heartfelt Words"}
          </span>
        </div>
        <p className="font-serif text-sm sm:text-base leading-relaxed text-neutral-100 whitespace-pre-wrap">
          {letter || "A timeless message crafted with all my heart."}
        </p>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>{isMemorial ? "Forever In Our Hearts," : "Warmest Regards,"}</span>
          <span className="font-serif italic font-semibold text-white">
            {senderName || "Always"}
          </span>
        </div>
      </div>

      {/* Free Ad-Supported Reading Banner */}
      {isAdSupported && (
        <div className="relative z-10 mx-auto max-w-2xl px-4">
          <AdBanner />
        </div>
      )}

      {/* Event Details, Date, Time & Venue Section */}
      {(venueName || venueAddress || eventDate || eventTime) && (
        <div className="relative z-10 mx-auto max-w-2xl rounded-3xl border border-white/15 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl my-8 text-center space-y-4">
          {occasion === "jagrata_kirtan" && (
            <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>{showOmMotif ? "ॐ 🚩 JAI MATA DI • SADAR NIMANTRAN 🚩 ॐ" : "🚩 JAI MATA DI • SADAR NIMANTRAN 🚩"}</span>
            </div>
          )}
          {(occasion === "akhand_path" || occasion === "gurpurab") && (
            <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300">
              <span className="text-sm font-bold">ੴ</span>
              <span>SATNAM WAHEGURU • SADAR NIMANTRAN</span>
            </div>
          )}
          {(occasion === "aqeeqah" || occasion === "nikah" || occasion === "iftar") && (
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <span className="text-sm">🌙</span>
              <span>{showBismillah ? "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" : "SACRED BLESSING INVITE"}</span>
            </div>
          )}
          {(occasion === "christening" || occasion === "wedding_blessing") && (
            <div className="inline-flex items-center space-x-2 rounded-full border border-sky-500/40 bg-sky-500/15 px-3.5 py-1 text-xs font-bold text-sky-300">
              <span className="text-sm">🕊️</span>
              <span>IN GOD'S GRACE • CELEBRATION & BLESSING ✝</span>
            </div>
          )}
          {occasion === "blessing_ceremony" && (
            <div className="inline-flex items-center space-x-2 rounded-full border border-stone-500/40 bg-stone-500/15 px-3.5 py-1 text-xs font-bold text-stone-300">
              <span className="text-sm">🌿</span>
              <span>CELEBRATION OF BLESSINGS</span>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/90 block">
              {occasion === "jagrata_kirtan" || occasion === "akhand_path" || occasion === "gurpurab"
                ? "Shubh Karyakram & Sthal"
                : "Event Schedule & Venue"}
            </span>
            {venueName && (
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {venueName}
              </h3>
            )}
          </div>

          {/* Date & Time Ribbon */}
          {(eventDate || eventTime) && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {eventDate && (
                <div className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-amber-200">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span>{eventDate}</span>
                </div>
              )}
              {eventTime && (
                <div className="flex items-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-amber-200">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span>{eventTime}</span>
                </div>
              )}
            </div>
          )}

          {/* Address */}
          {venueAddress && (
            <div className="flex items-center justify-center space-x-1.5 text-xs text-neutral-300">
              <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span>{venueAddress}</span>
            </div>
          )}

          {/* Map Link */}
          {venueMapUrl && (
            <div className="pt-2">
              <a
                href={venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rounded-full border border-rose-500/40 bg-rose-500/20 px-5 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500 hover:text-white transition shadow-lg shadow-rose-500/20"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Get Directions via Google Maps</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Interactive Love Tap Counter */}
      <div className="relative z-10 my-6 text-center">
        <button
          type="button"
          onClick={handleSendLove}
          className="group inline-flex items-center space-x-2.5 rounded-full border border-rose-500/40 bg-neutral-900/90 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-rose-500/25 backdrop-blur-xl hover:scale-105 active:scale-95 transition"
        >
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500 group-hover:scale-125 transition duration-200" />
          <span>Tap to Send Love to {recipientName || "Beloved"}</span>
          {loveCount > 0 && (
            <span className="rounded-full bg-rose-500/25 border border-rose-500/40 px-2.5 py-0.5 text-[11px] text-rose-300 font-mono font-bold animate-in zoom-in-50 duration-150">
              +{loveCount} ❤️
            </span>
          )}
        </button>
      </div>

      {/* Proposal Interactive "Dodging No" Section */}
      {isProposal && (
        <div className="relative z-10 mx-auto max-w-lg rounded-3xl border border-rose-500/40 bg-neutral-900/90 p-8 text-center backdrop-blur-2xl shadow-2xl my-8">
          {!accepted ? (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                <Heart className="h-8 w-8 fill-rose-500" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
                {proposalConfig.question}
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                {proposalConfig.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 min-h-[90px]">
                <button
                  onClick={handleYes}
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition"
                >
                  {proposalConfig.yesText}
                </button>

                <div
                  style={{
                    transform: isDodged
                      ? `translate(${noButtonPos.x}px, ${noButtonPos.y}px)`
                      : "none",
                    transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  onMouseEnter={dodgeNoButton}
                  onTouchStart={dodgeNoButton}
                >
                  <button
                    onClick={dodgeNoButton}
                    className="w-full sm:w-auto rounded-full border border-neutral-700 bg-neutral-800/80 px-6 py-3.5 text-xs font-semibold text-neutral-400 hover:text-white"
                  >
                    {proposalConfig.noText}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4 animate-in fade-in zoom-in duration-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xl shadow-rose-500/40">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-white">
                {proposalConfig.celebrateHeading}
              </h3>
              <p className="text-sm text-rose-200 max-w-sm mx-auto">
                {proposalConfig.celebrateSub}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer watermark */}
      <div className="relative z-10 mt-12 text-center text-xs text-neutral-400">
        <p>Lovewrit • Personal Occasion Moments</p>
      </div>
    </div>
  );
}
