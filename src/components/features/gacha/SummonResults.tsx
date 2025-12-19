import BackButtonTopBar from "@/components/common/BackButtonTopBar";
import CardDetailModal from "@/components/features/collection/CardDetailModal";
import CollectionCard from "@/components/features/collection/CollectionCard";
import { Card, Resource } from "@/types/game";
import Image from "next/image";
import { useState } from "react";
import RateUpHighlight from "@/components/effects/RateUpHighlight";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";

import { AnimatePresence, motion } from "framer-motion";
import CardInfoModal from "../collection/CardInfoModal";

interface SummonResultsProps {
  results: (Card | Resource)[];
  onBack: () => void;
}

export default function SummonResults({ results, onBack }: SummonResultsProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const row1 = results.slice(0, 3);
  const row2 = results.slice(3, 7);
  const row3 = results.slice(7, 10);

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {/* Grid */}
      <div className="p-4 w-full flex flex-col justify-center items-center gap-6">
        <>
          {/* Row 1: 3 Cards */}
          <div className="flex justify-center gap-4 md:gap-6 w-full">
            {row1.map((item, index) => {
              if (item.type === "CARD") {
                return (
                  <div
                    key={`${(item as Card).instanceId || index}`}
                    className="relative w-1/4"
                  >
                    {(item as Card).rarity === "RARE" && (
                      <div className="absolute inset-0 z-0">
                        <RateUpHighlight />
                      </div>
                    )}
                    <SingleCardForResult
                      key={`${(item as Card).instanceId || index}`}
                      card={item as Card}
                      onClick={(c) => setSelectedCard(c)}
                    />
                  </div>
                );
              } else {
                // Resource display
                const res = item as Resource;
                return (
                  <div
                    key={res.id}
                    className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group bg-white/80 w-1/4"
                    style={{
                      boxShadow: `inset 0 0 0 4px #C5A059`,
                    }}
                  >
                    {/* Card Image */}
                    <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                      <Image
                        src={res.image}
                        alt={res.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 200px"
                        loading="lazy"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Name Overlay */}
                    <div className="z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6 ">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-6 h-6 relative max-[400px]:w-5 max-[400px]:h-5">
                          <Image
                            src="/assets/icons/gold-coin.webp"
                            alt="Diamond"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-[#C5A059] font-medium text-lg max-[400px]:text-sm">
                          x{res.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* Row 2: 4 Cards */}
          <div className="flex justify-center gap-1 md:gap-2 w-full">
            {row2.map((item, index) => {
              if (item.type === "CARD") {
                return (
                  <div
                    key={`${(item as Card).instanceId || index}`}
                    className="relative w-1/4"
                  >
                    {(item as Card).rarity === "RARE" && (
                      <div className="absolute inset-0 z-0">
                        <RateUpHighlight />
                      </div>
                    )}
                    <SingleCardForResult
                      key={`${(item as Card).instanceId || index}`}
                      card={item as Card}
                      onClick={(c) => setSelectedCard(c)}
                    />
                  </div>
                );
              } else {
                // Resource display
                const res = item as Resource;
                return (
                  <div
                    key={res.id}
                    className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group bg-white/80 w-1/4"
                    style={{
                      boxShadow: `inset 0 0 0 4px #C5A059`,
                    }}
                  >
                    {/* Card Image */}
                    <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                      <Image
                        src={res.image}
                        alt={res.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 200px"
                        loading="lazy"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Name Overlay */}
                    <div className="z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6 ">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-6 h-6 relative max-[400px]:w-5 max-[400px]:h-5">
                          <Image
                            src="/assets/icons/gold-coin.webp"
                            alt="Diamond"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-[#C5A059] font-medium text-lg max-[400px]:text-sm">
                          x{res.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>

          {/* Row 3: 3 Cards */}
          <div className="flex justify-center gap-4 md:gap-6 w-full">
            {row3.map((item, index) => {
              if (item.type === "CARD") {
                return (
                  <div
                    key={`${(item as Card).instanceId || index}`}
                    className="relative w-1/4"
                  >
                    {(item as Card).rarity === "RARE" && (
                      <div className="absolute inset-0 z-0">
                        <RateUpHighlight />
                      </div>
                    )}
                    <SingleCardForResult
                      key={`${(item as Card).instanceId || index}`}
                      card={item as Card}
                      onClick={(c) => setSelectedCard(c)}
                    />
                  </div>
                );
              } else {
                // Resource display
                const res = item as Resource;
                return (
                  <div
                    key={res.id}
                    className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group bg-white/80 w-1/4"
                    style={{
                      boxShadow: `inset 0 0 0 4px #C5A059`,
                    }}
                  >
                    {/* Card Image */}
                    <div className="absolute inset-1 z-10 rounded-lg overflow-hidden">
                      <Image
                        src={res.image}
                        alt={res.name}
                        fill
                        sizes="(max-width: 768px) 33vw, 200px"
                        loading="lazy"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Name Overlay */}
                    <div className="z-20 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 pt-6 ">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-6 h-6 relative max-[400px]:w-5 max-[400px]:h-5">
                          <Image
                            src="/assets/icons/gold-coin.webp"
                            alt="Diamond"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-[#C5A059] font-medium text-lg max-[400px]:text-sm">
                          x{res.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </>

        <button
          onClick={onBack}
          className="px-4 bg-[#3E206D] text-[#FDB931] font-bold text-xl py-3 rounded-xl border-2 border-[#C5A059] shadow-lg active:scale-95 transition-transform uppercase tracking-widest relative overflow-hidden group cursor-pointer hover:brightness-110"
        >
          <span className="relative z-10">Claim All</span>
          {/* Sheen */}
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        </button>
      </div>

      {/* Modal */}
      {/* Card Info Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardInfoModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const SingleCardForResult = ({
  card,
  onClick,
}: {
  card: Card;
  onClick: (card: Card) => void;
}) => {
  const borderColor = getRarityBorderColor(card.rarity);
  const isRare = card.rarity === "RARE";
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(card)}
      className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group bg-white/80"
      style={{
        boxShadow: isRare
          ? `0px 10px 30px 0px #3E206D, inset 0 0 0 4px ${borderColor}`
          : `0 10px 30px -10px ${borderColor}60, inset 0 0 0 4px ${borderColor}80`,
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
