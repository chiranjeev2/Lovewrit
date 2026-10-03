"use client";

import React from "react";
import { motion } from "framer-motion";
import { MemoriesSceneConfig } from "@/types/scenes";
import { Camera, ArrowRight } from "lucide-react";

interface MemoriesSceneProps {
  config: MemoriesSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function MemoriesScene({
  config,
  onContinue,
}: MemoriesSceneProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-rose-200/70 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium tracking-wide mb-3 shadow-xs">
          <Camera className="w-3.5 h-3.5 text-amber-600" />
          <span>Nostalgia & Moments</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {config.title || "Favorite Memories"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-6 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Polaroid Memory Grid */}
        <div className="w-full max-h-[50vh] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {config.memories.map((mem, idx) => {
            const rot = idx % 2 === 0 ? "-rotate-1" : "rotate-1";
            return (
              <motion.div
                key={mem.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 * idx }}
                whileHover={{ scale: 1.02, rotate: 0 }}
                className={`bg-white p-3 pb-4 rounded-2xl shadow-md border border-stone-200/80 transition-all ${rot}`}
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 mb-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mem.photoUrl}
                    alt={mem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-serif font-bold text-stone-800 text-sm">
                  {mem.title}
                </h4>
                {mem.caption && (
                  <p className="font-sans text-xs text-stone-500 mt-1 line-clamp-2">
                    {mem.caption}
                  </p>
                )}
              </motion.div>
            );
          })}
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
