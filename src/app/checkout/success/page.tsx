"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import confetti from "canvas-confetti";
import {
  Heart,
  CheckCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Loader2,
  Share2,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const slug = searchParams.get("slug");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(
          `/api/checkout/verify?session_id=${sessionId || ""}&slug=${slug || ""}`
        );
        const data = await res.json();
        if (!res.ok || !data.order) {
          throw new Error(data.error || "Order verification failed");
        }
        setOrder(data.order);

        // Trigger victory celebration confetti
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ["#f43f5e", "#ec4899", "#ffd700", "#10b981"],
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error verifying order");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [sessionId, slug]);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const targetSlug = order?.slug || slug;
  const isCard = order?.productType === "CARD";
  const shareUrl = `${origin}/${isCard ? "c" : "p"}/${targetSlug}`;

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
        <p className="text-sm font-medium text-neutral-300">
          Confirming payment and preparing your Memoir link...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-md my-16 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Order Notice</h2>
        <p className="text-xs text-neutral-400 mb-6">
          {error || "Unable to find order details."}
        </p>
        <Link
          href="/"
          className="rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-rose-500"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
        {/* Checkmark Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/25">
          <CheckCircle className="h-10 w-10" />
        </div>

        <span className="inline-block rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 uppercase tracking-wider border border-emerald-500/20 mb-3">
          Payment Confirmed • Ready to Share
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Your Memoir Is Ready!
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
          We have created your unique {isCard ? "digital card" : "interactive page"}.
          A copy has also been registered to <strong className="text-white">{order.customerEmail}</strong>.
        </p>

        {/* Shareable Link Box */}
        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 text-left">
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
            Your Unique Shareable Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3.5 py-2.5 text-xs text-rose-300 font-mono select-all focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-xs font-semibold text-white transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/${isCard ? "c" : "p"}/${targetSlug}`}
            className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition"
          >
            <span>Open Experience</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* Order Details receipt summary */}
        <div className="mt-10 border-t border-neutral-800/80 pt-6 text-left">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Receipt Details
          </h4>
          <div className="space-y-1.5 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>Order Reference:</span>
              <span className="font-mono text-neutral-300">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Product:</span>
              <span className="text-white">{order.productType === "CARD" ? "Digital Card" : "Template Page"}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="text-white">{order.customerName} ({order.customerEmail})</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-semibold text-emerald-400">
                {order.currency} {(order.amountTotal / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
