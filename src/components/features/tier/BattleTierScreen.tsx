"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
// import Image from "next/image"; // Unused if we depend on SingleCard and CSS
import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/store/store"; // Unused
import { TIER_REWARD_GEMS, TIER_REWARD_GOLD } from "@/config/tierConfig";
import {
  selectCanUpgradeTier,
  selectMaxTP,
  selectPlayerTier,
  selectTierThreshold,
  selectTop3Cards,
} from "@/store/selectors";
import { increaseBattleTier } from "@/store/slices/playerSlice";

import Image from "next/image";
import CollectionCard from "../collection/CollectionCard";
import CircleBackground from "./CircleBackground";

/* -------------------------------------------------------------------------- */
/*                                SUBCOMPONENTS                               */
/* -------------------------------------------------------------------------- */

interface TierUpModalProps {
  prevTier: number;
  newTier: number;
  prevLimit: number;
  newLimit: number;
  onCollect: () => void;
}

const TierUpModal = ({
  prevTier,
  newTier,
  prevLimit,
  newLimit,
  onCollect,
}: TierUpModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="w-full max-w-sm bg-[#FFFDF5] rounded-3xl p-6 relative overflow-hidden shadow-2xl border-4 border-[#5C4D32] flex flex-col items-center gap-6"
      >
        {/* Background Particles/Decorations */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,#C5A059_0%,transparent_70%)]" />

        {/* Header */}
        <div className="relative text-center">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-black text-[#4C1D95] uppercase tracking-wider drop-shadow-sm"
          >
            Tier Increased!
          </motion.h2>
          <div className="w-16 h-1 bg-[#C5A059] mx-auto mt-2 rounded-full" />
        </div>

        {/* Shield / Rank Display */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -2, 2, 0],
            filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-40 h-40"
        >
          <Image
            src="/assets/icons/rank-shield.webp"
            alt="New Rank"
            className="w-full h-full object-contain drop-shadow-xl"
            fill
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pb-5">
            <span className="text-white font-black text-xs tracking-[0.2em] uppercase drop-shadow-md">
              Tier
            </span>
            <span className="text-white font-black text-6xl drop-shadow-lg leading-none filter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
              {newTier}
            </span>
          </div>
        </motion.div>

        {/* Rewards Section */}
        <div className="w-full bg-[#F3EAD3] rounded-xl p-3 border-2 border-[#DCCCA3]">
          <h3 className="text-center text-[#8C735D] font-bold text-xs uppercase tracking-widest mb-3">
            Rewards Unlocked
          </h3>
          <div className="flex justify-center gap-4">
            {/* Gems */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-5 h-5 shadow-sm shrink-0 flex items-center justify-center">
                <Image
                  src="/assets/icons/gem.webp"
                  alt="Gem"
                  className="w-5 h-5 object-contain drop-shadow-xl"
                  width={20}
                  height={20}
                />
              </div>
              <span className="font-black text-[#4C1D95] text-lg">
                +{TIER_REWARD_GEMS}
              </span>
              <span className="text-[10px] font-bold text-[#8C735D] uppercase">
                Gems
              </span>
            </motion.div>

            {/* Gold */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.7 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-5 h-5 shadow-sm shrink-0 flex items-center justify-center">
                <Image
                  src="/assets/icons/gold-coin.webp"
                  alt="Gold"
                  className="w-5 h-5 object-contain drop-shadow-xl"
                  width={20}
                  height={20}
                />
              </div>
              <span className="font-black text-[#D97706] text-lg">
                +{TIER_REWARD_GOLD}
              </span>
              <span className="text-[10px] font-bold text-[#8C735D] uppercase">
                Gold
              </span>
            </motion.div>
          </div>
        </div>

        {/* Collect Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCollect}
          className="w-full py-3 bg-[#4C1D95] text-white font-black text-xl uppercase tracking-widest rounded-xl shadow-[0_4px_0_#311b92] active:translate-y-1 active:shadow-none transition-all mt-2"
        >
          Collect
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

interface BattleTierScreenProps {
  onBack: () => void;
}

export default function BattleTierScreen({ onBack }: BattleTierScreenProps) {
  const dispatch = useDispatch();

  const currentTier = useSelector(selectPlayerTier);
  const maxTP = useSelector(selectMaxTP);
  const threshold = useSelector(selectTierThreshold);
  const canUpgrade = useSelector(selectCanUpgradeTier);
  const topCards = useSelector(selectTop3Cards);

  // Animation State
  const [viewState, setViewState] = useState<"MAIN" | "ANIMATING" | "REWARD">(
    "MAIN",
  );
  const [showFlash, setShowFlash] = useState(false);

  // Snapshots for the modal
  const [prevStats, setPrevStats] = useState({ tier: 1, limit: 100 });

  const handleUpgrade = (force: boolean = false) => {
    if (canUpgrade || force) {
      // 1. Snapshot stats
      setPrevStats({
        tier: currentTier,
        limit: threshold,
      });

      // 2. Start Animation Sequence
      setViewState("ANIMATING");

      // Haptic Feedback (if available)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(200);
      }

      // 3. Sequence Timing
      // Magic Circle Charge: 0ms -> 1500ms
      // Flash Start: 1200ms
      setTimeout(() => {
        setShowFlash(true);
      }, 1200);

      // Flash Peak / Dispatch: 1500ms
      setTimeout(() => {
        dispatch(increaseBattleTier());
      }, 1500);

      // Show Reward Modal: 1600ms
      setTimeout(() => {
        setViewState("REWARD");
        setShowFlash(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }, 1600);
    }
  };

  const handleCollect = () => {
    setViewState("MAIN");
  };

  // Calculate Progress
  const progressPercent = Math.min((maxTP / threshold) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full relative flex flex-col font-sans overflow-hidden "
    >
      {/* ================= BACKGROUND LAYERS ================= */}
      {/* Ripple Effect Background when animating */}

      {/* ================= CONTENT LAYER ================= */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center pt-16 pb-32 px-4 no-scrollbar">
          {/* --- TIER EMBLEM SECTION --- */}
          <div className="relative w-72 h-72 flex items-center justify-center shrink-0">
            <div className="absolute inset-0">
              {/* Magic Circle reacts to ANIMATING state using visual charging only */}
              <CircleBackground summonStarted={viewState === "ANIMATING"} />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={
                viewState === "ANIMATING"
                  ? {
                      scale: [1, 1.02, 1.05, 1.1], // Slow growth, no implosion
                      x: [0, -1, 1, -1, 1, -2, 2, -3, 3, -4, 4, 0], // Intensifying Shake
                      opacity: 1,
                      filter: [
                        "brightness(1)",
                        "brightness(1.2)",
                        "brightness(1.5)",
                        "brightness(2.5)",
                      ],
                    }
                  : { scale: 1, opacity: 1, x: 0, filter: "brightness(1)" }
              }
              transition={
                viewState === "ANIMATING"
                  ? {
                      duration: 1.5,
                      ease: "easeInOut",
                      scale: { times: [0, 0.4, 0.7, 1] },
                      filter: { times: [0, 0.4, 0.7, 1] },
                      x: {
                        times: [
                          0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95,
                          1,
                        ],
                      },
                    }
                  : { type: "spring", bounce: 0.4 }
              }
              className="relative z-10 flex flex-col items-center justify-center drop-shadow-2xl translate-y-2 w-full h-full"
            >
              <div className="relative w-[65%] h-[65%]">
                <Image
                  src="/assets/icons/rank-shield.webp"
                  alt="Dragon"
                  className="no-global-filter w-full h-full object-contain "
                  fill
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pb-6">
                  <span
                    className="text-white font-black text-md tracking-[0.2em] uppercase drop-shadow-md mb-0"
                    style={{
                      filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
                    }}
                  >
                    Tier
                  </span>
                  {/* Show PREVIOUS tier during animation, then NEW tier after update */}
                  <span
                    className="text-white font-black text-5xl drop-shadow-lg leading-none filter"
                    style={{
                      filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
                    }}
                  >
                    {viewState === "REWARD"
                      ? currentTier
                      : viewState === "ANIMATING"
                        ? prevStats.tier
                        : currentTier}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- PROGRESS BAR --- */}
          {/* "PROGRESS TO TIER X: 201 / 300" */}
          <div className="w-full max-w-[340px] mb-8 relative group shrink-0">
            {/* Text Label positioned above or on - Design has it inside/on bar usually, mockup shows on bar */}
            <div className="relative bg-[#2d3a2f] h-7 rounded-full border border-[#4a5f4c] shadow-lg overflow-hidden flex items-center px-1">
              {/* Fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-5 rounded-full bg-gradient-to-r from-[#5a8c64] to-[#7dbf89] shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] relative"
              >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-[50%] bg-gradient-to-b from-white/30 to-transparent" />
              </motion.div>

              {/* Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center drop-shadow-md z-10">
                <span
                  className="text-white/90 font-bold text-[10px] sm:text-xs uppercase tracking-wide"
                  style={{
                    filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
                  }}
                >
                  Progress to Tier {currentTier + 1}:{" "}
                  <span className="text-white">
                    {maxTP} / {threshold}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* --- INFO PANELS GRID --- */}
          <div className="w-full max-w-[360px] flex gap-3 h-40 shrink-0">
            {/* LEFT: POWER & CARDS */}
            <div className="flex-[1.4] bg-[#fbf6e9] rounded-xl p-2 border-2 border-[#dccca3] shadow-[0_4px_0_#c5b48e] flex flex-col relative overflow-hidden">
              {/* Header */}
              <div className="text-center mb-2 z-10">
                <h3 className="text-[#5C4D32] font-black text-[9px] uppercase leading-tight tracking-wide">
                  Max Total Power <br /> (Top 3 Cards): {maxTP}
                </h3>
              </div>

              {/* Cards Row */}
              <div className="flex justify-center gap-1.5 mt-auto z-10 items-end pb-1">
                {topCards.map((card, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center w-12 sm:w-14"
                  >
                    <div className="w-full aspect-2/3 relative rounded-sm overflow-hidden">
                      {/* Using the SingleCard but scaled to fit strictly without interactive wrappers */}
                      <div className="absolute inset-0 pointer-events-none">
                        <CollectionCard
                          card={card}
                          onClick={() => {}}
                          hideInfo={true}
                        />
                      </div>
                    </div>
                    {/* Name Truncated */}
                    <span className="text-[6px] sm:text-[7px] font-bold text-[#3e3221] mt-1 text-center leading-tight uppercase w-full line-clamp-2 min-h-[16px]">
                      {card.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: REWARDS */}
            <div className="flex-1 bg-[#fbf6e9] rounded-xl p-2 border-2 border-[#dccca3] shadow-[0_4px_0_#c5b48e] flex flex-col items-center justify-center gap-3 relative">
              <h3 className="text-[#5C4D32] font-black text-[9px] uppercase tracking-wide text-center">
                Rewards:
              </h3>
              <div className="flex flex-col gap-2 w-full px-1">
                {/* Gems */}
                <div className="flex items-center gap-2 bg-[#ece4cf]/50 p-1.5 rounded-lg border border-[#dccca3]/30">
                  <div className="w-5 h-5 shadow-sm shrink-0 flex items-center justify-center">
                    <Image
                      src="/assets/icons/gem.webp"
                      alt="Gem"
                      className="w-5 h-5 object-contain drop-shadow-xl"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[#3e3221] font-black text-xs">
                      {TIER_REWARD_GEMS}
                    </span>
                    <span className="text-[#8C735D] font-bold text-[8px] uppercase">
                      Gems
                    </span>
                  </div>
                </div>
                {/* Gold */}
                <div className="flex items-center gap-2 bg-[#ece4cf]/50 p-1.5 rounded-lg border border-[#dccca3]/30">
                  <div className="w-5 h-5 shadow-sm shrink-0 flex items-center justify-center">
                    <Image
                      src="/assets/icons/gold-coin.webp"
                      alt="Gold"
                      className="w-5 h-5 object-contain drop-shadow-xl"
                      width={20}
                      height={20}
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[#3e3221] font-black text-xs">
                      {TIER_REWARD_GOLD}
                    </span>
                    <span className="text-[#8C735D] font-bold text-[8px] uppercase">
                      Gold
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTON */}
        <AnimatePresence>
          {viewState === "MAIN" && (
            <div className="absolute bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-[#FDF6E3] via-[#FDF6E3] to-transparent z-20 flex flex-col items-center justify-center pb-8 gap-4">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={() => handleUpgrade(false)}
                disabled={!canUpgrade}
                className={`
                        group relative w-full max-w-[320px] py-3.5 rounded-xl font-black text-lg text-white uppercase tracking-[0.1em] shadow-xl
                        transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1
                        ${
                          canUpgrade
                            ? // Gradient Purple to Blueish
                              "bg-gradient-to-b from-[#4C1D95] to-[#312e81] border-[#1e1b4b] shadow-indigo-900/30 hover:brightness-110"
                            : "bg-gray-400 border-gray-600 cursor-not-allowed grayscale opacity-80"
                        }
                    `}
              >
                {/* Button Inner Stroke/Detail */}
                <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none" />
                <span className="drop-shadow-md">Increase Tier</span>
              </motion.button>

              {/* DEMO BUTTON */}
              {/* <button
                onClick={() => handleUpgrade(true)}
                className="text-[10px] text-[#8C735D]/60 hover:text-[#8C735D] uppercase tracking-widest font-bold transition-colors"
              >
                Demo Animation (Force)
              </button> */}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= OVERLAYS ================= */}

      {/* 1. White Flash Overlay */}
      <div
        className={`absolute inset-0 z-40 bg-white transition-opacity duration-300 pointer-events-none ${showFlash ? "opacity-100" : "opacity-0"}`}
      />

      {/* 2. Tier Up Modal */}
      <AnimatePresence>
        {viewState === "REWARD" && (
          <TierUpModal
            prevTier={prevStats.tier}
            newTier={currentTier}
            prevLimit={prevStats.limit}
            newLimit={threshold}
            onCollect={handleCollect}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
