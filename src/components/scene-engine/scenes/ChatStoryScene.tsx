"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChatStorySceneConfig } from "@/types/scenes";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ImageLightboxModal, LightboxPhoto } from "@/components/shared/ImageLightboxModal";

interface ChatStorySceneProps {
  config: ChatStorySceneConfig;
  onContinue: () => void;
  theme?: string;
}

export default function ChatStoryScene({
  config,
  onContinue,
}: ChatStorySceneProps) {
  const contactName = config.contactName || "My Favorite Person";
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);

  const chatPhotos: LightboxPhoto[] = React.useMemo(() => {
    return config.messages
      .filter((m) => Boolean(m.imageUrl && m.imageUrl.trim().length > 0))
      .map((m) => ({
        src: m.imageUrl!,
        alt: "Chat screenshot",
        caption: m.text || undefined,
      }));
  }, [config.messages]);

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/95 backdrop-blur-md border border-rose-200/80 shadow-2xl rounded-3xl p-5 sm:p-7 flex flex-col items-center relative overflow-hidden"
      >
        {/* Soft decorative background glows */}
        <div className="absolute top-0 right-10 w-40 h-40 bg-pink-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-40 h-40 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Messenger Header Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-stone-200/70 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              {contactName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
                <span>{contactName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online in my thoughts</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-400 font-sans">{config.title || "Our Talks"}</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="w-full max-h-[46vh] overflow-y-auto pr-1 space-y-3.5 mb-5">
          {config.messages.map((msg, idx) => {
            const isBuyer = msg.sender === "buyer";
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 * idx, duration: 0.3 }}
                className={`flex flex-col ${isBuyer ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs text-sm font-sans ${
                    isBuyer
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-xs"
                      : "bg-stone-100/90 text-stone-800 border border-stone-200/60 rounded-tl-xs"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Screenshot Image Attachment (strictly images, NO video) */}
                  {msg.imageUrl && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const pIdx = chatPhotos.findIndex((p) => p.src === msg.imageUrl);
                        setLightboxIndex(pIdx >= 0 ? pIdx : 0);
                        setLightboxOpen(true);
                      }}
                      title="Click to view full photo"
                      className="mt-2.5 rounded-xl overflow-hidden border border-black/10 shadow-xs max-h-48 cursor-pointer group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.imageUrl}
                        alt="Shared moment"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  {msg.timestamp && (
                    <div
                      className={`text-[10px] mt-1 font-mono text-right ${
                        isBuyer ? "text-rose-200/90" : "text-stone-400"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white font-medium text-sm shadow-md hover:shadow-rose-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {chatPhotos.length > 0 && (
        <ImageLightboxModal
          isOpen={lightboxOpen}
          photos={chatPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
