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

  const totalPower = card.state.pow + card.state.def + card.state.spd;
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

      <div className="flex justify-between z-20 absolute bottom-1 left-0 right-0 bg-gradient-to-r from-[#F5EEDF] to-transparent p-1">
        <div className="flex items-center">
          <span
            className="font-black text-white text-xl z-10 relative tracking-widest pl-1"
            style={{
              WebkitTextStroke: "5px black",
              paintOrder: "stroke fill",
            }}
          >
            {totalPower}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(CollectionCard);
