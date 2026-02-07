/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Card } from "@/types/game";
import { AppState } from "@/hooks/useGameState";
import SelectCardsPhase from "./SelectCardsPhase";
import MatchmakingPhase from "./MatchmakingPhase";
import ResultPhase from "./ResultPhase";
import RewardsPhase from "./RewardsPhase";
import VersusPhase from "./VersusPhase";
import { generateRandomPlayerInfo } from "@/lib/rarityStyles";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CardBattle from "./BattlePhaseNew";

import DeckSelectionScreen from "./DeckSelectionScreen";
import BattlePhase from "./BattlePhase";

export type BattlePhaseType =
  | "DECK"
  | "SELECT"
  | "MATCHMAKING"
  | "VERSUS"
  | "BATTLE"
  | "RESULT"
  | "REWARDS";

interface BattleFlowProps {
  onNavigate: (screen: AppState) => void;
  onBack: () => void;
  setBattleNavVisible: (visible: boolean) => void;
  selectedBattleModeId?: string | null;
}

const DECK_STORAGE_KEY = "player_deck_v1";

export default function BattleFlow({
  onNavigate,
  onBack,
  setBattleNavVisible,
  selectedBattleModeId,
}: BattleFlowProps) {
  console.log(
    "BattleFlow render - selectedBattleModeId:",
    selectedBattleModeId,
  );
  const [phase, setPhase] = useState<BattlePhaseType>("DECK");
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);

  // Load deck on mount
  useEffect(() => {
    try {
      const savedDeck = localStorage.getItem(DECK_STORAGE_KEY);
      if (savedDeck) {
        const parsed = JSON.parse(savedDeck);
        if (Array.isArray(parsed)) {
          // Validate cards
          const validCards = parsed.filter(
            (c) => c && typeof c === "object" && c.state,
          );
          setPlayerDeck(validCards);
        }
      }
    } catch (e) {
      console.error("Failed to load deck", e);
    }
  }, []);

  useEffect(() => {
    if (phase === "DECK") {
      setBattleNavVisible(false);
    } else {
      setBattleNavVisible(false);
    }
  }, [phase, setBattleNavVisible]);

  const playerInfo = useSelector((state: RootState) => state.player);
  const { inventory } = playerInfo;
  const [opponentDeck, setOpponentDeck] = useState<Card[]>([]);
  const [battleResult, setBattleResult] = useState<
    "VICTORY" | "DEFEAT" | "DRAW"
  >("DRAW");
  const [finalScore, setFinalScore] = useState<{
    player: number;
    opponent: number;
  }>({ player: 0, opponent: 0 });

  const handleDeckConfirmed = (deck: Card[]) => {
    setPlayerDeck(deck);
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(deck));
    setPhase("DECK");
  };

  const handleAutoForm = () => {
    // 1. Filter for unique cards by ID (taking the highest power instance of each)
    const uniqueCardsMap = new Map<string, Card>();

    // Filter out invalid cards first
    const validInventory = inventory.filter((card) => card && card.state);

    validInventory.forEach((card) => {
      const existing = uniqueCardsMap.get(card.id);
      if (!existing) {
        uniqueCardsMap.set(card.id, card);
      } else {
        // If we have a duplicate ID, keep the one with higher stats
        if (
          (card.state.def || 0) + (card.state.pow || 0) >
          (existing.state.def || 0) + (existing.state.pow || 0)
        ) {
          uniqueCardsMap.set(card.id, card);
        }
      }
    });

    const uniqueInventory = Array.from(uniqueCardsMap.values());

    // 2. Sort unique inventory by power (HP + ATK)
    const sorted = uniqueInventory.sort((a, b) => {
      return b.state.def + b.state.pow - (a.state.def + a.state.pow);
    });

    // 3. Take top 3
    const top3 = sorted.slice(0, 3);

    setPlayerDeck(top3);
    localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(top3));
  };

  const handleStartBattle = () => {
    if (playerDeck.length === 3) {
      setPhase("MATCHMAKING");
    }
  };

  const handleMatchFound = (opponentCards: Card[]) => {
    setOpponentDeck(opponentCards);
    setPhase("VERSUS");
  };

  const handleVersusComplete = () => {
    setPhase("BATTLE");
  };

  const handleBattleComplete = () => {
    console.log(`Debug - aaaaaaaaaaaaaaaaaaa`);
  };

  const { level } = playerInfo;

  const opponentInfo = generateRandomPlayerInfo(level || 1);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "DECK" && (
          <DeckSelectionScreen
            key="deck"
            deck={playerDeck}
            onEditDeck={() => setPhase("SELECT")}
            onStartBattle={handleStartBattle}
            onAutoForm={handleAutoForm}
            onBack={onBack}
            selectedBattleModeId={selectedBattleModeId}
          />
        )}
        {phase === "SELECT" && (
          <SelectCardsPhase
            key="select"
            initialDeck={playerDeck}
            onConfirm={handleDeckConfirmed}
            onBack={() => setPhase("DECK")}
          />
        )}
        {phase === "MATCHMAKING" && (
          <MatchmakingPhase
            key="matchmaking"
            onMatchFound={handleMatchFound}
            playerDeck={playerDeck}
            selectedBattleModeId={selectedBattleModeId}
          />
        )}
        {phase === "VERSUS" && (
          <VersusPhase
            key="versus"
            playerDeck={playerDeck}
            opponentInfo={opponentInfo}
            opponentDeck={opponentDeck}
            onComplete={handleVersusComplete}
          />
        )}
        {phase === "BATTLE" && (
          // <BattlePhase
          //   key="battle"
          //   playerDeck={playerDeck}
          //   opponentInfo={opponentInfo}
          //   opponentDeck={opponentDeck}
          //   onComplete={handleBattleComplete}
          // />
          <CardBattle
            playerDeck={playerDeck}
            opponentDeck={opponentDeck}
            playerInfo={playerInfo}
            opponentInfo={opponentInfo}
            onComplete={onBack}
          />
        )}
        {phase === "RESULT" && (
          <ResultPhase
            key="result"
            result={battleResult}
            opponentInfo={opponentInfo}
            score={finalScore}
            playerDeck={playerDeck}
            onContinue={() => setPhase("REWARDS")}
            onTryAgain={() => setPhase("DECK")}
            onHome={() => onNavigate("home")}
          />
        )}
        {phase === "REWARDS" && (
          <RewardsPhase key="rewards" onClaim={() => onNavigate("home")} />
        )}
      </AnimatePresence>
    </div>
  );
}
