"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, ShieldCheck, Flag, Check, Trash2, Send, Loader2 } from "lucide-react";

interface GuestbookWallProps {
  slug: string;
  occasion?: string;
  token?: string | null;
  requireApproval?: boolean;
}

export default function GuestbookWall({
  slug,
  occasion = "anniversary",
  token,
  requireApproval = false,
}: GuestbookWallProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/guestbook?slug=${slug}${token ? `&token=${token}` : ""}`);
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries || []);
        setIsCreator(Boolean(data.isCreator));
      }
    } catch (err) {
      console.error("Failed to load guestbook", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [slug, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, authorName, message }),
      });
      const data = await res.json();

      if (res.ok) {
        setAuthorName("");
        setMessage("");
        if (data.isPending) {
          setSubmitFeedback("Your message has been submitted and is awaiting family review before appearing publicly. Thank you!");
        } else {
          setSubmitFeedback("Your message has been posted!");
          fetchEntries();
        }
      }
    } catch (err) {
      setSubmitFeedback("Error submitting message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeration = async (entryId: string, action: "APPROVE" | "DELETE" | "FLAG") => {
    try {
      await fetch("/api/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, action, token }),
      });
      fetchEntries();
    } catch (err) {
      console.error("Moderation action error:", err);
    }
  };

  const isMemorial = occasion === "memorial";

  return (
    <div className="mx-auto my-12 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              {isMemorial ? "Condolences & Memories Wall" : "Wishes & Messages Wall"}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {isMemorial
                ? "Leave your warm memories, prayers, and heartfelt condolences for the family."
                : "Leave a loving note, wish, or memory for the recipient."}
            </p>
          </div>
        </div>

        {requireApproval && (
          <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Pre-Moderated
          </span>
        )}
      </div>

      {/* Message Submission Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
        {submitFeedback && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            {submitFeedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <textarea
          rows={3}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isMemorial
              ? "Share your prayers, respect, or favorite memory..."
              : "Write your congratulatory note or heartfelt wish..."
          }
          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 leading-relaxed font-serif"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-neutral-400">
            {requireApproval
              ? "🔒 Comments are reviewed before displaying publicly."
              : "Publicly visible to visitors of this page."}
          </span>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-500/20 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>Post Message</span>
          </button>
        </div>
      </form>

      {/* Messages List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-rose-500 mb-2" />
            <span>Loading messages...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-500">
            No messages posted yet. Be the first to leave a heartfelt word!
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">{item.authorName}</span>
                  {item.status === "PENDING" && (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-400 uppercase">
                      Pending Review
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-neutral-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-neutral-200 font-serif leading-relaxed whitespace-pre-wrap">
                "{item.message}"
              </p>

              {/* Moderation Controls (for family/creator with token or master admin) */}
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <button
                  onClick={() => handleModeration(item.id, "FLAG")}
                  className="flex items-center space-x-1 text-neutral-500 hover:text-red-400 transition"
                  title="Report inappropriate message"
                >
                  <Flag className="h-3 w-3" />
                  <span>Report</span>
                </button>

                {isCreator && (
                  <div className="flex items-center space-x-2">
                    {item.status === "PENDING" && (
                      <button
                        onClick={() => handleModeration(item.id, "APPROVE")}
                        className="inline-flex items-center space-x-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 hover:bg-emerald-500/30"
                      >
                        <Check className="h-3 w-3" />
                        <span>Approve</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleModeration(item.id, "DELETE")}
                      className="inline-flex items-center space-x-1 rounded-md bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-red-300 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
