"use client";

import React from "react";
import { SceneConfig, BalloonPopSceneConfig } from "@/types/scenes";
import { Heart, Sparkles } from "lucide-react";
import { ColorThemeKey } from "@/lib/templates-data";

interface FallbackStaticScrollProps {
  scenes: SceneConfig[];
  senderName: string;
  recipientName: string;
  letter: string;
  colorTheme?: ColorThemeKey;
  fontFamily?: string;
  guestName?: string | null;
}

export function FallbackStaticScroll({
  scenes,
  senderName,
  recipientName,
  letter,
  colorTheme = "rose",
  fontFamily = "serif",
  guestName,
}: FallbackStaticScrollProps) {
  const displayRecipient = guestName || recipientName;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white p-6 sm:p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-12 py-10">
        {/* Opener / Header */}
        <div className="text-center space-y-3 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs text-rose-300">
            <Sparkles className="h-3 w-3" />
            <span>A Special Message</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Dearest {displayRecipient}
          </h1>
          <p className="text-sm text-neutral-400">
            Written with heartfelt care from {senderName}
          </p>
        </div>

        {/* Dynamic Scenes Stack */}
        {scenes.map((scene) => {
          if (!scene.enabled) return null;

          if (scene.type === "balloon_pop") {
            const bp = scene as BalloonPopSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <div className="text-center">
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
                    Reasons in My Heart
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white mt-1">
                    {bp.title}
                  </h3>
                </div>
                <div className="space-y-3 pt-2">
                  {bp.reasons.map((r, i) => (
                    <div key={i} className="flex items-start space-x-3 rounded-2xl bg-black/40 p-3.5 border border-white/5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-300">
                        {i + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-serif italic text-neutral-200 leading-relaxed">
                        {r}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <h4 className="text-base font-serif font-bold text-rose-300">
                    {bp.completionTitle}
                  </h4>
                  <p className="text-xs text-neutral-400">{bp.completionSubtitle}</p>
                </div>
              </div>
            );
          }

          if (scene.type === "letter_unfold") {
            return (
              <div key={scene.id} className="rounded-3xl border border-rose-500/30 bg-black/60 p-6 sm:p-10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-serif font-bold text-white">The Letter</h3>
                  <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />
                </div>
                <p className="font-serif italic text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-neutral-200">
                  {letter}
                </p>
                <div className="text-right pt-4 border-t border-white/10">
                  <span className="text-xs font-serif italic text-neutral-400">With love,</span>
                  <div className="text-base font-serif font-bold text-rose-300 mt-1">{senderName}</div>
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Finale signoff */}
        <div className="text-center pt-8 border-t border-white/10 text-xs text-neutral-500">
          Crafted with love on Lovewrit • Preserved forever
        </div>
      </div>
    </div>
  );
}
