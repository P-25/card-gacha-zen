import summons from "../config/summons.json";
import cards from "../config/cards.json";
import resources from "../config/resources.json";
import {
  Card,
  PlayerPityState,
  Rarity,
  Resource,
  SummonResult,
  SummonBanner,
} from "../types/game";

/**
 * Calculates the Total Power (TP) of a card.
 */
export function calculateTotalPower(card: Card): number {
  return card.hp + card.atk;
}

/**
 * Helper to get a random number between 0 and 1.
 * Can be mocked for testing.
 */
function getRandom(): number {
  return Math.random();
}

/**
 * Performs a summon on a specific banner.
 */
export function performSummon(
  bannerId: string,
  currentPity: PlayerPityState
): SummonResult {
  const banner = (summons as unknown as SummonBanner[]).find(
    (s) => s.id === bannerId
  );
  if (!banner) {
    throw new Error(`Banner with ID ${bannerId} not found.`);
  }

  const { pity, rates } = banner;
  let selectedRarity: Rarity = "COMMON"; // Default
  const pulls = currentPity.pullsSinceLastRare;

  // 1. Check Hard Pity
  if (pulls >= pity.hardPity - 1) {
    selectedRarity = pity.targetRarity;
  } else {
    // 2. Calculate Rates (Soft Pity Logic)
    let rareRate = rates[pity.targetRarity] || 0;

    if (pulls >= pity.softPity) {
      const extraRate = (pulls - pity.softPity + 1) * pity.softPityIncrement;
      rareRate += extraRate;
      // Cap at 1.0 just in case
      if (rareRate > 1.0) rareRate = 1.0;
    }

    // Determine Rarity
    const roll = getRandom();

    // Simple logic for 3 rarities (Common, Uncommon, Rare)
    // We need to normalize other rates if Rare rate increases
    // For simplicity, we subtract the increase from Common/Uncommon proportionally or just from Common.
    // Let's assume standard hierarchy: Common > Uncommon > Rare

    // If we have a dynamic rate for Rare, we check that first.
    if (roll < rareRate) {
      selectedRarity = pity.targetRarity;
    } else {
      // If not Rare, check others.
      // We need to re-normalize the remaining probability space (1 - rareRate)
      // But standard gacha usually just checks thresholds.
      // Let's stick to the config rates for non-pity rarities, but scaled?
      // Actually, simplest soft pity implementation:
      // If roll < rareRate -> RARE
      // Else -> Check other rates normalized to (1 - rareRate)

      const remainingRoll = (roll - rareRate) / (1 - rareRate);

      // Get base rates for others
      const uncommonRate = rates["UNCOMMON"] || 0;
      const commonRate = rates["COMMON"] || 0;
      const totalNonRare = uncommonRate + commonRate;

      const normalizedUncommon = uncommonRate / totalNonRare;

      if (remainingRoll < normalizedUncommon) {
        selectedRarity = "UNCOMMON";
      } else {
        selectedRarity = "COMMON";
      }
    }
  }

  // 3. Select Item from Pool based on Rarity
  let poolToUse = banner.pool;

  // Dynamic Pool: If pool is empty, use ALL cards and resources
  if (!poolToUse || poolToUse.length === 0) {
    const allCards = cards.map((c) => ({ id: c.id, weight: 10 }));
    const allResources = resources.map((r) => ({ id: r.id, weight: 10 }));
    poolToUse = [...allCards, ...allResources];
  }

  const poolItems = poolToUse.filter((item) => {
    // We need to resolve the item to check its rarity
    // The pool in config has IDs. We need to look them up in cards or resources.
    const card = cards.find((c) => c.id === item.id);
    if (card && card.rarity === selectedRarity) return true;

    const resource = resources.find((r) => r.id === item.id);
    if (resource && resource.rarity === selectedRarity) return true;

    return false;
  });

  if (poolItems.length === 0) {
    // Fallback if configuration is wrong: return a default common card
    console.error(
      `No items found for rarity ${selectedRarity} in banner ${bannerId}`
    );
    // Try to find ANY item of that rarity from global list as fallback?
    // Or just throw. Let's throw for now to catch config errors.
    throw new Error(
      `Configuration Error: No items in pool for ${selectedRarity}`
    );
  }

  // Weighted Random Selection
  const totalWeight = poolItems.reduce((sum, item) => sum + item.weight, 0);
  let weightRoll = getRandom() * totalWeight;
  let selectedPoolItem = poolItems[0];

  for (const item of poolItems) {
    if (weightRoll < item.weight) {
      selectedPoolItem = item;
      break;
    }
    weightRoll -= item.weight;
  }

  // Resolve full item object
  let finalItem: Card | Resource;
  const card = cards.find((c) => c.id === selectedPoolItem.id);
  if (card) {
    finalItem = {
      ...card,
      tp: calculateTotalPower(card as unknown as Card),
    } as unknown as Card;
  } else {
    const resource = resources.find((r) => r.id === selectedPoolItem.id);
    if (resource) {
      finalItem = resource as unknown as Resource;
    } else {
      throw new Error(`Item ID ${selectedPoolItem.id} not found in database.`);
    }
  }

  // 4. Update Pity State
  const newPityState = { ...currentPity };
  if (selectedRarity === pity.targetRarity) {
    newPityState.pullsSinceLastRare = 0;
  } else {
    newPityState.pullsSinceLastRare += 1;
  }

  return {
    item: finalItem,
    newPityState,
  };
}
