import { ShopItem } from "@/config/shopConfig";
import { motion } from "framer-motion";
import Image from "next/image";

interface ShopItemCardProps {
  item: ShopItem;
  onBuy: (item: ShopItem) => void;
  canAfford: boolean;
  showTitle?: boolean;
}

export default function ShopItemCard({
  item,
  onBuy,
  canAfford,
  showTitle = false,
}: ShopItemCardProps) {
  return (
    <motion.div
      whileHover={canAfford ? { scale: 1.02 } : {}}
      whileTap={canAfford ? { scale: 0.98 } : {}}
      onClick={() => canAfford && onBuy(item)}
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center cursor-pointer relative"
    >
      {/* Name */}
      {/* <h3 className="text-sm font-bold text-[#1a2e2e] leading-tight text-center mb-2 h-10 flex items-center justify-center">
        {item.name}
      </h3> */}
      <div
        key={item.id}
        className="w-full group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1"
      >
        {/* Thumbnail Image */}
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
        {showTitle && (
          <div
            className={`absolute bg-white/80 flex flex-col items-center justify-end px-2 py-1 w-full top-0`}
          >
            <span className="text-[#1a2e2e] font-bold text-sm">
              {item.name}
            </span>
          </div>
        )}
        {/* Overlay Gradient on Hover */}
        <div
          className={`absolute bg-white/80 flex flex-col items-center justify-end px-2 py-1 w-full bottom-0`}
        >
          {item.currency === "GOLD" ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image
                  src="/assets/icons/gold-coin.webp"
                  alt="Gold"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-[#1a2e2e] font-medium text-sm">
                x{item.cost.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image
                  src="/assets/icons/gem.webp"
                  alt="Gem"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-[#1a2e2e] font-medium text-sm">
                x{item.cost.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for disabled state */}
      {!canAfford && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded text-center">
            Insufficient Funds
          </span>
        </div>
      )}
    </motion.div>
  );
}
