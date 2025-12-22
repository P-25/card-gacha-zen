"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/types/game";
import cardsData from "@/config/cards.json";
import Image from "next/image";

interface MatchmakingPhaseProps {
  onMatchFound: (opponentDeck: Card[]) => void;
  playerDeck: Card[];
}

export default function MatchmakingPhase({
  onMatchFound,
  playerDeck,
}: MatchmakingPhaseProps) {
  useEffect(() => {
    // Simulate searching delay
    const timer = setTimeout(() => {
      // 1. Calculate User's Total Power
      const userTotalPower = playerDeck.reduce((sum, card) => {
        return (
          sum +
          (card.state.pow || 0) +
          (card.state.def || 0) +
          (card.state.spd || 0)
        );
      }, 0);

      const targetTotalPower = userTotalPower; // Aim for parity
      const targetAvgPower = targetTotalPower / 3;

      // 2. Select 3 Random Base Cards for Opponent
      const shuffled = [...cardsData].sort(() => 0.5 - Math.random());
      const selectedBaseCards = shuffled.slice(0, 3) as unknown as Card[];

      // 3. Level Up / Adjust Stats to Match Target Power
      const opponentDeck = selectedBaseCards.map((baseCard) => {
        // Create a deep copy to avoid mutating source data
        const card = JSON.parse(JSON.stringify(baseCard)) as Card;

        const basePower =
          (card.state.pow || 0) + (card.state.def || 0) + (card.state.spd || 0);

        // If base power is already higher than target (unlikely for lvl 1 vs leveled), keep it.
        // Otherwise, buff it.
        if (basePower < targetAvgPower) {
          const powerDeficit = targetAvgPower - basePower;

          // Distribute deficit randomly across stats
          // We'll add roughly equal parts to POW, DEF, SPD, with some randomness
          const parts = 3;
          const baseBuff = Math.floor(powerDeficit / parts);
          const remainder = Math.floor(powerDeficit % parts);

          card.state.pow =
            (card.state.pow || 0) +
            baseBuff +
            (Math.random() > 0.5 ? remainder : 0);
          card.state.def = (card.state.def || 0) + baseBuff;
          card.state.spd = (card.state.spd || 0) + baseBuff;

          // Update Level Visual (Approximate: 1 level ~ 10 power? Just an estimate for visual flair)
          // Assuming base level is 1.
          const levelIncrease = Math.floor(powerDeficit / 5); // Arbitrary scaling
          card.level = (card.level || 1) + levelIncrease;
        }

        // Ensure unique IDs for the battle
        card.instanceId = `opp-${card.id}-${Math.random()}`;

        return card;
      });

      onMatchFound(opponentDeck);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onMatchFound, playerDeck]);

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
