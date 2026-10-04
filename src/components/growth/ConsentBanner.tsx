"use client";

import React, { useState, useEffect } from "react";
import { setAnalyticsConsent, hasUserDecidedConsent, trackFunnelStep } from "@/lib/consent";
import { ShieldCheck, Check, X } from "lucide-react";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if user has not yet decided consent
    if (!hasUserDecidedConsent()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setVisible(false);
    // Fire the initial visit event now that consent is granted
    trackFunnelStep({ step: "visit" });
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie & Analytics Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-2xl bg-neutral-900/95 backdrop-blur-md border border-neutral-800 text-neutral-200 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <p className="font-semibold text-white mb-1">Privacy-First Experience</p>
          <p className="text-neutral-400 leading-relaxed">
            We use anonymous, privacy-respecting analytics strictly to measure page & checkout performance. We never track personal letters, photos, or sell data.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition flex items-center gap-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
