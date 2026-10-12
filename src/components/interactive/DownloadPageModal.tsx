"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Globe,
  FileText,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  InteractivePageExportOptions,
  downloadInteractiveHtmlKeepsake,
  downloadInteractivePagePdf,
  downloadInteractivePageImage,
} from "@/lib/interactive-page-export";

interface DownloadPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: InteractivePageExportOptions;
  pageNodeId?: string;
}

export default function DownloadPageModal({
  isOpen,
  onClose,
  options,
  pageNodeId = "lovewrit-page-node",
}: DownloadPageModalProps) {
  const [isGenerating, setIsGenerating] = useState<"html" | "pdf" | "png" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadHtml = async () => {
    setIsGenerating("html");
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await downloadInteractiveHtmlKeepsake(options);
      setSuccessMsg("Offline interactive HTML downloaded!");
    } catch (err) {
      console.error("HTML export error:", err);
      setErrorMsg("Could not generate HTML file. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGenerating("pdf");
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await downloadInteractivePagePdf(options);
      setSuccessMsg("Keepsake PDF document downloaded!");
    } catch (err) {
      console.error("PDF export error:", err);
      setErrorMsg("Could not generate PDF document. Please try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadPng = async () => {
    setIsGenerating("png");
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await downloadInteractivePageImage(pageNodeId, {
        recipientName: options.recipientName,
        format: "png",
      });
      setSuccessMsg("High-resolution keepsake image downloaded!");
    } catch (err) {
      console.error("Image export error:", err);
      // Fallback: If DOM node capture fails (e.g. In scene container), offer HTML instead
      setErrorMsg("Image capture is available for static preview mode. Try downloading the Interactive HTML or PDF instead.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl border border-neutral-800 bg-neutral-900/95 p-5 sm:p-7 text-left shadow-2xl backdrop-blur-xl my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close download modal"
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Download className="h-4 w-4" />
          <span>Save Your Keepsake</span>
        </div>

        <h3 id="download-modal-title" className="font-serif text-xl sm:text-2xl font-bold text-white mb-1.5">
          Download Interactive Page
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 mb-5 leading-relaxed">
          Keep this cherished memory forever on your device or share it with loved ones.
        </p>

        {/* Feedback Notifications */}
        {errorMsg && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/60 p-3 text-xs text-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="ml-2 text-red-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-200">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Options Stack */}
        <div className="space-y-3.5">
          {/* Format 1: Standalone Offline HTML */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 sm:p-4 transition hover:border-rose-500/50">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-block rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wide border border-rose-500/30 mb-1">
                  Recommended • 100% Offline
                </span>
                <h4 className="font-serif text-sm sm:text-base font-bold text-white">
                  Interactive Webpage (.html)
                </h4>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                <Globe className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-300 mb-3 leading-relaxed">
              Complete standalone webpage with background audio, letter reveals, responsive photo gallery, and secret notes. Works offline on any phone or computer.
            </p>
            <button
              type="button"
              onClick={handleDownloadHtml}
              disabled={Boolean(isGenerating)}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 px-4 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              {isGenerating === "html" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Preparing Interactive HTML...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Download Interactive HTML</span>
                </>
              )}
            </button>
          </div>

          {/* Format 2: Commemorative Keepsake PDF */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 sm:p-4 transition hover:border-amber-500/50">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wide border border-amber-500/30 mb-1">
                  Printable & Archival
                </span>
                <h4 className="font-serif text-sm sm:text-base font-bold text-white">
                  Keepsake Document (.pdf)
                </h4>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-300 mb-3 leading-relaxed">
              Multi-page commemorative document with the heartfelt letter, milestones, landmark venue, and scan-to-experience QR code.
            </p>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={Boolean(isGenerating)}
              className="w-full flex items-center justify-center space-x-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-amber-500/20 py-3 px-4 text-xs font-bold text-amber-200 hover:text-white hover:bg-amber-500/30 transition active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              {isGenerating === "pdf" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                  <span>Generating Keepsake PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Download Keepsake PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Format 3: High-Res Image Poster */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3.5 sm:p-4 transition hover:border-neutral-700">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-block rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-bold text-neutral-300 uppercase tracking-wide border border-neutral-700 mb-1">
                  Image & Social
                </span>
                <h4 className="font-serif text-sm sm:text-base font-bold text-white">
                  High-Resolution Poster (.png)
                </h4>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 mb-3 leading-relaxed">
              High-resolution image of the keepsake, suited for photo gallery saving, messaging on WhatsApp, or framing.
            </p>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={Boolean(isGenerating)}
              className="w-full flex items-center justify-center space-x-2 rounded-xl border border-neutral-700 bg-neutral-800/80 py-3 px-4 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-700 transition active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              {isGenerating === "png" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-300" />
                  <span>Capturing Image...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span>Download High-Res PNG</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 text-center text-[10px] text-neutral-500 font-serif">
          Forever preserved • Designed for phones, tablets & desktops
        </div>
      </div>
    </div>
  );
}

