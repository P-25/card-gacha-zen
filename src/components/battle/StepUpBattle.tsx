import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Info } from "lucide-react";

interface StepUpBattleProps {
  onBack: () => void;
  onSelectMode: (mode: string) => void;
}

import { BATTLE_MODES } from "@/config/battleModes";

export default function StepUpBattle({
  onBack,
  onSelectMode,
}: StepUpBattleProps) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#Fdfbf7]">
      {/* Header */}
      <div className="relative pt-6 pb-4 px-4 text-center">
        <button
          onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-white/40 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-105 active:scale-95 transition-all z-10"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-black italic tracking-wider text-[#2D3748] uppercase">
          Step-Up Battle
        </h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 flex flex-col gap-3">
        {BATTLE_MODES.map((mode, index) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectMode(mode.id)}
            className={`relative w-full p-4 rounded-xl border-2 ${mode.borderColor} ${mode.color} shadow-sm flex items-center gap-4 text-left group overflow-hidden`}
          >
            {/* Icon */}
            <div className="w-12 h-12 shrink-0 relative flex items-center justify-center text-3xl">
              {/* Using fallback icons for now as I don't know if image assets exist */}
              <Image src={mode.icon} alt={mode.title} width={48} height={48} />
            </div>

            {/* Text */}
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-[#1A2E2E] font-black text-lg uppercase tracking-tight leading-none mb-1">
                {mode.title}
              </h3>
              <p className="text-[#4A5568] text-[0.65rem] font-bold uppercase tracking-wider opacity-70">
                {/* {mode.subtitle} */}
                Total Power Requirement: {mode.requiredPower}
              </p>
            </div>

            {/* Info Icon */}
            <div className="text-[#C5A059] opacity-50">
              <Info size={20} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
