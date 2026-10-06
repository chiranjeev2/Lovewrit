"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowHeartSceneConfig } from "@/types/scenes";
import { Heart, Sparkles, ArrowRight, SkipForward } from "lucide-react";

interface ArrowHeartSceneProps {
  config: ArrowHeartSceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function ArrowHeartScene({
  config,
  onContinue,
}: ArrowHeartSceneProps) {
  const [isAiming, setIsAiming] = useState(false);
  const [aimDistance, setAimDistance] = useState(0); // 0 to 80 px
  const [arrowShot, setArrowShot] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [proposalAccepted, setProposalAccepted] = useState(false);

  // Dodging "No" button offsets
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isProposal = Boolean(config.isProposal);

  // Trigger heart burst particles & celebratory sound/effects
  const triggerHeartBurst = useCallback(() => {
    setHeartBurst(true);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.45 },
        colors: ["#f43f5e", "#ec4899", "#fda4af", "#ffd700"],
      });
    } catch {
      // Ignore if canvas-confetti is unavailable
    }
  }, []);

  // Shoot arrow towards heart
  const shootArrow = useCallback(() => {
    if (arrowShot) return;
    setArrowShot(true);
    setIsAiming(false);

    // Arrow flight duration 650ms, then burst
    setTimeout(() => {
      triggerHeartBurst();
    }, 650);
  }, [arrowShot, triggerHeartBurst]);

  // Keyboard accessibility: Spacebar or Enter to shoot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "Enter") && !arrowShot) {
        e.preventDefault();
        shootArrow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [arrowShot, shootArrow]);

  // Touch / pointer drag handling for bow
  const handlePointerDown = (e: React.PointerEvent) => {
    if (arrowShot) return;
    setIsAiming(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isAiming || arrowShot) return;
    // Calculate drag distance downwards
    const dragY = Math.max(0, Math.min(80, e.movementY * 1.5 + aimDistance));
    setAimDistance(dragY);
  };

  const handlePointerUp = () => {
    if (!isAiming || arrowShot) return;
    setIsAiming(false);
    shootArrow();
  };

  // Playful dodging "No" button behavior
  const dodgeNoButton = () => {
    const randomX = (Math.random() - 0.5) * 180;
    const randomY = (Math.random() - 0.5) * 120;
    setNoOffset({ x: randomX, y: randomY });
  };

  const handleYesClick = () => {
    setProposalAccepted(true);
    try {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#e11d48", "#ec4899", "#fb7185", "#ffd700", "#ffffff"],
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[78vh] select-none text-stone-900"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-rose-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium tracking-wide mb-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Cupid&apos;s Arrow Challenge</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || (isProposal ? "A Question From My Heart" : "Direct Hit")}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-sans mb-6 max-w-md">
          {config.subtitle || (isProposal ? "Aim Cupid's bow to unlock what comes next" : "Pull back the bow and release to strike the heart!")}
        </p>

        {/* Interactive Play Arena */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-rose-50/70 via-pink-50/40 to-stone-50/60 rounded-2xl border border-rose-200/60 flex flex-col items-center justify-between p-4 overflow-hidden mb-6 shadow-inner">
          {/* Target Heart at Top */}
          <motion.div
            animate={
              heartBurst
                ? { scale: [1, 1.4, 1.15], rotate: [0, -5, 5, 0] }
                : { scale: [1, 1.08, 1] }
            }
            transition={
              heartBurst
                ? { duration: 0.6 }
                : { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
            }
            onClick={shootArrow}
            className="cursor-pointer relative z-10 flex flex-col items-center group"
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all ${
                heartBurst
                  ? "bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 text-white shadow-xl shadow-rose-400/50"
                  : "bg-white text-rose-500 shadow-md border-2 border-rose-300 group-hover:scale-105"
              }`}
            >
              <Heart
                className={`w-9 h-9 sm:w-11 sm:h-11 transition-all ${
                  heartBurst ? "fill-white text-white" : "fill-rose-500 text-rose-500"
                }`}
              />
            </div>
            <span className="text-[11px] font-medium text-stone-600 mt-1">
              {config.targetLabel || "My Heart"}
            </span>
          </motion.div>

          {/* Flying Arrow */}
          {arrowShot && !heartBurst && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: -80, opacity: 1 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="absolute z-20 text-3xl"
            >
              🏹
            </motion.div>
          )}

          {/* Burst Message / Success */}
          <AnimatePresence>
            {heartBurst && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute inset-0 z-30 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-2">
                  <Heart className="w-7 h-7 fill-rose-600 text-rose-600 animate-pulse" />
                </div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 mb-1">
                  {config.burstMessage || "Direct Hit to the Heart!"}
                </h3>

                {/* Proposal Dodging Section */}
                {isProposal && (
                  <div className="w-full mt-2 flex flex-col items-center">
                    <p className="font-serif italic text-sm text-stone-700 mb-4">
                      {config.questionText || "Will you marry me?"}
                    </p>

                    {!proposalAccepted ? (
                      <div className="relative w-full flex items-center justify-center gap-4 min-h-[50px]">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleYesClick}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-sm shadow-md cursor-pointer z-10"
                        >
                          {config.yesText || "YES! A Million Times Yes! 💍"}
                        </motion.button>

                        {/* Dodging No Button */}
                        <motion.button
                          animate={{ x: noOffset.x, y: noOffset.y }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          onMouseEnter={dodgeNoButton}
                          onTouchStart={dodgeNoButton}
                          className="px-4 py-2 rounded-full bg-stone-200 text-stone-600 text-xs font-medium cursor-not-allowed hover:bg-stone-300 transition-colors"
                        >
                          {config.noText || "No"}
                        </motion.button>
                      </div>
                    ) : (
                      <div className="text-rose-600 font-serif font-bold text-base animate-bounce">
                        Forever Begins Today! 💍✨
                      </div>
                    )}

                    {/* Non-negotiable Footnote */}
                    <p className="text-[10px] text-stone-400 mt-3 font-sans">
                      *Terms &amp; Conditions: Closing this page is always an option 😉
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bow & Arrow Shooter at Bottom (if not burst) */}
          {!heartBurst && (
            <div className="w-full flex flex-col items-center">
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`relative px-5 py-2.5 rounded-full bg-white border border-rose-200 shadow-md cursor-grab active:cursor-grabbing flex items-center gap-2 touch-none select-none ${
                  isAiming ? "bg-rose-50 border-rose-400" : ""
                }`}
              >
                <span className="text-xl sm:text-2xl transform -rotate-45">🏹</span>
                <span className="text-xs font-semibold text-rose-700">
                  {isAiming ? "Release to Shoot!" : "Drag Bow Down or Tap to Shoot"}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-mono mt-1">
                (Press Space / Enter or Tap)
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons & Skip Fallback */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Skip Fallback (amendment 5) */}
          <button
            onClick={() => {
              triggerHeartBurst();
              onContinue();
            }}
            className="text-stone-400 hover:text-stone-600 text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Skip Interaction</span>
          </button>

          {/* Continue button gated on completion (or active when burst/accepted) */}
          {(heartBurst && (!isProposal || proposalAccepted)) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onContinue}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white font-medium text-sm shadow-md hover:shadow-rose-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Open My Full Letter</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
