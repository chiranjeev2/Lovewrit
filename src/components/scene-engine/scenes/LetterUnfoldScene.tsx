"use client";

import React, { useRef, useState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import { ColorThemeKey } from "@/lib/templates-data";

interface LetterUnfoldSceneProps {
  title?: string;
  subtitle?: string;
  senderName: string;
  recipientName: string;
  letter: string;
  colorTheme?: ColorThemeKey;
  fontFamily?: string;
  onScrolledToEnd?: () => void;
  onContinue?: () => void;
}

export function LetterUnfoldScene({
  title,
  senderName,
  recipientName,
  letter,
  colorTheme = "rose",
  fontFamily = "serif",
  onScrolledToEnd,
  onContinue,
}: LetterUnfoldSceneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledEnd, setHasScrolledEnd] = useState(false);

  const isScroll = colorTheme === "scroll";
  const isVintageParchment = colorTheme === "vintage_parchment";
  const isParchment = isScroll || isVintageParchment;
  const isModern = colorTheme === "modern";

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      if (!hasScrolledEnd) {
        setHasScrolledEnd(true);
        if (onScrolledToEnd) onScrolledToEnd();
      }
    }
  };

  const getFontClass = () => {
    switch (fontFamily) {
      case "handwriting":
        return "font-handwriting text-base sm:text-lg";
      case "sans":
        return "font-sans text-xs sm:text-sm";
      case "serif":
      default:
        return "font-serif italic text-xs sm:text-sm";
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
      {/* Top Header Label */}
      <div className="text-center pt-8 sm:pt-4 z-10 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-400 block mb-0.5">
          {isParchment ? "A Sacred Inscribed Letter" : "From My Heart to Yours"}
        </span>
        <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
          {title || `Dear ${recipientName}`}
        </h2>
      </div>

      {/* Scrollable Letter Document Container (Capped viewport with inner smooth scroll) */}
      <div className="relative w-full max-w-lg my-auto h-[62dvh] sm:h-[65dvh] flex flex-col items-center">
        {/* Top Vignette Fade */}
        <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-neutral-950 to-transparent pointer-events-none z-20" />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`relative w-full h-full rounded-3xl p-6 sm:p-8 overflow-y-auto shadow-2xl transition-all ${
            isScroll
              ? "border-2 border-[#8c6227]/90 text-[#2a170a]"
              : isVintageParchment
              ? "border-2 border-[#a0743b]/90 text-[#2a170a]"
              : isModern
              ? "border-2 border-slate-600/70 bg-neutral-900/95 text-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]"
              : "border border-white/10 bg-white/5 backdrop-blur-xl text-neutral-100"
          }`}
          style={
            isScroll
              ? {
                  background:
                    "radial-gradient(ellipse at 50% 45%, #fcf7ec 0%, #f5e8cb 45%, #e9d5a5 75%, #cca76e 100%)",
                  boxShadow:
                    "inset 0 0 45px rgba(95, 52, 14, 0.28), 0 25px 50px -12px rgba(28, 16, 7, 0.5)",
                }
              : isVintageParchment
              ? {
                  background:
                    "radial-gradient(ellipse at 50% 50%, #fdfaf2 0%, #f7f0df 55%, #ecdcb9 100%)",
                  boxShadow:
                    "inset 0 0 35px rgba(110, 65, 20, 0.18), 0 25px 50px -12px rgba(28, 16, 7, 0.45)",
                }
              : undefined
          }
        >
          {/* Scroll Wooden Rods for Authentic Scroll Theme */}
          {isScroll && (
            <div className="sticky top-0 -mt-6 -mx-6 sm:-mx-8 mb-4 h-2.5 bg-gradient-to-r from-[#45270f] via-[#c49b52] to-[#45270f] rounded-b-md shadow-md border-b border-[#2e1706]/70 z-10 flex items-center justify-center">
              <div className="w-16 h-0.5 bg-amber-200/50 rounded-full blur-[0.5px]" />
            </div>
          )}

          {/* Letter Inner Seal / Header Motif */}
          <div className="flex items-center justify-between mb-4 border-b pb-3 border-current/15">
            <div className="flex items-center space-x-1.5 text-xs font-serif font-semibold">
              <span>❦</span>
              <span>For {recipientName}</span>
            </div>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-rose-400/40"
              style={{
                background: "radial-gradient(circle at 35% 30%, #e11d48 0%, #991b1b 50%, #4c0519 100%)",
              }}
            >
              <Heart className="h-2.5 w-2.5 text-amber-200 fill-amber-200" />
            </div>
          </div>

          {/* Letter Body Text */}
          <p className={`${getFontClass()} leading-relaxed whitespace-pre-wrap select-text`}>
            {letter || "I wanted to write down what I could never put into words..."}
          </p>

          {/* Signoff */}
          <div className="mt-8 pt-4 border-t border-current/15 flex flex-col items-end">
            <span className="text-xs font-serif italic opacity-75">With all my heart,</span>
            <span className="text-sm font-serif font-bold underline decoration-current/40 mt-1">
              {senderName || "Always"}
            </span>
          </div>

          {/* Bottom Wooden Rod for Authentic Scroll Theme */}
          {isScroll && (
            <div className="sticky bottom-0 -mb-6 -mx-6 sm:-mx-8 mt-6 h-2.5 bg-gradient-to-r from-[#45270f] via-[#c49b52] to-[#45270f] rounded-t-md shadow-md border-t border-[#2e1706]/70 z-10 flex items-center justify-center">
              <div className="w-16 h-0.5 bg-amber-200/50 rounded-full blur-[0.5px]" />
            </div>
          )}
        </div>

        {/* Bottom Vignette Fade */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none z-20" />
      </div>

      {/* Bottom Scroll Guide & Continue Button */}
      <div className="pb-16 sm:pb-20 text-center z-10 shrink-0 flex flex-col items-center gap-2">
        <span className="text-[11px] text-neutral-400 font-light">
          {hasScrolledEnd ? "✓ Letter read to completion" : "↓ Scroll down to read complete letter"}
        </span>
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="px-6 py-2 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-medium shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Continue to Finale</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

