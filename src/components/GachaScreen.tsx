"use client";

import CurrencyHeader from "@/components/features/gacha/CurrencyHeader";
import GachaRevealView from "@/components/features/gacha/GachaRevealView";
import GachaSelection from "@/components/features/gacha/GachaSelection";
import { GameResources } from "@/hooks/useGameState";
import { useState } from "react";

interface GachaScreenProps {
  resources: GameResources;
  onSelectionModeChange: (isSelection: boolean) => void;
}

import { Card, Resource } from "@/types/game";
import TopBar from "./features/home/TopBar";

// ... imports

export default function GachaScreen({
  resources,
  onSelectionModeChange,
}: GachaScreenProps) {
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
    // Hide nav bar when showing card
    // Note: GachaScreen doesn't have direct access to setSelectionMode from props if not passed
    // But we can infer it should be passed based on the plan.
    // Wait, the plan said "Update GachaScreenProps to include onSelectionModeChange".
    // I need to update the interface first.
  };

  const handleRateUpRevealComplete = () => {
    setShowCard(true);
    onSelectionModeChange(false);
  };

  const handleReset = () => {
    setShowCard(false);
    onSelectionModeChange(true);
  };

  // 2. Card Reveal Overlay (Highest Priority)
  if (showCard) {
    return (
      <>
        <TopBar title="Card" />
        <GachaRevealView onReset={handleReset} results={summonResults} />
      </>
    );
  }

  // 5. Selection View (Default)
  return (
    <>
      <TopBar title="Summon" />
      <GachaSelection onSummon={handleSummon} />
    </>
  );
}
