export type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";
export type ItemType = "CARD" | "RESOURCE";

export interface GameItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  image: string;
}

export interface Card extends GameItem {
  type: "CARD";
  setName: string;
  setId: string;
  level: number;
  releaseDate: string;
  description: string;
  hp: number;
  atk: number;
  tp?: number; // Total Power (calculated)
}

export interface Resource extends GameItem {
  type: "RESOURCE";
  value: number;
}

export interface PitySettings {
  targetRarity: Rarity;
  hardPity: number;
  softPity: number;
  softPityIncrement: number;
}

export interface SummonPoolItem {
  id: string;
  weight: number;
  type?: ItemType; // Optional override or explicit type
}

export interface SummonBanner {
  id: string;
  name: string;
  cost: number;
  currency: string;
  rates: Record<string, number>; // Rarity -> Probability (0-1)
  pity: PitySettings;
  pool: SummonPoolItem[];
}

export interface PlayerPityState {
  pullsSinceLastRare: number;
  // Can be expanded for other rarities if needed
}

export interface SummonResult {
  item: Card | Resource;
  newPityState: PlayerPityState;
}
