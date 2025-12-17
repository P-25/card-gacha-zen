"use client";

import { useState, useMemo, memo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";

interface SelectCardsPhaseProps {
  initialDeck: Card[];
  onConfirm: (deck: Card[]) => void;
  onBack: () => void;
}

// Memoized Card Item to prevent re-renders
const CardItem = memo(
  ({
    card,
    isSelected,
    onToggle,
  }: {
    card: Card;
    isSelected: boolean;
    onToggle: (card: Card) => void;
  }) => {
    const borderColor = getRarityBorderColor(card.rarity);

    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggle(card)}
        className={`aspect-[2/3] rounded-lg relative cursor-pointer transition-all duration-200 overflow-hidden ${
          isSelected ? "" : "shadow-md hover:shadow-lg"
        }`}
      >
        {isSelected && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <div className="px-4 py-2 bg-black/60 border-2 border-white rounded-lg shadow-xl backdrop-blur-md transform scale-110">
              <span className="text-white font-bold text-sm tracking-widest uppercase drop-shadow-md whitespace-nowrap">
                IN USE
              </span>
            </div>
          </div>
        )}
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
              {card.state.pow}
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
              {card.state.def}
            </span>
          </div>
        </div>
        <div
          className="absolute inset-0 z-30 pointer-events-none rounded-lg"
          style={{ boxShadow: `inset 0 0 0 4px ${borderColor}` }}
        />
      </motion.div>
    );
  }
);

CardItem.displayName = "CardItem";

export default function SelectCardsPhase({
  initialDeck,
  onConfirm,
  onBack,
}: SelectCardsPhaseProps) {
  const { inventory } = useSelector((state: RootState) => state.player);
  // Initialize with 3 slots, filling them with initialDeck or null
  const [selectedCards, setSelectedCards] = useState<(Card | null)[]>(() => {
    const slots = [null, null, null] as (Card | null)[];
    if (initialDeck) {
      initialDeck.forEach((card, i) => {
        if (i < 3) slots[i] = card;
      });
    }
    return slots;
  });

  // Filter States
  const [visibleCount, setVisibleCount] = useState(24);
  const SCROLL_INCREMENT = 24;

  const filteredCards = useMemo(() => {
    const result = [...inventory];

    // 4. Sort
    result.sort((a, b) => {
      const powerA = a.state.def + a.state.pow;
      const powerB = b.state.def + b.state.pow;
      return powerB - powerA;
    });

    return result;
  }, [inventory]);

  const toggleCardSelection = (
    card: Card,
    source: "list" | "slot" = "slot"
  ) => {
    const existingIndex = selectedCards.findIndex((c) => c?.id === card.id);

    if (existingIndex !== -1) {
      // Card is already selected, remove it from its specific slot
      const newSlots = [...selectedCards];
      newSlots[existingIndex] = null;
      setSelectedCards(newSlots);
    } else {
      // Card is not selected, find first empty slot
      const emptyIndex = selectedCards.findIndex((c) => c === null);
      if (emptyIndex !== -1) {
        const newSlots = [...selectedCards];
        newSlots[emptyIndex] = card;
        setSelectedCards(newSlots);
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
  const totalAtk = selectedCards.reduce(
    (sum, card) => sum + (card?.state.pow || 0),
    0
  );
  const totalHp = selectedCards.reduce(
    (sum, card) => sum + (card?.state.def || 0),
    0
  );

  const totalPower = totalAtk + totalHp;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-[#2D3748] tracking-wider uppercase drop-shadow-sm">
          Echo Loadout
        </h1>
        <div className="w-16 h-1 bg-[#C5A059] mx-auto mt-2 rounded-full" />
      </div>

      {/* Selected Slots */}
      <div className="flex justify-center gap-3 py-6 px-4">
        {[0, 1, 2].map((index) => {
          const card = selectedCards[index];
          const borderColor = getRarityBorderColor(card?.rarity || "COMMON");
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
                        {card.state.pow}
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
                        {card.state.def}
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
            const isSelected = !!selectedCards.find((c) => c?.id === card.id);
            return (
              <CardItem
                key={`${card.id}-${index}`}
                card={card}
                isSelected={isSelected}
                onToggle={(c) => toggleCardSelection(c, "list")}
              />
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
      <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center z-20">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const validDeck = selectedCards.filter(
              (c): c is Card => c !== null
            );
            onConfirm(validDeck);
          }}
          className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shrink-0 cursor-pointer bg-[#3A4E48] text-white shadow-lg hover:bg-[#2a3b3b]`}
        >
          DONE
        </motion.button>
      </div>
    </motion.div>
  );
}
