"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function Gems() {
  const gems = useSelector((state: RootState) => state.player.gems);

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 relative">
        <Image
          src="/assets/icons/gem.png"
          alt="Diamond"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-[#1a2e2e] font-medium text-lg">
        {gems.toLocaleString()}
      </span>
    </div>
  );
}
