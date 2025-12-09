"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import TopBar from "@/components/features/home/TopBar";
import { AppState } from "@/hooks/useGameState";

interface BattleScreenProps {
  onNavigate: (screen: AppState) => void;
}

export default function BattleScreen({ onNavigate }: BattleScreenProps) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/assets/background/home_bg.png')] opacity-5 bg-cover bg-center" />

      <TopBar title="BATTLE" />

      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5 pb-24 z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => console.log("Story Mode")}
          className="bg-[#F5EEDF] text-[#2D3748] rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#C5A059] active:border-b-2 active:translate-y-1 transition-all cursor-pointer relative overflow-hidden"
          style={{
            boxShadow: "0 4px 0 #C5A059, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="relative w-full h-32 mb-1 flex justify-center items-center">
            <Image
              src="/assets/icons/story.png"
              alt="Story Mode"
              fill
              className="object-contain no-global-filter"
            />
          </div>
          <h2 className="text-[#1A2E2E] font-bold text-2xl tracking-wider mb-1 uppercase">
            Story Mode
          </h2>
          <p className="text-[#4A5568] text-sm font-medium text-center leading-tight">
            Unravel the mysteries of the realm.
          </p>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => console.log("1v1 Duel")}
          className="bg-[#FAF3E5] text-[#2D3748] rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#422462] active:border-b-2 active:translate-y-1 transition-all cursor-pointer relative overflow-hidden"
          style={{
            boxShadow: "0 4px 0 #422462, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="relative w-full h-32 mb-1 flex justify-center items-center">
            <Image
              src="/assets/icons/pvp.png"
              alt="1v1 Duel"
              fill
              className="object-contain no-global-filter"
            />
          </div>
          <h2 className="text-[#1A2E2E] font-bold text-2xl tracking-wider mb-1 uppercase">
            1v1 Duel
          </h2>
          <p className="text-[#4A5568] text-sm font-medium text-center leading-tight">
            Challenge and Rewards.
          </p>
        </motion.button>
      </div>
    </div>
  );
}
