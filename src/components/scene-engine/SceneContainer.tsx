"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import {
  SceneConfig,
  BalloonPopSceneConfig,
  HowWeMetSceneConfig,
  TimelineSceneConfig,
  ChatStorySceneConfig,
  MemoriesSceneConfig,
  PromisesSceneConfig,
  ArrowHeartSceneConfig,
  WeddingStorySceneConfig,
  PartyThemeSceneConfig,
  EventDetailsSceneConfig,
  PersonalNoteSceneConfig,
  RsvpSceneConfig,
  NameMeaningSceneConfig,
  DayArrivedSceneConfig,
  WishesSceneConfig,
  BirthdayFinaleSceneConfig,
  GodhbharaiBlessingsSceneConfig,
  BabyRevealSceneConfig,
  TributeCandleSceneConfig,
  WhatTheyTaughtUsSceneConfig,
  TributeWallSceneConfig,
  ClosingPrayerSceneConfig,
  DevotionalBlessingSceneConfig,
  DevotionalSignificanceSceneConfig,
  DevotionalFinaleSceneConfig,
} from "@/types/scenes";
import { SceneNavigation } from "./SceneNavigation";
import { SceneTransitionWrapper } from "./SceneTransitionWrapper";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { FallbackStaticScroll } from "./FallbackStaticScroll";
import { ColorThemeKey, COLOR_THEMES } from "@/lib/templates-data";

// Lazy-loaded scene components for optimized bundle and smooth execution
const OpenerScene = dynamic(() => import("./scenes/OpenerScene").then((m) => m.OpenerScene), {
  ssr: false,
});
const BalloonPopScene = dynamic(() => import("./scenes/BalloonPopScene").then((m) => m.BalloonPopScene), {
  ssr: false,
});
const LetterUnfoldScene = dynamic(() => import("./scenes/LetterUnfoldScene").then((m) => m.LetterUnfoldScene), {
  ssr: false,
});
const ForgiveReplyScene = dynamic(() => import("./scenes/ForgiveReplyScene").then((m) => m.ForgiveReplyScene), {
  ssr: false,
});
const FinaleScene = dynamic(() => import("./scenes/FinaleScene").then((m) => m.FinaleScene), {
  ssr: false,
});
const HowWeMetScene = dynamic(() => import("./scenes/HowWeMetScene"), {
  ssr: false,
});
const TimelineScene = dynamic(() => import("./scenes/TimelineScene"), {
  ssr: false,
});
const ChatStoryScene = dynamic(() => import("./scenes/ChatStoryScene"), {
  ssr: false,
});
const MemoriesScene = dynamic(() => import("./scenes/MemoriesScene"), {
  ssr: false,
});
const PromisesScene = dynamic(() => import("./scenes/PromisesScene"), {
  ssr: false,
});
const ArrowHeartScene = dynamic(() => import("./scenes/ArrowHeartScene"), {
  ssr: false,
});
const WeddingStoryScene = dynamic(() => import("./scenes/WeddingStoryScene"), {
  ssr: false,
});
const PartyThemeScene = dynamic(() => import("./scenes/PartyThemeScene"), {
  ssr: false,
});
const EventDetailsScene = dynamic(() => import("./scenes/EventDetailsScene"), {
  ssr: false,
});
const PersonalNoteScene = dynamic(() => import("./scenes/PersonalNoteScene"), {
  ssr: false,
});
const RsvpScene = dynamic(() => import("./scenes/RsvpScene"), {
  ssr: false,
});
const NameMeaningScene = dynamic(() => import("./scenes/NameMeaningScene"), {
  ssr: false,
});
const DayArrivedScene = dynamic(() => import("./scenes/DayArrivedScene"), {
  ssr: false,
});
const WishesScene = dynamic(() => import("./scenes/WishesScene"), {
  ssr: false,
});
const BirthdayFinaleScene = dynamic(() => import("./scenes/BirthdayFinaleScene"), {
  ssr: false,
});
const GodhbharaiBlessingsScene = dynamic(() => import("./scenes/GodhbharaiBlessingsScene"), {
  ssr: false,
});
const BabyRevealScene = dynamic(() => import("./scenes/BabyRevealScene"), {
  ssr: false,
});
const TributeCandleScene = dynamic(() => import("./scenes/TributeCandleScene"), {
  ssr: false,
});
const WhatTheyTaughtUsScene = dynamic(() => import("./scenes/WhatTheyTaughtUsScene"), {
  ssr: false,
});
const TributeWallScene = dynamic(() => import("./scenes/TributeWallScene"), {
  ssr: false,
});
const ClosingPrayerScene = dynamic(() => import("./scenes/ClosingPrayerScene"), {
  ssr: false,
});
const DevotionalBlessingScene = dynamic(() => import("./scenes/DevotionalBlessingScene"), {
  ssr: false,
});
const DevotionalSignificanceScene = dynamic(() => import("./scenes/DevotionalSignificanceScene"), {
  ssr: false,
});
const DevotionalFinaleScene = dynamic(() => import("./scenes/DevotionalFinaleScene"), {
  ssr: false,
});

