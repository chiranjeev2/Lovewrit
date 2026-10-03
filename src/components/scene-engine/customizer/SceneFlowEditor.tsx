"use client";

import React, { useState } from "react";
import {
  SceneConfig,
  BalloonPopSceneConfig,
  HowWeMetSceneConfig,
  PromisesSceneConfig,
  ArrowHeartSceneConfig,
  ChatStorySceneConfig,
} from "@/types/scenes";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SceneFlowEditorProps {
  scenes: SceneConfig[];
  onChange: (updatedScenes: SceneConfig[]) => void;
  onPreviewSceneIndex?: (index: number) => void;
}

export function SceneFlowEditor({
  scenes,
  onChange,
  onPreviewSceneIndex,
}: SceneFlowEditorProps) {
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);

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
        <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300">
          {scenes.filter((s) => s.enabled).length} Active Scenes
        </span>
      </div>

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
                  {/* Up / Down Reorder */}
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

                  {/* Scene Number & Type Icon */}
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
                  {/* Preview this scene button */}
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

                  {/* Expand scene form fields if customizable */}
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

                  {/* Enable / Disable switch */}
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
                  <span className="text-[11px] font-bold text-rose-300 block">
                    Edit Your 5 Apology Reasons:
                  </span>
                  <div className="space-y-2">
                    {(scene as BalloonPopSceneConfig).reasons.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-neutral-400 w-4">
                          {rIdx + 1}.
                        </span>
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
                  <span className="text-[11px] font-bold text-rose-300 block">
                    Edit How We Met Story:
                  </span>
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

              {/* Collapsible Config: Promises */}
              {isExpanded && scene.type === "promises" && (
                <div className="border-t border-neutral-800/80 p-4 bg-black/40 space-y-3">
                  <span className="text-[11px] font-bold text-rose-300 block">
                    Edit Your Promises to Each Other:
                  </span>
                  <div className="space-y-2">
                    {(scene as PromisesSceneConfig).items.map((item, pIdx) => (
                      <div key={pIdx} className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-neutral-400 w-4">
                          {pIdx + 1}.
                        </span>
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
                  <span className="text-[11px] font-bold text-rose-300 block">
                    Edit Chat Story Messages:
                  </span>
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
                  <span className="text-[11px] font-bold text-rose-300 block">
                    Cupid&apos;s Arrow &amp; Proposal Settings:
                  </span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
