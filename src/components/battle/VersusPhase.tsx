"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/types/game";
import Image from "next/image";

interface VersusPhaseProps {
  playerDeck: Card[];
  opponentDeck: Card[];
  onComplete: () => void;
}

export default function VersusPhase({
  playerDeck,
  opponentDeck,
  onComplete,
}: VersusPhaseProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col bg-[#F5EEDF] relative overflow-hidden"
    >
      {/* Split Background */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full bg-[#E2E8F0] skew-x-[-10deg] -ml-10" />
        <div className="w-1/2 h-full bg-[#FED7D7] skew-x-[-10deg] -mr-10" />
      </div>

      <div className="z-10 w-full h-full flex flex-col items-center justify-center relative">
        {/* Player Side (Top/Leftish) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute top-20 left-4 flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 mb-2">
            {/* Avatar Placeholder */}
            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              P
            </div>
          </div>
          <h3 className="font-bold text-[#2D3748] text-lg bg-white/80 px-4 py-1 rounded-full shadow-sm">
            YOU
          </h3>

          {/* Tiny Deck Preview */}
          <div className="flex gap-1 mt-2">
            {playerDeck.map((card, i) => (
              <div
                key={i}
                className="w-8 h-12 bg-gray-800 rounded border border-white/50 overflow-hidden relative"
              >
                <Image src={card.image} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* VS Text */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1.5, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
          className="text-6xl font-black text-[#2D3748] italic z-20"
          style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.1)" }}
        >
          VS
        </motion.div>

        {/* Opponent Side (Bottom/Rightish) */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute bottom-20 right-4 flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 mb-2">
            {/* Avatar Placeholder */}
            <div className="w-full h-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl">
              O
            </div>
          </div>
          <h3 className="font-bold text-[#2D3748] text-lg bg-white/80 px-4 py-1 rounded-full shadow-sm">
            OPPONENT
          </h3>

          {/* Tiny Deck Preview */}
          <div className="flex gap-1 mt-2">
            {opponentDeck.map((card, i) => (
              <div
                key={i}
                className="w-8 h-12 bg-gray-800 rounded border border-white/50 overflow-hidden relative"
              >
                <Image src={card.image} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
