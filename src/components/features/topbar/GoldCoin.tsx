"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function GoldCoin() {
  const gold = useSelector((state: RootState) => state.player.gold);

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 relative">
        <Image
          src="/assets/icons/gold-coin.webp"
          alt="Gold"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-[#1a2e2e] font-medium text-lg">
        {gold.toLocaleString()}
      </span>
    </div>
  );
}
