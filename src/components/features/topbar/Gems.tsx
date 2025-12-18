"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function Gems() {
  const gems = useSelector((state: RootState) => state.player.gems);

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 relative max-[400px]:w-5 max-[400px]:h-5">
        <Image
          src="/assets/icons/gem.webp"
          alt="Diamond"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-[#1a2e2e] font-medium text-lg max-[400px]:text-sm">
        {gems.toLocaleString()}
      </span>
    </div>
  );
}
