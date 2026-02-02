/* eslint-disable @typescript-eslint/no-explicit-any */
import CardReveal from "@/components/features/gacha/CardReveal";
import { shopItems, ShopItem, featuredShopConfig } from "@/config/shopConfig";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  addCardToInventory,
  addGems,
  spendGold,
} from "@/store/slices/playerSlice";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShopItemCard from "./ShopItemCard";
import { useRouter } from "next/router";
import cardsData from "@/config/cards.json";
import { Card } from "@/types/game";
import Image from "next/image";
import TopBar from "../home/TopBar";

const InfoTooltip = ({
  text,
  placement = "top",
}: {
  text: string;
  placement?: "top" | "bottom";
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2">
      <div
        className="relative w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <Image
          src="/assets/icons/info.webp"
          alt="Info"
          fill
          className="object-contain"
        />
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{
              opacity: 0,
              y: placement === "top" ? 10 : -10,
              scale: 0.9,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "top" ? 10 : -10, scale: 0.9 }}
            className={`absolute left-1/2 -translate-x-1/2 w-48 p-3 bg-[#1a2e2e] text-[#Fdfcf8] text-xs rounded-lg shadow-xl z-50 text-center pointer-events-none ${
              placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {text}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent ${
                placement === "top"
                  ? "top-full border-t-[6px] border-t-[#1a2e2e]"
                  : "bottom-full border-b-[6px] border-b-[#1a2e2e]"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ShopScreen({ title }: { title: string }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { gold, gems } = useSelector((state: RootState) => state.player);

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [showReveal, setShowReveal] = useState(false);
  const [revealResults, setRevealResults] = useState<(Card | any)[]>([]);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");

  const specificCards = shopItems.filter((i) => i.type === "SPECIFIC_CARD"); // Keep strictly for legacy or specific overrides if any
  const randomPacks = shopItems.filter((i) => i.type === "RANDOM_PACK");
  const gemPacks = shopItems.filter((i) => i.type === "GEM_PACK");

  // Process Featured Cards
  const featuredCards: ShopItem[] = featuredShopConfig.cards.map(
    (featuredItem, index) => {
      // Find the card data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cardData = (cardsData as any[]).find(
        (c) => c.id === featuredItem.cardId,
      );

      return {
        id: `featured_${index}_${featuredItem.cardId}`,
        type: "SPECIFIC_CARD",
        name: cardData ? cardData.name : "Unknown Card",
        cost: featuredItem.goldPrice,
        currency: "GOLD",
        image: cardData ? cardData.image : "/assets/placeholder.png",
        cardId: featuredItem.cardId,
        rarity: cardData ? cardData.rarity : "COMMON",
      };
    },
  );

  const handleItemClick = (item: ShopItem) => {
    setSelectedItem(item);
    setShowConfirmation(true);
  };

  const handleConfirmBuy = () => {
    if (!selectedItem) return;
    const item = selectedItem;

    if (item.currency === "GOLD" && gold < item.cost) return;

    // Deduct Cost
    if (item.currency === "GOLD") {
      dispatch(spendGold(item.cost));
    }

    setShowConfirmation(false);

    // Grant Reward & Show Animation
    if (item.type === "SPECIFIC_CARD") {
      let cardToAdd: Card | undefined;

      if (item.cardDefinition) {
        cardToAdd = item.cardDefinition as Card;
      } else if (item.cardId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cardToAdd = (cardsData as any[]).find((c) => c.id === item.cardId);
      }

      if (cardToAdd) {
        dispatch(addCardToInventory(cardToAdd));
        setRevealResults([cardToAdd]);
        setShowReveal(true);
      }
    } else if (item.type === "RANDOM_PACK") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pool = (cardsData as any[]).filter((c) => c.rarity === item.rarity);
      if (pool.length > 0) {
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        dispatch(addCardToInventory(randomCard));
        setRevealResults([randomCard]);
        setShowReveal(true);
      }
    } else if (item.type === "GEM_PACK") {
      if (item.gemAmount) {
        dispatch(addGems(item.gemAmount));
        setRewardMessage(`${item.gemAmount}`);
        setShowSuccessPopup(true);
      }
    }
  };

  const handleRevealReset = () => {
    setShowReveal(false);
    setRevealResults([]);
  };

  if (showReveal) {
    return (
      <div className="fixed inset-0 z-50">
        <CardReveal
          results={revealResults}
          onReset={handleRevealReset}
          onFinish={handleRevealReset}
        />
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <TopBar title={title} />

      {/* Content */}
      {/* <div className="flex-1 overflow-y-auto scrollbar-hide pb-24"> */}
      <div className="flex-1 container mx-auto max-w-7xl px-2 pt-2 pb-[10rem] relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="p-6 space-y-8 max-w-4xl mx-auto" id="shop-content">
          {/* Featured Cards Section */}
          <div className="w-full mb-8">
            {/* Header + Timer + Tooltip */}
            <div className="flex flex-col items-center mb-6 gap-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[#1a2e2e] font-bold uppercase tracking-widest text-xl">
                  FEATURED Cards
                </h2>
                <InfoTooltip
                  text="Directly purchase specific units. The selection refreshes automatically when the timer ends."
                  placement="bottom"
                />
              </div>

              {/* Countdown Timer */}
              <div className="bg-[#1a2e2e] text-[#FDB931] text-xs font-bold px-3 py-1 rounded-full shadow-inner flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Ends in 2d 4h</span>{" "}
                {/* Static for now, can implement dynamic hook if needed */}
              </div>
            </div>

            {/* Featured Cards Grid (3 Columns) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 px-2">
              {featuredCards.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  onBuy={handleItemClick}
                  canAfford={gold >= item.cost}
                  showRarityStyle={true}
                />
              ))}
            </div>
          </div>

          {/* Random Packs */}
          <div className="flex items-center justify-center mb-4 mt-8">
            <h2 className="text-[#1a2e2e] font-bold uppercase tracking-widest text-md">
              Random Packs
            </h2>
            <InfoTooltip text="Get a random card of select rarity" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {randomPacks.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                onBuy={handleItemClick}
                canAfford={item.currency === "GOLD" ? gold >= item.cost : true}
                showTitle={true}
              />
            ))}
          </div>

          {/* Gem Packs */}
          <div className="flex items-center justify-center mb-4 mt-8">
            <h2 className="text-[#1a2e2e] font-bold uppercase tracking-widest text-md">
              Gem Shop
            </h2>
            <InfoTooltip text="Purchase gems" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {gemPacks.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                onBuy={handleItemClick}
                canAfford={item.currency === "GOLD" ? gold >= item.cost : true}
                showTitle={true}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedItem && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowConfirmation(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#Fdfcf8] p-6 rounded-2xl shadow-2xl relative z-10 max-w-xs w-full text-center"
            >
              <h3 className="text-xl font-bold text-[#1a2e2e] mb-2">
                Confirm Purchase
              </h3>
              <p className="text-[#5F5A46] mb-4 text-sm">
                Buy <strong>{selectedItem.name}</strong> for?
              </p>
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
                width={100}
                height={100}
                className="mx-auto mb-4"
              />
              <div className="flex items-center justify-center gap-2 mb-6 text-xl font-bold text-[#1a2e2e]">
                <span>{selectedItem.cost.toLocaleString()}</span>
                <span className="text-sm">
                  {selectedItem.currency === "GOLD" ? "Gold" : "Gems"}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-2 rounded-lg font-bold text-[#5F5A46] bg-[#EDE8D0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBuy}
                  className="flex-1 py-2 rounded-lg font-bold text-white bg-[#3A4E48]"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup (For Gems) */}
      <AnimatePresence>
        {showSuccessPopup && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSuccessPopup(false)}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#Fdfcf8] p-8 rounded-2xl shadow-2xl relative z-10 max-w-sm w-full text-center"
            >
              <h3 className="text-2xl font-bold text-[#1a2e2e] mb-4">
                Purchase Successful!
              </h3>
              <div className="flex justify-center gap-2 my-4">
                <div className="w-6 h-6 relative">
                  <Image
                    src="/assets/icons/gem.webp"
                    alt="Diamond"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[#1a2e2e] font-medium text-lg">
                  x{rewardMessage}
                </span>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full py-3 bg-[#1a2e2e] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#2a3b3b]"
              >
                Awesome
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
