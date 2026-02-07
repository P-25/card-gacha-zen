"use client";

import TopBar from "@/components/features/home/TopBar";
import HomeActions from "@/components/features/home/HomeActions";
import HomeBanner from "./features/home/HomeBanner";
import { useEffect, useState } from "react";

interface HomeScreenProps {
  onNavigate: (
    screen: "gacha" | "quests" | "collection" | "battle" | "deck" | "tier",
  ) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <TopBar title="Home" onNavigate={onNavigate} />
      <HomeBanner />

      {/* {windowSize.width ? (
        <ul className="space-y-1">
          <li>
            <strong>Width:</strong> {windowSize.width}px
          </li>
          <li>
            <strong>Height:</strong> {windowSize.height}px
          </li>
        </ul>
      ) : (
        <p>Loading dimensions...</p>
      )} */}
      {/* Main Actions Area */}
      <div className="flex-1 flex flex-col justify-end pb-24">
        <HomeActions onNavigate={onNavigate} />
      </div>

      {/* Spacer for persistent nav */}
      <div className="relative z-20 px-4 pointer-events-none" />

      {/* LEVEL UP POPUP */}
      <LevelUpPopup />
    </div>
  );
}

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { acknowledgeLevelUp } from "@/store/slices/playerSlice";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function LevelUpPopup() {
  const dispatch = useDispatch();
  const { level, lastSeenLevel } = useSelector(
    (state: RootState) => state.player,
  );

  // Only show if actual level > recognized level
  const show = level > lastSeenLevel;
  const levelsGained = level - lastSeenLevel;

  // Calculate rewards (100 Gems + 300 Gold per level)
  const gemReward = 100 * levelsGained;
  const goldReward = 300 * levelsGained;

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className="relative bg-white rounded-3xl p-1 w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="bg-[#FAF3E5] rounded-[20px] p-6 flex flex-col items-center border-[3px] border-[#C5A059] relative">
          {/* Confetti / Rays (Background) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,#FFD700_0deg,transparent_20deg,#FFD700_40deg,transparent_60deg,#FFD700_80deg,transparent_100deg,#FFD700_120deg,transparent_140deg,#FFD700_160deg,transparent_180deg,#FFD700_200deg,transparent_220deg,#FFD700_240deg,transparent_260deg,#FFD700_280deg,transparent_300deg,#FFD700_320deg,transparent_340deg)] opacity-10"
            />
          </div>

          <h2 className="text-3xl font-black text-[#3E206D] uppercase tracking-wider mb-2 drop-shadow-sm relative z-10">
            Level Up!
          </h2>

          <div className="flex items-center gap-4 mb-4 relative z-10">
            <span className="text-4xl font-bold text-[#A0AEC0] line-through decoration-red-500 decoration-4 opacity-70">
              {lastSeenLevel}
            </span>
            <span className="text-2xl">➔</span>
            <span className="text-6xl font-black text-[#C5A059] drop-shadow-[0_2px_0_#fff]">
              {level}
            </span>
          </div>

          <p className="text-[#4A5568] font-bold uppercase tracking-widest text-xs mb-6 relative z-10">
            Rewards Unlocked
          </p>

          <div className="flex gap-4 w-full mb-6 relative z-10">
            {/* Gems */}
            <div className="flex-1 bg-white p-3 rounded-xl border border-[#E2E8F0] flex flex-col items-center shadow-sm">
              <div className="w-10 h-10 relative mb-1">
                <Image
                  src="/assets/icons/gem.webp"
                  alt="Gems"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-black text-[#3E206D] text-lg">
                +{gemReward}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">
                Gems
              </span>
            </div>

            {/* Gold */}
            <div className="flex-1 bg-white p-3 rounded-xl border border-[#E2E8F0] flex flex-col items-center shadow-sm">
              <div className="w-10 h-10 relative mb-1">
                <Image
                  src="/assets/icons/gold.webp"
                  alt="Gold"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-black text-[#C5A059] text-lg">
                +{goldReward}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">
                Gold
              </span>
            </div>
          </div>

          <button
            onClick={() => dispatch(acknowledgeLevelUp())}
            className="w-full bg-[#3E206D] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-lg shadow-lg hover:bg-[#2D1650] active:scale-95 transition-all border-b-4 border-[#250d40] relative z-10"
          >
            Claim
          </button>
        </div>
      </motion.div>
    </div>
  );
}
