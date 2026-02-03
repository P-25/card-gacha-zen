export const TIER_REWARD_GEMS = 30;
export const TIER_REWARD_GOLD = 1000;

export const getTierThreshold = (currentTier: number): number => {
  // Formula: Tier * 100
  // Tier 1 -> 100 TP to reach Tier 2
  // Tier 2 -> 200 TP to reach Tier 3
  return currentTier * 100;
};
