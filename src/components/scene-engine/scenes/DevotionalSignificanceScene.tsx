"use client";

import React from "react";
import { motion } from "framer-motion";
import { DevotionalSignificanceSceneConfig } from "@/types/scenes";
import { Calendar, Clock, MapPin, Sparkles, HeartHandshake, Info } from "lucide-react";

interface DevotionalSignificanceSceneProps {
  config: DevotionalSignificanceSceneConfig;
  onNext?: () => void;
  onPrev?: () => void;
  theme?: string;
}

const FAITH_ACCENTS: Record<string, { badge: string; border: string; glow: string; icon: string }> = {
  hindu: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    border: "border-amber-500/30",
    glow: "bg-amber-500/10",
    icon: "🪔",
  },
  sikh: {
    badge: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    border: "border-yellow-500/30",
    glow: "bg-yellow-500/10",
    icon: "ੴ",
  },
  muslim: {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    border: "border-emerald-500/30",
    glow: "bg-emerald-500/10",
    icon: "🌙",
  },
  christian: {
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    border: "border-sky-500/30",
    glow: "bg-sky-500/10",
    icon: "🕊️",
  },
  secular: {
    badge: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    border: "border-teal-500/30",
    glow: "bg-teal-500/10",
    icon: "✨",
  },
  general: {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    border: "border-amber-500/30",
    glow: "bg-amber-500/10",
    icon: "🕊️",
  },
};

export default function DevotionalSignificanceScene({
  config,
}: DevotionalSignificanceSceneProps) {
  const accent = FAITH_ACCENTS[config.faith || "general"] || FAITH_ACCENTS.general;

  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-4 sm:p-6 text-center select-none overflow-y-auto">
      {/* Background Soft Glow */}
      <div className={`absolute w-80 h-80 rounded-full ${accent.glow} blur-3xl pointer-events-none -top-10`} />

      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-2 z-10"
      >
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-serif tracking-wide ${accent.badge}`}>
          <span>{accent.icon}</span>
          <span>Spiritual Significance & Schedule</span>
        </span>
      </motion.div>

      {/* Main Content Area */}
      <div className="my-auto py-3 z-10 flex flex-col items-center w-full gap-4">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl sm:text-2xl font-serif font-bold text-stone-100 tracking-wide"
        >
          {config.significanceTitle || "The Spiritual Significance"}
        </motion.h2>

        {/* Story / Occasion Meaning Container */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-5 rounded-3xl bg-stone-900/80 border border-stone-800 shadow-xl max-w-md w-full backdrop-blur-sm text-left"
        >
          <p className="text-xs sm:text-sm text-stone-200 font-serif leading-relaxed whitespace-pre-line">
            {config.storyText}
          </p>

          {/* Traditions & Rituals Observed */}
          {config.traditions && config.traditions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-800">
              <span className="text-[10px] tracking-wider uppercase font-sans font-semibold text-stone-400 block mb-2">
                Order of Sacred Observances
              </span>
              <ul className="space-y-1.5">
                {config.traditions.map((tradition, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-stone-300 font-serif">
                    <span className="text-amber-400 text-xs mt-0.5">✦</span>
                    <span>{tradition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Etiquette & Customs Note (e.g. head covering, modest attire) */}
          {config.etiquetteNote && (
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-start gap-2 text-[11px] text-amber-200/90 font-serif bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/20">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="font-semibold block font-sans uppercase text-[9px] tracking-wider text-amber-300">
                  Respectful Etiquette
                </span>
                <span>{config.etiquetteNote}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Date, Time & Venue Details (if provided) */}
        {(config.eventDate || config.venueName) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 max-w-md w-full text-left space-y-2 text-xs"
          >
            {config.eventDate && (
              <div className="flex items-center gap-2 text-stone-200 font-serif">
                <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>{config.eventDate}</span>
                {config.eventTime && <span className="text-stone-400">• {config.eventTime}</span>}
              </div>
            )}
            {config.venueName && (
              <div className="flex items-start gap-2 text-stone-200 font-serif">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-100">{config.venueName}</span>
                  {config.venueAddress && <span className="text-stone-400 text-[11px] block">{config.venueAddress}</span>}
                </div>
              </div>
            )}
            {config.venueMapUrl && (
              <div className="pt-2 text-right">
                <a
                  href={config.venueMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-sans font-medium text-amber-400 hover:text-amber-300 underline"
                >
                  <span>Open Directions in Maps ↗</span>
                </a>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Gentle Footer */}
      <div className="pb-16 sm:pb-20 text-[11px] text-stone-400 font-serif italic z-10 max-w-xs">
        Swipe or tap to participate in the sacred offering
      </div>
    </div>
  );
}
