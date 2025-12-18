import BackButtonTopBar from "@/components/common/BackButtonTopBar";
import CardDetailModal from "@/components/features/collection/CardDetailModal";
import CollectionCard from "@/components/features/collection/CollectionCard";
import { Card, Resource } from "@/types/game";
import Image from "next/image";
import { useState } from "react";

interface SummonResultsProps {
  results: (Card | Resource)[];
  onBack: () => void;
}

export default function SummonResults({ results, onBack }: SummonResultsProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {/* Grid */}
      <div className="p-4 flex flex-col justify-center items-center gap-6">
        <div className="grid grid-cols-4 gap-1 w-full">
          {results.map((item, index) => {
            if (item.type === "CARD") {
              return (
                <CollectionCard
                  key={`${(item as Card).instanceId || index}`}
                  card={item as Card}
                  onClick={(c) => setSelectedCard(c)}
                />
              );
            } else {
              // Resource display
              const res = item as Resource;
              return (
                <div
                  key={res.id}
                  className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-lg group bg-white/80"
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
        <button
          onClick={onBack}
          className="flex-2 px-4 bg-[#3E206D] text-[#FDB931] font-bold text-xl py-3 rounded-xl border-2 border-[#C5A059] shadow-lg active:scale-95 transition-transform uppercase tracking-widest relative overflow-hidden group cursor-pointer hover:brightness-110"
        >
          <span className="relative z-10">Claim All</span>
          {/* Sheen */}
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        </button>
      </div>

      {/* Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
