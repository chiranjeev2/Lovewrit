"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import PagePreview from "@/components/editor/PagePreview";
import OpeningMoment from "@/components/shared/OpeningMoment";
import AudioPlayer from "@/components/shared/AudioPlayer";
import { ColorThemeKey, TEMPLATES } from "@/lib/templates-data";
import { BUILTIN_AUDIO_TRACKS } from "@/lib/audio-tracks";
import {
  Heart,
  Share2,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
}

export default function TemplatePageView({ params }: TemplatePageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showOpeningMoment, setShowOpeningMoment] = useState(true);
  const [canPlayAudio, setCanPlayAudio] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/checkout/verify?slug=${slug}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Error loading page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [slug]);

  const copyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Fallback demo data if testing directly
  const pageData = order?.pageData || {
    senderName: "Aarav",
    recipientName: "Simran",
    occasion: "proposal",
    letter: "From the very first conversation, I knew you were the one. Every sunrise is brighter with you. Will you make me the happiest person and be mine forever?",
    photoUrls: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80",
      "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
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

  const musicUrl = pageData.musicTrack || null;
  const hasMusic = Boolean(musicUrl && musicUrl !== "none");

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-4 sm:p-8">
      {/* Heartfelt Opening Moment Reveal */}
      {showOpeningMoment && (
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

      {/* Floating Audio Player when audio is enabled and unboxed */}
      {hasMusic && canPlayAudio && (
        <AudioPlayer
          src={musicUrl}
          title={
            pageData.musicType === "custom"
              ? "Your Special Song"
              : "Acoustic Romance"
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
          <span className="font-bold">Memoir</span>
        </Link>

        <div className="flex items-center space-x-2">
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
          occasion={pageData.occasion}
          letter={pageData.letter}
          photoUrls={parsedPhotos}
          colorTheme={pageData.colorTheme as ColorThemeKey}
          isProposal={pageData.isProposal}
          musicTrackName={hasMusic ? "Ambient Melody" : undefined}
          previewOnly={false}
        />
      </main>

      {/* Footer watermark */}
      <footer className="py-6 text-center text-xs text-neutral-500">
        <p>Created with Memoir • Personalized Couple Moments</p>
      </footer>
    </div>
  );
}
