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
}

const DECK_STORAGE_KEY = "player_deck_v1";

export default function BattleFlow({
  onNavigate,
  onBack,
  setBattleNavVisible,
}: BattleFlowProps) {
  const [phase, setPhase] = useState<BattlePhaseType>("DECK");
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);

  // Load deck on mount
  useEffect(() => {
    try {
      const savedDeck = localStorage.getItem(DECK_STORAGE_KEY);
      if (savedDeck) {
        setPlayerDeck(JSON.parse(savedDeck));
      }
    } catch (e) {
      console.error("Failed to load deck", e);
    }
  }, []);

  useEffect(() => {
    if (phase === "DECK") {
      setBattleNavVisible(true);
    } else {
      setBattleNavVisible(false);
    }
  }, [phase, setBattleNavVisible]);

  const { inventory } = useSelector((state: RootState) => state.player);
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
    // Sort inventory by power (HP + ATK)
    const sorted = [...inventory].sort((a, b) => {
      return b.hp + b.atk - (a.hp + a.atk);
    });

    // Take top 3
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

  const { level } = useSelector((state: RootState) => state.player);

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
          <MatchmakingPhase key="matchmaking" onMatchFound={handleMatchFound} />
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
        {phase === "BATTLE" && <CardBattle />}
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
