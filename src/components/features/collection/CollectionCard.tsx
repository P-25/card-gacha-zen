import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRarityBorderColor } from "@/lib/rarityStyles";

interface CollectionCardProps {
  card: Card;
  onClick: (card: Card) => void;
}

export default function CollectionCard({ card, onClick }: CollectionCardProps) {
  const borderColor = getRarityBorderColor(card.rarity);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(card)}
      className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group bg-white/30"
      style={{
        border: `4px solid ${borderColor}`,
      }}
    >
      {/* Card Image */}
      <Image
        src={card.image}
        alt={card.name}
        fill
        priority
        className="z-5 object-cover transition-transform duration-300 group-hover:scale-110 no-global-filter"
      />

      {/* Level Badge */}
      <div className="absolute top-0 left-0 bg-[#404040] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-md z-10">
        Lv.{card.level}
      </div>

      {/* Name Overlay (Optional, maybe on hover) */}
      <div className="z-10 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-sm font-bold truncate">{card.name}</p>
      </div>
    </motion.div>
  );
}
