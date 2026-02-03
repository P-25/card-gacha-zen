import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { getTierThreshold } from "../config/tierConfig";
import { Card } from "../types/game";

// Base Selector
const selectPlayer = (state: RootState) => state.player;

// Select Current Tier
export const selectPlayerTier = createSelector(
  [selectPlayer],
  (player) => player.battleTier || 1,
);

// Select Top 3 Cards by Total Stats (POW + SPD + DEF)
export const selectTop3Cards = createSelector([selectPlayer], (player) => {
  const cards = [...player.inventory];
  // Filter out invalid cards just in case
  const validCards = cards.filter((c) => c && c.state);

  // Sort by Total Power Descending
  const sorted = validCards.sort((a, b) => {
    const powerA = (a.state.pow || 0) + (a.state.spd || 0) + (a.state.def || 0);
    const powerB = (b.state.pow || 0) + (b.state.spd || 0) + (b.state.def || 0);
    return powerB - powerA;
  });

  return sorted.slice(0, 3);
});

// Select Max Total Power (Sum of top 3 cards)
export const selectMaxTP = createSelector([selectTop3Cards], (topCards) => {
  return topCards.reduce((sum, card) => {
    return (
      sum +
      (card.state.pow || 0) +
      (card.state.spd || 0) +
      (card.state.def || 0)
    );
  }, 0);
});

// Select Tier Threshold
export const selectTierThreshold = createSelector([selectPlayerTier], (tier) =>
  getTierThreshold(tier),
);

// Select Can Upgrade
export const selectCanUpgradeTier = createSelector(
  [selectMaxTP, selectTierThreshold],
  (maxTP, threshold) => maxTP >= threshold,
);
