"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

interface AdBannerProps {
  className?: string;
}

export default function AdBanner({ className = "" }: AdBannerProps) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adsenseSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || "1234567890";
  const adPushedRef = useRef(false);

  useEffect(() => {
    if (adsenseClientId && !adPushedRef.current) {
      try {
        // @ts-expect-error window.adsbygoogle is injected by Google AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushedRef.current = true;
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    }
  }, [adsenseClientId]);

  // If a live Google AdSense client ID is configured, render real third-party ads
  if (adsenseClientId) {
    return (
      <div className={`my-6 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-center ${className}`}>
        <span className="mb-2 text-[9px] uppercase tracking-wider text-neutral-500 font-medium">
          Advertisement
        </span>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ins
          className="adsbygoogle"
          style={{ display: "block", minWidth: "280px", minHeight: "100px" }}
          data-ad-client={adsenseClientId}
          data-ad-slot={adsenseSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // /* TEMPORARY - replace with real ad network once approved */
  // Fallback placeholder when live AdSense account credentials are not yet configured in environment variables.
  return (
    <div className={`my-6 flex flex-col items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-neutral-900/80 to-amber-950/40 p-5 text-center shadow-lg backdrop-blur-md ${className}`}>
      <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Sponsored • Ad-Supported Free View</span>
      </div>
      <p className="font-serif text-sm sm:text-base font-semibold text-neutral-200">
        Lovewrit Keepsakes — Handcrafted Occasion Cards & Keepsake Pages
      </p>
      <p className="mt-1 max-w-md text-xs text-neutral-400">
        Create unforgettable memories for proposals, sacred devotional events, birthdays, and heartfelt letters.
      </p>
      <div className="mt-2.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] text-amber-300/80">
        Notice: Free ad-supported viewing active. Configure <code className="text-amber-200">NEXT_PUBLIC_ADSENSE_CLIENT_ID</code> in production to serve live revenue-generating ads.
      </div>
    </div>
  );
}

