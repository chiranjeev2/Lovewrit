"use client";

import React, { useState, useEffect } from "react";
import { Clock, Lock, Sparkles } from "lucide-react";

interface CountdownRevealProps {
  revealAt: string | Date;
  recipientName: string;
  senderName?: string;
  onUnlocked: () => void;
}

export default function CountdownReveal({
  revealAt,
  recipientName,
  senderName,
  onUnlocked,
}: CountdownRevealProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 1 });

  useEffect(() => {
    const target = new Date(revealAt).getTime();

    const calculate = () => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onUnlocked();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, total: difference });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [revealAt, onUnlocked]);

  if (timeLeft.total <= 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/95 p-4 backdrop-blur-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full rounded-3xl border border-rose-500/30 bg-gradient-to-b from-neutral-900/95 to-neutral-950/95 p-8 sm:p-10 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30 shadow-lg animate-pulse">
          <Lock className="h-9 w-9" />
        </div>

        <span className="inline-block rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-300 uppercase tracking-wider border border-rose-500/20 mb-3">
          Surprise Scheduled in Time
        </span>

        <h2 className="font-serif text-3xl font-bold text-white">
          A Special Surprise For {recipientName}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto">
          {senderName || "Someone special"} has locked this memory until the appointed hour. It will unveil automatically!
        </p>

        {/* Countdown Digit Blocks */}
        <div className="my-8 grid grid-cols-4 gap-2 sm:gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
            <span className="block font-mono text-2xl sm:text-4xl font-bold text-white">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Days
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
            <span className="block font-mono text-2xl sm:text-4xl font-bold text-rose-300">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Hours
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
            <span className="block font-mono text-2xl sm:text-4xl font-bold text-rose-300">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Mins
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 sm:p-4">
            <span className="block font-mono text-2xl sm:text-4xl font-bold text-emerald-400 animate-pulse">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Secs
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500">
          <Clock className="h-3.5 w-3.5" />
          <span>Unlocks at {new Date(revealAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

