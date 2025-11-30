import { Card } from "@/types/game";
import CollectionCard from "./CollectionCard";
import Link from "next/link";

interface CollectionGridProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
}

export default function CollectionGrid({
  cards,
  onCardClick,
}: CollectionGridProps) {
  if (cards.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-white/60 gap-4">
        <p className="text-lg font-display text-center px-4">
          Your collection is empty! The stars await your summons.
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
        >
          SUMMON
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 p-4 pb-24">
      {cards.map((card, index) => (
        <CollectionCard
          // Use index in key if duplicates exist, or a unique instance ID if available.
          // Since we want to show duplicates individually, and they might share the same ID from config,
          // we should ideally have unique instance IDs.
          // For now, let's use ID + index to ensure uniqueness in React key.
          key={`${card.id}-${index}`}
          card={card}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
