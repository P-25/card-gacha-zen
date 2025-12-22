import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PlayerProfile {
  name: string;
  avatar: string;
}

interface RoundResultOverlayProps {
  userProfile: PlayerProfile;
  oppProfile: PlayerProfile;
  userScore: number;
  oppScore: number;
  battleResult: "WIN" | "LOSE" | "DRAW" | null;
}

export default function RoundResultOverlay({
  userProfile,
  oppProfile,
  userScore,
  oppScore,
  battleResult,
}: RoundResultOverlayProps) {
  const [displayedUserScore, setDisplayedUserScore] = useState(userScore);
  const [displayedOppScore, setDisplayedOppScore] = useState(oppScore);

  // Handle Score Counting Animation
  useEffect(() => {
    if (battleResult === "WIN") {
      setDisplayedUserScore(userScore - 1);
      setTimeout(() => setDisplayedUserScore(userScore), 600); // Delay count up
    } else if (battleResult === "LOSE") {
      setDisplayedOppScore(oppScore - 1);
      setTimeout(() => setDisplayedOppScore(oppScore), 600);
    }
  }, [userScore, oppScore, battleResult]);

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col justify-between pointer-events-none overflow-hidden"
      id="round-result-overlay"
    >
      {/* --- ORB ANIMATION (Flying Point) --- */}
      <AnimatePresence>
        {battleResult !== "DRAW" && (
          <motion.div
            initial={{
              top: "50%",
              left: "50%",
              scale: 0,
              opacity: 0,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: [0, 1.5, 0.5],
              opacity: [0, 1, 1],
              top: battleResult === "WIN" ? "85%" : "15%", // Fly to User or Opponent
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
              times: [0, 0.2, 1],
            }}
            className="absolute z-[90] w-8 h-8 rounded-full bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,1)]"
          />
        )}
      </AnimatePresence>

      {/* --- OPPONENT INFO (TOP) --- */}
      <div className="relative w-full flex flex-col items-center pt-4">
        {/* Winner Slide Background */}
        <AnimatePresence>
          {battleResult === "LOSE" && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute inset-0 h-[180px] max-[400px]:h-[120px] bg-gradient-to-b from-red-900/80 to-transparent z-[-1] border-b-4 border-red-500"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div
              className={`w-24 h-24 max-[400px]:w-16 max-[400px]:h-16 rounded-full border-4 overflow-hidden bg-black transition-all duration-300 ${
                battleResult === "LOSE"
                  ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)] scale-110"
                  : "border-gray-600 grayscale opacity-80"
              }`}
            >
              <Image
                src={oppProfile.avatar}
                alt={oppProfile.name}
                fill
                className="object-cover"
              />
            </div>
            <div
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-1 rounded-full whitespace-nowrap shadow-lg border border-white/20 uppercase tracking-widest ${
                battleResult === "LOSE"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {oppProfile.name}
            </div>
          </div>

          {/* Score Display */}
          <div className="mt-4 relative">
            <motion.div
              key={displayedOppScore}
              initial={{ scale: 1.5, color: "#fbbf24" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="text-6xl max-[400px]:text-4xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,1)]"
              style={{
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              {displayedOppScore}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* --- CENTER RESULT TEXT --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: -6 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.1,
          }}
          className="relative"
        >
          {battleResult === "WIN" && (
            <>
              <div className="absolute inset-0 blur-lg bg-yellow-500/30 transform scale-150"></div>
              <div
                className="text-5xl font-black text-yellow-500 italic tracking-wider px-2"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(234,179,8,0.5))",
                  WebkitTextStroke: "1px black",
                  paintOrder: "stroke fill",
                  textShadow:
                    "4px 4px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              >
                ROUND WON
              </div>
            </>
          )}
          {battleResult === "LOSE" && (
            <>
              <div
                className="text-5xl font-black text-gray-400 italic tracking-wider"
                style={{
                  textShadow:
                    "4px 4px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                }}
              >
                ROUND LOST
              </div>
            </>
          )}
          {battleResult === "DRAW" && (
            <div
              className="text-7xl font-black text-white italic tracking-tighter"
              style={{
                textShadow: "0 0 20px rgba(255,255,255,0.5), 4px 4px 0px #000",
              }}
            >
              DRAW
            </div>
          )}
        </motion.div>
      </div>

      {/* --- USER INFO (BOTTOM) --- */}
      <div className="relative w-full flex flex-col-reverse items-center pb-4">
        {/* Winner Slide Background */}
        <AnimatePresence>
          {battleResult === "WIN" && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute inset-0 h-[180px] max-[400px]:h-[120px] bg-gradient-to-t from-blue-900/80 to-transparent z-[-1] border-t-4 border-blue-500 bottom-0 top-auto"
            />
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col-reverse items-center"
        >
          <div className="relative">
            <div
              className={`w-24 h-24 max-[400px]:w-16 max-[400px]:h-16 rounded-full border-4 overflow-hidden bg-black transition-all duration-300 ${
                battleResult === "WIN"
                  ? "border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.8)] scale-110"
                  : "border-gray-600 grayscale opacity-80"
              }`}
            >
              <Image
                src={userProfile.avatar}
                alt={userProfile.name}
                fill
                className="object-cover"
              />
            </div>
            <div
              className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-4 py-1 rounded-full whitespace-nowrap shadow-lg border border-white/20 uppercase tracking-widest ${
                battleResult === "WIN"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {userProfile.name}
            </div>
          </div>

          {/* Score Display */}
          <div className="mb-4 relative">
            <motion.div
              key={displayedUserScore}
              initial={{ scale: 1.5, color: "#fbbf24" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="text-6xl max-[400px]:text-4xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,1)]"
              style={{
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              {displayedUserScore}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
