"use client";

import {
  generateRandomPlayerName,
  getRarityBorderColor,
  getStrokeImage,
} from "@/lib/rarityStyles";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSelector } from "react-redux";
import Profile from "../features/topbar/Profile";
import { useEffect } from "react";
import { PlayerState } from "@/store/slices/playerSlice";

import profileIcons from "../../config/profileIcons.json";

interface VersusPhaseProps {
  playerDeck: Card[];
  opponentInfo: PlayerState;
  opponentDeck: Card[];
  onComplete: () => void;
}

export default function VersusPhase({
  playerDeck,
  opponentInfo,
  opponentDeck,
  onComplete,
}: VersusPhaseProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const { name } = useSelector((state: RootState) => state.player);

  const opponentIcon =
    profileIcons.find((icon) => icon.id === opponentInfo.activeProfilePicId) ||
    profileIcons[0];

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {/* Mobile Container */}
      <div className="relative w-full h-full shadow-2xl overflow-hidden flex flex-col">
        {/* --- SHAKE WRAPPER --- */}
        {/* The entire world shakes when the badge hits. 
                We animate x/y slightly at 1.0s (when the badge lands) */}
        <motion.div
          className="absolute inset-0 z-0 w-full h-full"
          animate={{
            x: [0, -5, 5, -5, 5, 0],
            y: [0, 5, -5, 5, -5, 0],
          }}
          transition={{
            delay: 1.0, // Matches the badge impact time (0.8 delay + ~0.2s travel)
            duration: 0.4,
            ease: "easeInOut",
          }}
        >
          {/* --- BACKGROUNDS --- */}

          {/* Player 2 Background */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="absolute inset-0 z-10 bg-[#E8D6CA]/60"
            style={{ clipPath: "polygon(80% 0, 100% 0, 100% 100%, 20% 100%)" }}
          >
            <div className="absolute inset-0 opacity-60 bg-[#E8D6CA]/60"></div>
          </motion.div>

          {/* Divider Line */}
          <svg className="absolute inset-0 z-20 pointer-events-none w-full h-full">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  style={{ stopColor: "transparent", stopOpacity: 0 }}
                />
                <stop
                  offset="50%"
                  style={{ stopColor: "#2C4A42", stopOpacity: 0.5 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "transparent", stopOpacity: 0 }}
                />
              </linearGradient>
            </defs>
            <motion.line
              x1="80%"
              y1="0%"
              x2="20%"
              y2="100%"
              stroke="url(#grad1)"
              strokeWidth="3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            />
          </svg>

          {/* --- CONTENT LAYERS --- */}

          {/* Player 1 Content */}
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-start pointer-events-none">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-1 max-w-[60%]"
            >
              <Profile onClick={() => console.log(`profile clicked`)} />
              <h3 className="uppercase font-bold text-[#2D3748] text-lg">
                {name}
              </h3>
              {/* Tiny Deck Preview */}
              <div className="flex gap-1">
                {playerDeck.map((card, i) => {
                  const borderColor = getRarityBorderColor(card.rarity);
                  return (
                    <div
                      key={i}
                      className="w-18 h-24 bg-white/60 rounded overflow-hidden relative"
                      style={{
                        boxShadow: `inset 0 0 0 4px ${borderColor}`,
                      }}
                    >
                      <div className="absolute inset-0 z-0 opacity-80 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 flex items-center justify-center">
                        <div className="relative w-full h-full scale-[1.1] opacity-60">
                          <Image
                            src={getStrokeImage(card.rarity)}
                            alt="brush stroke"
                            fill
                            className="object-contain no-global-filter"
                            sizes="(max-width: 768px) 50vw, 300px"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                        <Image
                          src={card.image}
                          alt={card.name}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          loading="lazy"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Player 2 Content */}
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end items-end pointer-events-none">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-2 items-end max-w-[60%]"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8FA89B] to-[#7A9286] border-2 border-white flex items-center justify-center shadow-md cursor-pointer overflow-hidden relative">
                <Image
                  src={opponentIcon.imagePath}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="uppercase font-bold text-[#2D3748] text-lg ">
                {opponentInfo.name}
              </h3>

              {/* Tiny Deck Preview */}
              <div className="flex gap-1">
                {opponentDeck.map((card, i) => {
                  const borderColor = getRarityBorderColor(card.rarity);
                  return (
                    <div
                      key={i}
                      className="w-18 h-24 bg-white/60 rounded overflow-hidden relative"
                      style={{
                        boxShadow: `inset 0 0 0 4px ${borderColor}`,
                      }}
                    >
                      <div className="absolute inset-0 z-0 opacity-80 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 flex items-center justify-center">
                        <div className="relative w-full h-full scale-[1.1] opacity-60">
                          <Image
                            src={getStrokeImage(card.rarity)}
                            alt="brush stroke"
                            fill
                            className="object-contain no-global-filter"
                            sizes="(max-width: 768px) 50vw, 300px"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                        <Image
                          src={"/assets/icons/battle.webp"}
                          alt={"Card-info"}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          loading="lazy"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* --- CENTER BADGE OVERLAY --- */}
        {/* Outside the shake container to act as the "anchor" that slams down */}
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <VersusBadge />
        </div>
      </div>
    </div>
  );
}

const VersusBadge = () => (
  <motion.div
    // "Camera Side" Animation
    // Starts HUGE (scale: 10) and invisible, simulating it being behind the camera/viewer
    initial={{ scale: 10, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{
      delay: 0.8,
      duration: 0.3,
      ease: "easeIn", // Accelerates into the slam
    }}
    className="relative z-30 pointer-events-auto"
  >
    <div className="relative w-[180px] h-[100px] scale-[1.1]">
      <div className="relative w-full h-full">
        <Image
          src={getStrokeImage("rare")}
          alt="brush stroke"
          fill
          className="no-global-filter"
        />
      </div>
      <div className="absolute inset-1 z-10 flex items-center justify-center">
        <h2
          className="text-4xl font-black tracking-widest skew-x-[12deg] text-center mt-[-10px]"
          style={{ fontFamily: "serif" }}
        >
          V
        </h2>
        <h2
          className="text-4xl font-black tracking-widest skew-x-[-12deg] text-center ml-[-10px]"
          style={{ fontFamily: "serif" }}
        >
          S
        </h2>
      </div>
    </div>

    {/* The Box */}
  </motion.div>
);
