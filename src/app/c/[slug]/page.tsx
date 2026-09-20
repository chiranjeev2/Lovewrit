"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import CardPreview, { StickerItem } from "@/components/editor/CardPreview";
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
  Lock,
  Printer,
  Copy,
  Gift,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toPng, toJpeg } from "html-to-image";
import { FontFamilyKey, CardBorderStyleKey } from "@/lib/templates-data";
import { generateFoldableCardPdf } from "@/lib/pdf-export";

export interface CardCustomData {
  senderName: string;
  recipientName: string;
  occasion: string;
  message: string;
  secondaryMessage?: string;
  photoUrl?: string;
  photoShape?: PhotoShapeKey;
  colorTheme?: ColorThemeKey;
  fontFamily?: FontFamilyKey;
  borderStyle?: CardBorderStyleKey;
  stickersJson?: string;
  isFlipReveal?: boolean;
  location?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  eventDate?: string;
  eventTime?: string;
  voiceMessageUrl?: string | null;
  revealAt?: string | null;
  showOmMotif?: boolean;
  showBismillah?: boolean;
}

export interface CardOrderRecord {
  id: string;
  slug: string;
  templateId: string;
  senderName: string;
  recipientName: string;
  customerName?: string | null;
  nickname?: string | null;
  pinCode?: string | null;
  tipUpiId?: string | null;
  tipPaypalUsername?: string | null;
  myReferralCode?: string | null;
  revealAt?: string | null;
  tier: string;
  customData: string;
  createdAt: string;
  cardData?: CardCustomData;
}

interface CardSharePageProps {
  params: Promise<{ slug: string }>;
}

