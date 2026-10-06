"use client";

import React from "react";
import { Heart, RotateCcw, Share2, Sparkles } from "lucide-react";

interface FinaleSceneProps {
  title?: string;
  subtitle?: string;
  senderName: string;
  recipientName: string;
  onReplay: () => void;
  guestName?: string | null;
  isTribute?: boolean;
}

export function FinaleScene({
  title,
  subtitle,
  senderName,
  recipientName,
  onReplay,
  guestName,
  isTribute = false,
}: FinaleSceneProps) {
  const displayRecipient = guestName || recipientName;

  return (
    <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-between p-6 text-center select-none overflow-y-auto">
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="pt-8 sm:pt-4 z-10">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-rose-300 border border-white/10 mb-3">
          <Sparkles className="h-3 w-3" />
          <span>A Lasting Keepsake</span>
        </div>
      </div>

      {/* Center Emotional Culmination */}
      <div className="my-auto py-6 z-10 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-300 shadow-xl mb-4 animate-bounce">
          <Heart className="h-8 w-8 fill-rose-500 text-rose-400" />
        </div>

        <h2 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">
          {title || "Always In My Heart"}
        </h2>

        <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xs mx-auto mb-6 leading-relaxed">
          {subtitle || `Thank you, ${displayRecipient}, for taking the time to experience this message.`}
        </p>

        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 w-full text-xs text-neutral-300 space-y-1">
          <div className="font-serif italic">Crafted with wholehearted sincerity by</div>
          <div className="text-sm font-serif font-bold text-rose-300">{senderName}</div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex items-center space-x-3 w-full">
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95 shadow-md"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Replay Story ↺</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pb-16 sm:pb-20 text-[10px] text-neutral-500 z-10 font-serif">
        {isTribute ? "Forever preserved in quiet remembrance" : "Lovewrit Keepsakes • Forever preserved"}
      </div>
    </div>
  );
}

