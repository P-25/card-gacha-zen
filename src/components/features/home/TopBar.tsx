"use client";

import Gems from "../topbar/Gems";
import GoldCoin from "../topbar/GoldCoin";
import Profile from "../topbar/Profile";

export default function TopBar() {
  return (
    <div className="relative z-20 pt-4 px-4 flex justify-between items-center">
      {/* Player Info */}
      <Profile />
      {/* Currencies */}
      <div className="flex items-center gap-4">
        {/* Coin Currency */}
        <GoldCoin />

        {/* Gem Currency */}
        <Gems />
      </div>
    </div>
  );
}
