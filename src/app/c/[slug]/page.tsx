"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import CardPreview from "@/components/editor/CardPreview";
import OpeningMoment from "@/components/shared/OpeningMoment";
import CountdownReveal from "@/components/interactive/CountdownReveal";
import QRCodeModal from "@/components/interactive/QRCodeModal";
import { ColorThemeKey, PhotoShapeKey, TEMPLATES } from "@/lib/templates-data";
import {
  Download,
  Share2,
  Check,
  Heart,
  Loader2,
  Sparkles,
  QrCode,
} from "lucide-react";
import { toPng, toJpeg } from "html-to-image";

interface CardSharePageProps {
  params: Promise<{ slug: string }>;
}

export default function CardSharePage({ params }: CardSharePageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showOpeningMoment, setShowOpeningMoment] = useState(true);
  const [isLockedCountdown, setIsLockedCountdown] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch(`/api/checkout/verify?slug=${slug}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setOrder(data.order);
          // Check countdown lock
          if (data.order.cardData?.revealAt) {
            const targetTime = new Date(data.order.cardData.revealAt).getTime();
            if (targetTime > Date.now()) {
              setIsLockedCountdown(true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading card:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, [slug]);

  const copyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = async (format: "png" | "jpeg" = "png") => {
    const node = document.getElementById("lovewrit-card-node");
    if (!node) return;

    setIsDownloading(true);
    try {
      const dataUrl =
        format === "png"
          ? await toPng(node, { quality: 0.95, pixelRatio: 2 })
          : await toJpeg(node, { quality: 0.95, pixelRatio: 2 });

      const link = document.createElement("a");
      link.download = `lovewrit-card-${order?.cardData?.recipientName || "love"}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download card error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  const cardData = order?.cardData || {
    senderName: "Dev",
    recipientName: "Ananya",
    occasion: "anniversary",
    message: "Three wonderful years, and I still fall for you a little more every day. Happy Anniversary!",
    photoUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    photoShape: "oval",
    colorTheme: "champagne",
    location: "Mumbai",
  };

  const template = TEMPLATES.find((t) => t.id === order?.templateId) || TEMPLATES[1];

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-4 sm:p-8">
      {/* QR Code Printable Modal */}
      <QRCodeModal
        url={currentUrl}
        title={`Lovewrit Card for ${cardData.recipientName}`}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      {/* Countdown Reveal Lock (if scheduled for the future) */}
      {isLockedCountdown && cardData.revealAt && (
        <CountdownReveal
          revealAt={cardData.revealAt}
          recipientName={cardData.recipientName}
          senderName={cardData.senderName}
          onUnlocked={() => setIsLockedCountdown(false)}
        />
      )}

      {/* Tailored Opening Moment Reveal */}
      {showOpeningMoment && !isLockedCountdown && (
        <OpeningMoment
          revealType={template.revealType}
          senderName={cardData.senderName}
          recipientName={cardData.recipientName}
          occasion={cardData.occasion}
          onOpen={() => setShowOpeningMoment(false)}
        />
      )}

      {/* Top Bar */}
      <header className="w-full max-w-2xl flex items-center justify-between py-2">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xs font-serif text-neutral-400 hover:text-white transition"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-white">
            <Heart className="h-3.5 w-3.5 fill-white" />
          </div>
          <span className="font-bold">Lovewrit</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center space-x-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition"
            title="Generate QR Code"
          >
            <QrCode className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">QR Code</span>
          </button>

          <button
            onClick={copyLink}
            className="flex items-center space-x-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied Link</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Digital Card Centerpiece */}
      <main className="my-auto py-6 w-full flex flex-col items-center">
        {(() => {
          let parsedCardPhotos: string[] = [];
          try {
            if (cardData.photoUrl?.startsWith("[")) {
              parsedCardPhotos = JSON.parse(cardData.photoUrl);
            } else if (cardData.photoUrl) {
              parsedCardPhotos = [cardData.photoUrl];
            }
          } catch {
            parsedCardPhotos = cardData.photoUrl ? [cardData.photoUrl] : [];
          }
          return (
            <CardPreview
              cardRef={cardRef}
              senderName={cardData.senderName}
              recipientName={cardData.recipientName}
              occasion={cardData.occasion}
              message={cardData.message}
              photoUrl={cardData.photoUrl}
              photoUrls={parsedCardPhotos}
              photoShape={cardData.photoShape as PhotoShapeKey}
              colorTheme={cardData.colorTheme as ColorThemeKey}
              location={cardData.location}
              venueName={cardData.venueName}
              venueAddress={cardData.venueAddress}
              venueMapUrl={cardData.venueMapUrl}
              eventDate={cardData.eventDate}
              eventTime={cardData.eventTime}
              voiceMessageUrl={cardData.voiceMessageUrl}
              showOmMotif={Boolean(cardData.showOmMotif)}
              showBismillah={Boolean(cardData.showBismillah)}
            />
          );
        })()}

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => handleDownloadImage("png")}
            disabled={isDownloading}
            className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Download High-Res Card (PNG)</span>
          </button>

          <button
            onClick={() => handleDownloadImage("jpeg")}
            disabled={isDownloading}
            className="inline-flex items-center space-x-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-5 py-3 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition disabled:opacity-50"
          >
            <span>Download JPG</span>
          </button>
        </div>

        {/* 50% OFF Reply / Regift Call To Action */}
        <div className="mt-10 w-full max-w-lg rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-neutral-900 to-amber-950/30 p-6 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="inline-block rounded-full bg-rose-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-300 border border-rose-500/30 mb-2">
            Emotional Reply Perk
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-1.5">
            Send love back to {cardData.senderName || "them"}
          </h3>
          <p className="text-xs text-neutral-300 max-w-sm mx-auto mb-5 leading-relaxed">
            Touched by this gesture? Reply back to {cardData.senderName || "them"} with your own custom digital card or interactive page and claim <span className="text-amber-400 font-bold">50% OFF</span>!
          </p>
          <Link
            href={`/create/be-my-girlfriend?to=${encodeURIComponent(cardData.senderName || "")}&replyTo=${slug}&discount=REGIFT50`}
            className="inline-flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition"
          >
            <Heart className="h-4 w-4 fill-white" />
            <span>Reply to {cardData.senderName || "Them"} (50% OFF)</span>
          </Link>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-neutral-500">
        <p>Created with Lovewrit • Personalized Keepsakes</p>
      </footer>
    </div>
  );
}
