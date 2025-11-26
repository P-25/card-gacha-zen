"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface GoldSummonSectionProps {
  onSummon: (type: "gem" | "gold", count: number) => void;
  onBannerChange: () => void;
}

export default function GoldSummonSection({
  onSummon,
  onBannerChange,
}: GoldSummonSectionProps) {
  const [crystalState, setCrystalState] = useState("idle");

  const banner = {
    bgClass: "bg-linear-to-b from-[#F6D365] to-[#FDA085]",
    bgGradient: "bg-linear-to-b from-[#D69E2E] to-[#975A16]",
    portalImage: "/assets/summon_gold_game.png",
    currencyIcon: "/assets/coin.svg",
    singlePrice: 100,
    multiPrice: 1000,
    featuredName: null,
    featuredIcon: null,
  };

  const SummonStart = (count: number) => {
    onSummon("gold", count);
  };

  const handleSummonClick = (count: number) => {
    if (crystalState !== "idle") {
      return;
    }
    setCrystalState("charging");
    setTimeout(() => {
      setCrystalState("aftermath");
      setTimeout(() => {
        SummonStart(count);
      }, 500);
    }, 1000);
  };

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
                  src={"/assets/summon_gold_gem.png"}
                  alt="Summon Crystal"
                  className={`${gemPositionClass} w-[18%] cursor-pointer drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]`}
                  initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                  animate={crystalState}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  variants={{
                    idle: {
                      scale: 1,
                      x: "-50%", // Keep horizontal center locked
                      y: ["-50%", "-55%", "-50%"], // Hover up and down relative to center
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
                      y: "-50%", // Keep vertical center locked
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
                  src={"/assets/destroyed_golden_gem.png"}
                  alt="Destroyed Crystal"
                  // Slightly wider (22%) to account for debris spreading out
                  className={`${gemPositionClass} w-[22%] object-contain z-30`}
                  initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: "-50%",
                    x: ["-50%", "-51%", "-49%", "-50%"], // Residual shake
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
          <div className="w-full flex gap-4 z-10">
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
                    priority
                  />
                </div>
                <span className="font-bold text-lg text-[#4A4A4A]">
                  x{banner.singlePrice}
                </span>
              </div>
            </button>
          </div>

          {/* Featured Banner (Bottom) */}
          <div className="mt-6 w-full mx-auto" onClick={onBannerChange}>
            <div className="relative bg-[#4A5568]/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 flex items-center gap-4 overflow-hidden">
              {/* Featured Icon/Image */}
              <div className="relative w-12 h-12 shrink-0">
                {/* Placeholder for spirit image */}
                <div className="absolute inset-0 rounded-full animate-pulse" />
                <Image
                  src={"/assets/summon_rate_gem.png"}
                  alt="Featured"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex-1 z-10 cursor-pointer">
                <span className="block text-[10px] text-purple-200 uppercase tracking-widest font-bold">
                  RATE UP SUMMON
                </span>
                <span className="text-lg text-white font-display font-bold tracking-wide">
                  Use Gems to summon
                </span>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute right-0 top-0 w-24 h-full bg-linear-to-l from-purple-500/20 to-transparent" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
