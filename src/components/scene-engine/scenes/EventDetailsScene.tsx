"use client";

import React from "react";
import { motion } from "framer-motion";
import { EventDetailsSceneConfig } from "@/types/scenes";
import { Calendar, Clock, MapPin, Navigation, ArrowRight, Sparkles } from "lucide-react";

interface EventDetailsSceneProps {
  config: EventDetailsSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function EventDetailsScene({
  config,
  onContinue,
}: EventDetailsSceneProps) {
  const mapUrl =
    config.venueMapUrl ||
    (config.venueAddress
      ? `https://maps.google.com/?q=${encodeURIComponent(config.venueAddress)}`
      : config.venueName
      ? `https://maps.google.com/?q=${encodeURIComponent(config.venueName)}`
      : null);

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/95 backdrop-blur-md border border-amber-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-medium tracking-wide mb-3 shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Save The Date</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || "Wedding Celebrations"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-6 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Date & Time Highlight Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {config.eventDate && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-xs text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                  Date
                </span>
                <p className="font-serif font-bold text-stone-800 text-sm">
                  {config.eventDate}
                </p>
              </div>
            </motion.div>
          )}

          {config.eventTime && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-xs text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider block">
                  Time
                </span>
                <p className="font-serif font-bold text-stone-800 text-sm">
                  {config.eventTime}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Dress Code & Theme Card if present */}
        {(config.dressCode || config.themeName) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="w-full bg-pink-50/80 border border-pink-200/70 rounded-2xl p-3.5 mb-3 flex items-center gap-3 text-left shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider block">
                {config.themeName ? `Theme: ${config.themeName}` : "Theme & Dress Code"}
              </span>
              {config.dressCode && (
                <p className="font-sans font-medium text-stone-800 text-xs truncate">
                  {config.dressCode}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Venue & Location Card */}
        {(config.venueName || config.venueAddress) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="w-full bg-stone-50/90 border border-stone-200/80 rounded-2xl p-4 sm:p-5 mb-6 text-left shadow-xs space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-200/80 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                {config.venueName && (
                  <h4 className="font-serif font-bold text-stone-800 text-base truncate">
                    {config.venueName}
                  </h4>
                )}
                {config.venueAddress && (
                  <p className="font-sans text-xs text-stone-600 mt-0.5 leading-relaxed">
                    {config.venueAddress}
                  </p>
                )}
              </div>
            </div>

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium shadow-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-600" />
                <span>Open in Google Maps</span>
              </a>
            )}
          </motion.div>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 text-white font-medium text-sm shadow-md hover:shadow-amber-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>A Warm Note for You</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
