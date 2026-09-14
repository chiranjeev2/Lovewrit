"use client";

import React, { useState } from "react";
import { Keyboard, X, Sparkles } from "lucide-react";

interface HindiPunjabiKeyboardProps {
  language?: "hi" | "pa" | "en" | string;
  onInsertChar: (char: string) => void;
}

export default function HindiPunjabiKeyboard({
  language = "hi",
  onInsertChar,
}: HindiPunjabiKeyboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"hi" | "pa">(language === "pa" ? "pa" : "hi");

  // Punjabi (Gurmukhi) Keypad
  const punjabiChars = [
    "ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ", "ਗ", "ਘ", "ਙ",
    "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ",
    "ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ",
    "ਯ", "ਰ", "ਲ", "ਵ", "ੜ",
    "ਾ", "ਿ", "ੀ", "ੁ", "ੂ", "ੇ", "ੈ", "ੋ", "ੌ", "ੰ", "ੱ", "਼", "੍"
  ];

  const punjabiPhrases = [
    "ਮੇਰਾ ਪਿਆਰ",
    "ਮੇਰੀ ਜਾਨ",
    "ਜਨਮਦਿਨ ਮੁਬਾਰਕ",
    "ਵਰ੍ਹੇਗੰਢ ਮੁਬਾਰਕ",
    "ਮੈਨੂੰ ਮਾਫ਼ ਕਰ ਦਿਓ",
    "ਸਦਾ ਖੁਸ਼ ਰਹੋ",
    "ਜੈ ਮਾਤਾ ਦੀ",
    "ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ",
  ];

  // Hindi (Devanagari) Keypad
  const hindiChars = [
    "अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "ऋ",
    "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ",
    "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न",
    "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह",
    "ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "ं", "ः", "्", "़", "ँ"
  ];

  const hindiPhrases = [
    "मेरा प्यार",
    "मेरी जान",
    "जन्मदिन की शुभकामनाएं",
    "सालगिरह मुबारक",
    "मुझे माफ़ कर दो",
    "सदा सुहागन रहो",
    "जय माता दी",
    "ओम शांति",
    "दिल से प्यार",
  ];

  const chars = activeTab === "pa" ? punjabiChars : hindiChars;
  const phrases = activeTab === "pa" ? punjabiPhrases : hindiPhrases;
  const langTitle = activeTab === "pa" ? "ਪੰਜਾਬੀ (Gurmukhi)" : "हिन्दी (Devanagari)";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-300 hover:border-rose-500 hover:text-white transition"
        >
          <Keyboard className="h-3.5 w-3.5 text-rose-400" />
          <span>{isOpen ? "Hide Virtual Keyboard" : `⌨️ Hindi & Punjabi Virtual Keyboard`}</span>
        </button>

        {isOpen && (
          <span className="text-[10px] text-neutral-400">
            Click letters or phrases to insert
          </span>
        )}
      </div>

      {isOpen && (
        <div className="mt-2 rounded-2xl border border-neutral-700/80 bg-neutral-900/95 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab("hi")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTab === "hi"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pa")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  activeTab === "pa"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                ਪੰਜਾਬੀ (Punjabi)
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Phrases */}
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {phrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onInsertChar(phrase + " ")}
                className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-500/30 transition"
              >
                + {phrase}
              </button>
            ))}
          </div>

          {/* Character Keys */}
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-1 max-h-48 overflow-y-auto pr-1">
            {chars.map((char, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onInsertChar(char)}
                className="flex h-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950 text-xs font-semibold text-white hover:border-rose-500 hover:bg-neutral-800 active:scale-95 transition"
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
