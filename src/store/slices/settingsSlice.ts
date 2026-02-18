import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  isBgmMuted: boolean;
  isSfxMuted: boolean;
}

const initialState: SettingsState = {
  isBgmMuted: false,
  isSfxMuted: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleBgmMute: (state) => {
      state.isBgmMuted = !state.isBgmMuted;
    },
    toggleSfxMute: (state) => {
      state.isSfxMuted = !state.isSfxMuted;
    },
    setSettings: (state, action: PayloadAction<SettingsState>) => {
      return action.payload;
    },
  },
});

export const { toggleBgmMute, toggleSfxMute, setSettings } =
  settingsSlice.actions;

export default settingsSlice.reducer;
