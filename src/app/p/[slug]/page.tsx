"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PagePreview from "@/components/editor/PagePreview";
import OpeningMoment from "@/components/shared/OpeningMoment";
import CountdownReveal from "@/components/interactive/CountdownReveal";
import QRCodeModal from "@/components/interactive/QRCodeModal";
import GuestbookWall from "@/components/interactive/GuestbookWall";
import AudioPlayer from "@/components/shared/AudioPlayer";
import { ColorThemeKey, TEMPLATES } from "@/lib/templates-data";
import { BUILTIN_AUDIO_TRACKS } from "@/lib/audio-tracks";
import {
  Heart,
  Share2,
  Check,
  Loader2,
  Sparkles,
  QrCode,
  Lock,
  Gift,
  Copy,
} from "lucide-react";
import { FontFamilyKey, AmbientEffectKey } from "@/lib/templates-data";

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
}

export default function TemplatePageView({ params }: TemplatePageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showOpeningMoment, setShowOpeningMoment] = useState(true);
  const [canPlayAudio, setCanPlayAudio] = useState(false);
  const [isLockedCountdown, setIsLockedCountdown] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // PIN Protection state
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);

  useEffect(() => {
    async function loadPage() {
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
          if (data.order.pageData?.revealAt) {
            const targetTime = new Date(data.order.pageData.revealAt).getTime();
            if (targetTime > Date.now()) {
              setIsLockedCountdown(true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
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

  const handleSendReaction = async (text: string) => {
    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          pageDataId: order?.pageData?.id,
          senderName: order?.pageData?.recipientName || "Recipient",
          reactionType: "text",
          message: text,
        }),
      });
    } catch (err) {
      console.error("Failed to submit reaction:", err);
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
              {order.customerName || "The sender"} has protected this interactive keepsake with a private PIN.
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

  const pageData = order?.pageData || {
    senderName: "Aarav",
    recipientName: "Simran",
    occasion: "proposal",
    letter: "From the very first conversation, I knew you were the one. Every sunrise is brighter with you. Will you make me the happiest person and be mine forever?",
    photoUrls: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
    ],
    musicTrack: BUILTIN_AUDIO_TRACKS[0].url,
    musicType: "builtin",
    isProposal: true,
    colorTheme: "rose",
  };

  const template =
    TEMPLATES.find((t) => t.id === order?.templateId) || TEMPLATES[0];

  let parsedPhotos: string[] = [];
  try {
    parsedPhotos =
      typeof pageData.photoUrls === "string"
        ? JSON.parse(pageData.photoUrls)
        : pageData.photoUrls || [];
  } catch {
    parsedPhotos = [];
  }

  let parsedTimeline: any[] | undefined;
  try {
    if (pageData.timelineJson) {
      parsedTimeline = JSON.parse(pageData.timelineJson);
    }
  } catch {}

  let parsedSecretNotes: any[] | undefined;
  try {
    if (pageData.secretNotesJson) {
      parsedSecretNotes = JSON.parse(pageData.secretNotesJson);
    }
  } catch {}

  const musicUrl = pageData.musicTrack || null;
  const hasMusic = Boolean(musicUrl && musicUrl !== "none");
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-4 sm:p-8">
      {/* QR Code Printable Modal */}
      <QRCodeModal
        url={currentUrl}
        title={`Lovewrit Page for ${pageData.recipientName}`}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      {/* Countdown Reveal Lock (if scheduled for the future) */}
      {isLockedCountdown && pageData.revealAt && (
        <CountdownReveal
          revealAt={pageData.revealAt}
          recipientName={pageData.recipientName}
          senderName={pageData.senderName}
          onUnlocked={() => setIsLockedCountdown(false)}
        />
      )}

      {/* Heartfelt Opening Moment Reveal */}
      {showOpeningMoment && !isLockedCountdown && (
        <OpeningMoment
          revealType={template.revealType}
          senderName={pageData.senderName}
          recipientName={pageData.recipientName}
          occasion={pageData.occasion}
          hasMusic={hasMusic}
          onOpen={() => {
            setShowOpeningMoment(false);
            setCanPlayAudio(true);
          }}
        />
      )}

      {/* Floating Audio Player when unboxed */}
      {hasMusic && canPlayAudio && (
        <AudioPlayer
          src={musicUrl}
          title={
            pageData.musicType === "custom"
              ? "Your Special Song"
              : "Occasion Soundtrack"
          }
          autoPlay={true}
        />
      )}

      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2">
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

      {/* Main Experience Centerpiece */}
      <main className="w-full max-w-4xl my-6">
        <PagePreview
          senderName={pageData.senderName}
          recipientName={pageData.recipientName}
          nickname={order?.nickname}
          occasion={pageData.occasion}
          letter={pageData.letter}
          photoUrls={parsedPhotos}
          colorTheme={pageData.colorTheme as ColorThemeKey}
          collageLayout={(pageData.collageLayout as any) || "masonry"}
          fontFamily={(pageData.fontFamily as FontFamilyKey) || "serif"}
          ambientEffect={(pageData.ambientEffect as AmbientEffectKey) || "none"}
          timeline={parsedTimeline}
          secretNotes={parsedSecretNotes}
          milestoneVenue={pageData.milestoneVenue}
          tipUpiId={order?.tipUpiId}
          tipPaypalUsername={order?.tipPaypalUsername}
          onSendReaction={handleSendReaction}
          isProposal={pageData.isProposal}
          proposalQuestion={pageData.proposalQuestion}
          venueName={pageData.venueName}
          venueAddress={pageData.venueAddress}
          venueMapUrl={pageData.venueMapUrl}
          eventDate={pageData.eventDate}
          eventTime={pageData.eventTime}
          voiceMessageUrl={pageData.voiceMessageUrl}
          musicTrackName={hasMusic ? "Ambient Soundtrack" : undefined}
          previewOnly={false}
          showOmMotif={Boolean(pageData.showOmMotif)}
          showBismillah={Boolean(pageData.showBismillah)}
          isAdSupported={Boolean(pageData.isAdSupported || order?.isAdSupported)}
        />

        {/* Phase 2: Recipient / Guest Wishes Wall */}
        <GuestbookWall
          slug={slug}
          occasion={pageData.occasion}
          token={token || order?.adminToken}
          requireApproval={pageData.requireGuestbookApproval}
        />

        {/* Referral Perk Card */}
        {order?.myReferralCode && (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-center backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Give friends ₹49 / $2 OFF</p>
                <p className="text-xs text-neutral-400">
                  Share your referral code: <span className="font-mono text-amber-300 font-bold">{order.myReferralCode}</span>
                </p>
              </div>
            </div>
            <button
              onClick={copyReferralCode}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center space-x-2 transition"
            >
              {copiedReferral ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Copied Code</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Referral Code</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 50% OFF Reply / Regift Call To Action */}
        <div className="mt-8 rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-neutral-900 to-amber-950/30 p-6 sm:p-8 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-300 border border-rose-500/30 mb-2">
            Emotional Reply Perk
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
            Touched by {pageData.senderName || "this moment"}?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto mb-6 leading-relaxed">
            Reply back to {pageData.senderName || "them"} with your own custom digital card or interactive keepsake page and claim <span className="text-amber-400 font-bold">50% OFF</span>!
          </p>
          <Link
            href={`/create/be-my-girlfriend?to=${encodeURIComponent(pageData.senderName || "")}&replyTo=${slug}&discount=REGIFT50`}
            className="inline-flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 px-7 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition"
          >
            <Heart className="h-4 w-4 fill-white" />
            <span>Reply to {pageData.senderName || "Them"} (50% OFF)</span>
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-neutral-500">
        <p>Created with Lovewrit • Personalized Occasion Moments</p>
      </footer>
    </div>
  );
}
