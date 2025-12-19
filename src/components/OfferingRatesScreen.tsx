import { useState, useEffect } from "react";
import Image from "next/image";
import cardsData from "@/config/cards.json";
import summonsData from "@/config/summons.json";
import { Card } from "@/types/game";
import { AppState } from "@/hooks/useGameState";
import BackButtonTopBar from "./common/BackButtonTopBar";
import { motion, AnimatePresence } from "framer-motion";
import CardInfoModal from "./features/collection/CardInfoModal";

type Rarity = "Rare" | "Uncommon" | "Common";

interface RarityGroup {
  rarity: Rarity;
  percentage: number | string;
  stars: number;
  colorClass: string;
  units: Card[];
}

interface RaritySectionProps {
  group: RarityGroup;
  isOpen: boolean;
  toggle: () => void;
  onCardClick: (card: Card) => void;
}

interface OfferingRatesScreenProps {
  onNavigate: (screen: AppState) => void;
}

// Pre-calculate rates outside component
const calculateRarityGroups = (): RarityGroup[] => {
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

  const rarityConfig: Record<
    string,
    { stars: number; colorClass: string; rarity: Rarity }
  > = {
    RARE: { stars: 3, colorClass: "text-[#5B7C99]", rarity: "Rare" },
    UNCOMMON: { stars: 2, colorClass: "text-[#6A9A6A]", rarity: "Uncommon" },
    COMMON: { stars: 1, colorClass: "text-[#A8A29E]", rarity: "Common" },
  };

  const groups: RarityGroup[] = [];
  const rarities = ["RARE", "UNCOMMON", "COMMON"];

  rarities.forEach((key) => {
    const config = rarityConfig[key];
    const rarityRate = rates[key] || 0;
    const cardsInRarity = cardsByRarity[key] || [];

    if (cardsInRarity.length > 0) {
      groups.push({
        rarity: config.rarity,
        percentage: (rarityRate * 100).toFixed(2),
        stars: config.stars,
        colorClass: config.colorClass,
        units: cardsInRarity,
      });
    }
  });

  return groups;
};

const STATIC_RARITY_GROUPS = calculateRarityGroups();

export default function OfferingRatesScreen({
  onNavigate,
}: OfferingRatesScreenProps) {
  const rarityGroups = STATIC_RARITY_GROUPS;
  // Default open the first group (usually Rare)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Rare: true,
    Uncommon: false,
    Common: false,
  });
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const toggleSection = (rarity: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [rarity]: !prev[rarity],
    }));
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      {/* Header */}
      <BackButtonTopBar onBack={() => onNavigate("gacha")} />

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-col gap-4 pb-8">
          {rarityGroups.map((group) => (
            <RaritySection
              key={group.rarity}
              group={group}
              isOpen={openSections[group.rarity]}
              toggle={() => toggleSection(group.rarity)}
              onCardClick={setSelectedCard}
            />
          ))}
        </div>
      </div>

      {/* Card Info Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardInfoModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Component for Rarity Sections ---
function RaritySection({
  group,
  isOpen,
  toggle,
  onCardClick,
}: RaritySectionProps) {
  const { rarity, percentage, stars, colorClass, units } = group;

  return (
    <div className="border border-[#5D4037]/50 rounded-lg overflow-hidden">
      {/* Header / Accordion Trigger */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#FDF6E3]"
      >
        <div
          className={`flex items-center gap-2 font-black uppercase text-sm tracking-wide ${colorClass}`}
        >
          {/* <span
            className="text-yellow-400 drop-shadow-sm text-lg leading-none"
            style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}
          >
            {stars}★
          </span> */}
          <span className="drop-shadow-sm">{rarity} Summon</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#FDB931] font-bold text-md  px-2 py-0.5">
            {percentage}%
          </span>
          <div className="text-gray-400">
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 15.75l7.5-7.5 7.5 7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Content Grid */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="bg-[#FDF6E3]/60 p-2">
            {units.length > 0 ? (
              <div className="grid grid-cols-5 min-[400px]:grid-cols-6 gap-2">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => onCardClick(unit)}
                    className="aspect-3/4 relative rounded bg-[#3E2723]/20 group cursor-pointer overflow-hidden hover:border-cyan-400/50 transition-colors will-change-transform"
                  >
                    {/* Card Image */}
                    <Image
                      src={unit.image}
                      alt={unit.name}
                      fill
                      sizes="(max-width: 768px) 20vw, 15vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-300 scale-90 group-hover:scale-110"
                    />

                    {/* Glossy Overlay/Border effect */}
                    <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] pointer-events-none rounded"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                  </div>
                ))}

                {/* Filler slots to make the grid look full if needed */}
                {Array.from({ length: Math.max(0, 12 - units.length) }).map(
                  (_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-3/4 bg-[#3E2723]/20 rounded border border-[#FDF6E3]/10 inner-shadow"
                    ></div>
                  )
                )}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-gray-500">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-50">
                  No units in this pool
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
