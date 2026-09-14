"use client";

import React, { useState, useEffect, use } from "react";
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
import { PRICING_TIERS } from "@/lib/currency";
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
  Image as ImageIcon,
  Palette,
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

  // Selected format
  const [productType, setProductType] = useState<"CARD" | "PAGE">(
    template.supportedFormats.includes("PAGE") ? "PAGE" : "CARD"
  );

  // Form states
  const [senderName, setSenderName] = useState<string>(template.sampleSender);
  const [recipientName, setRecipientName] = useState<string>(template.sampleRecipient);
  const [occasion, setOccasion] = useState<string>(template.occasion);
  const [location, setLocation] = useState<string>(template.sampleLocation || "");
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

  // Sync selected language sample prompt if requested
  const handleInsertSamplePrompt = () => {
    const langKey = selectedLanguage in TRANSLATIONS ? selectedLanguage : "en";
    const prompts = TRANSLATIONS[langKey].samplePrompts;
    const occKey = occasion as keyof typeof prompts;
    if (prompts[occKey]) {
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

  // Audio upload handler (per user requirement)
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

  // Pricing
  const pricing = PRICING_TIERS[region];
  const currentPrice =
    productType === "CARD" ? pricing.cardPrice : pricing.pagePrice;

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
        cardData: {
          senderName,
          recipientName,
          occasion,
          message,
          photoUrl: cardPhoto,
          photoShape,
          colorTheme: selectedTheme,
          location,
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
          isProposal: isProposal,
          colorTheme: selectedTheme,
          language: selectedLanguage,
        },
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout initiation failed");
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout or simulator
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

      {/* Mobile Tab switcher (Edit vs Live Preview) */}
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

      {/* Main Studio Workspace */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: FORM CUSTOMIZER (7 cols on desktop) */}
          <div
            className={`lg:col-span-7 space-y-8 ${
              mobileTab === "preview" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Format Picker */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Step 1: Choose Product Format
              </span>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProductType("CARD")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    productType === "CARD"
                      ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10"
                      : "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-white text-base">
                      Digital Card
                    </span>
                    <span className="text-xs font-bold text-rose-400">
                      {pricing.symbol}{pricing.cardPrice}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    High-res shareable image with custom photo frame.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setProductType("PAGE")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    productType === "PAGE"
                      ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10"
                      : "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-white text-base">
                      Interactive Page
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {pricing.symbol}{pricing.pagePrice}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Full emotional webpage with music, unboxing & collage.
                  </p>
                </button>
              </div>
            </div>

            {/* Names & Language */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Step 2: Names & Language
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Your Name (Sender)
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
                    Their Name (Recipient)
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

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Location / Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Udaipur, Lake Pichola"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Heartfelt Message */}
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
                  Insert Sample Message
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

            {/* Photo Upload & Frame Shape */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Step 4: Photo & Framing
              </span>

              {uploadError && (
                <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Photo shape selector (for Cards) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">
                  Photo Shape
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
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {productType === "CARD"
                    ? "Upload Photo (Max 10MB JPG, PNG, WEBP)"
                    : "Upload Moments (1-6 photos for collage)"}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex flex-1 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/60 p-5 hover:border-rose-500/60 transition">
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
            </div>

            {/* Color Palette Choice */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Step 5: Color Palette & Aesthetics
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
                    <div>
                      <div className="text-xs font-bold text-white">{thm.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Page-Specific Music & Dodging Button Settings */}
            {productType === "PAGE" && (
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Step 6: Music & Interactions (Page Feature)
                </span>

                {audioError && (
                  <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{audioError}</span>
                  </div>
                )}

                {/* Music Source Option */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">
                    Background Music Track
                  </label>
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
                      Curated Soundtracks
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
                      Upload Song (MP3)
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
                </div>

                {/* Built-in Tracks List */}
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
                            <div className="text-[10px] text-neutral-400">{track.genre} • {track.duration}</div>
                          </div>
                        </div>
                        {selectedBuiltinTrack === track.id && (
                          <Check className="h-4 w-4 text-rose-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Audio Upload (per user requirement) */}
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
                          {customAudioName ? `Selected: ${customAudioName}` : "Choose couple audio track (max 15MB)"}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          Supports MP3, M4A, WAV
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                {/* Interactive Dodging Proposal Button Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950 p-4 pt-3">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Playful Dodging "No" Button
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      The "No" button will playfully dodge the cursor so "Yes" is guaranteed!
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isProposal}
                    onChange={(e) => setIsProposal(e.target.checked)}
                    className="h-5 w-5 rounded border-neutral-700 bg-neutral-900 text-rose-600 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            {/* ORDER CHECKOUT PANEL */}
            <form
              onSubmit={handleProceedToCheckout}
              className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                    Instant Delivery Checkout
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white">
                    {productType === "CARD" ? "Digital Card" : "Interactive Couple Page"}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {pricing.symbol}{currentPrice}
                  </div>
                  <div className="text-[10px] text-neutral-400 uppercase">
                    {currency} • One-Time
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
                    Your Email (For Order Confirmation)
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
                    <span>Proceed to Secure Payment ({pricing.symbol}{currentPrice})</span>
                  </div>
                )}
              </button>

              <p className="text-center text-[10px] text-neutral-500">
                🔒 Safe 256-bit encrypted checkout via Stripe • Instant unique link & download delivered immediately
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
