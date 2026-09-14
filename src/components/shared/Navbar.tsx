"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { CurrencyCode, PRICING_TIERS } from "@/lib/currency";
import { LANGUAGES, LanguageCode } from "@/lib/i18n";
import { Heart, Globe, Sparkles, Shield, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { currency, setCurrency, region, language, setLanguage, t } = useApp();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const tier = PRICING_TIERS[region];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-900/20 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 shadow-md shadow-rose-500/20 transition group-hover:scale-105">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-rose-200 transition">
              Memoir
            </span>
            <span className="text-[10px] tracking-wider uppercase text-rose-300/80 font-medium">
              Couples Editions
            </span>
          </div>
        </Link>

        {/* Navigation Links & Selectors */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href="/#templates"
            className="hidden sm:inline-flex items-center text-xs font-medium text-neutral-300 hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-neutral-800/50"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-rose-400" />
            {t.exploreTemplates}
          </Link>

          {/* Currency Selector */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="flex items-center space-x-1 rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-neutral-200 hover:border-neutral-700 hover:text-white transition"
              title="Change Currency & Region"
            >
              <span className="text-rose-400">{tier.symbol}</span>
              <span>{currency}</span>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {showCurrencyDropdown && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl z-50"
                onMouseLeave={() => setShowCurrencyDropdown(false)}
              >
                <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Select Currency
                </div>
                {(["INR", "USD", "EUR", "GBP"] as CurrencyCode[]).map((code) => {
                  const targetRegion =
                    code === "INR"
                      ? "asia_africa"
                      : code === "USD"
                      ? "americas"
                      : code === "EUR"
                      ? "europe"
                      : "uk";
                  const p = PRICING_TIERS[targetRegion];
                  return (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                        currency === code
                          ? "bg-rose-500/20 text-rose-300 font-medium"
                          : "text-neutral-300 hover:bg-neutral-800"
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-rose-400">{p.symbol}</span>
                        <span>{code}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {p.symbol}{p.cardPrice} / {p.symbol}{p.pagePrice}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center space-x-1.5 rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:text-white transition"
              title="Change Language"
            >
              <Globe className="h-3.5 w-3.5 text-neutral-400" />
              <span>
                {LANGUAGES.find((l) => l.code === language)?.nativeName || "English"}
              </span>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {showLangDropdown && (
              <div
                className="absolute right-0 mt-2 w-36 rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl z-50"
                onMouseLeave={() => setShowLangDropdown(false)}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as LanguageCode);
                      setShowLangDropdown(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                      language === l.code
                        ? "bg-rose-500/20 text-rose-300 font-medium"
                        : "text-neutral-300 hover:bg-neutral-800"
                    }`}
                  >
                    <span>{l.nativeName}</span>
                    <span className="text-[10px] text-neutral-500 uppercase">
                      {l.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Founder Admin Access link */}
          <Link
            href="/admin"
            className="flex items-center justify-center p-1.5 text-neutral-500 hover:text-rose-400 transition rounded-lg hover:bg-neutral-900"
            title="Founder Admin Portal"
          >
            <Shield className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

