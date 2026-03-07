import { Card } from "@/types/game";
import React, { useEffect, useState } from "react";
import SingleCard from "./SingleCard";
import Image from "next/image";
import { motion } from "framer-motion";
import VictoryScreen from "./VictoryScreen";
import DefeatScreen from "./DefeatScreen";
import DrawScreen from "./DrawScreen";
import RoundResultOverlay from "./RoundResultOverlay";
import profileIcons from "@/config/profileIcons.json";
import { useDispatch } from "react-redux";
import { addRewards } from "@/store/slices/playerSlice";
import { updateQuestProgress } from "@/store/slices/questSlice";

// --- Types & Interfaces ---

type StatType = "POW" | "SPD" | "DEF";

interface PlayerProfile {
  name: string;
  avatar: string;
}

type GameState = "INIT" | "SELECTION" | "BATTLE" | "RESOLVE" | "END";
type BattleResult = "WIN" | "LOSE" | "DRAW" | null;
type AnimPhase =
  | "IDLE"
  | "ZOOM"
  | "TENSION"
  | "CHARGE"
  | "ATTACK"
  | "IMPACT"
  | "DESTROY"
  | "FINALE";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface Shockwave {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

// --- Assets & Data ---

// --- Assets & Data ---
const STAT_TYPES: StatType[] = ["POW", "SPD", "DEF"];

// --- Main App ---

interface BattlePlayerInfo {
  name: string;
  avatar?: string;
  activeProfilePicId?: string;
}

interface CardBattleProps {
  playerDeck?: Card[];
  opponentDeck?: Card[];
  playerInfo: BattlePlayerInfo;
  opponentInfo: BattlePlayerInfo;
  onComplete?: () => void;
}

// --- Helper Component for Result Logic ---
const BattleResultHandler = ({
  userScore,
  oppScore,
  onContinue,
  playerDeck,
}: {
  userScore: number;
  oppScore: number;
  onContinue: () => void;
  playerDeck: Card[];
}) => {
  const dispatch = useDispatch();
  const [rewardsCalculated, setRewardsCalculated] = useState(false);
  const [rewards, setRewards] = useState<{
    exp: number;
    gold: number;
    gems: number;
  }>({ exp: 0, gold: 0, gems: 0 });

  useEffect(() => {
    if (rewardsCalculated) return;

    let exp = 0;
    let gold = 0;
    let gems = 0;

    if (userScore > oppScore) {
      // Victory
      if (oppScore === 0) {
        // Perfect Win (3-0 or similar dominance if max score varies, assuming 3 for now based on context or just 0 opp score)
        // User request: "Perfect WIn (win with 3-0)"
        exp = 20;
        gold = 30;
        gems = 5;
      } else {
        // Normal Win
        exp = 10;
        gold = 20;
      }
      dispatch(updateQuestProgress({ type: "BATTLE_WIN", amount: 1 }));
    } else if (userScore < oppScore) {
      // Defeat
      gold = 10;
    } else {
      // Draw: Same as Normal Win but no Gems
      exp = 10;
      gold = 20;
    }

    setRewards({ exp, gold, gems });
    dispatch(addRewards({ experience: exp, gold, gems }));
    setRewardsCalculated(true);
  }, [userScore, oppScore, dispatch, rewardsCalculated]);

  if (userScore > oppScore) {
    return (
      <VictoryScreen
        score={userScore}
        opponentScore={oppScore}
        onContinue={onContinue}
        playerDeck={playerDeck}
        rewards={rewards}
      />
    );
  }
  if (userScore < oppScore) {
    return (
      <DefeatScreen
        score={userScore}
        opponentScore={oppScore}
        onContinue={onContinue}
        playerDeck={playerDeck}
        rewards={rewards}
      />
    );
  }
  return (
    <DrawScreen
      score={userScore}
      opponentScore={oppScore}
      onContinue={onContinue}
      rewards={rewards}
    />
  );
};

export default function CardBattle({
  playerDeck = [],
  opponentDeck = [],
  playerInfo,
  opponentInfo,
  onComplete,
}: CardBattleProps) {
  // Derive Profiles
  const getAvatarUrl = (info: BattlePlayerInfo) => {
    if (info.avatar) return info.avatar;
    if (info.activeProfilePicId) {
      const icon = profileIcons.find((i) => i.id === info.activeProfilePicId);
      if (icon) return icon.imagePath;
    }
    return "";
  };

  const USER_PROFILE: PlayerProfile = {
    name: playerInfo.name,
    avatar: getAvatarUrl(playerInfo),
  };

  const OPP_PROFILE: PlayerProfile = {
    name: opponentInfo.name,
    avatar: getAvatarUrl(opponentInfo),
  };
  // Game State
  const [gameState, setGameState] = useState<GameState>("INIT");

  // Battle State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [oppCardId, setOppCardId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult>(null);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("IDLE");

  // Game Logic State
  const [userHand, setUserHand] = useState<(Card | null)[]>([]);
  const [oppHand, setOppHand] = useState<(Card | null)[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [round, setRound] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);

  // Stat Reveal Logic
  const [activeStat, setActiveStat] = useState<StatType>("POW");
  const [displayStat, setDisplayStat] = useState<StatType>("POW");
  const [isStatRevealing, setIsStatRevealing] = useState(true);

  // Visual Effects
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  // Initialize Game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setUserHand(playerDeck.length > 0 ? playerDeck : []);
    setOppHand(opponentDeck.length > 0 ? opponentDeck : []);
    setUserScore(0);
    setOppScore(0);
    setRound(0);
    startTurn();
  };

  const startTurn = () => {
    setGameState("SELECTION");
    setSelectedCardId(null);
    setOppCardId(null);
    setBattleResult(null);
    setAnimPhase("IDLE");
    setParticles([]);
    setShockwaves([]);
    setRound((prev) => prev + 1);
    setTimeLeft(20);

    // Start Stat Reveal Animation
    setIsStatRevealing(true);
    let rolls = 0;
    const maxRolls = 20;
    const intervalTime = 60;

    const interval = setInterval(() => {
      setDisplayStat((prev) => {
        const currentIndex = STAT_TYPES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % STAT_TYPES.length;
        return STAT_TYPES[nextIndex];
      });
      rolls++;

      if (rolls >= maxRolls) {
        clearInterval(interval);
        const finalStat =
          STAT_TYPES[Math.floor(Math.random() * STAT_TYPES.length)];
        setDisplayStat(finalStat);
        setActiveStat(finalStat);
        setIsStatRevealing(false);
      }
    }, intervalTime);
  };

  // Timer & Auto-Picker Logic
  useEffect(() => {
    if (gameState !== "SELECTION" || isStatRevealing) return;

    if (timeLeft <= 0) {
      // Auto-pick
      const validCards = userHand.filter((c): c is Card => c !== null);
      if (validCards.length > 0) {
        const randomCard =
          validCards[Math.floor(Math.random() * validCards.length)];
        handleCardSelect(randomCard);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isStatRevealing, timeLeft, userHand]);

  const spawnVisuals = () => {
    // 1. Particles
    const pCount = 50;
    const newParticles: Particle[] = [];
    for (let i = 0; i < pCount; i++) {
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        color: Math.random() > 0.5 ? "#fbbf24" : "#ef4444",
        size: Math.random() * 12 + 4,
        angle: Math.random() * 360,
        speed: Math.random() * 20 + 8,
      });
    }
    setParticles(newParticles);

    // 2. Shockwaves
    const newShockwaves: Shockwave[] = [
      { id: 1, x: 0, y: 0, size: 100, color: "#ffffff" },
      { id: 2, x: 0, y: 0, size: 200, color: "#fbbf24" },
    ];
    setShockwaves(newShockwaves);
  };

  const handleCardSelect = (card: Card) => {
    if (gameState !== "SELECTION" || isStatRevealing) return;

    setSelectedCardId(card.id);
    setGameState("BATTLE");

    // AI Logic
    const validOppCards = oppHand.filter((c): c is Card => c !== null);
    const randomOppCard =
      validOppCards[Math.floor(Math.random() * validOppCards.length)];
    setOppCardId(randomOppCard.id);

    // Start Animation Sequence
    runBattleSequence(card, randomOppCard);
  };

  const runBattleSequence = (uCard: Card, oCard: Card) => {
    // Use the active stat determined at the start of the turn
    const uStat =
      uCard.state[activeStat.toLowerCase() as keyof typeof uCard.state];
    const oStat =
      oCard.state[activeStat.toLowerCase() as keyof typeof oCard.state];

    let result: BattleResult = "DRAW";
    if (uStat > oStat) result = "WIN";
    if (uStat < oStat) result = "LOSE";
    setBattleResult(result);

    // --- ANIMATION TIMELINE ---

    // 0ms: Zoom In
    setAnimPhase("ZOOM");

    // 1000ms: Tension (Pause/Hover)
    setTimeout(() => setAnimPhase("TENSION"), 1000);

    // 1800ms: Charge (Windup - Pull back deeply)
    setTimeout(() => setAnimPhase("CHARGE"), 1800);

    // 2600ms: Attack (Lunge - FAST STRIKE)
    setTimeout(() => setAnimPhase("ATTACK"), 2600);

    // 2750ms: IMPACT (Snap contact - Very fast after Attack start)
    setTimeout(() => {
      setAnimPhase("IMPACT");
      spawnVisuals();
    }, 2750);

    // 4000ms: Destroy (Loser fades)
    setTimeout(() => {
      setAnimPhase("DESTROY");
      if (result === "WIN") setUserScore((prev) => prev + 1);
      if (result === "LOSE") setOppScore((prev) => prev + 1);
    }, 4000);

    // 7000ms: Cleanup (Extended for Winner Glory)
    setTimeout(() => {
      setUserHand((prev) => prev.map((c) => (c?.id === uCard.id ? null : c)));
      setOppHand((prev) => prev.map((c) => (c?.id === oCard.id ? null : c)));

      // Check remaining cards (count non-nulls)
      const remainingCount = userHand.filter((c) => c !== null).length;

      // Dramatic Exit if it's the last turn
      if (remainingCount <= 1) {
        setAnimPhase("FINALE"); // Trigger Finale Phase
        // Wait for finale animation before showing END screen
        setTimeout(() => setGameState("END"), 100);
      } else {
        startTurn();
      }
    }, 7000);
  };

  const activeUserCard = userHand.find((c) => c?.id === selectedCardId) as
    | Card
    | undefined;
  const activeOppCard = oppHand.find((c) => c?.id === oppCardId) as
    | Card
    | undefined;

  // Position Logic
  const getOpponentPositionClass = () => {
    if (animPhase === "IDLE" || animPhase === "ZOOM")
      return "top-[-50%] scale-50 opacity-0";

    // Default Battle Position
    const base = "top-[20%] left-1/2 -translate-x-1/2";

    if (animPhase === "TENSION") return `${base} scale-100`;

    // CHARGE Phase
    if (animPhase === "CHARGE") {
      if (battleResult === "LOSE") return `${base} scale-100 rotate-0`;
      return "top-[10%] left-1/2 -translate-x-1/2 scale-105 rotate-3"; // Pull back up
    }

    // ATTACK Phase (The Lunge)
    if (animPhase === "ATTACK") {
      if (battleResult === "LOSE")
        return "top-[65%] scale-125 z-50 duration-150 ease-in"; // Lunge Down FAST
      return `${base} scale-100 duration-150`; // Loser stays put
    }

    // IMPACT Phase
    if (animPhase === "IMPACT") {
      if (battleResult === "LOSE")
        return "bottom-[25%] left-1/2 -translate-x-1/2 scale-125 z-50 duration-0"; // Hold position
      return "top-[15%] left-1/2 -translate-x-1/2 scale-90 rotate-12 blur-[1px] duration-100 ease-out"; // Knockback UP
    }

    // DESTROY Phase
    if (animPhase === "DESTROY") {
      if (battleResult === "LOSE")
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 z-[70] duration-500"; // Winner Scales Up & Centers
      if (battleResult === "WIN")
        return "bottom-[50%] left-1/2 -translate-x-1/2 scale-100 opacity-0 duration-1000 pointer-events-none";
      return base; // DRAW
    }

    // FINALE Phase
    if (animPhase === "FINALE") {
      if (battleResult === "LOSE")
        return "top-[50%] scale-[5] z-[100] opacity-0 duration-1000 ease-in"; // Winner zooms into camera (Opponent)
      return "top-[15%] scale-0 opacity-0 duration-500"; // Loser gone
    }

    return base;
  };

  const getUserPositionClass = () => {
    if (animPhase === "IDLE" || animPhase === "ZOOM")
      return "bottom-[-50%] scale-50 opacity-0";

    // Default Battle Position
    const base = "bottom-[20%] left-1/2 -translate-x-1/2";

    if (animPhase === "TENSION") return `${base} scale-100`;

    // CHARGE Phase
    if (animPhase === "CHARGE") {
      if (battleResult === "WIN")
        return "bottom-[10%] left-1/2 -translate-x-1/2 scale-105 -rotate-3"; // Pull back down
      return `${base} scale-100 rotate-0`;
    }

    // ATTACK Phase (The Lunge)
    if (animPhase === "ATTACK") {
      if (battleResult === "WIN")
        return "bottom-[65%] scale-125 z-50 duration-150 ease-in"; // Lunge Up FAST
      return `${base} scale-100 duration-150`;
    }

    // IMPACT Phase
    if (animPhase === "IMPACT") {
      if (battleResult === "WIN")
        return "top-[25%] left-1/2 -translate-x-1/2 scale-125 z-50 duration-0"; // Hold position
      return "bottom-[15%] left-1/2 -translate-x-1/2 scale-90 -rotate-12 blur-[1px] duration-100 ease-out"; // Knockback DOWN
    }

    // DESTROY Phase
    if (animPhase === "DESTROY") {
      if (battleResult === "WIN")
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 z-[70] duration-500"; // Winner Scales Up & Centers
      if (battleResult === "LOSE")
        return "bottom-[15%] scale-100 opacity-0 duration-1000 pointer-events-none";
      return base; // DRAW
    }

    // FINALE Phase
    if (animPhase === "FINALE") {
      if (battleResult === "WIN")
        return "bottom-[50%] scale-[5] z-[100] opacity-0 duration-1000 ease-in"; // Winner zooms into camera (User)
      return "bottom-[15%] scale-0 opacity-0 duration-500"; // Loser gone
    }

    return base;
  };

  return (
    <div
      className={`
        relative w-full h-full overflow-hidden font-sans select-none text-black
        transition-transform duration-100
        ${
          animPhase === "IMPACT"
            ? "scale-[1.02] animate-screen-shake-violent"
            : "scale-100"
        } 
    `}
    >
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black pointer-events-none"></div>

      {/* Dynamic Background during Battle */}
      {gameState === "BATTLE" && (
        <>
          <div className="absolute inset-0 bg-black opacity-60 transition-opacity duration-1000"></div>
        </>
      )}

      {/* FINALE CURTAIN - Fades to black at the end */}
      <div
        className={`absolute inset-0 z-[90] pointer-events-none transition-opacity duration-[1500ms] ease-in ${
          animPhase === "FINALE" ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* --- SELECTION UI --- */}
      <div
        className={`absolute inset-0 flex flex-col justify-between py-6 transition-all duration-700 ${
          gameState === "SELECTION"
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-md scale-110 pointer-events-none"
        }`}
      >
        {/* Opponent Hand */}
        <div className="flex flex-col items-center">
          <div className="flex gap-4 -mb-8 z-0 perspective-500 w-full px-4">
            {oppHand.map((card, i) =>
              card ? (
                <SingleCard
                  key={card.id}
                  data={card}
                  isFaceDown={true}
                  disabled
                  className="transform hover:-translate-y-2 transition-transform duration-300"
                  activeState={displayStat}
                />
              ) : (
                <div key={`empty-opp-${i}`} className="w-1/3 aspect-2/3" />
              ),
            )}
          </div>
          <div
            className={`flex flex-col items-end relative transition-opacity duration-500 w-full px-4`}
          >
            <div className="relative">
              <div className="w-15 h-15 rounded-full border-4 border-red-600 overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.5)] z-10 relative bg-slate-800">
                <Image
                  src={OPP_PROFILE.avatar}
                  alt="Player"
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className="absolute right-12 top-1/2 -translate-y-1/2 text-white text-sm px-4 py-1 rounded-full z-20 min-w-[70px] text-center shadow-lg bg-gradient-to-br from-red-800 to-red-600"
                style={{
                  WebkitTextStroke: "2px black",
                  paintOrder: "stroke fill",
                }}
              >
                {oppScore} PTS
              </div>
            </div>
          </div>
        </div>

        {/* --- STAT REVEAL CENTER --- */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full z-20">
          <div className="text-3xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-600 uppercase drop-shadow-md transform -skew-x-12">
            ROUND {round}
          </div>

          {/* Animated Stat Text */}
          <div className="relative flex items-center justify-center w-64 h-32 mt-2">
            <div
              className={`
                text-8xl font-black text-yellow-500 transition-all duration-75
                ${
                  isStatRevealing
                    ? "opacity-70 scale-90 blur-[2px]"
                    : "opacity-100 scale-110 drop-shadow-[0_0_35px_rgba(234,179,8,1)] animate-lock-in"
                }
             `}
            >
              {displayStat}
            </div>
          </div>

          <div
            className={`mt-4 text-sm font-bold tracking-[0.2em] text-gray-700 ${
              isStatRevealing ? "opacity-0" : "animate-pulse"
            }`}
          >
            {isStatRevealing ? "..." : "SELECT YOUR FIGHTER"}
          </div>

          {/* Timer */}
          {!isStatRevealing && (
            <div
              className="mt-2 text-4xl font-mono font-bold text-white drop-shadow-md"
              style={{
                WebkitTextStroke: "4px black",
                paintOrder: "stroke fill",
              }}
            >
              {timeLeft}
            </div>
          )}
        </div>

        {/* User Hand */}
        <div className="flex flex-col items-center z-10">
          <div
            className={`flex flex-col items-left relative transition-opacity duration-500 w-full px-4`}
          >
            <div className="relative">
              <div className="w-15 h-15 rounded-full border-4 border-blue-600 overflow-hidden shadow-[0_0_20px_rgba(34,211,238,0.5)] z-10 relative bg-slate-800">
                <Image
                  src={USER_PROFILE.avatar}
                  alt="Player"
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className="absolute left-12 top-1/2 -translate-y-1/2 text-white text-sm px-4 py-1 rounded-full z-20 min-w-[70px] text-center shadow-lg bg-gradient-to-br from-blue-800 to-blue-600"
                style={{
                  WebkitTextStroke: "2px black",
                  paintOrder: "stroke fill",
                }}
              >
                {userScore} PTS
              </div>
            </div>
          </div>

          <div className="flex gap-4 perspective-500 w-full px-4">
            {userHand.map((card, i) =>
              card ? (
                <SingleCard
                  key={card.id}
                  data={card}
                  onClick={() => handleCardSelect(card)}
                  disabled={isStatRevealing}
                  className={`
                    shadow-[0_10px_20px_rgba(0,0,0,0.5)] 
                    ${
                      isStatRevealing
                        ? "opacity-50 grayscale cursor-not-allowed"
                        : "hover:-translate-y-6 hover:rotate-1"
                    }
                  `}
                  activeState={displayStat}
                />
              ) : (
                <div key={`empty-user-${i}`} className="w-1/3 aspect-2/3" />
              ),
            )}
          </div>
        </div>
      </div>

      {/* --- BATTLE ARENA --- */}
      {(gameState === "BATTLE" || gameState === "RESOLVE") &&
        activeUserCard &&
        activeOppCard && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            {/* Flash Effect on Impact */}
            {animPhase === "IMPACT" && (
              <div className="absolute inset-0 bg-white animate-flash mix-blend-overlay z-[100]"></div>
            )}

            {/* Particle System - Centered on Impact Zone */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full z-[60] animate-particle-explode"
                style={
                  {
                    left: battleResult === "WIN" ? "50%" : "50%",
                    top: battleResult === "WIN" ? "20%" : "80%",
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    "--angle": `${p.angle}deg`,
                    "--speed": `${p.speed * 20}px`,
                  } as React.CSSProperties
                }
              />
            ))}

            {/* Shockwaves */}
            {shockwaves.map((s) => (
              <div
                key={s.id}
                className="absolute rounded-full z-[55] border-4 opacity-0 animate-shockwave"
                style={{
                  left: battleResult === "WIN" ? "50%" : "50%",
                  top: battleResult === "WIN" ? "20%" : "80%",
                  width: s.size,
                  height: s.size,
                  borderColor: s.color,
                  transform: "translate(-50%, -50%)",
                }}
              ></div>
            ))}

            {/* --- OPPONENT CARD CONTAINER --- */}
            <div
              className={`
              absolute left-1/2 -translate-x-1/2
              transition-all ease-in-out
              ${getOpponentPositionClass()}
            `}
            >
              <div className="transition-all duration-1000">
                {(animPhase === "DESTROY" || animPhase === "IMPACT") &&
                battleResult === "WIN" ? (
                  /* SHATTERED OPPONENT CARD */
                  <div className="relative w-32 aspect-2/3">
                    {[
                      "polygon(0 0, 40% 0, 50% 50%, 0 60%)",
                      "polygon(40% 0, 100% 0, 100% 40%, 50% 50%)",
                      "polygon(100% 40%, 100% 100%, 60% 100%, 50% 50%)",
                      "polygon(0 60%, 50% 50%, 60% 100%, 0 100%)",
                    ].map((clip, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 w-full h-full"
                        initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                        animate={{
                          opacity: 0,
                          x:
                            (i === 0
                              ? -50
                              : i === 1
                                ? 50
                                : i === 2
                                  ? 50
                                  : -50) *
                            (Math.random() + 0.5),
                          y:
                            (i === 0
                              ? -50
                              : i === 1
                                ? -50
                                : i === 2
                                  ? 50
                                  : 50) *
                            (Math.random() + 0.5),
                          rotate: (Math.random() - 0.5) * 45,
                          scale: 0.8,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ clipPath: clip }}
                      >
                        <SingleCard
                          data={activeOppCard!}
                          isOpponent
                          status="LOSER"
                          className="w-full h-full"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <SingleCard
                    data={activeOppCard!}
                    isFaceDown={animPhase === "ZOOM"}
                    status="NEUTRAL"
                    isCharging={
                      animPhase === "CHARGE" && battleResult === "LOSE"
                    }
                    className="shadow-[0_0_60px_rgba(239,68,68,0.3)] w-32"
                  />
                )}
              </div>
              {/* Stat Bubble */}
              <div
                className={`
                absolute -right-20 top-8 bg-black/90 text-white font-black text-4xl p-4 rounded-xl border-l-4 border-red-500 shadow-2xl skew-x-[-12deg]
                transition-all duration-300 transform
                ${
                  ["TENSION", "CHARGE"].includes(animPhase) &&
                  animPhase !== "FINALE"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-20"
                }
             `}
              >
                <span className="block skew-x-[12deg] text-red-500 text-xs font-bold tracking-widest mb-1">
                  {activeStat}
                </span>
                <span className="block skew-x-[12deg]">
                  {
                    activeOppCard.state[
                      activeStat.toLowerCase() as keyof typeof activeOppCard.state
                    ]
                  }
                </span>
              </div>
              {/* Winner Overlay (Opponent Wins) - REMOVED */}{" "}
              {/* Hit Effect (Only if Opponent Wins) */}
              {animPhase === "IMPACT" && battleResult === "LOSE" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                  <div className="text-5xl max-[400px]:text-md font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 animate-pop-in drop-shadow-[0_0_20px_rgba(255,0,0,1)] whitespace-nowrap transform -rotate-6">
                    SMASH!
                  </div>
                </div>
              )}
            </div>

            {/* --- USER CARD CONTAINER --- */}
            <div
              className={`
              absolute left-1/2 -translate-x-1/2
              transition-all ease-in-out
              ${getUserPositionClass()}
             `}
            >
              <div className="transition-all duration-1000">
                {(animPhase === "DESTROY" || animPhase === "IMPACT") &&
                battleResult === "LOSE" ? (
                  /* SHATTERED USER CARD */
                  <div className="relative w-32 aspect-2/3">
                    {[
                      "polygon(0 0, 40% 0, 50% 50%, 0 60%)",
                      "polygon(40% 0, 100% 0, 100% 40%, 50% 50%)",
                      "polygon(100% 40%, 100% 100%, 60% 100%, 50% 50%)",
                      "polygon(0 60%, 50% 50%, 60% 100%, 0 100%)",
                    ].map((clip, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 w-full h-full"
                        initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                        animate={{
                          opacity: 0,
                          x:
                            (i === 0
                              ? -50
                              : i === 1
                                ? 50
                                : i === 2
                                  ? 50
                                  : -50) *
                            (Math.random() + 0.5),
                          y:
                            (i === 0
                              ? -50
                              : i === 1
                                ? -50
                                : i === 2
                                  ? 50
                                  : 50) *
                            (Math.random() + 0.5),
                          rotate: (Math.random() - 0.5) * 45,
                          scale: 0.8,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ clipPath: clip }}
                      >
                        <SingleCard
                          data={activeUserCard!}
                          status="LOSER"
                          className="w-full h-full"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <SingleCard
                    data={activeUserCard!}
                    status="NEUTRAL"
                    isCharging={
                      animPhase === "CHARGE" && battleResult === "WIN"
                    }
                    className="shadow-[0_0_60px_rgba(59,130,246,0.3)] w-32"
                  />
                )}
              </div>
              {/* Stat Bubble */}
              <div
                className={`
                absolute -left-20 top-8 bg-black/90 text-white font-black text-4xl p-4 rounded-xl border-r-4 border-blue-500 shadow-2xl skew-x-[12deg]
                transition-all duration-300 transform
                ${
                  ["TENSION", "CHARGE"].includes(animPhase) &&
                  animPhase !== "FINALE"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-20"
                }
             `}
              >
                <span className="block skew-x-[-12deg] text-blue-500 text-xs font-bold tracking-widest mb-1">
                  {activeStat}
                </span>
                <span className="block skew-x-[-12deg]">
                  {
                    activeUserCard.state[
                      activeStat.toLowerCase() as keyof typeof activeOppCard.state
                    ]
                  }
                </span>
              </div>
              {/* Winner Overlay (User Wins) - REMOVED */}{" "}
              {/* Hit Effect (Only if User Wins) */}
              {animPhase === "IMPACT" && battleResult === "WIN" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                  <div className="text-5xl max-[400px]:text-md font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 animate-pop-in drop-shadow-[0_0_20px_rgba(255,0,0,1)] whitespace-nowrap transform -rotate-6">
                    SMASH!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* --- ROUND RESULT OVERLAY --- */}
      {animPhase === "DESTROY" && (
        <RoundResultOverlay
          userProfile={USER_PROFILE}
          oppProfile={OPP_PROFILE}
          userScore={userScore}
          oppScore={oppScore}
          battleResult={battleResult}
        />
      )}

      {/* --- END SCREEN --- */}
      {gameState === "END" && (
        <BattleResultHandler
          userScore={userScore}
          oppScore={oppScore}
          onContinue={() => {
            if (onComplete) {
              onComplete();
            } else {
              startNewGame();
            }
          }}
          playerDeck={userHand.filter((c): c is Card => c !== null)}
        />
      )}

      {/* --- CSS ANIMATION KEYFRAMES --- */}
      <style>{`
        @keyframes lock-in {
          0% { transform: scale(1.5); opacity: 0; filter: blur(4px); }
          50% { transform: scale(0.9); opacity: 1; filter: blur(0); }
          80% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-lock-in {
          animation: lock-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes screen-shake-violent {
          0% { transform: translate(0, 0) rotate(0); }
          10% { transform: translate(-8px, -8px) rotate(-1deg); }
          20% { transform: translate(8px, 8px) rotate(1deg); }
          30% { transform: translate(-8px, 8px) rotate(0); }
          40% { transform: translate(8px, -8px) rotate(1deg); }
          50% { transform: translate(-8px, -8px) rotate(-1deg); }
          60% { transform: translate(8px, 8px) rotate(0); }
          70% { transform: translate(-5px, 5px) rotate(1deg); }
          80% { transform: translate(5px, -5px) rotate(-1deg); }
          90% { transform: translate(-2px, 2px) rotate(0); }
          100% { transform: translate(0, 0) rotate(0); }
        }
        .animate-screen-shake-violent {
          animation: screen-shake-violent 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 0.3s ease-out forwards;
        }
        
        @keyframes disintegrate {
          0% { transform: scale(1) rotate(0deg); filter: brightness(1) blur(0); opacity: 1; }
          20% { transform: scale(1.1) rotate(-5deg); filter: brightness(2) contrast(2); opacity: 1; }
          40% { transform: scale(1.1) rotate(5deg); filter: brightness(2) contrast(2); opacity: 0.8; }
          100% { transform: scale(1.2) rotate(0deg); filter: brightness(0) blur(10px) grayscale(1); opacity: 0; }
        }
        .animate-disintegrate {
          animation: disintegrate 1.5s ease-out forwards;
        }

        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes particle-explode {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(calc(cos(var(--angle)) * var(--speed)), calc(sin(var(--angle)) * var(--speed))); opacity: 0; }
        }
        .animate-particle-explode {
          animation: particle-explode 0.6s ease-out forwards;
        }
        
        @keyframes shockwave {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; border-width: 10px; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; border-width: 0px; }
        }
        .animate-shockwave {
          animation: shockwave 0.5s ease-out forwards;
        }
        
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-fast {
          animation: pulse-fast 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes appear-crack {
          0% { clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); opacity: 0; }
          100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 0.8; }
        }
        .animate-appear-crack {
          animation: appear-crack 0.2s steps(4) forwards;
        }

        @keyframes zoom-out-entry {
          0% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-zoom-out-entry {
          animation: zoom-out-entry 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .perspective-500 { perspective: 500px; }
      `}</style>
    </div>
  );
}
