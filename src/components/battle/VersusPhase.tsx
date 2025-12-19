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
              className="flex flex-col gap-1 max-w-[80%]"
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
                      className="w-1/3 aspect-2/3 relative"
                      key={`${card.id}-${i}`}
                    >
                      {/* Background Effect */}
                      <div className="absolute inset-0 z-0 opacity-80 flex items-center justify-center">
                        <div className="relative w-full h-full scale-[1.2] opacity-60">
                          <Image
                            src={getStrokeImage(card.rarity)}
                            alt="brush stroke"
                            fill
                            className="object-contain no-global-filter"
                          />
                        </div>
                      </div>

                      {/* Card Image */}
                      <div className="absolute inset-1 z-10 rounded-lg overflow-hidden scale-[0.9]">
                        <Image
                          src={card.image}
                          alt={card.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Level Badge */}
                      <div className="absolute top-0.5 left-0.5 bg-black/60 backdrop-blur-md text-white text-[6px] font-bold px-1 py-1 rounded-br-lg z-20 border-r border-b border-white/10">
                        Lv.{card.level}
                      </div>

                      {/* Stats Footer */}
                      <div className="flex justify-between z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F5EEDF] via-[#F5EEDF] to-[#F5EEDF]/80 px-1 pb-2 pt-1 divide-x divide-gray-400">
                        <div className="w-full flex flex-col items-center justify-center text-sm max-[400px]:text-xs">
                          <span className="uppercase text-[6px]">POW</span>
                          <span>{card.state.pow}</span>
                        </div>
                        <div className="w-full flex flex-col items-center justify-center text-sm max-[400px]:text-xs">
                          <span className="uppercase text-[6px]">SPD</span>
                          <span>{card.state.spd}</span>
                        </div>
                        <div className="w-full flex flex-col items-center justify-center text-sm max-[400px]:text-xs">
                          <span className="uppercase text-[6px]">DEF</span>
                          <span>{card.state.def}</span>
                        </div>
                      </div>

                      {/* Rarity Border */}
                      <div
                        className="absolute inset-0 z-30 pointer-events-none rounded-md"
                        style={{ boxShadow: `inset 0 0 0 4px ${borderColor}` }}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Player 2 Content */}
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end items-end pointer-events-none">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-1 w-full max-w-[80%] items-end"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8FA89B] to-[#7A9286] border-2 border-white flex items-center justify-center shadow-md cursor-pointer overflow-hidden relative">
                <Image
                  src={opponentIcon.imagePath}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="uppercase font-bold text-[#2D3748] text-lg">
                {opponentInfo.name}
              </h3>
              {/* Tiny Deck Preview */}
              <div className="flex gap-1 w-full">
                {opponentDeck.map((card, i) => {
                  const borderColor = getRarityBorderColor(card.rarity);
                  return (
                    <div
                      className="w-1/3 aspect-2/3 relative"
                      key={`${card.id}-${i}`}
                    >
                      <Image
                        src={"./assets/Card_Art/back/card_001.webp"}
                        alt={card.name}
                        fill
                        className="object-cover"
                      />
                      {/* Rarity Border */}
                      <div
                        className="absolute inset-0 z-30 pointer-events-none rounded-md"
                        style={{ boxShadow: `inset 0 0 0 4px ${borderColor}` }}
                      />
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
      <div className="absolute inset-1 z-10 flex items-center justify-center ml-[4px]">
        <h2 className="text-[#E7DBD1] text-5xl font-black tracking-widest skew-x-[-6deg] text-center mt-[-10px]">
          V
        </h2>
        <h2 className="text-[#F9F8EB] text-5xl font-black tracking-widest skew-x-[-14deg] text-center ml-[-5px]">
          S
        </h2>
      </div>
    </div>

    {/* The Box */}
  </motion.div>
);
