"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Check } from "lucide-react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  selectPlayerTier,
  selectMaxTP,
  selectTierThreshold,
  selectCanUpgradeTier,
  selectTop3Cards,
} from "@/store/selectors";
import { increaseBattleTier } from "@/store/slices/playerSlice";
import { TIER_REWARD_GEMS, TIER_REWARD_GOLD } from "@/config/tierConfig";
import SingleCard from "@/components/battle/SingleCard"; // Reusing card component

interface BattleTierScreenProps {
  onBack: () => void;
}

export default function BattleTierScreen({ onBack }: BattleTierScreenProps) {
  const dispatch = useDispatch();

  const currentTier = useSelector(selectPlayerTier);
  const maxTP = useSelector(selectMaxTP);
  const threshold = useSelector(selectTierThreshold);
  const canUpgrade = useSelector(selectCanUpgradeTier);
  const topCards = useSelector(selectTop3Cards);

  const handleUpgrade = () => {
    if (canUpgrade) {
      dispatch(increaseBattleTier());
    }
  };

  const progressPercent = Math.min((maxTP / threshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="w-full h-full bg-[#FDF6E3] relative flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center p-4 sticky top-0 bg-[#FDF6E3]/90 backdrop-blur-md z-10 border-b border-[#D4C5A5]">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all text-[#5C4D32]"
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-[#5C4D32] tracking-wider uppercase">
          Battle Tier System
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 p-6 flex flex-col items-center gap-6 pb-24">
        {/* Tier Shield Badge */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Simple Shield SVG or Image Logic */}
            <Shield
              size={180}
              className="text-[#8C735D] drop-shadow-xl"
              fill="#D4C5A5"
            />
          </motion.div>
          <div className="relative z-10 flex flex-col items-center pt-4">
            <span className="text-[#5C4D32] font-black tracking-widest text-lg drop-shadow-sm">
              TIER
            </span>
            <span className="text-[#5C4D32] font-black text-6xl drop-shadow-md">
              {currentTier}
            </span>
          </div>
        </div>

        {/* Max Total Power Card */}
        <div className="w-full max-w-md bg-[#E8DCC0] rounded-2xl p-6 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_4px_8px_rgba(0,0,0,0.1)] border border-[#C5A059]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[#5C4D32] font-bold text-sm uppercase tracking-widest">
              Max Total Power
            </h2>
            <div className="bg-[#5C4D32] text-[#FDF6E3] text-xs font-bold px-2 py-1 rounded-md">
              TOP 3 CARDS
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-5xl font-black text-[#5C4D32]">{maxTP}</span>
          </div>

          <div className="flex justify-center gap-2">
            {topCards.map((card, idx) => (
              <div
                key={card.instanceId || idx}
                className="w-20 aspect-2/3 relative"
              >
                <SingleCard
                  data={card}
                  disabled
                  className="scale-[0.8] origin-top"
                />
                <div className="absolute -bottom-2 md:-bottom-4 left-0 right-0 text-center">
                  <span className="bg-black/70 text-white text-[8px] md:text-[10px] px-1 rounded-sm font-bold">
                    {(card.state.pow || 0) +
                      (card.state.spd || 0) +
                      (card.state.def || 0)}
                  </span>
                </div>
              </div>
            ))}
            {topCards.length === 0 && (
              <p className="text-gray-500 italic text-sm py-4">
                Collect cards to see them here!
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-sm font-bold text-[#5C4D32] mb-1">
            <span>Progress to Tier {currentTier + 1}</span>
            <span>
              {maxTP} / {threshold}
            </span>
          </div>
          <div className="w-full h-6 bg-[#D4C5A5] rounded-full overflow-hidden shadow-inner border border-[#8C735D]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={`h-full ${canUpgrade ? "bg-green-500" : "bg-[#FFB13B]"} relative`}
            >
              {canUpgrade && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Rewards Preview */}
        <div className="w-full max-w-md bg-[#F5EEDF] rounded-xl p-4 border border-[#D4C5A5]/50 flex flex-col items-center gap-2">
          <h3 className="text-[#8C735D] font-bold text-xs uppercase tracking-widest">
            Rewards
          </h3>
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 relative mb-1">
                {/* Placeholder for Gem Icon - Assuming asset exists or using generic */}
                <div className="w-full h-full bg-green-400 rounded-lg rotate-45 shadow-sm border-2 border-green-600" />
              </div>
              <span className="text-[#5C4D32] font-bold text-sm">
                {TIER_REWARD_GEMS} Gems
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 relative mb-1">
                {/* Placeholder for Gold Icon */}
                <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-600 shadow-sm" />
              </div>
              <span className="text-[#5C4D32] font-bold text-sm">
                {TIER_REWARD_GOLD} Gold
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Button Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDF6E3] to-transparent">
        <button
          onClick={handleUpgrade}
          disabled={!canUpgrade}
          className={`
            w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-lg transition-all
            ${
              canUpgrade
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-emerald-500/30 hover:scale-[1.02] active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {canUpgrade ? "Increase Tier" : "Not Enough Power"}
        </button>
      </div>
    </motion.div>
  );
}
