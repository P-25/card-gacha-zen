import React, { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { Card } from "@/types/game";

// --- Types ---
type GameState = "idle" | "feeding" | "burst" | "finished";

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  type:
    | "arrow"
    | "card"
    | "impact-arrow"
    | "impact-spark"
    | "glow-orb"
    | "smoke-ring";
  delay: number;
  duration: number;
  color?: string;
}

// --- Helper for random range ---
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// --- Components ---

const AnimatedCard = ({
  state,
  impactKey,
  card,
}: {
  state: GameState;
  impactKey: number;
  card: Card;
}) => {
  // Animation classes
  let containerClass = "transform transition-all duration-300";
  let borderClass = "border-stone-800 shadow-xl";
  let glowEffect = "";

  if (state === "feeding") {
    containerClass = "scale-100";
    borderClass = "border-amber-600";
    glowEffect = "shadow-[0_0_40px_rgba(245,158,11,0.5)]";
  } else if (state === "burst" || state === "finished") {
    containerClass = "scale-110 z-20";
    borderClass = "border-amber-500";
    glowEffect =
      "shadow-[0_0_80px_rgba(245,158,11,0.8)] ring-8 ring-amber-400/30";
  }

  return (
    <div
      key={impactKey} // Trigger shake on impact
      className={`relative w-56 h-72 md:w-64 md:h-80 rounded-2xl bg-stone-900 border-[6px] ${borderClass} ${containerClass} ${glowEffect} ${
        state === "feeding" && impactKey > 0 ? "animate-thud" : ""
      }`}
    >
      {/* Card Internal Art */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-700 via-stone-800 to-stone-950 flex flex-col items-center justify-center overflow-hidden rounded-xl">
        <div
          className={`absolute w-full h-full bg-radial-gradient from-yellow-900/50 to-transparent transition-opacity duration-300 ${
            state === "feeding" ? "opacity-100" : "opacity-0"
          }`}
        ></div>

        {/* Character Art */}
        <div className="relative w-full h-full">
          <Image
            src={card.image}
            alt={card.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Overlay Flash */}
        <div
          className={`absolute inset-0 bg-white pointer-events-none mix-blend-overlay transition-opacity duration-100 ${
            state === "burst" ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      </div>
    </div>
  );
};

// Updated ParticleSystem
const ParticleSystem = ({
  particles,
  className = "z-50",
}: {
  particles: Particle[];
  className?: string;
}) => {
  return (
    <div
      className={`absolute inset-0 overflow-visible pointer-events-none ${className}`}
    >
      {particles.map((p) => {
        // STYLE FOR SMOKE RINGS
        if (p.type === "smoke-ring") {
          return (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 rounded-full border-4 border-amber-300/30 bg-amber-500/10"
              style={{
                width: "200px",
                height: "200px",
                marginLeft: "-100px",
                marginTop: "-100px",
                animation: `pulseSmoke ${p.duration}s ease-out forwards`,
                animationDelay: `${p.delay}s`,
                filter: "blur(15px)",
                boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)",
              }}
            />
          );
        }

        // STYLE FOR GLOW ORBS
        if (p.type === "glow-orb") {
          return (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 bg-[#fcd34d] rounded-full"
              style={{
                width: `${p.scale * 4}px`,
                height: `${p.scale * 4}px`,
                marginLeft: `-${p.scale * 2}px`,
                marginTop: `-${p.scale * 2}px`,
                ["--tx" as any]: `${p.x}px`,
                ["--ty" as any]: `${p.y}px`,
                animation: `flutterOut ${p.duration}s ease-out forwards`,
                animationDelay: `${p.delay}s`,
                boxShadow: "0 0 8px 3px rgba(251, 191, 36, 0.6)",
              }}
            />
          );
        }

        // STYLE FOR BURST ARROWS
        if (p.type === "arrow") {
          return (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 text-amber-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
              style={{
                marginLeft: p.x - 32,
                marginTop: p.y,
                transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
                animation: `floatUp ${p.duration}s ease-out forwards`,
                animationDelay: `${p.delay}s`,
                opacity: 0,
              }}
            >
              <ArrowUp size={64} strokeWidth={5} fill="#f59e0b" />
            </div>
          );
        }

        // STYLE FOR IMPACT ARROWS
        if (p.type === "impact-arrow") {
          return (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 text-orange-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              style={{
                marginLeft: p.x - 25,
                marginTop: p.y,
                animation: `shootUpFade ${p.duration}s ease-out forwards`,
                animationDelay: `${p.delay}s`,
              }}
            >
              <ArrowUp size={50} strokeWidth={6} />
            </div>
          );
        }

        // STYLE FOR IMPACT SPARKS
        if (p.type === "impact-spark") {
          return (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 bg-white rounded-full blur-[1px] shadow-[0_0_8px_white]"
              style={{
                width: "12px",
                height: "12px",
                ["--tx" as any]: `${p.x}px`,
                ["--ty" as any]: `${p.y}px`,
                animation: `explode ${p.duration}s ease-out forwards`,
                animationDelay: `${p.delay}s`,
                backgroundColor: p.color || "white",
              }}
            />
          );
        }

        // STYLE FOR FEEDING CARDS
        if (p.type === "card") {
          return (
            <div
              key={p.id}
              className="absolute left-1/2 top-1/2 w-12 h-16 bg-stone-800 border-2 border-stone-600 rounded-md shadow-2xl flex items-center justify-center z-50"
              style={{
                ["--sx" as any]: `${p.x}px`,
                ["--sy" as any]: `${p.y}px`,
                ["--r" as any]: `${p.rotation}deg`,
                // FIXED: Changed 'forwards' to 'both' to handle delay properly
                animation: `suckIn ${p.duration}s ease-in both`,
                animationDelay: `${p.delay}s`,
              }}
            >
              <div className="w-6 h-8 bg-amber-700 rounded-sm opacity-90 border border-stone-900/50"></div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

interface LevelUpAnimationProps {
  card: Card;
  oldLevel: number;
  newLevel: number;
  oldStats: { pow: number; spd: number; def: number };
  newStats: { pow: number; spd: number; def: number };
  onClose: () => void;
}

export default function LevelUpAnimation({
  card,
  oldLevel,
  newLevel,
  oldStats,
  newStats,
  onClose,
}: LevelUpAnimationProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bgParticles, setBgParticles] = useState<Particle[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [impactKey, setImpactKey] = useState(0);

  const FEEDER_COUNT = 3;
  const FEEDER_INTERVAL = 600;
  const FLIGHT_DURATION = 0.5;
  const TOTAL_FEED_TIME = FEEDER_COUNT * FEEDER_INTERVAL + 500;

  const spawnImpactParticles = (idBase: number) => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < 4; i++) {
      newParticles.push({
        id: idBase + i,
        x: random(-40, 40),
        y: random(-10, 10),
        scale: random(0.8, 1.2),
        rotation: random(-10, 10),
        type: "impact-arrow",
        delay: 0,
        duration: 0.8,
      });
    }

    for (let i = 0; i < 12; i++) {
      const angle = random(0, Math.PI * 2);
      const dist = random(30, 90);
      newParticles.push({
        id: idBase + 10 + i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        scale: 1,
        rotation: 0,
        type: "impact-spark",
        delay: 0,
        duration: 0.6,
        color: Math.random() > 0.5 ? "#fbbf24" : "#ffffff",
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  const startSequence = useCallback(() => {
    setGameState("feeding");
    setImpactKey(0);
    setParticles([]);
    setBgParticles([]);

    // UPDATED: Increased Y values to ensure cards start off-screen
    const feeders: Particle[] = [
      // Bottom Left
      {
        id: 1,
        x: -250,
        y: 600,
        scale: 1,
        rotation: -30,
        type: "card",
        delay: 0,
        duration: FLIGHT_DURATION,
      },
      // Bottom Right
      {
        id: 2,
        x: 250,
        y: 600,
        scale: 1,
        rotation: 30,
        type: "card",
        delay: 0.6,
        duration: FLIGHT_DURATION,
      },
      // Bottom Center - Pushed further down to 700
      {
        id: 3,
        x: 0,
        y: 700,
        scale: 1,
        rotation: 0,
        type: "card",
        delay: 1.2,
        duration: FLIGHT_DURATION,
      },
    ];
    setParticles(feeders);

    feeders.forEach((feeder, index) => {
      const impactTime = (feeder.delay + feeder.duration) * 1000 - 100;

      setTimeout(() => {
        setImpactKey((k) => k + 1);
        spawnImpactParticles(1000 + index * 50);
      }, impactTime);
    });

    setTimeout(() => {
      setGameState("burst");
      setParticles([]);

      const burstParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        burstParticles.push({
          id: 2000 + i,
          x: random(-160, 160),
          y: random(50, 250),
          scale: random(0.8, 1.8),
          rotation: random(-25, 25),
          type: "arrow",
          delay: random(0, 0.5),
          duration: 1.5,
        });
      }
      setParticles(burstParticles);

      setTimeout(() => {
        setGameState("finished");
        setShowResults(true);
      }, 1500);
    }, TOTAL_FEED_TIME);
  }, [TOTAL_FEED_TIME]);

  useEffect(() => {
    // Auto-start sequence on mount
    startSequence();
  }, [startSequence]);

  return (
    <div className="absolute inset-0 z-50 font-sans overflow-hidden select-none">
      <style>{`
        @keyframes suckIn {
          0% { transform: translate(var(--sx), var(--sy)) rotate(var(--r)) scale(1); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translate(0, 0) rotate(var(--r)) scale(0.1); opacity: 0; }
        }

        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
          20% { opacity: 1; transform: translateY(-40px) scale(1.2); }
          100% { transform: translateY(-350px) scale(1); opacity: 0; }
        }

        @keyframes flutterOut {
            0% { transform: translate(0,0) scale(0.5); opacity: 0; }
            10% { opacity: 1; }
            25% { transform: translate(calc(var(--tx) * 0.25 + 5px), calc(var(--ty) * 0.25 - 5px)); }
            50% { transform: translate(calc(var(--tx) * 0.5 - 5px), calc(var(--ty) * 0.5 + 5px)); }
            75% { transform: translate(calc(var(--tx) * 0.75 + 5px), calc(var(--ty) * 0.75 - 5px)); }
            100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }

        @keyframes shootUpFade {
            0% { transform: translateY(0) scale(0.2); opacity: 1; }
            50% { transform: translateY(-50px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }

        @keyframes explode {
            0% { transform: translate(0,0) scale(0.2); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
        }
        
        @keyframes thud {
            0% { transform: scale(1); }
            30% { transform: scale(0.92); }
            60% { transform: scale(1.05); } 
            100% { transform: scale(1); }
        }
        .animate-thud {
            animation: thud 0.2s cubic-bezier(.17,.67,.83,.67);
        }

        @keyframes pulseSmoke {
            0% { transform: scale(0.8); opacity: 0; border-width: 8px; }
            20% { opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; border-width: 0px; }
        }
      `}</style>

      {/* Main Container */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-hidden flex flex-col items-center border-x-4 border-slate-200">
        {/* Ambient Background */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            gameState === "burst" || gameState === "finished"
              ? "bg-amber-500/10"
              : "bg-slate-100/50"
          }`}
        ></div>

        {/* --- Animation Layer --- */}
        <div className="relative z-10 w-full h-full flex flex-col items-center pt-24">
          {/* Header Text */}
          <div
            className={`absolute top-16 transition-all duration-300 transform ${
              showResults
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-0 opacity-0 translate-y-10"
            }`}
          >
            <h1
              className="text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] tracking-widest text-stroke-3 stroke-amber-700"
              style={{ WebkitTextStroke: "2px #b45309" }}
            >
              LEVELED UP!
            </h1>
          </div>

          {/* The Card Container with Layers */}
          <div
            className={`relative flex flex-col items-center transition-transform duration-500 ${
              showResults ? "translate-y-4" : "translate-y-16"
            }`}
          >
            <ParticleSystem particles={bgParticles} className="z-0" />
            <AnimatedCard state={gameState} impactKey={impactKey} card={card} />
            <ParticleSystem particles={particles} className="z-50" />
          </div>

          {/* Results Panel */}
          <div
            className={`absolute bottom-0 w-full transition-all duration-500 ease-out transform ${
              showResults ? "translate-y-0" : "translate-y-full opacity-0"
            }`}
          >
            <div className="flex flex-col items-center w-full bg-gradient-to-t from-[#1c1917] to-transparent pt-12 pb-8 px-6">
              {/* Decorative RESULTS Divider */}
              <div className="relative w-full flex items-center justify-center mb-6">
                <div className="absolute w-full h-[3px] bg-black"></div>
                <div className="relative z-10 bg-black px-8 py-1 rounded-full border border-stone-700/50">
                  <span className="text-white font-black uppercase tracking-[0.2em] text-sm">
                    Results
                  </span>
                </div>
              </div>

              {/* Stats Layout */}
              <div className="w-full flex flex-col gap-6 mb-8">
                {/* Level Stat */}
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold uppercase tracking-wide text-sm mb-1 drop-shadow-md">
                    Level
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-black text-3xl drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
                      {oldLevel}
                    </span>
                    <ArrowUp
                      size={28}
                      className="text-amber-500 stroke-[4px] animate-bounce"
                    />
                    <span className="text-amber-500 font-black text-3xl drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
                      {newLevel}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  {/* Power */}
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold uppercase tracking-wide text-xs mb-1 drop-shadow-md">
                      POW
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-bold text-xl">
                        {oldStats.pow}
                      </span>
                      <ArrowUp
                        size={16}
                        className="text-amber-500 stroke-[3px]"
                      />
                      <span className="text-amber-500 font-bold text-xl">
                        {newStats.pow}
                      </span>
                    </div>
                  </div>
                  {/* Speed */}
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold uppercase tracking-wide text-xs mb-1 drop-shadow-md">
                      SPD
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-bold text-xl">
                        {oldStats.spd}
                      </span>
                      <ArrowUp
                        size={16}
                        className="text-amber-500 stroke-[3px]"
                      />
                      <span className="text-amber-500 font-bold text-xl">
                        {newStats.spd}
                      </span>
                    </div>
                  </div>
                  {/* Defense */}
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold uppercase tracking-wide text-xs mb-1 drop-shadow-md">
                      DEF
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-bold text-xl">
                        {oldStats.def}
                      </span>
                      <ArrowUp
                        size={16}
                        className="text-amber-500 stroke-[3px]"
                      />
                      <span className="text-amber-500 font-bold text-xl">
                        {newStats.def}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* OK Button */}
              <button
                onClick={onClose}
                className="w-48 bg-gradient-to-b from-yellow-300 to-yellow-500 border-b-[6px] border-yellow-700 active:border-b-0 active:translate-y-[6px] text-[#422006] font-black py-4 rounded-2xl text-xl uppercase tracking-wider transition-all shadow-xl hover:brightness-110"
              >
                OK
              </button>
            </div>
          </div>
        </div>

        {/* Screen Flash */}
        <div
          className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-300 z-50 mix-blend-overlay ${
            gameState === "burst" ? "opacity-60" : "opacity-0"
          }`}
        ></div>
      </div>
    </div>
  );
}
