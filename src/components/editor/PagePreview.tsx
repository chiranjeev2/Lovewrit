"use client";

import React, { useState, useRef } from "react";
import { COLOR_THEMES, ColorThemeKey } from "@/lib/templates-data";
import { Heart, Sparkles, Music, MapPin, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface PagePreviewProps {
  senderName: string;
  recipientName: string;
  occasion: string;
  letter: string;
  photoUrls: string[];
  colorTheme: ColorThemeKey;
  isProposal?: boolean;
  musicTrackName?: string;
  previewOnly?: boolean;
}

export default function PagePreview({
  senderName,
  recipientName,
  occasion,
  letter,
  photoUrls = [],
  colorTheme,
  isProposal = false,
  musicTrackName,
  previewOnly = false,
}: PagePreviewProps) {
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.rose;

  // Proposal interaction states
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDodged, setIsDodged] = useState(false);
  const [accepted, setAccepted] = useState(false);
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

    // Multi-stage confetti celebration
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

  const photos = photoUrls.length > 0 ? photoUrls : [
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
    "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
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
              A Memoir Experience
            </span>
            <h4 className="font-serif text-sm font-bold text-white">
              {occasion.toUpperCase()}
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
          To My Dearest {recipientName || "Love"}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Every Moment With You Is A Gift
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-neutral-300">
          Written with love by <span className="font-semibold text-white underline decoration-rose-400">{senderName || "Yours Always"}</span>
        </p>
      </div>

      {/* Photo Collage Montage */}
      <div className="relative z-10 my-10">
        <div className={`grid gap-4 ${photos.length === 1 ? "grid-cols-1 max-w-md mx-auto" : photos.length === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto"}`}>
          {photos.slice(0, 6).map((img, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl border ${theme.borderStyle} shadow-xl aspect-square transition duration-300 hover:scale-[1.02]`}
            >
              <img
                src={img}
                alt={`Moment ${i + 1}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                <span className="text-[11px] font-medium text-white/90">
                  Moment #{i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heartfelt Letter Section */}
      <div className="relative z-10 mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-xl shadow-2xl my-10">
        <div className="flex items-center space-x-2 text-rose-300 mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">
            Heartfelt Letter
          </span>
        </div>
        <p className="font-serif text-sm sm:text-base leading-relaxed text-neutral-100 whitespace-pre-wrap">
          {letter || "I wanted to take a moment to express what words often fail to capture. Thank you for bringing light, joy, and peace to my everyday life."}
        </p>
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
          <span>Forever Yours,</span>
          <span className="font-serif italic font-semibold text-white">
            {senderName || "Always"}
          </span>
        </div>
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
                Will you marry me?
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Choose carefully... but love only knows one answer!
              </p>

              {/* Action Buttons */}
              <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 min-h-[90px]">
                {/* YES Button */}
                <button
                  onClick={handleYes}
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition"
                >
                  YES! A Million Times Yes! 💍
                </button>

                {/* NO Button (dodges on hover and touch) */}
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
                    No
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
                THEY SAID YES! 💍🎉
              </h3>
              <p className="text-sm text-rose-200 max-w-sm mx-auto">
                Here's to beginning the greatest adventure of your lives together!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer watermark */}
      <div className="relative z-10 mt-12 text-center text-xs text-neutral-400">
        <p>Memoir • Personal Couple Moments</p>
      </div>
    </div>
  );
}

