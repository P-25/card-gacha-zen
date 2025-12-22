import React from "react";
import { motion } from "framer-motion";

interface DrawScreenProps {
  onContinue: () => void;
  score: number;
  opponentScore: number;
}

export default function DrawScreen({
  onContinue,
  score,
  opponentScore,
}: DrawScreenProps) {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex flex-col items-center"
      >
        <h1 className="text-6xl font-black text-gray-400 tracking-widest drop-shadow-[0_0_25px_rgba(156,163,175,0.8)] mb-4">
          DRAW
        </h1>
        <div className="text-2xl text-white font-bold mb-8">
          {score} - {opponentScore}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onContinue}
          className="px-8 py-3 bg-gray-600 text-white font-bold rounded-full shadow-lg hover:bg-gray-500 transition-colors"
        >
          CONTINUE
        </motion.button>
      </motion.div>
    </div>
  );
}
