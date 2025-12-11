"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import TopBar from "@/components/features/home/TopBar";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";

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

  // Filter States
  const [visibleCount, setVisibleCount] = useState(24);
  const SCROLL_INCREMENT = 24;

  const filteredCards = useMemo(() => {
    let result = [...inventory];

    // 4. Sort
    result.sort((a, b) => {
      const powerA = a.hp + a.atk;
      const powerB = b.hp + b.atk;
      return powerB - powerA;
    });

    return result;
  }, [inventory]);

  const toggleCardSelection = (
    card: Card,
    source: "list" | "slot" = "slot"
  ) => {
    if (selectedCards.find((c) => c.id === card.id)) {
      console.log(`Debug - already selected`);
      if (source === "slot") {
        setSelectedCards(selectedCards.filter((c) => c.id !== card.id));
      }
    } else {
      if (selectedCards.length < 3) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (visibleCount < filteredCards.length) {
        setVisibleCount((prev) =>
          Math.min(prev + SCROLL_INCREMENT, filteredCards.length)
        );
      }
    }
  };
  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, visibleCount);
  }, [filteredCards, visibleCount]);

  const totalAtk = selectedCards.reduce((sum, card) => sum + card.atk, 0);
  const totalHp = selectedCards.reduce((sum, card) => sum + card.hp, 0);

  const totalPower = totalAtk + totalHp;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col"
    >
      {/* Stats Header */}
      <div className="px-4 py-2 flex justify-between items-center bg-white/50 backdrop-blur-sm mx-4 rounded-lg mt-2 shadow-sm">
        <div className="flex gap-4 text-sm font-bold text-[#2D3748]">
          <span>
            TOTAL POWER: <span className="text-red-600">{totalPower}</span>
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
          const borderColor = getRarityBorderColor(card?.rarity || "common");
          return (
            <div
              key={index}
              className="w-24 h-36 rounded-lg border-2 border-dashed border-[#C5A059] bg-[#FAF3E5] flex items-center justify-center relative overflow-hidden shadow-inner cursor-pointer"
              onClick={() => card && toggleCardSelection(card)}
            >
              {card ? (
                <motion.div
                  layoutId={`card-${card.id}`}
                  className="w-full h-full relative"
                >
                  <div className="absolute inset-0 z-0 opacity-80 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 flex items-center justify-center">
                    <div className="relative w-full h-full scale-[1.1] opacity-60">
                      <Image
                        src={getStrokeImage(card.rarity)}
                        alt="brush stroke"
                        fill
                        className="object-contain no-global-filter"
                        sizes="(max-width: 768px) 50vw, 300px"
                      />
                    </div>
                  </div>

                  {/* Card Image */}
                  <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      sizes="(max-width: 768px) 33vw, 200px"
                      loading="lazy"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute justify-between top-0 left-0 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-20 border-r border-b border-white/10">
                    Lv.{card.level}
                  </div>
                  <div className="flex justify-between z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F5EEDF] via-[#F5EEDF] to-[#F5EEDF]/80 p-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 relative drop-shadow-sm">
                        <Image
                          src="/assets/icons/ATK.webp"
                          alt="ATK"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-[#1a2e2e] font-semibold text-md">
                        {card.atk}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 relative drop-shadow-sm">
                        <Image
                          src="/assets/icons/HP.webp"
                          alt="HP"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-[#1a2e2e] font-semibold text-md">
                        {card.hp}
                      </span>
                    </div>
                  </div>
                  <div
                    className="absolute inset-0 z-30 pointer-events-none rounded-lg"
                    style={{ boxShadow: `inset 0 0 0 4px ${borderColor}` }}
                  />
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

      <div
        className="flex-1 container mx-auto max-w-7xl px-2 pt-2 pb-32 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        onScroll={handleScroll}
      >
        <div className="grid grid-cols-3 gap-3 p-4 pb-24 min-h-[400px] max-h-[510px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {visibleCards.map((card, index) => {
            const isSelected = selectedCards.find((c) => c.id === card.id);
            const borderColor = getRarityBorderColor(card.rarity);
            return (
              <motion.div
                key={`${card.id}-${index}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCardSelection(card, "list")}
                className={`aspect-[2/3] rounded-lg relative cursor-pointer transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? "ring-4 ring-[#422462] opacity-50 grayscale"
                    : "shadow-md hover:shadow-lg"
                }`}
              >
                <div className="absolute inset-0 z-0 opacity-80 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 flex items-center justify-center">
                  <div className="relative w-full h-full scale-[1.1] opacity-60">
                    <Image
                      src={getStrokeImage(card.rarity)}
                      alt="brush stroke"
                      fill
                      className="object-contain no-global-filter"
                      sizes="(max-width: 768px) 50vw, 300px"
                    />
                  </div>
                </div>

                {/* Card Image */}
                <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 200px"
                    loading="lazy"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute justify-between top-0 left-0 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-20 border-r border-b border-white/10">
                  Lv.{card.level}
                </div>
                <div className="flex justify-between z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F5EEDF] via-[#F5EEDF] to-[#F5EEDF]/80 p-2">
                  <div className="flex items-center">
                    <div className="w-5 h-5 relative drop-shadow-sm">
                      <Image
                        src="/assets/icons/ATK.webp"
                        alt="ATK"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[#1a2e2e] font-bold text-lg">
                      {card.atk}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 relative drop-shadow-sm">
                      <Image
                        src="/assets/icons/HP.webp"
                        alt="HP"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[#1a2e2e] font-bold text-lg">
                      {card.hp}
                    </span>
                  </div>
                </div>
                <div
                  className="absolute inset-0 z-30 pointer-events-none rounded-lg"
                  style={{ boxShadow: `inset 0 0 0 4px ${borderColor}` }}
                />
              </motion.div>
            );
          })}
        </div>
        {visibleCount < filteredCards.length && (
          <div className="w-full py-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Confirm Button */}
      <div className="absolute bottom-24 left-0 right-0 px-6 flex justify-center z-20">
        <motion.button
          disabled={selectedCards.length !== 3}
          whileTap={{ scale: 0.95 }}
          onClick={() => onConfirm(selectedCards)}
          className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
            selectedCards.length === 3
              ? "bg-[#3A4E48] text-white shadow-lg hover:bg-[#2a3b3b]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          READY
        </motion.button>
      </div>
    </motion.div>
  );
}
