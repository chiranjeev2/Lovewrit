"use client";

import React from "react";
import { ClosingPrayerSceneConfig } from "@/types/scenes";
import { RotateCcw } from "lucide-react";

interface ClosingPrayerSceneProps {
  config: ClosingPrayerSceneConfig;
  onReplay: () => void;
  theme?: string;
}

export default function ClosingPrayerScene({
  config,
  onReplay,
}: ClosingPrayerSceneProps) {
  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-5 sm:p-6 text-center select-none overflow-y-auto">
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="pt-2 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-200/90 border border-amber-500/20 text-xs font-serif tracking-wide">
          <span>🕊️</span>
          <span>{config.traditionTag || "Sacred Blessing & Eternal Peace"}</span>
        </span>
      </div>

      {/* Centerpiece: Prayer & Remembrance */}
      <div className="my-auto py-4 z-10 flex flex-col items-center w-full">
        {/* Sacred Peaceful Symbol */}
        <div className="w-12 h-12 rounded-full bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-300 text-lg mb-4 shadow-lg">
          🕊️
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-wide mb-3">
          {config.title || "Rest in Eternal Grace"}
        </h2>

        <div className="p-5 sm:p-6 rounded-3xl bg-stone-900/70 border border-stone-800 shadow-xl max-w-md w-full">
          <p className="text-xs sm:text-sm text-stone-200 font-serif leading-relaxed italic whitespace-pre-line">
            &ldquo;{config.prayerText}&rdquo;
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex items-center justify-center w-full max-w-xs">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-700 bg-stone-900/90 hover:bg-stone-800 px-6 py-2.5 text-xs font-serif font-medium text-stone-300 hover:text-white transition cursor-pointer shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replay Sacred Tribute ↺</span>
          </button>
        </div>
      </div>

      {/* Respectful Dignified Footer (Zero branding) */}
      <div className="pb-16 sm:pb-20 text-[10px] text-stone-500 font-serif italic z-10 max-w-xs">
        Forever remembered • Forever cherished in our hearts
      </div>
    </div>
  );
}

