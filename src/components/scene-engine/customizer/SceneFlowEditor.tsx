"use client";

import React, { useState } from "react";
import {
  SceneConfig,
  BalloonPopSceneConfig,
  HowWeMetSceneConfig,
  PromisesSceneConfig,
  ArrowHeartSceneConfig,
  ChatStorySceneConfig,
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
import { CURATED_DEVOTIONAL_VERSES, getVersesByFaith } from "@/lib/devotional-verses";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { generateGuestLinks, GuestInviteLink } from "@/lib/guest-personalization";
import { getBaseUrl } from "@/lib/base-url";

interface SceneFlowEditorProps {
  scenes: SceneConfig[];
  onChange: (updatedScenes: SceneConfig[]) => void;
  onPreviewSceneIndex?: (index: number) => void;
  baseUrl?: string;
  slug?: string;
}

export function SceneFlowEditor({
  scenes,
  onChange,
  onPreviewSceneIndex,
  baseUrl,
  slug = "preview",
}: SceneFlowEditorProps) {
  const effectiveBaseUrl = baseUrl || getBaseUrl();
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);
  const [guestListInput, setGuestListInput] = useState<string>("");
  const [generatedGuestLinks, setGeneratedGuestLinks] = useState<GuestInviteLink[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showGuestTool, setShowGuestTool] = useState(false);

  const moveScene = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= scenes.length) return;

    // Preserve Opener at index 0 and Finale at last index
    if (scenes[index].required || scenes[targetIndex].required) return;

    const newScenes = [...scenes];
    const temp = newScenes[index];
    newScenes[index] = newScenes[targetIndex];
    newScenes[targetIndex] = temp;
    onChange(newScenes);
  };

  const toggleScene = (index: number) => {
    if (scenes[index].required) return;
    const newScenes = [...scenes];
    newScenes[index] = {
      ...newScenes[index],
      enabled: !newScenes[index].enabled,
    };
    onChange(newScenes);
  };

  const updateSceneField = (sceneIndex: number, field: string, value: unknown) => {
    const newScenes = [...scenes];
    newScenes[sceneIndex] = {
      ...newScenes[sceneIndex],
      [field]: value,
    };
    onChange(newScenes);
  };

  const updateReason = (sceneIndex: number, reasonIndex: number, text: string) => {
    const newScenes = [...scenes];
    const target = newScenes[sceneIndex] as BalloonPopSceneConfig;
    const newReasons = [...target.reasons];
    newReasons[reasonIndex] = text;
    newScenes[sceneIndex] = {
      ...target,
      reasons: newReasons,
    };
    onChange(newScenes);
  };

  const updatePromiseItem = (sceneIndex: number, itemIndex: number, text: string) => {
    const newScenes = [...scenes];
    const target = newScenes[sceneIndex] as PromisesSceneConfig;
    const newItems = [...target.items];
    newItems[itemIndex] = text;
    newScenes[sceneIndex] = {
      ...target,
      items: newItems,
    };
    onChange(newScenes);
  };

  const updateChatMessage = (sceneIndex: number, msgIndex: number, text: string) => {
    const newScenes = [...scenes];
    const target = newScenes[sceneIndex] as ChatStorySceneConfig;
    const newMessages = [...target.messages];
    newMessages[msgIndex] = {
      ...newMessages[msgIndex],
      text,
    };
    newScenes[sceneIndex] = {
      ...target,
      messages: newMessages,
    };
    onChange(newScenes);
  };

  const updateWish = (sceneIndex: number, wishIndex: number, field: "senderName" | "message" | "relationship", value: string) => {
    const newScenes = [...scenes];
    const target = newScenes[sceneIndex] as WishesSceneConfig;
    const newWishes = [...target.wishes];
    newWishes[wishIndex] = {
      ...newWishes[wishIndex],
      [field]: value,
    };
    newScenes[sceneIndex] = {
      ...target,
      wishes: newWishes,
    };
    onChange(newScenes);
  };

  const addWish = (sceneIndex: number) => {
    const newScenes = [...scenes];
    const target = newScenes[sceneIndex] as WishesSceneConfig;
    if (target.wishes.length >= 10) return;
    const newWishes = [
      ...target.wishes,
      {
        id: `wish-${Date.now()}`,
        senderName: "Loved One",
        message: "Wishing you laughter, health, and a year full of wonderful memories!",
        relationship: "Friend",
      },
    ];
    newScenes[sceneIndex] = {
      ...target,
      wishes: newWishes,
    };
    onChange(newScenes);
  };

  const removeWish = (sceneIndex: number, wishIndex: number) => {
    const newScenes = [...scenes];
    const target = newScenes[sceneIndex] as WishesSceneConfig;
    if (target.wishes.length <= 1) return;
    const newWishes = target.wishes.filter((_, idx) => idx !== wishIndex);
    newScenes[sceneIndex] = {
      ...target,
      wishes: newWishes,
    };
    onChange(newScenes);
  };

  const handleGenerateLinks = () => {
    const names = guestListInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const links = generateGuestLinks(effectiveBaseUrl, slug, names);
    setGeneratedGuestLinks(links);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
            Scene Engine • Story Flow &amp; Customization
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Personalize, reorder, or toggle each full-screen scene experienced by the recipient.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGuestTool(!showGuestTool)}
            className="rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-2.5 text-xs font-medium text-amber-300 flex items-center gap-1.5 transition cursor-pointer min-h-[44px]"
          >
            <Users className="w-4 h-4" />
            <span>Guest Link Generator</span>
          </button>
          <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300">
            {scenes.filter((s) => s.enabled).length} Active Scenes
          </span>
        </div>
      </div>

      {/* Guest Link Batch Generator Tool (Amendment 3) */}
      {showGuestTool && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Personalized Links for Your Guest List</span>
            </h4>
            <span className="text-[10px] text-neutral-400">1 link per honored guest</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Enter guest names separated by commas or new lines. Each guest will receive a customized link that displays their name on the Opener, Table Plaque &amp; RSVP!
          </p>
          <textarea
            value={guestListInput}
            onChange={(e) => setGuestListInput(e.target.value)}
            rows={2}
            placeholder="Grandpa, Aunt Priya, Uncle Rajiv, Snow..."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleGenerateLinks}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Generate Links
          </button>

          {generatedGuestLinks.length > 0 && (
            <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2 border-t border-white/10">
              {generatedGuestLinks.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-xs">
                  <span className="font-semibold text-amber-300 truncate max-w-[150px]">{item.guestName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[200px]">{item.url}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item.url)}
                      className="p-1 text-neutral-400 hover:text-white"
                      title="Copy link"
                    >
                      {copiedLink === item.url ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scenes List */}
      <div className="space-y-2.5">
        {scenes.map((scene, idx) => {
          const isFirstOrLast = idx === 0 || idx === scenes.length - 1;
          const isExpanded = expandedSceneId === scene.id;
          const isExpandable = [
            "balloon_pop",
            "how_we_met",
            "promises",
            "arrow_heart",
            "chat_story",
            "wedding_story",
            "party_theme",
            "event_details",
            "personal_note",
            "rsvp",
            "name_meaning",
            "day_arrived",
            "wishes",
            "birthday_finale",
            "godhbharai_blessings",
            "baby_reveal",
            "tribute_candle",
            "what_they_taught_us",
            "tribute_wall",
            "closing_prayer",
            "devotional_blessing",
            "devotional_significance",
            "devotional_finale",
          ].includes(scene.type);

          return (
            <div
              key={scene.id}
              className={`rounded-2xl border transition-all ${
                scene.enabled
                  ? "border-neutral-700/80 bg-neutral-950/70"
                  : "border-neutral-800/50 bg-neutral-950/30 opacity-60"
              }`}
            >
              <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                {/* Top / Left: Scene Index & Title */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800 text-[11px] font-mono font-bold text-neutral-300 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-white truncate">{scene.title}</h4>
                      {scene.required && (
                        <span className="inline-flex items-center space-x-0.5 text-[9px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          <Lock className="h-2.5 w-2.5" />
                          <span>Required</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 block capitalize">
                      Type: {scene.type.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Bottom on mobile / Right on desktop: Controls Toolbar */}
                <div className="flex items-center justify-between sm:justify-end space-x-2 pt-1 sm:pt-0 border-t border-neutral-800/60 sm:border-t-0">
                  {/* Reorder Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      disabled={isFirstOrLast || idx <= 1}
                      onClick={() => moveScene(idx, -1)}
                      className={`p-2 rounded-lg hover:bg-neutral-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isFirstOrLast || idx <= 1 ? "opacity-20 cursor-not-allowed" : "text-neutral-300"
                      }`}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isFirstOrLast || idx >= scenes.length - 2}
                      onClick={() => moveScene(idx, 1)}
                      className={`p-2 rounded-lg hover:bg-neutral-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isFirstOrLast || idx >= scenes.length - 2 ? "opacity-20 cursor-not-allowed" : "text-neutral-300"
                      }`}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Actions: Preview, Expand, Toggle */}
                  <div className="flex items-center space-x-1.5">
                    {onPreviewSceneIndex && (
                      <button
                        type="button"
                        onClick={() => onPreviewSceneIndex(idx)}
                        className="rounded-lg bg-neutral-800/80 hover:bg-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 transition cursor-pointer min-h-[44px] flex items-center justify-center"
                        title="Jump to preview this scene"
                      >
                        👁️ Preview
                      </button>
                    )}

                    {isExpandable && (
                      <button
                        type="button"
                        onClick={() => setExpandedSceneId(isExpanded ? null : scene.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Configure scene content"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}

                    {!scene.required ? (
                      <button
                        type="button"
                        onClick={() => toggleScene(idx)}
                        className={`p-2 rounded-lg transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                          scene.enabled
                            ? "text-rose-400 hover:bg-rose-500/20"
                            : "text-neutral-500 hover:bg-neutral-800"
                        }`}
                        title={scene.enabled ? "Disable this scene" : "Enable this scene"}
                      >
                        {scene.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    ) : (
                      <div className="p-2 text-neutral-600 min-h-[44px] min-w-[44px] flex items-center justify-center" title="This scene is permanent to the story">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Config: Balloon Reasons */}
              {isExpanded && scene.type === "balloon_pop" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-rose-300 block">Edit Your 5 Apology Reasons:</span>
                  <div className="space-y-2">
                    {(scene as BalloonPopSceneConfig).reasons.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-neutral-400 w-4">{rIdx + 1}.</span>
                        <input
                          type="text"
                          value={reason}
                          maxLength={180}
                          onChange={(e) => updateReason(idx, rIdx, e.target.value)}
                          placeholder={`Reason #${rIdx + 1}...`}
                          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-serif"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Config: How We Met */}
              {isExpanded && scene.type === "how_we_met" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-rose-300 block">Edit How We Met Story:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Milestone Tag</label>
                      <input
                        type="text"
                        value={(scene as HowWeMetSceneConfig).dateLabel || ""}
                        maxLength={40}
                        onChange={(e) => updateSceneField(idx, "dateLabel", e.target.value)}
                        placeholder="e.g. Our First Day"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Location Tag</label>
                      <input
                        type="text"
                        value={(scene as HowWeMetSceneConfig).location || ""}
                        maxLength={50}
                        onChange={(e) => updateSceneField(idx, "location", e.target.value)}
                        placeholder="e.g. Udaipur, Lake Pichola"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Story Text</label>
                    <textarea
                      value={(scene as HowWeMetSceneConfig).storyText}
                      maxLength={800}
                      rows={3}
                      onChange={(e) => updateSceneField(idx, "storyText", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-serif leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Wedding Story */}
              {isExpanded && scene.type === "wedding_story" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Edit Couple Story &amp; Blessing:</span>
                  <div>
                    <label className="text-[10px] text-neutral-400">Faith Tag</label>
                    <input
                      type="text"
                      value={(scene as WeddingStorySceneConfig).faithTag || ""}
                      maxLength={50}
                      onChange={(e) => updateSceneField(idx, "faithTag", e.target.value)}
                      placeholder="e.g. In Love &amp; Gratitude"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Couple Story</label>
                    <textarea
                      value={(scene as WeddingStorySceneConfig).coupleStory}
                      maxLength={800}
                      rows={3}
                      onChange={(e) => updateSceneField(idx, "coupleStory", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Devotional Verse / Blessing</label>
                    <input
                      type="text"
                      value={(scene as WeddingStorySceneConfig).verseText || ""}
                      maxLength={200}
                      onChange={(e) => updateSceneField(idx, "verseText", e.target.value)}
                      placeholder="e.g. May this union be blessed with endless laughter..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Party Theme & Dress Code */}
              {isExpanded && scene.type === "party_theme" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-pink-300 block">Party Vibe, Theme &amp; Dress Code:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Party Theme</label>
                      <input
                        type="text"
                        value={(scene as PartyThemeSceneConfig).partyTheme || ""}
                        maxLength={100}
                        onChange={(e) => updateSceneField(idx, "partyTheme", e.target.value)}
                        placeholder="e.g. Pastel Chic & High Tea Glam"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Dress Code</label>
                      <input
                        type="text"
                        value={(scene as PartyThemeSceneConfig).dressCode || ""}
                        maxLength={150}
                        onChange={(e) => updateSceneField(idx, "dressCode", e.target.value)}
                        placeholder="e.g. Pastel hues & stylish hats 👒"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Party Host Note / Vibe</label>
                    <textarea
                      rows={2}
                      value={(scene as PartyThemeSceneConfig).storyText || ""}
                      maxLength={600}
                      onChange={(e) => updateSceneField(idx, "storyText", e.target.value)}
                      placeholder="Get ready for an afternoon of fabulous bites, sparkling drinks & non-stop laughter!"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Party Highlights Checklist</label>
                    <div className="space-y-1.5">
                      {((scene as PartyThemeSceneConfig).highlights || []).map((highlight, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2">
                          <span className="text-[10px] text-pink-400 font-mono">✦</span>
                          <input
                            type="text"
                            value={highlight}
                            maxLength={150}
                            onChange={(e) => {
                              const updated = [...((scene as PartyThemeSceneConfig).highlights || [])];
                              updated[hIdx] = e.target.value;
                              updateSceneField(idx, "highlights", updated);
                            }}
                            className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = ((scene as PartyThemeSceneConfig).highlights || []).filter((_, i) => i !== hIdx);
                              updateSceneField(idx, "highlights", updated);
                            }}
                            className="p-1 rounded text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {((scene as PartyThemeSceneConfig).highlights || []).length < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...((scene as PartyThemeSceneConfig).highlights || []), "New fun activity..."];
                            updateSceneField(idx, "highlights", updated);
                          }}
                          className="text-[10px] text-pink-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Activity</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Moodboard Image URL (Optional)</label>
                    <input
                      type="url"
                      value={(scene as PartyThemeSceneConfig).photoUrl || ""}
                      maxLength={1000}
                      onChange={(e) => updateSceneField(idx, "photoUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Event Details */}
              {isExpanded && scene.type === "event_details" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Edit Dates &amp; Venue:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Event Date</label>
                      <input
                        type="text"
                        value={(scene as EventDetailsSceneConfig).eventDate || ""}
                        maxLength={50}
                        onChange={(e) => updateSceneField(idx, "eventDate", e.target.value)}
                        placeholder="Saturday, 28 November 2026"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Event Time</label>
                      <input
                        type="text"
                        value={(scene as EventDetailsSceneConfig).eventTime || ""}
                        maxLength={40}
                        onChange={(e) => updateSceneField(idx, "eventTime", e.target.value)}
                        placeholder="6:30 PM Onwards"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400">Theme (Optional)</label>
                      <input
                        type="text"
                        value={(scene as EventDetailsSceneConfig).themeName || ""}
                        maxLength={60}
                        onChange={(e) => updateSceneField(idx, "themeName", e.target.value)}
                        placeholder="e.g. High Tea Glam"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400">Dress Code (Optional)</label>
                      <input
                        type="text"
                        value={(scene as EventDetailsSceneConfig).dressCode || ""}
                        maxLength={100}
                        onChange={(e) => updateSceneField(idx, "dressCode", e.target.value)}
                        placeholder="e.g. Pastel Chic & Hats 👒"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Venue Name</label>
                    <input
                      type="text"
                      value={(scene as EventDetailsSceneConfig).venueName || ""}
                      maxLength={100}
                      onChange={(e) => updateSceneField(idx, "venueName", e.target.value)}
                      placeholder="The Grand Heritage Palace"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Venue Address</label>
                    <input
                      type="text"
                      value={(scene as EventDetailsSceneConfig).venueAddress || ""}
                      maxLength={180}
                      onChange={(e) => updateSceneField(idx, "venueAddress", e.target.value)}
                      placeholder="Lake Pichola Road, Udaipur, Rajasthan"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Personal Note */}
              {isExpanded && scene.type === "personal_note" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Personal Note from the Hearts:</span>
                  <div>
                    <label className="text-[10px] text-neutral-400">Message Text (Emotional Pull, no guilt copy)</label>
                    <textarea
                      value={(scene as PersonalNoteSceneConfig).noteText}
                      maxLength={600}
                      rows={3}
                      onChange={(e) => updateSceneField(idx, "noteText", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Warm Closing</label>
                    <input
                      type="text"
                      value={(scene as PersonalNoteSceneConfig).warmClosing || ""}
                      maxLength={80}
                      onChange={(e) => updateSceneField(idx, "warmClosing", e.target.value)}
                      placeholder="With love, The Couple &amp; Families"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: RSVP */}
              {isExpanded && scene.type === "rsvp" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">RSVP Settings:</span>
                  <div>
                    <label className="text-[10px] text-neutral-400">Saved Seat Message</label>
                    <input
                      type="text"
                      value={(scene as RsvpSceneConfig).savedSeatCopy}
                      maxLength={180}
                      onChange={(e) => updateSceneField(idx, "savedSeatCopy", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id={`show-rsvp-count-${idx}`}
                      checked={Boolean((scene as RsvpSceneConfig).showRsvpCount)}
                      onChange={(e) => updateSceneField(idx, "showRsvpCount", e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-950 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor={`show-rsvp-count-${idx}`} className="text-xs text-neutral-300 cursor-pointer">
                      Optionally show total RSVP count badge
                    </label>
                  </div>
                </div>
              )}

              {/* Collapsible Config: Promises */}
              {isExpanded && scene.type === "promises" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-rose-300 block">Edit Your Promises to Each Other:</span>
                  <div className="space-y-2">
                    {(scene as PromisesSceneConfig).items.map((item, pIdx) => (
                      <div key={pIdx} className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-neutral-400 w-4">{pIdx + 1}.</span>
                        <input
                          type="text"
                          value={item}
                          maxLength={180}
                          onChange={(e) => updatePromiseItem(idx, pIdx, e.target.value)}
                          placeholder={`Promise #${pIdx + 1}...`}
                          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-serif"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Config: Chat Messages */}
              {isExpanded && scene.type === "chat_story" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-rose-300 block">Edit Chat Story Messages:</span>
                  <div className="space-y-2">
                    {(scene as ChatStorySceneConfig).messages.map((msg, mIdx) => (
                      <div key={mIdx} className="flex items-start space-x-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 mt-1">
                          {msg.sender === "buyer" ? "You" : "Them"}
                        </span>
                        <input
                          type="text"
                          value={msg.text}
                          maxLength={250}
                          onChange={(e) => updateChatMessage(idx, mIdx, e.target.value)}
                          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Config: Arrow Heart */}
              {isExpanded && scene.type === "arrow_heart" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-rose-300 block">Cupid&apos;s Arrow &amp; Proposal Settings:</span>
                  <div>
                    <label className="text-[10px] text-neutral-400">Burst Message</label>
                    <input
                      type="text"
                      value={(scene as ArrowHeartSceneConfig).burstMessage || ""}
                      maxLength={100}
                      onChange={(e) => updateSceneField(idx, "burstMessage", e.target.value)}
                      placeholder="e.g. You have my whole heart forever ❤️"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  {(scene as ArrowHeartSceneConfig).isProposal && (
                    <div>
                      <label className="text-[10px] text-neutral-400">Proposal Question</label>
                      <input
                        type="text"
                        value={(scene as ArrowHeartSceneConfig).questionText || ""}
                        maxLength={120}
                        onChange={(e) => updateSceneField(idx, "questionText", e.target.value)}
                        placeholder="Will you marry me?"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Collapsible Config: Name Meaning */}
              {isExpanded && scene.type === "name_meaning" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Edit Name Meaning:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Person Name</label>
                      <input
                        type="text"
                        value={(scene as NameMeaningSceneConfig).personName || ""}
                        maxLength={50}
                        onChange={(e) => updateSceneField(idx, "personName", e.target.value)}
                        placeholder="e.g. Riya"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Origin / Cultural Roots</label>
                      <input
                        type="text"
                        value={(scene as NameMeaningSceneConfig).originOrRoots || ""}
                        maxLength={60}
                        onChange={(e) => updateSceneField(idx, "originOrRoots", e.target.value)}
                        placeholder="e.g. Sanskrit & Classical Origins"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Meaning &amp; Significance</label>
                    <textarea
                      rows={3}
                      value={(scene as NameMeaningSceneConfig).meaningText || ""}
                      maxLength={500}
                      onChange={(e) => updateSceneField(idx, "meaningText", e.target.value)}
                      placeholder="Write what their name means and symbolizes..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 italic">
                    ℹ️ Note: Lovewrit clearly indicates meanings vary across traditions; chosen with love.
                  </p>
                </div>
              )}

              {/* Collapsible Config: Day Arrived */}
              {isExpanded && scene.type === "day_arrived" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-purple-300 block">Edit The Day You Arrived:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Birth Date (auto-calculates facts)</label>
                      <input
                        type="date"
                        value={(scene as DayArrivedSceneConfig).birthDate || ""}
                        onChange={(e) => updateSceneField(idx, "birthDate", e.target.value)}
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Birth City / Location</label>
                      <input
                        type="text"
                        value={(scene as DayArrivedSceneConfig).birthCity || ""}
                        maxLength={60}
                        onChange={(e) => updateSceneField(idx, "birthCity", e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Story &amp; Memories of That Day</label>
                    <textarea
                      rows={3}
                      value={(scene as DayArrivedSceneConfig).storyText || ""}
                      maxLength={600}
                      onChange={(e) => updateSceneField(idx, "storyText", e.target.value)}
                      placeholder="Share the story of the day they came into this world..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Childhood Photo URL (Optional)</label>
                    <input
                      type="url"
                      value={(scene as DayArrivedSceneConfig).photoUrl || ""}
                      maxLength={500}
                      onChange={(e) => updateSceneField(idx, "photoUrl", e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Wishes */}
              {isExpanded && scene.type === "wishes" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-300 block">Wishes From Loved Ones:</span>
                    <button
                      type="button"
                      onClick={() => addWish(idx)}
                      disabled={(scene as WishesSceneConfig).wishes.length >= 10}
                      className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Wish</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(scene as WishesSceneConfig).wishes.map((wish, wIdx) => (
                      <div key={wish.id || wIdx} className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={wish.senderName}
                            maxLength={50}
                            onChange={(e) => updateWish(idx, wIdx, "senderName", e.target.value)}
                            placeholder="Sender Name (e.g. Grandma, Rohit)"
                            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                          <input
                            type="text"
                            value={wish.relationship || ""}
                            maxLength={40}
                            onChange={(e) => updateWish(idx, wIdx, "relationship", e.target.value)}
                            placeholder="Relation (e.g. Sister, Friend)"
                            className="w-32 rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                          {(scene as WishesSceneConfig).wishes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWish(idx, wIdx)}
                              className="p-1 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                              title="Delete wish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={wish.message}
                          maxLength={300}
                          onChange={(e) => updateWish(idx, wIdx, "message", e.target.value)}
                          placeholder="Heartfelt birthday wish..."
                          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-serif"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Config: Birthday Finale */}
              {isExpanded && scene.type === "birthday_finale" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Birthday Finale Interaction:</span>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Interaction Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateSceneField(idx, "finaleType", "candle_blow")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          (scene as BirthdayFinaleSceneConfig).finaleType === "candle_blow"
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                        }`}
                      >
                        <span>🎂</span>
                        <span>Candle Blow</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSceneField(idx, "finaleType", "balloon_release")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          (scene as BirthdayFinaleSceneConfig).finaleType === "balloon_release"
                            ? "bg-pink-500/20 border-pink-500 text-pink-300"
                            : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                        }`}
                      >
                        <span>🎈</span>
                        <span>Balloon Release</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Celebration Wish</label>
                    <textarea
                      rows={2}
                      value={(scene as BirthdayFinaleSceneConfig).celebrationWish || ""}
                      maxLength={250}
                      onChange={(e) => updateSceneField(idx, "celebrationWish", e.target.value)}
                      placeholder="e.g. Happy Birthday! May your year be filled with wonder and joy ✨"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Message After Candle Blown / Balloons Released</label>
                    <input
                      type="text"
                      value={(scene as BirthdayFinaleSceneConfig).candleBlownMessage || ""}
                      maxLength={150}
                      onChange={(e) => updateSceneField(idx, "candleBlownMessage", e.target.value)}
                      placeholder="e.g. Make a wish — may all your dreams come true! 🎂🎈"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Godhbharai Blessings */}
              {isExpanded && scene.type === "godhbharai_blessings" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Edit Godhbharai Blessings:</span>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Traditional Sanskrit/Sacred Verse</label>
                    <input
                      type="text"
                      value={(scene as GodhbharaiBlessingsSceneConfig).traditionalVerse || ""}
                      maxLength={250}
                      onChange={(e) => updateSceneField(idx, "traditionalVerse", e.target.value)}
                      placeholder="e.g. ॐ सर्वे भवन्तु सुखिनः..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Blessing &amp; Ashirwad Message</label>
                    <textarea
                      rows={3}
                      value={(scene as GodhbharaiBlessingsSceneConfig).blessingText || ""}
                      maxLength={600}
                      onChange={(e) => updateSceneField(idx, "blessingText", e.target.value)}
                      placeholder="Heartfelt prayers and blessings for the mother and child..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Baby Reveal */}
              {isExpanded && scene.type === "baby_reveal" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Baby Reveal (Name Hint &amp; Due Date):</span>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Reveal Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateSceneField(idx, "revealType", "scratch_card")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          (scene as BabyRevealSceneConfig).revealType === "scratch_card"
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                        }`}
                      >
                        <span>✨</span>
                        <span>Scratch Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSceneField(idx, "revealType", "due_date_countdown")}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          (scene as BabyRevealSceneConfig).revealType === "due_date_countdown"
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
                        }`}
                      >
                        <span>📅</span>
                        <span>Countdown</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Name Hint / Initials</label>
                      <input
                        type="text"
                        value={(scene as BabyRevealSceneConfig).nameHint || ""}
                        maxLength={100}
                        onChange={(e) => updateSceneField(idx, "nameHint", e.target.value)}
                        placeholder="e.g. Starts with 'A'..."
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Expected Due Date</label>
                      <input
                        type="text"
                        value={(scene as BabyRevealSceneConfig).dueDate || ""}
                        maxLength={50}
                        onChange={(e) => updateSceneField(idx, "dueDate", e.target.value)}
                        placeholder="e.g. Autumn 2026"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Celebratory Message</label>
                    <textarea
                      rows={2}
                      value={(scene as BabyRevealSceneConfig).revealMessage || ""}
                      maxLength={250}
                      onChange={(e) => updateSceneField(idx, "revealMessage", e.target.value)}
                      placeholder="e.g. A tiny miracle is on the way to fill our lives with boundless joy ✨"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-2.5 text-[10px] text-amber-300/80">
                    ⚖️ Strict Legal Compliance: Under India&apos;s PCPNDT Act, sex determination/reveal is strictly prohibited. Lovewrit only permits name clues and due-date countdowns.
                  </div>
                </div>
              )}

              {/* Collapsible Config: Tribute Candle */}
              {isExpanded && scene.type === "tribute_candle" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Sacred Flame &amp; Memorial Candle:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Tribute Name</label>
                      <input
                        type="text"
                        value={(scene as TributeCandleSceneConfig).tributeName || ""}
                        maxLength={100}
                        onChange={(e) => updateSceneField(idx, "tributeName", e.target.value)}
                        placeholder="Honored Person's Name"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Years Span (Optional)</label>
                      <input
                        type="text"
                        value={(scene as TributeCandleSceneConfig).yearsSpan || ""}
                        maxLength={50}
                        onChange={(e) => updateSceneField(idx, "yearsSpan", e.target.value)}
                        placeholder="e.g. 1948 – 2024"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Memorial Message</label>
                    <textarea
                      rows={2}
                      value={(scene as TributeCandleSceneConfig).candleMessage || ""}
                      maxLength={300}
                      onChange={(e) => updateSceneField(idx, "candleMessage", e.target.value)}
                      placeholder="In loving memory, an eternal flame burns warmly in our hearts..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Photo URL (Optional)</label>
                    <input
                      type="url"
                      value={(scene as TributeCandleSceneConfig).photoUrl || ""}
                      maxLength={1000}
                      onChange={(e) => updateSceneField(idx, "photoUrl", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: What They Taught Us */}
              {isExpanded && scene.type === "what_they_taught_us" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Values &amp; Life Lessons:</span>
                  <div className="space-y-2">
                    {((scene as WhatTheyTaughtUsSceneConfig).lessons || []).map((lesson, lessonIdx) => (
                      <div key={lessonIdx} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-500 w-4">{lessonIdx + 1}.</span>
                        <input
                          type="text"
                          value={lesson}
                          maxLength={300}
                          onChange={(e) => {
                            const updated = [...((scene as WhatTheyTaughtUsSceneConfig).lessons || [])];
                            updated[lessonIdx] = e.target.value;
                            updateSceneField(idx, "lessons", updated);
                          }}
                          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = ((scene as WhatTheyTaughtUsSceneConfig).lessons || []).filter((_, i) => i !== lessonIdx);
                            updateSceneField(idx, "lessons", updated);
                          }}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {((scene as WhatTheyTaughtUsSceneConfig).lessons || []).length < 8 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...((scene as WhatTheyTaughtUsSceneConfig).lessons || []), "New life lesson..."];
                          updateSceneField(idx, "lessons", updated);
                        }}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Lesson</span>
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Closing Thought</label>
                    <input
                      type="text"
                      value={(scene as WhatTheyTaughtUsSceneConfig).closingThought || ""}
                      maxLength={400}
                      onChange={(e) => updateSceneField(idx, "closingThought", e.target.value)}
                      placeholder="These timeless lessons live on in every choice we make..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Tribute Wall */}
              {isExpanded && scene.type === "tribute_wall" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">Pre-Moderated Tribute Wall:</span>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Wall Title</label>
                    <input
                      type="text"
                      value={(scene as TributeWallSceneConfig).wallTitle || ""}
                      maxLength={100}
                      onChange={(e) => updateSceneField(idx, "wallTitle", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Wall Subtitle</label>
                    <input
                      type="text"
                      value={(scene as TributeWallSceneConfig).wallSubtitle || ""}
                      maxLength={250}
                      onChange={(e) => updateSceneField(idx, "wallSubtitle", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[10px] text-stone-400 font-serif">
                    🛡️ Pre-moderation active: All condolence messages require family approval before appearing publicly.
                  </div>
                </div>
              )}

              {/* Collapsible Config: Closing Prayer */}
              {isExpanded && scene.type === "closing_prayer" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 block">Closing Prayer &amp; Blessing:</span>
                    <span className="text-[10px] text-neutral-400 font-serif italic">Faith-neutral default</span>
                  </div>

                  {/* Faith-neutral & Faith Presets */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-neutral-400 block">Quick Blessing Presets (Editable):</label>
                      <span className="text-[9px] text-amber-400 font-medium">Faith closings require review by member of that faith</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scenes];
                          updated[idx] = {
                            ...updated[idx],
                            title: "Forever in Our Hearts",
                            traditionTag: "Forever in Our Hearts",
                            prayerText: "Though parted from our sight, your gentle wisdom, warmth, and love remain forever in our hearts.\nMay your journey be wrapped in peace, serenity, and boundless grace.",
                          } as SceneConfig;
                          onChange(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-200 border border-neutral-700 font-serif transition min-h-[44px] flex items-center justify-center"
                      >
                        🕊️ Faith-Neutral
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scenes];
                          updated[idx] = {
                            ...updated[idx],
                            title: "Om Shanti • ॐ शान्तिः",
                            traditionTag: "Om Shanti • Sacred Peace (Review by member of faith)",
                            prayerText: "ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।\nMay their noble Atman attain Moksha and dwell in eternal divine peace. Om Shanti Shanti Shanti.",
                          } as SceneConfig;
                          onChange(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-200 border border-neutral-700 font-serif transition min-h-[44px] flex items-center justify-center"
                        title="Hindu • Review by member of that faith"
                      >
                        🕉️ Om Shanti (Review by faith)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scenes];
                          updated[idx] = {
                            ...updated[idx],
                            title: "Waheguru",
                            traditionTag: "Waheguru (Review by member of faith)",
                            prayerText: "Waheguru",
                          } as SceneConfig;
                          onChange(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-200 border border-neutral-700 font-serif transition min-h-[44px] flex items-center justify-center"
                        title="Sikh (Neutral Waheguru) • Review by member of that faith"
                      >
                        ੴ Waheguru (Review by faith)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scenes];
                          updated[idx] = {
                            ...updated[idx],
                            title: "Inna Lillahi wa Inna Ilayhi Raji'un",
                            traditionTag: "Inna Lillahi wa Inna Ilayhi Raji'un (Review by member of faith)",
                            prayerText: "Surely to Allah we belong, and to Him we shall return.\nMay Allah grant them forgiveness, elevate their ranks in Jannat al-Firdaus, and bestow patience (Sabr) upon their family.",
                          } as SceneConfig;
                          onChange(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-200 border border-neutral-700 font-serif transition min-h-[44px] flex items-center justify-center"
                        title="Muslim • Review by member of that faith"
                      >
                        🌙 Inna Lillahi (Review by faith)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scenes];
                          updated[idx] = {
                            ...updated[idx],
                            title: "Rest in Peace & Grace",
                            traditionTag: "Rest in Eternal Peace (Review by member of faith)",
                            prayerText: "May the Lord bless and keep them in His loving care.\nRest in eternal peace, reunited with the saints in light and heavenly grace.",
                          } as SceneConfig;
                          onChange(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-200 border border-neutral-700 font-serif transition min-h-[44px] flex items-center justify-center"
                        title="Christian • Review by member of that faith"
                      >
                        ✝️ Rest in Peace (Review by faith)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scenes];
                          updated[idx] = {
                            ...updated[idx],
                            title: "Michhami Dukkadam • Universal Harmony",
                            traditionTag: "Michhami Dukkadam (Review by member of faith)",
                            prayerText: "खामेमि सव्व जीवे, सव्वे जीवा खमंतु मे। मित्ती मे सव्व भूएसु, वेरं मज्झं न केणइ॥\nMay all beings forgive, and may peace and equanimity prevail.",
                          } as SceneConfig;
                          onChange(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-200 border border-neutral-700 font-serif transition min-h-[44px] flex items-center justify-center"
                        title="Jain • Review by member of that faith"
                      >
                        ☸️ Michhami Dukkadam (Review by faith)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scenes];
                          updated[idx] = {
                            ...updated[idx],
                            title: "Personal Blessing",
                            traditionTag: "Personal Blessing",
                            prayerText: "",
                          } as SceneConfig;
                          onChange(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-200 border border-neutral-700 font-serif transition min-h-[44px] flex items-center justify-center"
                        title="Write your own custom blessing"
                      >
                        ✍️ Custom Blessing
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Tradition / Blessing Tag</label>
                    <input
                      type="text"
                      value={(scene as ClosingPrayerSceneConfig).traditionTag || ""}
                      maxLength={80}
                      onChange={(e) => updateSceneField(idx, "traditionTag", e.target.value)}
                      placeholder="e.g. Forever in Our Hearts"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Prayer / Blessing Text</label>
                    <textarea
                      rows={3}
                      value={(scene as ClosingPrayerSceneConfig).prayerText || ""}
                      maxLength={800}
                      onChange={(e) => updateSceneField(idx, "prayerText", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Devotional Blessing */}
              {isExpanded && scene.type === "devotional_blessing" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 block">Sacred Verse &amp; Benediction:</span>
                    <span className="text-[10px] text-neutral-400 font-serif italic">Curated &amp; Editable</span>
                  </div>

                  {/* Scholar Review Guidance Callout */}
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200/90 font-serif space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <span>⚠️ Note on Sacred Scripture</span>
                    </div>
                    <p>
                      Please review this text with a family elder or religious scholar before sharing. All verses are editable to honor your personal family traditions.
                    </p>
                  </div>

                  {/* Curated Verse Picker */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <label className="text-[10px] text-amber-300 font-semibold block">
                      Choose Authentic Scripture or Write Your Own
                    </label>
                    <select
                      className="w-full rounded-lg border border-amber-500/30 bg-neutral-900 px-2 py-1.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-serif"
                      defaultValue=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom_blank") {
                          const updated = [...scenes];
                          const currentDevScene = updated[idx] as DevotionalBlessingSceneConfig;
                          updated[idx] = {
                            ...currentDevScene,
                            type: "devotional_blessing",
                            verseTitle: "Personal Family Blessing",
                            sourceCitation: "Family Tradition & Personal Prayer",
                            sacredText: "",
                            transliteration: "",
                            translationOrMeaning: "",
                          } as SceneConfig;
                          onChange(updated);
                          return;
                        }

                        const chosen = CURATED_DEVOTIONAL_VERSES.find((v) => v.id === val);
                        if (chosen) {
                          const updated = [...scenes];
                          const currentDevScene = updated[idx] as DevotionalBlessingSceneConfig;
                          updated[idx] = {
                            ...currentDevScene,
                            type: "devotional_blessing",
                            faith: chosen.faith,
                            verseTitle: chosen.title,
                            sourceCitation: chosen.source,
                            sacredText: chosen.scriptureText,
                            transliteration: chosen.transliteration || "",
                            translationOrMeaning: chosen.meaning,
                          } as SceneConfig;
                          onChange(updated);
                        }
                      }}
                    >
                      <option value="" disabled>
                        -- Select Curated Verse (or edit below) --
                      </option>
                      <option value="custom_blank">
                        ✍️ [CUSTOM] Write Your Own Blessing / Prayer
                      </option>
                      {CURATED_DEVOTIONAL_VERSES.map((v) => (
                        <option key={v.id} value={v.id}>
                          [{v.faith.toUpperCase()}] {v.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] text-amber-200/80 font-serif italic">
                      Zero invented scripture. Authentic sacred texts with book/chapter citations.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Faith / Tradition</label>
                    <select
                      value={(scene as DevotionalBlessingSceneConfig).faith || "general"}
                      onChange={(e) => updateSceneField(idx, "faith", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    >
                      <option value="hindu">Hindu (Sanatana Dharma • ॐ)</option>
                      <option value="sikh">Sikh (Gurmat • ੴ)</option>
                      <option value="muslim">Muslim (Islamic • 🌙)</option>
                      <option value="christian">Christian (Holy Scripture • 🕊️)</option>
                      <option value="secular">Secular / Non-Religious (Universal • ✨)</option>
                      <option value="general">General Sacred (🕊️)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Verse Title / Heading</label>
                    <input
                      type="text"
                      value={(scene as DevotionalBlessingSceneConfig).verseTitle || ""}
                      maxLength={120}
                      onChange={(e) => updateSceneField(idx, "verseTitle", e.target.value)}
                      placeholder="e.g. Rigveda • Gayatri Mantra"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Scriptural Source / Citation</label>
                    <input
                      type="text"
                      value={(scene as DevotionalBlessingSceneConfig).sourceCitation || ""}
                      maxLength={150}
                      onChange={(e) => updateSceneField(idx, "sourceCitation", e.target.value)}
                      placeholder="e.g. Brihadaranyaka Upanishad (1.4.14)"
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Sacred Scripture Text</label>
                    <textarea
                      rows={3}
                      value={(scene as DevotionalBlessingSceneConfig).sacredText || ""}
                      maxLength={800}
                      onChange={(e) => updateSceneField(idx, "sacredText", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Transliteration (Optional)</label>
                    <textarea
                      rows={2}
                      value={(scene as DevotionalBlessingSceneConfig).transliteration || ""}
                      maxLength={600}
                      onChange={(e) => updateSceneField(idx, "transliteration", e.target.value)}
                      placeholder="Romanized pronunciation..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans italic"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Translation &amp; Sacred Meaning</label>
                    <textarea
                      rows={3}
                      value={(scene as DevotionalBlessingSceneConfig).translationOrMeaning || ""}
                      maxLength={800}
                      onChange={(e) => updateSceneField(idx, "translationOrMeaning", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Devotional Significance */}
              {isExpanded && scene.type === "devotional_significance" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    Spiritual Significance &amp; Schedule:
                  </span>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Significance Title</label>
                    <input
                      type="text"
                      value={(scene as DevotionalSignificanceSceneConfig).significanceTitle || ""}
                      maxLength={120}
                      onChange={(e) => updateSceneField(idx, "significanceTitle", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Occasion Story &amp; Meaning</label>
                    <textarea
                      rows={3}
                      value={(scene as DevotionalSignificanceSceneConfig).storyText || ""}
                      maxLength={1000}
                      onChange={(e) => updateSceneField(idx, "storyText", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>

                  {/* Traditions Checklist */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-neutral-400 block">Traditions &amp; Rituals Observed</label>
                    {((scene as DevotionalSignificanceSceneConfig).traditions || []).map((t, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={t}
                          maxLength={200}
                          onChange={(e) => {
                            const updatedTraditions = [...((scene as DevotionalSignificanceSceneConfig).traditions || [])];
                            updatedTraditions[tIdx] = e.target.value;
                            updateSceneField(idx, "traditions", updatedTraditions);
                          }}
                          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedTraditions = ((scene as DevotionalSignificanceSceneConfig).traditions || []).filter((_, i) => i !== tIdx);
                            updateSceneField(idx, "traditions", updatedTraditions);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                          title="Remove tradition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {((scene as DevotionalSignificanceSceneConfig).traditions || []).length < 6 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTraditions = [...((scene as DevotionalSignificanceSceneConfig).traditions || []), "New sacred ritual / tradition"];
                          updateSceneField(idx, "traditions", updatedTraditions);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-amber-400 hover:text-amber-300 font-serif"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Tradition</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Respectful Etiquette Note (Head covering, footwear, attire)
                    </label>
                    <input
                      type="text"
                      value={(scene as DevotionalSignificanceSceneConfig).etiquetteNote || ""}
                      maxLength={250}
                      onChange={(e) => updateSceneField(idx, "etiquetteNote", e.target.value)}
                      placeholder="e.g. Kindly cover your head and remove footwear before entering the Darbar Hall."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Date</label>
                      <input
                        type="text"
                        value={(scene as DevotionalSignificanceSceneConfig).eventDate || ""}
                        maxLength={60}
                        onChange={(e) => updateSceneField(idx, "eventDate", e.target.value)}
                        placeholder="e.g. Saturday, 24 October 2026"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Time</label>
                      <input
                        type="text"
                        value={(scene as DevotionalSignificanceSceneConfig).eventTime || ""}
                        maxLength={60}
                        onChange={(e) => updateSceneField(idx, "eventTime", e.target.value)}
                        placeholder="e.g. 7:30 PM Onwards"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Venue Name</label>
                      <input
                        type="text"
                        value={(scene as DevotionalSignificanceSceneConfig).venueName || ""}
                        maxLength={150}
                        onChange={(e) => updateSceneField(idx, "venueName", e.target.value)}
                        placeholder="e.g. Mandir / Gurdwara / Hall"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Address</label>
                      <input
                        type="text"
                        value={(scene as DevotionalSignificanceSceneConfig).venueAddress || ""}
                        maxLength={300}
                        onChange={(e) => updateSceneField(idx, "venueAddress", e.target.value)}
                        placeholder="e.g. Model Town Road"
                        className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Google Maps Link</label>
                    <input
                      type="url"
                      value={(scene as DevotionalSignificanceSceneConfig).venueMapUrl || ""}
                      maxLength={1000}
                      onChange={(e) => updateSceneField(idx, "venueMapUrl", e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Collapsible Config: Devotional Finale */}
              {isExpanded && scene.type === "devotional_finale" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    Devotional Finale &amp; Ritual Offering:
                  </span>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Ritual Offering Type</label>
                    <select
                      value={(scene as DevotionalFinaleSceneConfig).ritualType || "diya_aarti"}
                      onChange={(e) => updateSceneField(idx, "ritualType", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    >
                      <option value="diya_aarti">Hindu: Maha Aarti &amp; Diya Flame 🪔</option>
                      <option value="flower_offering">Pushpanjali • Floral Petal Offering 🌸</option>
                      <option value="shabad_ardas">Sikh: Shabad &amp; Ardas Supplication ੴ</option>
                      <option value="dua_blessing">Muslim: Dua Supplication &amp; Barakah 🌙</option>
                      <option value="choral_benediction">Christian: Choral Benediction &amp; Peace Candle 🕊️</option>
                      <option value="gratitude_reflection">Secular: Universal Reflection of Gratitude ✨</option>
                      <option value="peace_candle">Universal: Sacred Flame of Peace 🕯️</option>
                      <option value="sacred_prayer">Universal: Heartfelt Sacred Prayer 🕊️</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Closing Blessing Wish</label>
                    <textarea
                      rows={3}
                      value={(scene as DevotionalFinaleSceneConfig).blessingWish || ""}
                      maxLength={300}
                      onChange={(e) => updateSceneField(idx, "blessingWish", e.target.value)}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-serif"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
