"use client";

import { useState, useEffect } from "react";
import GachaSelection from "@/components/features/gacha/GachaSelection";
import GachaDetail from "@/components/features/gacha/GachaDetail";
import GachaOpeningView from "@/components/features/gacha/GachaOpeningView";
import GachaRevealView from "@/components/features/gacha/GachaRevealView";
import CurrencyHeader from "@/components/features/gacha/CurrencyHeader";
import GoldSummonRevel from "@/components/features/gacha/GoldSummonRevel";
import { GameResources } from "@/hooks/useGameState";

interface GachaScreenProps {
  resources: GameResources;
  onSelectionModeChange?: (isSelection: boolean) => void;
}

export default function GachaScreen({
  resources,
  onSelectionModeChange,
}: GachaScreenProps) {
  const [selectedBox, setSelectedBox] = useState<"gem" | "gold" | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [isGoldReveal, setIsGoldReveal] = useState(false);

  // Notify parent of navigation state changes
  useEffect(() => {
    if (onSelectionModeChange) {
      const isSelection =
        !selectedBox && !isOpening && !isOpened && !showCard && !isGoldReveal;
      onSelectionModeChange(isSelection);
    }
  }, [
    selectedBox,
    isOpening,
    isOpened,
    showCard,
    isGoldReveal,
    onSelectionModeChange,
  ]);

  const handleSummon = (type: "gem" | "gold", count: number) => {
    if (type === "gold" && count === 1) {
      handleGoldRevealComplete();
    } else {
      // Default behavior for now (or handle other types)
      setSelectedBox(type);
    }
  };

  const handleGoldRevealComplete = () => {
    setIsGoldReveal(false);
    setShowCard(true);
  };

  const handleOpen = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);

    // Sequence: Shake -> Burst -> Open -> Show Card
    setTimeout(() => {
      setIsOpened(true);
      setIsOpening(false);
      setTimeout(() => setShowCard(true), 500);
    }, 2000);
  };

  const handleReset = () => {
    setShowCard(false);
    setIsOpened(false);
    setIsOpening(false);
    setIsGoldReveal(false);
    // Optional: Return to selection or stay on detail?
    // Usually stay on detail to pull again, but let's keep it simple for now.
  };

  const handleBack = () => {
    setSelectedBox(null);
  };

  // 1. Gold Reveal Animation (Special Case)
  if (isGoldReveal) {
    return (
      <GoldSummonRevel autoStart={true} onComplete={handleGoldRevealComplete} />
    );
  }

  // 2. Card Reveal Overlay (Highest Priority)
  if (showCard) {
    return <GachaRevealView onReset={handleReset} />;
  }

  // 3. Chest Opening Animation (Legacy/Gem)
  if (isOpening || isOpened) {
    return <GachaOpeningView isOpening={isOpening} isOpened={isOpened} />;
  }

  // 4. Detail View (Selected Box)
  if (selectedBox) {
    return (
      <GachaDetail type={selectedBox} onBack={handleBack} onOpen={handleOpen} />
    );
  }

  // 5. Selection View (Default)
  return (
    <>
      <CurrencyHeader gold={resources.gold} gems={resources.gems} />
      <GachaSelection onSummon={handleSummon} />
    </>
  );
}
