"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DevotionalFinaleSceneConfig } from "@/types/scenes";
import { RotateCcw, Sparkles, Heart } from "lucide-react";

interface DevotionalFinaleSceneProps {
  config: DevotionalFinaleSceneConfig;
  onReplay?: () => void;
  theme?: string;
}

interface RitualMeta {
  title: string;
  actionPrompt: string;
  offeredText: string;
  symbol: string;
  glowColor: string;
  ringColor: string;
  offeringParticles: string[];
}

const RITUAL_DETAILS: Record<string, RitualMeta> = {
  diya_aarti: {
    title: "Maha Aarti & Deepam",
    actionPrompt: "Tap to offer the sacred Aarti flame",
    offeredText: "Aarti Offered with Devotion & Reverence 🪔",
    symbol: "🪔",
    glowColor: "bg-amber-500/20",
    ringColor: "border-amber-500/40 text-amber-300",
    offeringParticles: ["🌸", "🌼", "✨", "🪔", "🌺"],
  },
  flower_offering: {
    title: "Pushpanjali • Floral Offering",
    actionPrompt: "Tap to offer fragrant flowers",
    offeredText: "Pushpanjali Dedicated with Pure Heart 🌸",
    symbol: "🌸",
    glowColor: "bg-rose-500/20",
    ringColor: "border-rose-500/40 text-rose-300",
    offeringParticles: ["🌸", "🌹", "🌼", "✨", "🌺"],
  },
  shabad_ardas: {
    title: "Shabad & Ardas • Humble Supplication",
    actionPrompt: "Tap to offer your heartfelt Ardas",
    offeredText: "Ardas Accepted • Sarbat Da Bhala ੴ",
    symbol: "ੴ",
    glowColor: "bg-yellow-500/20",
    ringColor: "border-yellow-500/40 text-yellow-300",
    offeringParticles: ["✨", "💛", "🕊️", "🌾", "✨"],
  },
  dua_blessing: {
    title: "Dua & Barakah • Sacred Supplication",
    actionPrompt: "Tap to affirm Dua with Ameen",
    offeredText: "Ameen • May Allah Bless You with Barakah 🌙",
    symbol: "🌙",
    glowColor: "bg-emerald-500/20",
    ringColor: "border-emerald-500/40 text-emerald-300",
    offeringParticles: ["✨", "🌙", "⭐", "🌿", "✨"],
  },
  choral_benediction: {
    title: "Choral Benediction & Light of Peace",
    actionPrompt: "Tap to kindle the candle of peace",
    offeredText: "Peace & Grace Be Unto You Always 🕊️",
    symbol: "🕊️",
    glowColor: "bg-sky-500/20",
    ringColor: "border-sky-500/40 text-sky-300",
    offeringParticles: ["✨", "🕊️", "🕯️", "⭐", "✨"],
  },
  peace_candle: {
    title: "Sacred Flame of Peace",
    actionPrompt: "Tap to illuminate the sacred flame",
    offeredText: "Light Kindled with Love & Peace 🕯️",
    symbol: "🕯️",
    glowColor: "bg-amber-500/20",
    ringColor: "border-amber-500/40 text-amber-300",
    offeringParticles: ["✨", "🕯️", "💛", "⭐", "✨"],
  },
  gratitude_reflection: {
    title: "Universal Reflection of Gratitude",
    actionPrompt: "Tap to send peaceful thoughts",
    offeredText: "Radiating Peace, Compassion & Joy ✨",
    symbol: "✨",
    glowColor: "bg-teal-500/20",
    ringColor: "border-teal-500/40 text-teal-300",
    offeringParticles: ["✨", "🌸", "🌿", "💧", "✨"],
  },
  sacred_prayer: {
    title: "Universal Sacred Prayer",
    actionPrompt: "Tap to offer your silent prayer",
    offeredText: "Prayer Blessed with Divine Harmony 🕊️",
    symbol: "🕊️",
    glowColor: "bg-amber-500/20",
    ringColor: "border-amber-500/40 text-amber-300",
    offeringParticles: ["✨", "🕊️", "💛", "🌸", "✨"],
  },
};

