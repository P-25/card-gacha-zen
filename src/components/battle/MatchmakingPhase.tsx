"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/types/game";
import cardsData from "@/config/cards.json"; // We'll use this to pick random opponent cards

interface MatchmakingPhaseProps {
  onMatchFound: (opponentDeck: Card[]) => void;
}

export default function MatchmakingPhase({
  onMatchFound,
}: MatchmakingPhaseProps) {
  useEffect(() => {
    // Simulate searching delay
    const timer = setTimeout(() => {
      // Generate random opponent deck
      // In a real app, this would come from the server
      const shuffled = [...cardsData].sort(() => 0.5 - Math.random());
      const opponentDeck = shuffled.slice(0, 3) as unknown as Card[]; // Casting for now as json might differ slightly from type

      onMatchFound(opponentDeck);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onMatchFound]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col items-center justify-center bg-[#F5EEDF] relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/assets/background/home_bg.png')] opacity-10 bg-cover bg-center" />

      <div className="z-10 flex flex-col items-center gap-8">
        <div className="relative w-48 h-48">
          {/* Spinning Sword/Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-full h-full flex items-center justify-center"
          >
            {/* Placeholder for Sword Icon - using a simple SVG or Image if available */}
            {/* If no specific sword icon, we can use a generic shape or text for now */}
            <div className="w-32 h-32 border-4 border-[#422462] rounded-full border-t-transparent" />
          </motion.div>

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">⚔️</span>
          </div>
        </div>

        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#2D3748] text-xl font-bold tracking-widest uppercase"
        >
          Matchmaking...
        </motion.h2>
      </div>
    </motion.div>
  );
}
