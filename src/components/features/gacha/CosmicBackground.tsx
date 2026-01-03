import React, { useState, useMemo } from "react";
import { Sword, Shield, Wind } from "lucide-react";

/**
 * ANIMATION CONFIG
 * Custom animations for the "God Rays" and the radial particle burst.
 */
const CustomAnimations = () => (
  <style>{`
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 20s linear infinite;
    }
    .animate-pulse-fast {
      animation: pulse 1.5s ease-in-out infinite alternate;
    }
    
    /* PARTICLE EMITTER ANIMATION */
    /* 1. Starts at center (behind card).
       2. Moves OUTWARDS (translate).
       3. Grows LARGER (scale 0.5 -> 2.5).
       4. Stays opaque until the very end.
    */
    @keyframes fly-out {
      0% { 
        transform: translate(0px, 0px) scale(0.5); 
        opacity: 0; 
      }
      5% { 
        opacity: 1; 
      }
      80% {
        opacity: 1;
      }
      100% { 
        /* Travel 7x the base vector to ensure they go out of view */
        transform: translate(calc(var(--tx) * 7), calc(var(--ty) * 7)) scale(2.5); 
        opacity: 0; 
      }
    }
    .animate-fly-out {
      animation: fly-out linear infinite;
    }

    @keyframes float-card {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .animate-float-card {
      animation: float-card 5s ease-in-out infinite;
    }
  `}</style>
);

/**
 * COMPONENT: LensFlare
 * A custom SVG shape that mimics the 4-point "shiny" star.
 */
const LensFlare = ({
  color = "white",
  size = 24,
  className = "",
}: {
  color?: string;
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.9))" }}
  >
    {/* Center core */}
    <circle cx="50" cy="50" r="10" fill={color} opacity="0.8" />
    {/* Long spikes */}
    <path
      d="M50 0 C52 35 60 48 100 50 C60 52 52 65 50 100 C48 65 40 52 0 50 C40 48 48 35 50 0 Z"
      fill={color}
    />
  </svg>
);

/**
 * COMPONENT: CardRevealEffect
 */
interface CardRevealProps {
  rarityColor?: string;
}

const CardRevealEffect = ({ rarityColor = "#f59e0b" }: CardRevealProps) => {
  // Generate a high density of particles
  // All particles will be rendered behind the card now.
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      // Calculate a random angle for trajectory
      const angleRad = Math.random() * 2 * Math.PI;
      // Base distance vector (approx 60px)
      const tx = Math.cos(angleRad) * 60;
      const ty = Math.sin(angleRad) * 60;

      return {
        id: i,
        tx,
        ty,
        delay: Math.random() * -5, // Random start time for continuous flow
        duration: 2 + Math.random() * 3, // Slower duration for majestic feel
        size: Math.random() < 0.3 ? 8 : 12 + Math.random() * 20,
        color: Math.random() > 0.4 ? "white" : rarityColor,
        opacity: 0.7 + Math.random() * 0.3,
      };
    });
  }, [rarityColor]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <CustomAnimations />

      {/* --- LAYER 1: Background Rays --- */}
      <div
        className="absolute inset-[-150%] w-[400%] h-[400%] animate-spin-slow opacity-40 blur-sm will-change-transform"
        style={{
          background: `conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            ${rarityColor} 15deg,
            transparent 30deg,
            transparent 45deg,
            ${rarityColor} 60deg,
            transparent 75deg,
            transparent 90deg,
            ${rarityColor} 105deg,
            transparent 120deg,
            transparent 135deg,
            ${rarityColor} 150deg,
            transparent 165deg,
            transparent 180deg,
            ${rarityColor} 195deg,
            transparent 210deg,
            transparent 225deg,
            ${rarityColor} 240deg,
            transparent 255deg,
            transparent 270deg,
            ${rarityColor} 285deg,
            transparent 300deg,
            transparent 315deg,
            ${rarityColor} 330deg,
            transparent 345deg
          )`,
        }}
      />
      {/* Reverse Rays */}
      <div
        className="absolute inset-[-150%] w-[400%] h-[400%] animate-spin-slow opacity-20 mix-blend-screen will-change-transform"
        style={{
          animationDirection: "reverse",
          animationDuration: "30s",
          background: `conic-gradient(
            from 15deg at 50% 50%,
            transparent 0deg,
            ${rarityColor} 10deg,
            transparent 20deg,
            transparent 60deg,
            ${rarityColor} 70deg,
            transparent 80deg,
            transparent 120deg,
            ${rarityColor} 130deg,
            transparent 140deg,
            transparent 180deg,
            ${rarityColor} 190deg,
            transparent 200deg,
            transparent 240deg,
            ${rarityColor} 250deg,
            transparent 260deg,
            transparent 300deg,
            ${rarityColor} 310deg,
            transparent 320deg
          )`,
        }}
      />

      {/* --- LAYER 2: Vignette --- */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* --- LAYER 3: Glow --- */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[50px] rounded-full animate-pulse-fast transition-colors duration-1000 bg-white"
        style={{ opacity: 0.6 }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 blur-[80px] rounded-full transition-colors duration-1000"
        style={{ backgroundColor: rarityColor, opacity: 0.4 }}
      />

      {/* --- LAYER 4: ALL Particles (Behind Card) --- */}
      {/* z-index 20 is below the card's z-30. All particles now live here. */}
      <div className="absolute top-1/2 left-1/2 w-0 h-0 z-20 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 left-0 w-0 h-0 flex items-center justify-center animate-fly-out will-change-transform"
            style={
              {
                "--tx": `${p.tx}px`,
                "--ty": `${p.ty}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties
            }
          >
            <div
              style={{
                transform: `rotate(${Math.random() * 90}deg)`,
                opacity: p.opacity,
              }}
            >
              <LensFlare size={p.size} color={p.color} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * MAIN APP CONTAINER
 */
export default function CosmicBackground({
  rarity = "blue",
}: {
  rarity: "gold" | "blue" | "purple";
}) {
  const config = {
    gold: { color: "#fbbf24", label: "Legendary" }, // Amber-400
    purple: { color: "#a855f7", label: "Epic" }, // Purple-500
    blue: { color: "#3b82f6", label: "Rare" }, // Blue-500
  };

  return (
    <div className="inset-0 w-full h-full flex flex-col items-center justify-center">
      <CardRevealEffect rarityColor={config[rarity].color} />
    </div>
  );
}
