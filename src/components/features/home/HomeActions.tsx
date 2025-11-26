"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface HomeActionsProps {
  onNavigate: (screen: "gacha" | "battle" | "deck") => void;
}

export default function HomeActions({ onNavigate }: HomeActionsProps) {
  const actions = [
    {
      id: "summon",
      label: "SUMMON",
      icon: "/assets/summon.png",
      onClick: () => onNavigate("gacha"),
      size: "medium", // Side buttons are smaller
    },
    {
      id: "battle",
      label: "BATTLE",
      icon: "/assets/battle.png",
      onClick: () => onNavigate("battle"),
      size: "large", // Center button is larger
    },
    {
      id: "deck",
      label: "DECK",
      icon: "/assets/deck.png",
      onClick: () => onNavigate("deck"),
      size: "medium",
    },
  ] as const;

  return (
    <div className="relative z-10 w-full px-6 pb-8 flex items-end justify-center gap-4">
      {actions.map((action, index) => {
        const isLarge = action.size === "large";
        return (
          <motion.div
            key={action.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
            className={`flex flex-col items-center gap-2 ${
              isLarge ? "-mb-4 z-20" : "z-10"
            }`}
          >
            <motion.button
              onClick={action.onClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden border-4 border-white cursor-pointer ${
                isLarge ? "w-36 h-36" : "w-28 h-28"
              } ${action.id === "battle" ? "mb-6 z-20" : "z-10"}`}
            >
              <div className="relative w-full h-full p-4">
                <Image
                  src={action.icon}
                  alt={action.label}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
}
