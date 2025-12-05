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
}: CardDetailModalProps) {
  if (!card) return null;

  // Placeholder logic for upgrade
  const duplicates = 2;
  const duplicatesNeeded = 5;
  const progress = (duplicates / duplicatesNeeded) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Content Wrapper */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md flex flex-col gap-4 pointer-events-none" // pointer-events-none to prevent clicks on wrapper, enable on children
        >
          {/* 1. TOP SECTION: Card Info */}
          <div className="bg-[#Fdfcf8] rounded-3xl p-4 flex gap-4 shadow-xl pointer-events-auto relative overflow-hidden">
            {/* Close Button (Absolute) */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-20 p-1.5 bg-black/10 hover:bg-black/20 rounded-full text-black/40 hover:text-black/60 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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

            {/* Left: Image */}
            <div className="w-1/3 aspect-3/4 relative rounded-xl overflow-hidden shadow-inner bg-slate-200 shrink-0">
              <Image
                src={card.image}
                alt={card.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Right: Details */}
            <div className="flex-1 flex flex-col justify-center gap-1">
              <h2 className="text-xl font-bold text-[#1a2e2e] leading-tight">
                {card.name}
              </h2>

              <div className="flex flex-col gap-0.5 text-sm text-[#5F5A46] font-medium mt-1">
                <span>ATK: {card.atk}</span>
                <span>HP: {card.hp}</span>
              </div>

              {/* Level Bar */}
              <div className="mt-3 relative h-8 w-full bg-[#2a3b3b] rounded-full overflow-hidden flex items-center justify-center">
                {/* Progress Fill (Static for now, implies current level progress) */}
                <div className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-[#C5A059] to-[#FDB931] w-[40%]" />
                <span className="relative z-10 text-xs font-bold text-white tracking-wide">
                  Level {card.level} / 10
                </span>
              </div>
            </div>
          </div>

          {/* 2. BOTTOM SECTION: Upgrade */}
          <div className="bg-[#E8F0F0] rounded-3xl p-5 flex items-center justify-between shadow-xl pointer-events-auto border border-white/50">
            {/* Left: Icon & Progress */}
            <div className="flex items-center gap-4 flex-1">
              {/* Icon Placeholder */}
              <div className="w-12 h-12 rounded-xl border-2 border-[#5F7A7A] flex items-center justify-center text-[#5F7A7A]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>

              <div className="flex flex-col gap-1 w-full max-w-[140px]">
                <span className="text-xs font-bold text-[#2F4F4F] uppercase tracking-wide">
                  Upgrade
                </span>
                <div className="w-full h-2 bg-[#cad6d6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5F7A7A]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#5F7A7A]">
                  Duplicates: {duplicates}/{duplicatesNeeded}
                </span>
              </div>
            </div>

            {/* Right: Button */}
            <button className="bg-[#6A9A6A] hover:bg-[#588558] text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md transition-colors uppercase tracking-wider">
              Level Up
              <span className="block text-[9px] opacity-80 font-normal normal-case">
                (Needs {duplicatesNeeded - duplicates} more)
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
