"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface RewardsPhaseProps {
  onClaim: () => void;
}

export default function RewardsPhase({ onClaim }: RewardsPhaseProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col items-center justify-center bg-[#F5EEDF] relative"
    >
      <div className="absolute inset-0 bg-[url('/assets/background/home_bg.png')] opacity-10 bg-cover bg-center" />

      <motion.div className="z-10 flex flex-col items-center gap-8">
        <h2 className="text-[#2D3748] text-3xl font-bold uppercase tracking-widest">
          Rewards
        </h2>

        <div
          className="relative w-64 h-64 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <motion.div
            animate={
              isOpen ? { scale: 1.1, opacity: 0 } : { scale: 1, opacity: 1 }
            }
            className="absolute inset-0"
          >
            {/* Closed Chest */}
            <Image
              src="/assets/chest-closed-clean.png"
              alt="Chest"
              fill
              className="object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Open Chest */}
            <Image
              src="/assets/chest-open-clean.png"
              alt="Open Chest"
              fill
              className="object-contain"
            />
          </motion.div>
        </div>

        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-8 items-center"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center border-2 border-[#FFD700]">
                <Image
                  src="/assets/coin.svg"
                  width={32}
                  height={32}
                  alt="Gold"
                />
              </div>
              <span className="font-bold text-[#2D3748]">+50</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500">
                <Image
                  src="/assets/gem.svg"
                  width={32}
                  height={32}
                  alt="Gems"
                />
              </div>
              <span className="font-bold text-[#2D3748]">+10</span>
            </div>
          </motion.div>
        )}

        {isOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onClaim}
            className="mt-8 bg-[#1A2E2E] text-white px-8 py-3 rounded-xl font-bold tracking-wider shadow-lg hover:scale-105 transition-transform"
          >
            CLAIM REWARDS
          </motion.button>
        )}

        {!isOpen && (
          <p className="text-[#4A5568] animate-pulse font-bold">Tap to open!</p>
        )}
      </motion.div>
    </motion.div>
  );
}
