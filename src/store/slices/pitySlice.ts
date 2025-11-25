import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlayerPityState } from "../../types/game";

// Map banner ID to its pity state
interface PityStoreState {
  [bannerId: string]: PlayerPityState;
}

const initialState: PityStoreState = {};

export const pitySlice = createSlice({
  name: "pity",
  initialState,
  reducers: {
    setPityState: (state, action: PayloadAction<PityStoreState>) => {
      return action.payload;
    },
    updatePity: (
      state,
      action: PayloadAction<{ bannerId: string; pityState: PlayerPityState }>
    ) => {
      const { bannerId, pityState } = action.payload;
      state[bannerId] = pityState;
    },
  },
});

export const { setPityState, updatePity } = pitySlice.actions;
export default pitySlice.reducer;
