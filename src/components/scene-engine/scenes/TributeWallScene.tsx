"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TributeWallSceneConfig } from "@/types/scenes";
import { ShieldCheck, Flag, ArrowRight } from "lucide-react";

interface TributeItem {
  id: string;
  authorName: string;
  message: string;
  createdAt?: string;
  status?: string;
}

interface TributeWallSceneProps {
  config: TributeWallSceneConfig;
  onContinue: () => void;
  slug?: string;
  token?: string | null;
  theme?: string;
}

export default function TributeWallScene({
  config,
  onContinue,
  slug,
  token,
}: TributeWallSceneProps) {
  const [tributes, setTributes] = useState<TributeItem[]>([
    {
      id: "trib-1",
      authorName: "The Sharma Family",
      message: "A soul of incomparable grace, kindness, and generosity. Our heartfelt prayers are with the family.",
      createdAt: "Recently",
      status: "APPROVED",
    },
    {
      id: "trib-2",
      authorName: "Ramesh & Meena",
      message: "Forever remembering your gentle laughter and the wisdom you shared so freely. Om Shanti.",
      createdAt: "Recently",
      status: "APPROVED",
    },
  ]);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({});
  const [isCreator, setIsCreator] = useState(Boolean(token));

  // Load live guestbook if slug is available
  useEffect(() => {
    if (!slug) return;
    const fetchTributes = async () => {
      try {
        const url = `/api/guestbook?slug=${encodeURIComponent(slug)}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.entries) && data.entries.length > 0) {
            setTributes(data.entries);
          }
          if (data.isCreator) setIsCreator(true);
        }
      } catch {
        // Fallback to sample
      }
    };
    fetchTributes();
  }, [slug, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      if (slug) {
        const res = await fetch("/api/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            authorName: authorName.trim(),
            message: message.trim(),
            attendance: "MESSAGE_ONLY",
          }),
        });
        const data = await res.json();
        if (data.isPending) {
          setSubmittedMessage("🕊️ Your tribute has been received with warmth and will appear once approved by the family.");
        } else if (data.entry) {
          setTributes((prev) => [data.entry, ...prev]);
          setSubmittedMessage("✨ Your tribute has been published.");
        }
      } else {
        // Studio Preview simulation
        setSubmittedMessage("🕊️ Your tribute has been received with warmth and will appear once approved by the family.");
      }
      setAuthorName("");
      setMessage("");
    } catch {
      setSubmittedMessage("Thank you for your warm words.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlag = async (id: string) => {
    setFlaggedIds((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch("/api/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: id, action: "FLAG" }),
      });
    } catch {
      // Flag state already set locally
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch("/api/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: id, action: "APPROVE", token }),
      });
      setTributes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "APPROVED" } : t))
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-full h-full max-w-lg mx-auto flex flex-col items-center justify-between p-5 sm:p-6 text-center select-none overflow-y-auto">
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="pt-2 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 text-stone-300 border border-stone-700/60 text-xs font-serif tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Pre-Moderated Tribute Wall</span>
        </span>
      </div>

      {/* Main Wall Content */}
      <div className="my-auto py-3 z-10 flex flex-col items-center w-full">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-wide mb-1">
          {config.wallTitle || "Words of Remembrance"}
        </h2>
        <p className="text-xs text-stone-400 font-serif italic mb-4 max-w-sm">
          {config.wallSubtitle || "Leave a message of love, memory, and prayer"}
        </p>

        {/* Existing Tributes List */}
        <div className="w-full space-y-2.5 max-w-md max-h-52 overflow-y-auto pr-1 mb-4 text-left">
          {tributes
            .filter((t) => !flaggedIds[t.id])
            .map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-2xl bg-stone-900/70 border border-stone-800 text-left relative group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-serif font-bold text-amber-200">
                    {t.authorName}
                  </span>
                  <div className="flex items-center gap-2">
                    {isCreator && t.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(t.id)}
                        className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleFlag(t.id)}
                      title="Flag inappropriate message"
                      className="text-[10px] text-stone-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-0.5"
                    >
                      <Flag className="w-2.5 h-2.5" />
                      <span>Flag</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-stone-300 font-serif leading-relaxed">
                  &ldquo;{t.message}&rdquo;
                </p>
              </div>
            ))}
        </div>

        {/* Submission Feedback */}
        {submittedMessage ? (
          <div className="p-3 rounded-2xl bg-stone-900 border border-amber-500/30 text-amber-200 text-xs font-serif max-w-md w-full mb-3">
            {submittedMessage}
          </div>
        ) : (
          /* Tribute Form */
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-2 mb-3">
            <input
              type="text"
              value={authorName}
              maxLength={80}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your Name (e.g. Anand & Family)"
              required
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-serif"
            />
            <textarea
              value={message}
              maxLength={400}
              rows={2}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share a quiet prayer, memory, or condolence..."
              required
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-serif"
            />
            <div className="flex items-center justify-between text-[10px] text-stone-500 font-serif">
              <span>All messages are pre-moderated to protect this sacred space.</span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-amber-700/80 hover:bg-amber-600 text-white font-medium text-xs shadow transition cursor-pointer shrink-0 ml-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Tribute"}
              </button>
            </div>
          </form>
        )}

        {/* Continue Button */}
        <div className="mt-2 w-full max-w-xs">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onContinue}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 hover:from-stone-700 hover:to-stone-850 text-stone-200 font-serif font-semibold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-700/60"
          >
            <span>Closing Quiet Prayer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Respectful Footer */}
      <div className="pb-16 sm:pb-20 text-[10px] text-stone-500 font-serif italic z-10 max-w-xs">
        &ldquo;Love leaves a memory no one can steal.&rdquo;
      </div>
    </div>
  );
}

