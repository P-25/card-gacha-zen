"use client";

import Gems from "../features/topbar/Gems";
import GoldCoin from "../features/topbar/GoldCoin";

interface BackButtonTopBarProps {
  onBack: () => void;
  showCoins?: boolean;
  showGems?: boolean;
  disabled?: boolean;
}

export default function BackButtonTopBar({
  onBack,
  showCoins = false,
  showGems = true,
  disabled = false,
}: BackButtonTopBarProps) {
  return (
    <div className="z-50 px-4 py-4 max-[400px]:py-2 max-[400px]:px-2 flex items-center justify-between bg-transparent pointer-events-none border-b border-[#1a2e2e]/20">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={onBack}
          disabled={disabled}
          className={`px-4 py-2 bg-[#3E206D] text-[#FDB931] font-bold rounded-lg shadow-md active:scale-95 transition-transform text-sm uppercase tracking-wider border border-[#C5A059] ${
            disabled ? "opacity-50 cursor-not-allowed grayscale" : ""
          }`}
        >
          Back
        </button>
      </div>
      <div className="flex items-center gap-4 pointer-events-auto">
        {showCoins && <GoldCoin />}
        {showGems && <Gems />}
      </div>
    </div>
  );
}
