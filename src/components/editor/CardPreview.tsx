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
      case "heart":
        return "rounded-[40px] rotate-0 shadow-rose-500/20";
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

        {/* Central Photo Area */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-2">
          <div
            className={`relative w-44 h-44 sm:w-52 sm:h-52 overflow-hidden border-2 shadow-2xl transition-all duration-300 ${getShapeClass(
              photoShape
            )} ${theme.borderStyle}`}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Moment photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800/80 flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
                <Heart className="h-8 w-8 mb-2 opacity-50 text-rose-400 animate-pulse" />
                <span className="text-xs">Photo will appear here</span>
              </div>
            )}
          </div>

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
