import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";
import React from "react";

interface CollectionCardProps {
  card: Card;
  onClick: (card: Card) => void;
}

const CollectionCard = ({ card, onClick }: CollectionCardProps) => {
  const borderColor = getRarityBorderColor(card.rarity);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(card)}
      className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group bg-white/80"
      style={{
        boxShadow: `inset 0 0 0 4px ${borderColor}`,
      }}
    >
      {/* Brush Stroke Background */}
      <div className="absolute inset-0 z-0 opacity-80 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125 flex items-center justify-center">
        <div className="relative w-full h-full scale-[1.1] opacity-60">
          <Image
            src={getStrokeImage(card.rarity)}
            alt="brush stroke"
            fill
            className="object-contain no-global-filter"
            sizes="(max-width: 768px) 50vw, 300px"
          />
        </div>
      </div>

      {/* Card Image */}
      <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
        <Image
          src={card.image}
          alt={card.name}
          fill
          sizes="(max-width: 768px) 33vw, 200px"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Level Badge */}
      <div className="absolute top-0 left-0 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-20 border-r border-b border-white/10">
        Lv.{card.level}
      </div>

      {/* Name Overlay */}
      <div className="z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-xs font-bold truncate text-center">
          {card.name}
        </p>
      </div>
    </motion.div>
  );
};

export default React.memo(CollectionCard);
