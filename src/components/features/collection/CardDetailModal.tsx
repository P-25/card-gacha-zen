import { Card } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
  count?: number;
}

export default function CardDetailModal({
  card,
  onClose,
  count,
}: CardDetailModalProps) {
  if (!card) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 aspect-[2/3] md:aspect-auto">
              <Image
                src={card.image}
                alt={card.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent md:bg-gradient-to-r" />
            </div>

            {/* Details Section */}
            <div className="p-6 md:w-1/2 flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      card.rarity === "LEGENDARY"
                        ? "bg-purple-500/20 text-purple-300"
                        : card.rarity === "RARE"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-gray-500/20 text-gray-300"
                    }`}
                  >
                    {card.rarity}
                  </span>
                  {count && count > 0 && (
                    <span className="text-xs text-white/50">
                      Owned: {count}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-display font-bold text-white">
                  {card.name}
                </h2>
                <p className="text-white/60 text-sm italic">
                  {card.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="block text-xs text-white/40 uppercase tracking-wider mb-1">
                    ATK
                  </span>
                  <span className="text-xl font-bold text-red-400">
                    {card.atk}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="block text-xs text-white/40 uppercase tracking-wider mb-1">
                    HP
                  </span>
                  <span className="text-xl font-bold text-green-400">
                    {card.hp}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs text-white/40">
                  <span>Set: {card.setName}</span>
                  <span>Level: {card.level}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
