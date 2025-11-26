/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// components/summon/ExplosionParticles.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ExplosionParticlesProps {
  color?: string; // Optional: pass the crystal color here
}

const ExplosionParticles = ({ color = "#FFD700" }: ExplosionParticlesProps) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate 30 particles for the explosion
    const particleCount = 30;
    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2; // Random direction
      const distance = Math.random() * 100 + 50; // Fly out distance (50px to 150px)
      const size = Math.random() * 6 + 2; // Size between 2px and 8px
      const duration = Math.random() * 0.5 + 0.5; // 0.5s to 1s duration

      // Calculate end positions based on angle and distance
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;

      return {
        id: i,
        size,
        endX,
        endY,
        duration,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    // Container centered exactly where the crystal is
    <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 ${p.size * 2}px ${color}`, // Add a glow
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: p.endX,
            y: p.endY,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: p.duration,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default ExplosionParticles;
