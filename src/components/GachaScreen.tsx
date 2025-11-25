"use client";

import CurrencyHeader from "@/components/features/gacha/CurrencyHeader";
import GachaRevealView from "@/components/features/gacha/GachaRevealView";
import GachaSelection from "@/components/features/gacha/GachaSelection";
import { GameResources } from "@/hooks/useGameState";
import { useState } from "react";

interface GachaScreenProps {
  resources: GameResources;
}

import { Card, Resource } from "@/types/game";

// ... imports

export default function GachaScreen({ resources }: GachaScreenProps) {
  const [showCard, setShowCard] = useState(false);
  const [summonResults, setSummonResults] = useState<(Card | Resource)[]>([]);

  // ... useEffect

  const handleSummon = (
    type: "gem" | "gold",
    count: number,
    results?: (Card | Resource)[]
  ) => {
    if (type === "gold" && count === 1) {
      handleGoldRevealComplete();
    } else if (type === "gem" && results) {
      setSummonResults(results);
      handleRateUpRevealComplete();
    }
  };

  const handleGoldRevealComplete = () => {
    setShowCard(true);
  };

  const handleRateUpRevealComplete = () => {
    setShowCard(true);
  };

  const handleReset = () => {
    setShowCard(false);
  };

  // 2. Card Reveal Overlay (Highest Priority)
  if (showCard) {
    return <GachaRevealView onReset={handleReset} results={summonResults} />;
  }

  // 5. Selection View (Default)
  return (
    <>
      <CurrencyHeader gold={resources.gold} gems={resources.gems} />
      <GachaSelection onSummon={handleSummon} />
    </>
  );
}
