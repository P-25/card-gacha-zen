"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import ProfileModal from "../profile/ProfileModal";
import Gems from "../topbar/Gems";
import GoldCoin from "../topbar/GoldCoin";
import Profile from "../topbar/Profile";
import { Shield, ArrowUpCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { selectPlayerTier, selectCanUpgradeTier } from "@/store/selectors";

interface TopBarProps {
  title?: string;
  onNavigate?: (screen: any) => void;
}

export default function TopBar({ title = "Home", onNavigate }: TopBarProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const currentTier = useSelector(selectPlayerTier);
  const canUpgrade = useSelector(selectCanUpgradeTier);

  return (
    <>
      <div className="z-50 px-4 py-4 max-[400px]:py-2 max-[400px]:px-2 flex items-center justify-between bg-transparent pointer-events-none border-b border-[#1a2e2e]/20">
        <div className="pointer-events-auto flex items-center gap-2">
          <Profile onClick={() => setShowProfileModal(true)} />

          {/* Battle Tier Badge */}
          {onNavigate && (
            <div
              onClick={() => onNavigate("tier")}
              className="relative w-10 h-10 flex items-center justify-center bg-[#FDF6E3] rounded-full border border-[#D4C5A5] shadow-md cursor-pointer hover:scale-105 transition-transform"
            >
              <Shield size={20} className="text-[#8C735D]" />
              <span className="absolute text-[10px] font-black text-[#8C735D] pt-1">
                {currentTier}
              </span>

              {/* Notification Dot */}
              {canUpgrade && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                  <ArrowUpCircle size={10} className="text-white" />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Gold Counter */}
          <GoldCoin />

          {/* Gems Counter */}
          <Gems />
        </div>
      </div>

      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal onClose={() => setShowProfileModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
