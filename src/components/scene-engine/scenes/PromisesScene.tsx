"use client";

import React from "react";
import { motion } from "framer-motion";
import { PromisesSceneConfig } from "@/types/scenes";
import { HeartHandshake, Heart, ArrowRight } from "lucide-react";

interface PromisesSceneProps {
  config: PromisesSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function PromisesScene({
  config,
  onContinue,
}: PromisesSceneProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-rose-200/70 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-pink-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium tracking-wide mb-3 shadow-xs">
          <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
          <span>Sacred Vows & Commitments</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {config.title || "Promises to Each Other"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-6 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Promises List */}
        <div className="w-full max-h-[48vh] overflow-y-auto pr-1 space-y-3 mb-6 text-left">
          {config.items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 * idx }}
              className="flex items-start gap-3.5 bg-stone-50/80 border border-rose-100/80 rounded-2xl p-4 shadow-xs"
            >
              <div className="w-7 h-7 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              </div>
              <p className="text-stone-800 font-serif text-sm sm:text-base leading-relaxed">
                {item}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white font-medium text-sm shadow-md hover:shadow-rose-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
