"use client";

import React from "react";
import { motion } from "framer-motion";
import { GodhbharaiBlessingsSceneConfig } from "@/types/scenes";
import { Sparkles, Heart, Flower2, ArrowRight } from "lucide-react";

interface GodhbharaiBlessingsSceneProps {
  config: GodhbharaiBlessingsSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function GodhbharaiBlessingsScene({
  config,
  onContinue,
}: GodhbharaiBlessingsSceneProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Auspicious Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium tracking-wide mb-3 shadow-sm"
        >
          <Flower2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Shubh Godhbharai • Sacred Blessings</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {config.title || "Blessings for the Journey Ahead"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-4 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Traditional Sacred Verse / Prayer Box */}
        {config.traditionalVerse && (
          <div className="w-full bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 my-3 text-center">
            <span className="text-[10px] font-mono text-amber-700 uppercase tracking-widest block mb-1">
              Traditional Ashirwad
            </span>
            <p className="font-serif italic text-xs sm:text-sm text-stone-800 leading-relaxed">
              &ldquo;{config.traditionalVerse}&rdquo;
            </p>
          </div>
        )}

        {/* Blessing Text */}
        <div className="w-full bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 text-center my-3 shadow-inner">
          <p className="font-serif italic text-sm sm:text-base text-stone-800 leading-relaxed">
            &ldquo;{config.blessingText}&rdquo;
          </p>
        </div>

        {/* Soft family sentiment */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 italic mt-2 mb-5">
          <Heart className="w-3 h-3 text-rose-400" />
          <span>Surrounded by the love, prayers, and blessings of family and elders.</span>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onContinue}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}

