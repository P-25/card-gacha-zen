/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const FloatingParticles = () => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // The SCSS used 200 particles.
    // In React/JS, 60-80 is usually enough for the same visual density
    // without killing mobile performance.
    const particleCount = 70;

    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      // Logic from SCSS: $particleBaseSize: 8
      const size = Math.random() * 8 + 1;

      // Logic from SCSS: Duration 28s + random(9s)
      const duration = Math.random() * 9 + 28;

      // Logic from SCSS: random delay
      const delay = Math.random() * 37;

      const startX = Math.random() * 100; // vw
      const endX = Math.random() * 100; // vw

      return {
        id: i,
        size,
        duration,
        delay,
        startX,
        endX,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </div>
  );
};

const Particle = ({ size, duration, delay, startX, endX }: any) => {
  const zIndex = Math.random() + 1 > 1.5 ? "z-0" : "z-50";
  const colors = [
    "#99FFFF", // Cyan
    "#FFD700", // Gold
    "#FFFFFF", // White
  ];

  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      id="particles"
      className={`absolute rounded-full ${zIndex}`}
      style={{
        width: size,
        height: size,
        // The exact Gradient from your SCSS
        backgroundImage: `radial-gradient(
          ${color}, 
          ${color} 60%, 
          ${color}00 100%
        )`,
        mixBlendMode: "screen", // Key for the glowing effect
      }}
      initial={{
        x: `${startX}vw`,
        y: "50vh", // Start below screen
        opacity: 0,
      }}
      animate={{
        x: `${endX}vw`,
        y: "-20vh", // Move above screen
        opacity: 1,
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        delay: delay,
      }}
    >
      {/* Inner animation for Pulse/Scale (The .circle animation in your CSS) */}
      <motion.div
        className="w-full h-full rounded-full"
        animate={{
          opacity: [1, 0.7, 1],
          scale: [0.4, 2.2, 0.4],
        }}
        transition={{
          duration: 2, // 200ms + 2s logic simplified
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default FloatingParticles;
