import React, { useState, useEffect } from "react";
import { Sparkles, Skull, Zap, Shield, Trophy, RefreshCw } from "lucide-react";

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

interface CardProps {
  data: Wrestler;
  isOpponent?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

type GameState = "INIT" | "SELECTION" | "BATTLE" | "RESOLVE" | "END";
type BattleResult = "WIN" | "LOSE" | "DRAW" | null;
type AnimPhase = "IDLE" | "ZOOM" | "CLASH" | "HIT" | "DESTROY";

// --- Assets & Data ---

const CARD_BACK_PATTERN = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 0 L50 50 L0 100" fill="none" stroke="#333" stroke-width="2"/>
  <path d="M100 0 L50 50 L100 100" fill="none" stroke="#333" stroke-width="2"/>
  <circle cx="50" cy="50" r="20" stroke="#444" stroke-width="2" fill="none"/>
</svg>
`;

const WRESTLERS: Wrestler[] = [
  {
    id: 1,
    name: "The Titan",
    color: "from-red-600 to-orange-900",
    stats: { POW: 95, SPD: 40, TEC: 60 },
    icon: <Skull size={32} />,
  },
  {
    id: 2,
    name: "Viper",
    color: "from-green-600 to-emerald-900",
    stats: { POW: 60, SPD: 92, TEC: 75 },
    icon: <Zap size={32} />,
  },
  {
    id: 3,
    name: "Iron Wall",
    color: "from-slate-500 to-slate-800",
    stats: { POW: 85, SPD: 30, TEC: 90 },
    icon: <Shield size={32} />,
  },
  {
    id: 4,
    name: "Blaze",
    color: "from-orange-500 to-red-800",
    stats: { POW: 88, SPD: 70, TEC: 50 },
    icon: <Sparkles size={32} />,
  },
  {
    id: 5,
    name: "Shadow",
    color: "from-purple-600 to-indigo-900",
    stats: { POW: 55, SPD: 95, TEC: 80 },
    icon: <Skull size={32} />,
  },
  {
    id: 6,
    name: "Technician",
    color: "from-blue-600 to-cyan-900",
    stats: { POW: 65, SPD: 60, TEC: 98 },
    icon: <RefreshCw size={32} />,
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
}) => {
  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`
        relative w-28 h-44 rounded-xl shadow-2xl transition-all duration-300 transform
        ${
          disabled
            ? "cursor-default"
            : "cursor-pointer hover:scale-105 active:scale-95"
        }
        ${className}
      `}
      style={{ perspective: "1000px" }}
    >
      <div
        className={`
        w-full h-full rounded-xl border-2 border-opacity-50 border-white overflow-hidden
        transition-all duration-500 bg-gray-900
        ${isFaceDown ? "rotate-y-180" : ""}
      `}
      >
        {isFaceDown ? (
          // Card Back
          <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
            <div
              className="absolute inset-0 opacity-20"
              dangerouslySetInnerHTML={{ __html: CARD_BACK_PATTERN }}
            />
            <div className="z-10 text-4xl font-bold text-gray-600 select-none">
              VS
            </div>
            <div className="absolute inset-0 border-4 border-gray-700 rounded-xl m-1"></div>
          </div>
        ) : (
          // Card Front
          <div
            className={`w-full h-full bg-gradient-to-br ${data.color} flex flex-col relative`}
          >
            {/* Image Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="z-10 text-white drop-shadow-lg transform scale-125">
                {data.icon}
              </div>
            </div>

            {/* Stats Area */}
            <div className="h-16 bg-black bg-opacity-80 backdrop-blur-sm p-1.5 flex flex-col justify-between border-t border-white border-opacity-20">
              <div className="text-xs font-bold text-white truncate text-center uppercase tracking-wider">
                {data.name}
              </div>
              <div className="flex justify-between items-end text-[10px] text-gray-300 font-mono mt-1">
                <div className="flex flex-col items-center">
                  <span className="text-red-400">POW</span>
                  <span className="font-bold text-white text-xs">
                    {data.stats.POW}
                  </span>
                </div>
                <div className="flex flex-col items-center border-l border-gray-600 pl-1">
                  <span className="text-yellow-400">SPD</span>
                  <span className="font-bold text-white text-xs">
                    {data.stats.SPD}
                  </span>
                </div>
                <div className="flex flex-col items-center border-l border-gray-600 pl-1">
                  <span className="text-blue-400">TEC</span>
                  <span className="font-bold text-white text-xs">
                    {data.stats.TEC}
                  </span>
                </div>
              </div>
            </div>

            {/* Rarity Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-10 pointer-events-none"></div>
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
  const [activeStat, setActiveStat] = useState<StatType>("POW");
  const [userHand, setUserHand] = useState<Wrestler[]>([]);
  const [oppHand, setOppHand] = useState<Wrestler[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);

  // Battle State
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [oppCardId, setOppCardId] = useState<number | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult>(null);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("IDLE");

  // Initialize Game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Shuffle and deal
    const shuffled = [...WRESTLERS].sort(() => 0.5 - Math.random());
    setUserHand(shuffled.slice(0, 3));
    setOppHand(shuffled.slice(3, 6));
    setUserScore(0);
    setOppScore(0);
    startTurn();
  };

  const startTurn = () => {
    // Pick random stat for the turn
    const randomStat =
      STAT_TYPES[Math.floor(Math.random() * STAT_TYPES.length)];
    setActiveStat(randomStat);
    setSelectedCardId(null);
    setOppCardId(null);
    setBattleResult(null);
    setAnimPhase("IDLE");
    setGameState("SELECTION");
  };

  // Logic when user picks a card
  const handleCardSelect = (card: Wrestler) => {
    if (gameState !== "SELECTION") return;

    setSelectedCardId(card.id);
    setGameState("BATTLE");

    // AI Logic: Simple Random Pick for now
    // Note: We filter for valid cards, though hand array management below handles removal
    const randomOppCard = oppHand[Math.floor(Math.random() * oppHand.length)];
    setOppCardId(randomOppCard.id);

    // Start Animation Sequence
    runBattleSequence(card, randomOppCard);
  };

  const runBattleSequence = (uCard: Wrestler, oCard: Wrestler) => {
    // 1. Hide UI, Zoom in Cards (Handled by render logic based on gameState)
    setAnimPhase("ZOOM");

    // 2. Clash (Move to center)
    setTimeout(() => {
      setAnimPhase("CLASH");
    }, 800);

    // 3. Determine Winner
    const uStat = uCard.stats[activeStat];
    const oStat = oCard.stats[activeStat];
    let result: BattleResult = "DRAW";
    if (uStat > oStat) result = "WIN";
    if (uStat < oStat) result = "LOSE";

    setBattleResult(result);

    // 4. Hit Animation
    setTimeout(() => {
      setAnimPhase("HIT");
    }, 1600);

    // 5. Destroy/Resolution Animation
    setTimeout(() => {
      setAnimPhase("DESTROY");
      // Update scores
      if (result === "WIN") setUserScore((prev) => prev + 1);
      if (result === "LOSE") setOppScore((prev) => prev + 1);
    }, 2400);

    // 6. Cleanup and Next Turn
    setTimeout(() => {
      // Remove cards from hands
      setUserHand((prev) => prev.filter((c) => c.id !== uCard.id));
      setOppHand((prev) => prev.filter((c) => c.id !== oCard.id));

      // Check if game over
      if (userHand.length <= 1) {
        // We just removed one, so if length was 1, it's now empty
        setGameState("END");
      } else {
        startTurn();
      }
    }, 4000);
  };

  // Get current active card objects
  const activeUserCard = userHand.find((c) => c.id === selectedCardId);
  const activeOppCard = oppHand.find((c) => c.id === oppCardId);

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden font-sans select-none text-white">
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black pointer-events-none"></div>

      {/* Animated Lights */}
      <div
        className={`absolute top-0 left-1/4 w-1 h-screen bg-blue-500 opacity-20 blur-xl transform -rotate-12 transition-opacity duration-1000 ${
          gameState === "BATTLE" ? "opacity-0" : "opacity-20"
        }`}
      ></div>
      <div
        className={`absolute top-0 right-1/4 w-1 h-screen bg-red-500 opacity-20 blur-xl transform rotate-12 transition-opacity duration-1000 ${
          gameState === "BATTLE" ? "opacity-0" : "opacity-20"
        }`}
      ></div>

      {/* --- MAIN GAME UI (Visible during SELECTION) --- */}
      <div
        className={`absolute inset-0 flex flex-col justify-between py-6 transition-opacity duration-500 ${
          gameState === "SELECTION"
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Opponent Area */}
        <div className="flex flex-col items-center">
          <div className="flex gap-4 -mb-8 z-0">
            {oppHand.map((card) => (
              <Card key={card.id} data={card} isFaceDown={true} disabled />
            ))}
          </div>
          <div className="z-10 bg-black bg-opacity-80 px-4 py-1 rounded-full border border-gray-700 mt-12 flex items-center gap-2">
            <span className="text-gray-400 text-sm">OPPONENT</span>
            <div className="w-6 h-6 rounded-full bg-red-900 flex items-center justify-center font-bold text-xs">
              {oppScore}
            </div>
          </div>
        </div>

