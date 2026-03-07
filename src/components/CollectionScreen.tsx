/* eslint-disable @typescript-eslint/no-explicit-any */
import CardDetailModal from "@/components/features/collection/CardDetailModal";
import CollectionGrid from "@/components/features/collection/CollectionGrid";
import TopBar from "@/components/features/home/TopBar";
import Background from "@/components/layout/Background";
import { AppState } from "@/hooks/useGameState";
import { RootState } from "@/store/store";
import { Card, Rarity } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSound } from "@/hooks/useSound";

interface CollectionScreenProps {
  onNavigate: (screen: AppState) => void;
}

export default function CollectionScreen({
  onNavigate,
}: CollectionScreenProps) {
  const { inventory } = useSelector((state: RootState) => state.player);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const { playClick } = useSound();

  // Filter States
  const [rarityFilter, setRarityFilter] = useState<Rarity | "ALL">("ALL");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination
  const [visibleCount, setVisibleCount] = useState(24);
  const SCROLL_INCREMENT = 24;

  const filteredCards = useMemo(() => {
    let result = [...inventory];

    // 1. Rarity Filter
    if (rarityFilter !== "ALL") {
      result = result.filter((card) => card.rarity === rarityFilter);
    }

    // 2. Sort (Always by Total Power)
    result.sort((a, b) => {
      const powerA =
        (a.state?.def || 0) + (a.state?.pow || 0) + (a.state?.spd || 0);
      const powerB =
        (b.state?.def || 0) + (b.state?.pow || 0) + (b.state?.spd || 0);

      const comparison = powerA - powerB;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [inventory, rarityFilter, sortDirection]);

  // Reset pagination when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(SCROLL_INCREMENT);
  }, [filteredCards]);

  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, visibleCount);
  }, [filteredCards, visibleCount]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (visibleCount < filteredCards.length) {
        setVisibleCount((prev) =>
          Math.min(prev + SCROLL_INCREMENT, filteredCards.length),
        );
      }
    }
  };

  const handleSortToggle = () => {
    playClick();
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getRarityStyle = (r: string, isActive: boolean) => {
    if (r === "ALL") {
      return isActive
        ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-105"
        : "bg-black/40 text-white/70 border border-white/10 hover:bg-black/60 hover:text-white";
    }
    if (r === "COMMON") {
      return isActive
        ? "bg-gray-400 text-black shadow-[0_0_15px_rgba(156,163,175,0.5)] scale-105"
        : "bg-black/40 text-gray-400 border border-gray-400/30 hover:bg-black/60 hover:border-gray-400/60";
    }
    if (r === "UNCOMMON") {
      return isActive
        ? "bg-green-400 text-black shadow-[0_0_15px_rgba(74,222,128,0.5)] scale-105"
        : "bg-black/40 text-green-400 border border-green-400/30 hover:bg-black/60 hover:border-green-400/60";
    }
    if (r === "RARE") {
      return isActive
        ? "bg-purple-400 text-white shadow-[0_0_15px_rgba(192,132,252,0.5)] scale-105"
        : "bg-black/40 text-purple-400 border border-purple-400/30 hover:bg-black/60 hover:border-purple-400/60";
    }
    return "";
  };

  return (
    <div className="h-dvh bg-[#1a1a1a] text-white flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Background />
      </div>

      {/* Top Bar */}
      <TopBar title="Collections" />

      {/* Header */}
      <div className="relative z-40 px-4 py-3 flex flex-col gap-4">
        <div className="flex sm:flex-row gap-4 items-center justify-center mx-auto w-full">
          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto sm:pb-0 w-[90%]  sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {(["ALL", "RARE", "UNCOMMON", "COMMON"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  playClick();
                  setRarityFilter(r);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  r === rarityFilter
                    ? "bg-gray-800 text-white"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Sort Toggle (TP Only) */}
          <div className="flex gap-2 w-[10%] sm:w-auto justify-end">
            <button
              onClick={handleSortToggle}
              className="h-8 w-8 rounded-lg shadow-lg flex items-center justify-center text-white bg-gray-500 hover:bg-gray-600 transition-colors"
            >
              {sortDirection === "desc" ? (
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
                    d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
                  />
                </svg>
              ) : (
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
                    d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 container mx-auto max-w-7xl px-2 pt-2 pb-32 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        onScroll={handleScroll}
      >
        <CollectionGrid
          cards={visibleCards}
          onCardClick={(c) => {
            playClick();
            setSelectedCard(c);
          }}
          onNavigate={onNavigate}
        />
        {visibleCount < filteredCards.length && (
          <div className="w-full py-4 flex justify-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            count={1} // We don't track count in this view anymore
          />
        )}
      </AnimatePresence>
    </div>
  );
}
