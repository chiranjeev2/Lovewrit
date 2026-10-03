"use client";

import React, { useState } from "react";
import {
  COLOR_THEMES,
  ColorThemeKey,
  PhotoShapeKey,
  FontFamilyKey,
  CardBorderStyleKey,
} from "@/lib/templates-data";
import {
  Heart,
  MapPin,
  Sparkles,
  Navigation,
  Calendar,
  Clock,
  Flame,
  RotateCw,
} from "lucide-react";
import VoiceMessagePlayer from "@/components/interactive/VoiceMessagePlayer";

export interface StickerItem {
  id: string;
  emoji: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

interface CardPreviewProps {
  senderName: string;
  recipientName: string;
  nickname?: string | null;
  occasion: string;
  message: string;
  secondaryMessage?: string;
  photoUrl: string;
  photoUrls?: string[];
  photoShape: PhotoShapeKey;
  colorTheme: ColorThemeKey;
  fontFamily?: FontFamilyKey;
  borderStyle?: CardBorderStyleKey;
  stickers?: StickerItem[];
  isFlipReveal?: boolean;
  location?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  eventDate?: string;
  eventTime?: string;
  voiceMessageUrl?: string | null;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  showOmMotif?: boolean;
  showBismillah?: boolean;
}

const CardPreview = React.memo(function CardPreview({
  senderName,
  recipientName,
  nickname,
  occasion,
  message,
  secondaryMessage,
  photoUrl,
  photoUrls = [],
  photoShape,
  colorTheme,
  fontFamily = "serif",
  borderStyle = "classic",
  stickers = [],
  isFlipReveal = false,
  location,
  venueName,
  venueAddress,
  venueMapUrl,
  eventDate,
  eventTime,
  voiceMessageUrl,
  cardRef,
  showOmMotif = false,
  showBismillah = false,
}: CardPreviewProps) {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.rose;
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Active photos list (fall back to photoUrl if photoUrls is empty or contains blank values)
  const activePhotos = (photoUrls || [])
    .filter((u): u is string => Boolean(u && typeof u === "string" && u.trim().length > 0))
    .slice(0, 3);
  if (activePhotos.length === 0 && photoUrl && typeof photoUrl === "string" && photoUrl.trim().length > 0) {
    if (photoUrl.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(photoUrl);
        if (Array.isArray(parsed)) {
          parsed.forEach((p) => {
            if (p && typeof p === "string" && p.trim().length > 0) {
              activePhotos.push(p.trim());
            }
          });
        }
      } catch {
        activePhotos.push(photoUrl.trim());
      }
    } else {
      activePhotos.push(photoUrl.trim());
    }
  }

  // Filter out any photos that encountered an image loading error
  const displayPhotos = activePhotos.filter((p) => !imageErrors[p]);

  // Compute CSS shape class
  const getShapeClass = (shape: PhotoShapeKey) => {
    switch (shape) {
      case "oval":
        return "rounded-[48%]";
      case "square":
        return "rounded-xl";
      case "rounded":
        return "rounded-3xl";
      case "circle":
        return "rounded-full";
      default:
        return "rounded-3xl";
    }
  };

  // Font family class mapper
  const getFontClass = (font: FontFamilyKey) => {
    switch (font) {
      case "handwriting":
        return "font-handwriting text-base sm:text-lg tracking-wide";
      case "sans":
        return "font-sans text-xs sm:text-sm tracking-normal";
      case "serif":
      default:
        return "font-serif italic text-xs sm:text-sm";
    }
  };

  // Decorative border styles
  const getBorderContainerClass = (border: CardBorderStyleKey) => {
    switch (border) {
      case "floral":
        return "border-4 border-double border-rose-300/40 ring-4 ring-rose-500/10";
      case "minimal_line":
        return "border border-neutral-700/80 ring-1 ring-white/10";
      case "festive_gold":
        return "border-2 border-amber-400/80 shadow-amber-500/20 ring-4 ring-amber-500/20";
      case "classic":
      default:
        return "border";
    }
  };

  const isMemorial = occasion === "memorial";
  const isJagrata = occasion === "jagrata_kirtan";
  const isSikh = occasion === "akhand_path" || occasion === "gurpurab";
  const isMuslim = occasion === "aqeeqah" || occasion === "nikah" || occasion === "iftar";
  const isChristian = occasion === "christening" || occasion === "wedding_blessing";
  const isSecular = occasion === "blessing_ceremony";
  const isLetter = occasion === "letter_to_dear_one";
  const isVintageParchment = colorTheme === "vintage_parchment";
  const isScrollTheme = colorTheme === "scroll" || isVintageParchment;
  const hasWoodenRods = colorTheme === "scroll";
  const isModernTheme = colorTheme === "modern";
  const isModernGoldTheme = colorTheme === "modern_gold";
  const isAnyModern = isModernTheme || isModernGoldTheme;

  // Display recipient name with optional pet name / nickname
  const displayedRecipient = nickname
    ? `${recipientName} ("${nickname}")`
    : recipientName;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Flip notice if flip reveal is enabled */}
      {isFlipReveal && (
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="mb-2.5 inline-flex items-center space-x-1.5 rounded-full border border-rose-500/40 bg-rose-950/60 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900/60 transition shadow-sm"
        >
          <RotateCw className="h-3 w-3 animate-spin-slow" />
          <span>{isFlipped ? "Flip to Front View" : "Tap to Flip Card & Read Back ↺"}</span>
        </button>
      )}

