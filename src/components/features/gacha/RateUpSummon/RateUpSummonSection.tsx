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
import CosmicButton from "@/components/summon/CosmicButton";
import FloatingParticles from "@/components/summon/FloatingParticles";
import ExplosionParticles from "@/components/summon/ExplosionParticles";

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
      }, 700);
    }, 1000);
  };

  // Shared positioning: Center horizontal (left-1/2), slightly below vertical center (top-[47%])
  const gemPositionClass = "absolute left-1/2 top-[50%] z-20";

  return (
    <div className="w-full h-full flex flex-col items-center relative overflow-hidden">
      <FloatingParticles />

      {/* Top Title - Fixed at Top */}
      <div className="w-full text-center mt-12 relative z-30 shrink-0">
        <h1 className="text-3xl font-display font-bold text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          SUMMON
        </h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={"content"}
          // --- UPDATED LAYOUT CLASSES ---
          // flex-1: Takes up all available vertical space
          // justify-end: Pushes everything inside to the bottom
          // pb-24: Adds padding at bottom so it doesn't hit the tab bar/screen edge
          className="w-full flex-1 flex flex-col items-center justify-end mb-[180px] px-6 gap-6 relative z-20"
        >
          {/* Central Portal Container */}
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
            <div className="relative w-[100%] h-[100%] flex justify-center items-center">
              {/* --- REFLECTION --- */}
              <div
                className="absolute top-[80%] left-0 w-full h-full z-0 pointer-events-none opacity-40"
                style={{
                  transform: "scaleY(-1)",
                  maskImage:
                    "linear-gradient(to bottom, transparent 20%, black 80%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 20%, black 80%)",
                }}
              >
                <motion.img
                  src={banner.portalImage}
                  alt="Reflection"
                  className="w-full h-full object-contain"
                  initial={{ opacity: 1, scale: 1 }}
                />
              </div>

              {/* 1. THE HARD GROUND SHADOW (Your requested fix) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 z-0"
                style={{
                  bottom: "-3%",
                  width: "90%",
                  height: "75px",
                  background:
                    "radial-gradient(rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0) 70%)",
                  opacity: 0.8,
                }}
              />

              {/* Main Portal Image */}
              <motion.img
                src={banner.portalImage}
                alt="Summon Gate"
                className="object-contain w-full h-full relative z-10 drop-shadow-[0_25px_8px_rgba(0,0,0,0.9)]"
                initial={{ opacity: 1, scale: 1 }}
              />

              <div
                className="absolute left-1/2 -translate-x-1/2 z-0"
                style={{
                  bottom: "17%",
                  width: "15%",
                  height: "10px",
                  background:
                    "radial-gradient(rgb(0, 0, 0) 4%, rgba(0, 0, 0, 0) 70%)",
                  opacity: 0.8,
                  zIndex: 50,
                }}
              />
              {/* CRYSTAL LOGIC */}
              {crystalState !== "aftermath" && (
                <motion.img
                  key="crystal-full"
                  src={"/assets/summon_rate_gem.png"}
                  alt="Summon Crystal"
                  className="absolute left-1/2 top-[50%] z-20 w-[18%] cursor-pointer drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]"
                  initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                  animate={crystalState}
                  variants={{
                    idle: {
                      y: ["-50%", "-55%", "-50%"],
                      filter: "brightness(1)",
                      transition: {
                        y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                      },
                    },
                    charging: {
                      y: "-50%",
                      x: ["-50%", "-52%", "-48%", "-50%"],
                      filter: "brightness(1.5)",
                      transition: { duration: 0.8 },
                    },
                  }}
                />
              )}

              {/* DESTROYED CRYSTAL */}
              {crystalState === "aftermath" && (
                <>
                  <ExplosionParticles color="#99FFFF" />
                  <motion.img
                    key="crystal-destroyed"
                    src={"/assets/destroyed_rate_gem.png"}
                    alt="Destroyed Crystal"
                    className="absolute left-1/2 top-[50%] z-30 w-[32%] object-contain"
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
                </>
              )}
            </div>
          </div>

          <div className="w-full flex justify-center z-30">
            <CosmicButton onClick={() => handleSummonClick(1)} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
