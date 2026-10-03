"use client";

import React, { useState } from "react";
import { Heart, Send, CheckCircle, MessageSquare } from "lucide-react";
import confetti from "canvas-confetti";

interface ForgiveReplySceneProps {
  title?: string;
  subtitle?: string;
  senderName: string;
  recipientName: string;
  promptText?: string;
  forgiveButtonText?: string;
  replyPlaceholder?: string;
  onForgive?: () => void;
  onSendReply?: (text: string) => Promise<void>;
}

export function ForgiveReplyScene({
  title,
  subtitle,
  senderName,
  recipientName,
  promptText = "Can we start fresh?",
  forgiveButtonText = "I Forgive You ❤️",
  replyPlaceholder,
  onForgive,
  onSendReply,
}: ForgiveReplySceneProps) {
  const [hasForgiven, setHasForgiven] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replySent, setReplySent] = useState(false);

  const handleForgive = () => {
    if (hasForgiven) return;
    setHasForgiven(true);

    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f43f5e", "#fb7185", "#38bdf8", "#34d399"],
      });
    } catch {
      // ignore
    }

    if (onForgive) onForgive();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSending) return;
    setIsSending(true);

    try {
      if (onSendReply) {
        await onSendReply(replyText.trim());
      } else {
        // Fallback local simulate
        await new Promise((r) => setTimeout(r, 600));
      }
      setReplySent(true);
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between p-6 select-none overflow-y-auto">
      {/* Header */}
      <div className="text-center pt-8 sm:pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-rose-400 block mb-1">
          A Fresh Start
        </span>
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
          {title || "Can We Start Fresh?"}
        </h2>
        <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto">
          {subtitle || "Take your time — whenever you are ready."}
        </p>
      </div>

      {/* Main Forgive Action Card */}
      <div className="my-auto py-4 space-y-6">
        {!hasForgiven ? (
          <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-950/40 via-neutral-900/90 to-black/80 p-6 text-center shadow-xl backdrop-blur-md">
            <p className="text-sm font-serif italic text-rose-200 mb-5">
              &ldquo;{promptText}&rdquo;
            </p>

            <button
              type="button"
              onClick={handleForgive}
              className="w-full inline-flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition"
            >
              <Heart className="h-4 w-4 fill-white" />
              <span>{forgiveButtonText}</span>
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-neutral-900/90 to-black/80 p-6 text-center shadow-xl backdrop-blur-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2 border border-emerald-500/40">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">
              Thank You For Your Grace ❤️
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              Your forgiveness means everything to {senderName}.
            </p>
          </div>
        )}

        {/* Reply Message Form */}
        <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-300">
            <MessageSquare className="h-3.5 w-3.5 text-rose-400" />
            <span>Send a reply note to {senderName}</span>
          </div>

          {!replySent ? (
            <form onSubmit={handleSend} className="space-y-2.5">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={replyPlaceholder || `Say something back to ${senderName}...`}
                rows={3}
                maxLength={400}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950/80 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition resize-none font-serif leading-relaxed"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || isSending}
                className={`w-full inline-flex items-center justify-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  replyText.trim() && !isSending
                    ? "bg-white/15 hover:bg-white/25 text-white active:scale-95"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                <Send className="h-3 w-3" />
                <span>{isSending ? "Sending..." : "Send Note Back"}</span>
              </button>
            </form>
          ) : (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 p-3 text-center">
              <span className="text-xs text-emerald-300 font-medium">
                ✓ Your reply note has been sent to {senderName}!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer spacer */}
      <div className="pb-16 sm:pb-20 text-center text-[10px] text-neutral-500">
        Crafted on Lovewrit • Keep this keepsake forever
      </div>
    </div>
  );
}