      <div
        ref={cardRef}
        id="lovewrit-card-node"
        onClick={() => isFlipReveal && setIsFlipped(!isFlipped)}
        className={`relative mx-auto w-full max-w-sm sm:max-w-md min-h-[540px] sm:min-h-[580px] h-auto rounded-[32px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-500 ${
          isFlipReveal ? "cursor-pointer" : ""
        } ${getBorderContainerClass(borderStyle)} ${
          isScrollTheme
            ? "border-2 border-[#8c6227]/90 text-[#2a170a]"
            : isModernGoldTheme
            ? "border-2 border-amber-500/60 bg-neutral-900/95 text-amber-50 shadow-[0_25px_50px_-12px_rgba(245,158,11,0.25)]"
            : isModernTheme
            ? "border-2 border-slate-600/70 bg-neutral-900/95 text-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]"
            : `${theme.cardBg} ${theme.borderStyle}`
        }`}
        style={
          isScrollTheme
            ? {
                background:
                  "radial-gradient(ellipse at 50% 45%, #fcf7ec 0%, #f5e8cb 45%, #e9d5a5 75%, #cca76e 100%)",
                boxShadow:
                  "inset 0 0 45px rgba(95, 52, 14, 0.28), inset 0 0 10px rgba(60, 30, 8, 0.35), 0 25px 50px -12px rgba(28, 16, 7, 0.5)",
              }
            : {
                boxShadow: theme.accentColor
                  ? `0 25px 50px -12px ${theme.accentColor}33, 0 10px 20px -5px rgba(0, 0, 0, 0.5)`
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
              }
        }
      >
        {/* Medieval Scroll Turned Wood & Gilded End Rods */}
        {hasWoodenRods && (
          <>
            {/* Top Rod */}
            <div className="absolute top-0 inset-x-3 h-2.5 bg-gradient-to-r from-[#45270f] via-[#c49b52] to-[#45270f] rounded-b-md shadow-md border-b border-[#2e1706]/70 z-20 flex items-center justify-center">
              <div className="w-20 h-0.5 bg-amber-200/50 rounded-full blur-[0.5px]" />
            </div>
            {/* Bottom Rod */}
            <div className="absolute bottom-0 inset-x-3 h-2.5 bg-gradient-to-r from-[#45270f] via-[#c49b52] to-[#45270f] rounded-t-md shadow-md border-t border-[#2e1706]/70 z-20 flex items-center justify-center">
              <div className="w-20 h-0.5 bg-amber-200/50 rounded-full blur-[0.5px]" />
            </div>
            {/* Inner Calligraphic Gold & Sepia Margin Frame */}
            <div className="absolute inset-3 rounded-[24px] border border-[#8c6227]/35 pointer-events-none z-10 flex flex-col justify-between p-2">
              <div className="flex justify-between text-[#8c6227]/70 text-[10px] select-none">
                <span>❦</span>
                <span className="tracking-[0.3em] font-serif text-[8px] uppercase text-[#8c6227]/60">ROYAL SCROLL</span>
                <span>❦</span>
              </div>
              <div className="flex justify-between text-[#8c6227]/70 text-[10px] select-none">
                <span>❦</span>
                <span className="tracking-[0.3em] font-serif text-[8px] uppercase text-[#8c6227]/60">ANNO MMXXVI</span>
                <span>❦</span>
              </div>
            </div>
          </>
        )}

        {/* Vintage Parchment Deckle Stationery Margin Frame */}
        {isVintageParchment && isLetter && (
          <div className="absolute inset-3 rounded-[24px] border border-[#a0743b]/35 pointer-events-none z-10 flex flex-col justify-between p-2.5">
            <div className="flex justify-between text-[#a0743b]/70 text-[10px] select-none">
              <span>✤</span>
              <span className="tracking-[0.25em] font-serif text-[8px] uppercase text-[#a0743b]/60">VINTAGE PARCHMENT</span>
              <span>✤</span>
            </div>
            <div className="flex justify-between text-[#a0743b]/70 text-[10px] select-none">
              <span>✤</span>
              <span className="tracking-[0.25em] font-serif text-[8px] uppercase text-[#a0743b]/60">ANNO MMXXVI</span>
              <span>✤</span>
            </div>
          </div>
        )}

