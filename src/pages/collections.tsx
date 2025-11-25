import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Card } from "@/types/game";
import CollectionGrid from "@/components/features/collection/CollectionGrid";
import CardDetailModal from "@/components/features/collection/CardDetailModal";
import Link from "next/link";

export default function CollectionsPage() {
  const { inventory } = useSelector((state: RootState) => state.player);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Group inventory by ID and count duplicates
  const collectionData = useMemo(() => {
    const counts = new Map<string, number>();
    const uniqueCards = new Map<string, Card>();

    inventory.forEach((card) => {
      const currentCount = counts.get(card.id) || 0;
      counts.set(card.id, currentCount + 1);
      if (!uniqueCards.has(card.id)) {
        uniqueCards.set(card.id, card);
      }
    });

    return Array.from(uniqueCards.values()).map((card) => ({
      card,
      count: counts.get(card.id) || 0,
    }));
  }, [inventory]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold tracking-wide">
          COLLECTION
        </h1>
        <Link
          href="/"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold transition-colors"
        >
          BACK
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl">
        <CollectionGrid cards={collectionData} onCardClick={setSelectedCard} />
      </div>

      {/* Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          count={
            collectionData.find((c) => c.card.id === selectedCard.id)?.count
          }
        />
      )}
    </div>
  );
}