interface SceneContainerProps {
  scenes: SceneConfig[];
  senderName: string;
  recipientName: string;
  letter: string;
  colorTheme?: ColorThemeKey;
  fontFamily?: string;
  audioTrackUrl?: string | null;
  guestName?: string | null;
  slug?: string;
  token?: string | null;
  isTribute?: boolean;
  onSendReply?: (text: string) => Promise<void>;
  previewActiveIndex?: number; // Studio preview control
}

export function SceneContainer({
  scenes: initialScenes,
  senderName,
  recipientName,
  letter,
  colorTheme = "rose",
  fontFamily = "serif",
  audioTrackUrl,
  guestName,
  slug,
  token,
  isTribute: isTributeProp,
  onSendReply,
  previewActiveIndex,
}: SceneContainerProps) {
  // Check if this experience is a Sacred Tribute
  const isTribute = Boolean(
    isTributeProp ||
    initialScenes.some(
      (s) =>
        s.type === "tribute_candle" ||
        s.type === "what_they_taught_us" ||
        s.type === "closing_prayer"
    )
  );

  // Active color theme
  const theme = COLOR_THEMES[colorTheme] || COLOR_THEMES.rose;

  // Filter active enabled scenes
  const enabledScenes = initialScenes.filter((s) => s.enabled);
  const totalScenes = enabledScenes.length;

  const [currentIndex, setCurrentIndex] = useState(previewActiveIndex ?? 0);
  const [prevPropIndex, setPrevPropIndex] = useState(previewActiveIndex);
  const [direction, setDirection] = useState(1);

  if (previewActiveIndex !== undefined && previewActiveIndex !== prevPropIndex) {
    setPrevPropIndex(previewActiveIndex);
    if (previewActiveIndex >= 0 && previewActiveIndex < totalScenes) {
      setDirection(previewActiveIndex >= currentIndex ? 1 : -1);
      setCurrentIndex(previewActiveIndex);
    }
  }

  // Music is OFF by default for Sacred Tribute per prompt specification
  const [isMuted, setIsMuted] = useState(isTribute);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [completedInteractions, setCompletedInteractions] = useState<Record<string, boolean>>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const timer = setTimeout(() => {
        setPrefersReducedMotion(mediaQuery.matches);
      }, 0);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => {
        clearTimeout(timer);
        mediaQuery.removeEventListener("change", listener);
      };
    }
  }, []);

  // Initialize background audio element once at container level
  useEffect(() => {
    if (audioTrackUrl && typeof window !== "undefined") {
      const audio = new Audio(audioTrackUrl);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;

      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioTrackUrl]);

  const startAudioOnFirstInteraction = () => {
    if (!hasStartedAudio && audioRef.current) {
      audioRef.current.play().catch((err) => console.log("Audio autoplay prevented:", err));
      setHasStartedAudio(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const currentScene = enabledScenes[currentIndex] || enabledScenes[0];
  const isOpener = currentScene?.type === "opener";
  const isFinale =
    currentScene?.type === "finale" ||
    currentScene?.type === "closing_prayer" ||
    currentScene?.type === "devotional_finale";
  const isInteractionScene =
    currentScene?.type === "balloon_pop" ||
    currentScene?.type === "arrow_heart" ||
    currentScene?.type === "birthday_finale" ||
    currentScene?.type === "baby_reveal" ||
    currentScene?.type === "tribute_candle";
  const isLetterScene = currentScene?.type === "letter_unfold";

  // Check if current interaction is completed or skipped
  const isCurrentInteractionDone = completedInteractions[currentScene?.id] === true;
  const canAdvance = isInteractionScene ? isCurrentInteractionDone : true;

  const handleNext = useCallback(() => {
    if (currentIndex < totalScenes - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalScenes]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleSkipToEnd = () => {
    setDirection(1);
    setCurrentIndex(totalScenes - 1);
  };

  const handleSkipInteraction = () => {
    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a textarea or input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " " || e.key === "ArrowDown") {
        if (!isInteractionScene && !isLetterScene) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (!isOpener) {
          e.preventDefault();
          handlePrev();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isInteractionScene, isLetterScene, isOpener, handleNext, handlePrev]);

  // Touch swipe handling (disabled inside interaction and letter scenes per Rule 4)
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInteractionScene || isLetterScene) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isInteractionScene || isLetterScene || touchStartY.current === null || touchStartX.current === null) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    // Minimum swipe threshold: 50px
    if (Math.abs(deltaY) > 50 || Math.abs(deltaX) > 50) {
      if (deltaY > 50 || deltaX > 50) {
        handleNext();
      } else if (deltaY < -50 || deltaX < -50) {
        handlePrev();
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  const fallbackScrollNode = (
    <FallbackStaticScroll
      scenes={enabledScenes}
      senderName={senderName}
      recipientName={recipientName}
      letter={letter}
      colorTheme={colorTheme}
      fontFamily={fontFamily}
      guestName={guestName}
    />
  );

  if (prefersReducedMotion) {
    return fallbackScrollNode;
  }

  return (
    <SceneErrorBoundary fallback={fallbackScrollNode}>
      <main
        id="lovewrit-scene-engine-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full h-[100dvh] max-h-[100dvh] bg-gradient-to-b ${theme.bgGradient} overflow-hidden select-none flex flex-col justify-between`}
      >
        {/* Themed Ambient Atmosphere Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 blur-3xl transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 35%, ${theme.accentColor} 0%, transparent 65%)`,
          }}
        />

        {/* Navigation Overlays */}
        <SceneNavigation
          currentIndex={currentIndex}
          totalScenes={totalScenes}
          canAdvance={canAdvance}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkipToEnd={handleSkipToEnd}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isInteractionGated={isInteractionScene && !isCurrentInteractionDone}
          onSkipInteraction={handleSkipInteraction}
          isLastScene={isFinale}
          isOpener={isOpener}
          nextButtonLabel={isLetterScene ? "Continue to Response" : "Continue"}
          colorTheme={colorTheme}
        />

        {/* Scene Viewport with Animated Transitions */}
        <div className="relative w-full h-full flex-1 overflow-hidden">
          <SceneTransitionWrapper
            sceneKey={currentScene.id}
            direction={direction}
            prefersReducedMotion={prefersReducedMotion}
          >
            <Suspense fallback={<div className="text-white text-xs animate-pulse">Loading scene...</div>}>
              {currentScene.type === "opener" && (
                <OpenerScene
                  title={currentScene.title}
                  subtitle={currentScene.subtitle}
                  senderName={senderName}
                  recipientName={recipientName}
                  guestName={guestName}
                  colorTheme={colorTheme}
                  onOpen={() => {
                    startAudioOnFirstInteraction();
                    handleNext();
                  }}
                />
              )}

              {currentScene.type === "balloon_pop" && (
                <BalloonPopScene
                  title={currentScene.title}
                  subtitle={currentScene.subtitle}
                  reasons={(currentScene as BalloonPopSceneConfig).reasons}
                  completionTitle={(currentScene as BalloonPopSceneConfig).completionTitle}
                  completionSubtitle={(currentScene as BalloonPopSceneConfig).completionSubtitle}
                  onComplete={() => {
                    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
                  }}
                />
              )}

              {currentScene.type === "how_we_met" && (
                <HowWeMetScene
                  config={currentScene as HowWeMetSceneConfig}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "timeline" && (
                <TimelineScene
                  config={currentScene as TimelineSceneConfig}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "chat_story" && (
                <ChatStoryScene
                  config={currentScene as ChatStorySceneConfig}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "memories" && (
                <MemoriesScene
                  config={currentScene as MemoriesSceneConfig}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "promises" && (
                <PromisesScene
                  config={currentScene as PromisesSceneConfig}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "arrow_heart" && (
                <ArrowHeartScene
                  config={currentScene as ArrowHeartSceneConfig}
                  onContinue={() => {
                    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
                    handleNext();
                  }}
                />
              )}

              {currentScene.type === "letter_unfold" && (
                <LetterUnfoldScene
                  title={currentScene.title}
                  subtitle={currentScene.subtitle}
                  senderName={senderName}
                  recipientName={recipientName}
                  letter={letter}
                  colorTheme={colorTheme}
                  fontFamily={fontFamily}
                  onScrolledToEnd={() => {
                    // Automatically signals letter completion
                  }}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "wedding_story" && (
                <WeddingStoryScene
                  config={currentScene as WeddingStorySceneConfig}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "party_theme" && (
                <PartyThemeScene
                  config={currentScene as PartyThemeSceneConfig}
                  onContinue={handleNext}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "event_details" && (
                <EventDetailsScene
                  config={currentScene as EventDetailsSceneConfig}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "personal_note" && (
                <PersonalNoteScene
                  config={currentScene as PersonalNoteSceneConfig}
                  guestName={guestName}
                  recipientName={recipientName}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "name_meaning" && (
                <NameMeaningScene
                  config={currentScene as NameMeaningSceneConfig}
                  onContinue={handleNext}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "day_arrived" && (
                <DayArrivedScene
                  config={currentScene as DayArrivedSceneConfig}
                  onContinue={handleNext}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "wishes" && (
                <WishesScene
                  config={currentScene as WishesSceneConfig}
                  onContinue={handleNext}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "birthday_finale" && (
                <BirthdayFinaleScene
                  config={currentScene as BirthdayFinaleSceneConfig}
                  onContinue={() => {
                    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
                    handleNext();
                  }}
                  onReplay={() => {
                    setDirection(-1);
                    setCurrentIndex(0);
                  }}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "godhbharai_blessings" && (
                <GodhbharaiBlessingsScene
                  config={currentScene as GodhbharaiBlessingsSceneConfig}
                  onContinue={handleNext}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "baby_reveal" && (
                <BabyRevealScene
                  config={currentScene as BabyRevealSceneConfig}
                  onComplete={() => {
                    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
                  }}
                  onContinue={() => {
                    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
                    handleNext();
                  }}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "rsvp" && (
                <RsvpScene
                  config={currentScene as RsvpSceneConfig}
                  guestName={guestName}
                  recipientName={recipientName}
                  onContinue={handleNext}
                />
              )}

              {currentScene.type === "forgive_reply" && (
                <ForgiveReplyScene
                  title={currentScene.title}
                  subtitle={currentScene.subtitle}
                  senderName={senderName}
                  recipientName={recipientName}
                  onForgive={() => {
                    // Mark forgiven
                  }}
                  onSendReply={onSendReply}
                />
              )}

              {currentScene.type === "tribute_candle" && (
                <TributeCandleScene
                  config={currentScene as TributeCandleSceneConfig}
                  onComplete={() => {
                    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
                  }}
                  onContinue={() => {
                    setCompletedInteractions((prev) => ({ ...prev, [currentScene.id]: true }));
                    handleNext();
                  }}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "what_they_taught_us" && (
                <WhatTheyTaughtUsScene
                  config={currentScene as WhatTheyTaughtUsSceneConfig}
                  onContinue={handleNext}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "tribute_wall" && (
                <TributeWallScene
                  config={currentScene as TributeWallSceneConfig}
                  onContinue={handleNext}
                  slug={slug}
                  token={token}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "closing_prayer" && (
                <ClosingPrayerScene
                  config={currentScene as ClosingPrayerSceneConfig}
                  onReplay={() => {
                    setDirection(-1);
                    setCurrentIndex(0);
                  }}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "devotional_blessing" && (
                <DevotionalBlessingScene
                  config={currentScene as DevotionalBlessingSceneConfig}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "devotional_significance" && (
                <DevotionalSignificanceScene
                  config={currentScene as DevotionalSignificanceSceneConfig}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "devotional_finale" && (
                <DevotionalFinaleScene
                  config={currentScene as DevotionalFinaleSceneConfig}
                  onReplay={() => {
                    setDirection(-1);
                    setCurrentIndex(0);
                  }}
                  theme={colorTheme}
                />
              )}

              {currentScene.type === "finale" && (
                <FinaleScene
                  title={currentScene.title}
                  subtitle={currentScene.subtitle}
                  senderName={senderName}
                  recipientName={recipientName}
                  guestName={guestName}
                  isTribute={isTribute}
                  onReplay={() => {
                    setDirection(-1);
                    setCurrentIndex(0);
                  }}
                />
              )}
            </Suspense>
          </SceneTransitionWrapper>
        </div>
      </main>
    </SceneErrorBoundary>
  );
}

