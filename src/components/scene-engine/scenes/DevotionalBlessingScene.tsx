"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DevotionalBlessingSceneConfig } from "@/types/scenes";
import { BookOpen, Copy, Check, Sparkles } from "lucide-react";

interface DevotionalBlessingSceneProps {
  config: DevotionalBlessingSceneConfig;
  onNext?: () => void;
  onPrev?: () => void;
  theme?: string;
}

const FAITH_EMBLEMS: Record<string, { symbol: string; label: string; accentColor: string; bgGlow: string }> = {
  hindu: {
    symbol: "ॐ",
    label: "Sanatana Dharma • Sacred Invocations",
    accentColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    bgGlow: "bg-amber-500/15",
  },
  sikh: {
    symbol: "ੴ",
    label: "Gurmat • Sacred Gurbani Shabad",
    accentColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    bgGlow: "bg-yellow-500/15",
  },
  muslim: {
    symbol: "🌙",
    label: "Al-Quran Al-Kareem • Mubarak Ayat & Dua",
    accentColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    bgGlow: "bg-emerald-500/15",
  },
  christian: {
    symbol: "🕊️",
    label: "Holy Scripture • Grace & Benediction",
    accentColor: "text-sky-300 border-sky-500/30 bg-sky-500/10",
    bgGlow: "bg-sky-500/15",
  },
  secular: {
    symbol: "✨",
    label: "Universal Reflection • Words of Peace",
    accentColor: "text-teal-300 border-teal-500/30 bg-teal-500/10",
    bgGlow: "bg-teal-500/15",
  },
  general: {
    symbol: "🕊️",
    label: "Sacred Blessing & Divine Grace",
    accentColor: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    bgGlow: "bg-amber-500/15",
  },
};

export default function DevotionalBlessingScene({
  config,
  theme = "gold",
}: DevotionalBlessingSceneProps) {
  const [copied, setCopied] = useState(false);
  const faithMeta = FAITH_EMBLEMS[config.faith || "general"] || FAITH_EMBLEMS.general;

  const handleCopy = () => {
    const textToCopy = `${config.verseTitle ? config.verseTitle + "\n" : ""}${config.sacredText}\n\n${
      config.translationOrMeaning ? "Meaning: " + config.translationOrMeaning + "\n" : ""
    }${config.sourceCitation ? "— " + config.sourceCitation : ""}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-4 sm:p-6 text-center select-none overflow-y-auto">
      {/* Background Radiance */}
      <div className={`absolute w-80 h-80 rounded-full ${faithMeta.bgGlow} blur-3xl pointer-events-none -top-10 animate-pulse`} />

      {/* Faith Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-2 z-10"
      >
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-serif tracking-wide shadow-sm ${faithMeta.accentColor}`}
        >
          <span className="text-sm">{faithMeta.symbol}</span>
          <span>{faithMeta.label}</span>
        </span>
      </motion.div>

      {/* Centerpiece: Scripture & Contemplation */}
      <div className="my-auto py-3 z-10 flex flex-col items-center w-full">
        {/* Emblem Medallion */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-full bg-stone-900/90 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl mb-4 shadow-xl"
        >
          {faithMeta.symbol}
        </motion.div>

        {/* Verse Title */}
        {config.verseTitle && (
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl font-serif font-bold text-stone-100 tracking-wide mb-3"
          >
            {config.verseTitle}
          </motion.h2>
        )}

        {/* Sacred Verse Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-3xl bg-stone-900/80 border border-stone-700/80 shadow-2xl max-w-md w-full relative backdrop-blur-sm"
        >
          {/* Sacred Scripture Text */}
          <div className="text-stone-100 font-serif leading-relaxed text-base sm:text-lg whitespace-pre-line tracking-wide font-medium">
            {config.sacredText}
          </div>

          {/* Transliteration if available */}
          {config.transliteration && (
            <div className="mt-3 pt-3 border-t border-stone-800 text-xs sm:text-sm text-stone-400 font-sans italic leading-relaxed">
              {config.transliteration}
            </div>
          )}

          {/* Translation / Sacred Meaning */}
          {config.translationOrMeaning && (
            <div className="mt-4 pt-3 border-t border-stone-800/80 text-xs sm:text-sm text-amber-200/90 font-serif leading-relaxed">
              <span className="text-[10px] tracking-widest uppercase block text-stone-400 font-sans mb-1 font-semibold">
                Meaning & Reflection
              </span>
              &ldquo;{config.translationOrMeaning}&rdquo;
            </div>
          )}

          {/* Source Citation */}
          {config.sourceCitation && (
            <div className="mt-3 text-[11px] text-stone-400 font-serif tracking-wide italic">
              — {config.sourceCitation}
            </div>
          )}

          {/* Copy Verse Button */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800/70 hover:bg-stone-700 text-[11px] text-stone-300 hover:text-white transition cursor-pointer border border-stone-700/50"
              title="Copy sacred verse"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-stone-400" />
                  <span>Copy Verse</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Gentle Contemplation Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pb-16 sm:pb-20 text-[11px] text-stone-400 font-serif italic z-10 max-w-xs"
      >
        <span>Swipe or tap to proceed to event significance</span>
      </motion.div>
    </div>
  );
}
