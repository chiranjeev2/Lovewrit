"use client";

import React, { useState, useRef, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CardPreview from "@/components/editor/CardPreview";
import PagePreview, { CollageLayoutStyle } from "@/components/editor/PagePreview";
import VoiceRecorder from "@/components/interactive/VoiceRecorder";
import HindiPunjabiKeyboard from "@/components/editor/HindiPunjabiKeyboard";
import { useApp } from "@/context/AppContext";
import {
  TEMPLATES,
  getTemplateById,
  ColorThemeKey,
  PhotoShapeKey,
  COLOR_THEMES,
  ProposalQuestionKey,
  PROPOSAL_QUESTIONS,
} from "@/lib/templates-data";
import {
  PRICING_TIERS,
  TierType,
  CurrencyCode,
  calculateOrderTotal,
} from "@/lib/currency";
import { BUILTIN_AUDIO_TRACKS } from "@/lib/audio-tracks";
import { LanguageCode, LANGUAGES, TRANSLATIONS } from "@/lib/i18n";
import {
  Heart,
  Sparkles,
  ArrowLeft,
  Upload,
  Calendar,
  Clock,
  Sparkle,
  Music,
  Eye,
  Sliders,
  AlertCircle,
  HelpCircle,
  Check,
  ShieldCheck,
  Loader2,
  Gift,
  CreditCard,
  Tag,
  Volume2,
  Lock,
  Camera,
  Film,
  Play,
  Pause,
  MapPin,
  Flame,
  Crown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Zap,
  Mic,
} from "lucide-react";

export default function CreateLovewritPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currency, setCurrency, region, language, setLanguage, t } = useApp();

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
  const [eventDate, setEventDate] = useState<string>(template.sampleEventDate || "");
  const [eventTime, setEventTime] = useState<string>(template.sampleEventTime || "");
  const [showCurrencyOverride, setShowCurrencyOverride] = useState<boolean>(false);
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

  // Photo collage layout style
  const [collageLayout, setCollageLayout] = useState<CollageLayoutStyle>("masonry");

  // Track Audio Preview
  const [playingPreviewTrackId, setPlayingPreviewTrackId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Proposal Question
  const [proposalQuestion, setProposalQuestion] = useState<ProposalQuestionKey>(
    template.id.includes("girlfriend") ? "be_my_girlfriend" : "marry_me"
  );

  // Faith motifs & Ad-supported settings
  const [showOmMotif, setShowOmMotif] = useState<boolean>(false);
  const [showBismillah, setShowBismillah] = useState<boolean>(true);
  const [isAdSupported, setIsAdSupported] = useState<boolean>(true);

  // Founder Master Pass (Free All-Access)
  const [isFounderFree, setIsFounderFree] = useState<boolean>(false);

  // Regift 50% discount & confirmed reply details
  const [replyToSlug, setReplyToSlug] = useState<string | null>(null);
  const [isRegiftDiscount, setIsRegiftDiscount] = useState<boolean>(false);
  const [replySender, setReplySender] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const replyParam = urlParams.get("replyTo");
      const toParam = urlParams.get("to");
      const fKeyParam = urlParams.get("founderKey");

      if (toParam) {
        const decodedTo = decodeURIComponent(toParam);
        setRecipientName(decodedTo);
        setReplySender(decodedTo);
      }
      if (replyParam) {
        setReplyToSlug(replyParam);
        // Strictly verify with database that this is a genuine completed order
        fetch(`/api/reply/verify?slug=${encodeURIComponent(replyParam)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.valid) {
              setIsRegiftDiscount(true);
              if (data.senderName) {
                setRecipientName(data.senderName);
                setReplySender(data.senderName);
              }
            } else {
              setIsRegiftDiscount(false);
            }
          })
          .catch((err) => console.error("Error verifying reply regift:", err));
      }
      if (
        fKeyParam &&
        (fKeyParam === "lovewrit_master_founder_secret_2026" ||
          fKeyParam === "memoir_master_founder_secret_2026" ||
          fKeyParam === "founder_master")
      ) {
        setIsFounderFree(true);
        try {
          localStorage.setItem("lovewrit_founder_pass", fKeyParam);
        } catch {}
      } else {
        try {
          const savedKey =
            localStorage.getItem("lovewrit_founder_pass") ||
            localStorage.getItem("memoir_founder_pass");
          if (
            savedKey === "lovewrit_master_founder_secret_2026" ||
            savedKey === "memoir_master_founder_secret_2026" ||
            savedKey === "founder_master"
          ) {
            setIsFounderFree(true);
          }
        } catch {}
      }
    }
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const handleExitFounderMode = () => {
    setIsFounderFree(false);
    try {
      localStorage.removeItem("lovewrit_founder_pass");
      localStorage.removeItem("memoir_founder_pass");
    } catch {}
  };

  const applyDatePreset = (
    preset: "tonight" | "tomorrow_morning" | "tomorrow_evening" | "in_24h" | "weekend"
  ) => {
    const now = new Date();
    let target = new Date();

    if (preset === "tonight") {
      target.setHours(23, 59, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
    } else if (preset === "tomorrow_morning") {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (preset === "tomorrow_evening") {
      target.setDate(target.getDate() + 1);
      target.setHours(20, 0, 0, 0);
    } else if (preset === "in_24h") {
      target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (preset === "weekend") {
      const day = now.getDay();
      const daysUntilSaturday = (6 - day + 7) % 7 || 7;
      target.setDate(now.getDate() + daysUntilSaturday);
      target.setHours(20, 0, 0, 0);
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatted = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
      target.getDate()
    )}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
    setRevealDateTime(formatted);
    setEnableRevealCountdown(true);
  };

  const toggleAudioPreview = (track: typeof BUILTIN_AUDIO_TRACKS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingPreviewTrackId === track.id) {
      audioPreviewRef.current?.pause();
      setPlayingPreviewTrackId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const audio = new Audio(track.url);
      audioPreviewRef.current = audio;
      setPlayingPreviewTrackId(track.id);
      audio.play().catch((err) => console.log("Audio preview playback notice:", err));
      audio.onended = () => setPlayingPreviewTrackId(null);
    }
  };

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

  // Dynamic Occasion & Theme handler
  const handleOccasionChange = (newOccasion: string) => {
    setOccasion(newOccasion);
    const isNowProposal = newOccasion === "proposal";
    setIsProposal(isNowProposal);

    // Find the template that natively matches this occasion
    const matchingTemplate = TEMPLATES.find((t) => t.occasion === newOccasion);
    if (matchingTemplate) {
      setSelectedTheme(matchingTemplate.defaultTheme);
      setPhotoShape(matchingTemplate.defaultShape);
      if (matchingTemplate.samplePhotos && matchingTemplate.samplePhotos.length > 0) {
        setPagePhotos(matchingTemplate.samplePhotos);
        setCardPhoto(matchingTemplate.samplePhotos[0]);
      }
      if (matchingTemplate.sampleEventDate) setEventDate(matchingTemplate.sampleEventDate);
      if (matchingTemplate.sampleEventTime) setEventTime(matchingTemplate.sampleEventTime);
      if (newOccasion === "jagrata_kirtan") {
        setRecipientName("Sadar Nimantran (सादर आमंत्रण)");
        setSenderName("Goyal Parivaar");
      }
    }

    // Set default sample prompt for this occasion in current language
    const langKey = selectedLanguage in TRANSLATIONS ? selectedLanguage : "en";
    const prompts = TRANSLATIONS[langKey]?.samplePrompts;
    const promptForOccasion = prompts && (prompts as Record<string, string>)[newOccasion];
    if (promptForOccasion) {
      setMessage(promptForOccasion);
    } else if (matchingTemplate?.sampleMessage) {
      setMessage(matchingTemplate.sampleMessage);
    }
  };

  // Photo arranging and reordering handlers
  const movePhoto = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pagePhotos.length) return;
    const updated = [...pagePhotos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPagePhotos(updated);
    if (updated.length > 0) {
      setCardPhoto(updated[0]);
    }
  };

  const removePhoto = (index: number) => {
    const updated = pagePhotos.filter((_, i) => i !== index);
    setPagePhotos(updated);
    setCardPhoto(updated[0] || "");
  };

  // Photo upload handler supporting both batch upload & one-by-one appending
  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "append" | "replace" = "append"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setUploadError(null);

    const maxCount = productType === "CARD" ? 3 : 6;
    const currentCount = mode === "append" ? pagePhotos.length : 0;
    const availableSlots = Math.max(0, maxCount - currentCount);

    if (availableSlots <= 0) {
      setUploadError(
        `Maximum ${maxCount} photos reached for ${
          productType === "CARD" ? "Digital Card (1-3 photos)" : "Interactive Page (1-6 photos)"
        }. Remove a photo or switch formats to add more.`
      );
      setIsUploadingPhoto(false);
      e.target.value = "";
      return;
    }

    try {
      const uploadedUrls: string[] = [];
      const filesToUpload = Array.from(files).slice(0, availableSlots);

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "image");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const nextPhotos = mode === "append" ? [...pagePhotos, ...uploadedUrls] : uploadedUrls;
        setPagePhotos(nextPhotos);
        setCardPhoto(nextPhotos[0]);
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Error uploading photo");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
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
  const isFreeLetterCard = productType === "CARD" && (template.id === "letter-to-dear-one" || Boolean(template.isFreeCard));
  const isFreeAdPage = productType === "PAGE" && (template.id === "letter-to-dear-one" || Boolean(template.hasAdOption)) && isAdSupported && tier === "SELF_SERVICE" && !isBundle;

  const calculatedPricing = calculateOrderTotal(
    region,
    productType,
    tier,
    isBundle,
    isRegiftDiscount,
    { isFreeCard: isFreeLetterCard, isAdSupported: isFreeAdPage }
  );

  const displayPrice = isFounderFree || isFreeLetterCard || isFreeAdPage ? "0" : calculatedPricing.displayPrice;
  const symbol = calculatedPricing.symbol;
  const isDiscounted = isFounderFree ? true : calculatedPricing.isDiscounted;
  const originalDisplayPrice = isFounderFree
    ? calculatedPricing.displayPrice
    : calculatedPricing.originalDisplayPrice;

  // Checkout submission
  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalEmail = customerEmail || (isFounderFree ? "founder@lovewrit.com" : "");
    if (!finalEmail || !finalEmail.includes("@")) {
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
        customerEmail: finalEmail,
        customerName: customerName || senderName || "Valued Customer",
        currency,
        tier,
        isBundle,
        isAdSupported: isFreeAdPage,
        replyTo: replyToSlug || undefined,
        masterKey: isFounderFree ? "lovewrit_master_founder_secret_2026" : undefined,
        customNotes: (tier === "CUSTOM" || tier === "RUSH") ? customNotes : undefined,
        cardData: {
          senderName,
          recipientName,
          occasion,
          message,
          photoUrl: pagePhotos.length > 1 ? JSON.stringify(pagePhotos.slice(0, 3)) : cardPhoto,
          photoShape,
          colorTheme: selectedTheme,
          location,
          venueName,
          venueAddress,
          venueMapUrl,
          eventDate: eventDate || undefined,
          eventTime: eventTime || undefined,
          voiceMessageUrl: voiceMemoUrl,
          revealAt: enableRevealCountdown && revealDateTime ? revealDateTime : null,
          showOmMotif,
          showBismillah,
          language: selectedLanguage,
        },
        pageData: {
          senderName,
          recipientName,
          occasion,
          letter: message,
          photoUrls: pagePhotos,
          collageLayout,
          musicTrack: currentTrack,
          musicType: musicOption,
          isProposal: isProposal && occasion === "proposal",
          proposalQuestion: isProposal && occasion === "proposal" ? proposalQuestion : undefined,
          colorTheme: selectedTheme,
          venueName,
          venueAddress,
          venueMapUrl,
          eventDate: eventDate || undefined,
          eventTime: eventTime || undefined,
          voiceMessageUrl: voiceMemoUrl,
          revealAt: enableRevealCountdown && revealDateTime ? revealDateTime : null,
          showOmMotif,
          showBismillah,
          isAdSupported: isFreeAdPage,
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

      {/* Founder Test Mode Active Notice */}
      {isFounderFree && (
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-b border-amber-600/40 py-2.5 px-4 text-center text-xs text-amber-200 flex flex-wrap items-center justify-center gap-2.5 shadow-lg">
          <div className="flex items-center space-x-1.5 font-bold text-amber-300">
            <Crown className="h-4 w-4 text-amber-400" />
            <span>Founder VIP Preview Active ({symbol}0 Free Bypass)</span>
          </div>
          <span className="hidden sm:inline text-amber-400/50">•</span>
          <button
            type="button"
            onClick={handleExitFounderMode}
            className="rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-neutral-950 border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition"
          >
            Exit to Public View (Restore Standard Pricing)
          </button>
        </div>
      )}

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
            {/* VIP Founder Pass Badge */}
            {isFounderFree && (
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-rose-950/30 p-4 shadow-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Founder VIP All-Access Pass Active
                    </span>
                    <h4 className="text-xs font-bold text-white">
                      100% Free Creation & Instant Unlocked Publishing
                    </h4>
                  </div>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-500/40">
                  {symbol}0 Free
                </span>
              </div>
            )}

            {/* Regift / Reply 50% Discount Alert */}
            {isRegiftDiscount && (
              <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-neutral-900 to-amber-950/30 p-4 shadow-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      Regift & Reply Perk
                    </span>
                    <h4 className="text-xs font-bold text-white">
                      50% OFF Applied {replySender ? `for your reply to ${replySender}` : ""}!
                    </h4>
                  </div>
                </div>
                <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-mono font-bold text-rose-300 border border-rose-500/40">
                  50% OFF
                </span>
              </div>
            )}

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
                      {isFounderFree
                        ? `${symbol}0 Free`
                        : isFreeLetterCard || isFreeAdPage
                        ? "100% Free"
                        : productType === "CARD"
                        ? `${symbol}${PRICING_TIERS[region].cardPrice}`
                        : `${symbol}${PRICING_TIERS[region].pagePrice}`}
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
                      {isFounderFree
                        ? `${symbol}0 Free`
                        : productType === "CARD"
                        ? `${symbol}${PRICING_TIERS[region].customCardPrice}`
                        : `${symbol}${PRICING_TIERS[region].customPrice}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    Founder handcrafted edition with bespoke typography, photo styling & review (24-48h).
                  </p>
                </button>

                {/* Custom Emergency Rush Tier */}
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
                      <span className="text-xs font-bold text-white">Custom Emergency Rush</span>
                    </div>
                    <span className="text-xs font-bold text-red-400">
                      {isFounderFree
                        ? `${symbol}0 Free`
                        : productType === "CARD"
                        ? `${symbol}${PRICING_TIERS[region].rushCardPrice}`
                        : `${symbol}${PRICING_TIERS[region].rushPrice}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-relaxed">
                    Priority Same-Day queue jump. Founder handcrafts & delivers within 6-12 hours.
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
                  Digital Card {isFreeLetterCard ? "(100% Free)" : ""}
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
                  Interactive Page {template.id === "letter-to-dear-one" ? "(Free or Ad-Free)" : ""}
                </button>
              </div>

              {/* Free Card Notice for Letter to a Dear One */}
              {isFreeLetterCard && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center space-x-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">100% Free Digital Keepsake Card</h4>
                      <p className="text-[10px] text-neutral-300">
                        Completely free forever. No payment card required, no ads, instant download.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 uppercase">
                    100% Free
                  </span>
                </div>
              )}

              {/* Free vs Ad-Free Toggle for Interactive Page in Letter to a Dear One */}
              {(template.id === "letter-to-dear-one" || Boolean(template.hasAdOption)) && productType === "PAGE" && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                      Page Viewing Experience Option
                    </span>
                    <span className="text-[10px] text-neutral-400">Choose for recipient</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAdSupported(true)}
                      className={`rounded-xl border p-3 text-left transition ${
                        isAdSupported
                          ? "border-emerald-500 bg-emerald-500/20 text-white shadow-sm"
                          : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">Watch a short ad (Free)</span>
                        <span className="text-xs font-bold text-emerald-400">100% Free</span>
                      </div>
                      <p className="text-[10px] text-neutral-300">
                        Unobtrusive reading ad banner. Zero cost to create and view.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAdSupported(false)}
                      className={`rounded-xl border p-3 text-left transition ${
                        !isAdSupported
                          ? "border-rose-500 bg-rose-500/20 text-white shadow-sm"
                          : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">Pay to skip ads</span>
                        <span className="text-xs font-bold text-rose-400">
                          {symbol}{PRICING_TIERS[region].pagePrice}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-300">
                        Pristine, ad-free emotional experience for your loved one.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Hindu Devotional: Om Motif Toggle (PRIORITY!) */}
              {(template.showOmMotifSupported || occasion === "jagrata_kirtan") && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 flex items-center justify-between animate-in fade-in">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-amber-300">ॐ</span>
                      <h4 className="text-xs font-bold text-white">Display Holy Om Symbol (ॐ)</h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Include the sacred Om (ॐ) motif alongside the Aarti Diya flame on your card and page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOmMotif(!showOmMotif)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      showOmMotif ? "bg-amber-500" : "bg-neutral-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showOmMotif ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Muslim Devotional: Optional Bismillah Invocation Toggle (Adjustment 3) */}
              {(template.showBismillahSupported || occasion === "aqeeqah" || occasion === "nikah" || occasion === "iftar") && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex items-center justify-between animate-in fade-in">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-emerald-300">🌙</span>
                      <h4 className="text-xs font-bold text-white">Display Bismillah Invocation (بِسْمِ ٱللَّٰهِ)</h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Toggle whether to display the sacred Arabic calligraphic Bismillah heading above the invitation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBismillah(!showBismillah)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      showBismillah ? "bg-emerald-500" : "bg-neutral-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        showBismillah ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Bundle Addon Option (Card + Interactive Page) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsBundle(!isBundle)}
                  className={`w-full rounded-2xl border p-3.5 text-left transition flex items-center justify-between ${
                    isBundle
                      ? "border-rose-500/80 bg-rose-500/15 shadow-md shadow-rose-950/20"
                      : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                        isBundle
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-neutral-700 bg-neutral-900"
                      }`}
                    >
                      {isBundle && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">
                          Bundle Keepsake (Digital Card + Interactive Page)
                        </span>
                        <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30 uppercase">
                          Save 40%
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Get both the printable card download and the interactive unboxing website link.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-400 shrink-0 ml-3">
                    +{symbol}{PRICING_TIERS[region].bundleAddonPrice}
                  </span>
                </button>
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
                    onChange={(e) => handleOccasionChange(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white focus:border-rose-500 focus:outline-none capitalize"
                  >
                    <option value="proposal">Romantic Proposal</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="sorry">I&apos;m Sorry</option>
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

              {/* Proposal & Asking Out Question Customizer */}
              {occasion === "proposal" && (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2 mt-3 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <Heart className="h-4 w-4 fill-rose-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Proposal & Asking Out Question
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    Select your tailored question. The recipient will experience dodging &ldquo;No&rdquo; mechanics and a celebratory reveal!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {Object.entries(PROPOSAL_QUESTIONS).map(([key, q]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setProposalQuestion(key as ProposalQuestionKey);
                          setIsProposal(true);
                        }}
                        className={`rounded-xl border p-3 text-left transition ${
                          proposalQuestion === key
                            ? "border-rose-500 bg-rose-500/20 text-white shadow-sm"
                            : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{q.label}</div>
                        <div className="text-[10px] text-rose-300/80 mt-0.5 font-serif italic">
                          &ldquo;{q.question}&rdquo;
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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

              {/* Hindi & Punjabi Virtual Keyboards with Quick Phrases */}
              <HindiPunjabiKeyboard
                language={selectedLanguage}
                onInsertChar={(char) => setMessage((prev) => prev + char)}
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
                Record your voice speaking to your loved one directly with your microphone, or upload an audio file!
              </p>

              {/* Live Microphone Browser Recorder */}
              <VoiceRecorder
                onRecorded={(url, filename) => {
                  setVoiceMemoUrl(url);
                  setVoiceMemoName(filename);
                }}
                currentAudioUrl={voiceMemoUrl}
              />

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-neutral-500 uppercase tracking-wider">or upload file</span>
                <div className="flex-grow border-t border-neutral-800"></div>
              </div>

              <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 bg-neutral-950/60 p-3.5 hover:border-rose-500/60 transition">
                <input
                  type="file"
                  accept="audio/mpeg, audio/mp3, audio/wav, audio/ogg, audio/webm, audio/m4a"
                  onChange={handleVoiceUpload}
                  className="hidden"
                />
                <div className="flex items-center space-x-2.5 text-center">
                  {isUploadingVoice ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                  ) : (
                    <Upload className="h-4 w-4 text-neutral-400" />
                  )}
                  <span className="text-xs font-medium text-neutral-300">
                    {voiceMemoName ? `Uploaded: ${voiceMemoName}` : "Choose audio file from device (MP3/WAV, max 2MB)"}
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

                  {/* 1-Click Quick Presets */}
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                      ⚡ Quick Reveal Presets (1-Click Set)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "tonight", label: "Tonight (11:59 PM)" },
                        { id: "tomorrow_morning", label: "Tomorrow Morning (9 AM)" },
                        { id: "tomorrow_evening", label: "Tomorrow Evening (8 PM)" },
                        { id: "in_24h", label: "In 24 Hours" },
                        { id: "weekend", label: "Weekend (Sat 8 PM)" },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            applyDatePreset(
                              preset.id as
                                | "tonight"
                                | "tomorrow_morning"
                                | "tomorrow_evening"
                                | "in_24h"
                                | "weekend"
                            )
                          }
                          className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-[11px] text-neutral-300 hover:border-rose-500/60 hover:text-white transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                      {revealDateTime && (
                        <button
                          type="button"
                          onClick={() => {
                            setRevealDateTime("");
                            setEnableRevealCountdown(false);
                          }}
                          className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-[11px] text-red-400 hover:border-red-500/60 transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

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

                  {/* Trust warning: If Rush selected and reveal is far */}
                  {tier === "RUSH" && revealDateTime && (
                    <div className="flex items-center space-x-2 rounded-xl bg-amber-950/70 border border-amber-800 p-3 text-xs text-amber-300">
                      <Info className="h-4 w-4 shrink-0" />
                      <span>
                        Tip: If your reveal date is more than 48 hours away, you don&apos;t need the Emergency Rush fee. Switch to the <strong>Custom Tier</strong> to save money.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 6: Venue & Location (for Invites or Events) */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-1.5 text-rose-400">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Step 6: Event Date, Timing & Venue (Optional)
                </span>
              </div>

              {/* Event Date & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-neutral-800/70">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>Event Date (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. Saturday, 24 October 2026"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Event Timing (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="e.g. 8:00 PM Onwards (or 4:00 PM - 8:00 PM)"
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
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
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                    Step 7: Photos & Arrangement
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Add photos one by one or batch select. Arrange order with arrows.
                  </span>
                </div>
                <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-mono font-medium text-neutral-300 border border-neutral-700">
                  {pagePhotos.length} / {productType === "CARD" ? 3 : 6} Photos
                </span>
              </div>

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
                <div className="grid grid-cols-4 gap-2">
                  {(
                    [
                      { id: "oval", label: "Oval" },
                      { id: "square", label: "Square" },
                      { id: "rounded", label: "Rounded" },
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

              {/* Visual Photo Arrangement Tray */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-rose-400" />
                    <label className="text-xs font-semibold text-neutral-300">
                      Arranged Gallery ({pagePhotos.length} Added)
                    </label>
                  </div>
                  {pagePhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPagePhotos([]);
                        setCardPhoto("");
                      }}
                      className="text-[11px] text-neutral-500 hover:text-red-400 transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pagePhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-2xl border p-2 flex flex-col justify-between transition ${
                        idx === 0
                          ? "border-rose-500/60 bg-rose-950/20 shadow-md shadow-rose-950/40"
                          : "border-neutral-800 bg-neutral-950/80 hover:border-neutral-700"
                      }`}
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
                        <img
                          src={photo}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Order badge */}
                        <div className="absolute top-1.5 left-1.5">
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-md ${
                              idx === 0
                                ? "bg-rose-600 text-white"
                                : "bg-neutral-900/90 text-neutral-200 border border-neutral-700"
                            }`}
                          >
                            {idx === 0 ? "★ #1 Cover" : `#${idx + 1}`}
                          </span>
                        </div>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1.5 right-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white p-1 transition shadow-md"
                          title="Remove Photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Arranging Controls (Move Left / Move Right) */}
                      <div className="mt-2 flex items-center justify-between pt-1 border-t border-neutral-800/60">
                        <button
                          type="button"
                          onClick={() => movePhoto(idx, "left")}
                          disabled={idx === 0}
                          className="flex items-center space-x-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] font-medium text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Move Left (Earlier in sequence)"
                        >
                          <ChevronLeft className="h-3 w-3" />
                          <span>Left</span>
                        </button>

                        <span className="text-[9px] text-neutral-500 font-mono">
                          #{idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => movePhoto(idx, "right")}
                          disabled={idx === pagePhotos.length - 1}
                          className="flex items-center space-x-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[10px] font-medium text-neutral-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Move Right (Later in sequence)"
                        >
                          <span>Right</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* One-by-One Add Slot (if limit not reached) */}
                  {pagePhotos.length < (productType === "CARD" ? 3 : 6) && (
                    <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 hover:border-rose-500 bg-neutral-950/40 p-4 cursor-pointer transition min-h-[140px] text-center group">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/heic"
                        multiple={false}
                        onChange={(e) => handlePhotoUpload(e, "append")}
                        className="hidden"
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-neutral-400 group-hover:bg-rose-500/20 group-hover:text-rose-400 transition mb-2">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition">
                        + Add One Photo
                      </span>
                      <span className="text-[10px] text-neutral-500 mt-0.5">
                        Append next photo
                      </span>
                    </label>
                  )}
                </div>

                {/* Batch upload bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <label className="flex-1 w-full flex items-center justify-center space-x-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/50 hover:border-rose-500/60 p-3 cursor-pointer text-xs text-neutral-300 hover:text-white transition">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/heic"
                      multiple={true}
                      onChange={(e) => handlePhotoUpload(e, "append")}
                      className="hidden"
                    />
                    <Upload className="h-4 w-4 text-rose-400" />
                    <span>Upload multiple photos all at once (Appends to gallery)</span>
                  </label>
                </div>
              </div>

              {/* Phase 2: Collage Layout Style for Interactive Pages */}
              {productType === "PAGE" && (
                <div className="pt-3 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      Interactive Page Collage Layout
                    </label>
                    <span className="text-[10px] text-rose-400">
                      Multimedia Rich
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "masonry",
                        label: "Masonry Pinboard",
                        desc: "Staggered polaroids & badges",
                        icon: Camera,
                      },
                      {
                        id: "timeline",
                        label: "Memory Lane",
                        desc: "Chronological story milestones",
                        icon: Calendar,
                      },
                      {
                        id: "filmstrip",
                        label: "35mm Filmstrip",
                        desc: "Cinematic retro movie reel",
                        icon: Film,
                      },
                    ].map((col) => {
                      const IconComp = col.icon;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setCollageLayout(col.id as CollageLayoutStyle)}
                          className={`rounded-2xl border p-3 text-left transition ${
                            collageLayout === col.id
                              ? "border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm"
                              : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 mb-1">
                            <IconComp className="h-3.5 w-3.5 text-rose-400" />
                            <span className="text-xs font-bold text-white">
                              {col.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-tight">
                            {col.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                          selectedBuiltinTrack === track.id
                            ? "border-rose-500 bg-rose-500/10 text-white shadow-sm"
                            : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={(e) => toggleAudioPreview(track, e)}
                            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition shrink-0 ${
                              playingPreviewTrackId === track.id
                                ? "border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/30"
                                : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-rose-500 hover:text-white"
                            }`}
                            title={playingPreviewTrackId === track.id ? "Pause Preview" : "Play Preview"}
                          >
                            {playingPreviewTrackId === track.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 ml-0.5" />
                            )}
                          </button>

                          <div>
                            <div className="text-xs font-semibold flex items-center space-x-2">
                              <span>{track.title}</span>
                              {playingPreviewTrackId === track.id && (
                                <span className="text-[10px] text-rose-400 font-mono animate-pulse">
                                  Playing...
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 capitalize">
                              {track.category} • {track.genre}
                            </div>
                          </div>
                        </div>

                        {selectedBuiltinTrack === track.id && (
                          <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-semibold">
                            <span>Selected</span>
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {audioError && (
                  <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300 mb-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{audioError}</span>
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
                  <div className="flex items-baseline justify-end space-x-2">
                    {isDiscounted && originalDisplayPrice && (
                      <span className="text-sm font-semibold text-neutral-500 line-through">
                        {symbol}{originalDisplayPrice}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-white">
                      {symbol}{displayPrice}
                    </span>
                  </div>
                  {isFounderFree ? (
                    <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30 uppercase mt-0.5">
                      Founder Pass (100% Free)
                    </span>
                  ) : isDiscounted ? (
                    <span className="inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30 uppercase mt-0.5">
                      50% Off Regift
                    </span>
                  ) : null}
                  <div className="text-[10px] text-neutral-400 uppercase">
                    {currency} • {isFounderFree ? "Founder Edition" : "Direct Order"}
                  </div>
                  {!isFounderFree && (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => setShowCurrencyOverride(!showCurrencyOverride)}
                        className="text-[10px] text-neutral-400 hover:text-rose-300 underline transition"
                      >
                        {showCurrencyOverride ? "Hide currency options" : "Paying from another country? Change currency"}
                      </button>
                      {showCurrencyOverride && (
                        <div className="mt-2 flex items-center justify-end space-x-1.5 animate-in fade-in">
                          {(["INR", "USD", "EUR", "GBP"] as CurrencyCode[]).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setCurrency(c);
                                setShowCurrencyOverride(false);
                              }}
                              className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                                currency === c
                                  ? "bg-rose-500 text-white shadow-sm"
                                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Itemized Order Breakdown */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span>
                    {productType === "CARD" ? "Digital Card" : "Interactive Page"} ({tier === "RUSH" ? "Emergency Rush" : tier === "CUSTOM" ? "Custom Handcrafted" : "Self-Service"})
                  </span>
                  <span className="font-semibold text-white">
                    {isFounderFree ? `${symbol}0` : `${symbol}${
                      tier === "RUSH"
                        ? (productType === "CARD" ? PRICING_TIERS[region].rushCardPrice : PRICING_TIERS[region].rushPrice)
                        : tier === "CUSTOM"
                        ? (productType === "CARD" ? PRICING_TIERS[region].customCardPrice : PRICING_TIERS[region].customPrice)
                        : (productType === "CARD" ? PRICING_TIERS[region].cardPrice : PRICING_TIERS[region].pagePrice)
                    }`}
                  </span>
                </div>
                {isBundle && (
                  <div className="flex items-center justify-between text-rose-300 pt-1.5 border-t border-neutral-800/80">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                      <span>Bundle Addon (Card + Interactive Page)</span>
                    </span>
                    <span className="font-semibold text-rose-300">
                      +{symbol}{PRICING_TIERS[region].bundleAddonPrice}
                    </span>
                  </div>
                )}
                {isRegiftDiscount && (
                  <div className="flex items-center justify-between text-emerald-400 pt-1.5 border-t border-neutral-800/80">
                    <span>50% Off Regift Discount</span>
                    <span className="font-semibold">-50%</span>
                  </div>
                )}
              </div>

              {formError && (
                <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Confirmed Regift 50% discount status banner */}
              {!isFounderFree && (
                <div>
                  {isRegiftDiscount ? (
                    <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-emerald-950/20 p-4 shadow-lg flex items-center space-x-3 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                        <Gift className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          Verified Regift Recipient • 50% OFF Active
                        </span>
                        <p className="text-xs text-neutral-200 mt-0.5">
                          Replying to <strong>{replySender || "your sender"}</strong>. 50% discount has been verified and applied!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3.5 text-left flex items-center space-x-2.5 text-[11px] text-neutral-400">
                      <Tag className="h-4 w-4 text-neutral-500 shrink-0" />
                      <span>50% regift discount automatically unlocks when replying to any Lovewrit gift you received.</span>
                    </div>
                  )}
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
                    required={!isFounderFree}
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
                className={`group relative flex w-full items-center justify-center rounded-2xl ${
                  isFounderFree
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-amber-500/25"
                    : "bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/25"
                } px-6 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Publishing Lovewrit...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isFounderFree ? (
                      <>
                        <Crown className="h-4 w-4" />
                        <span>Instant Publish (Founder Pass • {symbol}0 Free)</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        <span>Proceed to Checkout ({symbol}{displayPrice})</span>
                      </>
                    )}
                  </div>
                )}
              </button>

              <p className="text-center text-[10px] text-neutral-500">
                🔒 Safe 256-bit encrypted checkout via Stripe • Multi-currency regional pricing guaranteed
              </p>
            </form>
          </div>

          {/* RIGHT: LIVE PREVIEW (5 cols on desktop, isolated sticky scroll container) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto overscroll-contain pr-1 space-y-4 ${
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
                photoUrls={pagePhotos}
                photoShape={photoShape}
                colorTheme={selectedTheme}
                location={location}
                venueName={venueName}
                venueAddress={venueAddress}
                venueMapUrl={venueMapUrl}
                eventDate={eventDate}
                eventTime={eventTime}
                voiceMessageUrl={voiceMemoUrl}
                showOmMotif={showOmMotif}
                showBismillah={showBismillah}
              />
            ) : (
              <PagePreview
                senderName={senderName}
                recipientName={recipientName}
                occasion={occasion}
                letter={message}
                photoUrls={pagePhotos}
                colorTheme={selectedTheme}
                collageLayout={collageLayout}
                isProposal={isProposal && occasion === "proposal"}
                proposalQuestion={proposalQuestion}
                venueName={venueName}
                venueAddress={venueAddress}
                venueMapUrl={venueMapUrl}
                eventDate={eventDate}
                eventTime={eventTime}
                voiceMessageUrl={voiceMemoUrl}
                musicTrackName={activeTrackObj?.title}
                previewOnly={true}
                showOmMotif={showOmMotif}
                showBismillah={showBismillah}
                isAdSupported={isFreeAdPage}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
