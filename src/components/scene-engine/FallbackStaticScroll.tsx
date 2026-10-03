"use client";

import React from "react";
import {
  SceneConfig,
  BalloonPopSceneConfig,
  HowWeMetSceneConfig,
  TimelineSceneConfig,
  ChatStorySceneConfig,
  MemoriesSceneConfig,
  PromisesSceneConfig,
  ArrowHeartSceneConfig,
} from "@/types/scenes";
import { Heart, Sparkles, MapPin, Camera, MessageCircle, HeartHandshake } from "lucide-react";
import { ColorThemeKey } from "@/lib/templates-data";

interface FallbackStaticScrollProps {
  scenes: SceneConfig[];
  senderName: string;
  recipientName: string;
  letter: string;
  colorTheme?: ColorThemeKey;
  fontFamily?: string;
  guestName?: string | null;
}

export function FallbackStaticScroll({
  scenes,
  senderName,
  recipientName,
  letter,
  guestName,
}: FallbackStaticScrollProps) {
  const displayRecipient = guestName || recipientName;

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white p-6 sm:p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-12 py-10">
        {/* Opener / Header */}
        <div className="text-center space-y-3 border-b border-white/10 pb-8">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs text-rose-300">
            <Sparkles className="h-3 w-3" />
            <span>A Special Story</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Dearest {displayRecipient}
          </h1>
          <p className="text-sm text-neutral-400">
            Written with heartfelt care from {senderName}
          </p>
        </div>

        {/* Dynamic Scenes Stack */}
        {scenes.map((scene) => {
          if (!scene.enabled) return null;

          if (scene.type === "balloon_pop") {
            const bp = scene as BalloonPopSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <div className="text-center">
                  <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
                    Reasons in My Heart
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white mt-1">
                    {bp.title}
                  </h3>
                </div>
                <div className="space-y-3 pt-2">
                  {bp.reasons.map((r, i) => (
                    <div key={i} className="flex items-start space-x-3 rounded-2xl bg-black/40 p-3.5 border border-white/5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-300">
                        {i + 1}
                      </span>
                      <p className="text-xs sm:text-sm font-serif italic text-neutral-200 leading-relaxed">
                        {r}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-2">
                  <h4 className="text-base font-serif font-bold text-rose-300">
                    {bp.completionTitle}
                  </h4>
                  <p className="text-xs text-neutral-400">{bp.completionSubtitle}</p>
                </div>
              </div>
            );
          }

          if (scene.type === "how_we_met") {
            const hwm = scene as HowWeMetSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 text-xs text-rose-400 mb-1">
                    <Heart className="w-3 h-3 fill-rose-400" />
                    <span>{hwm.dateLabel || "How We Met"}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">{hwm.title}</h3>
                </div>
                {hwm.photoUrl && (
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hwm.photoUrl} alt="Moment" className="w-full h-full object-cover" />
                    {hwm.location && (
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 text-white">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{hwm.location}</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="font-serif italic text-sm text-neutral-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5">
                  {hwm.storyText}
                </p>
              </div>
            );
          }

          if (scene.type === "timeline") {
            const tl = scene as TimelineSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-serif font-bold text-white text-center">{tl.title}</h3>
                <div className="space-y-4 pt-2">
                  {tl.events.map((evt) => (
                    <div key={evt.id} className="rounded-2xl bg-black/40 p-4 border border-white/5 space-y-2">
                      <span className="text-xs font-mono text-rose-400 font-semibold uppercase">{evt.yearOrDate}</span>
                      <h4 className="font-serif font-bold text-white text-base">{evt.title}</h4>
                      <p className="text-xs sm:text-sm text-neutral-300">{evt.description}</p>
                      {evt.photoUrl && (
                        <div className="aspect-video w-full rounded-xl overflow-hidden mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={evt.photoUrl} alt={evt.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (scene.type === "chat_story") {
            const cs = scene as ChatStorySceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <MessageCircle className="w-4 h-4 text-rose-400" />
                  <h3 className="font-serif font-bold text-white text-base">{cs.contactName}</h3>
                </div>
                <div className="space-y-3">
                  {cs.messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.sender === "buyer" ? "items-end" : "items-start"}`}>
                      <div className={`p-3 rounded-2xl max-w-[80%] text-xs sm:text-sm ${m.sender === "buyer" ? "bg-rose-600 text-white" : "bg-white/10 text-neutral-200"}`}>
                        <p>{m.text}</p>
                        {m.imageUrl && (
                          <div className="mt-2 rounded-lg overflow-hidden max-h-40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.imageUrl} alt="attachment" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (scene.type === "memories") {
            const mem = scene as MemoriesSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{mem.title}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {mem.memories.map((m) => (
                    <div key={m.id} className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                      <div className="aspect-square w-full rounded-xl overflow-hidden mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.photoUrl} alt={m.title} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-serif font-bold text-white text-sm">{m.title}</h4>
                      {m.caption && <p className="text-xs text-neutral-400 mt-1">{m.caption}</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (scene.type === "promises") {
            const pr = scene as PromisesSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400">
                  <HeartHandshake className="w-4 h-4" />
                  <span>{pr.title}</span>
                </div>
                <div className="space-y-2.5 pt-2">
                  {pr.items.map((it, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/5">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0 mt-0.5" />
                      <p className="font-serif italic text-sm text-neutral-200">{it}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (scene.type === "arrow_heart") {
            const ah = scene as ArrowHeartSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-6 sm:p-8 text-center space-y-4">
                <Heart className="w-10 h-10 text-rose-500 fill-rose-500 mx-auto animate-pulse" />
                <h3 className="font-serif font-bold text-xl text-white">{ah.title}</h3>
                <p className="font-serif italic text-rose-300 text-base">{ah.burstMessage}</p>
                {ah.isProposal && ah.questionText && (
                  <div className="bg-black/40 border border-rose-500/40 p-4 rounded-2xl mt-4">
                    <p className="font-serif font-bold text-lg text-rose-200 mb-2">{ah.questionText}</p>
                    <p className="text-xs text-neutral-400 italic">*Terms &amp; Conditions: Closing this page is always an option 😉</p>
                  </div>
                )}
              </div>
            );
          }

          if (scene.type === "letter_unfold") {
            return (
              <div key={scene.id} className="rounded-3xl border border-rose-500/30 bg-black/60 p-6 sm:p-10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-serif font-bold text-white">The Letter</h3>
                  <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />
                </div>
                <p className="font-serif italic text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-neutral-200">
                  {letter}
                </p>
                <div className="text-right pt-4 border-t border-white/10">
                  <span className="text-xs font-serif italic text-neutral-400">With love,</span>
                  <div className="text-base font-serif font-bold text-rose-300 mt-1">{senderName}</div>
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Finale signoff */}
        <div className="text-center pt-8 border-t border-white/10 text-xs text-neutral-500">
          Crafted with love on Lovewrit • Preserved forever
        </div>
      </div>
    </div>
  );
}
