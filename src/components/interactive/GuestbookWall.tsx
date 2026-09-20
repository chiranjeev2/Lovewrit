"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Flag,
  Check,
  Trash2,
  Send,
  Loader2,
  Users,
  UserCheck,
  Download,
  CalendarCheck,
  XCircle,
  Table as TableIcon,
} from "lucide-react";
import { isEventInviteOccasion } from "@/lib/templates-data";

interface GuestbookWallProps {
  slug: string;
  occasion?: string;
  token?: string | null;
  requireApproval?: boolean;
}

export interface GuestbookEntry {
  id: string;
  authorName: string;
  message: string;
  attendance?: string | null;
  headcount?: number | null;
  createdAt: string;
  status?: string;
}

interface RsvpStats {
  attendingCount: number;
  headcountTotal: number;
  regretsCount: number;
  totalResponses: number;
}

export default function GuestbookWall({
  slug,
  occasion = "anniversary",
  token,
  requireApproval = false,
}: GuestbookWallProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [stats, setStats] = useState<RsvpStats>({
    attendingCount: 0,
    headcountTotal: 0,
    regretsCount: 0,
    totalResponses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [attendance, setAttendance] = useState<"ATTENDING" | "REGRETS">("ATTENDING");
  const [headcount, setHeadcount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [showTableView, setShowTableView] = useState(false);

  const isEventInvite = isEventInviteOccasion(occasion);
  const isMemorial = occasion === "memorial";

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/guestbook?slug=${slug}${token ? `&token=${token}` : ""}`);
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries || []);
        if (data.stats) {
          setStats(data.stats);
        }
        setIsCreator(Boolean(data.isCreator));
      }
    } catch (err) {
      console.error("Failed to load guestbook", err);
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchEntries();
    });
  }, [fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim()) return;

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const payload: {
        slug: string;
        authorName: string;
        message: string;
        attendance?: string;
        headcount?: number;
      } = {
        slug,
        authorName,
        message,
      };

      if (isEventInvite) {
        payload.attendance = attendance;
        payload.headcount = attendance === "ATTENDING" ? headcount : 1;
      }

      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setAuthorName("");
        setMessage("");
        if (isEventInvite) {
          setAttendance("ATTENDING");
          setHeadcount(1);
        }

        if (data.isPending) {
          setSubmitFeedback(
            isMemorial
              ? "Your condolences have been submitted and are awaiting family review before appearing publicly. Thank you!"
              : "Your RSVP and note have been submitted and are awaiting host review before appearing publicly."
          );
        } else {
          setSubmitFeedback(
            isEventInvite
              ? "Thank you! Your RSVP and note have been recorded."
              : "Your message has been posted!"
          );
          void fetchEntries();
        }
      }
    } catch {
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
      void fetchEntries();
    } catch (err) {
      console.error("Moderation action error:", err);
    }
  };

  const handleDownloadCsv = () => {
    const csvUrl = `/api/guestbook?slug=${slug}${token ? `&token=${token}` : ""}&format=csv`;
    const link = document.createElement("a");
    link.href = csvUrl;
    link.download = `lovewrit-rsvp-${slug}.csv`;
    link.click();
  };

  return (
    <div className="mx-auto my-12 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-3">
        <div className="flex items-center space-x-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              isEventInvite
                ? "bg-amber-500/20 text-amber-400"
                : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {isEventInvite ? (
              <CalendarCheck className="h-4 w-4" />
            ) : (
              <MessageSquare className="h-4 w-4" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              {isEventInvite
                ? "Interactive RSVP & Guest Registry"
                : isMemorial
                ? "Condolences & Memories Wall"
                : "Wishes & Messages Wall"}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {isEventInvite
                ? "Let the hosts know if you can join, confirm headcount, and leave a blessing."
                : isMemorial
                ? "Leave your warm memories, prayers, and heartfelt condolences for the family."
                : "Leave a loving note, wish, or memory for the recipient."}
            </p>
          </div>
        </div>

        {requireApproval && (
          <span className="self-start sm:self-center inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Pre-Moderated
          </span>
        )}
      </div>

      {/* Live RSVP Headcount Tally (Event Invitations Only) */}
      {isEventInvite && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-300">Live Guest Count</p>
                <p className="text-lg font-bold text-white">
                  <span className="text-emerald-400">{stats.headcountTotal}</span> Attending
                  <span className="mx-2 text-neutral-600">•</span>
                  <span className="text-neutral-400 font-normal text-sm">
                    {stats.regretsCount} Regrets
                  </span>
                </p>
              </div>
            </div>

            {/* Host Actions (Export CSV & Table Toggle) */}
            {isCreator && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowTableView(!showTableView)}
                  className="inline-flex items-center space-x-1.5 rounded-xl border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition"
                >
                  <TableIcon className="h-3.5 w-3.5 text-amber-400" />
                  <span>{showTableView ? "Cards View" : "Table View"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="inline-flex items-center space-x-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition shadow-sm"
                  title="Export all guest responses to CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message / RSVP Submission Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
        {submitFeedback && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            {submitFeedback}
          </div>
        )}

        {/* Name input */}
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

        {/* RSVP Selectors (Only shown for event/invite occasions) */}
        {isEventInvite && (
          <div className="pt-1 space-y-3 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-medium text-neutral-300">Will you be attending?</label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAttendance("ATTENDING")}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    attendance === "ATTENDING"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Attending</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendance("REGRETS")}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    attendance === "REGRETS"
                      ? "bg-rose-500/80 text-white shadow-md shadow-rose-500/20 ring-1 ring-rose-400"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Regrets</span>
                </button>
              </div>
            </div>

            {attendance === "ATTENDING" && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="text-xs font-medium text-neutral-300">
                  Headcount (including you & family):
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setHeadcount(num)}
                      className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                        headcount === num
                          ? "bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
                      }`}
                    >
                      {num === 5 ? "5+" : num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Note / Blessing textarea */}
        <textarea
          rows={3}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isEventInvite
              ? "Leave a blessing, congratulations, or special dietary note for the host..."
              : isMemorial
              ? "Share your prayers, respect, or favorite memory..."
              : "Write your congratulatory note or heartfelt wish..."
          }
          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 leading-relaxed font-serif"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-neutral-400">
            {requireApproval
              ? "🔒 Entries are reviewed before displaying publicly."
              : "Publicly visible to visitors of this page."}
          </span>

          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition ${
              isEventInvite
                ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-amber-500/20"
                : "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/20"
            }`}
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>{isEventInvite ? "Submit RSVP" : "Post Message"}</span>
          </button>
        </div>
      </form>

      {/* Host Table View (if toggled on) */}
      {isEventInvite && isCreator && showTableView ? (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950/70 p-2">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Guest</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Headcount</th>
                <th className="py-2.5 px-3">Blessing / Note</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-500">
                    No RSVP records yet.
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition">
                    <td className="py-2.5 px-3 text-neutral-400 text-[11px] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                      {item.authorName}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.attendance === "REGRETS" ? (
                        <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                          Regrets
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          Attending
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {item.attendance === "REGRETS" ? "—" : item.headcount || 1}
                    </td>
                    <td className="py-2.5 px-3 font-serif max-w-xs truncate text-neutral-300" title={item.message}>
                      {item.message}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleModeration(item.id, "DELETE")}
                        className="text-neutral-500 hover:text-red-400 transition text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Standard Messages / RSVP List */
        <div className="space-y-3">
          {loading ? (
            <div className="py-6 text-center text-xs text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-rose-500 mb-2" />
              <span>Loading {isEventInvite ? "RSVP entries" : "messages"}...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-500">
              {isEventInvite
                ? "No RSVPs recorded yet. Be the first to confirm!"
                : "No messages posted yet. Be the first to leave a heartfelt word!"}
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

                    {/* RSVP Status badge (Only for event templates) */}
                    {isEventInvite && item.attendance && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          item.attendance === "REGRETS"
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        }`}
                      >
                        {item.attendance === "REGRETS"
                          ? "Regrets"
                          : `Attending (Party of ${item.headcount || 1})`}
                      </span>
                    )}

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
                  &ldquo;{item.message}&rdquo;
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
      )}
    </div>
  );
}
