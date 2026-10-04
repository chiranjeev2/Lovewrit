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
  EventDetailsSceneConfig,
  PersonalNoteSceneConfig,
  RsvpSceneConfig,
  NameMeaningSceneConfig,
  DayArrivedSceneConfig,
  WishesSceneConfig,
  BirthdayFinaleSceneConfig,
} from "@/types/scenes";
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
  baseUrl = "https://lovewrit.com",
  slug = "preview",
}: SceneFlowEditorProps) {
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
    const links = generateGuestLinks(baseUrl, slug, names);
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
            className="rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-[11px] font-medium text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
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
            "event_details",
            "personal_note",
            "rsvp",
            "name_meaning",
            "day_arrived",
            "wishes",
            "birthday_finale",
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
              <div className="p-3.5 flex items-center justify-between">
                {/* Left: Reorder & Scene Identity */}
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col space-y-0.5">
                    <button
                      type="button"
                      disabled={isFirstOrLast || idx <= 1}
                      onClick={() => moveScene(idx, -1)}
                      className={`p-1 rounded hover:bg-neutral-800 transition ${
                        isFirstOrLast || idx <= 1 ? "opacity-20 cursor-not-allowed" : "text-neutral-300"
                      }`}
                      title="Move up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={isFirstOrLast || idx >= scenes.length - 2}
                      onClick={() => moveScene(idx, 1)}
                      className={`p-1 rounded hover:bg-neutral-800 transition ${
                        isFirstOrLast || idx >= scenes.length - 2 ? "opacity-20 cursor-not-allowed" : "text-neutral-300"
                      }`}
                      title="Move down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-800 text-[10px] font-mono font-bold text-neutral-300">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-bold text-white">{scene.title}</h4>
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
                </div>

                {/* Right: Preview Jump, Expand & Toggle */}
                <div className="flex items-center space-x-1.5">
                  {onPreviewSceneIndex && (
                    <button
                      type="button"
                      onClick={() => onPreviewSceneIndex(idx)}
                      className="rounded-lg bg-neutral-800/80 hover:bg-neutral-700 px-2 py-1 text-[10px] font-medium text-neutral-300 transition cursor-pointer"
                      title="Jump to preview this scene"
                    >
                      👁️ Preview
                    </button>
                  )}

                  {isExpandable && (
                    <button
                      type="button"
                      onClick={() => setExpandedSceneId(isExpanded ? null : scene.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                      title="Configure scene content"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  )}

                  {!scene.required ? (
                    <button
                      type="button"
                      onClick={() => toggleScene(idx)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        scene.enabled
                          ? "text-rose-400 hover:bg-rose-500/20"
                          : "text-neutral-500 hover:bg-neutral-800"
                      }`}
                      title={scene.enabled ? "Disable this scene" : "Enable this scene"}
                    >
                      {scene.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  ) : (
                    <div className="p-1.5 text-neutral-600" title="This scene is permanent to the story">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  )}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