export default function DevotionalFinaleScene({
  config,
  onReplay,
}: DevotionalFinaleSceneProps) {
  const [hasOffered, setHasOffered] = useState(false);
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([]);

  // Default ritual fallback based on faith if ritual not matched
  const ritualKey = config.ritualType || (
    config.faith === "hindu" ? "diya_aarti" :
    config.faith === "sikh" ? "shabad_ardas" :
    config.faith === "muslim" ? "dua_blessing" :
    config.faith === "christian" ? "choral_benediction" :
    config.faith === "secular" ? "gratitude_reflection" : "peace_candle"
  );

  const ritual = RITUAL_DETAILS[ritualKey] || RITUAL_DETAILS.peace_candle;

  const handleOffer = () => {
    if (!hasOffered) {
      setHasOffered(true);
    }
    // Generate celebratory spiritual particles
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      char: ritual.offeringParticles[i % ritual.offeringParticles.length],
      x: (Math.random() - 0.5) * 260,
      y: (Math.random() - 0.5) * 260 - 50,
    }));
    setParticles((prev) => [...prev.slice(-15), ...newParticles]);
  };

  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-4 sm:p-6 text-center select-none overflow-y-auto">
      {/* Background Radiance */}
      <div className={`absolute w-80 h-80 rounded-full ${ritual.glowColor} blur-3xl pointer-events-none -top-10 transition-all duration-1000 ${hasOffered ? "scale-125 opacity-80" : "scale-100 opacity-40"}`} />

      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-2 z-10"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-xs font-serif text-stone-300 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{ritual.title}</span>
        </span>
      </motion.div>

      {/* Centerpiece: Interactive Offering */}
      <div className="my-auto py-3 z-10 flex flex-col items-center w-full">
        {/* Main Interactive Ritual Button */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Animated Aura Rings when offered */}
          {hasOffered && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute w-36 h-36 rounded-full border border-amber-400/30 pointer-events-none"
            />
          )}

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleOffer}
            aria-label={ritual.actionPrompt}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-stone-800 to-stone-900 border-2 ${ritual.ringColor} shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative z-10`}
          >
            <span className="text-4xl sm:text-5xl select-none filter drop-shadow-md">
              {ritual.symbol}
            </span>
            <span className="text-[10px] font-serif text-stone-400 mt-1 uppercase tracking-wider">
              {hasOffered ? "Blessed" : "Touch"}
            </span>
          </motion.button>

          {/* Floating Particles Animation */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="absolute text-xl pointer-events-none"
              >
                {p.char}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action instruction or Confirmation */}
        <motion.p
          key={hasOffered ? "offered" : "prompt"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs sm:text-sm font-serif text-stone-300 max-w-xs mb-3"
        >
          {hasOffered ? ritual.offeredText : ritual.actionPrompt}
        </motion.p>

        {/* Closing Blessing Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-3xl bg-stone-900/80 border border-stone-800 shadow-xl max-w-md w-full backdrop-blur-sm"
        >
          <p className="text-sm sm:text-base text-stone-100 font-serif leading-relaxed italic">
            &ldquo;{config.blessingWish}&rdquo;
          </p>
        </motion.div>

        {/* Replay Controls */}
        {onReplay && (
          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={onReplay}
              className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/90 hover:bg-stone-800 px-6 py-2.5 text-xs font-serif font-medium text-stone-300 hover:text-white transition cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Replay Sacred Journey ↺</span>
            </button>
          </div>
        )}
      </div>

      {/* Dignified Footer */}
      <div className="pb-16 sm:pb-20 text-[10px] text-stone-500 font-serif italic z-10 max-w-xs">
        Blessed with devotion • Shared with peace and grace
      </div>
    </div>
  );
}
