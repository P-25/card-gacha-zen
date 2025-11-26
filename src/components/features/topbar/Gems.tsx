"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function Gems() {
  const gems = useSelector((state: RootState) => state.player.gems);

  return (
    <div className="relative flex items-center bg-[#0F172A]/60 backdrop-blur-md rounded-full border border-white/10 shadow-sm min-w-[100px] cursor-pointer">
      <div className="relative w-8 h-8 -ml-[10px] shrink-0">
        <Image
          src="/assets/gem3.svg"
          alt="Gems"
          fill
          className="object-contain drop-shadow-md"
          priority
        />
      </div>
      <span className="flex-1 text-white font-bold font-display tracking-wide text-sm text-right px-2">
        {gems.toLocaleString()}
      </span>
    </div>
  );
}
