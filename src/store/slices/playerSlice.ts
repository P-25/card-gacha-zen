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
      // We can add logic here to handle duplicates (e.g., convert to fragments)
      // For now, just add to list
      state.inventory.push(action.payload);
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
} = playerSlice.actions;
export default playerSlice.reducer;
