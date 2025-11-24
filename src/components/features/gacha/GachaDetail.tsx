"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RateUpsModal from "./RateUpsModal";

interface GachaDetailProps {
  type: "gem" | "gold";
  onBack: () => void;
  onOpen: () => void;
}

export default function GachaDetail({
  type,
  onBack,
  onOpen,
}: GachaDetailProps) {
  const [showRates, setShowRates] = useState(false);

  const config =
    type === "gem"
      ? {
          title: "GEM BOX",
          icon: "💎",
          cost: "100 Gems",
          color: "purple",
          // Soft purple gradient for the card background
          bg: "bg-gradient-to-b from-[#9d7bb0] to-[#7b5a90]",
          buttonColor: "bg-[#a855f7]",
          glow: "shadow-[0_0_40px_rgba(168,85,247,0.4)]",
        }
      : {
          title: "GOLD BOX",
          icon: "🪙",
          cost: "1000 Gold",
          color: "amber",
          bg: "bg-gradient-to-b from-[#b08d55] to-[#8a6a3e]",
          buttonColor: "bg-[#f59e0b]",
          glow: "shadow-[0_0_40px_rgba(245,158,11,0.4)]",
        };

  return (
    <div className="w-full h-full flex flex-col relative p-6">
      <RateUpsModal
        isOpen={showRates}
        onClose={() => setShowRates(false)}
        type={type}
      />

      {/* Back Button (Top Left, Circular) */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 transition-colors border border-white/10"
        >
          ←
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Large Square Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-[320px] aspect-square rounded-[2.5rem] ${config.bg} flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-white/20`}
        >
          {/* Inner Glow/Pattern */}
          <div className="absolute inset-0 bg-[url('/assets/pattern-dots.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />

          {/* Icon */}
          <div className="relative z-10 text-9xl filter drop-shadow-xl transform hover:scale-110 transition-transform duration-500">
            {config.icon}
          </div>
        </motion.div>

        {/* Title & Rates */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-white font-serif tracking-wide drop-shadow-md">
            {config.title}
          </h2>
          <button
            onClick={() => setShowRates(true)}
            className="text-sm text-white/70 hover:text-white underline decoration-white/30 underline-offset-4 font-light tracking-wide"
          >
            View Drop Rates
          </button>
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="w-full pb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpen}
          className={`w-full py-4 rounded-2xl font-bold text-xl text-white shadow-lg relative overflow-hidden group ${config.buttonColor}`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
            Open x1{" "}
            <span className="text-base opacity-90 font-normal">
              ({config.cost})
            </span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        </motion.button>
      </div>
    </div>
  );
}
