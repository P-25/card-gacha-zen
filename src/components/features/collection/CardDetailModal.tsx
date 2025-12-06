import { Card } from "@/types/game";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { consumeDuplicatesForLevelUp } from "@/store/slices/playerSlice";

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
  count?: number;
}

export default function CardDetailModal({
  card,
  onClose,
}: CardDetailModalProps) {
  const dispatch = useDispatch();
  const { inventory } = useSelector((state: RootState) => state.player);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);

  // Filter duplicates from inventory (same ID but different instanceId)
  const duplicates = useMemo(() => {
    if (!card) return [];
    return inventory.filter(
      (c) => c.id === card.id && c.instanceId !== card.instanceId
    );
  }, [inventory, card]);

  if (!card) return null;

  const currentLevel = card.level;
  const nextLevel = currentLevel + 1;
  const isMaxLevel = currentLevel >= 10;
  const cardsNeeded = nextLevel; // Cost = Target Level (e.g. Lvl 1->2 needs 2 cards)

  const canLevelUp = selectedDuplicates.length === cardsNeeded;

  const handleLevelUp = () => {
    if (!canLevelUp) return;

    dispatch(
      consumeDuplicatesForLevelUp({
        targetInstanceId: card.instanceId || "",
        consumedInstanceIds: selectedDuplicates,
        targetLevel: nextLevel,
      })
    );

    // Reset selection or close modal?
    // User said "update the level of the card...".
    // We probably want to stay open to show the new level, or close.
    // Let's reset selection and exit level up mode for now.
    setSelectedDuplicates([]);
    setIsLevelingUp(false);
  };

  const toggleDuplicateSelection = (instanceId: string) => {
    if (selectedDuplicates.includes(instanceId)) {
      setSelectedDuplicates((prev) => prev.filter((id) => id !== instanceId));
    } else {
      // Allow selecting more than needed? User said "if i choose 6... i can't confirm".
      // So yes, allow selecting more, but validation fails.
      setSelectedDuplicates((prev) => [...prev, instanceId]);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Bottom Sheet Container */}
        <motion.div
          layout
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          drag={!isLevelingUp ? "y" : false} // Disable drag when leveling up to prevent accidental closes
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (!isLevelingUp && info.offset.y > 100) {
              onClose();
            }
          }}
          className="relative w-full max-w-md bg-[#Fdfcf8] rounded-t-3xl px-6 pt-6 pb-24 flex flex-col gap-6 shadow-2xl z-10 overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          {/* Drag Handle */}
          {!isLevelingUp && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-black/10 rounded-full" />
          )}

          {/* 1. TOP SECTION: Card Info */}
          <div className="flex gap-5 mt-2 shrink-0">
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
            <div className="flex-1 flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-[#1a2e2e] leading-tight">
                {card.name}
              </h2>

              <div className="flex flex-row justify-between gap-1 text-sm text-[#5F5A46] font-bold">
                <span>ATK: {card.atk}</span>
                <span>HP: {card.hp}</span>
                <span></span>
                <span></span>
              </div>

              <div className="shrink-0 bg-[#2a3b3b] rounded-full p-1 flex items-center justify-between relative h-12">
                {/* Level Text */}
                <div className="px-4 text-white font-bold text-sm z-10">
                  Level {card.level} / 10
                </div>

                {/* Progress Bar Background */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#2a3b3b] to-[#3a4b4b] w-full" />
                </div>

                {/* Action Button */}
                {!isMaxLevel && (
                  <button
                    onClick={() => setIsLevelingUp(!isLevelingUp)}
                    className={`relative z-10 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      isLevelingUp
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-[#6A9A6A] text-white hover:bg-[#588558] shadow-md"
                    }`}
                  >
                    {isLevelingUp ? "Cancel" : "Level Up"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. LEVEL BAR & ACTION */}

          {/* 3. EXPANDED LEVEL UP AREA */}
          <AnimatePresence>
            {isLevelingUp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-4 overflow-hidden"
              >
                <div className="h-px w-full bg-black/5" />

                {/* Instructions */}
                <div className="flex justify-between items-center text-xs font-bold text-[#5F5A46]">
                  <span>Select {cardsNeeded} duplicates</span>
                  <span
                    className={
                      selectedDuplicates.length === cardsNeeded
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {selectedDuplicates.length} / {cardsNeeded}
                  </span>
                </div>

                {/* Duplicates Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-1">
                  {duplicates.length === 0 ? (
                    <div className="col-span-4 text-center py-8 text-sm text-black/40 italic">
                      No duplicates available
                    </div>
                  ) : (
                    duplicates.map((dup) => {
                      const isSelected = selectedDuplicates.includes(
                        dup.instanceId || ""
                      );
                      return (
                        <button
                          key={dup.instanceId}
                          onClick={() =>
                            toggleDuplicateSelection(dup.instanceId || "")
                          }
                          className={`aspect-[3/4] relative rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-[#6A9A6A] scale-95 opacity-100"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={dup.image}
                            alt={dup.name}
                            fill
                            className="object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#6A9A6A]/20 flex items-center justify-center">
                              <div className="w-4 h-4 bg-[#6A9A6A] rounded-full flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="w-3 h-3 text-white"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Confirm Button */}
                <button
                  disabled={!canLevelUp}
                  onClick={handleLevelUp}
                  className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                    canLevelUp
                      ? "bg-[#6A9A6A] text-white shadow-lg hover:bg-[#588558]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirm Level Up (to Lvl {nextLevel})
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
