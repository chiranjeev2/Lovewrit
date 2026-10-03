"use client";

import React, { useState } from "react";
import { Sparkles, Heart, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { ColorThemeKey } from "@/lib/templates-data";

function getSealThemeStyles(themeKey?: ColorThemeKey) {
  switch (themeKey) {
    case "emerald":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #34d399 0%, #059669 45%, #064e3b 100%)",
        sealShadow: "0 15px 35px -5px rgba(5, 150, 105, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(167, 243, 208, 0.5)",
        tagClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
        tagIcon: "text-emerald-400",
        ringClass: "border-emerald-400/40 bg-emerald-500/20",
        actionText: "text-emerald-300 group-hover:text-emerald-200",
      };
    case "midnight":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #818cf8 0%, #4f46e5 45%, #312e81 100%)",
        sealShadow: "0 15px 35px -5px rgba(79, 70, 229, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(199, 210, 254, 0.5)",
        tagClass: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
        tagIcon: "text-indigo-400",
        ringClass: "border-indigo-400/40 bg-indigo-500/20",
        actionText: "text-indigo-300 group-hover:text-indigo-200",
      };
    case "sunset":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #fbbf24 0%, #d97706 45%, #78350f 100%)",
        sealShadow: "0 15px 35px -5px rgba(217, 119, 6, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(253, 230, 138, 0.5)",
        tagClass: "bg-amber-500/15 border-amber-500/30 text-amber-300",
        tagIcon: "text-amber-400",
        ringClass: "border-amber-400/40 bg-amber-500/20",
        actionText: "text-amber-300 group-hover:text-amber-200",
      };
    case "champagne":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #facc15 0%, #ca8a04 45%, #713f12 100%)",
        sealShadow: "0 15px 35px -5px rgba(202, 138, 4, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(254, 240, 138, 0.5)",
        tagClass: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
        tagIcon: "text-yellow-400",
        ringClass: "border-yellow-400/40 bg-yellow-500/20",
        actionText: "text-yellow-300 group-hover:text-yellow-200",
      };
    case "serene":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #e7e5e4 0%, #78716c 45%, #292524 100%)",
        sealShadow: "0 15px 35px -5px rgba(120, 113, 108, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(231, 229, 228, 0.5)",
        tagClass: "bg-stone-500/15 border-stone-500/30 text-stone-300",
        tagIcon: "text-stone-300",
        ringClass: "border-stone-400/40 bg-stone-500/20",
        actionText: "text-stone-300 group-hover:text-stone-200",
      };
    case "festive":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #f472b6 0%, #db2777 45%, #701a75 100%)",
        sealShadow: "0 15px 35px -5px rgba(219, 39, 119, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(251, 207, 232, 0.5)",
        tagClass: "bg-pink-500/15 border-pink-500/30 text-pink-300",
        tagIcon: "text-pink-400",
        ringClass: "border-pink-400/40 bg-pink-500/20",
        actionText: "text-pink-300 group-hover:text-pink-200",
      };
    case "scroll":
    case "vintage_parchment":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #b91c1c 0%, #881337 45%, #450a0a 100%)",
        sealShadow: "0 15px 35px -5px rgba(136, 19, 55, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(254, 205, 211, 0.4)",
        tagClass: "bg-amber-900/30 border-amber-600/40 text-amber-200",
        tagIcon: "text-amber-400",
        ringClass: "border-amber-500/40 bg-amber-900/20",
        actionText: "text-amber-200 group-hover:text-amber-100",
      };
    case "modern":
    case "modern_gold":
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #94a3b8 0%, #475569 45%, #1e293b 100%)",
        sealShadow: "0 15px 35px -5px rgba(71, 85, 105, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(226, 232, 240, 0.5)",
        tagClass: "bg-slate-500/15 border-slate-500/30 text-slate-300",
        tagIcon: "text-slate-300",
        ringClass: "border-slate-400/40 bg-slate-500/20",
        actionText: "text-slate-300 group-hover:text-slate-200",
      };
    case "rose":
    default:
      return {
        sealBg: "radial-gradient(circle at 35% 30%, #f43f5e 0%, #be123c 45%, #881337 100%)",
        sealShadow: "0 15px 35px -5px rgba(225, 29, 72, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        sealBorder: "2px solid rgba(254, 205, 211, 0.4)",
        tagClass: "bg-rose-500/15 border-rose-500/30 text-rose-300",
        tagIcon: "text-rose-400",
        ringClass: "border-rose-400/40 bg-rose-500/20",
        actionText: "text-rose-300 group-hover:text-rose-200",
      };
  }
}

interface OpenerSceneProps {
  title: string;
  subtitle?: string;
  senderName: string;
  recipientName: string;
  onOpen: () => void;
  guestName?: string | null;
  colorTheme?: ColorThemeKey;
}

export function OpenerScene({
  title,
  subtitle,
  senderName,
  recipientName,
  onOpen,
  guestName,
  colorTheme = "rose",
}: OpenerSceneProps) {
  const sealStyles = getSealThemeStyles(colorTheme);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    // Slight tactile delay for audio trigger & seal animation
    setTimeout(() => {
      onOpen();
    }, 450);
  };

  const displayRecipient = guestName || recipientName;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 max-w-sm sm:max-w-md w-full flex flex-col items-center"
      >
        {/* Occasion Header Tag */}
        <div className={`inline-flex items-center space-x-1.5 rounded-full ${sealStyles.tagClass} px-3.5 py-1 text-xs font-semibold mb-6 shadow-sm`}>
          <Sparkles className={`h-3 w-3 ${sealStyles.tagIcon}`} />
          <span>A Private Moment For You</span>
        </div>

        {/* Personalized Recipient Name */}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3 tracking-tight leading-tight">
          Dearest {displayRecipient}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xs mb-8 leading-relaxed">
          {subtitle || `${senderName} has crafted a heartfelt journey just for you.`}
        </p>

        {/* Interactive Tap-To-Open Wax Seal Envelope */}
        <button
          type="button"
          onClick={handleOpen}
          className="group relative flex flex-col items-center justify-center p-8 transition-transform active:scale-95 cursor-pointer focus:outline-none"
          aria-label="Tap to open letter"
        >
          {/* Pulsing Aura Rings */}
          <div className={`absolute inset-0 rounded-full ${sealStyles.ringClass} blur-xl animate-pulse transition duration-500`} />
          <div className={`absolute w-24 h-24 rounded-full border ${sealStyles.ringClass} animate-ping opacity-30`} />

          {/* 3D Wax Seal Button */}
          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
              isOpening ? "scale-110 rotate-12" : "group-hover:scale-105"
            }`}
            style={{
              background: sealStyles.sealBg,
              boxShadow: sealStyles.sealShadow,
              border: sealStyles.sealBorder,
            }}
          >
            <Heart className="h-8 w-8 text-white fill-white/90 drop-shadow-md group-hover:scale-110 transition-transform" />
          </div>

          <span className={`mt-5 text-xs sm:text-sm font-medium uppercase tracking-widest ${sealStyles.actionText} transition`}>
            Tap to Open & Begin ✦
          </span>
          <span className="text-[11px] text-neutral-400 font-light mt-1">
            (Includes gentle background music)
          </span>
        </button>

        {/* Sender Signoff preview */}
        <div className="mt-8 text-xs font-serif italic text-neutral-400">
          Sent with love by <strong className="text-neutral-200 not-italic font-semibold">{senderName}</strong>
        </div>
      </motion.div>
    </div>
  );
}

