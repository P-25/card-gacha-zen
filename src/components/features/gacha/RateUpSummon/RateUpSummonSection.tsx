"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  spendGems,
  addCardToInventory,
  addGold,
} from "@/store/slices/playerSlice";
import { updatePity } from "@/store/slices/pitySlice";
import { performSummon } from "@/lib/gameLogic";
import { Card, Resource } from "@/types/game";
import FloatingParticles from "@/components/summon/FloatingParticles";
import MagicCircle from "./MagicCircle";

interface RateUpSummonSectionProps {
  onSummon: (type: "gem", count: number, results?: (Card | Resource)[]) => void;
}

export default function RateUpSummonSection({
  onSummon,
}: RateUpSummonSectionProps) {
  const [summonState, setSummonState] = useState<
    "idle" | "charging" | "summoning"
  >("idle");
  const dispatch = useDispatch();
  const { gems } = useSelector((state: RootState) => state.player);
  const pityState = useSelector((state: RootState) => state.pity);

  const banner = {
    id: "banner_rate_up",
    singlePrice: 10,
    multiPrice: 100,
  };

  const currentPity = pityState[banner.id] || { pullsSinceLastRare: 0 };
  const pityCount = currentPity.pullsSinceLastRare;
  const maxPity = 90; // Assuming 90 is hard pity
  const pityProgress = Math.min((pityCount / maxPity) * 100, 100);
  const pullsLeft = Math.max(maxPity - pityCount, 0);

  const handleSummonLogic = (count: number) => {
    const cost = count === 1 ? banner.singlePrice : banner.multiPrice;

    if (gems < cost) {
      alert("Not enough Gems!");
      setSummonState("idle");
      return;
    }

    dispatch(spendGems(cost));

    let tempPity = { ...currentPity };
    const results: (Card | Resource)[] = [];

    // Bonus logic for x10 could be added here if needed (e.g. guaranteed SR)
    const actualCount = count === 10 ? 11 : count; // Example: 10 pulls + 1 bonus? User said "1 Bonus!"

    for (let i = 0; i < actualCount; i++) {
      try {
        const { item, newPityState } = performSummon(banner.id, tempPity);
        results.push(item);
        tempPity = newPityState;

        if (item.type === "CARD") {
          dispatch(addCardToInventory(item as Card));
        } else if (item.type === "RESOURCE") {
          dispatch(addGold((item as Resource).value));
        }
      } catch (e) {
        console.error("Summon error:", e);
      }
      dispatch(updatePity({ bannerId: banner.id, pityState: tempPity }));
    }

    onSummon("gem", count, results);
  };

  const handleSummonClick = (count: number) => {
    if (summonState !== "idle") return;

    const cost = count === 1 ? banner.singlePrice : banner.multiPrice;
    if (gems < cost) {
      alert("Not enough Gems!");
      return;
    }

    // Step 1: Input & Fade Out
    setSummonState("charging");

    // Step 2: Charge Up (200ms - 1500ms)
    // We wait for the charge animation
    setTimeout(() => {
      // Step 3: Release (Flash & Shake)
      setSummonState("summoning");

      // Trigger actual logic after the flash covers the screen
      setTimeout(() => {
        handleSummonLogic(count);
        // Reset state will happen when component unmounts or parent changes view
        // But if we stay here, we reset:
        // setSummonState("idle");
      }, 1000);
    }, 2500);
  };

  return (
    <div className="w-full h-full flex flex-col items-center relative overflow-hidden">
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Parallax Clouds */}
        {/* <motion.div
          className="absolute inset-0 opacity-40"
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <img
            src="/assets/watercolor_clouds.png"
            className="w-full h-full object-cover scale-125"
            alt="clouds"
          />
        </motion.div> */}
        <FloatingParticles />
      </div>

      {/* Starburst Light Eruption (Rays) */}
      <motion.div
        id="whiteRayFlash"
        className="absolute left-1/2 top-[20%] z-[100] w-20 h-20 rounded-full pointer-events-none"
        style={{
          x: "-50%",
          y: "-50%",
          background:
            "repeating-conic-gradient(from 0deg, #C5A059 0deg, #FFFFFF 10deg, transparent 10deg, transparent 20deg)",
          boxShadow: "0 0 50px 20px rgba(255, 255, 255, 0.8)",
          mixBlendMode: "screen",
        }}
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{
          scale: summonState === "summoning" ? 30 : 0,
          opacity: summonState === "summoning" ? [0, 1, 0] : 0,
          rotate: summonState === "summoning" ? 180 : 0,
        }}
        transition={{
          duration: summonState === "summoning" ? 2.0 : 0,
          ease: "easeOut",
          times: [0, 0.2, 1],
        }}
      />

      {/* Solid White Flash Overlay (Screen Cover) */}
      <motion.div
        className="absolute inset-0 z-[101] bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: summonState === "summoning" ? 1 : 0,
        }}
        transition={{
          duration: summonState === "summoning" ? 2.0 : 0.5,
          ease: "easeInOut",
          delay: summonState === "summoning" ? 0.5 : 0, // Delay slightly to let rays burst first
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={"content"}
          className="w-full flex flex-col items-center justify-end px-6 gap-4 relative z-20"
          animate={{
            opacity: summonState === "summoning" ? 0 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Central Portal Container */}
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center mb-4">
            <div className="w-full h-full" id="MagicCircle">
              <MagicCircle
                summonStarted={summonState === "idle" ? false : true}
              />
            </div>
            {/* DRAGON OVERLAY */}
            <div className="absolute inset-0 flex items-center left-[20%] z-30 pointer-events-none">
              <motion.div
                className="relative w-[65%] h-[65%]"
                animate={{
                  scale:
                    summonState === "charging" ? [1, 1.2, 0] : [1, 1.03, 1],
                  opacity: summonState === "charging" ? [1, 1, 0] : 1,
                  filter:
                    summonState === "charging"
                      ? ["brightness(1)", "brightness(2)", "brightness(5)"]
                      : "brightness(1) drop-shadow(0 0 0px transparent)",
                  mixBlendMode: "color-dodge",
                }}
                transition={{
                  scale: {
                    duration: summonState === "charging" ? 2.4 : 3,
                    times:
                      summonState === "charging" ? [0, 0.6, 1] : [0, 0.5, 1],
                    repeat: summonState === "charging" ? 0 : Infinity,
                    ease: "easeInOut",
                  },
                  opacity: { duration: 2.4, times: [0, 0.8, 1] },
                  filter: { duration: 2.4, times: [0, 0.5, 1] },
                }}
              >
                <img
                  src="/assets/dragon_silhouette.png"
                  alt="Dragon"
                  className="no-global-filter w-full h-full object-contain "
                />
              </motion.div>
            </div>
          </div>

          {/* PITY COUNTER */}
          <div className="w-full max-w-sm bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative overflow-hidden shadow-xl">
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-center text-[#E6D28F] text-sm">
                <span>Pity Counter</span>
                <span>
                  {pityCount}/{maxPity}
                </span>
              </div>
              <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#C5A059] to-[#FDB931]"
                  initial={{ width: 0 }}
                  animate={{ width: `${pityProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                {/* Pulse if near full */}
                {pityProgress > 80 && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <p className="text-center text-xs text-white/60 mt-1 font-medium tracking-wide">
                Guaranteed{" "}
                <span className="text-[#FDB931] font-bold">EPIC</span> card in{" "}
                {pullsLeft} more summons!
              </p>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 w-full max-w-md mt-2">
            {/* Single Summon */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSummonClick(1)}
              className="flex-1 bg-[#FDF5E6] text-[#2D3748] rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#C5A059] active:border-b-2 active:translate-y-1 transition-all cursor-pointer relative overflow-hidden"
              style={{
                boxShadow:
                  "0 4px 0 #C5A059, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span className="text-lg font-bold tracking-wider">
                SUMMON x1
              </span>
              <span className="text-xs opacity-70 font-medium">
                ({banner.singlePrice} Gems)
              </span>
            </motion.button>

            {/* Multi Summon */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSummonClick(10)}
              className="flex-1 bg-[#6A0DAD] text-white rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#C5A059] active:border-b-2 active:translate-y-1 transition-all relative overflow-hidden group cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #4c2a85 0%, #3a1e69 100%)",
                boxShadow:
                  "0 4px 0 #C5A059, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span className="text-lg font-bold tracking-wider relative z-10">
                SUMMON x10
              </span>
              <span className="text-xs opacity-90 font-medium relative z-10">
                ({banner.multiPrice} Gems - 1 Bonus!)
              </span>

              {/* Sheen Effect */}
              <motion.div
                className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                animate={{ x: ["-200%", "400%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
