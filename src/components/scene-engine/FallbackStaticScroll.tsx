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
import { Heart, Sparkles, MapPin, Camera, MessageCircle, HeartHandshake, Sun, Compass } from "lucide-react";
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

          if (scene.type === "wedding_story") {
            const ws = scene as WeddingStorySceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-6 sm:p-8 space-y-4">
                <div className="text-center">
                  {ws.faithTag && (
                    <span className="text-xs font-serif text-amber-300 uppercase tracking-widest block mb-1">
                      {ws.faithTag}
                    </span>
                  )}
                  <h3 className="text-xl font-serif font-bold text-white">{ws.title}</h3>
                </div>
                {ws.photoUrl && (
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-amber-500/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ws.photoUrl} alt="Wedding Couple" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="font-serif italic text-sm text-neutral-200 leading-relaxed bg-black/40 p-4 rounded-xl">
                  {ws.coupleStory}
                </p>
                {ws.verseText && (
                  <p className="text-xs font-serif italic text-amber-200/90 text-center">
                    &ldquo;{ws.verseText}&rdquo;
                  </p>
                )}
              </div>
            );
          }

          if (scene.type === "party_theme") {
            const pt = scene as PartyThemeSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-pink-500/30 bg-pink-950/20 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-center gap-1.5 text-xs text-pink-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Party Theme &amp; Highlights</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white text-center">{pt.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {pt.partyTheme && (
                    <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-pink-400 font-semibold uppercase block">Theme</span>
                      <p className="text-sm font-serif font-bold text-white">{pt.partyTheme}</p>
                    </div>
                  )}
                  {pt.dressCode && (
                    <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-purple-400 font-semibold uppercase block">Dress Code</span>
                      <p className="text-xs text-neutral-200">{pt.dressCode}</p>
                    </div>
                  )}
                </div>
                {pt.photoUrl && (
                  <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-pink-500/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pt.photoUrl} alt="Party Moodboard" className="w-full h-full object-cover" />
                  </div>
                )}
                {pt.storyText && (
                  <p className="font-sans text-xs sm:text-sm text-neutral-200 leading-relaxed bg-black/40 p-4 rounded-xl">
                    {pt.storyText}
                  </p>
                )}
                {pt.highlights && pt.highlights.length > 0 && (
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider block">Planned Activities</span>
                    {pt.highlights.map((h, i) => (
                      <p key={i} className="text-xs text-neutral-300 flex items-center gap-2">
                        <span className="text-pink-400">✦</span>
                        <span>{h}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (scene.type === "event_details") {
            const ed = scene as EventDetailsSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-serif font-bold text-white text-center">{ed.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {ed.eventDate && (
                    <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-amber-400 font-semibold uppercase block">Date</span>
                      <p className="text-sm font-serif font-bold text-white">{ed.eventDate}</p>
                    </div>
                  )}
                  {ed.eventTime && (
                    <div className="bg-black/40 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-amber-400 font-semibold uppercase block">Time</span>
                      <p className="text-sm font-serif font-bold text-white">{ed.eventTime}</p>
                    </div>
                  )}
                </div>
                {(ed.dressCode || ed.themeName) && (
                  <div className="bg-pink-950/30 p-3.5 rounded-xl border border-pink-500/20 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-pink-400 font-semibold uppercase block">
                        {ed.themeName ? `Theme: ${ed.themeName}` : "Theme & Dress Code"}
                      </span>
                      {ed.dressCode && <p className="text-xs text-white">{ed.dressCode}</p>}
                    </div>
                  </div>
                )}
                {(ed.venueName || ed.venueAddress) && (
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1">
                    <p className="text-sm font-serif font-bold text-white">{ed.venueName}</p>
                    <p className="text-xs text-neutral-400">{ed.venueAddress}</p>
                  </div>
                )}
              </div>
            );
          }

          if (scene.type === "personal_note") {
            const pn = scene as PersonalNoteSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/20 bg-amber-950/10 p-6 sm:p-8 space-y-3">
                <h3 className="text-xl font-serif font-bold text-white text-center">{pn.title}</h3>
                <p className="font-serif italic text-sm text-neutral-200 leading-relaxed bg-black/40 p-4 rounded-xl">
                  {pn.noteText}
                </p>
                {pn.warmClosing && (
                  <p className="text-xs font-serif italic text-amber-300/80 text-right">{pn.warmClosing}</p>
                )}
              </div>
            );
          }

          if (scene.type === "name_meaning") {
            const nm = scene as NameMeaningSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/20 bg-amber-950/15 p-6 sm:p-8 space-y-3 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>The Meaning of Your Name</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">{nm.personName}</h3>
                {nm.originOrRoots && <p className="text-xs text-neutral-400 font-mono">{nm.originOrRoots}</p>}
                <p className="font-serif italic text-base text-neutral-200 bg-black/40 p-4 rounded-2xl border border-white/5">
                  &ldquo;{nm.meaningText}&rdquo;
                </p>
                {nm.culturalNote && <p className="text-[11px] text-neutral-500 italic">{nm.culturalNote}</p>}
              </div>
            );
          }

          if (scene.type === "day_arrived") {
            const da = scene as DayArrivedSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-purple-500/20 bg-purple-950/15 p-6 sm:p-8 space-y-4 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-purple-400">
                  <Sun className="w-3.5 h-3.5" />
                  <span>The Day You Arrived</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white">{da.title}</h3>
                {da.birthDate && <p className="text-xs font-mono text-neutral-400">{da.birthDate} {da.birthWeekday ? `• ${da.birthWeekday}` : ""}</p>}
                {da.photoUrl && (
                  <div className="w-full max-w-sm mx-auto h-48 rounded-2xl overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={da.photoUrl} alt="Day you arrived" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="font-serif italic text-sm text-neutral-200 leading-relaxed bg-black/40 p-4 rounded-xl">
                  &ldquo;{da.storyText}&rdquo;
                </p>
              </div>
            );
          }

          if (scene.type === "wishes") {
            const ws = scene as WishesSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-rose-500/20 bg-rose-950/15 p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-serif font-bold text-white text-center">{ws.title}</h3>
                <div className="space-y-3">
                  {ws.wishes.map((w) => (
                    <div key={w.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                      <p className="font-serif italic text-sm text-neutral-200">&ldquo;{w.message}&rdquo;</p>
                      <span className="text-xs font-bold text-rose-300 block text-right">— {w.senderName} {w.relationship ? `(${w.relationship})` : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (scene.type === "birthday_finale") {
            const bf = scene as BirthdayFinaleSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/30 bg-black/50 p-6 sm:p-8 text-center space-y-3">
                <span className="text-3xl">🎂</span>
                <h3 className="text-xl font-serif font-bold text-white">{bf.title}</h3>
                <p className="font-serif italic text-base text-amber-300">&ldquo;{bf.celebrationWish}&rdquo;</p>
              </div>
            );
          }

          if (scene.type === "godhbharai_blessings") {
            const gb = scene as GodhbharaiBlessingsSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/20 bg-amber-950/15 p-6 sm:p-8 space-y-3 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Shubh Godhbharai Blessings</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white">{gb.title}</h3>
                {gb.traditionalVerse && (
                  <p className="font-serif italic text-xs text-amber-300/80 bg-black/40 p-3 rounded-xl border border-amber-500/10">
                    &ldquo;{gb.traditionalVerse}&rdquo;
                  </p>
                )}
                <p className="font-serif italic text-sm text-neutral-200 leading-relaxed bg-black/40 p-4 rounded-xl">
                  &ldquo;{gb.blessingText}&rdquo;
                </p>
              </div>
            );
          }

          if (scene.type === "baby_reveal") {
            const br = scene as BabyRevealSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/30 bg-black/50 p-6 sm:p-8 text-center space-y-3">
                <h3 className="text-xl font-serif font-bold text-white">{br.title}</h3>
                {br.nameHint && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl inline-block text-xs font-serif text-amber-300">
                    Name Hint: {br.nameHint}
                  </div>
                )}
                {br.dueDate && (
                  <p className="text-xs text-neutral-300">Expected Arrival: {br.dueDate}</p>
                )}
                <p className="font-serif italic text-sm text-amber-300/90">&ldquo;{br.revealMessage}&rdquo;</p>
              </div>
            );
          }

          if (scene.type === "rsvp") {
            const rv = scene as RsvpSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/30 bg-black/50 p-6 sm:p-8 text-center space-y-3">
                <h3 className="text-xl font-serif font-bold text-white">{rv.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-300">{rv.savedSeatCopy}</p>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl inline-block text-xs font-serif text-amber-300">
                  Seat Reserved For: {displayRecipient}
                </div>
                {rv.showRsvpCount && (
                  <p className="text-[11px] text-neutral-400">{rv.rsvpCount || 48} guests attending so far</p>
                )}
              </div>
            );
          }

          if (scene.type === "tribute_candle") {
            const tc = scene as TributeCandleSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/25 bg-stone-900/60 p-6 sm:p-8 text-center space-y-4 shadow-xl">
                <span className="text-xs font-serif tracking-widest text-amber-300 uppercase block">Eternal Flame</span>
                {tc.photoUrl && (
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border border-amber-400/40 p-1 bg-stone-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tc.photoUrl} alt={tc.tributeName} className="w-full h-full object-cover rounded-full" />
                  </div>
                )}
                <h3 className="text-2xl font-serif font-bold text-stone-100">{tc.tributeName}</h3>
                {tc.yearsSpan && <p className="text-xs font-serif text-amber-300/80">{tc.yearsSpan}</p>}
                <p className="text-xs sm:text-sm font-serif italic text-stone-300 leading-relaxed bg-black/40 p-4 rounded-2xl">
                  &ldquo;{tc.candleMessage}&rdquo;
                </p>
                <div className="text-[11px] font-serif text-amber-200">
                  🕯️ {tc.candleLitCount || 1} candles lit in loving tribute
                </div>
              </div>
            );
          }

          if (scene.type === "what_they_taught_us") {
            const wt = scene as WhatTheyTaughtUsSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-serif font-bold text-stone-100 text-center">{wt.title}</h3>
                <div className="space-y-2 pt-2">
                  {wt.lessons?.map((lesson, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs sm:text-sm font-serif text-stone-200">
                      • {lesson}
                    </div>
                  ))}
                </div>
                {wt.closingThought && (
                  <p className="text-xs font-serif italic text-amber-200/90 text-center bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
                    &ldquo;{wt.closingThought}&rdquo;
                  </p>
                )}
              </div>
            );
          }

          if (scene.type === "tribute_wall") {
            const tw = scene as TributeWallSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6 sm:p-8 text-center space-y-3">
                <h3 className="text-xl font-serif font-bold text-stone-100">{tw.wallTitle}</h3>
                <p className="text-xs font-serif text-stone-400 italic">{tw.wallSubtitle}</p>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs font-serif text-stone-300">
                  🕊️ Pre-moderated sacred tribute wall for family &amp; friends.
                </div>
              </div>
            );
          }

          if (scene.type === "closing_prayer") {
            const cp = scene as ClosingPrayerSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/20 bg-stone-900/70 p-6 sm:p-8 text-center space-y-4">
                <span className="text-xs font-serif tracking-widest text-amber-300 uppercase block">
                  {cp.traditionTag || "Quiet Blessing"}
                </span>
                <h3 className="text-2xl font-serif font-bold text-stone-100">{cp.title}</h3>
                <p className="text-xs sm:text-sm font-serif italic text-stone-200 leading-relaxed bg-black/40 p-5 rounded-2xl whitespace-pre-line">
                  &ldquo;{cp.prayerText}&rdquo;
                </p>
              </div>
            );
          }

          if (scene.type === "devotional_blessing") {
            const db = scene as DevotionalBlessingSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/30 bg-stone-900/80 p-6 sm:p-8 text-center space-y-4">
                <span className="text-xs font-serif tracking-widest text-amber-300 uppercase block">
                  {db.verseTitle || "Sacred Scripture & Blessing"}
                </span>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <p className="text-base sm:text-lg font-serif font-medium text-stone-100 whitespace-pre-line leading-relaxed">
                    {db.sacredText}
                  </p>
                  {db.transliteration && (
                    <p className="text-xs italic text-stone-400 font-sans">{db.transliteration}</p>
                  )}
                  {db.translationOrMeaning && (
                    <p className="text-xs sm:text-sm font-serif italic text-amber-200/90 pt-2 border-t border-stone-800">
                      &ldquo;{db.translationOrMeaning}&rdquo;
                    </p>
                  )}
                  {db.sourceCitation && (
                    <p className="text-[11px] text-stone-400 font-serif italic">— {db.sourceCitation}</p>
                  )}
                </div>
              </div>
            );
          }

          if (scene.type === "devotional_significance") {
            const ds = scene as DevotionalSignificanceSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/25 bg-stone-900/80 p-6 sm:p-8 space-y-4 text-left">
                <h3 className="text-xl font-serif font-bold text-stone-100 text-center">
                  {ds.significanceTitle || "Spiritual Significance & Schedule"}
                </h3>
                <p className="text-xs sm:text-sm font-serif text-stone-200 leading-relaxed whitespace-pre-line">
                  {ds.storyText}
                </p>
                {ds.traditions && ds.traditions.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] tracking-wider uppercase font-sans font-semibold text-stone-400 block mb-1.5">
                      Order of Sacred Observances
                    </span>
                    <ul className="space-y-1">
                      {ds.traditions.map((t, idx) => (
                        <li key={idx} className="text-xs text-stone-300 font-serif flex items-start gap-1.5">
                          <span className="text-amber-400">✦</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {ds.etiquetteNote && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-serif text-amber-200">
                    <span className="font-semibold block font-sans text-[10px] uppercase text-amber-300">
                      Respectful Etiquette:
                    </span>
                    {ds.etiquetteNote}
                  </div>
                )}
                {(ds.eventDate || ds.venueName) && (
                  <div className="p-3 bg-black/40 rounded-xl text-xs text-stone-300 space-y-1 font-serif">
                    {ds.eventDate && <div>📅 {ds.eventDate} {ds.eventTime && `• ${ds.eventTime}`}</div>}
                    {ds.venueName && <div>📍 {ds.venueName} {ds.venueAddress && `(${ds.venueAddress})`}</div>}
                  </div>
                )}
              </div>
            );
          }

          if (scene.type === "devotional_finale") {
            const df = scene as DevotionalFinaleSceneConfig;
            return (
              <div key={scene.id} className="rounded-3xl border border-amber-500/30 bg-stone-900/80 p-6 sm:p-8 text-center space-y-4">
                <span className="text-3xl block">🪔</span>
                <h3 className="text-xl font-serif font-bold text-stone-100">Sacred Blessing & Dedication</h3>
                <p className="text-sm font-serif italic text-amber-200/90 leading-relaxed bg-black/40 p-4 rounded-2xl">
                  &ldquo;{df.blessingWish}&rdquo;
                </p>
              </div>
            );
          }

          return null;
        })}

        {/* Finale signoff */}
        <div className="text-center pt-8 border-t border-white/10 text-xs text-neutral-500 font-serif">
          {scenes.some((s) => s.type === "tribute_candle" || s.type === "closing_prayer")
            ? "Forever remembered • Forever cherished in our hearts"
            : "Crafted with love on Lovewrit • Preserved forever"}
        </div>
      </div>
    </div>
  );
}
