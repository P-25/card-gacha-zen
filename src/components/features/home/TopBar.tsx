"use client";

import Gems from "../topbar/Gems";
import GoldCoin from "../topbar/GoldCoin";

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title = "Home" }: TopBarProps) {
  return (
    <div className="z-50 px-4 py-4 flex items-center justify-between bg-transparent pointer-events-none border-b border-[#1a2e2e]/20">
      <h1 className="text-3xl font-bold text-[#1a2e2e] tracking-wide pointer-events-auto uppercase">
        {title}
      </h1>
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* Gold Counter */}
        <GoldCoin />

        {/* Gems Counter */}
        <Gems />
      </div>
    </div>
  );
}
