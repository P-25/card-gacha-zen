import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/types/game";
import {
  Confetti,
  ToonSword,
  GameCard,
  RewardItem,
} from "./BattleEndComponents";

interface VictoryScreenProps {
  onContinue: () => void;
  score: number;
  opponentScore: number;
  playerDeck?: Card[];
}

export default function VictoryScreen({
  onContinue,
  score,
  opponentScore,
  playerDeck = [],
}: VictoryScreenProps) {
  const [step, setStep] = useState<"hidden" | "entry" | "dealing">("hidden");

  useEffect(() => {
    // Start sequence
    const t1 = setTimeout(() => setStep("entry"), 100);
    const t2 = setTimeout(() => setStep("dealing"), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3a2649] to-[#1a1025] opacity-90"></div>

      {/* Rotating Sunburst */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.4, scale: 1.2, rotate: 360 }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            opacity: { duration: 0.2 },
          }}
          className="w-[600px] h-[600px]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white/10">
            {[...Array(16)].map((_, i) => (
              <path
                key={i}
                d="M50 50 L42 0 L58 0 Z"
                transform={`rotate(${i * 22.5} 50 50)`}
              />
            ))}
          </svg>
        </motion.div>
      </div>

      <AnimatePresence>{step === "entry" && <Confetti />}</AnimatePresence>

      {/* Banner & Icon Section */}
      <div
        className={`absolute top-0 w-full h-[45%] flex flex-col items-center justify-center transition-all duration-700 z-30 ${
          step === "dealing" ? "-translate-y-12 scale-90" : ""
        }`}
      >
        {/* Icons: Swords */}
        <div className="relative w-full h-40 flex justify-center items-center">
          <AnimatePresence mode="wait">
            {step !== "hidden" && (
              <>
                <motion.div
                  key="sword1"
                  initial={{ x: -150, y: -150, opacity: 0, rotate: -45 }}
                  animate={{ x: -25, y: 10, opacity: 1, rotate: -15 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="absolute z-10"
                >
                  <ToonSword />
                </motion.div>
                <motion.div
                  key="sword2"
                  initial={{ x: 150, y: -150, opacity: 0, rotate: 45 }}
                  animate={{ x: 25, y: 10, opacity: 1, rotate: 15 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="absolute transform scale-x-[-1] z-0"
                >
                  <ToonSword mirror />
                </motion.div>
              </>
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
                className="relative w-full h-16 border-y-[3px] shadow-lg flex items-center justify-center overflow-visible bg-[#7c3aed] border-[#c4b5fd]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#5b21b6] via-[#7c3aed] to-[#5b21b6]"></div>

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
                    WebkitTextStroke: "1.5px #2e1065",
                    filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
                  }}
                >
                  VICTORY
                </motion.h1>
              </motion.div>

              {/* Stars */}
              <div className="flex gap-3 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, y: 20, rotate: -180 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                      delay: 0.8 + i * 0.15,
                    }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      className="drop-shadow-lg filter overflow-visible"
                    >
                      <path
                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="#facc15"
                        stroke="#a16207"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Loot Deck (Transition Element) */}
      <AnimatePresence>
        {step !== "hidden" && (
          <motion.div
            animate={
              step === "dealing"
                ? { opacity: 0, scale: 0.8 }
                : { opacity: 1, scale: 1 }
            }
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            {step !== "dealing" && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5 }}
                className="w-24 h-32 bg-[#451a03] rounded-lg border-2 border-[#92400e] shadow-2xl flex items-center justify-center"
              >
                <div className="text-4xl opacity-50">🎴</div>
                <div className="absolute -bottom-3 bg-black/80 text-white text-xs px-2 py-0.5 rounded-full border border-white/20">
                  {playerDeck.length} Cards
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

              {/* Character Rewards */}
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
              <div className="w-full bg-black/20 rounded-xl p-2 mb-4 flex items-center justify-center gap-4 border border-white/5 mx-auto max-w-[95%]">
                <div className="text-white/40 font-bold text-[10px] uppercase tracking-wider mr-2">
                  Reward
                </div>
                <RewardItem
                  delay={1.2}
                  icon={<span className="text-blue-300 text-xl">★</span>}
                  amount="40"
                  color="bg-slate-700"
                />
                <RewardItem
                  delay={1.3}
                  icon={
                    <div className="w-5 h-5 rounded-full bg-yellow-400 border border-yellow-200 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                  }
                  amount="26"
                  color="bg-slate-700"
                />
                <RewardItem
                  delay={1.4}
                  icon={
                    <div className="w-4 h-6 bg-emerald-500 border border-emerald-300 clip-gem shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  }
                  amount="1"
                  color="bg-slate-700"
                />
              </div>

              {/* Footer Buttons */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.8, type: "spring" }}
                className="w-full flex justify-between items-center gap-3 px-2"
              >
                <button className="flex-1 relative group flex flex-col items-center justify-center bg-[#4ade80] hover:bg-[#22c55e] active:scale-95 transition-all text-white font-black py-2.5 rounded-2xl border-b-[5px] border-[#15803d] shadow-lg overflow-hidden h-14">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                  <div className="relative z-10 flex items-center gap-1 text-xl drop-shadow-md italic">
                    GET{" "}
                    <div className="bg-white rounded-full px-1 text-[10px] text-[#15803d] font-bold">
                      PLAY
                    </div>
                  </div>
                  <span className="relative z-10 text-[10px] font-bold bg-black/20 px-2 rounded-full mt-0.5">
                    x180
                  </span>
                </button>

                <button
                  onClick={onContinue}
                  className="flex-1 relative group flex items-center justify-center bg-[#facc15] hover:bg-[#eab308] active:scale-95 transition-all text-[#713f12] font-black text-2xl py-2.5 rounded-2xl border-b-[5px] border-[#a16207] shadow-lg overflow-hidden h-14"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
                  <span className="relative z-10 drop-shadow-sm italic">
                    NEXT
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .clip-gem {
          clip-path: polygon(
            50% 0%,
            100% 25%,
            100% 75%,
            50% 100%,
            0% 75%,
            0% 25%
          );
        }
      `}</style>
    </div>
  );
}
