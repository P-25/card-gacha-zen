import { configureStore, Middleware } from "@reduxjs/toolkit";
import playerReducer, { setPlayerState } from "./slices/playerSlice";
import pityReducer, { setPityState } from "./slices/pitySlice";
import { saveSecureData, loadSecureData } from "../lib/storage";

// Middleware to save state on changes
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Save specific slices
  saveSecureData("player_state", state.player);
  saveSecureData("pity_state", state.pity);

  return result;
};

export const store = configureStore({
  reducer: {
    player: playerReducer,
    pity: pityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});

// Function to hydrate store from storage
export const hydrateStore = () => {
  const savedPlayer = loadSecureData<any>("player_state");
  if (savedPlayer) {
    store.dispatch(setPlayerState(savedPlayer));
  }

  const savedPity = loadSecureData<any>("pity_state");
  if (savedPity) {
    store.dispatch(setPityState(savedPity));
  }
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
