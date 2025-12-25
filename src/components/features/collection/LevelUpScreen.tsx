import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { RootState } from "@/store/store";
import { Card, Rarity } from "@/types/game";
import { consumeCardsForXp, spendGold } from "@/store/slices/playerSlice";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";
import BackButtonTopBar from "@/components/common/BackButtonTopBar";
import LevelUpPopup from "./LevelUpPopup";
import CardInfoLevelProgressBar from "./CardInfoLevelProgressBar";

// Helper for XP calculation
const getXpValue = (c: Card) => {
  let base = 100;
  if (c.rarity === "COMMON") base = 50;
  else if (c.rarity === "UNCOMMON") base = 100;
  else if (c.rarity === "RARE") base = 200;

  const final = base * (c.level || 1);
  return final > 5000 ? 5000 : final;
};

interface LevelUpScreenProps {
  card: Card;
  onBack: () => void;
}

const DECK_STORAGE_KEY = "player_deck_v1";

export default function LevelUpScreen({ card, onBack }: LevelUpScreenProps) {
  const dispatch = useDispatch();
  const {
    inventory,
    level: playerLevel,
    gold,
  } = useSelector((state: RootState) => state.player);

  // Local state
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [levelUpStats, setLevelUpStats] = useState({
    oldLevel: 1,
    newLevel: 1,
    oldPow: 0,
    newPow: 0,
    oldSpd: 0,
    newSpd: 0,
    oldDef: 0,
    newDef: 0,
  });

  // Deck State
  const [deckInstanceIds, setDeckInstanceIds] = useState<Set<string>>(
    new Set()
  );

  // Load Deck
  useEffect(() => {
    try {
      const savedDeck = localStorage.getItem(DECK_STORAGE_KEY);
      if (savedDeck) {
        const parsed = JSON.parse(savedDeck);
        if (Array.isArray(parsed)) {
          const ids = new Set(
            parsed.map((c: any) => c.instanceId).filter(Boolean) as string[]
          );
          setDeckInstanceIds(ids);
        }
      }
    } catch (e) {
      console.error("Failed to load deck for locking", e);
    }
  }, []);

  // Filter States
  const [rarityFilter, setRarityFilter] = useState<Rarity | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleFodderCount, setVisibleFodderCount] = useState(21);
  const FODDER_INCREMENT = 21;

  // Active card
  const activeCard = useMemo(() => {
    return inventory.find((c) => c.instanceId === card.instanceId) || card;
  }, [inventory, card]);

  // Available Fodder with Locking Logic
  const availableCards = useMemo(() => {
    if (!activeCard) return [];

    let result = inventory.filter(
      (c) => c.instanceId !== activeCard.instanceId
    );

    if (rarityFilter !== "ALL") {
      result = result.filter((c) => c.rarity === rarityFilter);
    }

    // Sort: Unlocked first, then by XP/Rarity
    result.sort((a, b) => {
      const isLockedA =
        deckInstanceIds.has(a.instanceId || "") || a.id === activeCard.id;
      const isLockedB =
        deckInstanceIds.has(b.instanceId || "") || b.id === activeCard.id;

      if (isLockedA !== isLockedB) {
        return isLockedA ? 1 : -1; // Locked cards go to bottom
      }

      const xpA = getXpValue(a);
      const xpB = getXpValue(b);
      return sortOrder === "asc" ? xpA - xpB : xpB - xpA;
    });

    return result;
  }, [inventory, activeCard, rarityFilter, sortOrder, deckInstanceIds]);

  // Reset pagination
  useEffect(() => {
    setVisibleFodderCount(FODDER_INCREMENT);
  }, [availableCards]);

  // Infinite Scroll Observer
  const observerTarget = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleFodderCount < availableCards.length
        ) {
          setVisibleFodderCount((prev) => prev + FODDER_INCREMENT);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, visibleFodderCount, availableCards.length]);

  // XP Calculations
  const selectedXp = useMemo(() => {
    let total = 0;
    inventory.forEach((c) => {
      if (selectedInstanceIds.includes(c.instanceId || "")) {
        total += getXpValue(c);
      }
    });
    return total;
  }, [selectedInstanceIds, inventory]);

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
    // Check locks
    if (deckInstanceIds.has(id)) return; // In Deck
    if (c.id === activeCard.id) return; // Rank Up (Duplicate)

    if (selectedInstanceIds.includes(id)) {
      setSelectedInstanceIds((prev) => prev.filter((i) => i !== id));
    } else {
      if (isAtPlayerCap) return;
      // No limit on selection
      setSelectedInstanceIds((prev) => [...prev, id]);
    }
  };

  const handleConfirmLevelUp = () => {
    if (!activeCard) return;

    const currentLevel = activeCard.level;
    const currentPow = activeCard.state.pow;
    const currentSpd = activeCard.state.spd;
    const currentDef = activeCard.state.def;

    let tempLevel = currentLevel;
    let tempPow = currentPow;
    let tempSpd = currentSpd;
    let tempDef = currentDef;

    const levelsGained = predictedLevel - currentLevel;
    const goldCost = selectedInstanceIds.length * 10;

    if (gold < goldCost) return;

    for (let i = 0; i < levelsGained; i++) {
      tempLevel++;
      tempPow += 2;
      tempSpd += 2;
      tempDef += 2;
    }

    setLevelUpStats({
      oldLevel: currentLevel,
      newLevel: tempLevel,
      oldPow: currentPow,
      newPow: tempPow,
      oldSpd: currentSpd,
      newSpd: tempSpd,
      oldDef: currentDef,
      newDef: tempDef,
    });

    dispatch(spendGold(goldCost));
    dispatch(
      consumeCardsForXp({
        targetInstanceId: activeCard.instanceId || "",
        consumedInstanceIds: selectedInstanceIds,
      })
    );
    setSelectedInstanceIds([]);

    if (levelsGained > 0) {
      setShowLevelUpPopup(true);
    }
  };

  const borderColor = getRarityBorderColor(activeCard.rarity);
  const levelsGained = predictedLevel - activeCard.level;
  // Cost logic: 10 gold per card consumed (as established in previous step)
  const cost = selectedInstanceIds.length * 10;

  return (
    <div className="relative w-full h-full bg-[#FFFFFF] flex flex-col overflow-hidden rounded-t-3xl">
      <BackButtonTopBar onBack={onBack} />

      {/* Fixed Header Section */}
      <div className="p-4 pb-0 flex flex-col gap-6 shrink-0 z-10 bg-white shadow-sm">
        {/* Header Card Info */}
        <div className="flex gap-4">
          <div
            className="w-24 relative rounded-xl overflow-hidden shrink-0"
            style={{
              aspectRatio: "2/3",
              boxShadow: `inset 0 0 0 2px ${borderColor}`,
            }}
          >
            <Image
              src={activeCard.image}
              alt={activeCard.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <h2 className="text-xl font-bold text-[#1a2e2e]">
              {activeCard.name}
            </h2>
            {/* Reverted to CardInfoLevelProgressBar */}
            <CardInfoLevelProgressBar
              level={isAtPlayerCap ? "MAX" : predictedLevel}
              currentXp={
                selectedInstanceIds.length > 0
                  ? predictedXp
                  : activeCard.experience
              }
              requiredXp={
                selectedInstanceIds.length > 0
                  ? predictedLevel * 100
                  : activeCard.level * 100
              }
            />
          </div>
        </div>

        <div className="h-px w-full bg-black/5" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">
        {/* Filters - Reverted to Pill Style */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sticky top-0 bg-white z-10 pt-2">
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
        <div className="grid grid-cols-3 gap-3 mt-2">
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
                  isSelected={selectedInstanceIds.includes(c.instanceId || "")}
                  isDeck={deckInstanceIds.has(c.instanceId || "")}
                  isRankUp={c.id === activeCard.id}
                  onToggle={() => handleToggleCard(c)}
                />
              ))
          )}
          {visibleFodderCount < availableCards.length && (
            <div
              ref={observerTarget}
              className="col-span-3 py-4 flex justify-center"
            >
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar - New Button Style */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-black/5 shadow-lg z-10">
        <button
          disabled={selectedInstanceIds.length === 0 || gold < cost}
          onClick={handleConfirmLevelUp}
          className={`w-full py-2 rounded-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center leading-none shadow-lg ${
            selectedInstanceIds.length > 0 && gold >= cost
              ? "bg-[#4ade80] border-[#22c55e] hover:bg-[#22c55e]"
              : "bg-gray-400 border-gray-500 cursor-not-allowed grayscale"
          }`}
        >
          <span
            className="text-white font-black text-lg italic uppercase drop-shadow-md"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            LEVEL UP
          </span>
          <div className="flex items-center gap-1 bg-black/20 px-2 rounded-full mt-0.5">
            <Image
              src="/assets/icons/gold-coin.webp"
              alt="gold"
              width={12}
              height={12}
            />
            <span className="text-white font-bold text-xs">{cost}</span>
          </div>
        </button>
      </div>

      {/* Level Up Popup */}
      <AnimatePresence>
        {showLevelUpPopup && (
          <LevelUpPopup
            {...levelUpStats}
            onClose={() => {
              setShowLevelUpPopup(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Memoized Fodder Card Component
const FodderCardComponent = ({
  card,
  isSelected,
  isDeck,
  isRankUp,
  onToggle,
}: {
  card: Card;
  isSelected: boolean;
  isDeck: boolean;
  isRankUp: boolean;
  onToggle: () => void;
}) => {
  const borderColor = getRarityBorderColor(card.rarity);
  const isLocked = isDeck || isRankUp;

  return (
    <motion.div
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={onToggle}
      className={`relative aspect-[2/3] rounded-lg cursor-pointer shadow-lg group bg-gray-800 overflow-hidden ${
        isLocked ? "opacity-80" : ""
      }`}
      style={{
        boxShadow: isSelected
          ? `0 0 0 3px #fbbf24, 0 0 15px #fbbf24` // Thicker border + Strong Glow
          : `inset 0 0 0 2px ${borderColor}`,
        transform: isSelected ? "scale(0.95)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {/* Card Image */}
      <Image
        src={card.image}
        alt={card.name}
        fill
        sizes="(max-width: 768px) 25vw, 100px"
        className={`object-cover ${isLocked ? "grayscale-[0.5]" : ""}`}
      />

      {/* Level Badge */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold drop-shadow-md z-10">
        Lvl {card.level}
      </div>

      {/* Stars */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-0.5 z-10">
        {"★"
          .repeat(
            card.rarity === "COMMON" ? 1 : card.rarity === "UNCOMMON" ? 2 : 3
          )
          .split("")
          .map((s, i) => (
            <span key={i} className="text-yellow-400 text-[8px]">
              {s}
            </span>
          ))}
      </div>

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-yellow-500/30 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/50 to-transparent" />
          <Image
            src="/assets/icons/correct.webp"
            alt="Selected"
            width={40}
            height={40}
            className="relative z-10"
            style={{
              filter:
                "drop-shadow(0 0 5px #fbbf24) drop-shadow(0 0 10px #fbbf24)",
            }}
          />
        </div>
      )}

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
          <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mb-1 border border-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {isDeck && (
            <span className="text-white text-[8px] font-black uppercase tracking-wider bg-blue-600 px-1 rounded">
              IN DECK
            </span>
          )}
          {isRankUp && (
            <span className="text-white text-[8px] font-black uppercase tracking-wider bg-purple-600 px-1 rounded">
              RANK UP
            </span>
          )}
        </div>
      )}

      {/* Unit Type Icon (Top Left) */}
      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-yellow-500 rounded-sm border border-black flex items-center justify-center z-10">
        <span className="text-[8px] font-bold text-black">U</span>
      </div>
    </motion.div>
  );
};

const FodderCard = React.memo(FodderCardComponent);
