import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/types/game";
import { Smoke, SkullCrossbones, GameCard } from "./BattleEndComponents";

interface DefeatScreenProps {
  onContinue: () => void;
  score: number;
  opponentScore: number;
  playerDeck?: Card[];
}

export default function DefeatScreen({
  onContinue,
  score,
  opponentScore,
  playerDeck = [],
}: DefeatScreenProps) {
  const [step, setStep] = useState<"hidden" | "entry" | "dealing">("hidden");

  useEffect(() => {
    // Start sequence
    const t1 = setTimeout(() => setStep("entry"), 100);
    const t2 = setTimeout(() => setStep("dealing"), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#450a0a] to-[#1a0505] opacity-90"></div>

      {/* Red Overlay */}
      {step !== "hidden" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute inset-0 bg-red-900 mix-blend-overlay z-0"
        />
      )}

      <AnimatePresence>{step === "entry" && <Smoke />}</AnimatePresence>

      {/* Banner & Icon Section */}
      <div
        className={`absolute top-0 w-full h-[45%] flex flex-col items-center justify-center transition-all duration-700 z-30 ${
          step === "dealing" ? "-translate-y-12 scale-90" : ""
        }`}
      >
        {/* Icons: Skull */}
        <div className="relative w-full h-40 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {step !== "hidden" && (
              <motion.div
                key="skull"
                initial={{ scale: 2, opacity: 0, y: -100 }}
                animate={{ scale: 1, opacity: 1, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="absolute z-20"
              >
                <SkullCrossbones />
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 -z-10 animate-pulse"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Banner */}
        <AnimatePresence>
          {step !== "hidden" && (
            <div className="relative w-full flex flex-col items-center z-20 -mt-4">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: 0.3,
                }}
                className="relative w-full h-16 border-y-[3px] shadow-lg flex items-center justify-center overflow-visible bg-[#991b1b] border-[#fca5a5]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#7f1d1d] via-[#b91c1c] to-[#7f1d1d]"></div>

                <motion.h1
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 12,
                    delay: 0.4,
                  }}
                  className="relative z-10 text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#e5e7eb] drop-shadow-sm uppercase"
                  style={{
                    WebkitTextStroke: "1.5px #450a0a",
                    filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
                  }}
                >
                  DEFEATED!
                </motion.h1>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Sheet */}
      <AnimatePresence>
        {step === "dealing" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 150 }}
            className="absolute bottom-0 w-full h-[60%] flex flex-col items-center pt-2 pb-4 px-4 z-40"
          >
            <div className="absolute inset-0 bg-[#1e1b2e]/95 backdrop-blur-sm rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] border-t border-white/10"></div>

            <div className="relative z-10 w-full flex flex-col h-full">
              {/* Header */}
              <div className="text-center mb-6 mt-4">
                <div className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase">
                  Battle Result
                </div>
                <div className="text-white text-2xl font-black italic tracking-wider drop-shadow-md">
                  {score} - {opponentScore}
                </div>
              </div>

              {/* Character Rewards (Show player deck as "defeated") */}
              <div className="flex gap-2 mb-auto justify-center px-1 overflow-x-auto pb-4">
                {playerDeck.map((char, idx) => (
                  <GameCard
                    key={char.id}
                    card={char}
                    index={idx}
                    isSingle={false}
                  />
                ))}
              </div>

              {/* Reward Section */}
              <div className="w-full bg-black/20 rounded-xl p-4 mb-4 flex flex-col items-center justify-center gap-1 border border-white/5 mx-auto max-w-[95%]">
                <div className="text-white/40 font-bold text-[10px] uppercase tracking-wider mb-1">
                  Reward
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-3xl opacity-50 font-black">X</span>
                  <span className="font-bold text-sm tracking-widest opacity-50">
                    NO REWARD
                  </span>
                </div>
              </div>

              {/* Footer Buttons */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, type: "spring" }}
                className="w-full flex justify-between items-center gap-3 px-2"
              >
                <button className="w-14 h-14 flex items-center justify-center bg-[#7c3aed] hover:bg-[#6d28d9] rounded-2xl border-b-[5px] border-[#4c1d95] shadow-lg active:scale-95 transition-all">
                  <span className="text-white text-xl font-bold">{"<"}</span>
                </button>

                <button className="flex-1 relative group flex flex-col items-center justify-center bg-[#4ade80] hover:bg-[#22c55e] active:scale-95 transition-all text-white font-black py-2.5 rounded-2xl border-b-[5px] border-[#15803d] shadow-lg overflow-hidden h-14 grayscale opacity-50 cursor-not-allowed">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                  <div className="relative z-10 flex items-center gap-1 text-xl drop-shadow-md italic">
                    GET{" "}
                    <div className="bg-white rounded-full px-1 text-[10px] text-[#15803d] font-bold">
                      PLAY
                    </div>
                  </div>
                  <span className="relative z-10 text-[10px] font-bold bg-black/20 px-2 rounded-full mt-0.5">
                    x0
                  </span>
                </button>

                <button
                  onClick={onContinue}
                  className="w-14 h-14 flex items-center justify-center bg-[#3b82f6] hover:bg-[#2563eb] rounded-2xl border-b-[5px] border-[#1e40af] shadow-lg active:scale-95 transition-all"
                >
                  <span className="text-white text-xs font-bold">RETRY</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
