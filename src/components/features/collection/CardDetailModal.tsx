/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";
import { consumeCardsForXp, spendGold } from "@/store/slices/playerSlice";
import { RootState } from "@/store/store";
import { Card, Rarity } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CardInfoModal from "./CardInfoModal";
import LevelUpPopup from "./LevelUpPopup";

// Helper for XP calculation
const getXpValue = (c: Card) => {
  let base = 100;
  if (c.rarity === "COMMON") base = 100;
  else if (c.rarity === "UNCOMMON") base = 250;
  else if (c.rarity === "RARE") base = 500;

  const final = base * (c.level || 1);

  return final > 5000 ? 5000 : final;
};

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
  count?: number;
}

export default function CardDetailModal({
  card,
  onClose,
}: CardDetailModalProps) {
  const dispatch = useDispatch();
  const {
    inventory,
    level: playerLevel,
    gold,
  } = useSelector((state: RootState) => state.player);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [showMaxLevelAlert, setShowMaxLevelAlert] = useState(false);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [levelUpStats, setLevelUpStats] = useState({
    oldLevel: 1,
    newLevel: 1,
    oldAtk: 0,
    newAtk: 0,
    oldHp: 0,
    newHp: 0,
  });

  // Pagination for Fodder
  const [visibleFodderCount, setVisibleFodderCount] = useState(21);
  const FODDER_INCREMENT = 21;

  // 1. Get Active Card (Reactive State)
  const activeCard = useMemo(() => {
    if (!card) return null;
    return inventory.find((c) => c.instanceId === card.instanceId) || card;
  }, [inventory, card]);

  // Filter States
  const [rarityFilter, setRarityFilter] = useState<Rarity | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // XP Value

  // 2. Available Fodder (All cards except self)
  const availableCards = useMemo(() => {
    if (!activeCard) return [];
    let result = inventory.filter(
      (c) => c.instanceId !== activeCard.instanceId
    );

    // Filter
    if (rarityFilter !== "ALL") {
      result = result.filter((c) => c.rarity === rarityFilter);
    }

    result.sort((a, b) => {
      const xpA = getXpValue(a);
      const xpB = getXpValue(b);
      return sortOrder === "asc" ? xpA - xpB : xpB - xpA;
    });

    return result;
  }, [inventory, activeCard, rarityFilter, sortOrder]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setVisibleFodderCount(FODDER_INCREMENT);
  }, [availableCards]);

  const selectedXp = useMemo(() => {
    let total = 0;
    inventory.forEach((c) => {
      if (selectedInstanceIds.includes(c.instanceId || "")) {
        total += getXpValue(c);
      }
    });
    return total;
  }, [selectedInstanceIds, inventory]);

  // Prediction Logic
  let predictedLevel = activeCard?.level || 1;
  let predictedXp = activeCard?.experience || 0;
  let remainingXpToAdd = selectedXp;

  while (remainingXpToAdd > 0 && predictedLevel < playerLevel) {
    const xpNeeded = predictedLevel * 100;
    const neededForNext = xpNeeded - predictedXp;

    if (remainingXpToAdd >= neededForNext) {
      remainingXpToAdd -= neededForNext;
      predictedLevel++;
      predictedXp = 0;
    } else {
      predictedXp += remainingXpToAdd;
      remainingXpToAdd = 0;
    }
  }

  if (predictedLevel < playerLevel) {
    if (remainingXpToAdd > 0) predictedXp += remainingXpToAdd;
  }

  const isAtPlayerCap = predictedLevel === playerLevel;

  const handleToggleCard = (c: Card) => {
    const id = c.instanceId || "";
    if (selectedInstanceIds.includes(id)) {
      setSelectedInstanceIds((prev) => prev.filter((i) => i !== id));
    } else {
      // Check Cap
      if (isAtPlayerCap) {
        setShowMaxLevelAlert(true);
        return;
      }
      setSelectedInstanceIds((prev) => [...prev, id]);
    }
  };

  const handleInitiateLevelUp = () => {
    if (!activeCard) return;
    setShowFinalConfirmation(true);
  };

  const handleConfirmLevelUp = () => {
    if (!activeCard) return;

    // Calculate stats for popup
    const currentLevel = activeCard.level;
    const currentAtk = activeCard.atk;
    const currentHp = activeCard.hp;

    // Calculate expected new stats
    let tempLevel = currentLevel;
    let tempAtk = currentAtk;
    let tempHp = currentHp;

    const levelsGained = predictedLevel - currentLevel;
    const goldCost = levelsGained * 100;

    if (gold < goldCost) {
      // Should be handled by UI disabling, but safety check
      return;
    }

    for (let i = 0; i < levelsGained; i++) {
      tempLevel++;
      tempAtk = Math.floor(tempAtk * 1.1);
      tempHp = Math.floor(tempHp * 1.1);
    }

    setLevelUpStats({
      oldLevel: currentLevel,
      newLevel: tempLevel,
      oldAtk: currentAtk,
      newAtk: tempAtk,
      oldHp: currentHp,
      newHp: tempHp,
    });

    dispatch(spendGold(goldCost));
    dispatch(
      consumeCardsForXp({
        targetInstanceId: activeCard.instanceId || "",
        consumedInstanceIds: selectedInstanceIds,
      })
    );
    setSelectedInstanceIds([]);
    setIsLevelingUp(false);
    setShowFinalConfirmation(false);

    if (levelsGained > 0) {
      setShowLevelUpPopup(true);
    }
  };

  if (!activeCard) return null;

  const borderColor = getRarityBorderColor(activeCard.rarity);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
        key={activeCard.instanceId}
      >
        {/* Backdrop & Bottom Sheet - Hide when Info Modal is open */}
        {!showInfoModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer pointer-events-auto"
            />

            {/* Bottom Sheet Container */}
            <motion.div
              layout
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full bg-[#FFFFFF] rounded-t-3xl px-6 pt-6 pb-24 flex flex-col shadow-2xl z-10 overflow-hidden pointer-events-auto"
              style={{ maxHeight: "90vh" }}
            >
              {/* Drag Handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/10 rounded-full" />

              {/* Info Icon */}
              <button
                onClick={() => setShowInfoModal(true)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <Image
                  src="/assets/icons/info.webp"
                  alt="Info"
                  width={24}
                  height={24}
                />
              </button>

              {/* 1. TOP SECTION: Card Info */}
              <motion.div layout className="flex gap-5 mt-2 shrink-0">
                {/* Left: Image */}
                <div
                  className="w-1/3 relative rounded-xl overflow-hidden shrink-0"
                  style={{ aspectRatio: "2/3" }}
                >
                  <Image
                    src={activeCard.image}
                    alt={activeCard.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Right: Details */}
                <div className="flex-1 flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-[#1a2e2e] leading-tight">
                    {activeCard.name}
                  </h2>

                  <div className="flex flex-row justify-between gap-1 text-sm text-[#5F5A46] font-bold">
                    <span>POW: {activeCard.state.pow}</span>
                    <span>SPD: {activeCard.state.spd}</span>
                    <span>DEF: {activeCard.state.def}</span>
                    <span style={{ color: borderColor }}>
                      {activeCard.rarity}
                    </span>
                  </div>

                  {/* XP Bar */}
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative mt-2">
                    {/* Current XP */}
                    <div
                      className="h-full bg-[#6A9A6A]"
                      style={{
                        width: `${
                          !isAtPlayerCap
                            ? (activeCard.experience /
                                (activeCard.level * 100)) *
                              100
                            : 100
                        }%`,
                      }}
                    />
                    {/* Predicted XP Preview (Overlay) */}
                    {selectedXp > 0 && (
                      <div
                        className="h-full bg-[#6A9A6A]/50 absolute top-0 left-0 animate-pulse"
                        style={{
                          width: `${
                            (predictedXp / (predictedLevel * 100)) * 100
                          }%`,
                        }} // Simplified preview
                      />
                    )}
                    {!isAtPlayerCap ? (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 drop-shadow-sm z-10">
                        {selectedInstanceIds.length > 0
                          ? `${predictedXp} / ${predictedLevel * 100} XP`
                          : `${activeCard.experience} / ${
                              activeCard.level * 100
                            } XP`}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm z-10">
                        Max Level
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 bg-[#2a3b3b] rounded-full p-1 flex items-center justify-between relative h-12 mt-1">
                    {/* Level Text */}
                    <div className="px-4 text-white font-bold text-sm z-10 flex flex-row gap-1 leading-none justify-center items-center h-full min-w-[80px]">
                      <span>Lvl {activeCard.level}</span>
                      {predictedLevel > activeCard.level && (
                        <span className="text-[#6A9A6A]">
                          ➜ {predictedLevel}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {!isAtPlayerCap ? (
                      <button
                        onClick={() => {
                          if (isLevelingUp) {
                            // Cancel: Reset selection
                            setSelectedInstanceIds([]);
                            setIsLevelingUp(false);
                          } else {
                            // Open
                            setIsLevelingUp(true);
                          }
                        }}
                        className={`relative z-10 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isLevelingUp
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-[#6A9A6A] text-white hover:bg-[#588558] shadow-md"
                        }`}
                      >
                        {isLevelingUp ? "Cancel" : "Level Up"}
                      </button>
                    ) : (
                      <div className="relative z-10 px-6 py-2 text-xs font-bold text-white/40 uppercase tracking-wider cursor-not-allowed">
                        Max Level
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* 2. EXPANDED LEVEL UP AREA */}
              <AnimatePresence>
                {isLevelingUp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="flex flex-col gap-4 overflow-hidden w-full"
                  >
                    <div className="h-px w-full bg-black/5" />

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {["ALL", "COMMON", "UNCOMMON", "RARE"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRarityFilter(r as any)}
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            rarityFilter === r
                              ? "bg-[#2a3b3b] text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setSortOrder((prev) =>
                            prev === "asc" ? "desc" : "asc"
                          )
                        }
                        className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 ml-auto"
                      >
                        XP {sortOrder === "asc" ? "↑" : "↓"}
                      </button>
                    </div>

                    {/* Fodder Grid */}
                    <div
                      className="grid grid-cols-3 gap-3 overflow-y-auto p-2 h-[350px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                      onScroll={(e) => {
                        const { scrollTop, clientHeight, scrollHeight } =
                          e.currentTarget;
                        if (scrollHeight - scrollTop <= clientHeight + 50) {
                          if (visibleFodderCount < availableCards.length) {
                            setVisibleFodderCount((prev) =>
                              Math.min(
                                prev + FODDER_INCREMENT,
                                availableCards.length
                              )
                            );
                          }
                        }
                      }}
                    >
                      {availableCards.length === 0 ? (
                        <div className="col-span-3 text-center py-8 text-sm text-black/40 italic">
                          No cards available
                        </div>
                      ) : (
                        availableCards
                          .slice(0, visibleFodderCount)
                          .map((c, index) => (
                            <FodderCard
                              key={`${c.instanceId}-${index}`}
                              card={c}
                              isSelected={selectedInstanceIds.includes(
                                c.instanceId || ""
                              )}
                              onToggle={() => handleToggleCard(c)}
                            />
                          ))
                      )}
                      {visibleFodderCount < availableCards.length && (
                        <div className="col-span-3 py-2 flex justify-center">
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Confirm Button */}
                    <button
                      disabled={selectedInstanceIds.length === 0}
                      onClick={handleInitiateLevelUp}
                      className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                        selectedInstanceIds.length > 0
                          ? "bg-[#3A4E48] text-white shadow-lg hover:bg-[#2a3b3b]"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Confirm Level Up (+{selectedXp} XP)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* Final Confirmation Modal */}
        <AnimatePresence>
          {showFinalConfirmation && activeCard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowFinalConfirmation(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#Fdfcf8] rounded-xl p-0 w-full max-w-xs relative z-10 text-center shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="bg-[#Fdfcf8] pt-6 pb-2 px-4">
                  <h3 className="text-lg font-bold text-[#1a2e2e] uppercase tracking-wide">
                    Level Up Confirmation
                  </h3>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  {/* Level Change */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[#1a2e2e] text-lg">
                      Lvl {activeCard.level}
                    </span>
                    <span className="text-[#1a2e2e] text-lg">›</span>
                    <span className="text-[#588558] font-bold text-lg">
                      Lvl {predictedLevel}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* HP */}
                    <div className="bg-[#Fdfcf8] border border-[#E0DCC0] rounded-lg p-2 shadow-sm">
                      <div className="text-xs text-[#1a2e2e] uppercase font-bold mb-1">
                        HP
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <span className="text-[#1a2e2e] font-medium">
                          {activeCard.hp}
                        </span>
                        <span className="text-[#588558] text-xs">›</span>
                        <span className="text-[#588558] font-bold">
                          {Math.floor(
                            activeCard.hp *
                              Math.pow(1.1, predictedLevel - activeCard.level)
                          )}
                        </span>
                      </div>
                    </div>
                    {/* ATK */}
                    <div className="bg-[#Fdfcf8] border border-[#E0DCC0] rounded-lg p-2 shadow-sm">
                      <div className="text-xs text-[#1a2e2e] uppercase font-bold mb-1">
                        ATK
                      </div>
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <span className="text-[#1a2e2e] font-medium">
                          {activeCard.atk}
                        </span>
                        <span className="text-[#588558] text-xs">›</span>
                        <span className="text-[#588558] font-bold">
                          {Math.floor(
                            activeCard.atk *
                              Math.pow(1.1, predictedLevel - activeCard.level)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warning for High Rarity */}
                  {inventory.some(
                    (c) =>
                      selectedInstanceIds.includes(c.instanceId || "") &&
                      (c.rarity === "RARE" ||
                        c.rarity === "UNCOMMON" ||
                        c.level > 1)
                  ) && (
                    <div className="bg-[#Fdfcf8] border border-[#C25E5E]/30 rounded-lg p-2 text-[#C25E5E] text-[10px] leading-tight">
                      <strong className="block mb-0.5">WARNING:</strong>
                      You are consuming Rare or Leveled cards. They will be lost
                      forever.
                    </div>
                  )}

                  {/* Cost */}
                  <div className="flex items-center justify-center gap-1 text-center text-md font-bold text-[#1a2e2e] mt-1">
                    <span>Required</span>
                    <div className="w-6 h-6 relative">
                      <Image
                        src="/assets/icons/gold-coin.webp"
                        alt="Gold"
                        fill
                        className="object-contain"
                      />
                    </div>{" "}
                    <span>X{(predictedLevel - activeCard.level) * 100}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setShowFinalConfirmation(false)}
                      className="flex-1 py-2.5 rounded-lg font-bold text-[#5F5A46] bg-[#EDE8D0] hover:bg-[#E0DCC0] transition-colors shadow-sm text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={
                        gold < (predictedLevel - activeCard.level) * 100
                      }
                      onClick={handleConfirmLevelUp}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-white shadow-md transition-all text-sm ${
                        gold < (predictedLevel - activeCard.level) * 100
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#3A4E48] hover:bg-[#2a3b3b]"
                      }`}
                    >
                      {gold < (predictedLevel - activeCard.level) * 100
                        ? "Not Enough Gold"
                        : "Confirm"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Max Level Alert Modal */}
        <AnimatePresence>
          {showMaxLevelAlert && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
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
                  Increase your <strong>Player Level</strong> to upgrade this
                  card further.
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
      </div>

      {/* Level Up Popup */}
      <AnimatePresence>
        {showLevelUpPopup && (
          <LevelUpPopup
            {...levelUpStats}
            onClose={() => setShowLevelUpPopup(false)}
          />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// Memoized Fodder Card Component
// Memoized Fodder Card Component
const FodderCardComponent = ({
  card,
  isSelected,
  onToggle,
}: {
  card: Card;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  const xp = getXpValue(card);
  const borderColor = getRarityBorderColor(card.rarity);

  return (
    <motion.div
      whileHover={{ scale: isSelected ? 1 : 1.05 }}
      whileTap={{ scale: isSelected ? 1 : 0.95 }}
      onClick={onToggle}
      className="relative aspect-[2/3] rounded-xl cursor-pointer shadow-lg group bg-white/10"
      style={{
        boxShadow: isSelected
          ? `inset 0 0 0 8px #3A4E48`
          : `inset 0 0 0 4px ${borderColor}`,
        transform: isSelected ? "scale(0.95)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Brush Stroke Background */}
      <div
        className={`absolute inset-0 z-0 opacity-80 transition-transform duration-500 flex items-center justify-center ${
          isSelected ? "" : "group-hover:rotate-12 group-hover:scale-110"
        }`}
      >
        <div className="relative w-full h-full scale-[1.1] opacity-60">
          <Image
            src={getStrokeImage(card.rarity)}
            alt="brush stroke"
            fill
            className="object-contain no-global-filter"
            sizes="(max-width: 768px) 50vw, 300px"
          />
        </div>
      </div>

      {/* Card Image */}
      <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
        <Image
          src={card.image}
          alt={card.name}
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          loading="lazy"
          className={`object-cover transition-transform duration-300 ${
            isSelected ? "" : "group-hover:scale-110"
          }`}
        />
      </div>

      {/* Level Badge */}
      <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-20 border-r border-b border-white/10">
        Lv.{card.level}
      </div>

      {/* XP Badge */}
      <div className="absolute top-0 right-0 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-bl-lg z-20 border-r border-b border-white/10">
        +{getXpValue(card)} XP
      </div>

      {/* Name Overlay */}
      <div className="z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-2 opacity-100 rounded-b-2xl">
        <p className="text-white text-xs font-bold truncate text-center">
          {card.name}
        </p>
      </div>

      {/* {isSelected && (
        <div className="absolute inset-0 bg-[#6A9A6A]/20 flex items-center justify-center backdrop-blur-[1px] z-20">
          <EnsoCircle className="w-12 h-12 text-[#2a3b3b] drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
        </div>
      )} */}
    </motion.div>
  );
};

const FodderCard = React.memo(FodderCardComponent);
