"use client";

import React, { useState } from "react";
import { Sparkles, Heart, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface OpenerSceneProps {
  title: string;
  subtitle?: string;
  senderName: string;
  recipientName: string;
  onOpen: () => void;
  guestName?: string | null;
}

export function OpenerScene({
  title,
  subtitle,
  senderName,
  recipientName,
  onOpen,
  guestName,
}: OpenerSceneProps) {
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
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3.5 py-1 text-xs font-semibold text-rose-300 mb-6 shadow-sm">
          <Sparkles className="h-3 w-3 text-rose-400" />
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
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse group-hover:bg-rose-500/30 transition duration-500" />
          <div className="absolute w-24 h-24 rounded-full border border-rose-400/40 animate-ping opacity-30" />

          {/* 3D Wax Seal Button */}
          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
              isOpening ? "scale-110 rotate-12" : "group-hover:scale-105"
            }`}
            style={{
              background: "radial-gradient(circle at 35% 30%, #f43f5e 0%, #be123c 45%, #881337 100%)",
              boxShadow: "0 15px 35px -5px rgba(225, 29, 72, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
              border: "2px solid rgba(254, 205, 211, 0.4)",
            }}
          >
            <Heart className="h-8 w-8 text-rose-100 fill-rose-100 drop-shadow-md group-hover:scale-110 transition-transform" />
          </div>

          <span className="mt-5 text-xs sm:text-sm font-medium uppercase tracking-widest text-rose-300 group-hover:text-rose-200 transition">
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
