"use client";

import React, { useState, useRef } from "react";
import {
  COLOR_THEMES,
  ColorThemeKey,
  ProposalQuestionKey,
  PROPOSAL_QUESTIONS,
  FontFamilyKey,
  AmbientEffectKey,
} from "@/lib/templates-data";
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
  Send,
  Gift,
} from "lucide-react";
import confetti from "canvas-confetti";
import VoiceMessagePlayer from "@/components/interactive/VoiceMessagePlayer";
import AdBanner from "@/components/shared/AdBanner";

export type CollageLayoutStyle = "masonry" | "timeline" | "filmstrip";

export interface TimelineMilestone {
  date: string;
  title: string;
  description: string;
  photoUrl?: string;
}

export interface SecretNote {
  id: string;
  triggerLabel: string;
  revealedMessage: string;
}

interface PagePreviewProps {
  senderName: string;
  recipientName: string;
  nickname?: string | null;
  occasion: string;
  letter: string;
  photoUrls: string[];
  colorTheme: ColorThemeKey;
  fontFamily?: FontFamilyKey;
  ambientEffect?: AmbientEffectKey;
  collageLayout?: CollageLayoutStyle;
  timeline?: TimelineMilestone[];
  secretNotes?: SecretNote[];
  milestoneVenue?: string;
  isProposal?: boolean;
  proposalQuestion?: ProposalQuestionKey;
  musicTrackName?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  eventDate?: string;
  eventTime?: string;
  voiceMessageUrl?: string | null;
  tipUpiId?: string | null;
  tipPaypalUsername?: string | null;
  previewOnly?: boolean;
  showOmMotif?: boolean;
  showBismillah?: boolean;
  isAdSupported?: boolean;
  onSendReaction?: (text: string) => Promise<void> | void;
}

