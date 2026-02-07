import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/types/game";
import Image from "next/image";
import Background from "../layout/Background";
import MagicCircle from "../features/gacha/RateUpSummon/MagicCircle";

interface VictoryScreenProps {
  onContinue: () => void;
  score: number;
  opponentScore: number;
  playerDeck?: Card[];
  rewards?: {
    exp: number;
    gold: number;
    gems: number;
  };
}

export default function VictoryScreen({
  onContinue,
  rewards,
}: VictoryScreenProps) {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Split Background Effect - Light Side for Victory */}
      <div className="absolute inset-0 z-0">
        <Background />
      </div>

      <div className="relative z-10 w-full max-w-md h-full max-h-[90%] flex flex-col items-center">
        {/* VICTORY HEADER */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mt-12 mb-4"
        >
          <motion.h1
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 12,
              delay: 0.4,
            }}
            className="relative z-10 text-6xl italic tracking-wider text-[#4c1d95] uppercase drop-shadow-md"
            style={{
              WebkitTextStroke: "1.5px #2e1065",
              filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
            }}
          >
            VICTORY!
          </motion.h1>
        </motion.div>

        {/* DRAGON IMAGE */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full aspect-square -mt-8 max-w-[350px]"
        >
          <div className="w-full h-full z-[-1]" id="MagicCircle">
            <MagicCircle summonStarted={false} />
          </div>
          <Image
            src="/assets/summon/dragon-raise.webp"
            alt="Victory Dragon"
            fill
            className="no-global-filter object-contain drop-shadow-2xl absolute z-10 mt-[20px]"
            priority
          />
        </motion.div>

        {/* REWARDS PANEL */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="bg-[#F4ECD5] w-[90%] rounded-3xl p-6 border-4 border-[#D7D1B2] flex flex-col items-center gap-4 relative z-12"
        >
          <div className="absolute -top-3 bg-[#D7D1B2] text-[#3A4E4A] text-xs font-black tracking-[0.2em] px-4 py-1 rounded-full uppercase shadow-sm">
            Rewards
          </div>

          <div className="flex justify-center gap-4 w-full mt-2">
            {/* EXP */}
            {rewards && rewards.exp > 0 && (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className={`flex flex-col items-center justify-center`}
              >
                <p className="text-[#3A4E4A] text-xs">EXP</p>
                <RewardCard
                  label="exp"
                  value={`+${rewards.exp}`}
                  icon="/assets/icons/exp.webp"
                  color="border-[#6B7672] text-[#043082]"
                  delay={0.5}
                />
              </motion.div>
            )}

            {/* GOLD */}
            {rewards && rewards.gold > 0 && (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
                className={`flex flex-col items-center justify-center`}
              >
                <p className="text-[#3A4E4A] text-xs">GOLD</p>
                <RewardCard
                  label="gold"
                  value={`+${rewards.gold}`}
                  icon="/assets/icons/gold-coin.webp"
                  color="border-[#6B7672] text-[#B47A44]"
                  delay={0.6}
                />
              </motion.div>
            )}

            {/* GEMS */}
            {rewards && rewards.gems > 0 && (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.7, type: "spring" }}
                className={`flex flex-col items-center justify-center`}
              >
                <p className="text-[#3A4E4A] text-xs">GEMS</p>
                <RewardCard
                  label="gem"
                  value={`+${rewards.gems}`}
                  icon="/assets/icons/gem.webp"
                  color="border-[#6B7672] text-[#675787]"
                  delay={0.7}
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CONTINUE BUTTON */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="mt-auto mb-12 w-[80%]"
        >
          <button
            onClick={onContinue}
            className="w-full bg-[#4c1d95] hover:bg-[#5b21b6] text-white font-black text-xl py-4 rounded-2xl border-b-[6px] border-[#2e1065] shadow-xl active:scale-95 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function RewardCard({
  label,
  value,
  icon,
  color,
  delay,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ delay, type: "spring" }}
      className={`flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 ${color} shadow-sm`}
    >
      <div className="relative w-[70%] h-[70%]">
        <Image
          src={icon}
          alt={label}
          className="no-global-filter w-full h-full object-contain "
          fill
        />
      </div>
      <span className="text-md font-black">{value}</span>
    </motion.div>
  );
}
