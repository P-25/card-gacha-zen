"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/types/game";
import Image from "next/image";

interface VersusPhaseProps {
  playerDeck: Card[];
  opponentDeck: Card[];
  onComplete: () => void;
}

const PLAYER_DECK_MOCK: Card[] = [
  {
    id: "rare_card_003",
    name: "Chrono Sent",
    type: "CARD",
    rarity: "RARE",
    setName: "Light",
    setId: "L01",
    level: 1,
    releaseDate: "2025-12-08",
    description:
      "Fractured across time after failing their own reality, they exist in all moments. They foresee attacks to save this timeline from the same fate.",
    hp: 30,
    atk: 20,
    image: "/assets/Card_Art/rare/card_003.webp",
    experience: 0,
    design_type: "Eternal",
    backgroundColor: "#3CA692",
    textColor: "#F2F2F2",
    tp: 50,
    instanceId: "df22jk68d",
  },
  {
    id: "uncommon_card_007",
    name: "Bone Weaver",
    type: "CARD",
    rarity: "UNCOMMON",
    setName: "Dark",
    setId: "D01",
    level: 1,
    releaseDate: "2025-12-08",
    description:
      "A polite exile who treats skeletons as unpaid interns, not monsters. They seek the Ivory Tome to turn death into art.",
    hp: 12,
    atk: 18,
    image: "/assets/Card_Art/uncommon/card_007.webp",
    experience: 0,
    design_type: "Eternal",
    backgroundColor: "#192625",
    textColor: "#F2F2F2",
    tp: 30,
    instanceId: "zhmg09j52",
  },
  {
    id: "uncommon_card_003",
    name: "Sky Lance",
    type: "CARD",
    rarity: "UNCOMMON",
    setName: "Wind",
    setId: "W02",
    level: 1,
    releaseDate: "2025-12-08",
    description:
      "Forbidden from touching the ground, they hover to deliver messages. Arrogant and fast, they claim to outrun storms with their lightning spear.",
    hp: 12,
    atk: 18,
    image: "/assets/Card_Art/uncommon/card_003.webp",
    experience: 0,
    design_type: "Eternal",
    backgroundColor: "#3C5E73",
    textColor: "#F2F2F2",
    tp: 30,
    instanceId: "vkqs5ww0q",
  },
];

const OPPONENT_DECK_MOCK: Card[] = [
  {
    id: "uncommon_card_001",
    name: "Spore Chem",
    type: "CARD",
    rarity: "UNCOMMON",
    setName: "Earth",
    setId: "E01",
    level: 1,
    releaseDate: "2025-12-08",
    description:
      "Immune to toxins, they believe dosage defines the poison. They hunt dragon spores to brew the legendary Elixir of Silence.",
    hp: 12,
    atk: 18,
    image: "/assets/Card_Art/uncommon/card_001.webp",
    experience: 0,
    design_type: "Eternal",
    backgroundColor: "#9249A6",
    textColor: "#F2F2F2",
  },
  {
    id: "common_card_003",
    name: "Silent Fist",
    type: "CARD",
    rarity: "COMMON",
    setName: "Earth",
    setId: "E01",
    level: 1,
    releaseDate: "2025-12-08",
    description:
      "A silent warrior monk who rejects weapons to channel magic through their fists. They wander on a pilgrimage to defeat a thousand foes in unarmed combat.",
    hp: 8,
    atk: 12,
    image: "/assets/Card_Art/common/card_003.webp",
    experience: 0,
    design_type: "Eternal",
    backgroundColor: "#9A6E4B",
    textColor: "#BF5A36",
  },
  {
    id: "common_card_004",
    name: "Mech Butler",
    type: "CARD",
    rarity: "COMMON",
    setName: "Earth",
    setId: "E01",
    level: 1,
    releaseDate: "2025-12-08",
    description:
      "A loyal construct serving a deceased inventor, maintaining a memory of a lost mansion. It saves the world to ensure its master's grave remains clean.",
    hp: 12,
    atk: 8,
    image: "/assets/Card_Art/common/card_004.webp",
    experience: 0,
    design_type: "Eternal",
    backgroundColor: "#734434",
    textColor: "#F2F2F2",
  },
];

export default function VersusPhase({
  playerDeck,
  opponentDeck,
  onComplete,
}: VersusPhaseProps) {
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     onComplete();
  //   }, 3000);
  //   return () => clearTimeout(timer);
  // }, [onComplete]);
  playerDeck = PLAYER_DECK_MOCK;
  opponentDeck = OPPONENT_DECK_MOCK;

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      id="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    >
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
            style={{ clipPath: "polygon(70% 0, 100% 0, 100% 100%, 30% 100%)" }}
          >
            <div className="absolute inset-0 opacity-60 bg-[#E8D6CA]/60"></div>
          </motion.div>

          {/* Divider Line */}
          {/* <svg className="absolute inset-0 z-20 pointer-events-none w-full h-full">
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
              x1="70%"
              y1="0%"
              x2="30%"
              y2="100%"
              stroke="url(#grad1)"
              strokeWidth="3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            />
          </svg> */}

          {/* --- CONTENT LAYERS --- */}

          {/* Player 1 Content */}
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-start pointer-events-none">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-6 max-w-[60%]"
            >
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute top-20 left-4 flex flex-col"
              >
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 mb-2">
                    {/* Avatar Placeholder */}
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                      P
                    </div>
                  </div>
                  <h3 className="font-bold text-[#2D3748] text-lg px-4 py-1">
                    YOU
                  </h3>
                </div>
                {/* Tiny Deck Preview */}
                <div
                  className="flex gap-1 mt-2"
                  id="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                >
                  {playerDeck.map((card, i) => (
                    <div
                      key={i}
                      className="w-24 h-32 bg-gray-800 rounded border border-white/50 overflow-hidden relative"
                    >
                      <Image
                        src={card.image}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
              {/* <UserAvatar
                name="CloudWalker"
                role="Spirit Sage"
                side="p1"
                icon={Cloud}
              />
              <div className="flex gap-3 mt-4 pl-2 pointer-events-auto">
                <GameCard type="mage" delay={1.0} side="p1" />
                <GameCard type="warrior" delay={1.1} side="p1" />
                <GameCard type="rogue" delay={1.2} side="p1" />
              </div> */}
            </motion.div>
          </div>

          {/* Player 2 Content */}
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end items-end pointer-events-none">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-6 items-end max-w-[60%]"
            >
              AAAAAAAAAAAAAAAAAAA
              {/* <div className="flex gap-3 mb-4 pr-2 pointer-events-auto">
                <GameCard type="tank" delay={1.3} side="p2" />
                <GameCard type="warrior" delay={1.4} side="p2" />
                <GameCard type="mage" delay={1.5} side="p2" />
              </div>
              <UserAvatar
                name="IronMountain"
                role="Abyss Guard"
                side="p2"
                icon={Mountain}
              /> */}
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
    className="z-30 pointer-events-auto"
  >
    {/* Ink Splash Effect behind VS */}
    {/* <div className="absolute inset-0 bg-[#2C4A42] blur-lg opacity-40 scale-150 rounded-full animate-pulse" /> */}

    {/* The Box */}
    <div className="relative bg-[#F4F7F4] text-[#2C4A42] px-8 py-3 rounded-sm shadow-xl border-2 border-[#2C4A42] transform skew-x-[-12deg] flex items-center justify-center">
      <h1
        className="text-4xl font-black tracking-widest skew-x-[12deg] text-center w-full"
        style={{ fontFamily: "serif" }}
      >
        VS
      </h1>
    </div>
  </motion.div>
);
