"use client";

import React from "react";
import { motion } from "framer-motion";
import { PersonalNoteSceneConfig } from "@/types/scenes";
import { Heart, ArrowRight } from "lucide-react";

interface PersonalNoteSceneProps {
  config: PersonalNoteSceneConfig;
  guestName?: string | null;
  recipientName?: string;
  onContinue: () => void;
  theme?: string;
}

export default function PersonalNoteScene({
  config,
  guestName,
  recipientName,
  onContinue,
}: PersonalNoteSceneProps) {
  const displayGuest = guestName || recipientName || "Cherished Guest";

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/95 backdrop-blur-md border border-rose-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium tracking-wide mb-3 shadow-xs">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>From Our Hearts</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || "Your Presence Means Everything"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-6 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Parchment-style personal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-gradient-to-b from-amber-50/40 via-rose-50/30 to-stone-50/60 border border-amber-200/70 rounded-2xl p-5 sm:p-6 mb-6 text-left shadow-inner relative"
        >
          <p className="text-xs font-serif font-semibold text-rose-800 uppercase tracking-wider mb-2">
            Dearest {displayGuest},
          </p>

          <p className="font-serif text-sm sm:text-base text-stone-800 leading-relaxed whitespace-pre-line mb-4">
            {config.noteText}
          </p>

          {config.warmClosing && (
            <div className="pt-3 border-t border-amber-200/60 text-right">
              <span className="font-serif italic text-xs text-stone-600 block">
                {config.warmClosing}
              </span>
            </div>
          )}
        </motion.div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 text-white font-medium text-sm shadow-md hover:shadow-amber-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>See Saved Seat &amp; RSVP</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
