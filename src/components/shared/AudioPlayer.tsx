"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";

interface AudioPlayerProps {
  src?: string | null;
  title?: string;
  autoPlay?: boolean;
}

export default function AudioPlayer({ src, title = "Background Song", autoPlay = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audioRef.current = audio;

    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.log("Audio autoplay prevented by browser:", e);
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
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => console.log("Audio play error", err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-full border border-rose-500/30 bg-neutral-900/90 px-3.5 py-2 shadow-2xl backdrop-blur-md transition-all hover:scale-105">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
        <Music className={`h-3.5 w-3.5 ${isPlaying ? "animate-spin" : ""}`} />
      </div>

      <div className="flex flex-col pr-1">
        <span className="text-[11px] font-medium text-neutral-200 truncate max-w-[120px] sm:max-w-[160px]">
          {title}
        </span>
        <span className="text-[9px] text-rose-400/80">
          {isPlaying ? "Playing melody" : "Paused"}
        </span>
      </div>

      <button
        onClick={togglePlay}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-0.5" />}
      </button>

      <button
        onClick={toggleMute}
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:text-white transition"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
