/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define the possible game states
type GameState = "IDLE" | "SUMMONING" | "RESULT";

interface MagicCircleProps {
  summonStarted: boolean;
}

const MagicCircle = ({ summonStarted }: MagicCircleProps) => {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [shake, setShake] = useState<boolean>(false);
  const [flash, setFlash] = useState<boolean>(false);

  useEffect(() => {
    if (summonStarted) {
      handleSummon();
    }
  }, [summonStarted]);

  // --- GAME LOOP & SEQUENCING ---
  const handleSummon = () => {
    if (gameState !== "IDLE") {
      setGameState("IDLE");
      setFlash(false);
      return;
    }

    // Step 1: Start Summoning (Charge Up)
    setGameState("SUMMONING");

    // Step 2: Shake before impact (at 2000ms)
    setTimeout(() => {
      setShake(true);
    }, 2000);

    // Step 3: The Release (Flash & Transition) (at 2500ms)
    setTimeout(() => {
      setFlash(true); // Full white screen
      setShake(false);
    }, 2500);

    // Step 4: Show Result (at 2600ms - while screen is white)
    setTimeout(() => {
      setGameState("RESULT");
    }, 2600);

    // Step 5: Fade out flash (at 2800ms)
    setTimeout(() => {
      setFlash(false);
    }, 2800);
  };

  // --- CONFIG VARIABLES ---
  const isSummoning = gameState === "SUMMONING" || gameState === "RESULT";
  const runesOuter =
    "ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛇ ᛈ";
  const runesInner = "ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ";
  const symbols = ["🜂", "🜃", "🜁", "🜄", "☉", "☾", "♃", "♂"];

  return (
    <div
      className={`flex flex-col items-center justify-center relative overflow-hidden bg-transparent ${
        shake ? "animate-shake" : ""
      }`}
    >
      {/* WHITE FLASH OVERLAY */}
      <div
        className={`absolute inset-0 z-50 bg-white pointer-events-none transition-opacity duration-[1000ms] ease-out ${
          flash ? "opacity-100 duration-75" : "opacity-0"
        }`}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        {/* --- GAME STATE: MAGIC CIRCLE --- */}
        <div
          className={`relative transition-all duration-500 w-full h-full ${
            gameState === "RESULT"
              ? "scale-0 opacity-0 absolute"
              : "scale-100 opacity-100"
          }`}
        >
          <div className="relative">
            {/* Particle Layer - Optimized with Framer Motion */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <MagicCircleParticles gameState={gameState} isFlash={flash} />
            </div>

            <svg
              viewBox="0 0 500 500"
              className={`w-full h-full transition-all duration-1000 ${
                isSummoning
                  ? "drop-shadow-[0_0_80px_rgba(255,200,50,0.9)]"
                  : "drop-shadow-xl"
              }`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="goldGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={"#C5A059"} />
                  <stop offset="50%" stopColor={"#E6D28F"} />
                  <stop offset="100%" stopColor={"#8B7355"} />
                </linearGradient>

                <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur
                    stdDeviation={isSummoning ? "6" : "2"}
                    result="blur"
                  />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                <path
                  id="textCirclePath"
                  d="M 250, 250 m -190, 0 a 190,190 0 1,1 380,0 a 190,190 0 1,1 -380,0"
                />
                <path
                  id="innerCirclePath"
                  d="M 250, 250 m -130, 0 a 130,130 0 1,1 260,0 a 130,130 0 1,1 -260,0"
                />
              </defs>

              {/* --- STATIC OUTER RIMS --- */}
              <circle
                cx="250"
                cy="250"
                r="235"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="4"
                className="opacity-80"
              />
              <circle
                cx="250"
                cy="250"
                r="225"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="2"
                className="opacity-60"
              />

              {/* Layer 1: Outer Runes (Clockwise) - Accel on Summon */}
              <g
                className="origin-center"
                style={
                  {
                    animation: `spin ${
                      isSummoning ? "10s" : "60s"
                    } linear infinite, ${
                      isSummoning
                        ? "expand-implode 2.5s ease-in-out forwards"
                        : "none"
                    }`,
                  } as React.CSSProperties
                }
              >
                <text width="500">
                  <textPath
                    href="#textCirclePath"
                    startOffset="0%"
                    className={`font-bold tracking-[14px] transition-colors duration-300 ${
                      isSummoning ? "fill-[darkgoldenrod]" : "fill-[#A89F91]"
                    }`}
                    style={{ fontSize: "26px" }}
                  >
                    {runesOuter}
                  </textPath>
                </text>
              </g>

              {/* Layer 2: Geometric Octagon & Squares (Counter-Clockwise) - Accel on Summon */}
              <g
                className="origin-center"
                style={
                  {
                    animation: `spin ${
                      isSummoning ? "3s" : "40s"
                    } linear infinite reverse, ${
                      isSummoning
                        ? "expand-implode 2.5s ease-in-out forwards"
                        : "none"
                    }`,
                  } as React.CSSProperties
                }
              >
                <rect
                  x="125"
                  y="125"
                  width="250"
                  height="250"
                  fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth="4"
                  className="opacity-60"
                />
                <rect
                  x="125"
                  y="125"
                  width="250"
                  height="250"
                  fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth="4"
                  className="opacity-40 origin-center rotate-45"
                />

                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                  <g key={i} transform={`rotate(${deg}, 250, 250)`}>
                    <circle
                      cx="250"
                      cy="125"
                      r="5"
                      fill={isSummoning ? "darkgoldenrod" : "#C5A059"}
                      className="opacity-80"
                    />
                  </g>
                ))}
              </g>

              {/* Layer 3: Inner Runes & Compass (Clockwise Fast) */}
              <g
                className="origin-center"
                style={
                  {
                    animation: `spin ${
                      isSummoning ? "1.5s" : "25s"
                    } linear infinite, ${
                      isSummoning
                        ? "expand-implode 2.5s ease-in-out forwards"
                        : "none"
                    }`,
                  } as React.CSSProperties
                }
              >
                <circle
                  cx="250"
                  cy="250"
                  r="145"
                  fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth="4"
                />
                <text width="500">
                  <textPath
                    href="#innerCirclePath"
                    startOffset="0%"
                    className={`font-bold tracking-[28px] transition-colors duration-300 ${
                      isSummoning ? "fill-[darkgoldenrod]" : "fill-[#8B7E66]"
                    }`}
                    style={{ fontSize: "18px" }}
                  >
                    {runesInner}
                  </textPath>
                </text>
              </g>

              {/* Layer 4: Hexagram (6-pointed star) - Counter-Clockwise Rotation & Pulse */}
              <g
                className="origin-center"
                style={
                  {
                    animation: `spin ${
                      isSummoning ? "1s" : "30s"
                    } linear infinite reverse, ${
                      isSummoning
                        ? "expand-implode 2.5s ease-in-out forwards"
                        : "none"
                    }`,
                  } as React.CSSProperties
                }
              >
                <g className="animate-pulse-slow">
                  {" "}
                  {/* Added Pulse Effect */}
                  <polygon
                    points="250,150 336.6,300 163.4,300"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="4"
                    className="opacity-70"
                  />
                  <polygon
                    points="250,350 336.6,200 163.4,200"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="4"
                    className="opacity-70"
                  />
                </g>

                {symbols.map((sym, i) => {
                  const angle = i * (360 / 6);
                  const r = 90;
                  const x = 250 + r * Math.cos(((angle - 90) * Math.PI) / 180);
                  const y = 250 + r * Math.sin(((angle - 90) * Math.PI) / 180);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSummoning ? "darkgoldenrod" : "#C5A059"}
                      fontSize="14"
                      transform={`rotate(${angle}, ${x}, ${y})`}
                    >
                      {sym}
                    </text>
                  );
                })}
              </g>

              {/* Layer 5: Center Core - BLINDING WHITE on Summon */}
              <g className="origin-center">
                {/* Background Glow Pulse */}
                <circle
                  cx="250"
                  cy="250"
                  r={isSummoning ? "100" : "40"}
                  fill={"none"}
                  stroke="url(#goldGradient)"
                  strokeWidth="2"
                  className="transition-all duration-1000"
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="opacity"
                    values="0.3;0.8;0.3"
                    dur={isSummoning ? "3s" : "3s"}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Inner Eye */}
                <circle
                  cx="250"
                  cy="250"
                  r="10"
                  fill={isSummoning ? "darkgoldenrod" : "#C5A059"}
                  filter="url(#glow)"
                >
                  <animate
                    attributeName="opacity"
                    values="0.5;1;0.5"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .animate-pulse-slow {
             animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes expand-implode {
            0% { transform: scale(1); }
            10% { transform: scale(1.2); }
            60% { transform: scale(1.2); }
            100% { transform: scale(0); }
        }
      `}</style>
    </div>
  );
};

// Optimized Particle System using Framer Motion
const MagicCircleParticles = React.memo(
  ({ gameState, isFlash }: { gameState: GameState; isFlash: boolean }) => {
    // Generate static particle config once
    const particles = useMemo(() => {
      return Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        angle: Math.random() * 360,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        startDist: Math.random() * 50,
      }));
    }, []);

    const isSummoning = gameState === "SUMMONING";

    return (
      <>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full blur-[1px] will-change-transform"
            style={{
              backgroundColor: isSummoning ? "darkgoldenrod" : "#FFD700",
              width: p.size,
              height: p.size,
              boxShadow: `0 0 ${p.size * 2}px ${isSummoning ? "#fff" : "gold"}`,
            }}
            initial={{
              opacity: 0,
              rotate: p.angle,
              x: 0, // We'll use x to represent distance from center (rotated by parent or self)
            }}
            animate={
              isFlash
                ? {
                    // Eruption: Explode outward fast
                    opacity: [1, 0],
                    x: [0, 300], // Move way out
                    transition: { duration: 0.5, ease: "easeOut" },
                  }
                : isSummoning
                ? {
                    // Implosion: Start far, move in
                    opacity: [0, 1, 0],
                    x: [200, 0],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeIn",
                      delay: p.delay,
                    },
                  }
                : {
                    // Idle: Float gently from center out
                    opacity: [0, 0.8, 0],
                    x: [0, 60],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: p.delay,
                    },
                  }
            }
            // Rotate the particle container to the correct angle
            // We apply the rotation to the wrapper or via transform template
            transformTemplate={({ x }) =>
              `rotate(${p.angle}deg) translateX(${x})`
            }
          />
        ))}
      </>
    );
  }
);

MagicCircleParticles.displayName = "MagicCircleParticles";

export default MagicCircle;
