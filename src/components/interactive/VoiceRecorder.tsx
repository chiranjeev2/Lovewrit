"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Check, Loader2, AlertCircle } from "lucide-react";

interface VoiceRecorderProps {
  onRecorded: (url: string, filename: string) => void;
  currentAudioUrl?: string | null;
}

export default function VoiceRecorder({
  onRecorded,
  currentAudioUrl,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAudioUrl || null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());

        // Auto upload the recorded blob
        uploadRecordedAudio(blob);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordSeconds(0);

      // Max 90 seconds timer
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 89) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg("Microphone permission denied or not supported on this browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadRecordedAudio = async (blob: Blob) => {
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", blob, `voice-memo-${Date.now()}.webm`);
      formData.append("kind", "voice");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onRecorded(data.url, data.filename);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving voice memo");
    } finally {
      setIsUploading(false);
    }
  };

  const togglePreview = () => {
    if (!previewUrl) return;

    if (!audioPlayerRef.current) {
      const audio = new Audio(previewUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((e) => console.log(e));
    }
  };

  const resetRecording = () => {
    if (isPlayingPreview && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    }
    setAudioBlob(null);
    setPreviewUrl(null);
    setRecordSeconds(0);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3">
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-2.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recording in progress state */}
      {isRecording ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-red-500/50 bg-red-950/30">
          <div className="flex items-center space-x-3">
            <span className="h-3.5 w-3.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <div className="text-xs font-bold text-red-300">Recording Voice Note...</div>
              <div className="text-[10px] text-neutral-400">Speak into your microphone</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-white">
              {formatTimer(recordSeconds)} / 1:30
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-500 transition shadow-lg"
              title="Stop Recording"
            >
              <Square className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : previewUrl ? (
        /* Preview & re-record state */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={togglePreview}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-400 transition"
              title={isPlayingPreview ? "Pause" : "Listen"}
            >
              {isPlayingPreview ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
            </button>
            <div>
              <div className="text-xs font-semibold text-emerald-300 flex items-center space-x-1">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Voice Note Ready & Attached</span>
              </div>
              <div className="text-[10px] text-neutral-400">
                {isUploading ? "Saving audio..." : "Tap play to review your voice message"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isUploading && <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />}
            <button
              type="button"
              onClick={resetRecording}
              className="inline-flex items-center space-x-1 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Re-record</span>
            </button>
          </div>
        </div>
      ) : (
        /* Default state: Mic button */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:scale-105 active:scale-95 transition"
          >
            <Mic className="h-4 w-4 text-white animate-pulse" />
            <span>Record Voice Memo (Mic)</span>
          </button>

          <span className="text-[11px] text-neutral-400">
            or upload an audio file below (max 90s / 2MB)
          </span>
        </div>
      )}
    </div>
  );
}
