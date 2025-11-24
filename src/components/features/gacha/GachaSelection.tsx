"use client";

import { motion } from "framer-motion";

interface GachaSelectionProps {
  onSelect: (type: "gem" | "gold") => void;
}

export default function GachaSelection({ onSelect }: GachaSelectionProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6 relative">
      {/* Background Pattern (Bamboo) - handled by parent layout, but we can add subtle overlay if needed */}

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-8 font-serif tracking-widest uppercase text-center drop-shadow-lg"
      >
        Choose Your Path
      </motion.h2>

      {/* Gem Box Option */}
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect("gem")}
        className="w-full max-w-sm h-32 bg-gradient-to-r from-[#6b4c9a] to-[#4a3b7a] rounded-2xl relative overflow-hidden group shadow-xl border border-white/10"
      >
        <div className="absolute inset-0 bg-[url('/assets/pattern-dots.png')] opacity-10" />

        <div className="relative z-10 h-full flex items-center px-6 gap-4">
          {/* Icon */}
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <div className="text-5xl filter drop-shadow-lg">💎</div>
          </div>

          {/* Text */}
          <div className="flex-1 text-left flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-white font-serif tracking-wide">
              GEM BOX
            </h3>
            <p className="text-sm text-purple-200/80 font-light">
              High rarity chance
            </p>
          </div>

          {/* Price */}
          <div className="text-right flex flex-col justify-center items-end min-w-[80px]">
            <span className="block text-2xl font-bold text-white leading-none">
              100
            </span>
            <span className="text-xs text-purple-200 uppercase tracking-wider mt-1">
              GEMS
            </span>
          </div>
        </div>
      </motion.button>

      {/* Gold Box Option */}
      <motion.button
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect("gold")}
        className="w-full max-w-sm h-32 bg-gradient-to-r from-[#8b5a2b] to-[#6b4226] rounded-2xl relative overflow-hidden group shadow-xl border border-white/10"
      >
        <div className="absolute inset-0 bg-[url('/assets/pattern-dots.png')] opacity-10" />

        <div className="relative z-10 h-full flex items-center px-6 gap-4">
          {/* Icon */}
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <div className="text-5xl filter drop-shadow-lg">🪙</div>
          </div>

          {/* Text */}
          <div className="flex-1 text-left flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-white font-serif tracking-wide">
              GOLD BOX
            </h3>
            <p className="text-sm text-amber-200/80 font-light">
              Standard rewards
            </p>
          </div>

          {/* Price */}
          <div className="text-right flex flex-col justify-center items-end min-w-[80px]">
            <span className="block text-2xl font-bold text-white leading-none">
              1000
            </span>
            <span className="text-xs text-amber-200 uppercase tracking-wider mt-1">
              GOLD
            </span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
