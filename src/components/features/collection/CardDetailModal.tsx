/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Rarity } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { consumeCardsForXp } from "@/store/slices/playerSlice";
import LevelUpPopup from "./LevelUpPopup";

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
  const { inventory, level: playerLevel } = useSelector(
    (state: RootState) => state.player
  );
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
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
        alert("Max Level Reached! Increase Player Level to upgrade further.");
        return;
      }
      setSelectedInstanceIds((prev) => [...prev, id]);
    }
  };

  const handleConfirmLevelUp = () => {
    if (!activeCard) return;

    // Check for high rarity OR leveled cards
    const needsWarning = inventory.some(
      (c) =>
        selectedInstanceIds.includes(c.instanceId || "") &&
        (c.rarity === "RARE" || c.rarity === "UNCOMMON" || c.level > 1)
    );

    if (needsWarning && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // Calculate stats for popup
    const currentLevel = activeCard.level;
    const currentAtk = activeCard.atk;
    const currentHp = activeCard.hp;

    // Calculate expected new stats
    // Logic must match playerSlice: +10% per level
    let tempLevel = currentLevel;
    let tempAtk = currentAtk;
    let tempHp = currentHp;

    // We use the predictedLevel calculated earlier
    const levelsGained = predictedLevel - currentLevel;

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

    dispatch(
      consumeCardsForXp({
        targetInstanceId: activeCard.instanceId || "",
        consumedInstanceIds: selectedInstanceIds,
      })
    );
    setSelectedInstanceIds([]);
    setIsLevelingUp(false);
    setShowConfirmation(false);

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
          className="relative w-full max-w-md bg-[#Fdfcf8] rounded-t-3xl px-6 pt-6 pb-24 flex flex-col shadow-2xl z-10 overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          {/* Drag Handle */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/10 rounded-full" />

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
                      (activeCard.experience / (activeCard.level * 100)) * 100
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
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 drop-shadow-sm z-10">
                  {selectedInstanceIds.length > 0
                    ? `${predictedXp} / ${predictedLevel * 100} XP`
                    : `${activeCard.experience} / ${activeCard.level * 100} XP`}
                </div>
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
                      return (
                        <button
                          key={c.instanceId}
                          onClick={() => handleToggleCard(c)}
                          className={`aspect-3/4 relative rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#6A9A6A] scale-95 opacity-100"
                              : "border-transparent opacity-100 hover:opacity-90"
                          }`}
                        >
                          <Image src={c.image} alt={c.name} fill />
                          {/* Level Badge */}
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                            Lvl {c.level}
                          </div>
                          {/* XP Badge */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold py-0.5 text-center">
                            +{xp} XP
                          </div>

                          {isSelected && (
                            <div className="absolute inset-0 bg-[#6A9A6A]/40 flex items-center justify-center">
                              <div className="w-6 h-6 bg-[#6A9A6A] rounded-full flex items-center justify-center shadow-lg">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-4 h-4 text-white"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
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
                  onClick={handleConfirmLevelUp}
                  className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                    selectedInstanceIds.length > 0
                      ? "bg-[#6A9A6A] text-white shadow-lg hover:bg-[#588558]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirm Level Up (+{selectedXp} XP)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && (
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowConfirmation(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 text-center"
              >
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  High Rarity Warning
                </h3>
                <p className="text-gray-600 mb-6">
                  You have selected <strong>Rare+</strong> or{" "}
                  <strong>Leveled</strong> cards to consume. These cards will be
                  lost forever. Are you sure?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmLevelUp}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg"
                  >
                    Consume
                  </button>
                </div>
              </motion.div>
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
