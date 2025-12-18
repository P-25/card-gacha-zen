"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import ProfileModal from "../profile/ProfileModal";
import Gems from "../topbar/Gems";
import GoldCoin from "../topbar/GoldCoin";
import Profile from "../topbar/Profile";

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title = "Home" }: TopBarProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <div className="z-50 px-4 py-4 max-[400px]:py-2 max-[400px]:px-2 flex items-center justify-between bg-transparent pointer-events-none border-b border-[#1a2e2e]/20">
        <div className="pointer-events-auto flex items-center gap-2">
          <Profile onClick={() => setShowProfileModal(true)} />
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
