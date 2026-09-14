"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, Music2 } from "lucide-react";

interface AudioPlayerProps {
  src?: string | null;
  title?: string;
  autoPlay?: boolean;
}

export default function AudioPlayer({
  src,
  title = "Occasion Soundtrack",
  autoPlay = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audioRef.current = audio;

    if (autoPlay) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.log("Audio autoplay prevented by browser policy:", e);
        });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src, autoPlay]);

  if (!src) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => console.log("Audio play error", err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-full border border-rose-500/40 bg-neutral-950/90 px-4 py-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 transition-all hover:scale-[1.02]">
      {/* Animated Equalizer or Music icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
        {isPlaying ? (
          <div className="flex items-end space-x-0.5 h-3.5">
            <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.8s_infinite] h-full" />
            <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_1.1s_infinite] h-2/3" />
            <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.7s_infinite] h-4/5" />
          </div>
        ) : (
          <Music2 className="h-4 w-4 opacity-70" />
        )}
      </div>

      {/* Track info */}
      <div className="flex flex-col pr-1">
        <span className="text-[11px] font-semibold text-white truncate max-w-[130px] sm:max-w-[170px]">
          {title}
        </span>
        <span className={`text-[9px] font-medium ${isPlaying ? "text-emerald-400" : "text-neutral-400"}`}>
          {isPlaying ? "Playing melody" : "Tap to play music"}
        </span>
      </div>

      {/* Play / Pause Toggle Button */}
      <button
        onClick={togglePlay}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition hover:scale-105 active:scale-95 ${
          isPlaying
            ? "bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-rose-400"
            : "bg-rose-500 hover:bg-rose-600"
        }`}
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:text-white transition"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
