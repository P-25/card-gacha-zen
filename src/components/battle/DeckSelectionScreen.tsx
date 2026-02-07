"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Card } from "@/types/game";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";
import { getBattleModeById } from "@/config/battleModes";
import { useState } from "react";
import { generateOpponentDeck } from "@/lib/battleUtils";

interface DeckSelectionScreenProps {
  deck: Card[];
  onEditDeck: () => void;
  onStartBattle: () => void;
  onAutoForm: () => void;
  onBack: () => void;
  selectedBattleModeId?: string | null;
}

export default function DeckSelectionScreen({
  deck,
  onEditDeck,
  onStartBattle,
  onAutoForm,
  onBack,
  selectedBattleModeId,
}: DeckSelectionScreenProps) {
  console.log(
    "DeckSelectionScreen render - selectedBattleModeId:",
    selectedBattleModeId,
  );
  const [showPowerWarning, setShowPowerWarning] = useState(false);
  const isReady = deck.length === 3;

  const handleDebugOpponentDeck = () => {
    const opponentDeck = generateOpponentDeck(deck, selectedBattleModeId);
    console.log("--- DEBUG: GENERATED OPPONENT DECK ---");
    console.log("Battle Mode:", selectedBattleModeId || "Wild/Default");
    console.table(
      opponentDeck.map((c) => ({
        Name: c.name,
        Rarity: c.rarity,
        Level: c.level,
        POW: c.state.pow,
        DEF: c.state.def,
        SPD: c.state.spd,
      })),
    );
    console.log("Full Deck Object:", opponentDeck);
    console.log("--------------------------------------");
  };

  const totalPOW = deck.length
    ? deck.reduce((sum, card) => sum + (card?.state?.pow || 0), 0)
    : 0;
  const totalSPD = deck.length
    ? deck.reduce((sum, card) => sum + (card?.state?.spd || 0), 0)
    : 0;
  const totalDEF = deck.length
    ? deck.reduce((sum, card) => sum + (card?.state?.def || 0), 0)
    : 0;
  const totalPower = totalPOW + totalSPD + totalDEF;

  const battleMode = selectedBattleModeId
    ? getBattleModeById(selectedBattleModeId)
    : null;

  const requiredPower = battleMode?.requiredPower || 0;
  const isPowerSufficient = totalPower >= requiredPower;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col relative pt-8 pb-24"
    >
      <div>
        {/* Title */}
        <div className="relative text-center mb-10 px-4">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-white/40 flex items-center justify-center text-gray-700 hover:bg-white hover:scale-105 active:scale-95 transition-all z-50"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-3xl font-bold text-[#2D3748] tracking-wider uppercase drop-shadow-sm">
            Form Team
          </h1>
          <div className="w-16 h-1 bg-[#C5A059] mx-auto mt-2 rounded-full" />
        </div>

        {/* DEBUG BUTTON */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleDebugOpponentDeck}
            className="text-xl bg-red-500/20 hover:bg-red-500 text-white p-2 rounded-full border border-red-300/30 transition-colors"
            title="Debug: Log Opponent Deck to Console"
          >
            🐞
          </button>
        </div>

        <div className="flex flex-col items-center">
          {battleMode && (
            <>
              <h2 className="text-2xl font-bold text-[#2D3748] tracking-wider uppercase drop-shadow-sm">
                {battleMode.title}
              </h2>
              {requiredPower && (
                <p className="text-xs text-[#4A5568] font-bold mt-1 uppercase tracking-widest opacity-80">
                  Total Power Requirement: {requiredPower}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-start gap-8 py-20">
        {/* Stats Summary */}
        <div className="flex gap-8 text-[#2D3748] bg-white/50 backdrop-blur-md px-6 py-3 rounded-xl shadow-sm border border-white/20">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-[#4A5568] uppercase tracking-wider">
              Total Power
            </span>
            <span
              className={`text-2xl font-bold ${
                !isPowerSufficient ? "text-red-500" : "text-[#2D3748]"
              }`}
            >
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
                className={`w-1/3 aspect-2/3 md:w-36 md:h-52 rounded-xl bg-[#FAF3E5] flex items-center justify-center relative overflow-hidden shadow-md cursor-pointer group ${
                  !card ? "border-2 border-dashed border-[#C5A059]" : ""
                }`}
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
                    <div className="absolute inset-1 z-10 rounded-lg overflow-hidden scale-[0.9]">
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
                    <div className="flex justify-between z-20 absolute bottom-0 left-0 right-0 bg-linear-to-t from-[#F5EEDF] via-[#F5EEDF] to-[#F5EEDF]/80 px-1 pb-2 pt-1 divide-x divide-gray-400">
                      <div className="w-full flex flex-col items-center justify-center text-sm max-[400px]:text-xs">
                        <span>POW</span>
                        <span>{card.state.pow}</span>
                      </div>
                      <div className="w-full flex flex-col items-center justify-center text-sm max-[400px]:text-xs">
                        <span>SPD</span>
                        <span>{card.state.spd}</span>
                      </div>
                      <div className="w-full flex flex-col items-center justify-center text-sm max-[400px]:text-xs">
                        <span>DEF</span>
                        <span>{card.state.def}</span>
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
      <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center gap-4 z-20">
        {/* Share Button (Ghost) */}
        <button
          onClick={onAutoForm}
          className="flex-1 bg-transparent text-gray-500 font-bold text-lg py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all uppercase tracking-wider max-[400px]:text-xs"
        >
          Auto-form
        </button>

        {/* Claim/Next Button (Primary) */}
        <button
          disabled={!isReady}
          onClick={() => {
            if (isPowerSufficient) {
              onStartBattle();
            } else {
              setShowPowerWarning(true);
            }
          }}
          className="flex-2 bg-[#3E206D] text-[#FDB931] font-bold text-xl py-3 rounded-xl border-4 border-[#C5A059] shadow-lg active:scale-95 transition-transform uppercase tracking-widest relative overflow-hidden group cursor-pointer hover:brightness-110"
        >
          <span className="relative z-10">Enter</span>
          {/* Sheen */}
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        </button>
      </div>

      {/* Power Warning Popup */}
      <AnimatePresence>
        {showPowerWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm m-4 shadow-2xl border-4 border-[#C5A059] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-red-500 via-orange-500 to-yellow-500" />

              <h3 className="text-xl font-black text-[#2D3748] uppercase tracking-wide mb-2 text-center mt-2 flex items-center justify-center gap-2">
                <span className="text-2xl">⚠️</span> Insufficient Power
              </h3>

              <p className="text-[#4A5568] text-sm font-medium text-center mb-6 leading-relaxed px-2">
                Your team power is slightly lower than recommended. The battle
                might be tougher than usual!
              </p>

              <div className="bg-[#FAF3E5] p-4 rounded-xl mb-6 flex flex-col gap-3 border border-[#E2E8F0]">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#4A5568] font-bold uppercase text-xs tracking-wider">
                    Required
                  </span>
                  <span className="text-[#2D3748] font-black text-lg">
                    {requiredPower}
                  </span>
                </div>
                <div className="h-px bg-[#C5A059]/30 w-full" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#4A5568] font-bold uppercase text-xs tracking-wider">
                    Your Power
                  </span>
                  <span className="text-red-500 font-black text-lg">
                    {totalPower}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPowerWarning(false)}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-500 font-bold uppercase tracking-wider text-xs hover:bg-gray-50 hover:text-gray-700 transition-colors active:scale-95"
                >
                  Retreat
                </button>
                <button
                  onClick={() => {
                    setShowPowerWarning(false);
                    onStartBattle();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-linear-to-r from-red-600 to-red-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 border border-red-400"
                >
                  Fight
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
