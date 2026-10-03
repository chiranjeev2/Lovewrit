"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Heart, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface BalloonPopSceneProps {
  title: string;
  subtitle?: string;
  reasons: string[];
  completionTitle?: string;
  completionSubtitle?: string;
  onComplete: () => void;
}

const BALLOON_COLORS = [
  { bg: "from-rose-400 to-rose-600", border: "border-rose-300", shadow: "shadow-rose-500/30" },
  { bg: "from-amber-300 to-amber-500", border: "border-amber-200", shadow: "shadow-amber-500/30" },
  { bg: "from-pink-400 to-pink-600", border: "border-pink-300", shadow: "shadow-pink-500/30" },
  { bg: "from-purple-400 to-purple-600", border: "border-purple-300", shadow: "shadow-purple-500/30" },
  { bg: "from-rose-500 to-red-600", border: "border-rose-400", shadow: "shadow-rose-600/30" },
];

export function BalloonPopScene({
  title,
  subtitle,
  reasons,
  completionTitle = "I am so sorry 😞",
  completionSubtitle = "Every reason here is why you mean the world to me.",
  onComplete,
}: BalloonPopSceneProps) {
  // Ensure we have at least 5 reasons (fallback gracefully)
  const activeReasons = reasons.length >= 5 ? reasons.slice(0, 5) : [
    ...reasons,
    ...[
      "I deeply regret how my words made you feel.",
      "Our bond is more precious to me than any argument.",
      "You have always shown me kindness and grace.",
      "I miss the laughter and peace we share.",
      "I promise to listen and rebuild our trust.",
    ].slice(reasons.length),
  ];

  const [poppedIndices, setPoppedIndices] = useState<number[]>([]);
  const [activeReasonIndex, setActiveReasonIndex] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const handlePop = (index: number) => {
    if (poppedIndices.includes(index)) return;

    // Trigger local micro-confetti burst
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#f43f5e", "#fb7185", "#fde047", "#c084fc"],
      });
    } catch {
      // Audio or canvas fallback
    }

    const nextPopped = [...poppedIndices, index];
    setPoppedIndices(nextPopped);
    setActiveReasonIndex(index);

    if (nextPopped.length === activeReasons.length) {
      setTimeout(() => {
        setIsFinished(true);
        onComplete();
      }, 700);
    }
  };

  return (
    <div className="relative w-full h-full max-w-xl mx-auto flex flex-col justify-between p-5 sm:p-8 select-none overflow-y-auto">
      {/* Scene Header */}
      <div className="text-center pt-8 sm:pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-rose-400 block mb-1">
          Interactive Apology • {poppedIndices.length}/5 Unveiled
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
          {title || "5 Reasons I Am Asking For Your Forgiveness"}
        </h2>
        <p className="text-xs text-neutral-300 max-w-sm mx-auto mt-1">
          {subtitle || "Tap each floating balloon to reveal what is truly in my heart"}
        </p>
      </div>

      {/* Floating Balloons Cluster */}
      <div className="my-auto py-4 flex flex-col items-center justify-center">
        {!isFinished ? (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-md">
            {activeReasons.map((_, idx) => {
              const isPopped = poppedIndices.includes(idx);
              const color = BALLOON_COLORS[idx % BALLOON_COLORS.length];

              return (
                <div key={idx} className="relative flex flex-col items-center">
                  <AnimatePresence>
                    {!isPopped ? (
                      <motion.button
                        type="button"
                        onClick={() => handlePop(idx)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          duration: 3 + (idx % 3) * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className={`relative flex flex-col items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-[50%] bg-gradient-to-br ${color.bg} border ${color.border} shadow-lg ${color.shadow} cursor-pointer group focus:outline-none`}
                        aria-label={`Tap to pop balloon ${idx + 1}`}
                      >
                        {/* 3D Balloon Shine */}
                        <div className="absolute top-2 left-2.5 w-4 h-6 rounded-full bg-white/40 blur-[1px] rotate-[-25deg]" />
                        <span className="text-base sm:text-lg font-bold text-white drop-shadow-sm">
                          {idx + 1}
                        </span>
                        {/* Knot & String */}
                        <div className="absolute -bottom-1 w-2.5 h-1.5 bg-neutral-800 rounded-b-sm" />
                        <div className="absolute -bottom-5 w-0.5 h-4 bg-neutral-400/50" />
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center justify-center w-16 h-20 sm:w-20 sm:h-24"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          /* Emotional Pause / Completion Banner */
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center rounded-3xl border border-rose-500/40 bg-gradient-to-b from-rose-950/60 via-neutral-900/90 to-black/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 mb-3 border border-rose-500/40 shadow-lg">
              <Heart className="h-7 w-7 fill-rose-500 text-rose-400 animate-pulse" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
              {completionTitle}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-sm mx-auto leading-relaxed">
              {completionSubtitle}
            </p>
            <div className="mt-4 inline-flex items-center space-x-1.5 text-xs text-rose-300 font-medium bg-rose-500/10 px-3.5 py-1.5 rounded-full border border-rose-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Tap Continue below to read the full letter</span>
            </div>
          </motion.div>
        )}

        {/* Revealed Reason Card Box */}
        {activeReasonIndex !== null && !isFinished && (
          <motion.div
            key={activeReasonIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mt-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-4 text-center shadow-xl"
          >
            <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
              Reason #{activeReasonIndex + 1}
            </span>
            <p className="text-sm font-serif italic text-white leading-relaxed">
              &ldquo;{activeReasons[activeReasonIndex]}&rdquo;
            </p>
          </motion.div>
        )}
      </div>

      {/* Popped Progress Summary dots */}
      <div className="pb-16 sm:pb-20 text-center">
        <div className="inline-flex items-center space-x-1.5">
          {activeReasons.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                poppedIndices.includes(i) ? "w-6 bg-rose-400" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

