"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RateUpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "gem" | "gold";
}

export default function RateUpsModal({
  isOpen,
  onClose,
  type,
}: RateUpsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute inset-x-4 top-[20%] z-50 bg-[#2a2a2a] rounded-2xl border border-white/10 p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white font-display">
                Drop Rates
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {type === "gem" ? (
                <>
                  <RateRow
                    rarity="Ultra Rare (UR)"
                    rate="5%"
                    color="text-yellow-400"
                  />
                  <RateRow
                    rarity="Super Rare (SR)"
                    rate="15%"
                    color="text-purple-400"
                  />
                  <RateRow rarity="Rare (R)" rate="80%" color="text-blue-400" />
                </>
              ) : (
                <>
                  <RateRow
                    rarity="Super Rare (SR)"
                    rate="2%"
                    color="text-purple-400"
                  />
                  <RateRow rarity="Rare (R)" rate="18%" color="text-blue-400" />
                  <RateRow
                    rarity="Common (C)"
                    rate="80%"
                    color="text-gray-400"
                  />
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/40">
              Rates are subject to change during events.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function RateRow({
  rarity,
  rate,
  color,
}: {
  rarity: string;
  rate: string;
  color: string;
}) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
      <span className={`font-bold ${color}`}>{rarity}</span>
      <span className="text-white font-mono">{rate}</span>
    </div>
  );
}
