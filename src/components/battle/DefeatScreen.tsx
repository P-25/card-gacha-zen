import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/types/game";
import Image from "next/image";
import Background from "../layout/Background";

interface DefeatScreenProps {
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

export default function DefeatScreen({
  onContinue,
  rewards,
}: DefeatScreenProps) {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden font-sans">
      {/* Split Background Effect - Dark Side for Defeat */}
      <div className="absolute inset-0 z-0">
        <Background />
      </div>

      <div className="relative z-10 w-full max-w-md h-full max-h-[90%] flex flex-col items-center">
        {/* DEFEAT HEADER */}
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
            className="relative z-10 text-5xl font-black italic tracking-wider text-[#642144] drop-shadow-sm uppercase"
            style={{
              filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
            }}
          >
            DEFEATED!
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full aspect-square -mt-8 max-w-[350px] grayscale-30"
        >
          <Image
            src="/assets/summon/dragon-sleep.webp"
            alt="Victory Dragon"
            fill
            className="object-contain drop-shadow-2xl absolute mt-[35px]"
            priority
          />
        </motion.div>

        {/* REWARDS PANEL */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="bg-[#F4ECD5] w-[90%] rounded-3xl p-6 border-4 border-[#D7D1B2] flex flex-col items-center gap-4 relative"
        >
          <div className="absolute -top-3 bg-[#D7D1B2] text-[#3A4E4A] text-xs font-black tracking-[0.2em] px-4 py-1 rounded-full uppercase shadow-sm">
            Rewards
          </div>

          <div className="flex justify-center gap-4 w-full mt-2">
            {/* GOLD */}
            {rewards && rewards.gold > 0 ? (
              <motion.div
                initial={{ scale: 0, y: 10 }}
                animate={{ scale: 1, y: 0 }}
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
            ) : (
              <div className="text-[#a8a29e] font-bold text-sm tracking-widest opacity-50 py-4">
                NO REWARDS
              </div>
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
            className="w-full bg-[#450a0a] hover:bg-[#7f1d1d] text-[#fca5a5] font-black text-xl py-4 rounded-2xl border-b-[6px] border-[#290909] shadow-xl active:scale-95 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider"
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