        {/* Modern Scroll Brushed Silver / Platinum Rails & Margin Frame */}
        {isModernTheme && isLetter && (
          <>
            {/* Top Rod */}
            <div className="absolute top-0 inset-x-3 h-2 bg-gradient-to-r from-slate-600 via-slate-200 to-slate-600 rounded-b-sm shadow-md border-b border-slate-700 z-20 flex items-center justify-center">
              <div className="w-20 h-0.5 bg-white/70 rounded-full blur-[0.5px]" />
            </div>
            {/* Bottom Rod */}
            <div className="absolute bottom-0 inset-x-3 h-2 bg-gradient-to-r from-slate-600 via-slate-200 to-slate-600 rounded-t-sm shadow-md border-t border-slate-700 z-20 flex items-center justify-center">
              <div className="w-20 h-0.5 bg-white/70 rounded-full blur-[0.5px]" />
            </div>
            {/* Inner Modern Calligraphic Margin Frame */}
            <div className="absolute inset-3 rounded-[24px] border border-slate-700/50 pointer-events-none z-10 flex flex-col justify-between p-2">
              <div className="flex justify-between text-slate-400 text-[10px] select-none font-mono">
                <span>✦</span>
                <span className="tracking-[0.25em] text-[8px] uppercase text-slate-300 font-semibold">MODERN MANUSCRIPT</span>
                <span>✦</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px] select-none font-mono">
                <span>✦</span>
                <span className="tracking-[0.25em] text-[8px] uppercase text-slate-400">SILVER EDITION</span>
                <span>✦</span>
              </div>
            </div>
          </>
        )}

        {/* Modern Scroll Gilded Gold Rails & Margin Frame */}
        {isModernGoldTheme && isLetter && (
          <>
            {/* Top Rod */}
            <div className="absolute top-0 inset-x-3 h-2 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 rounded-b-sm shadow-md border-b border-amber-600/70 z-20 flex items-center justify-center">
              <div className="w-20 h-0.5 bg-amber-100/90 rounded-full blur-[0.5px]" />
            </div>
            {/* Bottom Rod */}
            <div className="absolute bottom-0 inset-x-3 h-2 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 rounded-t-sm shadow-md border-t border-amber-600/70 z-20 flex items-center justify-center">
              <div className="w-20 h-0.5 bg-amber-100/90 rounded-full blur-[0.5px]" />
            </div>
            {/* Inner Modern Calligraphic Margin Frame */}
            <div className="absolute inset-3 rounded-[24px] border border-amber-500/40 pointer-events-none z-10 flex flex-col justify-between p-2">
              <div className="flex justify-between text-amber-400/80 text-[10px] select-none font-mono">
                <span>✦</span>
                <span className="tracking-[0.25em] text-[8px] uppercase text-amber-300 font-semibold">MODERN MANUSCRIPT</span>
                <span>✦</span>
              </div>
              <div className="flex justify-between text-amber-400/80 text-[10px] select-none font-mono">
                <span>✦</span>
                <span className="tracking-[0.25em] text-[8px] uppercase text-amber-400">GOLDEN EDITION</span>
                <span>✦</span>
              </div>
            </div>
          </>
        )}

        {/* Subtle background ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-black/20 blur-2xl pointer-events-none" />

        {/* Decorative floral corner accents when floral border active */}
        {borderStyle === "floral" && (
          <>
            <span className="absolute top-2 left-2 text-xs pointer-events-none opacity-60">🌸</span>
            <span className="absolute top-2 right-2 text-xs pointer-events-none opacity-60">🌸</span>
            <span className="absolute bottom-2 left-2 text-xs pointer-events-none opacity-60">🌸</span>
            <span className="absolute bottom-2 right-2 text-xs pointer-events-none opacity-60">🌸</span>
          </>
        )}

        {/* Decorative gold foil stars when festive_gold active */}
        {borderStyle === "festive_gold" && (
          <>
            <span className="absolute top-2 left-2 text-xs pointer-events-none opacity-70">✨</span>
            <span className="absolute top-2 right-2 text-xs pointer-events-none opacity-70">✨</span>
            <span className="absolute bottom-2 left-2 text-xs pointer-events-none opacity-70">✨</span>
            <span className="absolute bottom-2 right-2 text-xs pointer-events-none opacity-70">✨</span>
          </>
        )}

        {/* User-placed Stickers Overlay */}
        {stickers.map((stk, idx) => (
          <div
            key={idx}
            className="absolute pointer-events-none select-none z-30 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
            style={{ left: `${stk.x}%`, top: `${stk.y}%` }}
          >
            <span className="text-2xl drop-shadow-md filter">{stk.emoji}</span>
          </div>
        ))}

        {/* FLIP REVEAL: BACK OF CARD VIEW */}
        {isFlipReveal && isFlipped ? (
          <div className="relative z-20 h-full flex flex-col justify-between items-center text-center py-4 px-2">
            <div className="space-y-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isScrollTheme ? "text-[#7a481c]" : "text-rose-400"
                }`}
              >
                A Letter From The Heart
              </span>
              <h3
                className={`font-serif text-xl font-bold ${
                  isScrollTheme ? "text-[#2a170a]" : "text-white"
                }`}
              >
                Dearest {displayedRecipient}
              </h3>
            </div>

            <div className="my-auto max-w-xs space-y-3">
              <p
                className={`${getFontClass(fontFamily)} whitespace-pre-line break-words leading-relaxed ${
                  isScrollTheme ? "text-[#2a170a] font-medium" : "text-neutral-100"
                }`}
              >
                &ldquo;{message || "You make every single day brighter, warmer, and filled with love."}&rdquo;
              </p>

              {/* Bilingual Secondary Message */}
              {secondaryMessage && (
                <div
                  className={`pt-3 border-t ${
                    isScrollTheme ? "border-[#8c6227]/30" : "border-white/10"
                  }`}
                >
                  <p
                    className={`${getFontClass(fontFamily)} whitespace-pre-line break-words leading-relaxed text-xs sm:text-sm ${
                      isScrollTheme ? "text-[#45270f] font-medium" : "text-neutral-300"
                    }`}
                  >
                    &ldquo;{secondaryMessage}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <p
                className={`text-xs font-serif italic ${
                  isScrollTheme
                    ? "text-[#5c3716]"
                    : isModernGoldTheme
                    ? "text-amber-200/90"
                    : isModernTheme
                    ? "text-slate-300"
                    : "text-neutral-300"
                }`}
              >
                Forever yours,{" "}
                <span
                  className={`font-bold underline ${
                    isScrollTheme
                      ? "text-[#2a170a] decoration-[#8c6227]"
                      : isModernGoldTheme
                      ? "text-white decoration-amber-400 font-semibold"
                      : isModernTheme
                      ? "text-white decoration-slate-400 font-semibold"
                      : "text-white"
                  }`}
                >
                  {senderName}
                </span>
              </p>
              <span
                className={`text-[9px] mt-2 block ${
                  isScrollTheme
                    ? "text-[#7a481c]"
                    : isModernGoldTheme
                    ? "text-amber-400/80"
                    : isModernTheme
                    ? "text-slate-400"
                    : "text-neutral-500"
                }`}
              >
                Tap anywhere to flip back to front view
              </span>
            </div>
          </div>
        ) : (
          /* FRONT OF CARD VIEW */
          <>
            {/* Top Header: Occasion badge & Location */}
            <div className="relative z-10 flex items-center justify-between">
              {isJagrata ? (
                <div
                  className={`flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 shadow-sm border ${
                    isScrollTheme
                      ? "bg-[#8c6227]/20 border-[#8c6227]/50 text-[#3b200b]"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  }`}
                >
                  <Flame
                    className={`h-3.5 w-3.5 animate-pulse ${
                      isScrollTheme ? "text-[#8c6227]" : "text-amber-400"
                    }`}
                  />
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {showOmMotif ? "ॐ 🚩 JAI MATA DI 🚩 ॐ" : "🚩 JAI MATA DI 🚩"}
                  </span>
                </div>
              ) : isSikh ? (
                <div
                  className={`flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 shadow-sm border ${
                    isScrollTheme
                      ? "bg-[#8c6227]/20 border-[#8c6227]/50 text-[#3b200b]"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-200"
                  }`}
                >
                  <span className="text-xs font-bold">ੴ</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    SATNAM WAHEGURU
                  </span>
                </div>
              ) : isMuslim ? (
                <div
                  className={`flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 shadow-sm border ${
                    isScrollTheme
                      ? "bg-[#8c6227]/20 border-[#8c6227]/50 text-[#3b200b]"
                      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                  }`}
                >
                  <span className="text-xs">🌙</span>
                  <span className="text-[10px] font-bold tracking-wider">
                    {showBismillah ? "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" : "SACRED BLESSING"}
                  </span>
                </div>
              ) : isChristian ? (
                <div
                  className={`flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 shadow-sm border ${
                    isScrollTheme
                      ? "bg-[#8c6227]/20 border-[#8c6227]/50 text-[#3b200b]"
                      : "bg-sky-500/20 border-sky-500/40 text-sky-200"
                  }`}
                >
                  <span className="text-xs">🕊️</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {"IN GOD'S GRACE ✝"}
                  </span>
                </div>
              ) : isSecular ? (
                <div
                  className={`flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 shadow-sm border ${
                    isScrollTheme
                      ? "bg-[#8c6227]/20 border-[#8c6227]/50 text-[#3b200b]"
                      : "bg-stone-500/20 border-stone-500/40 text-stone-200"
                  }`}
                >
                  <span className="text-xs">🌿</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    SACRED MOMENT
                  </span>
                </div>
              ) : isLetter ? (
                <div
                  className={`flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 shadow-sm border ${
                    isScrollTheme
                      ? "bg-[#8c6227]/20 border-[#8c6227]/50 text-[#3b200b]"
                      : isModernGoldTheme
                      ? "bg-amber-950/70 border-amber-500/60 text-amber-100"
                      : isModernTheme
                      ? "bg-slate-800/90 border-slate-600/70 text-slate-100"
                      : "bg-rose-500/20 border-rose-500/40 text-rose-200"
                  }`}
                >
                  <span className="text-xs">{isAnyModern ? "✉️" : "📜"}</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    LETTER TO A DEAR ONE • 100% FREE
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <Sparkles
                    className="h-3.5 w-3.5"
                    style={{
                      color: isScrollTheme ? "#8c6227" : theme.accentColor,
                    }}
                  />
                  <span
                    className={`text-[11px] font-bold tracking-widest uppercase ${
                      isScrollTheme ? "text-[#45270f]" : "opacity-80"
                    }`}
                  >
                    {occasion.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              )}
              {(location || venueName) && (
                <div
                  className={`flex items-center space-x-1 text-[11px] ${
                    isScrollTheme
                      ? "text-[#5c3716] font-semibold"
                      : isModernGoldTheme
                      ? "text-amber-200 font-medium"
                      : isModernTheme
                      ? "text-slate-200 font-medium"
                      : "opacity-75"
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[140px]">{venueName || location}</span>
                </div>
              )}
            </div>

            {/* Central Photo Area (Supports single or multi-photo collage) */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center py-2">
              {displayPhotos.length === 0 ? (
                <div
                  className={`relative w-40 h-40 sm:w-52 sm:h-52 overflow-hidden border-2 shadow-2xl transition-all duration-300 ${getShapeClass(
                    photoShape
                  )} ${
                    isScrollTheme
                      ? "border-[#8c6227] bg-[#8c6227]/10 text-[#5c3716]"
                      : isModernGoldTheme
                      ? "border-amber-500/50 bg-amber-950/40 text-amber-200"
                      : isModernTheme
                      ? "border-slate-600 bg-slate-800/80 text-slate-200"
                      : `${theme.borderStyle} bg-neutral-800/80 text-neutral-400`
                  } flex flex-col items-center justify-center p-4 text-center`}
                >
                  <Heart
                    className={`h-8 w-8 mb-2 ${
                      isModernGoldTheme
                        ? "text-amber-300 opacity-70"
                        : isModernTheme
                        ? "text-slate-300 opacity-70"
                        : "text-rose-400 opacity-50"
                    } animate-pulse`}
                  />
                  <span className="text-xs">Photo will appear here</span>
                </div>
              ) : displayPhotos.length === 1 ? (
                <div
                  className={`relative w-40 h-40 sm:w-52 sm:h-52 overflow-hidden border-2 shadow-2xl transition-all duration-300 ${getShapeClass(
                    photoShape
                  )} ${
                    isScrollTheme
                      ? "border-[#8c6227] shadow-[0_10px_25px_rgba(60,30,10,0.3)]"
                      : isModernGoldTheme
                      ? "border-amber-500/50 shadow-[0_10px_25px_rgba(245,158,11,0.25)]"
                      : isModernTheme
                      ? "border-slate-600 shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                      : theme.borderStyle
                  }`}
                >
                  <img
                    src={displayPhotos[0]}
                    alt="Moment photo"
                    onError={() => setImageErrors((prev) => ({ ...prev, [displayPhotos[0]]: true }))}
                    className="w-full h-full object-cover"
                  />
                  {isScrollTheme && (
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-[#8c6227]/40 ring-1 ring-inset ring-amber-900/20" />
                  )}
                  {isModernTheme && isLetter && (
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-slate-400/40 ring-1 ring-inset ring-white/10" />
                  )}
                  {isModernGoldTheme && isLetter && (
                    <div className="absolute inset-0 pointer-events-none rounded-[inherit] border border-amber-400/40 ring-1 ring-inset ring-amber-500/20" />
                  )}
                </div>
              ) : displayPhotos.length === 2 ? (
                <div className="flex items-center justify-center -space-x-4 sm:-space-x-6 py-2">
                  <div
                    className={`relative w-28 h-28 sm:w-36 sm:h-36 overflow-hidden border-2 shadow-xl -rotate-3 transition duration-300 hover:rotate-0 hover:scale-105 z-10 ${getShapeClass(
                      photoShape
                    )} ${isScrollTheme ? "border-[#8c6227]" : theme.borderStyle}`}
                  >
                    <img
                      src={displayPhotos[0]}
                      alt="Moment 1"
                      onError={() => setImageErrors((prev) => ({ ...prev, [displayPhotos[0]]: true }))}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`relative w-28 h-28 sm:w-36 sm:h-36 overflow-hidden border-2 shadow-xl rotate-3 transition duration-300 hover:rotate-0 hover:scale-105 z-20 ${getShapeClass(
                      photoShape
                    )} ${isScrollTheme ? "border-[#8c6227]" : theme.borderStyle}`}
                  >
                    <img
                      src={displayPhotos[1]}
                      alt="Moment 2"
                      onError={() => setImageErrors((prev) => ({ ...prev, [displayPhotos[1]]: true }))}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center -space-x-3 sm:-space-x-5 py-2">
                  <div
                    className={`relative w-22 h-22 sm:w-32 sm:h-32 overflow-hidden border-2 shadow-lg -rotate-6 transition duration-300 hover:rotate-0 hover:scale-105 z-10 ${getShapeClass(
                      photoShape
                    )} ${isScrollTheme ? "border-[#8c6227]" : theme.borderStyle}`}
                  >
                    <img
                      src={displayPhotos[0]}
                      alt="Moment 1"
                      onError={() => setImageErrors((prev) => ({ ...prev, [displayPhotos[0]]: true }))}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`relative w-26 h-26 sm:w-36 sm:h-36 overflow-hidden border-2 shadow-2xl rotate-0 transition duration-300 hover:scale-110 z-20 ${getShapeClass(
                      photoShape
                    )} ${isScrollTheme ? "border-[#8c6227]" : theme.borderStyle}`}
                  >
                    <img
                      src={displayPhotos[1]}
                      alt="Moment 2"
                      onError={() => setImageErrors((prev) => ({ ...prev, [displayPhotos[1]]: true }))}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className={`relative w-22 h-22 sm:w-32 sm:h-32 overflow-hidden border-2 shadow-lg rotate-6 transition duration-300 hover:rotate-0 hover:scale-105 z-10 ${getShapeClass(
                      photoShape
                    )} ${isScrollTheme ? "border-[#8c6227]" : theme.borderStyle}`}
                  >
                    <img
                      src={displayPhotos[2]}
                      alt="Moment 3"
                      onError={() => setImageErrors((prev) => ({ ...prev, [displayPhotos[2]]: true }))}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Recipient & Sender Names */}
              <div className="mt-4 text-center">
                {isJagrata ? (
                  <>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400/90 block mb-0.5">
                      सादर आमंत्रण
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {displayedRecipient || "Sadar Nimantran"}
                    </h3>
                    <p className="text-[12px] text-amber-200/90 font-medium mt-0.5">
                      कृपाकांक्षी:{" "}
                      <span className="font-semibold text-white underline decoration-amber-400/50">
                        {senderName || "Goyal Parivaar"}
                      </span>
                    </p>
                  </>
                ) : isMemorial ? (
                  <>
                    <h3
                      className={`font-serif text-xl sm:text-2xl font-bold tracking-tight ${
                        isScrollTheme ? "text-[#2a170a]" : "text-white"
                      }`}
                    >
                      {displayedRecipient || "Honored Memory"}
                    </h3>
                    <p
                      className={`text-[12px] font-medium ${
                        isScrollTheme ? "text-[#5c3716]" : "opacity-80"
                      }`}
                    >
                      Remembered by {senderName || "Family"}
                    </p>
                  </>
                ) : (
                  <>
                    <h3
                      className={`font-serif text-xl sm:text-2xl font-bold tracking-tight ${
                        isScrollTheme
                          ? "text-[#2a170a]"
                          : isModernGoldTheme
                          ? "text-amber-50"
                          : "text-white"
                      }`}
                    >
                      {displayedRecipient || "Honored Guest"}
                    </h3>
                    <p
                      className={`text-[12px] font-medium ${
                        isScrollTheme
                          ? "text-[#5c3716]"
                          : isModernGoldTheme
                          ? "text-amber-200/90"
                          : isModernTheme
                          ? "text-slate-300"
                          : "opacity-80"
                      }`}
                    >
                      with love from{" "}
                      <span
                        className={`underline ${
                          isScrollTheme
                            ? "text-[#2a170a] decoration-[#8c6227] font-bold"
                            : isModernGoldTheme
                            ? "text-white decoration-amber-400 font-semibold"
                            : isModernTheme
                            ? "text-white decoration-slate-400 font-semibold"
                            : "decoration-rose-400/50"
                        }`}
                      >
                        {senderName || "Yours"}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Heartfelt Message Area */}
            <div className="relative z-10 pt-2 text-center">
              {secondaryMessage ? (
                /* Bilingual side-by-side mode */
                <div
                  className={`grid grid-cols-2 gap-2 text-left p-2.5 rounded-2xl border ${
                    isScrollTheme
                      ? "bg-[#8c6227]/10 border-[#8c6227]/30"
                      : isModernGoldTheme
                      ? "bg-amber-950/40 border-amber-600/40"
                      : isModernTheme
                      ? "bg-slate-800/70 border-slate-700/80"
                      : "bg-black/20 border-white/10"
                  }`}
                >
                  <div
                    className={`border-r pr-2 ${
                      isScrollTheme
                        ? "border-[#8c6227]/30"
                        : isModernGoldTheme
                        ? "border-amber-600/40"
                        : isModernTheme
                        ? "border-slate-700/80"
                        : "border-white/10"
                    }`}
                  >
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold block mb-1 ${
                        isScrollTheme
                          ? "text-[#7a481c]"
                          : isModernGoldTheme
                          ? "text-amber-300 font-mono"
                          : isModernTheme
                          ? "text-slate-300 font-mono"
                          : "text-rose-300"
                      }`}
                    >
                      Primary
                    </span>
                    <p
                      className={`${getFontClass(fontFamily)} whitespace-pre-line break-words leading-relaxed text-xs sm:text-sm ${
                        isScrollTheme
                          ? "text-[#2a170a] font-medium"
                          : isModernGoldTheme
                          ? "text-amber-50 font-medium"
                          : isModernTheme
                          ? "text-slate-100 font-medium"
                          : "text-neutral-100"
                      }`}
                    >
                      &ldquo;{message || "With love..."}&rdquo;
                    </p>
                  </div>
                  <div className="pl-1">
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold block mb-1 ${
                        isScrollTheme
                          ? "text-[#8c6227]"
                          : isModernGoldTheme
                          ? "text-yellow-400 font-mono"
                          : isModernTheme
                          ? "text-slate-400 font-mono"
                          : "text-amber-300"
                      }`}
                    >
                      Translation
                    </span>
                    <p
                      className={`${getFontClass(fontFamily)} whitespace-pre-line break-words leading-relaxed text-xs sm:text-sm ${
                        isScrollTheme
                          ? "text-[#3b200b] font-medium"
                          : isModernGoldTheme
                          ? "text-amber-100 font-medium"
                          : isModernTheme
                          ? "text-slate-200 font-medium"
                          : "text-neutral-300"
                      }`}
                    >
                      &ldquo;{secondaryMessage}&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <p
                  className={`${getFontClass(fontFamily)} leading-relaxed whitespace-pre-line break-words px-2 ${
                    isScrollTheme
                      ? "text-[#2a170a] font-medium"
                      : isModernGoldTheme
                      ? "text-amber-50 font-medium"
                      : isModernTheme
                      ? "text-slate-100 font-medium"
                      : "opacity-90 text-neutral-100"
                  }`}
                >
                  &ldquo;{message || "You make every single day brighter, warmer, and filled with love."}&rdquo;
                </p>
              )}

              {/* Pretty Event Date & Timing Ribbon */}
              {(eventDate || eventTime) && (
                <div className="mt-2.5 flex items-center justify-center">
                  <div
                    className={`inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border px-3.5 py-1.5 text-[11px] backdrop-blur-md shadow-sm ${
                      isScrollTheme
                        ? "border-[#8c6227]/50 bg-[#8c6227]/15 text-[#3b200b]"
                        : isModernGoldTheme
                        ? "border-amber-500/60 bg-amber-950/70 text-amber-100 shadow-md"
                        : isModernTheme
                        ? "border-slate-600/70 bg-slate-800/90 text-slate-100 shadow-md"
                        : "border-amber-500/30 bg-amber-950/50 text-amber-200"
                    }`}
                  >
                    {eventDate && (
                      <span className="flex items-center space-x-1 font-medium">
                        <Calendar
                          className={`h-3 w-3 ${
                            isScrollTheme
                              ? "text-[#7a481c]"
                              : isModernGoldTheme
                              ? "text-amber-300"
                              : isModernTheme
                              ? "text-slate-300"
                              : "text-amber-400"
                          }`}
                        />
                        <span>{eventDate}</span>
                      </span>
                    )}
                    {eventDate && eventTime && (
                      <span
                        className={
                          isScrollTheme
                            ? "text-[#8c6227]/60"
                            : isModernGoldTheme
                            ? "text-amber-500/60"
                            : isModernTheme
                            ? "text-slate-500"
                            : "text-amber-500/50"
                        }
                      >
                        •
                      </span>
                    )}
                    {eventTime && (
                      <span className="flex items-center space-x-1 font-medium">
                        <Clock
                          className={`h-3 w-3 ${
                            isScrollTheme
                              ? "text-[#7a481c]"
                              : isModernGoldTheme
                              ? "text-amber-300"
                              : isModernTheme
                              ? "text-slate-300"
                              : "text-amber-400"
                          }`}
                        />
                        <span>{eventTime}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Venue address highlight for invite-cards */}
              {venueAddress && (
                <div
                  className={`mt-2 text-[10px] font-medium truncate flex items-center justify-center space-x-1 ${
                    isScrollTheme
                      ? "text-[#45270f] font-semibold"
                      : isModernGoldTheme
                      ? "text-amber-200 font-medium"
                      : isModernTheme
                      ? "text-slate-200 font-medium"
                      : "text-amber-200/90"
                  }`}
                >
                  <MapPin
                    className={`h-3 w-3 shrink-0 ${
                      isScrollTheme
                        ? "text-[#7a481c]"
                        : isModernGoldTheme
                        ? "text-amber-400"
                        : isModernTheme
                        ? "text-slate-300"
                        : "text-rose-400"
                    }`}
                  />
                  <span>{venueAddress}</span>
                </div>
              )}

              {/* Card watermark/footer mark */}
              <div
                className={`mt-3 flex items-center justify-between text-[9px] tracking-widest uppercase ${
                  isScrollTheme
                    ? "text-[#5a3717] font-semibold"
                    : isModernGoldTheme
                    ? "text-amber-300 font-semibold"
                    : isModernTheme
                    ? "text-slate-300 font-semibold"
                    : "opacity-50"
                }`}
              >
                {isScrollTheme ? (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 rounded-full bg-[#8c6227]/20 border border-[#8c6227]/40 px-2 py-0.5 text-[#5c3716] font-bold text-[8px] tracking-wider">
                      <span>⚜ ROYAL MANUSCRIPT</span>
                    </span>
                  </div>
                ) : isModernGoldTheme && isLetter ? (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 rounded-full bg-amber-950/70 border border-amber-500/60 px-2 py-0.5 text-amber-200 font-bold text-[8px] tracking-wider font-mono">
                      <span>⚜ MODERN MANUSCRIPT • GOLD</span>
                    </span>
                  </div>
                ) : isModernTheme && isLetter ? (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 rounded-full bg-slate-800/90 border border-slate-600/70 px-2 py-0.5 text-slate-200 font-bold text-[8px] tracking-wider font-mono">
                      <span>⚜ MODERN MANUSCRIPT • SILVER</span>
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center space-x-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-rose-300 font-bold">
                    <span>✦ Made for you</span>
                  </span>
                )}

                {isScrollTheme ? (
                  <div className="flex items-center space-x-2.5">
                    {/* Handcrafted 3D Crimson Wax Seal Badge with Draping Silk Ribbons */}
                    <div className="relative flex items-center justify-center">
                      {/* Draping Ribbon Tails */}
                      <div className="absolute -bottom-2 inset-x-0 flex justify-center space-x-1 pointer-events-none z-0">
                        <div className="w-1.5 h-3 bg-gradient-to-b from-[#881337] to-[#7f1d1d] transform -rotate-12 shadow-sm rounded-b-[2px]" />
                        <div className="w-1.5 h-3 bg-gradient-to-b from-[#881337] to-[#7f1d1d] transform rotate-12 shadow-sm rounded-b-[2px]" />
                      </div>
                      {/* Relieved Wax Stamp Medallion */}
                      <div
                        className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(120,20,30,0.45)] border border-[#f43f5e]/40 transition-transform hover:scale-110"
                        style={{
                          background:
                            "radial-gradient(circle at 35% 30%, #e11d48 0%, #991b1b 50%, #4c0519 100%)",
                        }}
                        title="Authentic Wax Sealed Keepsake"
                      >
                        <div className="w-4.5 h-4.5 rounded-full border border-amber-300/40 flex items-center justify-center">
                          <Heart className="h-2 w-2 text-amber-200 fill-amber-200/90 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                        </div>
                      </div>
                    </div>
                    <div className="text-left flex flex-col justify-center">
                      <span className="text-[7.5px] font-serif font-bold text-[#45270f] tracking-widest uppercase leading-none">
                        SEALED IN WAX
                      </span>
                      <span className="text-[6.5px] text-[#8c6227] tracking-widest font-mono uppercase mt-0.5 leading-none">
                        LOVEWRIT
                      </span>
                    </div>
                  </div>
                ) : isModernGoldTheme && isLetter ? (
                  <div className="flex items-center space-x-2.5">
                    {/* Handcrafted 3D Gilded Gold Wax Seal with Draping Amber Ribbons */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -bottom-2 inset-x-0 flex justify-center space-x-1 pointer-events-none z-0">
                        <div className="w-1.5 h-3 bg-gradient-to-b from-amber-600 to-amber-800 transform -rotate-12 shadow-sm rounded-b-[2px]" />
                        <div className="w-1.5 h-3 bg-gradient-to-b from-amber-600 to-amber-800 transform rotate-12 shadow-sm rounded-b-[2px]" />
                      </div>
                      <div
                        className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(245,158,11,0.4)] border border-amber-300/70 transition-transform hover:scale-110"
                        style={{
                          background:
                            "radial-gradient(circle at 35% 30%, #fef08a 0%, #eab308 45%, #854d0e 100%)",
                        }}
                        title="Modern Gold Sealed Keepsake"
                      >
                        <div className="w-4.5 h-4.5 rounded-full border border-amber-200/80 flex items-center justify-center">
                          <Sparkles className="h-2.5 w-2.5 text-amber-950 fill-amber-950 filter drop-shadow-[0_1px_1px_rgba(254,240,138,0.8)]" />
                        </div>
                      </div>
                    </div>
                    <div className="text-left flex flex-col justify-center">
                      <span className="text-[7.5px] font-sans font-bold text-amber-200 tracking-widest uppercase leading-none">
                        SEALED IN GOLD
                      </span>
                      <span className="text-[6.5px] text-amber-400 tracking-widest font-mono uppercase mt-0.5 leading-none">
                        LOVEWRIT
                      </span>
                    </div>
                  </div>
                ) : isModernTheme && isLetter ? (
                  <div className="flex items-center space-x-2.5">
                    {/* Handcrafted 3D Silver Platinum Wax Seal with Draping Slate Ribbons */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute -bottom-2 inset-x-0 flex justify-center space-x-1 pointer-events-none z-0">
                        <div className="w-1.5 h-3 bg-gradient-to-b from-slate-500 to-slate-700 transform -rotate-12 shadow-sm rounded-b-[2px]" />
                        <div className="w-1.5 h-3 bg-gradient-to-b from-slate-500 to-slate-700 transform rotate-12 shadow-sm rounded-b-[2px]" />
                      </div>
                      <div
                        className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.6)] border border-slate-300/60 transition-transform hover:scale-110"
                        style={{
                          background:
                            "radial-gradient(circle at 35% 30%, #f8fafc 0%, #94a3b8 50%, #334155 100%)",
                        }}
                        title="Modern Silver Sealed Keepsake"
                      >
                        <div className="w-4.5 h-4.5 rounded-full border border-white/60 flex items-center justify-center">
                          <Sparkles className="h-2.5 w-2.5 text-slate-900 fill-slate-900 filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]" />
                        </div>
                      </div>
                    </div>
                    <div className="text-left flex flex-col justify-center">
                      <span className="text-[7.5px] font-sans font-bold text-slate-200 tracking-widest uppercase leading-none">
                        SEALED IN SILVER
                      </span>
                      <span className="text-[6.5px] text-slate-400 tracking-widest font-mono uppercase mt-0.5 leading-none">
                        LOVEWRIT
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <span>Lovewrit</span>
                    <Heart className="h-2 w-2 fill-current" />
                    <span>Keepsake</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Voice message player attached below card if present */}
      {voiceMessageUrl && (
        <div className="mt-4 w-full max-w-sm sm:max-w-md">
          <VoiceMessagePlayer audioUrl={voiceMessageUrl} senderName={senderName} />
        </div>
      )}

      {/* Venue Google Maps navigation button if present */}
      {venueMapUrl && (
        <div className="mt-3">
          <a
            href={venueMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 rounded-full border border-neutral-700 bg-neutral-900/90 px-4 py-1.5 text-xs text-neutral-200 hover:text-white transition"
          >
            <Navigation className="h-3.5 w-3.5 text-rose-400" />
            <span>Open Location in Google Maps</span>
          </a>
        </div>
      )}
    </div>
  );
});

export default CardPreview;
