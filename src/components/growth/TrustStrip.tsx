import React from "react";
import { Lock, ShieldCheck, Sparkles, CheckCircle2, KeyRound } from "lucide-react";

export function TrustStrip() {
  return (
    <section className="border-t border-neutral-900 bg-neutral-950 py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-rose-950/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Honest &amp; Transparent Promises</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Designed for Trust, Built to Last Forever
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            No dark patterns. No sneaky recurring charges. Just honest, timeless keepsakes created with care.
          </p>
        </div>

        {/* 4 Core Pillars Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Pillar 1: Pay Once */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 font-bold text-base">
              ₹
            </div>
            <h3 className="font-semibold text-white text-base mb-1">Pay Once</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Zero recurring charges or hidden fees. Single transparent price per card or page.
            </p>
          </div>

          {/* Pillar 2: No Subscription */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">No Subscription</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Never get billed automatically. You own your page for life without recurring monthly subscriptions.
            </p>
          </div>

          {/* Pillar 3: No Watermark */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">No Watermark</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Pristine, elegant presentation. Your recipient sees only your love story, heartfelt photos, and wishes.
            </p>
          </div>

          {/* Pillar 4: No Expiry */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-1">No Expiry</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Hosted forever on permanent URLs. Revisit anniversaries, birthdays, and sacred tributes for years to come.
            </p>
          </div>
        </div>

        {/* Feature Spotlight: Locked Until They Open It */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/60 border border-rose-500/20 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-rose-300">
                    PIN &amp; Privacy Protection
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Locked Until They Open It
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                  Protect your intimate love letters, private family memories, and emotional confessions. Set an optional <strong>4-Digit PIN</strong> or timed reveal so only the intended recipient can unlock and read your keepsake.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs font-mono text-neutral-300">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>4-Digit PIN Security Optional</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
