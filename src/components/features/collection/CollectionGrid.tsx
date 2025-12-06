import { Card } from "@/types/game";
import CollectionCard from "./CollectionCard";
import Link from "next/link";
import { motion } from "framer-motion";
import MenuButton from "../home/MenuButton";
import { AppState, useGameState } from "@/hooks/useGameState";

interface CollectionGridProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  onNavigate: (screen: AppState) => void;
}

export default function CollectionGrid({
  cards,
  onCardClick,
  onNavigate,
}: CollectionGridProps) {
  const SummonButton = {
    id: "summon",
    label: "SUMMON",
    subtitle: "(Draw Cards)",
    icon: "/assets/icons/tornado.png",
    onClick: () => onNavigate("gacha"),
  };
  if (cards.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-gray-800 gap-4">
        <p className="text-lg font-display text-center px-4">
          Your collection is empty! The stars await your summons.
        </p>
        <motion.div
          key={SummonButton.id}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
          className={`flex flex-col items-center gap-2 z-10`}
        >
          <MenuButton
            title={SummonButton.label}
            subtitle={SummonButton.subtitle}
            iconSrc={SummonButton.icon}
            onClick={SummonButton.onClick}
          />
        </motion.div>
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
