/* eslint-disable @typescript-eslint/no-explicit-any */
import ClickTooltip from "@/components/common/ClickTooltip";
import TypeIcon from "@/components/common/TypeIcon";
import CardInfoLevelProgressBar from "@/components/features/collection/CardInfoLevelProgressBar";
import { getRarityBorderColor } from "@/lib/rarityStyles";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import CardInfoModal from "./CardInfoModal";
import LevelUpScreen from "./LevelUpScreen";

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
  count?: number;
}

export default function CardDetailModal({
  card,
  onClose,
}: CardDetailModalProps) {
  const { inventory, level: playerLevel } = useSelector(
    (state: RootState) => state.player
  );

  const [showLevelUpScreen, setShowLevelUpScreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 1. Get Active Card (Reactive State)
  const activeCard = useMemo(() => {
    if (!card) return null;
    return inventory.find((c) => c.instanceId === card.instanceId) || card;
  }, [inventory, card]);

  if (!activeCard || !mounted) return null;

  const isMaxLevel = activeCard.level >= playerLevel;

  const borderColor = getRarityBorderColor(activeCard.rarity);

  const portalTarget = document.getElementById("game-viewport");
  if (!portalTarget) return null;

  return createPortal(
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center pointer-events-none"
      key={activeCard.instanceId}
    >
      {/* Level Up Screen Overlay */}
      <AnimatePresence>
        {showLevelUpScreen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-[70] pointer-events-auto"
          >
            <LevelUpScreen
              card={activeCard}
              onBack={() => setShowLevelUpScreen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop & Bottom Sheet - Hide when Info Modal is open */}
      {!showInfoModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showLevelUpScreen ? 0 : 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer pointer-events-auto"
            style={{ pointerEvents: showLevelUpScreen ? "none" : "auto" }}
          />

          {/* Bottom Sheet Container */}
          <motion.div
            id="bottom-sheet-single-card"
            layout
            initial={{ y: "100%" }}
            animate={{ y: showLevelUpScreen ? "100%" : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag={showLevelUpScreen ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.8 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="relative w-full bg-[#FFFFFF] rounded-t-3xl px-2 py-6 flex flex-col shadow-2xl z-10 overflow-hidden pointer-events-auto"
            style={{ maxHeight: "90vh" }}
          >
            {/* Drag Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/10 rounded-full" />

            <motion.div layout className="flex justify-center mt-2 shrink-0">
              <h2 className="text-2xl font-bold text-[#1a2e2e] leading-tight">
                {activeCard.name}
              </h2>
            </motion.div>

            {/* 1. TOP SECTION: Card Info */}
            <motion.div layout className="flex gap-5 mt-2 shrink-0">
              {/* Left: Image */}
              <div
                className="w-1/3 relative rounded-xl overflow-hidden shrink-0 cursor-pointer"
                style={{
                  aspectRatio: "2/3",
                  boxShadow: `inset 0 0 0 4px ${borderColor}`,
                }}
                onClick={() => setShowInfoModal(true)}
              >
                <Image
                  src={activeCard.image}
                  alt={activeCard.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-2 w-full flex items-center justify-center">
                  <span
                    className="text-[8px] text-white px-2 py-1 rounded-md"
                    style={{ backgroundColor: borderColor }}
                  >
                    {activeCard.rarity}
                  </span>
                </div>
              </div>

              {/* Right: Details */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex flex-row justify-between items-center">
                  <div className="w-full">
                    <CardInfoLevelProgressBar
                      level={isMaxLevel ? "MAX" : activeCard.level}
                      currentXp={activeCard.experience}
                      requiredXp={activeCard.level * 100}
                    />
                  </div>
                </div>

                <div className="flex flex-col text-sm text-black font-bold divide-y divide-gray-400">
                  <div className="flex flex-row justify-between">
                    <ClickTooltip
                      content="Attack Power"
                      className="flex flex-row justify-center items-center w-full"
                    >
                      <div className="flex flex-row justify-center items-center">
                        <div>
                          <Image
                            src={"/assets/icons/power.webp"}
                            alt={"Power"}
                            width={30}
                            height={30}
                            className="object-cover"
                            priority
                          />
                        </div>
                        <div className="flex flex-col w-1/2 p-2">
                          <span className="text-xs">POWER</span>
                          <span className="text-md">
                            {activeCard.state?.pow || 0}
                          </span>
                        </div>
                      </div>
                    </ClickTooltip>
                    <ClickTooltip
                      content="Action Speed"
                      className="flex flex-row justify-center items-center w-full"
                    >
                      <div className="flex flex-row justify-center items-center">
                        <div>
                          <Image
                            src={"/assets/icons/speed.webp"}
                            alt={"Speed"}
                            width={30}
                            height={30}
                            className="object-cover"
                            priority
                          />
                        </div>
                        <div className="flex flex-col w-1/2  p-2">
                          <span className="text-xs">Speed</span>
                          <span className="text-md">
                            {activeCard.state?.spd || 0}
                          </span>
                        </div>
                      </div>
                    </ClickTooltip>
                  </div>
                  <div className="flex flex-row justify-between">
                    <ClickTooltip
                      content="Defense"
                      className="flex flex-row justify-center items-center w-full"
                    >
                      <div className="flex flex-row justify-center items-center">
                        <div>
                          <Image
                            src={"/assets/icons/defense.webp"}
                            alt={"Defense"}
                            width={30}
                            height={30}
                            className="object-cover"
                            priority
                          />
                        </div>
                        <div className="flex flex-col w-1/2  p-2">
                          <span className="text-xs">Defense</span>
                          <span className="text-md">
                            {activeCard.state?.def || 0}
                          </span>
                        </div>
                      </div>
                    </ClickTooltip>
                    <ClickTooltip
                      content="Card Element"
                      className="flex flex-row justify-center items-center w-full"
                    >
                      <div className="flex flex-row justify-center items-center">
                        <div>
                          <TypeIcon type={activeCard.setName} size={30} />
                        </div>
                        <div className="flex flex-col w-1/2  p-2">
                          <span className="text-xs">Type</span>
                          <span className="text-md">{activeCard.setName}</span>
                        </div>
                      </div>
                    </ClickTooltip>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Level up button  */}

                  <ClickTooltip
                    content="Max Level Reached. Increase Player Level to upgrade."
                    disabled={!isMaxLevel}
                  >
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!isMaxLevel) {
                          setShowLevelUpScreen(true);
                        }
                      }}
                      className={` text-white rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#C5A059] active:border-b-2 active:translate-y-1 transition-all relative overflow-hidden group cursor-pointer ${
                        isMaxLevel
                          ? "opacity-50 cursor-not-allowed bg-gray-300 grayscale"
                          : "bg-[#6A0DAD]"
                      }`}
                      style={{
                        background:
                          "linear-gradient(180deg, #4c2a85 0%, #3a1e69 100%)",
                        boxShadow:
                          "0 4px 0 #C5A059, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <span className="text-sm max-[400px]:text-xs text-[#FDB931] font-bold tracking-wider relative z-10 px-2">
                        Level Up
                      </span>

                      {/* Sheen Effect */}
                      <motion.div
                        className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        animate={{ x: ["-200%", "400%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      />
                    </motion.button>
                  </ClickTooltip>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log(`Debug - Rank up coming soon`);
                    }}
                    className={` text-white rounded-xl py-4 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#C5A059]  group cursor-pointer ${
                      true
                        ? "opacity-50 cursor-not-allowed bg-gray-300 grayscale"
                        : "bg-[#388E3C]"
                    }`}
                    style={{
                      boxShadow:
                        "0 4px 0 #C5A059, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <span className="text-sm max-[400px]:text-xs text-[#FDB931] font-bold tracking-wider relative z-10 px-2">
                      Rank Up
                    </span>

                    {/* Sheen Effect */}
                    <motion.div
                      className="absolute top-0 left-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ["-200%", "400%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}

      {/* Card Info Modal */}
      <AnimatePresence>
        {showInfoModal && activeCard && (
          <div className="relative z-120 pointer-events-auto">
            <CardInfoModal
              card={activeCard}
              onClose={() => setShowInfoModal(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>,
    portalTarget
  );
}
