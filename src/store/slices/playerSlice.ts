import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card, Resource } from "../../types/game";
import { TIER_REWARD_GEMS, TIER_REWARD_GOLD } from "../../config/tierConfig";

export interface PlayerState {
  gems: number;
  gold: number;
  inventory: Card[];
  level: number;
  experience: number;
  // Profile Info
  name: string;
  tag: string;
  activeProfilePicId: string;
  unlockedProfilePicIds: string[];
  // Battle Tier
  battleTier: number;
  // Level Up Tracking
  lastSeenLevel: number;
}

const initialState: PlayerState = {
  gems: 900, // Initial starting gems
  gold: 100,
  inventory: [],
  level: 1,
  experience: 0,
  lastSeenLevel: 1,
  // Default Profile
  name: "Trainer",
  tag: "#1234",
  activeProfilePicId: "default_1",
  unlockedProfilePicIds: ["default_1"],
  battleTier: 1,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerState: (state, action: PayloadAction<PlayerState>) => {
      const newState = action.payload;

      // Sanitize Inventory: Ensure all cards have unique instanceIds
      const seenInstanceIds = new Set<string>();

      newState.inventory = newState.inventory.map((card) => {
        let instanceId = card.instanceId;

        // If missing or duplicate, generate a new one
        if (!instanceId || seenInstanceIds.has(instanceId)) {
          instanceId = Math.random().toString(36).substr(2, 9);
        }

        seenInstanceIds.add(instanceId);

        return {
          ...card,
          instanceId,
        };
      });

      // Ensure level and experience exist (migration for old saves)
      if (newState.level === undefined) newState.level = 1;
      if (newState.experience === undefined) newState.experience = 0;
      if (newState.lastSeenLevel === undefined)
        newState.lastSeenLevel = newState.level;

      // Ensure Profile Info exists (migration)
      if (!newState.name) newState.name = "Trainer";
      if (!newState.tag) newState.tag = "#1234";
      if (!newState.activeProfilePicId)
        newState.activeProfilePicId = "default_1";
      if (!newState.unlockedProfilePicIds)
        newState.unlockedProfilePicIds = ["default_1"];
      if (!newState.battleTier) newState.battleTier = 1;

      return newState;
    },
    addGems: (state, action: PayloadAction<number>) => {
      state.gems += action.payload;
    },
    spendGems: (state, action: PayloadAction<number>) => {
      if (state.gems >= action.payload) {
        state.gems -= action.payload;
      }
    },
    addGold: (state, action: PayloadAction<number>) => {
      state.gold += action.payload;
    },
    spendGold: (state, action: PayloadAction<number>) => {
      if (state.gold >= action.payload) {
        state.gold -= action.payload;
      }
    },
    addCardToInventory: (state, action: PayloadAction<Card>) => {
      const newCard = {
        ...action.payload,
        instanceId:
          action.payload.instanceId || Math.random().toString(36).substr(2, 9),
      };
      state.inventory.push(newCard);
    },
    consumeCardsForXp: (
      state,
      action: PayloadAction<{
        targetInstanceId: string;
        consumedInstanceIds: string[];
      }>,
    ) => {
      const { targetInstanceId, consumedInstanceIds } = action.payload;

      // 1. Find target card
      const targetCard = state.inventory.find(
        (c) => c.instanceId === targetInstanceId,
      );
      if (!targetCard) return;

      // 2. Calculate Total XP from consumed cards
      let totalXpToAdd = 0;

      state.inventory.forEach((c) => {
        if (consumedInstanceIds.includes(c.instanceId || "")) {
          // XP Values: Common=50, Uncommon=100, Rare=200
          let baseXp = 50;
          if (c.rarity === "COMMON") baseXp = 50;
          else if (c.rarity === "UNCOMMON") baseXp = 100;
          else if (c.rarity === "RARE") baseXp = 200;

          // Scale by level
          const levelMultiplier = c.level || 1;
          totalXpToAdd += baseXp * levelMultiplier;
        }
      });

      // 3. Remove consumed cards
      state.inventory = state.inventory.filter(
        (c) => !consumedInstanceIds.includes(c.instanceId || ""),
      );

      // 4. Update XP but prevent Card Level > Player Level
      // Logic: Max Level = state.level (Player Level)

      // Re-find target card in the new inventory array (safe for Immer)
      const updatedTarget = state.inventory.find(
        (c) => c.instanceId === targetInstanceId,
      );
      if (!updatedTarget) return;

      let currentLevel = updatedTarget.level;
      let currentXp = updatedTarget.experience || 0;
      const maxLevel = state.level;

      // Add new XP
      currentXp += totalXpToAdd;

      while (currentLevel < maxLevel) {
        const xpNeeded = currentLevel * 100;
        if (currentXp >= xpNeeded) {
          currentXp -= xpNeeded;
          currentLevel++;
          // Increase stats by 2 points per level
          if (!updatedTarget.state) {
            updatedTarget.state = { pow: 0, spd: 0, def: 0 };
          }
          updatedTarget.state.pow += 2;
          updatedTarget.state.spd += 2;
          updatedTarget.state.def += 2;
        } else {
          break;
        }
      }

      // Update card
      updatedTarget.level = currentLevel;
      updatedTarget.experience = currentXp;
    },
    setProfileInfo: (
      state,
      action: PayloadAction<{ name: string; tag: string }>,
    ) => {
      state.name = action.payload.name;
      state.tag = action.payload.tag;
    },
    setActiveProfilePic: (state, action: PayloadAction<string>) => {
      state.activeProfilePicId = action.payload;
    },
    unlockProfilePic: (state, action: PayloadAction<string>) => {
      if (!state.unlockedProfilePicIds.includes(action.payload)) {
        state.unlockedProfilePicIds.push(action.payload);
      }
    },
    increaseBattleTier: (state) => {
      // Logic: Verified by selector in UI, here we just execute
      state.battleTier += 1;
      state.gems += TIER_REWARD_GEMS;
      state.gold += TIER_REWARD_GOLD;
    },
    addPlayerExp: (state, action: PayloadAction<number>) => {
      state.experience += action.payload;

      // Level Up Logic
      let nextLevelXp = state.level * 100;

      while (state.experience >= nextLevelXp) {
        state.experience -= nextLevelXp;
        state.level += 1;
        // Recalculate for next iteration if multiple levels gained
        nextLevelXp = state.level * 100;
      }
    },
    addRewards: (
      state,
      action: PayloadAction<{
        gold?: number;
        gems?: number;
        experience?: number;
      }>,
    ) => {
      const { gold, gems, experience } = action.payload;
      if (gold) state.gold += gold;
      if (gems) state.gems += gems;
      if (experience) {
        state.experience += experience;
        let nextLevelXp = state.level * 100;
        while (state.experience >= nextLevelXp) {
          state.experience -= nextLevelXp;
          state.level += 1;
          nextLevelXp = state.level * 100;
        }
      }
    },
    acknowledgeLevelUp: (state) => {
      // Sync the levels
      const levelsGained = state.level - state.lastSeenLevel;
      if (levelsGained > 0) {
        state.lastSeenLevel = state.level;
        // Grant rewards: 100 Gems, 300 Gold per level?
        // The prompt says "reward the user with 100Gems and 300 Gold".
        // Let's assume this fixed amount per level up.
        state.gems += 100 * levelsGained;
        state.gold += 300 * levelsGained;
      }
    },
  },
});

export const {
  setPlayerState,
  addGems,
  spendGems,
  addGold,
  spendGold,
  addCardToInventory,
  consumeCardsForXp,
  setProfileInfo,
  setActiveProfilePic,
  unlockProfilePic,
  increaseBattleTier,
  addPlayerExp,
  addRewards,
  acknowledgeLevelUp,
} = playerSlice.actions;
export default playerSlice.reducer;
