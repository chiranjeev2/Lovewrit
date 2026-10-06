"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { RsvpSceneConfig } from "@/types/scenes";
import { Armchair, CheckCircle2, XCircle, Heart, ArrowRight, Users } from "lucide-react";

interface RsvpSceneProps {
  config: RsvpSceneConfig;
  guestName?: string | null;
  recipientName?: string;
  onContinue: () => void;
  theme?: string;
}

export default function RsvpScene({
  config,
  guestName,
  recipientName,
  onContinue,
}: RsvpSceneProps) {
  const displayGuest = guestName || recipientName || "Our Honored Guest";
  const [response, setResponse] = useState<"attending" | "declined" | null>(null);
  const [partySize, setPartySize] = useState<number>(1);
  const [wishes, setWishes] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectResponse = (status: "attending" | "declined") => {
    setResponse(status);
    if (status === "attending") {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#d97706", "#f59e0b", "#f43f5e", "#ec4899", "#ffffff"],
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleConfirmRsvp = () => {
    setSubmitted(true);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[75vh] select-none text-stone-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-white/95 backdrop-blur-md border border-amber-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-rose-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Seat Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-medium tracking-wide mb-3 shadow-xs">
          <Armchair className="w-3.5 h-3.5 text-amber-600" />
          <span>Reserved Seat For You</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-1">
          {config.title || "We Saved Your Seat"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-sans mb-5 max-w-md">
          {config.savedSeatCopy || "A seat at our table and a place in our hearts is warmly reserved for you."}
        </p>

        {/* Guest Personalized Name Plaque */}
        <div className="w-full bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-300/70 rounded-2xl py-3 px-4 mb-5 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold block">
            Table &amp; Guest Reservation
          </span>
          <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl mt-0.5">
            {displayGuest}
          </h3>
        </div>

        {/* Interactive RSVP Choices */}
        {!submitted ? (
          <div className="w-full space-y-4 mb-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Joyfully Accept */}
              <button
                type="button"
                onClick={() => handleSelectResponse("attending")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  response === "attending"
                    ? "bg-amber-50 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-400/50"
                    : "bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    response === "attending" ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif font-bold text-sm block">Joyfully Accept</span>
                  <span className="text-[11px] text-stone-500">I will be there to celebrate!</span>
                </div>
              </button>

              {/* Regretfully Decline */}
              <button
                type="button"
                onClick={() => handleSelectResponse("declined")}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                  response === "declined"
                    ? "bg-rose-50 border-rose-400 text-rose-950 shadow-md ring-2 ring-rose-300/50"
                    : "bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    response === "declined" ? "bg-rose-600 text-white" : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif font-bold text-sm block">Celebrate in Spirit</span>
                  <span className="text-[11px] text-stone-500">Sending love from afar</span>
                </div>
              </button>
            </div>

            {/* If Attending: Party Size */}
            {response === "attending" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2 bg-stone-50/80 border border-stone-200/80 rounded-2xl p-3.5"
              >
                <label className="text-xs font-semibold text-stone-700 block">
                  How many guests attending?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPartySize(num)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        partySize === num
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Optional Wishes / Note */}
            {response && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                <input
                  type="text"
                  value={wishes}
                  maxLength={160}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder="Send blessings or dietary notes for the couple..."
                  className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </motion.div>
            )}

            {/* Confirm Response Button */}
            {response && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmRsvp}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                Confirm RSVP
              </motion.button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
            <h4 className="font-serif font-bold text-emerald-900 text-base">
              {response === "attending" ? "RSVP Confirmed with Joy! 🎉" : "Warm Wishes Received with Love ❤️"}
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              {response === "attending"
                ? `We have noted ${partySize} ${partySize === 1 ? "guest" : "guests"} for ${displayGuest}.`
                : "Thank you for sending your heartfelt blessings to the couple."}
            </p>
          </motion.div>
        )}

        {/* Optional RSVP Count Badge */}
        {config.showRsvpCount && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/80 text-[11px] font-sans text-stone-600 mb-5">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            <span>
              <strong>{config.rsvpCount || 48}</strong> guests attending so far
            </span>
          </div>
        )}

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 text-white font-medium text-sm shadow-md hover:shadow-amber-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
