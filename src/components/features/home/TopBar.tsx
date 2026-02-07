"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import ProfileModal from "../profile/ProfileModal";
import Gems from "../topbar/Gems";
import GoldCoin from "../topbar/GoldCoin";
import Profile from "../topbar/Profile";
import { Shield, ArrowUpCircle, Asterisk } from "lucide-react";
import { useSelector } from "react-redux";
import { selectPlayerTier, selectCanUpgradeTier } from "@/store/selectors";
import Image from "next/image";

interface TopBarProps {
  title?: string;
  onNavigate?: (screen: any) => void;
}

import VictoryScreen from "@/components/battle/VictoryScreen";
import DefeatScreen from "@/components/battle/DefeatScreen";

export default function TopBar({ title = "Home", onNavigate }: TopBarProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [debugScreen, setDebugScreen] = useState<"victory" | "defeat" | null>(
    null,
  );
  const currentTier = useSelector(selectPlayerTier);
  const canUpgrade = useSelector(selectCanUpgradeTier);

  return (
    <>
      <div className="z-50 px-4 py-4 max-[400px]:py-2 max-[400px]:px-2 flex items-center justify-between bg-transparent pointer-events-none border-b border-[#1a2e2e]/20">
        <div className="pointer-events-auto flex items-center gap-2">
          <Profile onClick={() => setShowProfileModal(true)} />

          {/* Battle Tier Badge */}
          {onNavigate && (
            <>
              <div
                onClick={() => onNavigate("tier")}
                className="w-12 h-12 max-[400px]:w-10 max-[400px]:h-10 rounded-full  border-2 border-white flex items-center justify-center shadow-md cursor-pointer overflow-hidden relative"
              >
                <div className="relative w-[95%] h-[95%]">
                  <Image
                    src="/assets/icons/rank-shield.webp"
                    alt="Profile"
                    fill
                    className="no-global-filter w-full h-full object-contain"
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 pb-4">
                    <span
                      className="text-white font-black text-sm drop-shadow-lg leading-none filter"
                      style={{
                        filter: "drop-shadow(0px 4px 0px rgba(0,0,0,0.5))",
                      }}
                    >
                      {currentTier}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* DEBUG BUTTONS */}
          {/* <div className="flex gap-1 ml-2 pointer-events-auto opacity-50 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setDebugScreen("victory")}
              className="bg-green-500/20 hover:bg-green-500 text-green-200 text-[10px] px-2 py-1 rounded border border-green-500/50"
            >
              Win
            </button>
            <button
              onClick={() => setDebugScreen("defeat")}
              className="bg-red-500/20 hover:bg-red-500 text-red-200 text-[10px] px-2 py-1 rounded border border-red-500/50"
            >
              Lose
            </button>
          </div> */}
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

      {/* DEBUG SCREENS */}
      {/* {debugScreen === "victory" && (
        <VictoryScreen
          score={3}
          opponentScore={0}
          onContinue={() => {
            setDebugScreen(null);
            if (onNavigate) onNavigate("battle");
          }}
          rewards={{ exp: 20, gold: 30, gems: 5 }}
        />
      )}
      {debugScreen === "defeat" && (
        <DefeatScreen
          score={1}
          opponentScore={3}
          onContinue={() => {
            setDebugScreen(null);
            if (onNavigate) onNavigate("battle");
          }}
          rewards={{ exp: 0, gold: 10, gems: 0 }}
        />
      )} */}
    </>
  );
}
