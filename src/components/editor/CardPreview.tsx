"use client";

import React from "react";
import { COLOR_THEMES, ColorThemeKey, PhotoShapeKey } from "@/lib/templates-data";
import { Heart, MapPin, Sparkles, Navigation, Calendar } from "lucide-react";
import VoiceMessagePlayer from "@/components/interactive/VoiceMessagePlayer";

interface CardPreviewProps {
  senderName: string;
  recipientName: string;
  occasion: string;
  message: string;
  photoUrl: string;
  photoUrls?: string[];
  photoShape: PhotoShapeKey;
  colorTheme: ColorThemeKey;
  location?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  voiceMessageUrl?: string | null;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export default function CardPreview({
  senderName,
  recipientName,
  occasion,
  message,
  photoUrl,
  photoUrls = [],
  photoShape,
  colorTheme,
  location,
  venueName,
  venueAddress,
  venueMapUrl,
  voiceMessageUrl,
  cardRef,
}: CardPreviewProps) {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.rose;

  // Active photos list (fall back to photoUrl if photoUrls is empty)
  const activePhotos =
    photoUrls.length > 0 ? photoUrls.slice(0, 3) : photoUrl ? [photoUrl] : [];

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

  const isMemorial = occasion === "memorial";

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={cardRef}
        id="memoir-card-node"
        className={`relative mx-auto w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl border transition-all duration-300 ${theme.cardBg} ${theme.borderStyle}`}
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Subtle background ambient blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-black/20 blur-2xl pointer-events-none" />

        {/* Top Header: Occasion badge & Location */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5" style={{ color: theme.accentColor }} />
            <span className="text-[11px] font-semibold tracking-widest uppercase opacity-80">
              {occasion.replace("_", " ").toUpperCase()}
            </span>
          </div>
          {(location || venueName) && (
            <div className="flex items-center space-x-1 text-[11px] opacity-75">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[140px]">{venueName || location}</span>
            </div>
          )}
        </div>

        {/* Central Photo Area (Supports single or multi-photo collage) */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-2">
          {activePhotos.length === 0 ? (
            <div
              className={`relative w-44 h-44 sm:w-52 sm:h-52 overflow-hidden border-2 shadow-2xl transition-all duration-300 ${getShapeClass(
                photoShape
              )} ${theme.borderStyle} bg-neutral-800/80 flex flex-col items-center justify-center text-neutral-400 p-4 text-center`}
            >
              <Heart className="h-8 w-8 mb-2 opacity-50 text-rose-400 animate-pulse" />
              <span className="text-xs">Photo will appear here</span>
            </div>
          ) : activePhotos.length === 1 ? (
            <div
              className={`relative w-44 h-44 sm:w-52 sm:h-52 overflow-hidden border-2 shadow-2xl transition-all duration-300 ${getShapeClass(
                photoShape
              )} ${theme.borderStyle}`}
            >
              <img
                src={activePhotos[0]}
                alt="Moment photo"
                className="w-full h-full object-cover"
              />
            </div>
          ) : activePhotos.length === 2 ? (
            <div className="flex items-center justify-center -space-x-6 py-2">
              <div
                className={`relative w-32 h-32 sm:w-36 sm:h-36 overflow-hidden border-2 shadow-xl -rotate-3 transition duration-300 hover:rotate-0 hover:scale-105 z-10 ${getShapeClass(
                  photoShape
                )} ${theme.borderStyle}`}
              >
                <img
                  src={activePhotos[0]}
                  alt="Moment 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`relative w-32 h-32 sm:w-36 sm:h-36 overflow-hidden border-2 shadow-xl rotate-3 transition duration-300 hover:rotate-0 hover:scale-105 z-20 ${getShapeClass(
                  photoShape
                )} ${theme.borderStyle}`}
              >
                <img
                  src={activePhotos[1]}
                  alt="Moment 2"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center -space-x-5 py-2">
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 overflow-hidden border-2 shadow-lg -rotate-6 transition duration-300 hover:rotate-0 hover:scale-105 z-10 ${getShapeClass(
                  photoShape
                )} ${theme.borderStyle}`}
              >
                <img
                  src={activePhotos[0]}
                  alt="Moment 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`relative w-32 h-32 sm:w-36 sm:h-36 overflow-hidden border-2 shadow-2xl rotate-0 transition duration-300 hover:scale-110 z-20 ${getShapeClass(
                  photoShape
                )} ${theme.borderStyle}`}
              >
                <img
                  src={activePhotos[1]}
                  alt="Moment 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`relative w-28 h-28 sm:w-32 sm:h-32 overflow-hidden border-2 shadow-lg rotate-6 transition duration-300 hover:rotate-0 hover:scale-105 z-10 ${getShapeClass(
                  photoShape
                )} ${theme.borderStyle}`}
              >
                <img
                  src={activePhotos[2]}
                  alt="Moment 3"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Recipient & Sender Names */}
          <div className="mt-4 text-center">
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              {recipientName || "Honored Guest"}
            </h3>
            <p className="text-[12px] opacity-80 font-medium">
              {isMemorial ? (
                <span>Remembered by {senderName || "Family"}</span>
              ) : (
                <span>
                  with love from{" "}
                  <span className="underline decoration-rose-400/50">
                    {senderName || "Yours"}
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Heartfelt Message Area */}
        <div className="relative z-10 pt-2 text-center">
          <p className="font-serif italic text-xs sm:text-sm leading-relaxed line-clamp-4 px-2 opacity-90 text-neutral-100">
            "{message || "You make every single day brighter, warmer, and filled with love."}"
          </p>

          {/* Venue address highlight for invite-cards */}
          {venueAddress && (
            <div className="mt-2 text-[10px] text-amber-200/90 font-medium truncate">
              📍 {venueAddress}
            </div>
          )}

          {/* Card watermark/footer mark */}
          <div className="mt-4 flex items-center justify-center space-x-1 text-[9px] tracking-widest uppercase opacity-40">
            <span>Memoir</span>
            <Heart className="h-2 w-2 fill-current" />
            <span>Keepsake</span>
          </div>
        </div>
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
}
