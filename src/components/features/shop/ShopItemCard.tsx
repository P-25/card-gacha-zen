import { ShopItem } from "@/config/shopConfig";
import { motion } from "framer-motion";
import Image from "next/image";
import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";
import { Rarity } from "@/types/game";

interface ShopItemCardProps {
  item: ShopItem;
  onBuy: (item: ShopItem) => void;
  canAfford: boolean;
  showTitle?: boolean;
  showRarityStyle?: boolean;
}

export default function ShopItemCard({
  item,
  onBuy,
  canAfford,
  showTitle = false,
  showRarityStyle = false,
}: ShopItemCardProps) {
  const rarity =
    item.rarity || (item.cardDefinition?.rarity as Rarity) || "COMMON";
  const borderColor = showRarityStyle
    ? getRarityBorderColor(rarity)
    : "transparent";
  const strokeImage = showRarityStyle ? getStrokeImage(rarity) : null;

  return (
    <motion.div
      whileHover={canAfford ? { scale: 1.02, y: -2 } : {}}
      whileTap={canAfford ? { scale: 0.98 } : {}}
      onClick={() => canAfford && onBuy(item)}
      className={`relative rounded-xl overflow-hidden flex flex-col items-center cursor-pointer transition-all duration-300 ${
        showRarityStyle
          ? "bg-transparent aspect-[3/4.5] p-2"
          : "bg-white shadow-md aspect-[3/4]"
      }`}
      style={
        showRarityStyle
          ? {
              boxShadow: `0 4px 20px -5px ${borderColor}60, inset 0 0 0 2px ${borderColor}80`,
              backgroundColor: "rgba(0,0,0,0.2)",
            }
          : {}
      }
    >
      {/* Background Brush Stroke (Collection Style) */}
      {showRarityStyle && strokeImage && (
        <div className="absolute inset-0 z-0 opacity-40 scale-110 flex items-center justify-center pointer-events-none">
          <Image src={strokeImage} alt="stroke" fill className="object-cover" />
        </div>
      )}

      {/* Card Image Container */}
      <div
        className={`relative w-full ${showRarityStyle ? "aspect-[3/4] mb-2 z-10" : "aspect-[3/4] group"}`}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={`object-contain transition-transform duration-500 ${showRarityStyle ? "drop-shadow-lg" : "group-hover:scale-110"}`}
        />

        {/* Title Overlay for Standard Cards */}
        {!showRarityStyle && showTitle && (
          <div className="absolute bg-white/80 flex flex-col items-center justify-end px-2 py-1 w-full top-0">
            <span className="text-[#1a2e2e] font-bold text-sm">
              {item.name}
            </span>
          </div>
        )}
      </div>

      {/* Info / Price Section */}
      <div
        className={`w-full flex flex-col items-center z-10 ${showRarityStyle ? "mt-auto pb-2" : "absolute bottom-0 bg-white/80 py-1"}`}
      >
        {/* Name (Featured Only) */}
        {showRarityStyle && (
          <span className="text-white font-bold text-xs mb-1 text-center leading-tight px-1 drop-shadow-md">
            {item.name}
          </span>
        )}

        {/* Price */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${showRarityStyle ? "bg-[#1a2e2e]/90 border border-[#FDB931]/50" : ""}`}
        >
          {item.currency === "GOLD" ? (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 relative">
                <Image
                  src="/assets/icons/gold-coin.webp"
                  alt="Gold"
                  fill
                  className="object-cover"
                />
              </div>
              <span
                className={`font-bold text-sm ${showRarityStyle ? "text-[#FDB931]" : "text-[#1a2e2e]"}`}
              >
                {item.cost.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 relative">
                <Image
                  src="/assets/icons/gem.webp"
                  alt="Gem"
                  fill
                  className="object-contain"
                />
              </div>
              <span
                className={`font-bold text-sm ${showRarityStyle ? "text-white" : "text-[#1a2e2e]"}`}
              >
                {item.cost.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for disabled state */}
      {!canAfford && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
          <span className="bg-red-900/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded border border-red-500/50">
            Insufficient Funds
          </span>
        </div>
      )}
    </motion.div>
  );
}
