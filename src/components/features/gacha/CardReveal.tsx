"use client";

import { getRarityBorderColor } from "@/lib/rarityStyles";
import { RootState } from "@/store/store";
import { Card, Resource } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import RateUpHighlight from "@/components/effects/RateUpHighlight";
import CosmicBackground from "./CosmicBackground";
import { useSound } from "@/hooks/useSound";

interface CardRevealProps {
  onReset: () => void;
  onFinish: () => void;
  results: (Card | Resource)[];
}

export default function CardReveal({
  onReset,
  onFinish,
  results,
}: CardRevealProps) {
  console.log(`Debug - results`, results);
  const [currentIndex, setCurrentIndex] = useState(0);
  const item = results[currentIndex];
  const { stopSummon, playRevealCard, playClick } = useSound();

  // Get inventory to check for duplicates (New Badge Logic)
  const inventory = useSelector((state: RootState) => state.player.inventory);

  useEffect(() => {
    if (results.length > 0) {
      stopSummon();
      const currentItem = results[currentIndex];
      const isRareItem =
        currentItem &&
        currentItem.type === "CARD" &&
        (currentItem as Card).rarity === "RARE";
      playRevealCard(isRareItem);
    }
  }, [currentIndex, stopSummon, playRevealCard, results]);

  if (!item) return null;

  const isCard = item.type === "CARD";
  const cardItem = item as Card;
  const resourceItem = item as Resource;

  // Check if card is new (count === 1 in inventory implies it was just added and is the only copy)
  // Note: This is a heuristic. Ideally, the backend/summon result would flag 'isNew'.
  const isNew =
    isCard && inventory.filter((c) => c.id === cardItem.id).length === 1;

  const handleNext = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const borderColor = getRarityBorderColor(cardItem.rarity);
  const isRare = cardItem.rarity === "RARE";

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 py-4">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="flex flex-col items-center gap-2 w-full max-w-md px-6"
        >
          {/* Card Container */}
          <div className="relative w-full aspect-3/4 max-h-[55vh] flex items-center justify-center bg-white rounded-xl">
            {/* Ink Burst Halo */}
            <div className="absolute inset-0 z-0 scale-150 opacity-40 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={
                    cardItem.rarity === "RARE"
                      ? "/assets/icons/rare_stroke.webp"
                      : cardItem.rarity === "UNCOMMON"
                        ? "/assets/icons/uncommon_stroke.webp"
                        : "/assets/icons/common_stroke.webp"
                  }
                  alt="brush stroke"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            </div>

            <motion.div
              className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer shadow-2xl group"
              style={{
                boxShadow: isRare
                  ? `0px 10px 30px 0px #3E206D, inset 0 0 0 4px ${borderColor}`
                  : `0 10px 30px -10px ${borderColor}60, inset 0 0 0 4px ${borderColor}80`,
              }}
            >
              {/* Card Image */}
              <motion.img
                animate={{ scale: [0.9, 0.95, 0.9] }}
                transition={{
                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  default: { duration: 0.6 },
                }}
                src={cardItem.image}
                alt={cardItem.name}
                className="z-5 object-cover w-full h-full"
                fetchPriority="high"
                loading="eager"
              />
              {isRare && (
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <motion.img
                      src={"/assets/extra/sparkle.png"}
                      alt="sparkle"
                      className="z-5 object-cover w-full h-full"
                      fetchPriority="high"
                      loading="eager"
                    />
                  </div>
                </div>
              )}

              {/* Rarity Badge */}
              <div
                className="absolute top-0 left-0 text-white font-bold px-4 py-2 rounded-br-2xl z-30 shadow-md"
                style={{
                  backgroundColor: borderColor,
                  fontSize: isRare ? "14px" : "12px",
                }}
              >
                {cardItem.rarity}
              </div>

              {/* NEW Badge */}
              {isNew && (
                <div
                  className="absolute top-0 right-0 text-white font-bold px-4 py-2 rounded-bl-2xl z-30 shadow-md bg-red-600"
                  style={{
                    fontSize: isRare ? "14px" : "12px",
                  }}
                >
                  NEW!
                </div>
              )}
            </motion.div>
          </div>

          {/* Card Info */}
          <div className="flex flex-col items-center gap-2 w-full min-h-[110px]">
            {/* Name & Stats Row */}
            <div className="flex flex-col items-center justify-center gap-1 w-full">
              <h3 className="text-2xl font-bold text-[#2D2D2D] tracking-wide uppercase text-center drop-shadow-sm">
                {item.name}
              </h3>

              {isCard && (
                <div className="flex justify-between items-center px-4 mb-1 text-[#1a2e2e] font-bold w-[90%] text-md">
                  <span>POW: {cardItem.state.pow}</span>
                  <span>SPD: {cardItem.state.spd}</span>
                  <span>DEF: {cardItem.state.def}</span>
                  <span>Level: {cardItem.level}</span>
                </div>
              )}
            </div>

            {/* Flavor Text */}
            {isCard ? (
              <p className="text-md font-semibold text-gray-600 italic text-center leading-relaxed line-clamp-2">
                &quot;{cardItem.description}&quot;
              </p>
            ) : (
              <div className="text-sm text-gray-600 italic text-center max-w-xs leading-relaxed">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-6 h-6 relative">
                    <Image
                      src="/assets/icons/gold-coin.webp"
                      alt="Gold"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[#1a2e2e] font-medium text-lg">
                    x{resourceItem.value.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full flex gap-4 mt-2"
          >
            {/* Share / Skip Button */}
            {results.length > 1 && currentIndex < results.length - 1 ? (
              <button
                onClick={() => {
                  playClick();
                  onReset();
                }}
                className="flex-1 bg-transparent text-gray-500 font-bold text-lg py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all uppercase tracking-wider"
              >
                SKIP ALL
              </button>
            ) : (
              <button
                onClick={playClick}
                className="flex-1 bg-transparent text-gray-500 font-bold text-lg py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all uppercase tracking-wider"
              >
                SHARE
              </button>
            )}

            {/* Claim/Next Button (Primary) */}
            <button
              onClick={() => {
                playClick();
                handleNext();
              }}
              className="flex-2 bg-[#3E206D] text-[#FDB931] font-bold text-xl py-3 rounded-xl border-2 border-[#C5A059] shadow-lg active:scale-95 transition-transform uppercase tracking-widest relative overflow-hidden group cursor-pointer hover:brightness-110"
            >
              <span className="relative z-10">
                {currentIndex < results.length - 1 ? "NEXT" : "CLAIM"}
              </span>
              {/* Sheen */}
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
