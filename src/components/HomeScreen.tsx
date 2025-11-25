"use client";

import TopBar from "@/components/features/home/TopBar";
import HomeActions from "@/components/features/home/HomeActions";
import Image from "next/image";

interface HomeScreenProps {
  onNavigate: (
    screen: "gacha" | "quests" | "collection" | "battle" | "deck"
  ) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <Image
        src="/assets/background/home_bg3.webp"
        alt="Background"
        fill
        className="object-cover opacity-80"
        priority
      />

      <TopBar />

      {/* Main Actions Area */}
      <div className="flex-1 flex flex-col justify-end pb-24">
        <HomeActions onNavigate={onNavigate} />
      </div>

      {/* Spacer for persistent nav */}
      <div className="relative z-20 px-4 pointer-events-none" />
    </div>
  );
}
