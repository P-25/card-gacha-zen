"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import TopBar from "@/components/features/home/TopBar";

interface SelectCardsPhaseProps {
  onConfirm: (deck: Card[]) => void;
  onBack: () => void;
}

export default function SelectCardsPhase({
  onConfirm,
  onBack,
}: SelectCardsPhaseProps) {
  const { inventory } = useSelector((state: RootState) => state.player);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  // Filter out duplicates if needed, or just show all unique instances
  // For now, assuming inventory has individual card instances or we pick by ID
  // If inventory has duplicates, we should handle that.
  // Let's just show the inventory.

  const toggleCardSelection = (card: Card) => {
    if (selectedCards.find((c) => c.id === card.id)) {
      setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
    } else {
      if (selectedCards.length < 3) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const totalAtk = selectedCards.reduce((sum, card) => sum + card.atk, 0);
  const totalHp = selectedCards.reduce((sum, card) => sum + card.hp, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col bg-[#F5EEDF]"
    >
      <TopBar title="SELECT CARDS" />

      {/* Stats Header */}
      <div className="px-4 py-2 flex justify-between items-center bg-white/50 backdrop-blur-sm mx-4 rounded-lg mt-2 shadow-sm">
        <div className="flex gap-4 text-sm font-bold text-[#2D3748]">
          <span>
            TOTAL ATK: <span className="text-red-600">{totalAtk}</span>
          </span>
          <span>
            HP: <span className="text-blue-600">{totalHp}</span>
          </span>
        </div>
        <div className="flex gap-2 text-xs font-bold text-[#4A5568]">
          <span>{selectedCards.length}/3 SELECTED</span>
        </div>
      </div>

      {/* Selected Slots */}
      <div className="flex justify-center gap-3 py-6 px-4">
        {[0, 1, 2].map((index) => {
          const card = selectedCards[index];
          return (
            <div
              key={index}
              className="w-24 h-36 rounded-lg border-2 border-dashed border-[#C5A059] bg-[#FAF3E5] flex items-center justify-center relative overflow-hidden shadow-inner"
              onClick={() => card && toggleCardSelection(card)}
            >
              {card ? (
                <motion.div
                  layoutId={`card-${card.id}`}
                  className="w-full h-full relative"
                >
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] p-1 text-center truncate">
                    {card.name}
                  </div>
                  <button className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                    ✕
                  </button>
                </motion.div>
              ) : (
                <span className="text-[#C5A059]/50 text-xs font-bold uppercase">
                  Slot {index + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center text-[#4A5568] text-xs font-bold mb-2 uppercase tracking-widest">
        Tap to fill slots
      </div>

      {/* Collection Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="grid grid-cols-3 gap-3">
          {inventory.map((card) => {
            const isSelected = selectedCards.find((c) => c.id === card.id);
            return (
              <motion.div
                key={card.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCardSelection(card)}
                className={`aspect-[2/3] rounded-lg overflow-hidden relative cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "ring-4 ring-[#422462] opacity-50 grayscale"
                    : "shadow-md hover:shadow-lg"
                }`}
              >
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover"
                />
                {/* Stats Badge */}
                <div className="absolute top-1 left-1 flex flex-col gap-1">
                  <div className="bg-red-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    ⚔ {card.atk}
                  </div>
                  <div className="bg-blue-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    🛡 {card.hp}
                  </div>
                </div>

                {/* Level Badge */}
                <div className="absolute top-1 right-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                  Lv.{card.level}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-20">
        <motion.button
          disabled={selectedCards.length !== 3}
          whileTap={{ scale: 0.95 }}
          onClick={() => onConfirm(selectedCards)}
          className={`w-full max-w-xs py-4 rounded-xl font-bold text-lg tracking-wider shadow-xl transition-all ${
            selectedCards.length === 3
              ? "bg-[#422462] text-white shadow-[#422462]/30"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          CONFIRM
        </motion.button>
      </div>
    </motion.div>
  );
}
