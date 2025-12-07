/* eslint-disable @typescript-eslint/no-explicit-any */
import CardReveal from "@/components/features/gacha/CardReveal";
import { shopItems, ShopItem } from "@/config/shopConfig";
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
import BottomNav from "@/components/BottomNav";
import { useRouter } from "next/router";
import cardsData from "@/config/cards.json";
import { Card, Rarity } from "@/types/game";
import Image from "next/image";
import TopBar from "../home/TopBar";

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

  const specificCards = shopItems.filter((i) => i.type === "SPECIFIC_CARD");
  const randomPacks = shopItems.filter((i) => i.type === "RANDOM_PACK");
  const gemPacks = shopItems.filter((i) => i.type === "GEM_PACK");

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
        <CardReveal results={revealResults} onReset={handleRevealReset} />
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
          <h2 className="text-center text-[#1a2e2e] font-bold uppercase tracking-widest mb-4 text-md">
            Cards
          </h2>

          {/* Specific Cards */}
          <div className="grid grid-cols-2 gap-4">
            {specificCards.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                onBuy={handleItemClick}
                canAfford={item.currency === "GOLD" ? gold >= item.cost : true}
              />
            ))}
          </div>

          {/* Random Packs */}
          <h2 className="text-center text-[#1a2e2e] font-bold uppercase tracking-widest mb-4 text-md mt-8">
            Random Packs
          </h2>
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
          <h2 className="text-center text-[#1a2e2e] font-bold uppercase tracking-widest mb-4 text-md mt-8">
            Gem Shop
          </h2>
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
                    src="/assets/icons/gem.png"
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
