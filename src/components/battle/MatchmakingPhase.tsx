"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/types/game";
import cardsData from "@/config/cards.json"; // We'll use this to pick random opponent cards
import Image from "next/image";

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
    <div className="fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center">
      <motion.div className="relative w-64 h-64">
        <Image
          src="/assets/icons/loader.webp"
          alt="Loading"
          fill
          className="object-contain opacity-80"
          priority
        />
      </motion.div>

      <motion.div
        key={"loading-text"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 flex flex-col items-center gap-2"
      >
        <h2 className="text-[#3C595E] font-bold text-xl tracking-[0.3em] uppercase font-display text-center drop-shadow-lg">
          Matchmaking
        </h2>
        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-transparent via-[#3C595E] to-transparent"
          animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}
