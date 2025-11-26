import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";

interface CollectionCardProps {
  card: Card;
  count: number;
  onClick: (card: Card) => void;
}

export default function CollectionCard({
  card,
  count,
  onClick,
}: CollectionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(card)}
      className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group"
    >
      {/* Card Image */}
      <Image
        src={card.image}
        alt={card.name}
        fill
        priority
        className="object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* Rarity Border/Glow */}
      <div
        className={`absolute inset-0 border-2 ${
          card.rarity === "LEGENDARY"
            ? "border-purple-500/50"
            : card.rarity === "RARE"
            ? "border-blue-500/50"
            : "border-transparent"
        } rounded-xl pointer-events-none`}
      />

      {/* Quantity Badge */}
      {count > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-full border border-white/20 shadow-sm z-10">
          x{count}
        </div>
      )}

      {/* Name Overlay (Optional, maybe on hover) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-sm font-bold truncate">{card.name}</p>
      </div>
    </motion.div>
  );
}
