"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  Music,
  Mail,
  Gift,
  Flame,
  SunMedium,
  PartyPopper,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { RevealType } from "@/lib/templates-data";

interface OpeningMomentProps {
  revealType?: RevealType;
  senderName: string;
  recipientName: string;
  occasion?: string;
  hasMusic?: boolean;
  onOpen?: () => void;
}

export default function OpeningMoment({
  revealType = "velvet_box",
  senderName,
  recipientName,
  occasion = "anniversary",
  hasMusic = false,
  onOpen,
}: OpeningMomentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animatingStage, setAnimatingStage] = useState<"idle" | "triggered" | "opened">("idle");

  const isApologyOrLetter =
    occasion === "sorry" ||
    occasion === "letter_to_dear_one" ||
    revealType === "wax_heart" ||
    revealType === "scroll_unfurl";

  const isDevotional =
    occasion === "jagrata_kirtan" ||
    occasion === "akhand_path" ||
    occasion === "gurpurab" ||
    revealType === "diya_aarti" ||
    revealType === "ik_onkar_seal";

  const isBabyShower =
    occasion === "godhbharai" ||
    (revealType === "golden_invite" && occasion === "godhbharai");

  const isBirthday = occasion === "birthday" || revealType === "balloon_pop";

  const handleOpen = () => {
    if (animatingStage !== "idle") return;
    setAnimatingStage("triggered");

    // Occasion-specific confetti and animation sequences
    if (isBirthday) {
      // Balloon pop particle burst
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.45 },
        colors: ["#ec4899", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#ffd700", "#ffffff", "#ff4081"],
        });
      }, 300);
    } else if (isApologyOrLetter) {
      // Wax seal break sparkles
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.5 },
        colors: ["#e11d48", "#be123c", "#ffd700", "#fef08a"],
      });
    } else if (isDevotional) {
      // Diya ignition marigold & saffron shower
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#f97316", "#eab308", "#ef4444", "#ffd700"],
      });
    } else if (isBabyShower) {
      // Cascading marigold & jasmine petal shower
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.2 },
        colors: ["#f59e0b", "#fbbf24", "#fef08a", "#ffffff", "#fed7aa"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.1 },
          colors: ["#fbbf24", "#f43f5e", "#ffffff"],
        });
      }, 400);
    } else {
      // Default romantic sparkle
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#f43f5e", "#fb7185", "#ffd700"],
      });
    }

    setTimeout(() => {
      setAnimatingStage("opened");
      setTimeout(() => {
        setIsOpen(true);
        if (onOpen) onOpen();
      }, 700);
    }, 1200);
  };

  if (isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 p-4 backdrop-blur-2xl"
      >
        {/* Floating background ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative max-w-md w-full rounded-3xl border border-white/10 bg-gradient-to-b from-neutral-900/95 to-neutral-950/95 p-6 sm:p-8 text-center shadow-2xl backdrop-blur-2xl overflow-hidden"
        >
          {/* ==================================================================== */}
          {/* 1. APOLOGY / LOVE LETTER: WAX-SEALED VINTAGE ENVELOPE UNSEALING      */}
          {/* ==================================================================== */}
          {isApologyOrLetter ? (
            <div className="relative mx-auto mb-6 flex flex-col items-center">
              <div
                onClick={handleOpen}
                className="cursor-pointer relative w-56 h-36 rounded-2xl bg-amber-950/40 border border-amber-500/30 p-3 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition hover:scale-105"
              >
                {/* Envelope Flap Animation */}
                <motion.div
                  animate={
                    animatingStage !== "idle"
                      ? { rotateX: 180, y: -20, opacity: 0.3 }
                      : { rotateX: 0, y: 0 }
                  }
                  transition={{ duration: 0.7 }}
                  className="absolute -top-1 inset-x-0 h-16 bg-gradient-to-b from-amber-900/60 to-amber-950/80 border-b border-amber-500/40 rounded-t-xl"
                  style={{ transformOrigin: "top" }}
                />

                {/* Letter Sliding Up */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={
                    animatingStage !== "idle"
                      ? { y: -30, opacity: 1, scale: 1.05 }
                      : { y: 20, opacity: 0 }
                  }
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="z-10 rounded-xl bg-amber-50 p-3 text-neutral-900 shadow-xl border border-amber-200 text-left w-48"
                >
                  <p className="text-[9px] uppercase tracking-widest text-amber-800 font-bold">
                    A Letter For You
                  </p>
                  <p className="font-serif text-xs font-bold text-neutral-900 truncate">
                    Dearest {recipientName},
                  </p>
                  <p className="font-serif text-[10px] text-neutral-600 line-clamp-2 mt-0.5">
                    Written with genuine sincerity from {senderName}...
                  </p>
                </motion.div>

                {/* Wax Seal Stamp Button */}
                {animatingStage === "idle" && (
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="z-20 absolute flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-rose-800 to-rose-600 shadow-xl shadow-rose-900/60 border-2 border-amber-300/40"
                  >
                    <Flame className="h-6 w-6 text-amber-200" />
                    <span className="absolute -bottom-5 text-[9px] font-bold text-amber-300 uppercase tracking-widest whitespace-nowrap drop-shadow">
                      Break Wax Seal
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          ) : isDevotional ? (
            /* 2. DEVOTIONAL / KIRTAN: DIYA FLAME LIGHTING CEREMONY */
            <div className="relative mx-auto mb-6 flex flex-col items-center">
              <div
                onClick={handleOpen}
                className="cursor-pointer relative flex flex-col items-center justify-center p-6 rounded-full transition hover:scale-105"
              >
                {/* Diya Flame */}
                <div className="relative h-16 w-16 flex items-center justify-center">
                  <motion.div
                    animate={
                      animatingStage !== "idle"
                        ? {
                            scale: [1, 1.4, 1.25],
                            opacity: 1,
                            filter: "drop-shadow(0 0 25px rgba(245, 158, 11, 0.9))",
                          }
                        : { scale: 0.8, opacity: 0.6 }
                    }
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 0.8,
                    }}
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      animatingStage !== "idle"
                        ? "bg-gradient-to-t from-orange-600 via-amber-400 to-yellow-200"
                        : "bg-amber-900/40 border border-amber-500/30"
                    }`}
                  >
                    <Flame
                      className={`h-7 w-7 ${
                        animatingStage !== "idle"
                          ? "text-yellow-100 fill-yellow-200"
                          : "text-amber-500"
                      }`}
                    />
                  </motion.div>

                  {/* Radiant Aura Beam */}
                  {animatingStage !== "idle" && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 2.2, opacity: [0.6, 0.2, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl pointer-events-none"
                    />
                  )}
                </div>

                {/* Brass Diya Vessel Base */}
                <div className="w-24 h-7 rounded-b-full bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 shadow-xl border-t border-amber-300/40 flex items-center justify-center -mt-2">
                  <span className="text-[10px] text-amber-100 font-bold tracking-widest uppercase">
                    दीप प्रज्वलन
                  </span>
                </div>
              </div>
            </div>
          ) : isBabyShower ? (
            /* 3. BABY SHOWER / GODHBHARAI: CASCADING FLORAL GARLAND SHOWER */
            <div className="relative mx-auto mb-6 flex flex-col items-center">
              <div
                onClick={handleOpen}
                className="cursor-pointer relative w-28 h-28 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-600/30 via-rose-500/20 to-yellow-500/30 border border-amber-400/40 shadow-2xl p-4 transition hover:scale-105"
              >
                <motion.div
                  animate={
                    animatingStage !== "idle"
                      ? { rotate: [0, 8, -8, 0], scale: 1.15 }
                      : { rotate: 0 }
                  }
                  transition={{ duration: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl drop-shadow mb-1">👶</span>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                    गोद भराई
                  </span>
                </motion.div>
                <Sparkles className="absolute top-2 right-2 h-4 w-4 text-amber-300 animate-pulse" />
                <Sparkles className="absolute bottom-2 left-2 h-4 w-4 text-rose-300 animate-pulse" />
              </div>
            </div>
          ) : isBirthday ? (
            /* 4. BIRTHDAY / PARTY: INTERACTIVE BALLOON POP WITH CONFETTI */
            <div className="relative mx-auto mb-6 flex flex-col items-center">
              <div
                onClick={handleOpen}
                className="cursor-pointer relative flex flex-col items-center justify-center transition hover:scale-105"
              >
                <motion.div
                  animate={
                    animatingStage === "triggered"
                      ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
                      : animatingStage === "opened"
                      ? { scale: 0, opacity: 0 }
                      : { y: [0, -10, 0] }
                  }
                  transition={
                    animatingStage !== "idle"
                      ? { duration: 0.4 }
                      : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                  }
                  className="relative h-24 w-20 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-pink-500 shadow-xl shadow-pink-500/40 border border-pink-300/40 flex items-center justify-center"
                >
                  <PartyPopper className="h-8 w-8 text-white drop-shadow" />
                  {/* Balloon knot and string */}
                  <div className="absolute -bottom-1 h-2 w-3 bg-purple-700 rounded-sm" />
                  <div className="absolute -bottom-6 h-6 w-0.5 bg-neutral-400" />
                </motion.div>

                {animatingStage !== "idle" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center font-bold text-rose-400 text-lg"
                  >
                    🎉 POP! 🎂
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* ==================================================================== */
            /* DEFAULT / COUPLES REVEALS                                           */
            /* ==================================================================== */
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-600 to-pink-500 shadow-xl shadow-rose-600/30 ring-4 ring-rose-400/20 animate-bounce">
              <Gift className="h-12 w-12 text-white" />
            </div>
          )}

          {/* Heading and recipient note */}
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-rose-300 uppercase border border-rose-500/20">
              {isBirthday
                ? "Birthday Celebration"
                : isDevotional
                ? "Sacred Invocation & Blessings"
                : isBabyShower
                ? "Godhbharai & Baby Shower"
                : isApologyOrLetter
                ? "A Sincere Personal Letter"
                : "A Special Moment"}
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isDevotional ? "Blessings for" : "For"} {recipientName}
            </h2>

            <p className="text-sm text-neutral-400">
              {isBirthday
                ? `${senderName} has planned a joyful birthday surprise just for you!`
                : isDevotional
                ? `${senderName} invites you to light the holy flame and receive divine blessings.`
                : isBabyShower
                ? `${senderName} invites you to shower blessings upon this precious journey.`
                : isApologyOrLetter
                ? `${senderName} has written a deeply personal letter from the heart.`
                : `${senderName} has crafted a deeply personal moment just for you.`}
            </p>
          </div>

          {/* Interactive Open Button */}
          <div className="mt-8">
            <button
              onClick={handleOpen}
              disabled={animatingStage !== "idle"}
              className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] hover:shadow-rose-500/40 active:scale-[0.98] disabled:opacity-80"
            >
              {animatingStage === "idle" ? (
                <Heart className="mr-2 h-5 w-5 fill-white transition group-hover:scale-125" />
              ) : (
                <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-300 animate-spin" />
              )}
              <span>
                {animatingStage !== "idle"
                  ? "Revealing Your Keepsake..."
                  : isBirthday
                  ? "Tap to Pop Balloon & Celebrate! 🎈"
                  : isDevotional
                  ? "Tap to Light Sacred Diya (दीप प्रज्वलन) 🪔"
                  : isBabyShower
                  ? "Tap to Shower Blessings 🌸"
                  : isApologyOrLetter
                  ? "Break Wax Seal & Read Letter 💌"
                  : hasMusic
                  ? "Tap to Open & Play Music"
                  : "Tap to Open Your Lovewrit"}
              </span>
              {hasMusic && <Music className="ml-2 h-4 w-4 text-rose-200 animate-pulse" />}
            </button>
            <p className="mt-3 text-[11px] text-neutral-500">
              Turn up your sound for the best emotional experience
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
