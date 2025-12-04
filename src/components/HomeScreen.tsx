"use client";

import TopBar from "@/components/features/home/TopBar";
import HomeActions from "@/components/features/home/HomeActions";
import HomeBanner from "./features/home/HomeBanner";

interface HomeScreenProps {
  onNavigate: (
    screen: "gacha" | "quests" | "collection" | "battle" | "deck"
  ) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <TopBar title="Home" />
      <HomeBanner />
      {/* Main Actions Area */}
      <div className="flex-1 flex flex-col justify-end pb-24">
        <HomeActions onNavigate={onNavigate} />
      </div>

      {/* Spacer for persistent nav */}
      <div className="relative z-20 px-4 pointer-events-none" />
    </div>
  );
}
