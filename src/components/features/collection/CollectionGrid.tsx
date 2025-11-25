import { Card } from "@/types/game";
import CollectionCard from "./CollectionCard";

interface CollectionGridProps {
  cards: { card: Card; count: number }[];
  onCardClick: (card: Card) => void;
}

export default function CollectionGrid({
  cards,
  onCardClick,
}: CollectionGridProps) {
  if (cards.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-white/40">
        <p className="text-lg">No cards collected yet.</p>
        <p className="text-sm">Summon some cards to build your collection!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 pb-24">
      {cards.map(({ card, count }) => (
        <CollectionCard
          key={card.id}
          card={card}
          count={count}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
