"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BabyRevealSceneConfig } from "@/types/scenes";
import { Calendar, Heart, ArrowRight, Gift } from "lucide-react";
import confetti from "canvas-confetti";

interface BabyRevealSceneProps {
  config: BabyRevealSceneConfig;
  onContinue: () => void;
  onComplete?: () => void;
  theme?: string;
}

export default function BabyRevealScene({
  config,
  onContinue,
  onComplete,
}: BabyRevealSceneProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [, setScratchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Trigger celebration on reveal
  const handleReveal = useCallback(() => {
    if (isRevealed) return;
    setIsRevealed(true);
    setScratchProgress(100);
    onComplete?.();
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"],
      });
    } catch {
      // Confetti fallback
    }
  }, [isRevealed, onComplete]);

  // Scratch card canvas setup for scratch_card mode
  useEffect(() => {
    if (config.revealType !== "scratch_card" && config.revealType !== "name_hint") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill foil
    const width = canvas.width;
    const height = canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#d4af37");
    gradient.addColorStop(0.5, "#f7e7a9");
    gradient.addColorStop(1, "#aa7c11");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative text on foil
    ctx.fillStyle = "#5c4308";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✨ Scratch with finger or click ✨", width / 2, height / 2 + 5);

    let scratchedPixels = 0;
    const totalPixels = width * height;

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      scratchedPixels += 500;
      const pct = Math.min(100, Math.round((scratchedPixels / totalPixels) * 100));
      setScratchProgress(pct);
      if (pct > 35) {
        handleReveal();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      scratch(clientX - rect.left, clientY - rect.top);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      scratch(clientX - rect.left, clientY - rect.top);
    };

    const handlePointerUp = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    canvas.addEventListener("touchstart", handlePointerDown, { passive: true });
    canvas.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      canvas.removeEventListener("touchstart", handlePointerDown);
      canvas.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [config.revealType, handleReveal]);

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium tracking-wide mb-3 shadow-sm"
        >
          <Gift className="w-3.5 h-3.5 text-amber-600" />
          <span>A Sweet Reveal</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || "A Little Miracle on the Way"}
        </h2>
        {config.subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 font-sans mb-4 max-w-md">
            {config.subtitle}
          </p>
        )}

        {/* INTERACTIVE REVEAL CONTAINER */}
        <div className="relative w-full max-w-sm my-4 flex flex-col items-center">
          {/* Card Underneath */}
          <div className="w-full bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50/50 rounded-2xl p-6 border-2 border-amber-300/80 shadow-md flex flex-col items-center text-center space-y-3 min-h-[170px] justify-center relative">
            {config.nameHint && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-amber-700 tracking-widest font-semibold block">
                  Name Clue / Initials
                </span>
                <p className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  {config.nameHint}
                </p>
              </div>
            )}

            {config.dueDate && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-xs text-amber-900 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Expected Arrival: <strong>{config.dueDate}</strong></span>
              </div>
            )}

            <p className="font-serif italic text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
              &ldquo;{config.revealMessage || "A tiny blessing is arriving soon to fill our hearts with joy."}&rdquo;
            </p>
          </div>

          {/* Scratch Foil Overlay if not revealed */}
          {(config.revealType === "scratch_card" || config.revealType === "name_hint") && !isRevealed && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400 flex flex-col items-center justify-center">
              <canvas
                ref={canvasRef}
                width={340}
                height={170}
                className="w-full h-full cursor-pointer touch-none"
              />
              <button
                type="button"
                onClick={handleReveal}
                className="absolute bottom-2 right-2 text-[10px] text-amber-900 bg-amber-200/90 hover:bg-amber-300 px-2 py-0.5 rounded-full font-medium shadow transition cursor-pointer"
              >
                Tap to Reveal
              </button>
            </div>
          )}
        </div>

        {/* Revealed Status Pill */}
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold my-1"
          >
            <span>✨ Revealed with Love!</span>
          </motion.div>
        )}

        {/* Legal & Cultural Guardrail notice */}
        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 italic mt-3 mb-5 max-w-sm text-center">
          <Heart className="w-3 h-3 text-stone-400 shrink-0" />
          <span>Every baby is a sacred blessing; celebrated with pure warmth and affection.</span>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onContinue}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>View Ceremony Details</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
