"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card } from "@/types/game";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";

interface DeckSelectionScreenProps {
  deck: Card[];
  onEditDeck: () => void;
  onStartBattle: () => void;
  onAutoForm: () => void;
  onBack: () => void;
}

export default function DeckSelectionScreen({
  deck,
  onEditDeck,
  onStartBattle,
  onAutoForm,
  onBack,
}: DeckSelectionScreenProps) {
  const isReady = deck.length === 3;

  const totalAtk = deck.reduce((sum, card) => sum + card.atk, 0);
  const totalHp = deck.reduce((sum, card) => sum + card.hp, 0);
  const totalPower = totalAtk + totalHp;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col relative pt-8"
    >
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#2D3748] tracking-wider uppercase drop-shadow-sm">
          Form Team
        </h1>
        <div className="w-16 h-1 bg-[#C5A059] mx-auto mt-2 rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start gap-8 pb-20">
        {/* Stats Summary */}
        <div className="flex gap-8 text-[#2D3748] bg-white/50 backdrop-blur-md px-6 py-3 rounded-xl shadow-sm border border-white/20">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#4A5568] uppercase tracking-wider">
              Total Power
            </span>
            <span className="text-2xl font-bold text-[#2D3748]">
              {totalPower}
            </span>
          </div>
          <div className="w-px bg-gray-300/50"></div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#4A5568] uppercase tracking-wider">
              Cards
            </span>
            <span
              className={`text-2xl font-bold ${
                isReady ? "text-green-600" : "text-orange-500"
              }`}
            >
              {deck.length}/3
            </span>
          </div>
        </div>

        {/* Deck Slots */}
        <div className="flex justify-center gap-4 px-4 w-full max-w-2xl">
          {[0, 1, 2].map((index) => {
            const card = deck[index];
            const borderColor = getRarityBorderColor(card?.rarity || "common");

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEditDeck}
                className="w-28 h-40 md:w-36 md:h-52 rounded-xl border-2 border-dashed border-[#C5A059] bg-[#FAF3E5] flex items-center justify-center relative overflow-hidden shadow-md cursor-pointer group"
              >
                {card ? (
                  <div className="w-full h-full relative">
                    {/* Background Effect */}
                    <div className="absolute inset-0 z-0 opacity-80 flex items-center justify-center">
                      <div className="relative w-full h-full scale-[1.2] opacity-60">
                        <Image
                          src={getStrokeImage(card.rarity)}
                          alt="brush stroke"
                          fill
                          className="object-contain no-global-filter"
                        />
                      </div>
                    </div>

                    {/* Card Image */}
                    <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Level Badge */}
                    <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-20 border-r border-b border-white/10">
                      Lv.{card.level}
                    </div>

                    {/* Stats Footer */}
                    <div className="flex justify-between z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F5EEDF] via-[#F5EEDF] to-[#F5EEDF]/80 p-1.5">
                      <div className="flex items-center gap-0.5">
                        <div className="w-3.5 h-3.5 relative">
                          <Image
                            src="/assets/icons/ATK.webp"
                            alt="ATK"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-[#1a2e2e] font-bold text-xs">
                          {card.atk}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <div className="w-3.5 h-3.5 relative">
                          <Image
                            src="/assets/icons/HP.webp"
                            alt="HP"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-[#1a2e2e] font-bold text-xs">
                          {card.hp}
                        </span>
                      </div>
                    </div>

                    {/* Rarity Border */}
                    <div
                      className="absolute inset-0 z-30 pointer-events-none rounded-xl"
                      style={{ boxShadow: `inset 0 0 0 4px ${borderColor}` }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-50 group-hover:opacity-80 transition-opacity">
                    <span className="text-2xl">➕</span>
                    <span className="text-[#C5A059] text-xs font-bold uppercase tracking-widest">
                      Add Card
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="text-[#4A5568] text-sm font-medium animate-pulse">
          Tap any slot to edit your deck
        </p>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-24 left-0 right-0 px-6 flex justify-center gap-4 z-20">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAutoForm}
          className="flex-1 max-w-[160px] py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg bg-[#4A5568] text-white hover:bg-[#2D3748]"
        >
          Auto-form
        </motion.button>

        <motion.button
          disabled={!isReady}
          whileTap={{ scale: 0.95 }}
          onClick={onStartBattle}
          className={`flex-1 max-w-[160px] py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
            isReady
              ? "bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-white hover:brightness-110"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>Enter</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
