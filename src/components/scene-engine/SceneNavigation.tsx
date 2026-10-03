"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, FastForward } from "lucide-react";

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
}: SceneNavigationProps) {
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
              className="flex items-center space-x-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-white/90 border border-white/10 transition shadow-lg active:scale-95"
              aria-label="Previous scene"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
        </div>

        {/* Center: Stepped Dots & Scene Counter */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: totalScenes }).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-5 bg-rose-400"
                    : idx < currentIndex
                    ? "w-1.5 bg-rose-300/60"
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
              className="flex items-center space-x-1 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md px-3 py-1.5 text-xs text-white/75 hover:text-white border border-white/10 transition shadow-lg"
              title="Skip to finale"
            >
              <FastForward className="h-3 w-3" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/90 border border-white/10 transition shadow-lg active:scale-95"
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
                className="text-[11px] font-medium text-white/60 hover:text-white/90 underline decoration-white/30 transition pb-1"
              >
                Skip interaction →
              </button>
            )}

            <button
              type="button"
              disabled={!canAdvance}
              onClick={onNext}
              className={`inline-flex items-center space-x-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all shadow-xl active:scale-95 ${
                canAdvance
                  ? "bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 text-white hover:brightness-110 shadow-rose-500/25 ring-2 ring-white/20"
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

