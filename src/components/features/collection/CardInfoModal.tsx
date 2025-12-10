import { getRarityBorderColor } from "@/lib/rarityStyles";
import { Card } from "@/types/game";
import { motion } from "framer-motion";
import Image from "next/image";

interface CardInfoModalProps {
  card: Card;
  onClose: () => void;
}

export default function CardInfoModal({ card, onClose }: CardInfoModalProps) {
  const borderColor = getRarityBorderColor(card.rarity);
  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center">
      {/* Lightweight Background for Performance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-0 pointer-events-none bg-[#F5F2EB]"
      >
        <img
          src="/assets/background/light-bg.webp"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60" />
      </motion.div>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md rounded-3xl overflow-hidden relative z-10 flex flex-col min-h-[90vh]"
      >
        {/* Header */}
        <div className="pt-6 pb-2 text-center relative shrink-0">
          <h2 className="text-2xl font-bold text-[#1a2e2e] uppercase tracking-wider">
            Card Info
          </h2>
          <div className="w-12 h-1 bg-[#6A9A6A] mx-auto mt-1 rounded-full" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#1a2e2e]/50 hover:text-[#1a2e2e] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1 scrollbar-hide">
          {/* Card Image */}
          <div
            className="w-2/3 mx-auto aspect-3/4 relative rounded-2xl overflow-hidden shadow-xl mb-6"
            style={{
              boxShadow: `inset 0 0 0 4px ${borderColor}`,
            }}
          >
            <Image src={card.image} alt={card.name} fill />
          </div>

          {/* Stats Box */}
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl bg-gradient-to-b from-white/40 to-white/10 rounded-xl border border-[#E0DCC0] p-4 mb-6 shadow-sm">
            <h4 className="text-center text-xl font-bold text-[#1a2e2e] uppercase mb-3">
              {card.name}
            </h4>
            <div className="flex justify-between items-center px-4 mb-3 text-[#1a2e2e] font-bold">
              <span>ATK: {card.atk}</span>
              <span>HP: {card.hp}</span>
              <span>Level: {card.level}</span>
            </div>
            <div className="h-px w-full bg-[#E0DCC0] mb-3" />

            <div className="text-center">
              <h5 className="text-md font-bold text-[#1a2e2e] uppercase tracking-widest mb-1">
                Lore
              </h5>
              <p className="text-[#5F5A46] text-sm font-semibold leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
