import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import cardsData from "@/config/cards.json";
import summonsData from "@/config/summons.json";
import { Card } from "@/types/game";

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

export default function OfferingRatesPage() {
  const router = useRouter();
  const ratesList = STATIC_RATES_LIST;
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Deferred rendering for smooth page transition
    const initialTimer = setTimeout(() => {
      setVisibleCount(10);
    }, 150);

    const fullTimer = setTimeout(() => {
      setVisibleCount(ratesList.length);
    }, 500);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(fullTimer);
    };
  }, [ratesList.length]);

  const visibleItems = ratesList.slice(0, visibleCount);

  return (
    <div className="relative w-full h-screen bg-[#1A202C] overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-50">
        <Image
          src="/assets/banners/rate_up_bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-2xl font-bold text-white tracking-wider drop-shadow-md">
          OFFERING RATES
        </h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleCount === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            {visibleItems.map((item) => (
              <div
                key={item.card.id}
                className="flex items-center justify-between p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/10"
              >
                <div className="flex items-center gap-4">
                  {/* Card Thumbnail */}
                  <div className="relative w-12 h-16 rounded-md overflow-hidden border border-gray-300 shadow-sm">
                    <Image
                      src={item.card.image}
                      alt={item.card.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-[#2D3748] font-bold text-lg tracking-wide">
                    {item.card.name}
                  </span>
                </div>
                <span className="text-[#2D3748] font-black text-lg">
                  {item.rate}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
