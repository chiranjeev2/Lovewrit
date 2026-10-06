"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WishesSceneConfig } from "@/types/scenes";
import { ChevronLeft, ChevronRight, MessageSquareHeart, ArrowRight } from "lucide-react";

interface WishesSceneProps {
  config: WishesSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function WishesScene({
  config,
  onContinue,
}: WishesSceneProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const wishes = config.wishes && config.wishes.length > 0 ? config.wishes : [];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : wishes.length - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev < wishes.length - 1 ? prev + 1 : 0));
  };

  const activeWish = wishes[currentIdx];

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-rose-200/70 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium tracking-wide mb-3 shadow-sm"
        >
          <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500 fill-rose-300" />
          <span>From Those Who Love You</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || "Birthday Wishes"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-4 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* Wish Card with Transitions */}
        {wishes.length > 0 && activeWish && (
          <div className="w-full relative my-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWish.id || currentIdx}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full bg-gradient-to-br from-stone-50 to-rose-50/40 rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col items-center text-center min-h-[170px] justify-center relative"
              >
                <p className="font-serif italic text-base sm:text-lg text-stone-800 leading-relaxed mb-4">
                  &ldquo;{activeWish.message}&rdquo;
                </p>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-600 font-serif font-bold text-xs">
                    {activeWish.senderName ? activeWish.senderName[0].toUpperCase() : "❤️"}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-stone-900 block">
                      {activeWish.senderName}
                    </span>
                    {activeWish.relationship && (
                      <span className="text-[10px] text-stone-400 font-sans block">
                        {activeWish.relationship}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls if multiple wishes */}
            {wishes.length > 1 && (
              <div className="flex items-center justify-between mt-3 px-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                  title="Previous wish"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {wishes.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIdx(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === currentIdx ? "w-6 bg-rose-500" : "w-2 bg-stone-300 hover:bg-stone-400"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer"
                  title="Next wish"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onContinue}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
