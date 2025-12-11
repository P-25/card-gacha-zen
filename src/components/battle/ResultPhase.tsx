"use client";

import { PlayerState } from "@/store/slices/playerSlice";
import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import profileIcons from "../../config/profileIcons.json";

interface ResultPhaseProps {
  result: "VICTORY" | "DEFEAT" | "DRAW";
  score: { player: number; opponent: number };
  playerDeck: Card[];
  opponentInfo: PlayerState;
  onContinue: () => void;
  onTryAgain: () => void;
  onHome: () => void;
}

export default function ResultPhase({
  result,
  score,
  playerDeck,
  opponentInfo,
  onContinue,
  onTryAgain,
  onHome,
}: ResultPhaseProps) {
  const isVictory = result === "VICTORY";

  const opponentIcon =
    profileIcons.find((icon) => icon.id === opponentInfo.activeProfilePicId) ||
    profileIcons[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col items-center justify-center bg-black/80 absolute inset-0 z-50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <h1
          className={`text-6xl font-black tracking-tighter uppercase ${
            isVictory
              ? "text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
              : result === "DEFEAT"
              ? "text-[#E53E3E]"
              : "text-white"
          }`}
        >
          {result}!
        </h1>

        {/* Score & Avatars */}
        <div className="flex items-center gap-6">
          {/* Player (Placeholder for now, or use Redux if needed, but keeping simple) */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <span className="text-white text-xs font-bold tracking-wider">
              YOU
            </span>
          </div>

          <div className="text-white text-4xl font-black tracking-widest">
            {score.player} - {score.opponent}
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-bold overflow-hidden relative">
              <Image
                src={opponentIcon.imagePath}
                alt="Opponent"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-white text-xs font-bold tracking-wider uppercase">
              {opponentInfo.name}
            </span>
          </div>
        </div>

        {/* Deck Display */}
        <div className="flex gap-2">
          {playerDeck.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="w-20 h-28 rounded-lg overflow-hidden border-2 border-white/20 relative"
            >
              <Image src={card.image} alt="" fill className="object-cover" />
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-8 w-64">
          {isVictory ? (
            <button
              onClick={onContinue}
              className="w-full py-4 bg-[#FFD700] text-[#1A202C] font-black rounded-xl shadow-lg hover:scale-105 transition-transform uppercase tracking-wider"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={onTryAgain}
              className="w-full py-4 bg-[#4A5568] text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform uppercase tracking-wider"
            >
              Try Again
            </button>
          )}

          <button
            onClick={onHome}
            className="w-full py-3 bg-transparent text-white/50 font-bold hover:text-white transition-colors uppercase text-sm"
          >
            Home
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
