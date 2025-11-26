"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface SummonGateProps {
  onSummon: () => void;
}

export default function SummonGate({ onSummon }: SummonGateProps) {
  return (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-5">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md aspect-square flex items-center justify-center group cursor-pointer"
        onClick={onSummon}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow behind gate */}
        <div className="absolute inset-0 bg-[#8FA89B]/20 blur-[60px] rounded-full animate-pulse" />

        <Image
          src="/assets/zen-summon-pond-clean.png"
          alt="Summon Pond"
          fill
          className="object-contain drop-shadow-lg"
          priority
        />

        {/* Floating Label */}
        <div className="absolute bottom-8 bg-white/60 backdrop-blur-md border border-white/40 px-8 py-2 rounded-xl shadow-lg">
          <span className="font-display font-bold text-xl text-[#4A4A4A] tracking-widest uppercase">
            Meditate
          </span>
        </div>
      </motion.div>
    </div>
  );
}
