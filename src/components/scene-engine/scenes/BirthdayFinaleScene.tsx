"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BirthdayFinaleSceneConfig } from "@/types/scenes";
import { Sparkles, Mic, MicOff, ArrowRight, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

interface BirthdayFinaleSceneProps {
  config: BirthdayFinaleSceneConfig;
  onContinue: () => void;
  onReplay?: () => void;
  theme?: string;
}

export default function BirthdayFinaleScene({
  config,
  onContinue,
  onReplay,
}: BirthdayFinaleSceneProps) {
  const [isBlown, setIsBlown] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);

  const triggerCelebration = useCallback(() => {
    setIsBlown(true);
    setIsHolding(false);
    setHoldProgress(100);

    // Stop mic if listening
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micAnimFrameRef.current) {
      cancelAnimationFrame(micAnimFrameRef.current);
      micAnimFrameRef.current = null;
    }
    setIsListeningMic(false);

    // Confetti shower
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f43f5e", "#fbbf24", "#a855f7", "#38bdf8", "#34d399"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } catch {
      // Confetti fallback
    }
  }, []);

  // Tap & hold logic (1.2 seconds hold)
  const startHold = () => {
    if (isBlown) return;
    setIsHolding(true);
    const startTime = Date.now();
    const duration = 1200;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(progressIntervalRef.current!);
        triggerCelebration();
      }
    }, 25);
  };

  const endHold = () => {
    if (isBlown) return;
    setIsHolding(false);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  // Strictly opt-in microphone detection (never runs automatically)
  const toggleMicDetection = async () => {
    if (isListeningMic) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      setIsListeningMic(false);
      return;
    }

    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      setIsListeningMic(true);

      let blowStreak = 0;

      const checkBlow = () => {
        if (!mediaStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Breath / blow creates low-frequency rush with volume > 55
        if (average > 55) {
          blowStreak++;
          if (blowStreak >= 3) {
            triggerCelebration();
            return;
          }
        } else {
          blowStreak = Math.max(0, blowStreak - 1);
        }

        micAnimFrameRef.current = requestAnimationFrame(checkBlow);
      };

      checkBlow();
    } catch {
      setMicError("Microphone access unavailable or denied");
      setIsListeningMic(false);
    }
  };

  // Keyboard accessibility: Space or Enter to blow/release
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (!isBlown) {
          e.preventDefault();
          triggerCelebration();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    const holdTimer = holdTimerRef.current;
    const progressInterval = progressIntervalRef.current;
    const audioContext = audioContextRef.current;
    const mediaStream = mediaStreamRef.current;
    const micAnimFrame = micAnimFrameRef.current;
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (progressInterval) clearInterval(progressInterval);
      if (holdTimer) clearTimeout(holdTimer);
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
      if (audioContext) {
        audioContext.close().catch(() => {});
      }
      if (micAnimFrame) cancelAnimationFrame(micAnimFrame);
    };
  }, [isBlown, triggerCelebration]);

  const isBalloonFinale = config.finaleType === "balloon_release";

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Soft background decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Milestone badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium tracking-wide mb-3 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
          <span>{isBalloonFinale ? "Balloon Release Finale" : "Make a Birthday Wish"}</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
          {config.title || (isBalloonFinale ? "Release Your Birthday Wishes" : "Blow the Birthday Candle")}
        </h2>

        {/* INTERACTION AREA */}
        {!isBalloonFinale ? (
          /* Candle Blow Interaction */
          <div className="my-6 flex flex-col items-center">
            {/* Candle Container */}
            <div className="relative flex flex-col items-center justify-center w-40 h-44">
              {/* Flame / Smoke */}
              <AnimatePresence mode="wait">
                {!isBlown ? (
                  <motion.div
                    key="flame"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: [1, 1.08, 0.95, 1.05, 1],
                      opacity: 1,
                      y: [0, -2, 1, -1, 0],
                    }}
                    exit={{
                      scale: [1, 1.3, 0],
                      opacity: [1, 0.8, 0],
                      y: -15,
                      filter: "blur(4px)",
                      transition: { duration: 0.4 },
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                    className="relative flex flex-col items-center mb-1 z-10"
                  >
                    {/* Outer flame glow */}
                    <div className="w-8 h-10 bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 rounded-full blur-[2px] shadow-[0_0_24px_rgba(251,191,36,0.9)]" />
                    {/* Inner hot flame core */}
                    <div className="absolute bottom-1 w-3.5 h-5 bg-gradient-to-t from-blue-300 via-white to-yellow-100 rounded-full" />
                    {/* Wick */}
                    <div className="w-0.5 h-2.5 bg-stone-700 mt-0.5 rounded-full" />
                  </motion.div>
                ) : (
                  /* Extinguished gentle smoke wisps */
                  <motion.div
                    key="smoke"
                    initial={{ opacity: 0, y: 0, scale: 0.6 }}
                    animate={{ opacity: [0.7, 0.4, 0], y: -30, scale: 1.4 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    className="flex flex-col items-center mb-3 text-stone-400 font-mono text-xs"
                  >
                    <span className="text-lg">💨</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Candle Body */}
              <div className="w-7 h-16 bg-gradient-to-b from-rose-200 via-rose-300 to-rose-400 rounded-md shadow-md border border-rose-400/40 relative overflow-hidden">
                {/* Spiral decorative candy bands */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:14px_14px]" />
              </div>

              {/* Cake Stand Base */}
              <div className="w-28 h-6 bg-gradient-to-r from-amber-100 via-stone-100 to-amber-100 rounded-full border border-stone-300 shadow-sm mt-1 flex items-center justify-center">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                </div>
              </div>
            </div>

            {/* Hold-down Action Button */}
            {!isBlown ? (
              <div className="flex flex-col items-center space-y-3 mt-2">
                <button
                  type="button"
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={startHold}
                  onTouchEnd={endHold}
                  className="relative group px-8 py-3.5 rounded-2xl bg-stone-900 text-white font-semibold text-sm shadow-xl hover:bg-stone-800 transition active:scale-95 cursor-pointer overflow-hidden select-none"
                >
                  {/* Circular progress bar fill */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-75"
                    style={{ width: `${holdProgress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <span>{isHolding ? "Blowing..." : "Hold Down to Blow Candle"}</span>
                    <span>🎂</span>
                  </span>
                </button>
                <span className="text-[11px] text-stone-400 font-sans">
                  Tap & hold for 1 second, or press Spacebar
                </span>

                {/* Opt-in Microphone Option (never auto-prompts) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={toggleMicDetection}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                      isListeningMic
                        ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                        : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                    }`}
                  >
                    {isListeningMic ? (
                      <>
                        <Mic className="w-3.5 h-3.5 text-rose-600" />
                        <span>Listening... Blow gently into microphone!</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Blow with Microphone (Opt-in)</span>
                      </>
                    )}
                  </button>
                  {micError && (
                    <div className="text-[11px] text-rose-500 mt-1">{micError}</div>
                  )}
                </div>
              </div>
            ) : (
              /* Success / Blown state */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 space-y-2 max-w-sm"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span>✨ Wish Made!</span>
                </div>
                <p className="font-serif italic text-base sm:text-lg text-stone-800 leading-relaxed">
                  &ldquo;{config.candleBlownMessage || "Make a wish — may all your dreams come true!"}&rdquo;
                </p>
                <p className="text-xs text-stone-500 font-sans">
                  {config.celebrationWish}
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          /* Balloon Release Interaction */
          <div className="my-6 flex flex-col items-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <AnimatePresence>
                {!isBlown ? (
                  <motion.div
                    key="balloons-grouped"
                    initial={{ scale: 0.9 }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="flex items-center justify-center cursor-pointer"
                    onClick={triggerCelebration}
                  >
                    <span className="text-6xl drop-shadow-md">🎈🎈🎈</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="balloons-flying"
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -180, opacity: 0, scale: 1.4 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="flex items-center justify-center"
                  >
                    <span className="text-6xl">🎈🎈🎈</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isBlown ? (
              <button
                type="button"
                onClick={triggerCelebration}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm shadow-xl hover:shadow-2xl transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Release Balloons into the Sky</span>
                <span>🎈</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 space-y-2 max-w-sm"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span>🎈 Wishes Released!</span>
                </div>
                <p className="font-serif italic text-base sm:text-lg text-stone-800 leading-relaxed">
                  &ldquo;{config.celebrationWish}&rdquo;
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Finale Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs mt-4">
          {isBlown && (
            <button
              type="button"
              onClick={() => {
                setIsBlown(false);
                setHoldProgress(0);
                onReplay?.();
              }}
              className="py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
              title="Light candle again"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Relight</span>
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onContinue}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer w-full"
          >
            <span>Complete Story</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
