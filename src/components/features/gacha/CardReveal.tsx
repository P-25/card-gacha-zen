"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, Resource } from "@/types/game";

interface CardRevealProps {
  onReset: () => void;
  results: (Card | Resource)[];
}

export default function CardReveal({ onReset, results }: CardRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const item = results[currentIndex];

  if (!item) return null;

  const isCard = item.type === "CARD";
  const cardItem = item as Card;
  const resourceItem = item as Resource;

  const handleNext = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onReset();
    }
  };

  return (
    <motion.div
      key={currentIndex}
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="flex flex-col items-center gap-8"
    >
      {/* Card Reveal */}
      <div
        className={`relative w-64 h-96 ${
          isCard ? "bg-[#F5F2EB]" : "bg-yellow-100"
        } rounded-xl border-4 ${
          isCard ? "border-[#D8B4A0]" : "border-yellow-400"
        } shadow-2xl overflow-hidden group`}
      >
        <div className="absolute inset-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Rarity Glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            item.rarity === "LEGENDARY"
              ? "from-purple-500/40"
              : item.rarity === "RARE"
              ? "from-blue-500/40"
              : "from-[#8FA89B]/20"
          } to-transparent pointer-events-none`}
        />
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-display font-bold text-[#4A4A4A] mb-1">
          {item.name}
        </h3>
        {!isCard && (
          <p className="text-lg text-yellow-600 font-bold">
            x{resourceItem.value}
          </p>
        )}
        {isCard && (
          <div className="h-1 w-12 bg-[#8FA89B] mx-auto rounded-full" />
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        className="px-8 py-3 bg-[#8FA89B] text-white font-bold rounded-full shadow-lg uppercase tracking-wider hover:bg-[#7A9286] transition-colors"
      >
        {currentIndex < results.length - 1 ? "Next" : "Collect"}
      </motion.button>
    </motion.div>
  );
}
