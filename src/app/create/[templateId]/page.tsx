"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CardPreview from "@/components/editor/CardPreview";
import PagePreview from "@/components/editor/PagePreview";
import { useApp } from "@/context/AppContext";
import {
  TEMPLATES,
  getTemplateById,
  ColorThemeKey,
  PhotoShapeKey,
  COLOR_THEMES,
} from "@/lib/templates-data";
import {
  PRICING_TIERS,
  TierType,
  calculateOrderTotal,
} from "@/lib/currency";
import { BUILTIN_AUDIO_TRACKS } from "@/lib/audio-tracks";
import { LanguageCode, LANGUAGES, TRANSLATIONS } from "@/lib/i18n";
import {
  Heart,
  Sparkles,
  ArrowLeft,
  Upload,
  Music,
  Check,
  CreditCard,
  Mic,
  Calendar,
  Clock,
  MapPin,
  Flame,
  Zap,
  Info,
  Layers,
  Loader2,
  AlertCircle,
  Eye,
  Sliders,
} from "lucide-react";

interface CreatePageProps {
  params: Promise<{ templateId: string }>;
}

export default function CreateTemplatePage({ params }: CreatePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currency, region, language, setLanguage, t } = useApp();

  const templateId = resolvedParams.templateId;
  const template = getTemplateById(templateId) || TEMPLATES[0];

  // Selected format & tier
  const [productType, setProductType] = useState<"CARD" | "PAGE">(
    template.supportedFormats.includes("PAGE") ? "PAGE" : "CARD"
  );
  const [tier, setTier] = useState<TierType>("SELF_SERVICE");
  const [isBundle, setIsBundle] = useState<boolean>(false);
  const [customNotes, setCustomNotes] = useState<string>("");

  // Form states
  const [senderName, setSenderName] = useState<string>(template.sampleSender);
  const [recipientName, setRecipientName] = useState<string>(template.sampleRecipient);
  const [occasion, setOccasion] = useState<string>(template.occasion);
  const [location, setLocation] = useState<string>(template.sampleLocation || "");
  const [venueName, setVenueName] = useState<string>("");
  const [venueAddress, setVenueAddress] = useState<string>("");
  const [venueMapUrl, setVenueMapUrl] = useState<string>("");
  const [message, setMessage] = useState<string>(template.sampleMessage);
  const [selectedTheme, setSelectedTheme] = useState<ColorThemeKey>(template.defaultTheme);
  const [photoShape, setPhotoShape] = useState<PhotoShapeKey>(template.defaultShape);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language);

  // Photo uploads
  const [cardPhoto, setCardPhoto] = useState<string>(template.samplePhotos[0] || "");
  const [pagePhotos, setPagePhotos] = useState<string[]>(template.samplePhotos || []);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Audio settings
  const [musicOption, setMusicOption] = useState<"builtin" | "custom" | "none">("builtin");
  const [selectedBuiltinTrack, setSelectedBuiltinTrack] = useState<string>(BUILTIN_AUDIO_TRACKS[0].id);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string>("");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Phase 2: Voice memo upload (2MB cap)
  const [voiceMemoUrl, setVoiceMemoUrl] = useState<string | null>(null);
  const [voiceMemoName, setVoiceMemoName] = useState<string>("");
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Phase 2: Timed reveal
  const [enableRevealCountdown, setEnableRevealCountdown] = useState<boolean>(false);
  const [revealDateTime, setRevealDateTime] = useState<string>("");

  // Proposal toggle
  const [isProposal, setIsProposal] = useState<boolean>(
    template.hasInteractiveDodging || template.occasion === "proposal"
  );

  // Customer checkout details
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Mobile view toggle (edit vs preview)
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  // Sample prompt insert helper
  const handleInsertSamplePrompt = () => {
    const langKey = selectedLanguage in TRANSLATIONS ? selectedLanguage : "en";
    const prompts = TRANSLATIONS[langKey].samplePrompts;
    const occKey = occasion as keyof typeof prompts;
    if (prompts && prompts[occKey]) {
      setMessage(prompts[occKey]);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isSingle = true) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setUploadError(null);

    try {
      if (isSingle) {
        const file = files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "image");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setCardPhoto(data.url);
        if (!pagePhotos.includes(data.url)) {
          setPagePhotos([data.url, ...pagePhotos]);
        }
      } else {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < Math.min(files.length, 6); i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("kind", "image");

          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (res.ok && data.url) {
            uploadedUrls.push(data.url);
          }
        }
        if (uploadedUrls.length > 0) {
          setPagePhotos(uploadedUrls);
          setCardPhoto(uploadedUrls[0]);
        }
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error uploading photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Audio upload handler
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingAudio(true);
    setAudioError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "audio");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Audio upload failed");
      setCustomAudioUrl(data.url);
      setCustomAudioName(file.name);
      setMusicOption("custom");
    } catch (err: unknown) {
      setAudioError(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  // Voice memo upload handler (capped at 2MB)
  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingVoice(true);
    setVoiceError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "voice");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Voice upload failed");
      setVoiceMemoUrl(data.url);
      setVoiceMemoName(file.name);
    } catch (err: unknown) {
      setVoiceError(err instanceof Error ? err.message : "Voice memo upload failed");
    } finally {
      setIsUploadingVoice(false);
    }
  };

  // Pricing calculation
  const { displayPrice, symbol } = calculateOrderTotal(
    region,
    productType,
    tier,
    isBundle
  );

  // Smart check for Rush vs Countdown distance
  const isCountdownOver48Hours = () => {
    if (!revealDateTime) return false;
    const diff = new Date(revealDateTime).getTime() - Date.now();
    return diff > 48 * 60 * 60 * 1000;
  };

  // Checkout submission
  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerEmail || !customerEmail.includes("@")) {
      setFormError("Please enter a valid email address to receive your order links.");
      return;
    }

    setIsSubmitting(true);

    try {
      const currentTrack =
        musicOption === "builtin"
          ? BUILTIN_AUDIO_TRACKS.find((t) => t.id === selectedBuiltinTrack)?.url || null
          : musicOption === "custom"
          ? customAudioUrl
          : null;

      const payload = {
        productType,
        templateId: template.id,
        customerEmail,
        customerName: customerName || senderName || "Valued Customer",
        currency,
        tier,
        isBundle,
        customNotes: (tier === "CUSTOM" || tier === "RUSH") ? customNotes : undefined,
        cardData: {
          senderName,
          recipientName,
          occasion,
          message,
          photoUrl: cardPhoto,
          photoShape,
          colorTheme: selectedTheme,
          location,
          venueName,
          venueAddress,
          venueMapUrl,
          voiceMessageUrl: voiceMemoUrl,
          revealAt: enableRevealCountdown && revealDateTime ? revealDateTime : null,
          language: selectedLanguage,
        },
        pageData: {
          senderName,
          recipientName,
          occasion,
          letter: message,
          photoUrls: pagePhotos,
          musicTrack: currentTrack,
          musicType: musicOption,
          isProposal,
          colorTheme: selectedTheme,
          venueName,
          venueAddress,
          venueMapUrl,
          voiceMessageUrl: voiceMemoUrl,
          revealAt: enableRevealCountdown && revealDateTime ? revealDateTime : null,
          language: selectedLanguage,
        },
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout initiation failed");

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Missing checkout redirection URL");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  const activeTrackObj =
    musicOption === "builtin"
      ? BUILTIN_AUDIO_TRACKS.find((t) => t.id === selectedBuiltinTrack)
      : musicOption === "custom"
      ? { title: customAudioName || "Custom Track", url: customAudioUrl || "" }
      : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />

      {/* Breadcrumb Header */}
      <div className="border-b border-neutral-900 bg-neutral-900/50 py-3 px-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/#templates"
            className="flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Templates</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-400">Customizing:</span>
            <span className="text-xs font-semibold text-rose-300 font-serif">
              {template.name}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Tab switcher */}
      <div className="lg:hidden flex border-b border-neutral-900 bg-neutral-900/90 sticky top-[57px] z-30">
        <button
          onClick={() => setMobileTab("edit")}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
            mobileTab === "edit"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Customize Form</span>
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center space-x-1.5 border-b-2 transition ${
            mobileTab === "preview"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* Studio Workspace */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: FORM CUSTOMIZER (7 cols on desktop) */}
          <div
            className={`lg:col-span-7 space-y-8 ${
              mobileTab === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Step 1: Tier & Format Selection (Phase 2 Upgrade) */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Step 1: Fulfillment Tier & Format
                </span>
                <span className="text-[11px] text-neutral-400">
                  Region: <strong className="text-neutral-200">{PRICING_TIERS[region].regionLabel}</strong>
                </span>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Self Service Tier */}
                <button
                  type="button"
                  onClick={() => setTier("SELF_SERVICE")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    tier === "SELF_SERVICE"
                      ? "border-rose-500 bg-rose-500/10 shadow-md"
                      : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Self-Service</span>
                    <span className="text-xs font-bold text-rose-400">
                      {productType === "CARD" ? `${symbol}${PRICING_TIERS[region].cardPrice}` : `${symbol}${PRICING_TIERS[region].pagePrice}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Instant automated generation. Customize yourself.
                  </p>
                </button>

                {/* Custom Handcrafted Tier */}
                <button
                  type="button"
                  onClick={() => setTier("CUSTOM")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    tier === "CUSTOM"
                      ? "border-amber-500 bg-amber-500/10 shadow-md"
                      : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">Custom Tier</span>
                    <span className="text-xs font-bold text-amber-400">
                      {symbol}{PRICING_TIERS[region].customPrice}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Founder manual polish & bespoke styling (within 24-48h).
                  </p>
                </button>

                {/* Emergency Rush Tier */}
                <button
                  type="button"
                  onClick={() => setTier("RUSH")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    tier === "RUSH"
                      ? "border-red-500 bg-red-500/10 shadow-md"
                      : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-xs font-bold text-white">Emergency Rush</span>
                    </div>
                    <span className="text-xs font-bold text-red-400">
                      {symbol}{PRICING_TIERS[region].rushPrice}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Same-Day Priority Queue (delivered within 12 hours).
                  </p>
                </button>
              </div>

              {/* Format Buttons (Card vs Page) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductType("CARD")}
                  className={`rounded-xl border py-2.5 px-3 text-center text-xs font-semibold transition ${
                    productType === "CARD"
                      ? "border-neutral-400 bg-neutral-800 text-white"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400"
                  }`}
                >
                  Digital Card
                </button>
                <button
                  type="button"
                  onClick={() => setProductType("PAGE")}
                  className={`rounded-xl border py-2.5 px-3 text-center text-xs font-semibold transition ${
                    productType === "PAGE"
                      ? "border-neutral-400 bg-neutral-800 text-white"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400"
                  }`}
                >
                  Interactive Page
                </button>
              </div>

              {/* Multi-template bundle addon */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-rose-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Multi-Template Bundle Addon (+{symbol}{PRICING_TIERS[region].bundleAddonPrice})
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      Receive 2-3 style variations; pick your favorite with 1 revision included.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isBundle}
                  onChange={(e) => setIsBundle(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-rose-600 focus:ring-rose-500"
                />
              </div>

              {/* Custom Notes input if Custom or Rush selected */}
              {(tier === "CUSTOM" || tier === "RUSH") && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2 animate-in fade-in duration-300">
                  <span className="text-xs font-semibold text-amber-300 block">
                    Special Instructions for the Founder
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Tell us about your theme preferences, custom color ideas, or any specific details you want hand-styled.
                  </p>
                  <textarea
                    rows={3}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Please add a special quote section from our first trip together..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Names, Language & Occasion */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Step 2: Names, Occasion & Language
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Your Name (Sender / Family)
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Their Name (Recipient / Honoree)
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Simran"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Occasion
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none capitalize"
                  >
                    <option value="proposal">Romantic Proposal</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="sorry">I'm Sorry</option>
                    <option value="reminiscing">Reminiscing & Memory Lane</option>
                    <option value="birthday">Birthday Celebration</option>
                    <option value="memorial">In Loving Memory (Sacred Memorial)</option>
                    <option value="godhbharai">Baby Shower / Godhbharai</option>
                    <option value="jagrata_kirtan">Mata Ka Jagrata & Kirtan</option>
                    <option value="kitty_party">Kitty Party & Social Gathering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Language Selection
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Heartfelt Message & Letter */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Step 3: Heartfelt Message / Letter
                </span>
                <button
                  type="button"
                  onClick={handleInsertSamplePrompt}
                  className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline transition"
                >
                  Insert Sample Words
                </button>
              </div>

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write what's in your heart..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none leading-relaxed font-serif"
              />
            </div>

            {/* Step 4: Voice Memo Audio Note (Phase 2 Feature) */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-rose-400">
                  <Mic className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Step 4: Personal Voice Note (Optional)
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400">Max 90s / 2MB</span>
              </div>

              {voiceError && (
                <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}

              <p className="text-xs text-neutral-400 leading-relaxed">
                Add an audio memo speaking to your loved one. They can play and hear your real voice with an animated sound waveform!
              </p>

              <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/60 p-4 hover:border-rose-500/60 transition">
                <input
                  type="file"
                  accept="audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/webm, audio/m4a"
                  onChange={handleVoiceUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center text-center">
                  {isUploadingVoice ? (
                    <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
                  ) : (
                    <Mic className="h-6 w-6 text-rose-400" />
                  )}
                  <span className="mt-2 text-xs font-medium text-neutral-300">
                    {voiceMemoName ? `Recorded: ${voiceMemoName}` : "Click to upload voice memo (MP3, WAV, WEBM, max 2MB)"}
                  </span>
                </div>
              </label>
            </div>

            {/* Step 5: Timed / Countdown Reveal (Phase 2 Feature) */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-rose-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Step 5: Timed Surprise / Countdown Reveal
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableRevealCountdown}
                  onChange={(e) => setEnableRevealCountdown(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-rose-600 focus:ring-rose-500"
                />
              </div>

              {enableRevealCountdown && (
                <div className="space-y-3 pt-2 animate-in fade-in duration-300">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Set a target date & time. The link will display an anticipatory ticking countdown until that exact moment, then automatically unveil!
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Reveal Unlock Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={revealDateTime}
                      onChange={(e) => setRevealDateTime(e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Trust warning: If Rush selected and reveal is >48h */}
                  {tier === "RUSH" && isCountdownOver48Hours() && (
                    <div className="flex items-center space-x-2 rounded-xl bg-amber-950/70 border border-amber-800 p-3 text-xs text-amber-300">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>
                        Tip: Your reveal date is more than 48 hours away! You don't need the Emergency Rush fee. Switch to the <strong>Custom Tier</strong> to save money.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 6: Venue & Maps (for Invites or Events) */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-1.5 text-rose-400">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Step 6: Venue & Location (Optional / Invites)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Venue / Hall Name
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Grand Banquet Hall"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={venueMapUrl}
                    onChange={(e) => setVenueMapUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="e.g. Plot 12, Sector 17, Chandigarh"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 7: Photo Upload & Frame Shape */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Step 7: Photos & Frame Shape
              </span>

              {uploadError && (
                <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Photo shape selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Photo Frame Shape
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(
                    [
                      { id: "oval", label: "Oval" },
                      { id: "square", label: "Square" },
                      { id: "rounded", label: "Rounded" },
                      { id: "heart", label: "Heart" },
                      { id: "circle", label: "Circle" },
                    ] as { id: PhotoShapeKey; label: string }[]
                  ).map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setPhotoShape(shape.id)}
                      className={`rounded-xl border py-2 text-center text-xs font-medium transition ${
                        photoShape === shape.id
                          ? "border-rose-500 bg-rose-500/20 text-rose-300"
                          : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* File upload input */}
              <div className="pt-2">
                <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/60 p-5 hover:border-rose-500/60 transition">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/heic"
                    multiple={productType === "PAGE"}
                    onChange={(e) => handlePhotoUpload(e, productType === "CARD")}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center text-center">
                    {isUploadingPhoto ? (
                      <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
                    ) : (
                      <Upload className="h-6 w-6 text-neutral-400" />
                    )}
                    <span className="mt-2 text-xs font-medium text-neutral-300">
                      {isUploadingPhoto ? "Uploading..." : "Click or drag photos to upload"}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Strict 10MB limit enforced
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 8: Color Palette */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Step 8: Color Palette & Aesthetics
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(COLOR_THEMES).map((thm) => (
                  <button
                    key={thm.id}
                    type="button"
                    onClick={() => setSelectedTheme(thm.id)}
                    className={`flex items-center space-x-3 rounded-2xl border p-3 text-left transition ${
                      selectedTheme === thm.id
                        ? "border-rose-500 bg-rose-500/20"
                        : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                    }`}
                  >
                    <div
                      className="h-6 w-6 rounded-full shrink-0 shadow-md"
                      style={{ backgroundColor: thm.accentColor }}
                    />
                    <div className="text-xs font-bold text-white truncate">{thm.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 9: Background Audio Soundtrack */}
            {productType === "PAGE" && (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Step 9: Background Soundtrack & Music
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMusicOption("builtin")}
                    className={`rounded-xl border py-2 text-xs font-medium transition ${
                      musicOption === "builtin"
                        ? "border-rose-500 bg-rose-500/20 text-rose-300"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Occasion Soundtracks
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusicOption("custom")}
                    className={`rounded-xl border py-2 text-xs font-medium transition ${
                      musicOption === "custom"
                        ? "border-rose-500 bg-rose-500/20 text-rose-300"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Upload Song
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusicOption("none")}
                    className={`rounded-xl border py-2 text-xs font-medium transition ${
                      musicOption === "none"
                        ? "border-rose-500 bg-rose-500/20 text-rose-300"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                    }`}
                  >
                    No Music
                  </button>
                </div>

                {musicOption === "builtin" && (
                  <div className="space-y-2 pt-2">
                    {BUILTIN_AUDIO_TRACKS.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedBuiltinTrack(track.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          selectedBuiltinTrack === track.id
                            ? "border-rose-500 bg-rose-500/10 text-white"
                            : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Music className="h-4 w-4 text-rose-400" />
                          <div>
                            <div className="text-xs font-semibold">{track.title}</div>
                            <div className="text-[10px] text-neutral-400 capitalize">
                              {track.category} • {track.genre}
                            </div>
                          </div>
                        </div>
                        {selectedBuiltinTrack === track.id && (
                          <Check className="h-4 w-4 text-rose-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {musicOption === "custom" && (
                  <div className="pt-2">
                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/60 p-4 hover:border-rose-500/60 transition">
                      <input
                        type="file"
                        accept="audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/m4a"
                        onChange={handleAudioUpload}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center text-center">
                        {isUploadingAudio ? (
                          <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
                        ) : (
                          <Music className="h-6 w-6 text-neutral-400" />
                        )}
                        <span className="mt-2 text-xs font-medium text-neutral-300">
                          {customAudioName ? `Selected: ${customAudioName}` : "Choose audio track (max 15MB)"}
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* CHECKOUT ORDER SUMMARY PANEL */}
            <form
              onSubmit={handleProceedToCheckout}
              className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                    Order Confirmation
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white">
                    {productType === "CARD" ? "Digital Card" : "Interactive Page"}{" "}
                    <span className="text-xs text-neutral-400">
                      ({tier === "RUSH" ? "Emergency Rush" : tier === "CUSTOM" ? "Custom Handcrafted" : "Self-Service"})
                    </span>
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {symbol}{displayPrice}
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase">
                    {currency} • {isBundle ? "Bundle Edition" : "Single Order"}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Your Email (To receive unique link & receipt)
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-rose-500/25 transition-all hover:scale-[1.01] hover:shadow-rose-500/40 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Proceed to Checkout ({symbol}{displayPrice})</span>
                  </div>
                )}
              </button>

              <p className="text-center text-[10px] text-neutral-500">
                🔒 Safe 256-bit encrypted checkout via Stripe • Multi-currency regional pricing guaranteed
              </p>
            </form>
          </div>

          {/* RIGHT: LIVE PREVIEW (5 cols on desktop, sticky) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-24 space-y-4 ${
              mobileTab === "edit" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Live Dynamic Preview
              </span>
              <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Updates in Real-Time
              </span>
            </div>

            {productType === "CARD" ? (
              <CardPreview
                senderName={senderName}
                recipientName={recipientName}
                occasion={occasion}
                message={message}
                photoUrl={cardPhoto}
                photoShape={photoShape}
                colorTheme={selectedTheme}
                location={location}
                venueName={venueName}
                venueAddress={venueAddress}
                venueMapUrl={venueMapUrl}
                voiceMessageUrl={voiceMemoUrl}
              />
            ) : (
              <PagePreview
                senderName={senderName}
                recipientName={recipientName}
                occasion={occasion}
                letter={message}
                photoUrls={pagePhotos}
                colorTheme={selectedTheme}
                isProposal={isProposal}
                venueName={venueName}
                venueAddress={venueAddress}
                venueMapUrl={venueMapUrl}
                voiceMessageUrl={voiceMemoUrl}
                musicTrackName={activeTrackObj?.title}
                previewOnly={true}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
