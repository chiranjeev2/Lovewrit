"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CurrencyCode, RegionKey, CURRENCY_TO_REGION, detectRegion } from "@/lib/currency";
import { LanguageCode, TRANSLATIONS } from "@/lib/i18n";

interface AppContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  region: RegionKey;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  t: (typeof TRANSLATIONS)["en"];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    // Auto-detect currency and region based on client timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const detected = detectRegion(null, tz);
      const initialCurrency: CurrencyCode =
        detected === "asia_africa"
          ? "INR"
          : detected === "uk"
          ? "GBP"
          : detected === "europe"
          ? "EUR"
          : "USD";

      const savedCurrency = (localStorage.getItem("lovewrit_currency") ||
        localStorage.getItem("memoir_currency")) as CurrencyCode;
      if (savedCurrency && ["INR", "USD", "EUR", "GBP"].includes(savedCurrency)) {
        setCurrencyState(savedCurrency);
      } else {
        setCurrencyState(initialCurrency);
      }

      const savedLang = (localStorage.getItem("lovewrit_lang") ||
        localStorage.getItem("memoir_lang")) as LanguageCode;
      if (savedLang && ["en", "pa", "hi"].includes(savedLang)) {
        setLanguageState(savedLang);
      }
    } catch {
      // fallback
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem("lovewrit_currency", c);
    }
  };

  const setLanguage = (l: LanguageCode) => {
    setLanguageState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("lovewrit_lang", l);
    }
  };

  const region = CURRENCY_TO_REGION[currency] || "americas";
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency,
        region,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

