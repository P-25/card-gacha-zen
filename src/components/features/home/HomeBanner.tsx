"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import MenuButton from "./MenuButton";

interface HomeBannerProps {
  onNavigate?: (screen: "gacha" | "battle" | "deck") => void;
}

export default function HomeBanner({ onNavigate }: HomeBannerProps) {
  return (
    <div className="w-full px-4">
      <div className="relative aspect-2/1 mt-4 mb-8 rounded-3xl overflow-hidden shadow-lg group">
        <Image
          src="/assets/banner/banner_dragon.png"
          alt="Season 1: Dragon's Wake"
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent flex flex-col justify-center px-6">
          <span className="text-white/90 text-sm font-medium tracking-widest uppercase mb-1">
            Season 1:
          </span>
          <h2 className="text-white text-2xl font-bold drop-shadow-md">
            DRAGON&apos;S WAKE
          </h2>
        </div>
      </div>
    </div>
  );
}
