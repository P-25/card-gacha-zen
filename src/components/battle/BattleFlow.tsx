"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/types/game";
import { AppState } from "@/hooks/useGameState";
import SelectCardsPhase from "./SelectCardsPhase";
import MatchmakingPhase from "./MatchmakingPhase";
import BattlePhase from "./BattlePhase";
import ResultPhase from "./ResultPhase";
import RewardsPhase from "./RewardsPhase";
import VersusPhase from "./VersusPhase";
import { generateRandomPlayerInfo } from "@/lib/rarityStyles";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CardBattle from "./BattlePhaseNew";

export type BattlePhaseType =
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

export default function BattleFlow({
  onNavigate,
  onBack,
  setBattleNavVisible,
}: BattleFlowProps) {
  const [phase, setPhase] = useState<BattlePhaseType>("SELECT");

  useEffect(() => {
    if (phase === "SELECT") {
      setBattleNavVisible(true);
    } else {
      setBattleNavVisible(false);
    }
  }, [phase, setBattleNavVisible]);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [opponentDeck, setOpponentDeck] = useState<Card[]>([]);
  const [battleResult, setBattleResult] = useState<
    "VICTORY" | "DEFEAT" | "DRAW"
  >("DRAW");
  const [finalScore, setFinalScore] = useState<{
    player: number;
    opponent: number;
  }>({ player: 0, opponent: 0 });

  // Mock opponent deck generation
  const generateOpponentDeck = () => {
    // In a real app, this would pick from a pool or match based on ELO
    // For now, we'll just wait for the BattlePhase to handle it or pass it down
    // Actually, let's generate it here so we can show it in Versus
    // We'll need access to some cards. For now, we might need to fetch them or pass them.
    // We'll handle this in the specific phases or pass a generator function.
  };

  const handleDeckConfirmed = (deck: Card[]) => {
    setPlayerDeck(deck);
    setPhase("MATCHMAKING");
  };

  const handleMatchFound = (opponentCards: Card[]) => {
    setOpponentDeck(opponentCards);
    setPhase("VERSUS");
  };

  const handleVersusComplete = () => {
    setPhase("BATTLE");
  };

  const handleBattleComplete = (
    result: "VICTORY" | "DEFEAT" | "DRAW",
    score: { player: number; opponent: number }
  ) => {
    setBattleResult(result);
    setFinalScore(score);
    setPhase("RESULT");
  };

  const handleResultComplete = () => {
    if (battleResult === "VICTORY") {
      setPhase("REWARDS");
    } else {
      // If defeat, maybe go back home or try again
      // For now, let's just go back to select or home
      // But the UI shows "Try Again" or "Home"
      // We'll let the ResultPhase handle the buttons
    }
  };

  const { level } = useSelector((state: RootState) => state.player);

  const opponentInfo = generateRandomPlayerInfo(level || 1);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "SELECT" && (
          <SelectCardsPhase
            key="select"
            onConfirm={handleDeckConfirmed}
            onBack={onBack}
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
        {phase === "BATTLE" && (
          // <BattlePhase
          //   key="battle"
          //   playerDeck={playerDeck}
          //   opponentInfo={opponentInfo}
          //   opponentDeck={opponentDeck}
          //   onComplete={handleBattleComplete}
          // />
          <CardBattle />
        )}
        {phase === "RESULT" && (
          <ResultPhase
            key="result"
            result={battleResult}
            opponentInfo={opponentInfo}
            score={finalScore}
            playerDeck={playerDeck}
            onContinue={() => setPhase("REWARDS")}
            onTryAgain={() => setPhase("SELECT")}
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