export default function CardSharePage({ params }: CardSharePageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<CardOrderRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showOpeningMoment, setShowOpeningMoment] = useState(true);
  const [isLockedCountdown, setIsLockedCountdown] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // PIN Protection state
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch(`/api/checkout/verify?slug=${slug}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setOrder(data.order);
          // If no PIN set, automatically unlocked
          if (!data.order.pinCode) {
            setIsPinUnlocked(true);
          }
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

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (order?.pinCode && enteredPin.trim() === order.pinCode.trim()) {
      setIsPinUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const copyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralCode = () => {
    if (order?.myReferralCode && typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(order.myReferralCode);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  const convertDataUrlToJpeg = (pngDataUrl: string, bgColor: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(pngDataUrl);
          return;
        }
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.onerror = () => resolve(pngDataUrl);
      img.src = pngDataUrl;
    });
  };

  const handleDownloadImage = async (format: "png" | "jpeg" | "print" = "png") => {
    const node = cardRef.current || document.getElementById("lovewrit-card-node");
    if (!node) {
      setDownloadError("Could not locate card for download.");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    const isPrint = format === "print";
    const isScroll = order?.cardData?.colorTheme === "scroll";
    const cardBgColor = isScroll ? "#fcf7ec" : "#0a0a0a";

    // Measure exact geometry to prevent responsive margins (e.g. mx-auto) or viewport offsets
    // from shifting the cloned card out of the SVG foreignObject canvas bounds.
    const rect = node.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    const baseOptions = {
      quality: 0.98,
      cacheBust: false,
      backgroundColor: cardBgColor,
      width,
      height,
      style: {
        margin: "0",
        marginLeft: "0",
        marginRight: "0",
        marginTop: "0",
        marginBottom: "0",
        transform: "none",
        position: "static",
        left: "0",
        top: "0",
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: "none",
        maxHeight: "none",
      },
      imagePlaceholder:
        "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23171717' width='100' height='100'/%3E%3C/svg%3E",
    };

    try {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }
      let dataUrl: string = "";
      // 3.5 ratio produces ~1400x1750px which equals 300 DPI for standard 4.6x5.8" greeting prints
      const primaryRatio = isPrint ? 3.5 : 2;

      const attemptCapture = async (ratio: number) => {
        const opts = {
          ...baseOptions,
          pixelRatio: ratio,
          canvasWidth: Math.round(width * ratio),
          canvasHeight: Math.round(height * ratio),
        };
        if (format === "jpeg") {
          try {
            return await toJpeg(node, opts);
          } catch {
            const png = await toPng(node, opts);
            return await convertDataUrlToJpeg(png, cardBgColor);
          }
        }
        return await toPng(node, opts);
      };

      try {
        dataUrl = await attemptCapture(primaryRatio);
      } catch (firstErr) {
        console.warn(`Initial capture at pixelRatio ${primaryRatio} failed, retrying at ratio 2...`, firstErr);
        dataUrl = await attemptCapture(2);
      }

      if (!dataUrl) {
        throw new Error("Failed to generate image data.");
      }

      const link = document.createElement("a");
      const suffix = isPrint ? "-print-300dpi" : "";
      const ext = format === "jpeg" ? "jpg" : "png";
      const safeRecipient = (order?.cardData?.recipientName || "love")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      link.download = `lovewrit-card-${safeRecipient}${suffix}.${ext}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download card error:", err);
      setDownloadError("Download could not be generated. Please try again or use the Foldable Card PDF option.");
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

  // PIN Protection Gate
  if (!isPinUnlocked && order?.pinCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 text-center backdrop-blur-xl shadow-2xl space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-xl font-bold">Passcode Protected</h2>
            <p className="text-xs text-neutral-400">
              {order.customerName || "The sender"} has locked this keepsake with a private PIN.
            </p>
          </div>
          <form onSubmit={handleUnlockPin} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError(false);
              }}
              placeholder="Enter numeric PIN"
              className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white focus:outline-none focus:border-rose-500"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-rose-400 font-medium">
                Incorrect PIN. Please check with the sender.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:opacity-90 transition"
            >
              Unlock Keepsake
            </button>
          </form>
        </div>
      </div>
    );
  }

  const cardData: CardCustomData = order?.cardData || {
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

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      await generateFoldableCardPdf({
        senderName: cardData.senderName,
        recipientName: cardData.recipientName,
        occasion: cardData.occasion,
        message: cardData.message,
        secondaryMessage: cardData.secondaryMessage,
        fontFamily: cardData.fontFamily,
        colorTheme: cardData.colorTheme,
        borderStyle: cardData.borderStyle,
        location: cardData.location,
        eventDate: cardData.eventDate,
        shareUrl: currentUrl,
        cardRef: cardRef.current,
      });
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

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
              const arr = JSON.parse(cardData.photoUrl);
              parsedCardPhotos = Array.isArray(arr)
                ? arr.filter((u): u is string => Boolean(u && typeof u === "string" && u.trim().length > 0))
                : [];
            } else if (cardData.photoUrl && cardData.photoUrl.trim()) {
              parsedCardPhotos = [cardData.photoUrl.trim()];
            }
          } catch {
            parsedCardPhotos = cardData.photoUrl?.trim() ? [cardData.photoUrl.trim()] : [];
          }

          let parsedStickers: StickerItem[] | undefined;
          try {
            if (cardData.stickersJson) {
              parsedStickers = JSON.parse(cardData.stickersJson);
            }
          } catch {}

          return (
            <CardPreview
              cardRef={cardRef}
              senderName={cardData.senderName}
              recipientName={cardData.recipientName}
              nickname={order?.nickname}
              occasion={cardData.occasion}
              message={cardData.message}
              secondaryMessage={cardData.secondaryMessage}
              fontFamily={(cardData.fontFamily as FontFamilyKey) || "serif"}
              borderStyle={(cardData.borderStyle as CardBorderStyleKey) || "classic"}
              stickers={parsedStickers}
              isFlipReveal={Boolean(cardData.isFlipReveal)}
              photoUrl={cardData.photoUrl || ""}
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

        {/* Action Controls & High-DPI Print Export */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleDownloadImage("png")}
            disabled={isDownloading || isExportingPdf}
            className="inline-flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Download PNG</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading || isExportingPdf}
            className="inline-flex items-center space-x-2 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-amber-500/20 px-5 py-3 text-xs font-bold text-amber-200 hover:bg-amber-500/30 hover:text-white shadow-lg shadow-amber-500/15 hover:scale-105 active:scale-95 transition disabled:opacity-50"
            title="Download a foldable 2-page duplex greeting card PDF (5x7 standard) with front cover, inside note, and back panel QR code"
          >
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
            ) : (
              <FileText className="h-4 w-4 text-amber-400" />
            )}
            <span>Foldable Card (PDF)</span>
          </button>

          <button
            onClick={() => handleDownloadImage("print")}
            disabled={isDownloading || isExportingPdf}
            className="inline-flex items-center space-x-2 rounded-2xl border border-rose-500/40 bg-neutral-900/90 px-5 py-3 text-xs font-bold text-rose-300 hover:bg-neutral-800 hover:text-white shadow-lg shadow-rose-500/10 hover:scale-105 active:scale-95 transition disabled:opacity-50"
            title="Export high-resolution 300 DPI image suited for physical 4x6 / 5x7 prints"
          >
            <Printer className="h-4 w-4 text-rose-400" />
            <span>Print-Ready (300 DPI)</span>
          </button>

          <button
            onClick={() => handleDownloadImage("jpeg")}
            disabled={isDownloading || isExportingPdf}
            className="inline-flex items-center space-x-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 px-5 py-3 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition disabled:opacity-50"
          >
            <span>Download JPG</span>
          </button>
        </div>

        {/* Download Error Alert if needed */}
        {downloadError && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/60 px-4 py-2.5 text-xs text-red-200 max-w-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{downloadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadError(null)}
              className="ml-2 text-red-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Referral Perk Card */}
        {order?.myReferralCode && (
          <div className="mt-6 w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-center backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Give friends ₹49 / $2 OFF</p>
                <p className="text-[11px] text-neutral-400">
                  Share your referral code: <span className="font-mono text-amber-300 font-bold">{order.myReferralCode}</span>
                </p>
              </div>
            </div>
            <button
              onClick={copyReferralCode}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center space-x-1.5 transition"
            >
              {copiedReferral ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 50% OFF Reply / Regift Call To Action */}
        <div className="mt-8 w-full max-w-lg rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-neutral-900 to-amber-950/30 p-6 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
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
