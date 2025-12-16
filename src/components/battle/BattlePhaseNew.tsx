import React, { useState, useEffect, useRef } from "react";
// import {
//   Sparkles,
//   Skull,
//   Zap,
//   Shield,
//   Trophy,
//   RefreshCw,
//   Swords,
//   Flame,
//   Disc,
// } from "lucide-react";

// --- Types & Interfaces ---

type StatType = "POW" | "SPD" | "TEC";

interface Stats {
  POW: number;
  SPD: number;
  TEC: number;
}

interface Wrestler {
  id: number;
  name: string;
  color: string;
  stats: Stats;
  icon: React.ReactNode;
  used?: boolean;
}

interface PlayerProfile {
  name: string;
  avatar: string;
}

interface CardProps {
  data: Wrestler;
  isOpponent?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  status?: "WINNER" | "LOSER" | "NEUTRAL";
  isCharging?: boolean;
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

const USER_PROFILE: PlayerProfile = {
  name: "Prince26",
  avatar: "https://i.pravatar.cc/150?u=prince26",
};

const OPP_PROFILE: PlayerProfile = {
  name: "Arathrz",
  avatar: "https://i.pravatar.cc/150?u=arathrz",
};

const CARD_BACK_PATTERN = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#1f2937"/>
  <path d="M0 0 L50 50 L0 100" fill="none" stroke="#374151" stroke-width="2"/>
  <path d="M100 0 L50 50 L100 100" fill="none" stroke="#374151" stroke-width="2"/>
  <circle cx="50" cy="50" r="20" stroke="#4b5563" stroke-width="2" fill="none"/>
  <path d="M50 20 L50 80 M20 50 L80 50" stroke="#374151" stroke-width="1"/>
</svg>
`;

const CRACK_OVERLAY = `
<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 50 L20 10 L30 40 L10 50 L40 60 L20 90 L50 70 L80 90 L70 50 L90 20 L60 30 Z" fill="black" fill-opacity="0.6"/>
  <path d="M50 50 L20 20 M50 50 L80 20 M50 50 L20 80 M50 50 L80 80" stroke="black" stroke-width="2"/>
</svg>
`;

const WRESTLERS: Wrestler[] = [
  {
    id: 1,
    name: "The Titan",
    color: "from-red-600 to-orange-900",
    stats: { POW: 95, SPD: 40, TEC: 60 },
    icon: "Skull",
  },
  {
    id: 2,
    name: "Viper",
    color: "from-green-600 to-emerald-900",
    stats: { POW: 60, SPD: 92, TEC: 75 },
    icon: "Zap",
  },
  {
    id: 3,
    name: "Iron Wall",
    color: "from-slate-500 to-slate-800",
    stats: { POW: 85, SPD: 30, TEC: 90 },
    icon: "Shield",
  },
  {
    id: 4,
    name: "Blaze",
    color: "from-orange-500 to-red-800",
    stats: { POW: 88, SPD: 70, TEC: 50 },
    icon: "Flame",
  },
  {
    id: 5,
    name: "Shadow",
    color: "from-purple-600 to-indigo-900",
    stats: { POW: 55, SPD: 95, TEC: 80 },
    icon: "Disc",
  },
  {
    id: 6,
    name: "Technician",
    color: "from-blue-600 to-cyan-900",
    stats: { POW: 65, SPD: 60, TEC: 98 },
    icon: "RefreshCw",
  },
];

const STAT_TYPES: StatType[] = ["POW", "SPD", "TEC"];

// --- Components ---

const Card: React.FC<CardProps> = ({
  data,
  isFaceDown,
  onClick,
  disabled,
  className = "",
  status = "NEUTRAL",
  isCharging,
}) => {
  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`
        relative w-28 h-44 rounded-xl shadow-2xl transition-all duration-300 transform preserve-3d
        ${
          disabled
            ? "cursor-default"
            : "cursor-pointer hover:scale-105 active:scale-95 hover:shadow-blue-500/50"
        }
        ${isCharging ? "animate-pulse-fast" : ""}
        ${className}
      `}
      style={{ perspective: "1000px" }}
    >
      {/* Charging Aura */}
      {isCharging && (
        <div
          className={`absolute -inset-4 rounded-xl blur-xl opacity-60 ${
            data.id > 3 ? "bg-red-500" : "bg-blue-500"
          } animate-pulse`}
        ></div>
      )}

      <div
        className={`
        relative w-full h-full rounded-xl border-2 overflow-hidden
        transition-all duration-500 backface-hidden
        ${
          isFaceDown
            ? "bg-gray-800 border-gray-600 rotate-y-180"
            : `bg-gray-900 ${
                status === "LOSER"
                  ? "border-red-900 grayscale brightness-50"
                  : "border-white border-opacity-50"
              }`
        }
      `}
      >
        {isFaceDown ? (
          // Card Back
          <div className="w-full h-full flex items-center justify-center relative bg-gray-900">
            <div
              className="absolute inset-0 opacity-40"
              dangerouslySetInnerHTML={{ __html: CARD_BACK_PATTERN }}
            />
            <div className="z-10 text-4xl font-black text-gray-500 select-none opacity-50">
              VS
            </div>
            <div className="absolute inset-1 border-2 border-gray-700 rounded-lg opacity-50"></div>
          </div>
        ) : (
          // Card Front
          <div
            className={`w-full h-full bg-gradient-to-br ${data.color} flex flex-col relative`}
          >
            {/* Image Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-30"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div
                className={`z-10 text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transform scale-125 transition-transform duration-500 ${
                  status === "WINNER" ? "scale-150" : ""
                }`}
              >
                {data.icon}
              </div>
            </div>

            {/* Stats Area */}
            <div className="h-16 bg-black bg-opacity-90 backdrop-blur-md p-1.5 flex flex-col justify-between border-t border-white border-opacity-20 z-10">
              <div className="text-[10px] font-black text-white truncate text-center uppercase tracking-widest bg-gradient-to-r from-transparent via-gray-800 to-transparent py-0.5 mb-1 border-b border-gray-800">
                {data.name}
              </div>
              <div className="flex justify-between items-end text-[9px] text-gray-400 font-mono">
                <div
                  className={`flex flex-col items-center flex-1 ${
                    data.stats.POW > 80 ? "text-red-400" : ""
                  }`}
                >
                  <span>POW</span>
                  <span className="font-bold text-white text-xs">
                    {data.stats.POW}
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center flex-1 border-l border-gray-800 ${
                    data.stats.SPD > 80 ? "text-yellow-400" : ""
                  }`}
                >
                  <span>SPD</span>
                  <span className="font-bold text-white text-xs">
                    {data.stats.SPD}
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center flex-1 border-l border-gray-800 ${
                    data.stats.TEC > 80 ? "text-blue-400" : ""
                  }`}
                >
                  <span>TEC</span>
                  <span className="font-bold text-white text-xs">
                    {data.stats.TEC}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Light Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>

            {/* Cracks Overlay (Loser) */}
            {status === "LOSER" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-appear-crack z-20 mix-blend-multiply">
                <div
                  className="w-full h-full opacity-80"
                  dangerouslySetInnerHTML={{ __html: CRACK_OVERLAY }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function CardBattle() {
  // Game State
  const [gameState, setGameState] = useState<GameState>("INIT");

  // Stat Reveal Logic
  const [activeStat, setActiveStat] = useState<StatType>("POW");
  const [displayStat, setDisplayStat] = useState<StatType>("POW");
  const [isStatRevealing, setIsStatRevealing] = useState(false);

  const [userHand, setUserHand] = useState<Wrestler[]>([]);
  const [oppHand, setOppHand] = useState<Wrestler[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);

  // Battle State
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [oppCardId, setOppCardId] = useState<number | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult>(null);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("IDLE");

  // Visual Effects
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  // Initialize Game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffled = [...WRESTLERS].sort(() => 0.5 - Math.random());
    setUserHand(shuffled.slice(0, 3));
    setOppHand(shuffled.slice(3, 6));
    setUserScore(0);
    setOppScore(0);
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

  const handleCardSelect = (card: Wrestler) => {
    if (gameState !== "SELECTION" || isStatRevealing) return;

    setSelectedCardId(card.id);
    setGameState("BATTLE");

    // AI Logic
    const randomOppCard = oppHand[Math.floor(Math.random() * oppHand.length)];
    setOppCardId(randomOppCard.id);

    // Start Animation Sequence
    runBattleSequence(card, randomOppCard);
  };

  const runBattleSequence = (uCard: Wrestler, oCard: Wrestler) => {
    const uStat = uCard.stats[activeStat];
    const oStat = oCard.stats[activeStat];
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

    // 5500ms: Cleanup
    setTimeout(() => {
      setUserHand((prev) => prev.filter((c) => c.id !== uCard.id));
      setOppHand((prev) => prev.filter((c) => c.id !== oCard.id));

      // Dramatic Exit if it's the last turn
      if (userHand.length <= 1) {
        setAnimPhase("FINALE"); // Trigger Finale Phase
        // Wait for finale animation before showing END screen
        setTimeout(() => setGameState("END"), 1800);
      } else {
        startTurn();
      }
    }, 5500);
  };

  const activeUserCard = userHand.find((c) => c.id === selectedCardId);
  const activeOppCard = oppHand.find((c) => c.id === oppCardId);

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
        return "bottom-[50%] left-1/2 -translate-x-1/2 scale-100 opacity-0 duration-1000";
      return "top-[15%] left-1/2 -translate-x-1/2 scale-150 opacity-0 duration-1000";
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
        return "bottom-[50%] scale-100 opacity-0 duration-1000";
      return "bottom-[15%] scale-150 opacity-0 duration-1000";
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
        relative w-full h-screen bg-gray-950 overflow-hidden font-sans select-none text-white
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
          {/* Speed Lines during attack */}
          <div
            className={`absolute inset-0 opacity-0 transition-opacity duration-100 ${
              animPhase === "ATTACK" ? "opacity-40" : ""
            } bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] animate-pan`}
          ></div>
        </>
      )}

      {/* FINALE CURTAIN - Fades to black at the end */}
      <div
        className={`absolute inset-0 bg-black z-[90] pointer-events-none transition-opacity duration-[1500ms] ease-in ${
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
          <div className="flex gap-4 -mb-8 z-0 perspective-500">
            {oppHand.map((card, i) => (
              <Card
                key={card.id}
                data={card}
                isFaceDown={true}
                disabled
                className="transform hover:-translate-y-2 transition-transform duration-300"
              />
            ))}
          </div>
          <div className="z-10 bg-gray-900 px-6 py-2 rounded-b-xl border-x border-b border-gray-700 mt-12 flex items-center gap-3 shadow-lg min-w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <img
                src={OPP_PROFILE.avatar}
                alt="Opp"
                className="w-8 h-8 rounded-full border border-red-500"
              />
              <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">
                {OPP_PROFILE.name}
              </span>
            </div>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-800 to-red-600 flex items-center justify-center font-black text-sm shadow-inner text-white">
              {oppScore}
            </div>
          </div>
        </div>

        {/* --- STAT REVEAL CENTER --- */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full z-20">
          <div className="text-3xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-600 uppercase drop-shadow-md transform -skew-x-12">
            MATCH STAT
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
            className={`mt-4 text-sm font-bold tracking-[0.2em] text-blue-400 ${
              isStatRevealing ? "opacity-0" : "animate-pulse"
            }`}
          >
            {isStatRevealing ? "..." : "SELECT YOUR FIGHTER"}
          </div>
        </div>

        {/* User Hand */}
        <div className="flex flex-col items-center z-10">
          <div className="mb-4 bg-gray-900 px-6 py-2 rounded-t-xl border-x border-t border-gray-700 flex items-center gap-3 shadow-lg min-w-[180px] justify-between">
            <div className="flex items-center gap-2">
              <img
                src={USER_PROFILE.avatar}
                alt="You"
                className="w-8 h-8 rounded-full border border-blue-500"
              />
              <span className="text-blue-400 font-bold text-xs tracking-widest uppercase">
                {USER_PROFILE.name}
              </span>
            </div>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center font-black text-sm shadow-inner text-white">
              {userScore}
            </div>
          </div>
          <div className="flex gap-4 perspective-500">
            {userHand.map((card) => (
              <Card
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
              />
            ))}
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

            {/* VS Badge - Hide during FINALE */}
            <div
              className={`
             absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
             flex flex-col items-center z-10 transition-all duration-500
             ${
               ["TENSION", "CHARGE"].includes(animPhase) &&
               animPhase !== "FINALE"
                 ? "opacity-100 scale-100"
                 : "opacity-0 scale-0"
             }
          `}
            >
              <p>VS</p>
            </div>

            {/* --- OPPONENT CARD CONTAINER --- */}
            <div
              className={`
              absolute left-1/2 -translate-x-1/2
              transition-all ease-in-out
              ${getOpponentPositionClass()}
            `}
            >
              <div
                className={`transition-all duration-1000 ${
                  animPhase === "DESTROY" && battleResult === "WIN"
                    ? "animate-disintegrate"
                    : ""
                }`}
              >
                <Card
                  data={activeOppCard}
                  isFaceDown={animPhase === "ZOOM"}
                  status={
                    animPhase === "DESTROY" && battleResult === "WIN"
                      ? "LOSER"
                      : "NEUTRAL"
                  }
                  isCharging={animPhase === "CHARGE" && battleResult === "LOSE"}
                  className="shadow-[0_0_60px_rgba(239,68,68,0.3)]"
                />
              </div>

              {/* Stat Bubble */}
              <div
                className={`
                absolute -right-20 top-8 bg-black/90 text-white font-black text-4xl p-4 rounded-xl border-l-4 border-red-500 shadow-2xl skew-x-[-12deg]
                transition-all duration-300 transform
                ${
                  ["TENSION", "CHARGE", "ATTACK", "IMPACT"].includes(
                    animPhase
                  ) && animPhase !== "FINALE"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-20"
                }
             `}
              >
                <span className="block skew-x-[12deg] text-red-500 text-xs font-bold tracking-widest mb-1">
                  {activeStat}
                </span>
                <span className="block skew-x-[12deg]">
                  {activeOppCard.stats[activeStat]}
                </span>
              </div>

              {/* Hit Effect (Only if Opponent Wins) */}
              {animPhase === "IMPACT" && battleResult === "LOSE" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                  <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 animate-pop-in drop-shadow-[0_0_20px_rgba(255,0,0,1)] whitespace-nowrap transform -rotate-6">
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
              <div
                className={`transition-all duration-1000 ${
                  animPhase === "DESTROY" && battleResult === "LOSE"
                    ? "animate-disintegrate"
                    : ""
                }`}
              >
                <Card
                  data={activeUserCard}
                  status={
                    animPhase === "DESTROY" && battleResult === "LOSE"
                      ? "LOSER"
                      : "NEUTRAL"
                  }
                  isCharging={animPhase === "CHARGE" && battleResult === "WIN"}
                  className="shadow-[0_0_60px_rgba(59,130,246,0.3)]"
                />
              </div>

              {/* Stat Bubble */}
              <div
                className={`
                absolute -left-20 top-8 bg-black/90 text-white font-black text-4xl p-4 rounded-xl border-r-4 border-blue-500 shadow-2xl skew-x-[12deg]
                transition-all duration-300 transform
                ${
                  ["TENSION", "CHARGE", "ATTACK", "IMPACT"].includes(
                    animPhase
                  ) && animPhase !== "FINALE"
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-20"
                }
             `}
              >
                <span className="block skew-x-[-12deg] text-blue-500 text-xs font-bold tracking-widest mb-1">
                  {activeStat}
                </span>
                <span className="block skew-x-[-12deg]">
                  {activeUserCard.stats[activeStat]}
                </span>
              </div>

              {/* Hit Effect (Only if User Wins) */}
              {animPhase === "IMPACT" && battleResult === "WIN" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]">
                  <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 animate-pop-in drop-shadow-[0_0_20px_rgba(255,0,0,1)] whitespace-nowrap transform -rotate-6">
                    SMASH!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* --- END SCREEN --- */}
      {gameState === "END" && (
        <div className="absolute inset-0 z-[100] bg-black bg-opacity-95 flex flex-col items-center justify-center animate-zoom-out-entry p-8 text-center backdrop-blur-sm">
          {userScore > oppScore ? (
            <>
              {/* <Trophy className="text-yellow-400 w-32 h-32 mb-6 animate-bounce drop-shadow-[0_0_20px_rgba(234,179,8,0.6)]" /> */}
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2">
                VICTORY
              </h1>
              <p className="text-gray-400 mb-8 tracking-widest text-lg">
                THE ARENA IS YOURS
              </p>
            </>
          ) : userScore < oppScore ? (
            <>
              {/* <Skull className="text-gray-500 w-32 h-32 mb-6 animate-pulse" /> */}
              <h1 className="text-6xl font-black text-gray-400 mb-2">DEFEAT</h1>
              <p className="text-gray-600 mb-8 tracking-widest text-lg">
                CRUSHED AND BROKEN
              </p>
            </>
          ) : (
            <>
              {/* <RefreshCw className="text-blue-400 w-32 h-32 mb-6 animate-spin-slow" /> */}
              <h1 className="text-6xl font-black text-white mb-2">DRAW</h1>
              <p className="text-gray-400 mb-8 tracking-widest text-lg">
                EVEN MATCH
              </p>
            </>
          )}

          <div className="flex items-center gap-12 mb-12">
            {/* User Stats */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={USER_PROFILE.avatar}
                  className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                />
                {userScore > oppScore && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1 rounded-full">
                    {/* <Trophy size={16} fill="black" /> */}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-blue-400 uppercase tracking-wider">
                  {USER_PROFILE.name}
                </span>
                <span className="text-6xl font-black text-white mt-2">
                  {userScore}
                </span>
              </div>
            </div>

            <div className="text-gray-700 text-4xl font-black italic">VS</div>

            {/* Opponent Stats */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={OPP_PROFILE.avatar}
                  className="w-24 h-24 rounded-full border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                />
                {oppScore > userScore && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1 rounded-full">
                    {/* <Trophy size={16} fill="black" /> */}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-red-500 uppercase tracking-wider">
                  {OPP_PROFILE.name}
                </span>
                <span className="text-6xl font-black text-white mt-2">
                  {oppScore}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={startNewGame}
            className="px-10 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full font-black text-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)]"
          >
            PLAY AGAIN
          </button>
        </div>
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
          0% { transform: scale(1); filter: brightness(1) blur(0); opacity: 1; mask-image: linear-gradient(to bottom, black 100%, transparent 0%); }
          20% { transform: scale(1.05) rotate(2deg); filter: brightness(2) contrast(1.5); }
          100% { transform: scale(1.2) translateY(50px); filter: brightness(0) blur(20px); opacity: 0; }
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
