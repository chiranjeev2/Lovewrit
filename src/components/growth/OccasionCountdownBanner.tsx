"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DEFAULT_OCCASIONS,
  OccasionEvent,
  getActiveUpcomingOccasion,
  calculateTimeRemaining,
} from "@/lib/occasion-calendar";
import { Sparkles, ArrowRight, Clock } from "lucide-react";

export function OccasionCountdownBanner() {
  const pathname = usePathname();
  const [occasion, setOccasion] = useState<OccasionEvent | null>(() =>
    getActiveUpcomingOccasion(DEFAULT_OCCASIONS)
  );
  const [timeLeft, setTimeLeft] = useState<{
    isPast: boolean;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // STRICT NON-NEGOTIABLE: NEVER render on tribute, memorial, or remembrance pages
  const isMemorialPath =
    pathname?.includes("memorial") ||
    pathname?.includes("tribute") ||
    pathname?.includes("sacred-tribute");

  useEffect(() => {
    // Attempt to fetch fresh admin-configured occasions
    let isMounted = true;
    fetch("/api/admin/occasions")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.activeUpcoming) {
          setOccasion(data.activeUpcoming);
        }
      })
      .catch((err) => {
        console.debug("Default occasions fallback used:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!occasion) return;

    const updateTime = () => {
      const remaining = calculateTimeRemaining(occasion.targetDate);
      if (remaining.isPast) {
        // Auto-hide when past and advance to next occasion
        const next = getActiveUpcomingOccasion(DEFAULT_OCCASIONS);
        setOccasion(next);
      }
      setTimeLeft(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [occasion]);

  if (isMemorialPath || !occasion || !timeLeft || timeLeft.isPast) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Upcoming Occasion Countdown"
      className="relative z-40 bg-gradient-to-r from-rose-950/90 via-neutral-900 to-amber-950/90 border-b border-rose-500/20 text-neutral-100 px-4 py-2.5 sm:py-2 text-xs backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Occasion details & badge */}
        <div className="flex items-center gap-2 text-center sm:text-left flex-wrap justify-center sm:justify-start">
          <span className="text-base" role="img" aria-label="occasion emoji">
            {occasion.badgeEmoji}
          </span>
          <span className="font-semibold text-rose-200 tracking-wide">
            {occasion.name}
          </span>
          <span className="hidden md:inline text-neutral-400">•</span>
          <span className="hidden md:inline text-neutral-300 text-[11px]">
            {occasion.tagline}
          </span>
        </div>

        {/* Right: Real-time countdown & CTA */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/60 border border-white/10 font-mono text-amber-300 font-semibold text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>

          <Link
            href={`/create/${occasion.templateId}`}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] transition shadow-sm hover:scale-[1.02]"
          >
            <span>Create Keepsake</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
