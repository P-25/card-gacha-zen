"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import cardsData from "@/config/cards.json";
import summonsData from "@/config/summons.json";
import { Card } from "@/types/game";

interface OfferingRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RateItem {
  card: Card;
  rate: string;
}

// Pre-calculate rates outside component
const calculateRates = () => {
  const banner = summonsData.find((s) => s.id === "banner_rate_up");
  if (!banner) return [];

  const rates = banner.rates as Record<string, number>;

  // Group cards by rarity
  const cardsByRarity: Record<string, Card[]> = {};
  (cardsData as unknown as Card[]).forEach((card) => {
    if (!cardsByRarity[card.rarity]) {
      cardsByRarity[card.rarity] = [];
    }
    cardsByRarity[card.rarity].push(card);
  });

  const calculatedRates: RateItem[] = [];
  const rarities = ["RARE", "UNCOMMON", "COMMON"];

  rarities.forEach((rarity) => {
    const rarityRate = rates[rarity] || 0;
    const cardsInRarity = cardsByRarity[rarity] || [];
    const count = cardsInRarity.length;

    if (count > 0) {
      const individualRate = (rarityRate / count) * 100;
      const formattedRate = individualRate.toFixed(3) + "%";

      cardsInRarity.forEach((card) => {
        calculatedRates.push({
          card,
          rate: formattedRate,
        });
      });
    }
  });

  return calculatedRates;
};

const STATIC_RATES_LIST = calculateRates();

export default function OfferingRateModal({
  isOpen,
  onClose,
}: OfferingRateModalProps) {
  // Use pre-calculated list
  const ratesList = STATIC_RATES_LIST;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      />

      {/* Modal Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[101] bg-[#F0F4F8] rounded-t-3xl overflow-hidden h-[80vh] flex flex-col shadow-2xl"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
      >
        {/* Handle Bar */}
        <div
          className="w-full flex justify-center pt-3 pb-1 cursor-pointer"
          onClick={onClose}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-[#F0F4F8] z-10">
          <h2 className="text-2xl font-bold text-center text-[#2D3748]">
            Offering Rates
          </h2>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col gap-2">
            {ratesList.map((item) => (
              <div
                key={item.card.id}
                className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  {/* Card Thumbnail */}
                  <div className="relative w-12 h-16 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={item.card.image}
                      alt={item.card.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[#4A5568] font-medium text-lg">
                    {item.card.name}
                  </span>
                </div>
                <span className="text-[#2D3748] font-bold text-lg">
                  {item.rate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Close Button Area */}
        <div className="p-6 bg-[#F0F4F8] border-t border-gray-200 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <button className="px-8 py-2 rounded-full bg-gray-200 text-gray-600 font-medium text-sm">
            Attention
          </button>
        </div>
      </motion.div>
    </>
  );
}
