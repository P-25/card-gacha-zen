"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
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
import SummoningRitual from "./SummonCircle";
import CardsCarousel from "./CardsCarousel";
import MagicCircle from "./MagicCircle";

interface RateUpSummonSectionProps {
  onSummon: (
    type: "gem" | "gold",
    count: number,
    results?: (Card | Resource)[]
  ) => void;
  onBannerChange: () => void;
}

export default function RateUpSummonSection({
  onSummon,
  onBannerChange,
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

  const controls = useAnimation();

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

  useEffect(() => {
    console.log(`Debug - summonState`, summonState);
  }, [summonState]);

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

      {/* WHITE FLASH OVERLAY - Radial Expansion */}
      <motion.div
        className="absolute left-1/2 top-1/2 bg-white rounded-full z-[100] pointer-events-none"
        style={{ x: "-50%", y: "-50%" }}
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{
          width: summonState === "summoning" ? "200vmax" : 0,
          height: summonState === "summoning" ? "200vmax" : 0,
          opacity: summonState === "summoning" ? 1 : 0,
        }}
        transition={{
          duration: summonState === "summoning" ? 0.4 : 0.5,
          ease: "easeOut",
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
          <div className="w-full max-w-sm bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 relative overflow-hidden">
            <div className="flex flex-col gap-1 relative z-10">
              <div className="flex justify-between items-center text-[#E6D28F] font-serif text-sm">
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
              <p className="text-center text-xs text-white/80 mt-1 font-light">
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
              className="flex-1 bg-[#F5F5F0] text-[#2D3748] rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-b-4 border-[#D1D1D1] active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
            >
              <span className="text-lg font-serif font-bold tracking-wider">
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
              className="flex-1 bg-[#4A6fa5] text-white rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-b-4 border-[#2c4a70] active:border-b-0 active:translate-y-1 transition-all relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #556B2F 0%, #3d4d22 100%)",
              }} // Greenish tone from screenshot
            >
              <span className="text-lg font-serif font-bold tracking-wider relative z-10">
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
