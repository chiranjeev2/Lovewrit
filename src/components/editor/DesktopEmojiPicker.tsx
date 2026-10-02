"use client";

import React, { useState, useRef, useEffect } from "react";
import { Smile, X } from "lucide-react";

interface DesktopEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  buttonLabel?: string;
  className?: string;
}

const EMOJI_CATEGORIES = [
  {
    name: "Love & Romance",
    emojis: ["❤️", "💖", "💕", "💞", "💓", "💘", "💝", "💌", "💍", "🌹", "🥀", "🌸", "🌺", "💐", "🌷", "🍫", "🥂"],
  },
  {
    name: "Warmth & Smiles",
    emojis: ["🥰", "😍", "🥺", "😊", "🥹", "😘", "✨", "🌟", "⭐", "💫", "🫂", "🤍", "🕊️", "🕯️", "🌙", "☀️", "🦋"],
  },
  {
    name: "Celebration",
    emojis: ["🎉", "🎊", "🎂", "🍰", "🍾", "🥂", "🎈", "🎁", "🎀", "🥳", "🎇", "🎆", "👑", "💃", "🕺", "🎵", "🎶"],
  },
  {
    name: "Blessings & Symbols",
    emojis: ["ॐ", "🌙", "🕊️", "✝️", "🪔", "🌸", "🌿", "📜", "🖋️", "🧸", "✨", "💎", "🙌", "🙏", "❤️‍🔥", "♾️"],
  },
];

export default function DesktopEmojiPicker({
  onSelectEmoji,
  buttonLabel = "Add Emoji",
  className = "",
}: DesktopEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center space-x-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-300 hover:text-white hover:border-rose-500/50 hover:bg-neutral-800 transition shadow-sm focus:outline-none"
        title="Open emoji keyboard for desktop"
      >
        <Smile className="h-3.5 w-3.5 text-rose-400" />
        <span className="text-[11px] font-medium">{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-72 rounded-2xl border border-neutral-700/80 bg-neutral-900 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
              <Smile className="h-4 w-4 text-rose-400" />
              <span>Choose Emoji</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-0.5 rounded-md hover:bg-neutral-800 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1.5 mb-2 scrollbar-none border-b border-neutral-800/60">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(idx)}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition whitespace-nowrap ${
                  activeCategory === idx
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto pr-1">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg hover:bg-neutral-800 hover:scale-125 active:scale-95 transition focus:outline-none"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400 text-center">
            Click emoji to insert into your message
          </div>
        </div>
      )}
    </div>
  );
}

