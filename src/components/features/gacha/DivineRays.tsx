"use client";
import { motion } from "framer-motion";

export const DivineRays = ({ rarity = "common" }: { rarity?: string }) => {
  // Define colors based on rarity
  const glowColors: Record<string, string> = {
    common: "from-slate-400/20",
    uncommon: "from-emerald-400/30", // Matches your Deer Deity
    rare: "from-blue-400/40",
    legendary: "from-amber-400/50",
  };

  const colorClass = glowColors[rarity.toLowerCase()] || glowColors.common;

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      {/* Rotating Rays */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-[800px] h-[800px] relative opacity-50"
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute top-1/2 left-1/2 w-full h-12 -translate-y-1/2 origin-left bg-linear-to-r ${colorClass} to-transparent blur-xl`}
            style={{ rotate: `${i * 30}deg` }} // 360 / 12 rays = 30deg apart
          />
        ))}
      </motion.div>

      {/* Central Core Glow */}
      <div
        className={`absolute w-64 h-64 rounded-full bg-linear-to-r ${colorClass} to-transparent blur-[80px]`}
      />
    </div>
  );
};

export default DivineRays;
