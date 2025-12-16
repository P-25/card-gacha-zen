"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import MenuButton from "./MenuButton";

interface HomeActionsProps {
  onNavigate: (screen: "gacha" | "battle" | "deck") => void;
}

export default function HomeActions({ onNavigate }: HomeActionsProps) {
  const actions = [
    {
      id: "summon",
      label: "SUMMON",
      subtitle: "(Draw Cards)",
      icon: "/assets/icons/tornado.webp",
      onClick: () => onNavigate("gacha"),
    },
    {
      id: "battle",
      label: "BATTLE",
      subtitle: "(Matchmake)",
      icon: "/assets/icons/sword.webp",
      onClick: () => onNavigate("battle"),
    },
  ] as const;

  return (
    <div className="relative z-10 w-full px-6 pb-8 flex items-end justify-center gap-4">
      {actions.map((action, index) => {
        return (
          <motion.div
            key={action.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
            className={`flex flex-col items-center gap-2 z-10`}
          >
            <MenuButton
              title={action.label}
              subtitle={action.subtitle}
              iconSrc={action.icon}
              onClick={action.onClick}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
