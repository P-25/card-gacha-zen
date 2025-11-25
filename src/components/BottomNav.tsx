"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface BottomNavProps {
  activeTab: "home" | "collection" | "shop" | "social" | "quests" | string;
  onNavigate: (
    tab: "home" | "collection" | "shop" | "social" | "quests"
  ) => void;
}

export default function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  const navItems = [
    {
      id: "home",
      label: "HOME",
      icon: "/assets/home.svg",
    },
    {
      id: "collection",
      label: "COLLECTION",
      icon: "/assets/cards.svg",
    },
    {
      id: "shop",
      label: "SHOP",
      icon: "/assets/store2.svg",
    },
    {
      id: "social",
      label: "SOCIAL",
      icon: "/assets/social.svg",
    },
    {
      id: "quests",
      label: "QUESTS",
      icon: "/assets/sword.svg", // Using existing quest icon
    },
  ] as const;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50">
      {/* Background Bar */}
      <div className="relative h-20 bg-[#F8E6D5] flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => onNavigate(item.id as any)}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-1 cursor-pointer"
            >
              <div
                className={`relative w-8 h-8 transition-all duration-300 ${
                  isActive ? "scale-110" : "opacity-50 grayscale"
                }`}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  fill
                  className="object-contain"
                />
              </div>

              <span
                className={`text-[10px] font-bold tracking-widest transition-colors duration-300 ${
                  isActive ? "text-[#4A4A4A]" : "text-[#8C8C8C]"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-0 w-8 h-1 bg-[#4A4A4A] rounded-t-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
