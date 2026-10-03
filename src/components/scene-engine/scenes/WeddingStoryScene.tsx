"use client";

import React from "react";
import { motion } from "framer-motion";
import { WeddingStorySceneConfig } from "@/types/scenes";
import { Sparkles, Heart, ArrowRight } from "lucide-react";

interface WeddingStorySceneProps {
  config: WeddingStorySceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function WeddingStoryScene({
  config,
  onContinue,
}: WeddingStorySceneProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/95 backdrop-blur-md border border-amber-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft golden / champagne aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Faith / Auspicious Tag */}
        {config.faithTag && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300/80 text-xs font-serif font-medium tracking-wide mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{config.faithTag}</span>
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || "Our Story"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-5 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Couple Photo */}
        {config.photoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-4 border-amber-100/70 mb-5 relative group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.photoUrl}
              alt="The Couple"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        )}

        {/* Story Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 sm:p-5 text-stone-800 font-serif leading-relaxed text-sm sm:text-base text-left max-h-48 overflow-y-auto mb-4 shadow-inner"
        >
          <p className="whitespace-pre-line">{config.coupleStory}</p>
        </motion.div>

        {/* Devotional Verse Layer */}
        {config.verseText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-50/80 border border-amber-200/60 mb-6"
          >
            <p className="text-xs font-serif italic text-amber-900/90 leading-relaxed">
              &ldquo;{config.verseText}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 text-white font-medium text-sm shadow-md hover:shadow-amber-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>View Event Details</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
