"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface CosmicButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

// 1. Define the particle shape
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function CosmicButton({
  onClick,
  disabled = false,
}: CosmicButtonProps) {
  // 2. State for particles
  const [particles, setParticles] = useState<Particle[]>([]);

  // 3. Generate particles only on the client side (useEffect)
  useEffect(() => {
    const particleCount = 12; // Adjust number of stars here
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position 0-100%
      y: Math.random() * 100, // Random vertical position 0-100%
      size: Math.random() * 2 + 1, // Size between 1px and 3px
      duration: Math.random() * 2 + 2, // Animation speed 2s-4s
      delay: Math.random() * 2, // Random start delay
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(newParticles);
  }, []);

  return (
    <div
      className={`relative group w-fit mx-auto ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Outer glowing blur effect */}
      {!disabled && (
        <div className="absolute -inset-1 bg-white rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
      )}

      {/* The actual clickable button container */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        className="relative px-16 py-3 rounded-full overflow-hidden border-[1.5px] border-purple-300/50 cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.3)_inset]"
      >
        {/* Galaxy Background Layer */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center filter saturate-150 contrast-125 transition-transform duration-[10s] ease-linear group-hover:scale-110"
          style={{
            backgroundImage: "url('/assets/background/cosmic-button-bg.png')",
          }}
        ></div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 z-1 bg-indigo-950/60 mix-blend-multiply"></div>

        {/* ============================== */}
        {/* ▼▼▼ PARTICLE EFFECTS LAYER ▼▼▼ */}
        {/* ============================== */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute bg-white rounded-full shadow-[0_0_5px_white]"
              initial={{
                x: `${p.x}%`,
                y: `${p.y}%`,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: [null, `${p.y - 40}%`], // Float upwards
                opacity: [0, 1, 0], // Fade in/out
                scale: [0, 1, 0], // Grow/shrink
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
            />
          ))}
        </div>
        {/* ▲▲▲ END PARTICLE EFFECTS ▲▲▲ */}

        {/* Button Content */}
        <div className="relative z-20 flex flex-col items-center justify-center text-white drop-shadow-lg">
          <span className="font-display font-bold text-xl tracking-wider uppercase text-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            Single Summon
          </span>
          <div className="w-full flex flex-row justify-center gap-1 items-center mt-0.5">
            <Image
              src="/assets/gem3.svg"
              alt="Currency"
              className="object-contain"
              priority
              width={20}
              height={20}
            />
            <span className="text-sm font-bold text-white shadow-black drop-shadow-md">
              x10
            </span>
          </div>
        </div>

        {/* Shine effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"></div>
      </motion.button>
    </div>
  );
}
