import { configureStore, Middleware } from "@reduxjs/toolkit";
import playerReducer, { setPlayerState } from "./slices/playerSlice";
import pityReducer, { setPityState } from "./slices/pitySlice";
import settingsReducer, { setSettings } from "./slices/settingsSlice";
import questReducer, { setQuestState } from "./slices/questSlice";
import { saveSecureData, loadSecureData } from "../lib/storage";

// Middleware to save state on changes
const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Save specific slices
  saveSecureData("player_state", state.player);
  saveSecureData("pity_state", state.pity);
  saveSecureData("settings_state", state.settings);
  saveSecureData("quest_state", state.quest);

  return result;
};

export const store = configureStore({
  reducer: {
    player: playerReducer,
    pity: pityReducer,
    settings: settingsReducer,
    quest: questReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistenceMiddleware),
});

// Function to hydrate store from storage
export const hydrateStore = () => {
  // Load everything from local storage FIRST before dispatching any actions.
  // Because our persistence middleware triggers on ANY action and saves ALL state slices,
  // we must ensure that no slice is prematurely overwritten with its initialState before it is loaded.
  const savedPlayer = loadSecureData<any>("player_state");
  const savedPity = loadSecureData<any>("pity_state");
  const savedSettings = loadSecureData<any>("settings_state");
  const savedQuest = loadSecureData<any>("quest_state");

  if (savedPlayer) {
    store.dispatch(setPlayerState(savedPlayer));
  }
  if (savedPity) {
    store.dispatch(setPityState(savedPity));
  }
  if (savedSettings) {
    store.dispatch(setSettings(savedSettings));
  }
  if (savedQuest) {
    store.dispatch(setQuestState(savedQuest));
  }
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
