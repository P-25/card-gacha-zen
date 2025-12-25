/* eslint-disable @typescript-eslint/no-explicit-any */
import CardInfoLevelProgressBar from "@/components/features/collection/CardInfoLevelProgressBar";
import { getRarityBorderColor } from "@/lib/rarityStyles";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
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
  const [showMaxLevelAlert, setShowMaxLevelAlert] = useState(false);

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
                  {/* Level up button  */}
                  <motion.div
                    onClick={() => {
                      if (isMaxLevel) {
                        setShowMaxLevelAlert(true);
                      } else {
                        setShowLevelUpScreen(true);
                      }
                    }}
                    whileTap={!isMaxLevel ? { scale: 0.9 } : {}}
                    animate={
                      !isMaxLevel
                        ? {
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              "0 0 0px #ffd700",
                              "0 0 10px #ffd700",
                              "0 0 0px #ffd700",
                            ],
                          }
                        : {}
                    }
                    transition={
                      !isMaxLevel
                        ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : {}
                    }
                    className={`w-10 h-10 border-[2px] p-2 border-black rounded-full ml-2 cursor-pointer flex items-center justify-center ${
                      isMaxLevel
                        ? "bg-gray-300 grayscale opacity-50 cursor-not-allowed"
                        : "bg-[#ffd700]"
                    }`}
                  >
                    <Image
                      src={"/assets/icons/level-up.webp"}
                      alt={"Level"}
                      width={10}
                      height={10}
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </div>

                <div className="flex flex-col text-sm text-black font-bold divide-y divide-gray-400">
                  <div className="flex flex-row justify-between">
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
                  </div>
                  <div className="flex flex-row justify-between">
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
                    <div className="flex flex-row justify-center items-center">
                      <div>
                        <Image
                          src={"/assets/icons/defense.webp"}
                          alt={"Type"}
                          width={30}
                          height={30}
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div className="flex flex-col w-1/2  p-2">
                        <span className="text-xs">Type</span>
                        <span className="text-md">{activeCard.setName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}

      {/* Max Level Alert Modal */}
      <AnimatePresence>
        {showMaxLevelAlert && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowMaxLevelAlert(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Max Level Reached
              </h3>
              <p className="text-gray-600 mb-6">
                Increase your <strong>Player Level</strong> to upgrade this card
                further.
              </p>
              <button
                onClick={() => setShowMaxLevelAlert(false)}
                className="w-full py-3 rounded-xl font-bold text-white bg-[#2a3b3b] hover:bg-[#1a2e2e] shadow-lg transition-colors"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
