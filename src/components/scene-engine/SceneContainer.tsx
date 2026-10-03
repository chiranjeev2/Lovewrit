"use client";

import React, { useState, useEffect, useRef, useTransition, Suspense } from "react";
import dynamic from "next/dynamic";
import { SceneConfig, BalloonPopSceneConfig } from "@/types/scenes";
import { SceneNavigation } from "./SceneNavigation";
import { SceneTransitionWrapper } from "./SceneTransitionWrapper";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { FallbackStaticScroll } from "./FallbackStaticScroll";
import { ColorThemeKey } from "@/lib/templates-data";

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

interface SceneContainerProps {
  scenes: SceneConfig[];
  senderName: string;
  recipientName: string;
  letter: string;
  colorTheme?: ColorThemeKey;
  fontFamily?: string;
  audioTrackUrl?: string | null;
  guestName?: string | null;
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
  onSendReply,
  previewActiveIndex,
}: SceneContainerProps) {
  // Filter active enabled scenes
  const enabledScenes = initialScenes.filter((s) => s.enabled);
  const totalScenes = enabledScenes.length;

  const [currentIndex, setCurrentIndex] = useState(previewActiveIndex ?? 0);
  const [direction, setDirection] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);
  const [completedInteractions, setCompletedInteractions] = useState<Record<string, boolean>>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Sync with studio preview dock if prop changes
  useEffect(() => {
    if (previewActiveIndex !== undefined && previewActiveIndex >= 0 && previewActiveIndex < totalScenes) {
      setDirection(previewActiveIndex >= currentIndex ? 1 : -1);
      setCurrentIndex(previewActiveIndex);
    }
  }, [previewActiveIndex, totalScenes]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
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
  const isFinale = currentScene?.type === "finale";
  const isInteractionScene = currentScene?.type === "balloon_pop" || currentScene?.type === "arrow_heart";
  const isLetterScene = currentScene?.type === "letter_unfold";

  // Check if current interaction is completed or skipped
  const isCurrentInteractionDone = completedInteractions[currentScene?.id] === true;
  const canAdvance = isInteractionScene ? isCurrentInteractionDone : true;

  const handleNext = () => {
    if (currentIndex < totalScenes - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

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
  }, [currentIndex, isInteractionScene, isLetterScene, isOpener]);

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

  return (
    <SceneErrorBoundary fallback={fallbackScrollNode}>
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[100dvh] max-h-[100dvh] bg-neutral-950 overflow-hidden select-none flex flex-col justify-between"
      >
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

              {currentScene.type === "finale" && (
                <FinaleScene
                  title={currentScene.title}
                  subtitle={currentScene.subtitle}
                  senderName={senderName}
                  recipientName={recipientName}
                  guestName={guestName}
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
