"use client";

import CurrencyHeader from "@/components/features/gacha/CurrencyHeader";
import GachaRevealView from "@/components/features/gacha/GachaRevealView";
import GachaSelection from "@/components/features/gacha/GachaSelection";
import SummonResults from "@/components/features/gacha/SummonResults";
import { AppState, GameResources } from "@/hooks/useGameState";
import { useState } from "react";

interface GachaScreenProps {
  resources: GameResources;
  onSelectionModeChange: (isSelection: boolean) => void;
  onNavigate: (screen: AppState) => void;
}

import { Card, Resource } from "@/types/game";
import TopBar from "./features/home/TopBar";
import BackButtonTopBar from "./common/BackButtonTopBar";

// ... imports

export default function GachaScreen({
  resources,
  onSelectionModeChange,
  onNavigate,
}: GachaScreenProps) {
  const [showCard, setShowCard] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [summonResults, setSummonResults] = useState<(Card | Resource)[]>([]);

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
    setShowResults(true);
  };

  const handleBackFromResults = () => {
    setShowResults(false);
    onSelectionModeChange(true);
  };

  const handleBackOnGacha = () => {
    onNavigate("home");
  };

  // 2. Card Reveal Overlay (Highest Priority)
  if (showCard) {
    return (
      <>
        <GachaRevealView onReset={handleReset} results={summonResults} />
      </>
    );
  }

  if (showResults) {
    return (
      <SummonResults results={summonResults} onBack={handleBackFromResults} />
    );
  }

  // 5. Selection View (Default)
  return (
    <>
      <BackButtonTopBar onBack={handleBackOnGacha} />
      <GachaSelection onSummon={handleSummon} />
    </>
  );
}
