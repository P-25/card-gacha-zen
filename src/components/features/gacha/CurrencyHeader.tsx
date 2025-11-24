"use client";

import { motion } from "framer-motion";

interface CurrencyHeaderProps {
  gold: number;
  gems: number;
}

export default function CurrencyHeader({ gold, gems }: CurrencyHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
      {/* Gems Display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
      >
        <div className="w-6 h-6 flex items-center justify-center text-lg">
          💎
        </div>
        <span className="text-white font-bold font-mono">
          {gems.toLocaleString()}
        </span>
      </motion.div>

      {/* Gold Display */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10"
      >
        <div className="w-6 h-6 flex items-center justify-center text-lg">
          🪙
        </div>
        <span className="text-white font-bold font-mono">
          {gold.toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}