        {/* Center Arena Info */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
          <div className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase drop-shadow-md">
            MATCH STAT
          </div>
          <div
            className={`text-6xl font-black text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] mt-2 transition-all duration-300 ${
              activeStat === "POW" ? "scale-110" : ""
            }`}
          >
            {activeStat}
          </div>
          <div className="mt-8 text-sm text-gray-400 animate-pulse">
            PICK YOUR FIGHTER
          </div>
        </div>

        {/* User Area */}
        <div className="flex flex-col items-center z-10">
          <div className="mb-4 bg-black bg-opacity-80 px-4 py-1 rounded-full border border-gray-700 flex items-center gap-2">
            <span className="text-blue-400 font-bold">YOU</span>
            <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center font-bold text-xs">
              {userScore}
            </div>
          </div>
          <div className="flex gap-4">
            {userHand.map((card) => (
              <Card
                key={card.id}
                data={card}
                onClick={() => handleCardSelect(card)}
                className="hover:-translate-y-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* --- BATTLE ARENA (Overlay) --- */}
      {/* This renders only the two active cards in specific positions based on animation phase */}
      {(gameState === "BATTLE" || gameState === "RESOLVE") &&
        activeUserCard &&
        activeOppCard && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Spotlight Effect */}
            <div className="absolute inset-0 bg-black opacity-80 animate-fadeIn"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-5 blur-[100px] rounded-full"></div>

            {/* VS Stats Display (Appears briefly) */}
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
                {activeStat}
              </span>
            </div>

            {/* --- OPPONENT CARD --- */}
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
                animPhase === "HIT" && battleResult === "WIN"
                  ? "animate-shake opacity-50"
                  : ""
              }
              ${
                animPhase === "HIT" && battleResult === "LOSE"
                  ? "scale-150 z-20"
                  : ""
              } /* Winner lunges */

              /* Destroy Animation */
              ${
                animPhase === "DESTROY" && battleResult === "WIN"
                  ? "opacity-0 scale-150 filter blur-xl text-red-500"
                  : ""
              }
            `}
            >
              <Card
                data={activeOppCard}
                // Opponent card flips up during ZOOM phase
                isFaceDown={animPhase === "IDLE"}
                className={`shadow-[0_0_30px_rgba(255,0,0,0.3)]`}
              />

              {/* Stat Pop-up for Opponent */}
              <div
                className={`
               absolute -right-12 top-10 bg-gray-900 text-white font-black text-2xl p-2 rounded-lg border-2 border-red-500 shadow-xl
               transition-all duration-300 transform
               ${
                 animPhase === "CLASH" || animPhase === "HIT"
                   ? "opacity-100 translate-x-0"
                   : "opacity-0 -translate-x-10"
               }
             `}
              >
                {activeOppCard.stats[activeStat]}
              </div>

              {/* Damage Text */}
              {animPhase === "HIT" && battleResult === "WIN" && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                  <div className="text-6xl font-black text-red-500 animate-ping">
                    CRUSH!
                  </div>
                </div>
              )}
            </div>

            {/* --- USER CARD --- */}
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
                animPhase === "HIT" && battleResult === "LOSE"
                  ? "animate-shake opacity-50"
                  : ""
              }
              ${
                animPhase === "HIT" && battleResult === "WIN"
                  ? "scale-150 z-20"
                  : ""
              } /* Winner lunges */

              /* Destroy Animation */
              ${
                animPhase === "DESTROY" && battleResult === "LOSE"
                  ? "opacity-0 scale-150 filter blur-xl text-red-500"
                  : ""
              }
             `}
            >
              <Card
                data={activeUserCard}
                className={`shadow-[0_0_30px_rgba(0,100,255,0.3)]`}
              />

              {/* Stat Pop-up for User */}
              <div
                className={`
               absolute -left-12 top-10 bg-gray-900 text-white font-black text-2xl p-2 rounded-lg border-2 border-blue-500 shadow-xl
               transition-all duration-300 transform
               ${
                 animPhase === "CLASH" || animPhase === "HIT"
                   ? "opacity-100 translate-x-0"
                   : "opacity-0 translate-x-10"
               }
             `}
              >
                {activeUserCard.stats[activeStat]}
              </div>

              {/* Damage Text */}
              {animPhase === "HIT" && battleResult === "LOSE" && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                  <div className="text-6xl font-black text-red-500 animate-ping">
                    CRUSH!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* --- END SCREEN --- */}
      {gameState === "END" && (
        <div className="absolute inset-0 z-[100] bg-black bg-opacity-95 flex flex-col items-center justify-center animate-fadeIn p-8 text-center">
          {userScore > oppScore ? (
            <>
              <Trophy className="text-yellow-400 w-24 h-24 mb-4 animate-bounce" />
              <h1 className="text-5xl font-black text-white mb-2">VICTORY</h1>
              <p className="text-gray-400 mb-8">You dominated the arena!</p>
            </>
          ) : userScore < oppScore ? (
            <>
              <Skull className="text-red-500 w-24 h-24 mb-4" />
              <h1 className="text-5xl font-black text-white mb-2">DEFEAT</h1>
              <p className="text-gray-400 mb-8">Better luck next time.</p>
            </>
          ) : (
            <>
              <RefreshCw className="text-blue-400 w-24 h-24 mb-4" />
              <h1 className="text-5xl font-black text-white mb-2">DRAW</h1>
              <p className="text-gray-400 mb-8">A perfectly matched battle.</p>
            </>
          )}

          <div className="text-2xl font-bold mb-8">
            <span className="text-blue-500">{userScore}</span> -{" "}
            <span className="text-red-500">{oppScore}</span>
          </div>

          <button
            onClick={startNewGame}
            className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full font-bold text-black text-xl hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-yellow-500/20"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* --- CSS UTILS for shake animation --- */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s;
          animation-iteration-count: infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
