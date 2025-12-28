/* eslint-disable @typescript-eslint/no-explicit-any */
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
import LevelUpAnimation from "./LevelUpAnimation";
import CardInfoLevelProgressBar from "./CardInfoLevelProgressBar";
import CardInfoModal from "./CardInfoModal";

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
  const [infoCard, setInfoCard] = useState<Card | null>(null);
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
    const currentPow = activeCard.state?.pow || 0;
    const currentSpd = activeCard.state?.spd || 0;
    const currentDef = activeCard.state?.def || 0;

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
    <div className="relative w-full h-full flex flex-col overflow-hidden rounded-t-3xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[-1] pointer-events-none bg-[#F5F2EB]"
      >
        <Image
          src="/assets/background/light-bg.webp"
          alt="Background"
          fill
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60" />
      </motion.div>

      <BackButtonTopBar onBack={onBack} showCoins={true} showGems={false} />

      {/* Fixed Header Section */}
      <div className="p-4 pb-0 flex flex-col gap-6 shrink-0 z-10shadow-sm">
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
              className="object-cover scale-90"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex justify-between items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a2e2e]">
                {activeCard.name}
              </h2>
              <span className="text-xs font-bold text-black/40">
                Max LVL {playerLevel}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              {/* Reverted to CardInfoLevelProgressBar */}
              <div className="w-full">
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
              <div className="relative min-w-[60px]">
                {selectedXp > 0 && (
                  <span className="text-sm text-[#34a334]">
                    (+{selectedXp})
                  </span>
                )}
              </div>
            </div>
            <button
              disabled={selectedInstanceIds.length === 0 || gold < cost}
              onClick={handleConfirmLevelUp}
              className={`bg-[#6A0DAD] text-white rounded-xl py-2 px-2 flex flex-col items-center justify-center shadow-lg border-2 border-[#C5A059] active:border-b-2 active:translate-y-1 transition-all relative overflow-hidden group ${
                selectedInstanceIds.length === 0 || gold < cost
                  ? "grayscale opacity-50 cursor-not-allowed pointer-events-none"
                  : "cursor-pointer"
              }`}
              style={{
                background: "linear-gradient(180deg, #4c2a85 0%, #3a1e69 100%)",
                boxShadow:
                  "0 4px 0 #C5A059, 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <span className="text-lg max-[400px]:text-sm text-[#FDB931] font-bold tracking-wider relative z-10">
                LEVEL UP
              </span>
              <div className="flex items-center gap-1 bg-black/20 px-2 rounded-full mt-0.5">
                <Image
                  src="/assets/icons/gold-coin.webp"
                  alt="gold"
                  width={12}
                  height={12}
                />
                <span className="text-white font-bold text-xs">
                  {gold < cost ? "Not Enough Gold" : cost}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-black/5" />
      </div>

      {/* Filters - Reverted to Pill Style */}
      <div className="flex gap-2 overflow-x-auto py-2 px-4 scrollbar-hide sticky top-0 z-30 pt-2">
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mb-2 px-4 scrollbar-hide">
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
                  onLongPress={() => setInfoCard(c)}
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

      {/* Level Up Popup */}
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUpPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: "brightness(0.5)" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute inset-0 z-50"
          >
            {/* Flash Overlay */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 bg-white z-[60] pointer-events-none mix-blend-overlay"
            />

            <LevelUpAnimation
              card={activeCard}
              oldLevel={levelUpStats.oldLevel}
              newLevel={levelUpStats.newLevel}
              oldStats={{
                pow: levelUpStats.oldPow,
                spd: levelUpStats.oldSpd,
                def: levelUpStats.oldDef,
              }}
              newStats={{
                pow: levelUpStats.newPow,
                spd: levelUpStats.newSpd,
                def: levelUpStats.newDef,
              }}
              onClose={() => {
                setShowLevelUpPopup(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Info Modal */}
      <AnimatePresence>
        {infoCard && (
          <div className="relative z-[100] pointer-events-auto">
            <CardInfoModal card={infoCard} onClose={() => setInfoCard(null)} />
          </div>
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
  onLongPress,
}: {
  card: Card;
  isSelected: boolean;
  isDeck: boolean;
  isRankUp: boolean;
  onToggle: () => void;
  onLongPress: () => void;
}) => {
  const borderColor = getRarityBorderColor(card.rarity);
  const isLocked = isDeck || isRankUp;

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = React.useRef(false);

  const startPress = () => {
    isLongPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      onLongPress();
    }, 1000); // 2 seconds
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressTriggered.current) {
      e.stopPropagation();
      return;
    }
    onToggle();
  };

  return (
    <motion.div
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onClick={handleClick}
      className={`relative aspect-[2/3] rounded-lg cursor-pointer shadow-lg group overflow-hidden ${
        isLocked ? "opacity-80" : ""
      }`}
      style={{
        boxShadow: isSelected
          ? `0 0 0 3px #fbbf24, 0 0 15px #fbbf24` // Thicker border + Strong Glow
          : `inset 0 0 0 4px ${borderColor}`,
        transform: isSelected ? "scale(0.95)" : "scale(1)",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <div className="absolute inset-0 z-0 opacity-80 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 flex items-center justify-center">
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
      <Image
        src={card.image}
        alt={card.name}
        fill
        sizes="(max-width: 768px) 25vw, 100px"
        className={`object-cover ${isLocked ? "grayscale-[0.5]" : ""}`}
      />

      {/* Level Badge */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold drop-shadow-md z-10 rounded-md px-2 py-1"
        style={{
          backgroundColor: borderColor,
        }}
      >
        Lvl {card.level}
      </div>

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl border-2 border-yellow-300 shadow-[0_0_15px_#fbbf24,inset_0_0_50px_rgba(251,191,36,0.6)]">
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-transparent" />
          <Image
            src="/assets/icons/correct.webp"
            alt="Selected"
            width={40}
            height={40}
            className="relative z-10 no-global-filter"
            style={{
              filter:
                "invert(1) sepia(1) saturate(500%) hue-rotate(5deg) drop-shadow(0 0 3px #fbbf24) drop-shadow(0 0 10px #f59e0b)",
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
    </motion.div>
  );
};

const FodderCard = React.memo(FodderCardComponent);
