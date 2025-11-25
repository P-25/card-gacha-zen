"use client";

import Image from "next/image";

export default function GoldCoin() {
  return (
    <div className="relative flex items-center bg-[#0F172A]/60 backdrop-blur-md rounded-full border border-white/10 shadow-sm min-w-[120px] cursor-pointer">
      <div className="relative w-8 h-8 -ml-2 shrink-0">
        <Image
          src="/assets/coin.svg"
          alt="Gold"
          fill
          className="object-contain drop-shadow-md"
        />
      </div>
      <span className="flex-1 text-white font-bold font-display tracking-wide text-sm text-right px-2">
        150,000
      </span>
    </div>
  );
}
