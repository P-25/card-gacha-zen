"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import TopBar from "@/components/features/home/TopBar";
import { AppState } from "@/hooks/useGameState";
import BattleFlow from "./battle/BattleFlow";
import StepUpBattle from "./battle/StepUpBattle";

interface BattleScreenProps {
  onNavigate: (screen: AppState) => void;
  setBattleNavVisible: (visible: boolean) => void;
}

export default function BattleScreen({
  onNavigate,
  setBattleNavVisible,
}: BattleScreenProps) {
  const [mode, setMode] = useState<"MENU" | "1V1" | "STEP_UP">("MENU");
  const [returnLocation, setReturnLocation] = useState<"MENU" | "STEP_UP">(
    "MENU",
  );
  const [selectedBattleModeId, setSelectedBattleModeId] = useState<
    string | null
  >(null);

  if (mode === "1V1") {
    return (
      <BattleFlow
        onNavigate={onNavigate}
        onBack={() => {
          setMode(returnLocation);
          setBattleNavVisible(true);
        }}
        setBattleNavVisible={setBattleNavVisible}
        selectedBattleModeId={selectedBattleModeId}
      />
    );
  }

  if (mode === "STEP_UP") {
    return (
      <StepUpBattle
        onBack={() => {
          setMode("MENU");
          setBattleNavVisible(true);
        }}
        onSelectMode={(modeId) => {
          console.log("Selected mode:", modeId);
          setSelectedBattleModeId(modeId);
          setReturnLocation("STEP_UP");
          setMode("1V1");
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
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
              src="/assets/icons/story.webp"
              alt="Story Mode"
              fill
              className="object-contain no-global-filter"
            />
          </div>
          <h2 className="text-[#1A2E2E] font-bold text-2xl tracking-wider mb-1 uppercase">
            Story Mode
          </h2>
          <p className="text-[#4A5568] text-sm font-medium text-center leading-tight">
            Unveil the masked realm's secrets.
          </p>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode("STEP_UP")}
          className="bg-[#F7F5E9] text-[#2D3748] rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#907D93] active:border-b-2 active:translate-y-1 transition-all cursor-pointer relative overflow-hidden"
          style={{
            boxShadow: "0 4px 0 #907D93, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="relative w-full h-32 mb-1 flex justify-center items-center">
            <Image
              src="/assets/icons/stepup-new.webp"
              alt="step-up Battle"
              fill
              className="object-contain no-global-filter"
            />
          </div>
          <h2 className="text-[#1A2E2E] font-bold text-2xl tracking-wider mb-1 uppercase">
            Step-Up Battle
          </h2>
          <p className="text-[#4A5568] text-sm font-medium text-center leading-tight">
            Ascend through elite Battle Tiers.
          </p>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setReturnLocation("MENU");
            setSelectedBattleModeId("wild");
            setMode("1V1");
          }}
          className="bg-[#FAF3E5] text-[#2D3748] rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#422462] active:border-b-2 active:translate-y-1 transition-all cursor-pointer relative overflow-hidden"
          style={{
            boxShadow: "0 4px 0 #422462, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="relative w-full h-32 mb-1 flex justify-center items-center">
            <Image
              src="/assets/icons/pvp.webp"
              alt="Wild Mode"
              fill
              className="object-contain no-global-filter"
            />
          </div>
          <h2 className="text-[#1A2E2E] font-bold text-2xl tracking-wider mb-1 uppercase">
            Wild Mode
          </h2>
          <p className="text-[#4A5568] text-sm font-medium text-center leading-tight">
            High-stakes draws, lawless duels.
          </p>
        </motion.button>
      </div>
    </div>
  );
}
