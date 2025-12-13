"use client";

import { PlayerState } from "@/store/slices/playerSlice";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import profileIcons from "../../config/profileIcons.json";

interface BattlePhaseProps {
  playerDeck: Card[];
  opponentInfo: PlayerState;
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
  opponentInfo,
  opponentDeck,
  onComplete,
}: BattlePhaseProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [roundState, setRoundState] = useState<RoundState>("START");
  const [currentStat, setCurrentStat] = useState<StatType>("ATK");

  const { name: playerName, activeProfilePicId } = useSelector(
    (state: RootState) => state.player
  );

  const playerIcon =
    profileIcons.find((icon) => icon.id === activeProfilePicId) ||
    profileIcons[0];

  const opponentIcon =
    profileIcons.find((icon) => icon.id === opponentInfo.activeProfilePicId) ||
    profileIcons[0];

  const [playerHand, setPlayerHand] = useState<Card[]>(playerDeck);
  const [opponentHand, setOpponentHand] = useState<Card[]>(opponentDeck);

  const [playerSelection, setPlayerSelection] = useState<Card | null>(null);
  const [opponentSelection, setOpponentSelection] = useState<Card | null>(null);

  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [roundWinner, setRoundWinner] = useState<
    "PLAYER" | "OPPONENT" | "DRAW" | null
  >(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(10);
  const TOTAL_TIME = 10;

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
        setTimeLeft(TOTAL_TIME); // Reset timer
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [roundState]);

  // 3. Player Turn Timer & Auto-Select
  useEffect(() => {
    if (roundState === "PLAYER_TURN") {
      if (timeLeft > 0) {
        const timerId = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timerId);
      } else {
        // Time's up! Auto-select random card
        if (playerHand.length > 0) {
          const randomCard =
            playerHand[Math.floor(Math.random() * playerHand.length)];
          handleCardClick(randomCard);
        }
      }
    }
  }, [roundState, timeLeft, playerHand]);

  // 4. Opponent Turn (Simulated)
  useEffect(() => {
    if (roundState === "OPPONENT_TURN") {
      const timer = setTimeout(() => {
        // Simple AI: Pick best card for current stat, or random
        const randomIndex = Math.floor(Math.random() * opponentHand.length);
        const selected = opponentHand[randomIndex];
        setOpponentSelection(selected);
        setRoundState("REVEAL");
      }, 1000);
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
          let finalResult: "VICTORY" | "DEFEAT" | "DRAW" = "DRAW";
          if (score.player > score.opponent) finalResult = "VICTORY";
          else if (score.opponent > score.player) finalResult = "DEFEAT";
          else finalResult = "DRAW";

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
    <div className="w-full h-full flex flex-col bg-slate-900 relative overflow-hidden text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      {/* --- OPPONENT SECTION (TOP) --- */}
      <div className="relative z-10 w-full flex flex-col items-center pt-4">
        {/* Opponent Hand (Fanned) */}
        <div className="flex items-center justify-center -space-x-4 mb-2">
          {opponentHand.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="w-12 h-16 bg-slate-700 rounded border border-slate-500 shadow-lg relative transform hover:-translate-y-2 transition-transform"
              style={{
                transform: `rotate(${(index - 1) * 5}deg)`,
              }}
            >
              {/* Card Back Pattern */}
              <div className="w-full h-full bg-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.3)_5px,rgba(0,0,0,0.3)_10px)] opacity-50" />
                <div className="w-8 h-12 border border-slate-600 rounded-sm opacity-50" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Opponent Profile */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-red-500 overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.5)] z-10 relative bg-slate-800">
              <Image
                src={opponentIcon.imagePath}
                alt="Opponent"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs font-black px-3 py-1 rounded-full border border-slate-600 z-20 min-w-[60px] text-center shadow-lg">
              {score.opponent} PTS
            </div>
          </div>
          <span className="text-sm font-bold text-slate-300 mt-1 uppercase tracking-wider shadow-black drop-shadow-md">
            {opponentInfo.name}
          </span>
        </div>
      </div>

      {/* --- BATTLE ARENA (CENTER) --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-md mx-auto">
        {/* Round Info */}
        <div className="absolute top-0 text-cyan-400 font-black tracking-[0.2em] text-sm drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
          MATCH {currentRound}
        </div>

        {/* Stats Bar */}
        <div className="absolute top-8 flex gap-4 text-xs font-bold text-slate-400">
          <span
            className={`${
              currentStat === "ATK"
                ? "text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                : "opacity-50"
            } transition-all duration-300`}
          >
            ⚔ POW
          </span>
          <span
            className={`${
              currentStat === "HP"
                ? "text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                : "opacity-50"
            } transition-all duration-300`}
          >
            🛡 TGH
          </span>
        </div>

        {/* Drop Zone / Active Cards */}
        <div className="relative w-full h-64 flex items-center justify-center">
          {/* Placeholder Box */}
          {roundState === "PLAYER_TURN" && !playerSelection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-40 h-56 border-2 border-dashed border-cyan-500/50 rounded-lg flex flex-col items-center justify-center bg-cyan-900/10 backdrop-blur-sm"
            >
              <span className="text-cyan-400 font-bold text-sm animate-pulse">
                PICK A CARD
              </span>
              {/* Timer Bar */}
              <div className="w-32 h-1 bg-slate-700 rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: TOTAL_TIME, ease: "linear" }}
                  className="h-full bg-red-500"
                />
              </div>
            </motion.div>
          )}

          {/* Opponent Card Reveal */}
          <AnimatePresence>
            {opponentSelection && (
              <motion.div
                initial={{ y: -100, opacity: 0, scale: 0.5 }}
                animate={{ y: -60, opacity: 1, scale: 0.9 }}
                className="absolute z-20"
              >
                <div
                  className={`w-32 h-44 rounded-lg border-2 bg-slate-800 shadow-2xl overflow-hidden relative ${
                    roundState === "REVEAL" || roundState === "ROUND_RESULT"
                      ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      : "border-slate-600"
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
                      <div className="absolute bottom-0 w-full bg-black/80 text-white text-center font-black py-1 text-sm border-t border-red-500">
                        {currentStat === "ATK"
                          ? opponentSelection.atk
                          : opponentSelection.hp}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700 relative overflow-hidden">
                      {/* CSS Card Back Pattern */}
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] opacity-50" />
                      <div className="w-16 h-16 border-4 border-slate-500 rounded-full opacity-30" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Card Reveal */}
          <AnimatePresence>
            {playerSelection && (
              <motion.div
                layoutId={`card-${playerSelection.id}`}
                className="absolute z-30"
                initial={{ y: 100, scale: 1 }}
                animate={{ y: 40, scale: 1.1 }}
              >
                <div
                  className={`w-36 h-52 rounded-lg border-2 bg-slate-800 shadow-2xl overflow-hidden relative ${
                    roundState === "REVEAL" || roundState === "ROUND_RESULT"
                      ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                      : "border-slate-600"
                  }`}
                >
                  <Image
                    src={playerSelection.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-black/80 text-white text-center font-black py-1 text-sm border-t border-cyan-400">
                    {currentStat === "ATK"
                      ? playerSelection.atk
                      : playerSelection.hp}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Text Overlay */}
          <AnimatePresence>
            {roundState === "ROUND_RESULT" && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="absolute z-50 pointer-events-none"
              >
                <div
                  className={`text-5xl font-black italic tracking-tighter stroke-black stroke-2 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] ${
                    roundWinner === "PLAYER"
                      ? "text-green-400"
                      : roundWinner === "OPPONENT"
                      ? "text-red-500"
                      : "text-white"
                  }`}
                  style={{ textShadow: "0 0 10px currentColor" }}
                >
                  {roundWinner === "PLAYER"
                    ? "VICTORY!"
                    : roundWinner === "OPPONENT"
                    ? "CRUSHED!"
                    : "DRAW"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- PLAYER SECTION (BOTTOM) --- */}
      <div className="relative z-10 w-full flex flex-col items-center pb-6">
        {/* Player Profile */}
        <div className="flex flex-col items-center mb-4 relative">
          <span className="text-sm font-bold text-white mb-1 uppercase tracking-wider shadow-black drop-shadow-md">
            {playerName}
          </span>
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-cyan-400 overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.5)] z-10 relative bg-slate-800">
              <Image
                src={playerIcon.imagePath}
                alt="Player"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -right-14 top-1/2 -translate-y-1/2 bg-black/90 text-white text-sm font-black px-4 py-1 rounded-full border border-cyan-500/50 z-20 min-w-[70px] text-center shadow-lg">
              {score.player} PTS
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="flex items-center justify-center gap-3 px-4 w-full max-w-2xl">
          <AnimatePresence>
            {playerHand.map((card) => (
              <motion.div
                key={card.id}
                layoutId={`card-${card.id}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                whileHover={
                  roundState === "PLAYER_TURN" ? { y: -20, scale: 1.05 } : {}
                }
                whileTap={roundState === "PLAYER_TURN" ? { scale: 0.95 } : {}}
                onClick={() => handleCardClick(card)}
                className={`relative w-24 h-36 rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
                  roundState === "PLAYER_TURN"
                    ? "cursor-pointer hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] ring-2 ring-cyan-400/50"
                    : "opacity-50 grayscale cursor-not-allowed"
                }`}
              >
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover"
                />

                {/* Card Stats Overlay */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent pt-4 pb-1 px-1">
                  <div className="flex justify-between text-[10px] font-bold text-white">
                    <div
                      className={`${
                        currentStat === "ATK"
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      ⚔ {card.atk}
                    </div>
                    <div
                      className={`${
                        currentStat === "HP"
                          ? "text-blue-400"
                          : "text-slate-400"
                      }`}
                    >
                      🛡 {card.hp}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
