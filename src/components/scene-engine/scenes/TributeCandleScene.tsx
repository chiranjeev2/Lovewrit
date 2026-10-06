"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TributeCandleSceneConfig } from "@/types/scenes";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { ImageLightboxModal } from "@/components/shared/ImageLightboxModal";

interface TributeCandleSceneProps {
  config: TributeCandleSceneConfig;
  onContinue: () => void;
  onComplete?: () => void;
  theme?: string;
}

export default function TributeCandleScene({
  config,
  onContinue,
  onComplete,
}: TributeCandleSceneProps) {
  const [isLit, setIsLit] = useState(false);
  const [litCount, setLitCount] = useState(config.candleLitCount || 1);
  const [isAlreadyLit, setIsAlreadyLit] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Extract slug from path or window
  const effectiveSlug = typeof window !== "undefined"
    ? window.location.pathname.split("/").pop() || "preview"
    : "preview";

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Check localStorage 24h cache first
    const storedTime = localStorage.getItem(`lovewrit_candle_${effectiveSlug}`);
    if (storedTime) {
      const diffHours = (Date.now() - parseInt(storedTime, 10)) / (1000 * 60 * 60);
      if (diffHours < 24) {
        setTimeout(() => {
          setIsLit(true);
          setIsAlreadyLit(true);
        }, 0);
      }
    }

    // Fetch server atomic count and cookie state
    fetch(`/api/tribute/candle?slug=${encodeURIComponent(effectiveSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.count) setLitCount(data.count);
        if (data.alreadyLit) {
          setIsLit(true);
          setIsAlreadyLit(true);
        }
      })
      .catch(() => {});
  }, [effectiveSlug]);

  const handleLightCandle = async () => {
    if (isLit) return;

    // Optimistic light
    setIsLit(true);
    setLitCount((c) => c + 1);
    onComplete?.();

    if (typeof window !== "undefined") {
      localStorage.setItem(`lovewrit_candle_${effectiveSlug}`, String(Date.now()));
    }

    try {
      const res = await fetch("/api/tribute/candle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: effectiveSlug }),
      });
      const data = await res.json();
      if (data.count) {
        setLitCount(data.count);
      }
      if (data.alreadyLit) {
        setIsAlreadyLit(true);
      }
    } catch (e) {
      console.debug("Silent candle fallback:", e);
    }
  };

  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-5 sm:p-6 text-center select-none overflow-y-auto">
      {/* Soft Ethereal Ambient Halo */}
      <AnimatePresence>
        {isLit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.35, scale: 1.25 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/4 w-80 h-80 rounded-full bg-amber-400/25 blur-3xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header Pill */}
      <div className="pt-2 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-200/90 border border-amber-500/20 text-xs font-serif tracking-wide">
          <span>🕯️</span>
          <span>Eternal Remembrance &amp; Sacred Flame</span>
        </span>
      </div>

      {/* Centerpiece: Memorial Photo & Candle / Diya */}
      <div className="my-auto py-3 z-10 flex flex-col items-center w-full">
        {/* Tribute Photo with Lightbox */}
        {config.photoUrl && (
          <div className="relative mb-4 group cursor-pointer" onClick={() => setLightboxOpen(true)}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-2xl p-1 bg-stone-900/80">
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image
                  src={config.photoUrl}
                  alt={config.tributeName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="absolute inset-0 rounded-full ring-2 ring-amber-400/30 ring-offset-2 ring-offset-black/50" />
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-wide">
          {config.tributeName}
        </h2>

        {config.yearsSpan && (
          <p className="text-xs sm:text-sm font-serif tracking-widest text-amber-300/80 uppercase mt-1 mb-2">
            {config.yearsSpan}
          </p>
        )}

        <p className="text-xs sm:text-sm text-stone-300 font-serif italic max-w-sm mx-auto mb-5 leading-relaxed px-4">
          &ldquo;{config.candleMessage}&rdquo;
        </p>

        {/* Sacred Candle / Diya Interactive Vessel */}
        <div
          onClick={handleLightCandle}
          className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-stone-900/60 border border-amber-500/20 shadow-xl cursor-pointer hover:border-amber-400/50 transition-all duration-500 group max-w-xs w-full"
        >
          {/* Flame Container */}
          <div className="relative h-16 flex items-end justify-center mb-2">
            {/* Animated Flame */}
            <motion.div
              animate={{
                scale: isLit ? [1, 1.08, 0.96, 1.04, 1] : 0.85,
                y: isLit ? [0, -2, 1, -1, 0] : 0,
                opacity: isLit ? 1 : 0.45,
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "easeInOut",
              }}
              className={`relative flex flex-col items-center ${
                isLit ? "drop-shadow-[0_0_16px_rgba(251,191,36,0.85)]" : "filter grayscale"
              }`}
            >
              {/* Outer Golden Aura */}
              <div
                className={`w-6 h-10 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 transition-all duration-700 ${
                  isLit ? "opacity-100" : "opacity-40"
                }`}
                style={{ borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%" }}
              />
              {/* Inner White Flame Heart */}
              <div
                className="absolute bottom-1 w-2.5 h-5 rounded-full bg-white/90 blur-[1px]"
                style={{ borderRadius: "50% 50% 35% 35% / 60% 60% 35% 35%" }}
              />
            </motion.div>
          </div>

          {/* Candle / Diya Base */}
          <div className="w-14 h-5 rounded-full bg-gradient-to-b from-amber-700 via-amber-900 to-stone-950 border border-amber-500/40 shadow-inner flex items-center justify-center">
            <div className="w-10 h-1.5 rounded-full bg-amber-400/20 blur-[1px]" />
          </div>

          {/* Candle Action Prompt */}
          <div className="mt-4">
            {!isLit ? (
              <span className="text-xs font-medium text-amber-300 group-hover:text-amber-200 transition">
                Tap to Light a Candle 🕯️
              </span>
            ) : isAlreadyLit ? (
              <span className="text-xs font-medium text-amber-200/90 flex items-center gap-1.5 justify-center font-serif italic">
                <span>🕯️</span>
                <span>A candle glows in their memory • You kindled a flame today</span>
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5 justify-center">
                <span>✨</span>
                <span>You lit a candle in their memory</span>
              </span>
            )}
          </div>

          {/* Live Candles Lit Counter */}
          <div className="mt-2 text-[11px] font-serif text-stone-400">
            <span className="font-semibold text-amber-200">{litCount}</span> candles lit in loving tribute
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-6 w-full max-w-xs">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onContinue}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-700 to-stone-800 text-stone-100 font-serif font-semibold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-500/30"
          >
            <span>Celebrate Their Life</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Sensitive Footer Quote */}
      <div className="pb-16 sm:pb-20 text-[10px] text-stone-400 font-serif italic z-10 max-w-xs">
        &ldquo;Those we love never truly leave us; they live forever in quiet memories.&rdquo;
      </div>

      {/* Lightbox for Photo */}
      {config.photoUrl && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          photos={[{ src: config.photoUrl, alt: config.tributeName }]}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
