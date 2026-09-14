"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Play, Pause, Volume2 } from "lucide-react";

interface VoiceMessagePlayerProps {
  audioUrl?: string | null;
  senderName?: string;
}

export default function VoiceMessagePlayer({
  audioUrl,
  senderName = "The sender",
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.src = "";
    };
  }, [audioUrl]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.log("Voice memo play error:", e));
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative mx-auto my-6 w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-neutral-900/90 p-4 shadow-xl backdrop-blur-xl">
      <div className="flex items-center space-x-3">
        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 transition hover:scale-105 active:scale-95"
          title={isPlaying ? "Pause voice message" : "Play voice message"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5" />
          )}
        </button>

        {/* Waveform & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center space-x-1.5 text-rose-300 font-semibold truncate">
              <Mic className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Voice Note from {senderName}</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 shrink-0">
              {formatSecs(currentTime)} / {duration ? formatSecs(duration) : "0:00"}
            </span>
          </div>

          {/* Animated visual waveform bars */}
          <div className="flex items-center space-x-1 h-7">
            {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 90, 70, 60, 85, 40].map(
              (height, i) => {
                const isActive = (currentTime / (duration || 1)) * 18 >= i;
                return (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isActive
                        ? "bg-rose-400 shadow-sm shadow-rose-400/50"
                        : "bg-neutral-700"
                    } ${isPlaying ? "animate-pulse" : ""}`}
                    style={{
                      height: isPlaying ? `${Math.max(20, height * (0.6 + Math.random() * 0.4))}%` : `${height}%`,
                    }}
                  />
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

