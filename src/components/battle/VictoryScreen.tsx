import React from "react";
import { motion } from "framer-motion";

interface VictoryScreenProps {
  onContinue: () => void;
  score: number;
  opponentScore: number;
}

export default function VictoryScreen({
  onContinue,
  score,
  opponentScore,
}: VictoryScreenProps) {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex flex-col items-center"
      >
        <h1 className="text-6xl font-black text-yellow-400 tracking-widest drop-shadow-[0_0_25px_rgba(250,204,21,0.8)] mb-4">
          VICTORY
        </h1>
        <div className="text-2xl text-white font-bold mb-8">
          {score} - {opponentScore}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onContinue}
          className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-full shadow-lg hover:bg-yellow-400 transition-colors"
        >
          CONTINUE
        </motion.button>
      </motion.div>
    </div>
  );
}
