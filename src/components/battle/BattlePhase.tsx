"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/types/game";
import Image from "next/image";

interface BattlePhaseProps {
  playerDeck: Card[];
  opponentDeck: Card[];
  onComplete: (
    result: "VICTORY" | "DEFEAT" | "DRAW",
    score: { player: number; opponent: number }
  ) => void;
}

type StatType = "ATK" | "HP";
type RoundState =
  | "START"
  | "STAT_REVEAL"
  | "PLAYER_TURN"
  | "OPPONENT_TURN"
  | "REVEAL"
  | "ROUND_RESULT";

export default function BattlePhase({
  playerDeck,
  opponentDeck,
  onComplete,
}: BattlePhaseProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [roundState, setRoundState] = useState<RoundState>("START");
  const [currentStat, setCurrentStat] = useState<StatType>("ATK");

  const [playerHand, setPlayerHand] = useState<Card[]>(playerDeck);
  const [opponentHand, setOpponentHand] = useState<Card[]>(opponentDeck);

  const [playerSelection, setPlayerSelection] = useState<Card | null>(null);
  const [opponentSelection, setOpponentSelection] = useState<Card | null>(null);

  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [roundWinner, setRoundWinner] = useState<
    "PLAYER" | "OPPONENT" | "DRAW" | null
  >(null);

  // --- Round Logic Flow ---

  // 1. Start Round
  useEffect(() => {
    if (roundState === "START") {
      const timer = setTimeout(() => {
        // Randomly pick stat
        const nextStat = Math.random() > 0.5 ? "ATK" : "HP";
        setCurrentStat(nextStat);
        setRoundState("STAT_REVEAL");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [roundState]);

  // 2. Stat Reveal -> Player Turn
  useEffect(() => {
    if (roundState === "STAT_REVEAL") {
      const timer = setTimeout(() => {
        setRoundState("PLAYER_TURN");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [roundState]);

  // 3. Player Turn (Handled by click handler)

  // 4. Opponent Turn (Simulated)
  useEffect(() => {
    if (roundState === "OPPONENT_TURN") {
      const timer = setTimeout(() => {
        // Simple AI: Pick best card for current stat, or random
        // Let's pick random for now to keep it unpredictable/fair-ish
        const randomIndex = Math.floor(Math.random() * opponentHand.length);
        const selected = opponentHand[randomIndex];
        setOpponentSelection(selected);
        setRoundState("REVEAL");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [roundState, opponentHand]);

  // 5. Reveal & Compare
  useEffect(() => {
    if (roundState === "REVEAL") {
      const timer = setTimeout(() => {
        if (!playerSelection || !opponentSelection) return;

        const playerVal =
          currentStat === "ATK" ? playerSelection.atk : playerSelection.hp;
        const opponentVal =
          currentStat === "ATK" ? opponentSelection.atk : opponentSelection.hp;

        let winner: "PLAYER" | "OPPONENT" | "DRAW" = "DRAW";
        if (playerVal > opponentVal) winner = "PLAYER";
        if (opponentVal > playerVal) winner = "OPPONENT";

        setRoundWinner(winner);

        if (winner === "PLAYER")
          setScore((s) => ({ ...s, player: s.player + 1 }));
        if (winner === "OPPONENT")
          setScore((s) => ({ ...s, opponent: s.opponent + 1 }));

        setRoundState("ROUND_RESULT");
      }, 1500); // Wait a bit to show cards before showing result
      return () => clearTimeout(timer);
    }
  }, [roundState, playerSelection, opponentSelection, currentStat]);

  // 6. Round Result -> Next Round or Finish
  useEffect(() => {
    if (roundState === "ROUND_RESULT") {
      const timer = setTimeout(() => {
        // Remove played cards
        setPlayerHand((prev) =>
          prev.filter((c) => c.id !== playerSelection?.id)
        );
        setOpponentHand((prev) =>
          prev.filter((c) => c.id !== opponentSelection?.id)
        );

        setPlayerSelection(null);
        setOpponentSelection(null);
        setRoundWinner(null);

        if (currentRound < 3) {
          setCurrentRound((r) => r + 1);
          setRoundState("START");
        } else {
          // End Game
          // Determine final result
          // We need to use the LATEST score, which we just updated.
          // However, state updates might be batched.
          // Let's calculate final result based on current score + round winner
          // Actually, the score state should be updated by next render, but inside this effect it might be stale if not careful.
          // But since we have a delay, it should be fine.

          // Let's just do it in a separate effect or use a ref if needed, but here is fine.
          // Wait, we need to check the score AFTER the update.
          // Let's do a quick check.
          // Actually, better to just call onComplete with the calculated result.

          let finalResult: "VICTORY" | "DEFEAT" | "DRAW" = "DRAW";
          // We can't trust `score` variable immediately here if we just set it in the previous step?
          // Actually, we are in a new render cycle because `roundState` changed to ROUND_RESULT.
          // So `score` should be updated.

          if (score.player > score.opponent) finalResult = "VICTORY";
          else if (score.opponent > score.player) finalResult = "DEFEAT";
          else finalResult = "DRAW"; // Or maybe total stats tiebreaker? For now DRAW.

          onComplete(finalResult, score);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [
    roundState,
    currentRound,
    score,
    onComplete,
    playerSelection,
    opponentSelection,
  ]);

  const handleCardClick = (card: Card) => {
    if (roundState !== "PLAYER_TURN") return;
    setPlayerSelection(card);
    setRoundState("OPPONENT_TURN");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F5EEDF] relative overflow-hidden">
      {/* Top Bar: Round & Score */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white font-bold">
            P
          </div>
          <div className="text-2xl font-black text-[#2D3748]">
            {score.player}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white/80 px-4 py-1 rounded-full text-xs font-bold tracking-widest text-[#4A5568] shadow-sm">
            ROUND {currentRound}/3
          </div>
          {/* Stat Indicator */}
          <AnimatePresence mode="wait">
            {currentStat && roundState !== "START" && (
              <motion.div
                key={currentStat}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className={`mt-2 px-3 py-1 rounded text-white font-bold text-sm flex items-center gap-1 shadow-md ${
                  currentStat === "ATK" ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {currentStat === "ATK" ? "⚔ ATK" : "🛡 HP"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-2xl font-black text-[#2D3748]">
            {score.opponent}
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white font-bold">
            O
          </div>
        </div>
      </div>

      {/* Battle Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Opponent Card Slot */}
        <div className="mb-8 relative w-32 h-48">
          <AnimatePresence>
            {opponentSelection && (
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full h-full"
              >
                <div
                  className={`w-full h-full rounded-lg border-4 bg-white shadow-xl overflow-hidden relative ${
                    roundState === "REVEAL" || roundState === "ROUND_RESULT"
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                >
                  {roundState === "REVEAL" || roundState === "ROUND_RESULT" ? (
                    <>
                      <Image
                        src={opponentSelection.image}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 w-full bg-black/70 text-white text-center font-bold py-1">
                        {currentStat === "ATK"
                          ? opponentSelection.atk
                          : opponentSelection.hp}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#2D3748] flex items-center justify-center">
                      <span className="text-4xl">?</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VS / Result Text */}
        <div className="h-16 flex items-center justify-center z-30">
          <AnimatePresence mode="wait">
            {roundState === "START" && (
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-3xl font-black text-[#2D3748]"
              >
                READY?
              </motion.h2>
            )}
            {roundState === "STAT_REVEAL" && (
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1.5 }}
                exit={{ scale: 0 }}
                className={`text-4xl font-black ${
                  currentStat === "ATK" ? "text-red-600" : "text-blue-600"
                }`}
              >
                {currentStat}!
              </motion.h2>
            )}
            {roundState === "PLAYER_TURN" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[#4A5568] font-bold animate-pulse"
              >
                CHOOSE YOUR CARD
              </motion.div>
            )}
            {roundState === "ROUND_RESULT" && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                className={`text-4xl font-black ${
                  roundWinner === "PLAYER"
                    ? "text-green-600"
                    : roundWinner === "OPPONENT"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {roundWinner === "PLAYER"
                  ? "YOU WIN!"
                  : roundWinner === "OPPONENT"
                  ? "LOST!"
                  : "DRAW"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Card Slot (Active) */}
        <div className="mt-8 relative w-32 h-48">
          <AnimatePresence>
            {playerSelection && (
              <motion.div
                layoutId={`card-${playerSelection.id}`}
                className="w-full h-full"
              >
                <div
                  className={`w-full h-full rounded-lg border-4 bg-white shadow-xl overflow-hidden relative ${
                    roundState === "REVEAL" || roundState === "ROUND_RESULT"
                      ? "border-blue-500"
                      : "border-gray-400"
                  }`}
                >
                  <Image
                    src={playerSelection.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-black/70 text-white text-center font-bold py-1">
                    {currentStat === "ATK"
                      ? playerSelection.atk
                      : playerSelection.hp}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Hand */}
      <div className="h-40 bg-white/30 backdrop-blur-md border-t border-white/20 p-4 flex items-center justify-center gap-4 z-20">
        <AnimatePresence>
          {playerHand.map((card) => (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              whileHover={{ y: -20, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(card)}
              className={`w-20 h-28 rounded-lg overflow-hidden relative shadow-lg cursor-pointer transition-all ${
                roundState !== "PLAYER_TURN"
                  ? "opacity-50 grayscale cursor-not-allowed"
                  : "hover:ring-2 ring-blue-400"
              }`}
            >
              <Image
                src={card.image}
                alt={card.name}
                fill
                className="object-cover"
              />
              {/* Stat Badges */}
              <div className="absolute top-0.5 left-0.5 flex flex-col gap-0.5">
                <div
                  className={`text-[8px] font-bold px-1 rounded text-white ${
                    currentStat === "ATK"
                      ? "bg-red-500 ring-1 ring-white"
                      : "bg-black/50"
                  }`}
                >
                  ⚔ {card.atk}
                </div>
                <div
                  className={`text-[8px] font-bold px-1 rounded text-white ${
                    currentStat === "HP"
                      ? "bg-blue-500 ring-1 ring-white"
                      : "bg-black/50"
                  }`}
                >
                  🛡 {card.hp}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
