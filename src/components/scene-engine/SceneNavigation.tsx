"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, FastForward } from "lucide-react";
import { ColorThemeKey } from "@/lib/templates-data";

function getNavigationThemeStyles(theme?: ColorThemeKey) {
  switch (theme) {
    case "emerald":
      return {
        activeDot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
        passedDot: "bg-emerald-300/60",
        button: "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 shadow-emerald-500/25 ring-2 ring-emerald-300/30",
      };
    case "midnight":
      return {
        activeDot: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.7)]",
        passedDot: "bg-indigo-300/60",
        button: "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:brightness-110 shadow-indigo-500/25 ring-2 ring-indigo-300/30",
      };
    case "sunset":
      return {
        activeDot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]",
        passedDot: "bg-amber-300/60",
        button: "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:brightness-110 shadow-amber-500/25 ring-2 ring-amber-300/30",
      };
    case "champagne":
      return {
        activeDot: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.7)]",
        passedDot: "bg-yellow-300/60",
        button: "bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 hover:brightness-110 shadow-yellow-500/25 ring-2 ring-yellow-300/30",
      };
    case "serene":
      return {
        activeDot: "bg-stone-300 shadow-[0_0_8px_rgba(214,211,209,0.7)]",
        passedDot: "bg-stone-400/60",
        button: "bg-gradient-to-r from-stone-700 via-neutral-700 to-stone-800 hover:brightness-110 shadow-stone-500/25 ring-2 ring-stone-300/30",
      };
    case "festive":
      return {
        activeDot: "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.7)]",
        passedDot: "bg-pink-300/60",
        button: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 shadow-pink-500/25 ring-2 ring-pink-300/30",
      };
    case "scroll":
    case "vintage_parchment":
      return {
        activeDot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]",
        passedDot: "bg-amber-600/60",
        button: "bg-gradient-to-r from-[#8c6227] via-[#a0743b] to-[#714516] hover:brightness-110 shadow-amber-950/40 ring-2 ring-amber-400/30",
      };
    case "modern":
    case "modern_gold":
      return {
        activeDot: "bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.7)]",
        passedDot: "bg-slate-400/60",
        button: "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 hover:brightness-110 shadow-slate-900/50 ring-2 ring-slate-400/30",
      };
    case "rose":
    default:
      return {
        activeDot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]",
        passedDot: "bg-rose-300/60",
        button: "bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:brightness-110 shadow-rose-500/25 ring-2 ring-white/20",
      };
  }
}

interface SceneNavigationProps {
  currentIndex: number;
  totalScenes: number;
  canAdvance: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkipToEnd: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isInteractionGated?: boolean;
  onSkipInteraction?: () => void;
  isLastScene?: boolean;
  nextButtonLabel?: string;
  isOpener?: boolean;
  colorTheme?: ColorThemeKey;
}

export function SceneNavigation({
  currentIndex,
  totalScenes,
  canAdvance,
  onNext,
  onPrev,
  onSkipToEnd,
  isMuted,
  onToggleMute,
  isInteractionGated = false,
  onSkipInteraction,
  isLastScene = false,
  nextButtonLabel,
  isOpener = false,
  colorTheme = "rose",
}: SceneNavigationProps) {
  const navStyles = getNavigationThemeStyles(colorTheme);
  // If opener scene, top navigation is hidden or minimal until opened to prevent distraction
  return (
    <>
      {/* Top Floating Control Bar */}
      <header className="absolute top-0 inset-x-0 z-50 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        {/* Left: Back Button */}
        <div className="pointer-events-auto">
          {currentIndex > 0 && !isOpener && (
            <button
              type="button"
              onClick={onPrev}
              className="flex items-center space-x-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md px-3.5 py-2 min-h-[44px] text-xs font-medium text-white/90 border border-white/10 transition shadow-lg active:scale-95"
              aria-label="Previous scene"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
        </div>

        {/* Center: Stepped Dots & Scene Counter */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg min-h-[36px]">
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: totalScenes }).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? `w-5 ${navStyles.activeDot}`
                    : idx < currentIndex
                    ? `w-1.5 ${navStyles.passedDot}`
                    : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-white/70 pl-1 border-l border-white/15">
            {currentIndex + 1}/{totalScenes}
          </span>
        </div>

        {/* Right: Audio Mute & Skip to End */}
        <div className="pointer-events-auto flex items-center space-x-2">
          {currentIndex < totalScenes - 1 && !isOpener && (
            <button
              type="button"
              onClick={onSkipToEnd}
              className="flex items-center space-x-1 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md px-3 py-2 min-h-[44px] text-xs text-white/75 hover:text-white border border-white/10 transition shadow-lg"
              title="Skip to finale"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/90 border border-white/10 transition shadow-lg active:scale-95"
            title={isMuted ? "Unmute music" : "Mute music"}
            aria-label={isMuted ? "Unmute music" : "Mute music"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white/60" />
            ) : (
              <Volume2 className="h-4 w-4 text-rose-300 animate-pulse" />
            )}
          </button>
        </div>
      </header>

      {/* Bottom Floating Advance Controls */}
      {!isOpener && !isLastScene && (
        <footer className="absolute bottom-0 inset-x-0 z-50 p-4 sm:p-6 flex flex-col items-center pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center space-y-1.5">
            {isInteractionGated && onSkipInteraction && (
              <button
                type="button"
                onClick={onSkipInteraction}
                className="text-[11px] font-medium text-white/60 hover:text-white/90 underline decoration-white/30 transition pb-1 min-h-[44px] flex items-center justify-center px-4"
              >
                Skip interaction →
              </button>
            )}

            <button
              type="button"
              disabled={!canAdvance}
              onClick={onNext}
              className={`inline-flex items-center space-x-2 rounded-full px-6 py-2.5 min-h-[44px] text-sm font-semibold transition-all shadow-xl active:scale-95 ${
                canAdvance
                  ? `${navStyles.button} text-white`
                  : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
              }`}
            >
              <span>{nextButtonLabel || "Continue"}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      )}
    </>
  );
}

