import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/types/game";
import Image from "next/image";

// --- Shared Assets & Components ---

export const ToonSword = ({ mirror = false }: { mirror?: boolean }) => (
  <div
    className={`relative w-40 h-40 ${
      mirror ? "scale-x-[-1]" : ""
    } filter drop-shadow-2xl`}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="bladeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M45 80 L45 25 Q50 10 55 25 L55 80 Z"
        fill="url(#bladeGrad)"
        stroke="#475569"
        strokeWidth="1.5"
      />
      <path d="M50 20 L50 80" stroke="#cbd5e1" strokeWidth="1" />
      <path
        d="M30 75 Q50 85 70 75 L70 82 Q50 92 30 82 Z"
        fill="url(#goldGrad)"
        stroke="#78350f"
        strokeWidth="1.5"
      />
      <path d="M47 82 L53 82 L53 95 L47 95 Z" fill="#713f12" />
      <circle
        cx="50"
        cy="96"
        r="3"
        fill="#fcd34d"
        stroke="#78350f"
        strokeWidth="1"
      />
    </svg>
  </div>
);

export const SkullCrossbones = () => (
  <div className="relative w-48 h-48 filter drop-shadow-2xl z-20">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <radialGradient id="boneGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#d1d5db" />
        </radialGradient>
      </defs>
      <g transform="translate(50,55) rotate(45)">
        <path
          d="M-35 -5 L35 -5 L35 5 L-35 5 Z"
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="2"
        />
        <circle
          cx="-38"
          cy="0"
          r="6"
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="2"
        />
        <circle
          cx="38"
          cy="0"
          r="6"
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="2"
        />
      </g>
      <g transform="translate(50,55) rotate(-45)">
        <path
          d="M-35 -5 L35 -5 L35 5 L-35 5 Z"
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="2"
        />
        <circle
          cx="-38"
          cy="0"
          r="6"
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="2"
        />
        <circle
          cx="38"
          cy="0"
          r="6"
          fill="#e5e7eb"
          stroke="#374151"
          strokeWidth="2"
        />
      </g>
      <path
        d="M25 45 Q25 15 50 15 Q75 15 75 45 Q75 60 65 70 L60 80 L40 80 L35 70 Q25 60 25 45 Z"
        fill="url(#boneGrad)"
        stroke="#1f2937"
        strokeWidth="2.5"
      />
      <circle cx="40" cy="50" r="8" fill="#1f2937" />
      <circle cx="60" cy="50" r="8" fill="#1f2937" />
      <path d="M50 60 L46 68 L54 68 Z" fill="#1f2937" />
      <path
        d="M42 80 L42 72 M50 80 L50 72 M58 80 L58 72"
        stroke="#1f2937"
        strokeWidth="2"
      />
    </svg>
  </div>
);

interface GameCardProps {
  card: Card;
  index: number;
  isSingle?: boolean;
}

export const GameCard = ({ card, index, isSingle }: GameCardProps) => {
  // Map rarity to stars
  const stars = card.rarity === "RARE" ? 3 : card.rarity === "UNCOMMON" ? 2 : 1;

  return (
    <motion.div
      initial={{
        x: isSingle ? 0 : (2 - index) * -20,
        y: -250,
        scale: 0,
        rotate: (Math.random() - 0.5) * 20,
      }}
      animate={{ x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 18,
        delay: 0.1 + index * 0.1,
      }}
      className={`relative ${
        isSingle ? "w-24 h-32" : "w-[70px] h-[100px]"
      } bg-slate-800 rounded-lg border-[3px] border-[#3f3f4f] overflow-hidden flex flex-col items-center shrink-0 shadow-lg group mx-1`}
    >
      <div className="absolute inset-0">
        <Image src={card.image} alt={card.name} fill className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>

      <div className="absolute bottom-6 w-full text-center z-10">
        <div className="inline-block px-1.5 py-0.5 bg-black/70 rounded text-[8px] text-white font-black tracking-wider border border-white/10">
          LVL {card.level}
        </div>
      </div>
      <div className="absolute bottom-4 flex gap-0.5 z-10">
        {[...Array(stars)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-[8px] leading-none">
            ★
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.5 }}
        animate={{ opacity: [0, 1, 0], y: -30, scale: 1.2 }}
        transition={{
          delay: 0.6 + index * 0.1,
          duration: 1.5,
          ease: "easeOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 text-white font-black text-[10px] whitespace-nowrap drop-shadow-[0_2px_0_rgba(0,0,0,1)] z-20 stroke-black"
        style={{ WebkitTextStroke: "0.5px black" }}
      >
        {card.experience} EXP
      </motion.div>
    </motion.div>
  );
};

export const RewardItem = ({
  icon,
  amount,
  color,
  delay,
}: {
  icon: React.ReactNode;
  amount: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ scale: 0, y: 20 }}
    animate={{ scale: 1, y: 0 }}
    transition={{ type: "spring", delay: delay, bounce: 0.6 }}
    className="flex flex-col items-center justify-center gap-1"
  >
    <div
      className={`w-12 h-12 ${color} rounded-xl border-b-[3px] border-black/20 flex items-center justify-center shadow-lg relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
      <div className="relative z-10 transform scale-110">{icon}</div>
      <div className="absolute -bottom-2 bg-[#3b82f6] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/20 shadow-sm z-20">
        x{amount}
      </div>
    </div>
  </motion.div>
);

export const Confetti = () => {
  const particles = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-sm ${
            i % 2 === 0 ? "bg-yellow-400" : "bg-purple-400"
          }`}
          initial={{
            x: "50%",
            y: "30%",
            opacity: 1,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100 + 50}%`,
            rotate: Math.random() * 720,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 2 + 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

export const Smoke = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full bg-gray-800 mix-blend-multiply blur-sm"
          initial={{
            x: `${Math.random() * 100}%`,
            y: "100%",
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            y: "0%",
            opacity: [0, 0.6, 0],
            scale: 2,
            x: `${Math.random() * 100}%`,
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            ease: "easeOut",
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};
