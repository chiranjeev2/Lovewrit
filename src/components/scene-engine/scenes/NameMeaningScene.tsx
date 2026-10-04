"use client";

import React from "react";
import { motion } from "framer-motion";
import { NameMeaningSceneConfig } from "@/types/scenes";
import { Sparkles, Compass, Heart, ArrowRight } from "lucide-react";

interface NameMeaningSceneProps {
  config: NameMeaningSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function NameMeaningScene({
  config,
  onContinue,
}: NameMeaningSceneProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-amber-200/70 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium tracking-wide mb-4 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
          <span>The Beauty of a Name</span>
        </motion.div>

        {/* Recipient Name Highlight */}
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.personName || "Cherished Soul"}
        </h2>

        {config.originOrRoots && (
          <div className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 mb-4">
            <Compass className="w-3 h-3 text-amber-600" />
            <span>{config.originOrRoots}</span>
          </div>
        )}

        {/* Meaning Box */}
        <div className="w-full bg-stone-50/80 rounded-2xl p-5 border border-stone-200/80 shadow-inner my-3 text-center">
          <p className="font-serif italic text-base sm:text-lg text-stone-800 leading-relaxed">
            &ldquo;{config.meaningText}&rdquo;
          </p>
        </div>

        {/* Curated Pills */}
        {config.curatedPills && config.curatedPills.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 my-3">
            {config.curatedPills.map((pill, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 font-medium"
              >
                ✨ {pill}
              </span>
            ))}
          </div>
        )}

        {/* Cultural note: strictly state meanings vary, no auto-generated claims */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 italic mt-3 mb-6 max-w-sm">
          <Heart className="w-3 h-3 text-stone-400 shrink-0" />
          <span>{config.culturalNote || "Meanings may vary across traditions; chosen with love."}</span>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onContinue}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue Journey</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
