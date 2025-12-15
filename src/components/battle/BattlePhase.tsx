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

type AnimPhase = "IDLE" | "ZOOM" | "CLASH" | "HIT" | "DESTROY";

export default function BattlePhase({
  playerDeck,
  opponentInfo,
  opponentDeck,
  onComplete,
}: BattlePhaseProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [roundState, setRoundState] = useState<RoundState>("START");
  const [currentStat, setCurrentStat] = useState<StatType>("ATK");
  const [animPhase, setAnimPhase] = useState<AnimPhase>("IDLE");

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

  // Helper to check if we are in the battle/reveal phase
  const isBattleActive =
    roundState === "REVEAL" || roundState === "ROUND_RESULT";

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

  // 5. Reveal & Battle Logic (Cinematic Sequence)
  useEffect(() => {
    if (roundState === "REVEAL" && playerSelection && opponentSelection) {
      // Calculate winner
      const playerVal =
        currentStat === "ATK" ? playerSelection.atk : playerSelection.hp;
      const opponentVal =
        currentStat === "ATK" ? opponentSelection.atk : opponentSelection.hp;

      let winner: "PLAYER" | "OPPONENT" | "DRAW" = "DRAW";
      if (playerVal > opponentVal) winner = "PLAYER";
      else if (opponentVal > playerVal) winner = "OPPONENT";

      setRoundWinner(winner);

      // --- Animation Sequence ---
      // 1. ZOOM (Start)
      setAnimPhase("ZOOM");

      // 2. CLASH (Move to center)
      const t1 = setTimeout(() => {
        setAnimPhase("CLASH");
      }, 800);

      // 3. HIT (Attack/Impact)
      const t2 = setTimeout(() => {
        setAnimPhase("HIT");
      }, 1600);

      // 4. DESTROY (Resolve)
      const t3 = setTimeout(() => {
        setAnimPhase("DESTROY");
        // Update Score
        if (winner === "PLAYER") {
          setScore((s) => ({ ...s, player: s.player + 1 }));
        } else if (winner === "OPPONENT") {
          setScore((s) => ({ ...s, opponent: s.opponent + 1 }));
        }
      }, 2400);

      // 5. End Round
      const t4 = setTimeout(() => {
        setRoundState("ROUND_RESULT");
      }, 4000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
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
        setAnimPhase("IDLE");

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
      }, 1000); // Short delay before next round
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

      {/* --- BATTLE OVERLAY (Cinematic) --- */}
      {isBattleActive && playerSelection && opponentSelection && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Spotlight / Dim Background */}
          <div className="absolute inset-0 bg-black/80 animate-fadeIn" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full" />

          {/* VS Text */}
          <div
            className={`
             absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             flex flex-col items-center z-0 transition-all duration-300
             ${
               animPhase === "CLASH"
                 ? "opacity-100 scale-100"
                 : "opacity-0 scale-50"
             }
          `}
          >
            <span className="text-6xl font-black text-white italic drop-shadow-lg">
              VS
            </span>
            <span className="text-xl font-bold text-yellow-500 mt-2">
              {currentStat}
            </span>
          </div>

          {/* --- OPPONENT CARD (Top) --- */}
          <div
            className={`
              absolute transition-all duration-500 ease-out
              ${animPhase === "IDLE" ? "top-[-20%] scale-50 opacity-0" : ""}
              ${animPhase === "ZOOM" ? "top-[15%] scale-100 opacity-100" : ""}
              ${
                animPhase === "CLASH" ||
                animPhase === "HIT" ||
                animPhase === "DESTROY"
                  ? "top-[20%] scale-125"
                  : ""
              }
              
              /* Hit Reactions */
              ${
                animPhase === "HIT" && roundWinner === "PLAYER"
                  ? "animate-shake opacity-50"
                  : ""
              }
              ${
                animPhase === "HIT" && roundWinner === "OPPONENT"
                  ? "scale-150 z-20"
                  : ""
              } /* Winner lunges */

              /* Destroy Animation */
              ${
                animPhase === "DESTROY" && roundWinner === "PLAYER"
                  ? "opacity-0 scale-150 filter blur-xl grayscale"
                  : ""
              }
            `}
          >
            <div className="w-32 h-44 rounded-lg border-2 border-red-500 bg-slate-800 shadow-[0_0_30px_rgba(239,68,68,0.3)] overflow-hidden relative">
              <Image
                src={opponentSelection.image}
                alt=""
                fill
                priority
                className="object-cover"
              />
              {/* Stat Pop-up */}
              <div
                className={`
               absolute -right-12 top-10 bg-slate-900 text-white font-black text-2xl p-2 rounded-lg border-2 border-red-500 shadow-xl
               transition-all duration-300 transform
               ${
                 animPhase === "CLASH" || animPhase === "HIT"
                   ? "opacity-100 translate-x-0"
                   : "opacity-0 -translate-x-10"
               }
             `}
              >
                {currentStat === "ATK"
                  ? opponentSelection.atk
                  : opponentSelection.hp}
              </div>
            </div>

            {/* Damage Text */}
            {animPhase === "HIT" && roundWinner === "PLAYER" && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="text-6xl font-black text-red-500 animate-ping">
                  CRUSH!
                </div>
              </div>
            )}
          </div>

          {/* --- PLAYER CARD (Bottom) --- */}
          <div
            className={`
              absolute transition-all duration-500 ease-out
              ${animPhase === "IDLE" ? "bottom-[-20%] scale-50 opacity-0" : ""}
              ${
                animPhase === "ZOOM" ? "bottom-[15%] scale-100 opacity-100" : ""
              }
              ${
                animPhase === "CLASH" ||
                animPhase === "HIT" ||
                animPhase === "DESTROY"
                  ? "bottom-[20%] scale-125"
                  : ""
              }

              /* Hit Reactions */
              ${
                animPhase === "HIT" && roundWinner === "OPPONENT"
                  ? "animate-shake opacity-50"
                  : ""
              }
              ${
                animPhase === "HIT" && roundWinner === "PLAYER"
                  ? "scale-150 z-20"
                  : ""
              } /* Winner lunges */

              /* Destroy Animation */
              ${
                animPhase === "DESTROY" && roundWinner === "OPPONENT"
                  ? "opacity-0 scale-150 filter blur-xl grayscale"
                  : ""
              }
             `}
          >
            <div className="w-36 h-52 rounded-lg border-2 border-cyan-400 bg-slate-800 shadow-[0_0_30px_rgba(34,211,238,0.3)] overflow-hidden relative">
              <Image
                src={playerSelection.image}
                alt=""
                fill
                priority
                className="object-cover"
              />
              {/* Stat Pop-up */}
              <div
                className={`
               absolute -left-12 top-10 bg-slate-900 text-white font-black text-2xl p-2 rounded-lg border-2 border-cyan-400 shadow-xl
               transition-all duration-300 transform
               ${
                 animPhase === "CLASH" || animPhase === "HIT"
                   ? "opacity-100 translate-x-0"
                   : "opacity-0 translate-x-10"
               }
             `}
              >
                {currentStat === "ATK"
                  ? playerSelection.atk
                  : playerSelection.hp}
              </div>
            </div>

            {/* Damage Text */}
            {animPhase === "HIT" && roundWinner === "OPPONENT" && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="text-6xl font-black text-red-500 animate-ping">
                  CRUSH!
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- OPPONENT SECTION (TOP) --- */}
      <div className="relative z-10 w-full flex flex-col items-center pt-4 min-h-[120px]">
        {/* Opponent Hand (Fanned) */}
        <div
          className={`flex items-center justify-center -space-x-4 mb-2 transition-opacity duration-500 ${
            isBattleActive ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
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
        <div
          className={`flex flex-col items-center transition-opacity duration-500 ${
            isBattleActive ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
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

        {/* Drop Zone (Only visible during selection) */}
        {!isBattleActive && (
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
          </div>
        )}
      </div>

      {/* --- PLAYER SECTION (BOTTOM) --- */}
      <div className="relative z-10 w-full flex flex-col items-center pb-6 min-h-[160px]">
        {/* Player Profile */}
        <div
          className={`flex flex-col items-center mb-4 relative transition-opacity duration-500 ${
            isBattleActive ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
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
        <div
          className={`flex items-center justify-center gap-3 px-4 w-full max-w-2xl transition-opacity duration-500 ${
            isBattleActive ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <AnimatePresence>
            {playerHand.map((card) => (
              <motion.div
                key={card.id}
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

      {/* --- CSS UTILS for shake animation --- */}
      <style jsx global>{`
        @keyframes shake {
          0% {
            transform: translate(1px, 1px) rotate(0deg);
          }
          10% {
            transform: translate(-1px, -2px) rotate(-1deg);
          }
          20% {
            transform: translate(-3px, 0px) rotate(1deg);
          }
          30% {
            transform: translate(3px, 2px) rotate(0deg);
          }
          40% {
            transform: translate(1px, -1px) rotate(1deg);
          }
          50% {
            transform: translate(-1px, 2px) rotate(-1deg);
          }
          60% {
            transform: translate(-3px, 1px) rotate(0deg);
          }
          70% {
            transform: translate(3px, 1px) rotate(-1deg);
          }
          80% {
            transform: translate(-1px, -1px) rotate(1deg);
          }
          90% {
            transform: translate(1px, 2px) rotate(0deg);
          }
          100% {
            transform: translate(1px, -2px) rotate(-1deg);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
          animation-iteration-count: infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
