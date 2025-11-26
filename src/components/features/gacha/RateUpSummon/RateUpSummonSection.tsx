"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
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
  const [crystalState, setCrystalState] = useState("idle");
  const dispatch = useDispatch();
  const { gems } = useSelector((state: RootState) => state.player);
  const pityState = useSelector((state: RootState) => state.pity);

  const banner = {
    id: "banner_rate_up",
    bgClass: "bg-linear-to-b from-[#8E9EAB] to-[#eef2f3]",
    bgGradient: "bg-linear-to-b from-[#4A5568] to-[#2D3748]",
    portalImage: "/assets/summon_rate_gate.png",
    currencyIcon: "/assets/gem3.svg",
    singlePrice: 10,
    multiPrice: 100,
    featuredName: "Lunar Spirit",
    featuredIcon: "/assets/summon_rate_gem.png",
  };

  const handleSummonLogic = (count: number) => {
    const cost = count * banner.singlePrice;

    if (gems < cost) {
      alert("Not enough Gems!");
      setCrystalState("idle");
      return;
    }

    dispatch(spendGems(cost));

    const currentPity = pityState[banner.id] || { pullsSinceLastRare: 0 };
    let tempPity = { ...currentPity };

    const results: (Card | Resource)[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const { item, newPityState } = performSummon(banner.id, tempPity);

        console.log(`Debug - item`, item);
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

      console.log("Summon Results:", results);
      // Here you would typically trigger the reveal screen with 'results'
      onSummon("gem", count, results);
    }
  };

  const handleSummonClick = (count: number) => {
    if (crystalState !== "idle") {
      return;
    }

    const cost = count * banner.singlePrice;
    if (gems < cost) {
      alert("Not enough Gems!");
      return;
    }

    setCrystalState("charging");
    setTimeout(() => {
      setCrystalState("aftermath");
      setTimeout(() => {
        handleSummonLogic(count);
        // setCrystalState("idle"); // Reset for now, usually handled by changing view
      }, 500);
    }, 1000);
  };

  // Shared positioning: Center horizontal (left-1/2), slightly below vertical center (top-[47%])
  const gemPositionClass = "absolute left-1/2 top-[50%] z-20";

  return (
    <div
      className={`w-full h-full flex flex-col items-center relative overflow-hidden transition-colors duration-500`}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Top Title */}
      <div className="w-full text-center mt-10">
        <h1 className="text-3xl font-display font-bold text-white tracking-widest drop-shadow-md">
          SUMMON
        </h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={"gold"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full h-full flex flex-col items-start justify-start pt-10 pb-4 px-6"
        >
          {/* Central Portal Image */}
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center mb-4">
            <div className="relative w-[110%] h-[110%]">
              <motion.img
                src={banner.portalImage}
                alt="Summon Gate"
                className="object-contain drop-shadow-2xl w-full h-full"
                initial={{ opacity: 1, scale: 1 }}
              />

              {/* ALIVE CRYSTAL */}
              {crystalState !== "aftermath" && (
                <motion.img
                  key="crystal-full"
                  src={"/assets/summon_rate_gem.png"}
                  alt="Summon Crystal"
                  // Using w-[18%] to scale with container
                  className={`${gemPositionClass} w-[18%] cursor-pointer drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]`}
                  // Center the element on the anchor point (-50%, -50%)
                  initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                  animate={crystalState}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  variants={{
                    idle: {
                      scale: 1,
                      x: "-50%",
                      y: ["-50%", "-55%", "-50%"], // Hover up/down relative to center
                      filter: "brightness(1)",
                      transition: {
                        y: {
                          repeat: Infinity,
                          duration: 4,
                          ease: "easeInOut",
                        },
                      },
                    },
                    charging: {
                      scale: 1,
                      y: "-50%",
                      x: ["-50%", "-52%", "-48%", "-50%"], // Shake left/right relative to center
                      filter: "brightness(1.2)",
                      transition: { duration: 0.8, ease: "linear" },
                    },
                  }}
                />
              )}

              {/* DESTROYED CRYSTAL */}
              {crystalState === "aftermath" && (
                <motion.img
                  key="crystal-destroyed"
                  src={"/assets/destroyed_rate_gem.png"}
                  alt="Destroyed Crystal"
                  // Using w-[32%] because your original code had this image much larger (140px vs 75px)
                  className={`${gemPositionClass} w-[32%] object-contain z-30`}
                  initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: "-50%",
                    x: ["-50%", "-51%", "-49%", "-50%"],
                    filter: "brightness(1.2)",
                  }}
                  exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  transition={{
                    scale: { duration: 3, ease: "easeOut" },
                    x: { duration: 0.5 },
                  }}
                />
              )}
            </div>
          </div>

          {/* Summon Buttons */}
          <div className="w-full flex gap-4 z-10 mt-4">
            {/* Single Summon */}
            <button
              onClick={() => handleSummonClick(1)}
              className="flex-1 bg-white rounded-xl py-3 px-2 shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center border-2 border-white/50 cursor-pointer"
            >
              <span className="text-xs font-bold text-[#4A4A4A] tracking-wider uppercase mb-1">
                SINGLE SUMMON
              </span>
              <div className="flex items-center gap-1.5">
                <div className="relative w-5 h-5">
                  <Image
                    src={banner.currencyIcon}
                    alt="Currency"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold text-lg text-[#4A4A4A]">
                  x{banner.singlePrice}
                </span>
              </div>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
