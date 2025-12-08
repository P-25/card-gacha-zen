import { Card, Rarity } from "../types/game";

export type ShopItemType = "SPECIFIC_CARD" | "RANDOM_PACK" | "GEM_PACK";

export interface ShopItem {
  id: string;
  type: ShopItemType;
  name: string;
  cost: number;
  currency: "GOLD" | "GEMS";
  image: string;
  // For Specific Cards
  cardId?: string; // Reference to existing card in cards.json
  cardDefinition?: Partial<Card>; // For Shop Exclusives
  // For Random Packs
  rarity?: Rarity;
  // For Gem Packs
  gemAmount?: number;
}

export const shopItems: ShopItem[] = [
  // --- Specific Cards ---
  {
    id: "shop_card_rare_001",
    type: "SPECIFIC_CARD",
    name: "Horizon Keeper",
    cost: 12000,
    currency: "GOLD",
    image: "/assets/Card_Art/rare/card_001.png", // Placeholder, will use card image
    cardId: "rare_card_001", // Horizon Keeper
  },
  {
    id: "shop_card_uncommon_001",
    type: "SPECIFIC_CARD",
    name: "Frost Guard",
    cost: 3000,
    currency: "GOLD",
    image: "/assets/Card_Art/uncommon/card_005.png",
    cardId: "uncommon_card_001", // Celestial Serpent
  },
  {
    id: "shop_card_common_001",
    type: "SPECIFIC_CARD",
    name: "Whisper",
    cost: 500,
    currency: "GOLD",
    image: "/assets/Card_Art/common/card_006.png",
    cardId: "common_card_001", // Clay Golem
  },
  // --- Shop Exclusive ---
  // {
  //   id: "shop_exclusive_001",
  //   type: "SPECIFIC_CARD",
  //   name: "Merchant of Dreams",
  //   cost: 25000,
  //   currency: "GOLD",
  //   image: "/assets/Card_Designs/rare/card_002.png", // Assuming this asset exists or using placeholder
  //   cardDefinition: {
  //     id: "shop_exclusive_001",
  //     name: "MERCHANT OF DREAMS",
  //     type: "CARD",
  //     rarity: "RARE",
  //     setName: "Shop Exclusive",
  //     setId: "SE01",
  //     level: 1,
  //     releaseDate: "2025-12-07",
  //     description: "A mysterious figure who trades in memories and starlight.",
  //     hp: 500,
  //     atk: 450,
  //     image: "/assets/Card_Designs/rare/card_002.png",
  //     experience: 0,
  //     design_type: "Eternal",
  //     backgroundColor: "#2a1a3e",
  //     textColor: "#e1bee7",
  //   },
  // },

  // --- Random Packs ---
  {
    id: "pack_uncommon",
    type: "RANDOM_PACK",
    name: "Uncommon Pack",
    cost: 1500,
    currency: "GOLD",
    image: "/assets/Card_Art/resource/random_uncommon_pack.png",
    rarity: "UNCOMMON",
  },
  {
    id: "pack_common",
    type: "RANDOM_PACK",
    name: "Common Pack",
    cost: 250,
    currency: "GOLD",
    image: "/assets/Card_Art/resource/random_common_pack.png",
    rarity: "COMMON",
  },

  // --- Gem Packs ---
  {
    id: "gems_10",
    type: "GEM_PACK",
    name: "10 Gems",
    cost: 1000,
    currency: "GOLD",
    image: "/assets/Card_Art/resource/card_004.png",
    gemAmount: 10,
  },
  {
    id: "gems_100",
    type: "GEM_PACK",
    name: "100 Gems",
    cost: 10000,
    currency: "GOLD",
    image: "/assets/Card_Art/resource/card_005.png",
    gemAmount: 100,
  },
  {
    id: "gems_1000",
    type: "GEM_PACK",
    name: "1000 Gems",
    cost: 100000,
    currency: "GOLD",
    image: "/assets/Card_Art/resource/card_006.png",
    gemAmount: 1000,
  },
];
