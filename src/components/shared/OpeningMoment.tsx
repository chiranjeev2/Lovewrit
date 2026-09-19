"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Music, Mail, Gift, Flame, SunMedium, PartyPopper } from "lucide-react";
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

  const handleOpen = () => {
    setIsOpen(true);

    // Burst festive petals or sparkles
    if (revealType === "balloon_pop") {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#ec4899", "#a855f7", "#3b82f6", "#10b981", "#f59e0b"],
      });
    } else if (revealType === "cupid_arrow") {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#f43f5e", "#fb7185", "#ffd700", "#ffffff"],
      });
    } else if (revealType === "champagne_seal" || revealType === "golden_invite") {
      confetti({
        particleCount: 80,
        spread: 70,
        colors: ["#ffd700", "#e6ca65", "#fff2a1"],
        origin: { y: 0.6 },
      });
    } else if (revealType === "velvet_box") {
      confetti({
        particleCount: 70,
        spread: 70,
        colors: ["#e11d48", "#be123c", "#fda4af"],
        origin: { y: 0.6 },
      });
    } else if (revealType === "diya_aarti") {
      confetti({
        particleCount: 80,
        spread: 80,
        colors: ["#f97316", "#eab308", "#ef4444"],
        origin: { y: 0.6 },
      });
    } else if (revealType === "scroll_unfurl") {
      confetti({
        particleCount: 60,
        spread: 60,
        colors: ["#b48a3c", "#991b1b", "#fef3c7"],
        origin: { y: 0.6 },
      });
    } else if (revealType === "ik_onkar_seal") {
      confetti({
        particleCount: 85,
        spread: 80,
        colors: ["#f59e0b", "#d97706", "#ffd700"],
        origin: { y: 0.6 },
      });
    } else if (revealType === "crescent_seal") {
      confetti({
        particleCount: 80,
        spread: 75,
        colors: ["#10b981", "#059669", "#ffd700"],
        origin: { y: 0.6 },
      });
    } else if (revealType === "dove_cross_seal") {
      confetti({
        particleCount: 75,
        spread: 70,
        colors: ["#38bdf8", "#ffffff", "#bae6fd"],
        origin: { y: 0.6 },
      });
    } else if (revealType === "botanical_seal") {
      confetti({
        particleCount: 65,
        spread: 65,
        colors: ["#84cc16", "#a8a29e", "#fef08a"],
        origin: { y: 0.6 },
      });
    }

    if (onOpen) {
      setTimeout(() => {
        onOpen();
      }, 500);
    }
  };

  if (isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 p-4 backdrop-blur-xl"
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
          className="relative max-w-md w-full rounded-3xl border border-rose-500/20 bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 p-8 text-center shadow-2xl backdrop-blur-2xl"
        >
          {/* Visual emblem based on occasion reveal type */}
          {revealType === "cupid_arrow" && (
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-700 shadow-xl shadow-rose-600/40 ring-4 ring-rose-400/30">
              <Heart className="h-12 w-12 fill-white text-white animate-pulse" />
              {/* Cupid's Arrow overlay */}
              <div className="absolute inset-0 flex items-center justify-center transform -rotate-45 pointer-events-none">
                <span className="text-2xl drop-shadow">💘</span>
              </div>
            </div>
          )}

          {revealType === "velvet_box" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-600 to-pink-500 shadow-xl shadow-rose-600/30 ring-4 ring-rose-400/20 animate-bounce">
              <Gift className="h-12 w-12 text-white" />
            </div>
          )}

          {revealType === "champagne_seal" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-xl shadow-amber-500/30 ring-4 ring-yellow-400/30">
              <Sparkles className="h-12 w-12 text-amber-950" />
            </div>
          )}

          {revealType === "wax_heart" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-rose-700 to-orange-600 shadow-xl shadow-rose-700/30 ring-4 ring-rose-500/20">
              <Flame className="h-11 w-11 text-amber-100" />
            </div>
          )}

          {revealType === "vintage_ribbon" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-700 to-purple-600 shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-400/20">
              <Mail className="h-11 w-11 text-indigo-100" />
            </div>
          )}

          {revealType === "balloon_pop" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 shadow-xl shadow-purple-500/30 ring-4 ring-pink-400/20 animate-pulse">
              <PartyPopper className="h-12 w-12 text-white" />
            </div>
          )}

          {revealType === "memorial_candle" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-stone-700 to-amber-800 shadow-xl ring-4 ring-amber-400/20">
              <Flame className="h-12 w-12 text-amber-300 animate-pulse" />
            </div>
          )}

          {revealType === "golden_invite" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-yellow-600 to-amber-500 shadow-xl ring-4 ring-yellow-300/30">
              <Mail className="h-12 w-12 text-yellow-100" />
            </div>
          )}

          {revealType === "diya_aarti" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 shadow-xl ring-4 ring-orange-400/30 animate-pulse">
              <SunMedium className="h-12 w-12 text-yellow-100" />
            </div>
          )}

          {revealType === "scroll_unfurl" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 shadow-xl ring-4 ring-amber-400/30 border border-amber-300/40">
              <span className="text-4xl filter drop-shadow">📜</span>
            </div>
          )}

          {revealType === "ik_onkar_seal" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-xl ring-4 ring-amber-400/40 animate-pulse">
              <span className="text-4xl font-bold text-amber-50 drop-shadow">ੴ</span>
            </div>
          )}

          {revealType === "crescent_seal" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 shadow-xl ring-4 ring-emerald-400/40">
              <span className="text-4xl text-emerald-100 drop-shadow">🌙</span>
            </div>
          )}

          {revealType === "dove_cross_seal" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-700 to-blue-600 shadow-xl ring-4 ring-sky-400/30">
              <span className="text-4xl text-white drop-shadow">🕊️</span>
            </div>
          )}

          {revealType === "botanical_seal" && (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-stone-700 to-stone-600 shadow-xl ring-4 ring-stone-400/30">
              <span className="text-4xl text-stone-100 drop-shadow">🌿</span>
            </div>
          )}

          {/* Heading and recipient note */}
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-rose-300 uppercase border border-rose-500/20">
              {revealType === "cupid_arrow"
                ? "Cupid's Love Arrow"
                : revealType === "velvet_box"
                ? "A Romantic Proposal"
                : revealType === "champagne_seal"
                ? "Anniversary Celebration"
                : revealType === "wax_heart"
                ? "A Sincere Message"
                : revealType === "balloon_pop"
                ? "Happy Birthday!"
                : revealType === "memorial_candle"
                ? "Sacred Tribute & Remembrance"
                : revealType === "diya_aarti"
                ? "Jai Mata Di • Aarti & Chowki"
                : revealType === "golden_invite"
                ? "Special Celebration Invite"
                : revealType === "scroll_unfurl"
                ? "A Heartfelt Letter To You"
                : revealType === "ik_onkar_seal"
                ? "ੴ Satnam Waheguru • Sacred Invite"
                : revealType === "crescent_seal"
                ? "Bismillah • Sacred Blessing Invite"
                : revealType === "dove_cross_seal"
                ? "Holy Celebration & Blessing"
                : revealType === "botanical_seal"
                ? "Blessing Ceremony Invite"
                : "A Memory Stream"}
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {revealType === "memorial_candle" ? "Tribute to" : "For"} {recipientName}
            </h2>

            <p className="text-sm text-neutral-400">
              {revealType === "memorial_candle"
                ? `Cherished and remembered with deep love by ${senderName}.`
                : `${senderName} has crafted a deeply personal moment just for you.`}
            </p>
          </div>

          {/* Interactive Open Button */}
          <div className="mt-8">
            <button
              onClick={handleOpen}
              className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.02] hover:shadow-rose-500/40 active:scale-[0.98]"
            >
              <Heart className="mr-2 h-5 w-5 fill-white transition group-hover:scale-125" />
              <span>
                {revealType === "cupid_arrow"
                  ? "Tap to Strike Cupid's Arrow & Open 🏹"
                  : revealType === "memorial_candle"
                  ? "Light Candle & Pay Tribute"
                  : revealType === "balloon_pop"
                  ? "Pop Balloons to Celebrate! 🎈"
                  : revealType === "scroll_unfurl"
                  ? "Break Wax Seal & Unfurl Scroll 📜"
                  : revealType === "ik_onkar_seal"
                  ? "Open Sacred Invitation 🙏"
                  : revealType === "crescent_seal"
                  ? "Open Blessing Invitation 🌙"
                  : revealType === "dove_cross_seal"
                  ? "Open Sacred Blessing 🕊️"
                  : revealType === "botanical_seal"
                  ? "Open Celebration Invitation 🌿"
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
