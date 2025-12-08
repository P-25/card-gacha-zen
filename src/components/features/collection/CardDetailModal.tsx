/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Rarity } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { consumeCardsForXp, spendGold } from "@/store/slices/playerSlice";
import LevelUpPopup from "./LevelUpPopup";
import { EnsoCircle } from "@/components/ui/EnsoCircle";
import CardInfoModal from "./CardInfoModal";
import { getRarityBorderColor } from "@/lib/rarityStyles";

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

    // Sort by XP Value (Rarity)
    // Common=100, Uncommon=300, Rare=1000
    const getXpValue = (c: Card) => {
      if (c.rarity === "COMMON") return 100;
      if (c.rarity === "UNCOMMON") return 300;
      if (c.rarity === "RARE") return 1000;
      return 0;
    };

    result.sort((a, b) => {
      const xpA = getXpValue(a);
      const xpB = getXpValue(b);
      return sortOrder === "asc" ? xpA - xpB : xpB - xpA;
    });

    return result;
  }, [inventory, activeCard, rarityFilter, sortOrder]);

  // 3. XP Calculations
  const getXpValue = (c: Card) => {
    let base = 100;
    if (c.rarity === "COMMON") base = 100;
    else if (c.rarity === "UNCOMMON") base = 300;
    else if (c.rarity === "RARE") base = 1000;

    return base * (c.level || 1);
  };

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Bottom Sheet Container */}
        <motion.div
          layout
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#FFFFFF] rounded-t-3xl px-6 pt-6 pb-24 flex flex-col shadow-2xl z-10 overflow-hidden"
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
              src="/assets/icons/info.png"
              alt="Info"
              width={24}
              height={24}
            />
          </button>

          {/* 1. TOP SECTION: Card Info */}
          <motion.div layout className="flex gap-5 mt-2 shrink-0">
            {/* Left: Image */}
            <div className="w-1/3 aspect-3/4 relative rounded-xl overflow-hidden shadow-inner bg-slate-200 shrink-0">
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
                <span>ATK: {activeCard.atk}</span>
                <span>HP: {activeCard.hp}</span>
              </div>

              {/* XP Bar */}
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative mt-2">
                {/* Current XP */}
                <div
                  className="h-full bg-[#6A9A6A]"
                  style={{
                    width: `${
                      !isAtPlayerCap
                        ? (activeCard.experience / (activeCard.level * 100)) *
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
                      width: `${(predictedXp / (predictedLevel * 100)) * 100}%`,
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
                    <span className="text-[#6A9A6A]">➜ {predictedLevel}</span>
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
                      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                    className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600 ml-auto"
                  >
                    XP {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                </div>

                {/* Fodder Grid */}
                <div className="grid grid-cols-3 gap-3 overflow-y-auto p-2 h-[350px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                  {availableCards.length === 0 ? (
                    <div className="col-span-4 text-center py-8 text-sm text-black/40 italic">
                      No cards available
                    </div>
                  ) : (
                    availableCards.map((c) => {
                      const isSelected = selectedInstanceIds.includes(
                        c.instanceId || ""
                      );
                      const xp = getXpValue(c);
                      const borderColor = getRarityBorderColor(c.rarity);

                      return (
                        <button
                          key={c.instanceId}
                          onClick={() => handleToggleCard(c)}
                          className={`aspect-3/4 relative rounded-lg border-4 transition-all cursor-pointer ${
                            isSelected
                              ? "scale-95 opacity-100"
                              : "opacity-100 hover:opacity-90"
                          }`}
                          style={{
                            borderColor: isSelected ? "#6A9A6A" : borderColor,
                          }}
                        >
                          <Image src={c.image} alt={c.name} fill />
                          {/* Level Badge */}
                          <div className="absolute top-0 left-0 bg-[#404040] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg rounded-tl-xs z-10">
                            Lvl {c.level}
                          </div>
                          {/* XP Badge */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold py-0.5 text-center">
                            +{xp} XP
                          </div>

                          {isSelected && (
                            <div className="absolute inset-0 bg-[#6A9A6A]/20 flex items-center justify-center backdrop-blur-[1px]">
                              <EnsoCircle className="w-16 h-16 text-[#2a3b3b] drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
                            </div>
                          )}
                        </button>
                      );
                    })
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

        {/* Final Confirmation Modal */}
        <AnimatePresence>
          {showFinalConfirmation && activeCard && (
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
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
                        src="/assets/icons/gold-coin.png"
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
                        ? "No Gold"
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
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
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
            <CardInfoModal
              card={activeCard}
              onClose={() => setShowInfoModal(false)}
            />
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
