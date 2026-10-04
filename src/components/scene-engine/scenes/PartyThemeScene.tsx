"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PartyThemeSceneConfig } from "@/types/scenes";
import { Sparkles, Shirt, PartyPopper, CheckCircle2, ArrowRight } from "lucide-react";
import { ImageLightboxModal } from "@/components/shared/ImageLightboxModal";

interface PartyThemeSceneProps {
  config: PartyThemeSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function PartyThemeScene({
  config,
  onContinue,
}: PartyThemeSceneProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/95 backdrop-blur-md border border-pink-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft decorative background glows */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-pink-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Upbeat celebration pill */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-xs font-semibold tracking-wide mb-3 shadow-xs"
        >
          <PartyPopper className="w-3.5 h-3.5 text-pink-600" />
          <span>Party Theme &amp; Highlights</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || "The Vibe & Dress Code"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-5 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Theme & Dress Code Highlight Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {config.partyTheme && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/70 rounded-2xl p-4 flex items-center gap-3 text-left shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block">
                  Party Theme
                </span>
                <p className="font-serif font-bold text-stone-800 text-sm truncate">
                  {config.partyTheme}
                </p>
              </div>
            </motion.div>
          )}

          {config.dressCode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/70 rounded-2xl p-4 flex items-center gap-3 text-left shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Shirt className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Dress Code
                </span>
                <p className="font-sans font-medium text-stone-800 text-xs line-clamp-2">
                  {config.dressCode}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Optional Moodboard Photo */}
        {config.photoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            title="Click to zoom in"
            className="w-full max-w-sm aspect-[16/9] rounded-2xl overflow-hidden shadow-md border-4 border-white mb-5 relative group cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.photoUrl}
              alt="Party Theme Moodboard"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3">
              <span className="text-white text-xs font-medium tracking-wide">
                ✦ Party Inspiration Moodboard
              </span>
            </div>
          </motion.div>
        )}

        {/* Upbeat Story / Host Note */}
        {config.storyText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="w-full bg-stone-50 border border-stone-200/70 rounded-2xl p-4 mb-4 text-stone-700 font-sans text-xs sm:text-sm text-left leading-relaxed shadow-xs"
          >
            <p className="whitespace-pre-line">{config.storyText}</p>
          </motion.div>
        )}

        {/* Party Highlights Checklist */}
        {config.highlights && config.highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-pink-50/50 border border-pink-200/60 rounded-2xl p-4 mb-6 text-left shadow-xs space-y-2"
          >
            <span className="text-[10px] font-bold text-pink-800 uppercase tracking-wider block">
              What We Have Planned
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {config.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 text-white font-medium text-sm shadow-md hover:shadow-pink-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>See Venue &amp; Schedule</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Lightbox Modal */}
      {config.photoUrl && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          photos={[{ src: config.photoUrl, alt: "Party Theme Moodboard" }]}
          initialIndex={0}
        />
      )}
    </div>
  );
}
