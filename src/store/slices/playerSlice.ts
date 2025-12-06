import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Card, Resource } from "../../types/game";

interface PlayerState {
  gems: number;
  gold: number;
  inventory: Card[];
}

const initialState: PlayerState = {
  gems: 1000, // Initial starting gems
  gold: 0,
  inventory: [],
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerState: (state, action: PayloadAction<PlayerState>) => {
      return action.payload;
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
    consumeDuplicatesForLevelUp: (
      state,
      action: PayloadAction<{
        targetInstanceId: string;
        consumedInstanceIds: string[];
        targetLevel: number;
      }>
    ) => {
      const { targetInstanceId, consumedInstanceIds, targetLevel } =
        action.payload;

      // 1. Update target card level
      const targetCard = state.inventory.find(
        (c) => c.instanceId === targetInstanceId
      );
      if (targetCard) {
        targetCard.level = targetLevel;
      }

      // 2. Remove consumed cards
      state.inventory = state.inventory.filter(
        (c) => !consumedInstanceIds.includes(c.instanceId || "")
      );
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
  consumeDuplicatesForLevelUp,
} = playerSlice.actions;
export default playerSlice.reducer;
