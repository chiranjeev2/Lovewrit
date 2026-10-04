"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { getBaseUrl } from "@/lib/base-url";
import { Sparkles, Users, Award, Copy, Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function CreatorsPage() {
  const [lookupInput, setLookupInput] = useState("");
  const [activeRecord, setActiveRecord] = useState<{
    code: string;
    ownerName: string;
    timesUsed: number;
    creditBalance: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Code Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPreferred, setNewPreferred] = useState("");
  const [createMsg, setCreateMsg] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : getBaseUrl();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setActiveRecord(null);

    try {
      const res = await fetch(`/api/referral?code=${encodeURIComponent(lookupInput.trim())}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setActiveRecord({
          code: data.code,
          ownerName: data.ownerName,
          timesUsed: data.timesUsed || 0,
          creditBalance: data.creditBalance || 0,
        });
      } else {
        setErrorMsg(data.message || data.error || "Creator code not found.");
      }
    } catch {
      setErrorMsg("Network error checking creator code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    setCreateLoading(true);
    setCreateMsg("");

    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          preferredCode: newPreferred.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveRecord({
          code: data.record.code,
          ownerName: data.record.ownerName,
          timesUsed: data.record.timesUsed || 0,
          creditBalance: data.record.creditBalance || 0,
        });
        setCreateMsg(`Success! Your code ${data.record.code} is ready.`);
      } else {
        setCreateMsg(data.error || "Failed to create code.");
      }
    } catch {
      setCreateMsg("Network error creating code.");
    } finally {
      setCreateLoading(false);
    }
  };

  const shareLink = activeRecord ? `${baseUrl}/r/${activeRecord.code}` : "";

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lovewrit Creators &amp; Referral Program</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Share Lovewrit. Earn Fixed Credit.
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-400 font-serif leading-relaxed">
            Give your friends ₹49 / $2 / €2 / £2 off their personalized cards &amp; keepsakes. Earn fixed store credit for every completed order.
          </p>
        </div>

        {/* Dashboard or Lookup / Signup Tabs */}
        {activeRecord ? (
          /* Active Creator Dashboard View */
          <div className="rounded-3xl border border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-neutral-900 to-neutral-950 p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold block">
                  Creator Profile
                </span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">
                  Welcome back, {activeRecord.ownerName}!
                </h2>
                <p className="text-xs text-neutral-400">Code: <span className="font-mono text-amber-300 font-bold">{activeRecord.code}</span></p>
              </div>

              <button
                type="button"
                onClick={() => setActiveRecord(null)}
                className="text-xs text-neutral-400 hover:text-white underline cursor-pointer self-start sm:self-auto"
              >
                Look up another code
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-400 block font-serif">Completed Referrals</span>
                <span className="text-3xl font-bold text-white mt-1 block font-mono">
                  {activeRecord.timesUsed}
                </span>
                <span className="text-[11px] text-emerald-400 mt-1 block">Friends celebrated on Lovewrit</span>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-xs text-neutral-400 block font-serif">Accumulated Store Credit</span>
                <span className="text-3xl font-bold text-amber-300 mt-1 block font-mono">
                  {activeRecord.creditBalance}
                </span>
                <span className="text-[11px] text-neutral-400 mt-1 block">Redeemable on future keepsakes</span>
              </div>
            </div>

            {/* Share Link Box */}
            <div className="p-5 rounded-2xl bg-black/60 border border-neutral-800 space-y-3">
              <label className="text-xs font-semibold text-neutral-300 block">
                Your Unique Tracked Referral Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs font-mono text-neutral-200 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 font-serif">
                Anyone who visits via this link receives an automatic ₹49 / $2 / €2 / £2 discount at checkout.
              </p>
            </div>

            {/* Payout & Terms Disclaimer */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 space-y-1 font-serif">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Program Integrity &amp; Abuse Protection</span>
              </div>
              <p>
                Self-referrals (using the same email or payment method) are automatically blocked. Cash payouts are currently out of scope; earned credit is redeemable towards any Lovewrit keepsake or card order.
              </p>
            </div>
          </div>
        ) : (
          /* Lookup & Generate Section */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lookup Existing Code */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Already Have a Code?</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Check Your Dashboard</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-serif">
                Enter your creator or referral code to view your referral count and accumulated store credit.
              </p>

              <form onSubmit={handleLookup} className="space-y-3 pt-2">
                <div>
                  <input
                    type="text"
                    value={lookupInput}
                    onChange={(e) => setLookupInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ALICE49"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white uppercase placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  {loading ? "Checking..." : "View Dashboard ↗"}
                </button>
              </form>
            </div>

            {/* Create New Code */}
            <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-neutral-900/60 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>New Creator?</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Generate Your Code</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-serif">
                Create your custom link in seconds. Share it on WhatsApp, Instagram, or blogs.
              </p>

              <form onSubmit={handleCreate} className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Preferred Code (Optional)</label>
                  <input
                    type="text"
                    value={newPreferred}
                    onChange={(e) => setNewPreferred(e.target.value.toUpperCase())}
                    placeholder="e.g. PRIYA2026"
                    maxLength={12}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white uppercase placeholder-neutral-600 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                {createMsg && (
                  <p className={`text-xs ${createMsg.includes("Success") ? "text-emerald-400" : "text-rose-400"}`}>
                    {createMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold transition cursor-pointer shadow-md"
                >
                  {createLoading ? "Creating..." : "Get My Creator Code 🚀"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
