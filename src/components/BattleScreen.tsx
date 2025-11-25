"use client";

import Image from "next/image";
import TopBar from "@/components/features/home/TopBar";
import { AppState } from "@/hooks/useGameState";

interface BattleScreenProps {
  onNavigate: (screen: AppState) => void;
}

export default function BattleScreen({ onNavigate }: BattleScreenProps) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-b from-[#2C3E50] to-[#4A6FA5]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[url('/assets/background/home_bg.png')] opacity-20 bg-cover bg-center mix-blend-overlay" />

      <TopBar />

      <div className="flex-1 flex flex-col items-center justify-center z-10 pb-20">
        {/* Title */}
        <h1 className="text-white font-display font-bold text-3xl tracking-[0.2em] mb-8 drop-shadow-lg">
          TARIEN
        </h1>

        {/* Central Map Illustration */}
        <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
          {/* Decorative Ring (CSS or Image) */}
          <div className="absolute inset-0 border-[3px] border-[#D4AF37]/30 rounded-full scale-90" />
          <div className="absolute inset-0 border-[1px] border-[#D4AF37]/20 rounded-full scale-95" />

          {/* Placeholder for Map Asset */}
          <div className="relative w-[80%] h-[80%] animate-pulse-slow">
            <Image
              src="/assets/magic-rune.png" // Using magic-rune as placeholder
              alt="Tarien Map"
              fill
              className="object-contain opacity-90 drop-shadow-[0_0_30px_rgba(100,200,255,0.4)]"
            />
          </div>

          {/* Central Gem Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 rounded-full" />
        </div>

        {/* Quick Match Button */}
        <button
          className="mt-12 bg-white text-[#4A4A4A] font-display font-bold text-lg px-12 py-3 rounded-xl shadow-[0_4px_0_#E5E5E5] active:shadow-none active:translate-y-1 transition-all hover:bg-gray-50 tracking-widest uppercase z-20"
          onClick={() => console.log("Quick Match")}
        >
          Quick Match
        </button>
      </div>

      {/* Spacer for Bottom Nav */}
      <div className="h-24" />
    </div>
  );
}