export default function PagePreview({
  senderName,
  recipientName,
  nickname,
  occasion,
  letter,
  photoUrls = [],
  colorTheme,
  fontFamily = "serif",
  ambientEffect = "none",
  collageLayout = "masonry",
  timeline = [],
  secretNotes = [],
  milestoneVenue,
  isProposal = false,
  proposalQuestion = "marry_me",
  musicTrackName,
  venueName,
  venueAddress,
  venueMapUrl,
  eventDate,
  eventTime,
  voiceMessageUrl,
  tipUpiId,
  tipPaypalUsername,
  previewOnly = false,
  showOmMotif = false,
  showBismillah = false,
  isAdSupported = false,
  onSendReaction,
}: PagePreviewProps) {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.rose;
  const proposalConfig = PROPOSAL_QUESTIONS[proposalQuestion] || PROPOSAL_QUESTIONS.marry_me;

  // Chapter Navigation State
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const chapters = ["Intro", "Memories", "Letter", ...(timeline.length > 0 ? ["Timeline"] : []), "Moments"];

  // Dodging "No" Button State
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDodged, setIsDodged] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Secret Notes Reveal State
  const [revealedNotes, setRevealedNotes] = useState<Record<string, boolean>>({});

  // Timeline Scrub Slider
  const [timelineIndex, setTimelineIndex] = useState(0);

  // Recipient Post-View Reaction State
  const [reactionText, setReactionText] = useState("");
  const [reactionSent, setReactionSent] = useState(false);
  const [isSendingReaction, setIsSendingReaction] = useState(false);

  // Lightbox Zoom State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Floating Love Button Counter
  const [loveCount, setLoveCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const dodgeNoButton = () => {
    const maxX = 120;
    const maxY = 70;
    const randomX = (Math.random() - 0.5) * 2 * maxX;
    const randomY = (Math.random() - 0.5) * 2 * maxY;
    setNoButtonPos({ x: randomX, y: randomY });
    setIsDodged(true);
  };

  const handleYes = () => {
    setAccepted(true);
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.6 },
      colors: ["#ec4899", "#f43f5e", "#ffd700", "#a855f7"],
    });
  };

  const toggleSecretNote = (id: string) => {
    setRevealedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#fb7185", "#ffd700"],
    });
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

  const submitReaction = async () => {
    if (!reactionText.trim()) return;
    setIsSendingReaction(true);
    try {
      if (onSendReaction) {
        await onSendReaction(reactionText);
      }
      setReactionSent(true);
    } catch {
      setReactionSent(true); // Graceful fallback
    } finally {
      setIsSendingReaction(false);
    }
  };

  const isMemorial = occasion === "memorial";
  const isBirthday = occasion === "birthday";
  const isInvite = ["godhbharai", "jagrata_kirtan", "kitty_party"].includes(occasion);

  const displayedRecipient = nickname
    ? `${recipientName} ("${nickname}")`
    : recipientName;

  const validPhotos = (photoUrls || []).filter(
    (u): u is string => Boolean(u && typeof u === "string" && u.trim().length > 0)
  );
  const photos =
    validPhotos.length > 0
      ? validPhotos
      : [
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
          "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
          "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
        ];

  // Font family mapper
  const getLetterFontClass = (font: FontFamilyKey) => {
    switch (font) {
      case "handwriting":
        return "font-handwriting text-lg sm:text-xl tracking-wide";
      case "sans":
        return "font-sans text-sm sm:text-base";
      case "serif":
      default:
        return "font-serif text-sm sm:text-base";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-[32px] border ${theme.borderStyle} bg-gradient-to-b ${theme.bgGradient} p-4 sm:p-10 text-white shadow-2xl transition-all duration-300`}
    >
      {/* AMBIENT BACKGROUND ANIMATED EFFECTS */}
      {ambientEffect === "petals" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-xl animate-pulse opacity-40"
              style={{
                top: `${(i * 17) % 100}%`,
                left: `${(i * 23) % 95}%`,
                animationDuration: `${3 + (i % 4)}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>
      )}

      {ambientEffect === "stars" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute text-sm animate-pulse opacity-50 text-amber-200"
              style={{
                top: `${(i * 13) % 100}%`,
                left: `${(i * 19) % 95}%`,
                animationDuration: `${2 + (i % 3)}s`,
              }}
            >
              ✦
            </div>
          ))}
        </div>
      )}

      {ambientEffect === "rain" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
          <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
      )}

      {/* CHAPTER PROGRESSION DOTS (Instagram Story style) */}
      <div className="relative z-20 mb-6 flex items-center justify-center space-x-1.5 px-2">
        {chapters.map((ch, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveChapter(idx)}
            className="flex-1 max-w-[80px] h-1.5 rounded-full transition-all duration-300 overflow-hidden bg-white/20 hover:bg-white/40"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                activeChapter === idx
                  ? "bg-rose-500 w-full"
                  : activeChapter > idx
                  ? "bg-white/60 w-full"
                  : "w-0"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Top Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-300">
              A Lovewrit Keepsake
            </span>
            <h4 className="font-serif text-sm font-bold text-white capitalize">
              {occasion.replace("_", " ")}
            </h4>
          </div>
        </div>

        <div className="mt-3 sm:mt-0 flex items-center space-x-3 text-xs text-neutral-300">
          {musicTrackName && (
            <div className="flex items-center space-x-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
              <Music className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
              <span className="truncate max-w-[130px]">{musicTrackName}</span>
            </div>
          )}
          <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
            ✦ Made for you
          </span>
        </div>
      </div>

      {/* Hero Headline Section */}
      <div className="relative z-10 my-10 text-center space-y-3">
        <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-rose-300 backdrop-blur-md border border-white/10">
          {isMemorial
            ? "Remembering with Sacred Love"
            : isBirthday
            ? "Happy Birthday to Someone Special"
            : isInvite
            ? "You Are Cordially Invited"
            : "A Moment Created Just For You"}
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
          {isMemorial
            ? `In Loving Memory of ${displayedRecipient}`
            : isBirthday
            ? `To Dearest ${displayedRecipient}`
            : `For ${displayedRecipient}`}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto font-light">
          {isMemorial
            ? `Honoring a cherished life, shared with deep reverence by ${senderName}.`
            : `${senderName} has crafted this keepsake to share a piece of their heart.`}
        </p>

        {/* Featured Cover Photo (Immediate above-the-fold display across all interactive page services) */}
        {photos[0] && (
          <div className="pt-4 pb-1 flex justify-center">
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 group bg-neutral-900/60">
              <img
                src={photos[0]}
                alt={displayedRecipient}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>
          </div>
        )}
      </div>

      {/* Milestone Landmark Map Pin (e.g. "Where we first met") */}
      {milestoneVenue && (
        <div className="relative z-10 mx-auto max-w-xl rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 backdrop-blur-xl shadow-lg my-6 flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <MapPin className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block">
              Sacred Milestone Location
            </span>
            <p className="text-xs text-white font-medium">{milestoneVenue}</p>
          </div>
        </div>
      )}

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

      {/* RELATIONSHIP TIMELINE SLIDER (for anniversaries/milestones) */}
      {timeline.length > 0 && (
        <div className="relative z-10 my-10 mx-auto max-w-2xl rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center space-x-2 text-rose-300 mb-3">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Our Journey Through Time
            </span>
          </div>

          <div className="relative flex flex-col items-center text-center py-4">
            <span className="text-xs font-bold text-rose-400 font-mono">
              {timeline[timelineIndex]?.date || "Chapter"}
            </span>
            <h4 className="font-serif text-xl font-bold text-white mt-1">
              {timeline[timelineIndex]?.title}
            </h4>
            <p className="text-xs text-neutral-300 mt-2 max-w-md leading-relaxed">
              {timeline[timelineIndex]?.description}
            </p>

            {timeline[timelineIndex]?.photoUrl && (
              <div className="mt-4 aspect-[16/10] w-full max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src={timeline[timelineIndex]?.photoUrl}
                  alt={timeline[timelineIndex]?.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Draggable scrub slider */}
            <div className="w-full mt-6 px-4">
              <input
                type="range"
                min={0}
                max={timeline.length - 1}
                value={timelineIndex}
                onChange={(e) => setTimelineIndex(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>{timeline[0]?.date}</span>
                <span>Drag to scrub milestones</span>
                <span>{timeline[timeline.length - 1]?.date}</span>
              </div>
            </div>
          </div>
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
          <div className="relative max-w-3xl mx-auto py-4">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-rose-500/30 hidden sm:block" />
            <div className="space-y-8">
              {photos.slice(0, 6).map((img, i) => {
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    className={`relative flex flex-col sm:flex-row items-center gap-6 ${
                      isEven ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      onClick={() => setLightboxImage(img)}
                      className="w-full sm:w-1/2 cursor-pointer group relative overflow-hidden rounded-3xl border border-white/20 bg-neutral-900/90 p-2 shadow-xl hover:scale-[1.02] transition"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl">
                        <img
                          src={img}
                          alt={`Memory step ${i + 1}`}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                    </div>
                    <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-xs shadow-lg z-10">
                      {i + 1}
                    </div>
                    <div className="w-full sm:w-1/2 text-center sm:text-left px-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300">
                        Milestone #{i + 1}
                      </span>
                      <h4 className="font-serif text-base font-bold text-white mt-0.5">
                        {["Where it all started", "A quiet afternoon", "Laughter in the air", "Our little adventure", "Under the city lights", "Cherished forever"][i % 6]}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. FILMSTRIP CINEMATIC HORIZONTAL SCROLL */}
        {collageLayout === "filmstrip" && (
          <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/90 py-6 px-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-neutral-400 mb-3 text-xs">
              <Film className="h-4 w-4 text-rose-400" />
              <span>Scroll horizontally to view reel</span>
            </div>
            <div className="flex space-x-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
              {photos.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setLightboxImage(img)}
                  className="flex-none w-64 sm:w-72 snap-center cursor-pointer group rounded-2xl border border-neutral-800 bg-neutral-900 p-2 hover:border-rose-500/50 transition duration-300"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-black">
                    <img
                      src={img}
                      alt={`Filmstrip frame ${i + 1}`}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="pt-2 text-center text-xs text-neutral-400 font-mono">
                    Frame {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAP-TO-REVEAL SECRET MESSAGES SECTION */}
      {secretNotes.length > 0 && (
        <div className="relative z-10 mx-auto max-w-2xl my-8 space-y-3">
          <div className="flex items-center space-x-2 text-amber-300 px-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Secret Notes Hidden For You (Tap to Reveal)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secretNotes.map((note) => {
              const isRevealed = revealedNotes[note.id];
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => toggleSecretNote(note.id)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                    isRevealed
                      ? "border-amber-400/60 bg-amber-950/40 text-white shadow-lg"
                      : "border-white/10 bg-white/5 hover:border-rose-400/40 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-rose-300">
                      {note.triggerLabel}
                    </span>
                    <span className="text-xs">{isRevealed ? "🔓" : "🔒"}</span>
                  </div>
                  <p className="font-serif text-xs leading-relaxed">
                    {isRevealed ? note.revealedMessage : "Tap to break seal & read secret..."}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
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
      <div
        className={`relative z-10 mx-auto max-w-2xl rounded-3xl border p-6 sm:p-10 shadow-2xl my-10 ${
          colorTheme === "scroll"
            ? "border-2 border-[#8c6227]/90 text-[#2a170a]"
            : "border-white/10 bg-white/5 backdrop-blur-xl text-neutral-100"
        }`}
        style={
          colorTheme === "scroll"
            ? {
                background:
                  "radial-gradient(ellipse at 50% 45%, #fcf8ee 0%, #f6eacf 45%, #ebd7ab 75%, #cea970 100%)",
                boxShadow:
                  "inset 0 0 50px rgba(95, 52, 14, 0.28), inset 0 0 10px rgba(60, 30, 8, 0.35), 0 25px 50px -12px rgba(28, 16, 7, 0.5)",
              }
            : undefined
        }
      >
        {colorTheme === "scroll" && (
          <div className="absolute inset-3 rounded-[24px] border border-[#8c6227]/30 pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-[#8c6227]/60 text-xs">
              <span>❦</span>
              <span>❦</span>
            </div>
            <div className="flex justify-between text-[#8c6227]/60 text-xs">
              <span>❦</span>
              <span>❦</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {colorTheme === "scroll" ? (
              <span className="text-base">📜</span>
            ) : (
              <Sparkles className="h-4 w-4 text-rose-300" />
            )}
            <span
              className={`text-xs uppercase tracking-widest font-semibold ${
                colorTheme === "scroll" ? "text-[#7a481c] font-serif" : "text-rose-300"
              }`}
            >
              {colorTheme === "scroll"
                ? "A Sacred Letter • Hand-Inscribed"
                : isMemorial
                ? "Eulogy & Remembrance"
                : isInvite
                ? "Event Note"
                : "Heartfelt Words"}
            </span>
          </div>

          {colorTheme === "scroll" && (
            <div className="relative flex items-center justify-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shadow-md border border-[#f43f5e]/40"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #e11d48 0%, #991b1b 50%, #4c0519 100%)",
                }}
              >
                <Heart className="h-2 w-2 text-amber-200 fill-amber-200" />
              </div>
            </div>
          )}
        </div>

        <p
          className={`${getLetterFontClass(fontFamily)} leading-relaxed whitespace-pre-wrap ${
            colorTheme === "scroll" ? "text-[#2a170a] font-medium" : "text-neutral-100"
          }`}
        >
          {letter || "A timeless message crafted with all my heart."}
        </p>

        <div
          className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
            colorTheme === "scroll"
              ? "border-[#8c6227]/30 text-[#6d4518]"
              : "border-white/10 text-neutral-400"
          }`}
        >
          <span>
            {colorTheme === "scroll"
              ? "In Everlasting Devotion,"
              : isMemorial
              ? "Forever In Our Hearts,"
              : "Warmest Regards,"}
          </span>
          <span
            className={`font-serif italic font-semibold ${
              colorTheme === "scroll" ? "text-[#3b200b] underline decoration-[#8c6227]/60" : "text-white"
            }`}
          >
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
              <span>{"IN GOD'S GRACE • CELEBRATION & BLESSING ✝"}</span>
            </div>
          )}
          {occasion === "blessing_ceremony" && (
            <div className="inline-flex items-center space-x-2 rounded-full border border-stone-500/40 bg-stone-500/15 px-3.5 py-1 text-xs font-bold text-stone-300">
              <span className="text-sm">🌿</span>
              <span>CELEBRATION OF BLESSINGS</span>
            </div>
          )}

          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-white">
              {venueName || "Event Location"}
            </h3>
            {venueAddress && <p className="text-xs text-neutral-300">{venueAddress}</p>}
          </div>

          {(eventDate || eventTime) && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {eventDate && (
                <div className="inline-flex items-center space-x-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-neutral-200">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span>{eventDate}</span>
                </div>
              )}
              {eventTime && (
                <div className="inline-flex items-center space-x-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-neutral-200">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{eventTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Interactive Love Counter Button */}
      <div className="relative z-10 my-8 flex justify-center">
        <button
          type="button"
          onClick={handleSendLove}
          className="group inline-flex items-center space-x-2 rounded-full border border-rose-500/40 bg-rose-950/40 px-6 py-3 text-xs font-semibold text-rose-200 backdrop-blur-md shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-rose-900/50"
        >
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500 group-hover:scale-125 transition duration-200" />
          <span>Tap to Send Love to {displayedRecipient || "Beloved"}</span>
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

      {/* POST-VIEW REACTION SCREEN & SENDER TIP OPTION */}
      {!previewOnly && (
        <div className="relative z-10 mx-auto max-w-xl rounded-3xl border border-white/10 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl my-10 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Leave A Reaction For {senderName}
            </span>
            <h3 className="font-serif text-xl font-bold text-white">
              Send Your Thoughts Back
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Share how this keepsake made you feel. {senderName} will see your note in their dashboard.
            </p>
          </div>

          {!reactionSent ? (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={reactionText}
                onChange={(e) => setReactionText(e.target.value)}
                placeholder="Write a sweet reaction or note back..."
                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 p-3.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={submitReaction}
                disabled={isSendingReaction || !reactionText.trim()}
                className="inline-flex items-center justify-center space-x-2 rounded-full bg-rose-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-600 transition disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSendingReaction ? "Sending..." : "Send Reaction"}</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-300">
              ✓ Your reaction was recorded! {senderName} will cherish this.
            </div>
          )}

          {/* DIRECT SENDER TIP OPTION (UPI ID or PayPal.me - Platform Never Touches Money) */}
          {(tipUpiId || tipPaypalUsername) && (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-center space-x-1.5 text-amber-300 text-xs font-bold">
                <Gift className="h-3.5 w-3.5" />
                <span>Send a Small Thank-You Tip to {senderName}</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Want to buy {senderName} a coffee? Tap below to send a direct tip via UPI or PayPal.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {tipUpiId && (
                  <a
                    href={`upi://pay?pa=${encodeURIComponent(tipUpiId)}&pn=${encodeURIComponent(
                      senderName
                    )}&cu=INR`}
                    className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3.5 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 transition"
                  >
                    <span>💸 Tip via UPI ({tipUpiId})</span>
                  </a>
                )}
                {tipPaypalUsername && (
                  <a
                    href={`https://paypal.me/${encodeURIComponent(tipPaypalUsername)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 px-3.5 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-500/30 transition"
                  >
                    <span>☕ Tip via PayPal.me</span>
                  </a>
                )}
              </div>
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
