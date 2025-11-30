/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Card, Rarity } from "@/types/game";
import CollectionGrid from "@/components/features/collection/CollectionGrid";
import CardDetailModal from "@/components/features/collection/CardDetailModal";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Background from "@/components/layout/Background";
import TopBar from "@/components/features/home/TopBar";

export default function CollectionsPage() {
  const { inventory } = useSelector((state: RootState) => state.player);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [rarityFilter, setRarityFilter] = useState<Rarity | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<string | "ALL">("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Derived Data
  const filteredCards = useMemo(() => {
    let result = [...inventory];

    // 1. Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((card) => card.name.toLowerCase().includes(query));
    }

    // 2. Rarity Filter
    if (rarityFilter !== "ALL") {
      result = result.filter((card) => card.rarity === rarityFilter);
    }

    // 3. Design Type Filter
    if (typeFilter !== "ALL") {
      result = result.filter((card) => card.design_type === typeFilter);
    }

    // 4. Sort
    result.sort((a, b) => {
      if (sortOrder === "desc") {
        return b.level - a.level;
      } else {
        return a.level - b.level;
      }
    });

    return result;
  }, [inventory, searchQuery, rarityFilter, typeFilter, sortOrder]);

  return (
    <div className="h-dvh bg-[#1a1a1a] text-white flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Background />
      </div>

      {/* Top Bar */}
      <TopBar />

      {/* Header */}
      <div className="relative z-40 px-4 py-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {/* Spacer to center the title */}
          <div className="w-12" />
          <h1 className="text-xl font-display font-bold tracking-widest text-white/90 drop-shadow-md">
            COLLECTION
          </h1>
          <Link
            href="/"
            className="text-xs font-bold text-white/60 hover:text-white transition-colors w-12 text-right"
          >
            CLOSE
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative w-full max-w-md mx-auto flex gap-2">
          <div className="flex-1 relative flex items-center bg-white rounded-lg overflow-hidden shadow-lg h-10">
            <div className="pl-3 text-gray-400">
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="FILTER"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-3 text-gray-800 font-bold placeholder-gray-400 text-sm uppercase"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 hover:bg-gray-100 transition-colors ${
                showFilters ? "text-blue-500" : "text-gray-500"
              }`}
            >
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
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                />
              </svg>
            </button>
          </div>

          {/* Sort Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="h-10 w-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {sortOrder === "desc" ? (
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

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#1a1a1a]/90 backdrop-blur-md rounded-lg border border-white/10 mx-auto w-full max-w-md"
            >
              <div className="p-3 space-y-3">
                {/* Rarity Filter */}
                <div>
                  <p className="text-xs text-white/50 mb-1 font-bold">RARITY</p>
                  <div className="flex gap-2 flex-wrap">
                    {["ALL", "COMMON", "UNCOMMON", "RARE", "LEGENDARY"].map(
                      (r) => (
                        <button
                          key={r}
                          onClick={() => setRarityFilter(r as any)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                            rarityFilter === r
                              ? "bg-white text-black"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          {r}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <p className="text-xs text-white/50 mb-1 font-bold">TYPE</p>
                  <div className="flex gap-2 flex-wrap">
                    {["ALL", "Landbound", "Hero", "Eternal"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          typeFilter === t
                            ? "bg-white text-black"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto max-w-7xl px-2 pt-4 relative z-10 overflow-y-auto">
        <CollectionGrid cards={filteredCards} onCardClick={setSelectedCard} />
      </div>

      {/* Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          count={1} // We don't track count in this view anymore
        />
      )}
    </div>
  );
}
