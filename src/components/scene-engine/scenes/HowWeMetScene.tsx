"use client";

import React from "react";
import { motion } from "framer-motion";
import { HowWeMetSceneConfig } from "@/types/scenes";
import { MapPin, Calendar, Heart, ArrowRight } from "lucide-react";

interface HowWeMetSceneProps {
  config: HowWeMetSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function HowWeMetScene({
  config,
  onContinue,
}: HowWeMetSceneProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/85 backdrop-blur-md border border-rose-200/70 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft decorative background tint */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Milestone badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-medium tracking-wide mb-4 shadow-sm"
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>{config.dateLabel || "Where Our Journey Started"}</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {config.title || "How We Met"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-5 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Photo Container */}
        {config.photoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-4 border-white mb-5 relative group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.photoUrl}
              alt="How We Met"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {config.location && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-white text-xs">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate font-medium">{config.location}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Story Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-stone-50/80 border border-stone-200/60 rounded-2xl p-4 sm:p-5 text-stone-700 font-serif leading-relaxed text-sm sm:text-base text-left max-h-52 overflow-y-auto mb-6 shadow-inner"
        >
          <p className="whitespace-pre-line">{config.storyText}</p>
        </motion.div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white font-medium text-sm shadow-md hover:shadow-rose-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continue Our Story</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
