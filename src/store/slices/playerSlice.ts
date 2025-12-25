import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card, Resource } from "../../types/game";

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
}

const initialState: PlayerState = {
  gems: 1000, // Initial starting gems
  gold: 0,
  inventory: [],
  level: 10,
  experience: 0,
  // Default Profile
  name: "Trainer",
  tag: "#1234",
  activeProfilePicId: "default_1",
  unlockedProfilePicIds: ["default_1"],
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

      // Ensure Profile Info exists (migration)
      if (!newState.name) newState.name = "Trainer";
      if (!newState.tag) newState.tag = "#1234";
      if (!newState.activeProfilePicId)
        newState.activeProfilePicId = "default_1";
      if (!newState.unlockedProfilePicIds)
        newState.unlockedProfilePicIds = ["default_1"];

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
      }>
    ) => {
      const { targetInstanceId, consumedInstanceIds } = action.payload;

      // 1. Find target card
      const targetCard = state.inventory.find(
        (c) => c.instanceId === targetInstanceId
      );
      if (!targetCard) return;

      // 2. Calculate Total XP from consumed cards
      let totalXpToAdd = 0;

      state.inventory.forEach((c) => {
        if (consumedInstanceIds.includes(c.instanceId || "")) {
          // XP Values: Common=100, Uncommon=300, Rare=1000
          let baseXp = 100;
          if (c.rarity === "COMMON") baseXp = 100;
          else if (c.rarity === "UNCOMMON") baseXp = 300;
          else if (c.rarity === "RARE") baseXp = 1000;

          // Scale by level
          const levelMultiplier = c.level || 1;
          totalXpToAdd += baseXp * levelMultiplier;
        }
      });

      // 3. Remove consumed cards
      state.inventory = state.inventory.filter(
        (c) => !consumedInstanceIds.includes(c.instanceId || "")
      );

      // 4. Apply XP and Level Up Logic
      // XP Required per Level = CurrentLevel * 100
      // Max Level = state.level (Player Level)

      // Re-find target card in the new inventory array (safe for Immer)
      const updatedTarget = state.inventory.find(
        (c) => c.instanceId === targetInstanceId
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
      action: PayloadAction<{ name: string; tag: string }>
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
} = playerSlice.actions;
export default playerSlice.reducer;
