"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { DayArrivedSceneConfig } from "@/types/scenes";
import { Calendar, Sun, Clock, MapPin, ArrowRight } from "lucide-react";
import { ImageLightboxModal } from "@/components/shared/ImageLightboxModal";

interface DayArrivedSceneProps {
  config: DayArrivedSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function DayArrivedScene({
  config,
  onContinue,
}: DayArrivedSceneProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Derive auto facts from birthDate if provided
  let calculatedWeekday = config.birthWeekday;
  let daysLived: number | null = null;
  let formattedDate: string | null = null;

  if (config.birthDate) {
    try {
      const bDate = new Date(config.birthDate);
      if (!isNaN(bDate.getTime())) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        calculatedWeekday = calculatedWeekday || days[bDate.getUTCDay()];
        formattedDate = bDate.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        const now = new Date();
        const diffMs = now.getTime() - bDate.getTime();
        if (diffMs > 0) {
          daysLived = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
      }
    } catch {
      // Fallback cleanly without error
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-purple-200/70 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft background decor */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Milestone badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-medium tracking-wide mb-3 shadow-sm"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
          <span>The Day You Arrived</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {config.title || "When the World Welcomed You"}
        </h2>

        {/* Auto Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full my-4">
          {formattedDate && (
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 text-center">
              <Calendar className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Date</div>
              <div className="text-xs font-semibold text-stone-800">{formattedDate}</div>
            </div>
          )}

          {calculatedWeekday && (
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 text-center">
              <Clock className="w-4 h-4 text-pink-600 mx-auto mb-1" />
              <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Weekday</div>
              <div className="text-xs font-semibold text-stone-800">{calculatedWeekday}</div>
            </div>
          )}

          {daysLived !== null && (
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 text-center col-span-2 sm:col-span-1">
              <Sun className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Days Lived</div>
              <div className="text-xs font-semibold text-amber-700 font-mono">
                {daysLived.toLocaleString()} days
              </div>
            </div>
          )}

          {config.birthCity && (
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 text-center col-span-2 sm:col-span-3">
              <div className="inline-flex items-center gap-1 text-xs text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-purple-500" />
                <span>Born in <strong>{config.birthCity}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Optional Childhood / Memory Photo */}
        {config.photoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className="relative w-full max-w-xs h-48 sm:h-56 rounded-2xl overflow-hidden shadow-md border-2 border-white/80 my-3 group cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.photoUrl}
              alt="The day you arrived"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs font-medium text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                🔍 Click to zoom
              </span>
            </div>
          </motion.div>
        )}

        {/* Lightbox Modal */}
        {config.photoUrl && (
          <ImageLightboxModal
            isOpen={lightboxOpen}
            photos={[config.photoUrl]}
            initialIndex={0}
            onClose={() => setLightboxOpen(false)}
          />
        )}

        {/* Story Text */}
        <div className="w-full bg-stone-50/70 rounded-2xl p-4 sm:p-5 border border-stone-200/70 text-left my-2">
          <p className="font-serif italic text-sm sm:text-base text-stone-800 leading-relaxed">
            &ldquo;{config.storyText}&rdquo;
          </p>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onContinue}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
