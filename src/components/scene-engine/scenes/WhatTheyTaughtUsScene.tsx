"use client";

import React from "react";
import { motion } from "framer-motion";
import { WhatTheyTaughtUsSceneConfig } from "@/types/scenes";
import { ArrowRight } from "lucide-react";

interface WhatTheyTaughtUsSceneProps {
  config: WhatTheyTaughtUsSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function WhatTheyTaughtUsScene({
  config,
  onContinue,
}: WhatTheyTaughtUsSceneProps) {
  const lessons = config.lessons || [];

  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-5 sm:p-6 text-center select-none overflow-y-auto">
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="pt-2 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-200/90 border border-amber-500/20 text-xs font-serif tracking-wide">
          <span>🌿</span>
          <span>Legacy of Values &amp; Wisdom</span>
        </span>
      </div>

      {/* Main Content */}
      <div className="my-auto py-3 z-10 flex flex-col items-center w-full">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-wide mb-1">
          {config.title || "What They Taught Us"}
        </h2>
        <p className="text-xs text-stone-400 font-serif italic mb-6 max-w-sm">
          {config.subtitle || "The lessons, warmth, and guiding light they left behind"}
        </p>

        {/* List of Lessons */}
        <div className="w-full space-y-2.5 max-w-md text-left">
          {lessons.map((lesson, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800/80 hover:border-amber-500/30 transition-all flex items-start gap-3 shadow-md"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-serif font-bold">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-stone-200 font-serif leading-relaxed">
                {lesson}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Closing Thought */}
        {config.closingThought && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 font-serif italic max-w-md leading-relaxed text-center shadow-inner">
            &ldquo;{config.closingThought}&rdquo;
          </div>
        )}

        {/* Advance Button */}
        <div className="mt-6 w-full max-w-xs">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onContinue}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 hover:from-stone-700 hover:to-stone-850 text-stone-200 font-serif font-semibold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-700/60"
          >
            <span>Read Condolences &amp; Memories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Sensitive Footer Quote */}
      <div className="pb-16 sm:pb-20 text-[10px] text-stone-500 font-serif italic z-10 max-w-xs">
        &ldquo;Their teachings live on in the choices we make and the love we give.&rdquo;
      </div>
    </div>
  );
}

