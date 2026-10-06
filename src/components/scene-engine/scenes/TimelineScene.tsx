"use client";

import React from "react";
import { motion } from "framer-motion";
import { TimelineSceneConfig } from "@/types/scenes";
import { Sparkles, ArrowRight } from "lucide-react";
import { ImageLightboxModal, LightboxPhoto } from "@/components/shared/ImageLightboxModal";

interface TimelineSceneProps {
  config: TimelineSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function TimelineScene({
  config,
  onContinue,
}: TimelineSceneProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const timelinePhotos: LightboxPhoto[] = React.useMemo(() => {
    return config.events
      .filter((e) => Boolean(e.photoUrl && e.photoUrl.trim().length > 0))
      .map((e) => ({
        src: e.photoUrl!,
        alt: e.title,
        caption: `${e.yearOrDate} • ${e.title}`,
      }));
  }, [config.events]);
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-rose-200/70 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden"
      >
        {/* Decorative backdrop */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-medium tracking-wide mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Chapter by Chapter</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            {config.title || "Our Life Together"}
          </h2>
          {config.subtitle && (
            <p className="text-xs sm:text-sm text-stone-500 font-sans mt-1 max-w-sm mx-auto">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Scrollable Timeline Stream */}
        <div className="w-full max-h-[50vh] overflow-y-auto pr-2 relative mb-6 space-y-6">
          {/* Vertical Connecting Line */}
          <div className="absolute left-4 sm:left-6 top-3 bottom-3 w-0.5 bg-gradient-to-b from-rose-300 via-pink-400 to-rose-200" />

          {config.events.map((evt, idx) => (
            <motion.div
              key={evt.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * idx }}
              className="relative flex items-start gap-4 pl-2"
            >
              {/* Dot */}
              <div className="relative z-10 w-5 h-5 rounded-full bg-white border-4 border-rose-500 shadow-sm shrink-0 mt-1" />

              {/* Content Card */}
              <div className="flex-1 bg-stone-50/90 border border-stone-200/80 rounded-2xl p-4 shadow-xs">
                <span className="inline-block text-[11px] font-semibold text-rose-600 tracking-wider uppercase mb-1">
                  {evt.yearOrDate}
                </span>
                <h4 className="text-base font-serif font-bold text-stone-800 mb-1">
                  {evt.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                  {evt.description}
                </p>

                {evt.photoUrl && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const pIdx = timelinePhotos.findIndex((p) => p.src === evt.photoUrl);
                      setLightboxIndex(pIdx >= 0 ? pIdx : 0);
                      setLightboxOpen(true);
                    }}
                    title="Click to view full photo"
                    className="mt-3 aspect-video w-full rounded-xl overflow-hidden shadow-xs border border-white cursor-pointer group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={evt.photoUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
              </div>
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
          <span>Cherish Next Memory</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {timelinePhotos.length > 0 && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          photos={timelinePhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
