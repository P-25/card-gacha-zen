import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QuestRequirementType } from "../../types/quest";
import questConfigData from "../../config/quests.json";

export interface QuestState {
  progress: Record<string, number>; // questId -> current progress count
  claimedQuests: string[]; // questIds that have been claimed
  claimedProgressRewards: string[]; // progressRewardIds that have been claimed
  lastDailyReset: number; // timestamp in ms
  lastWeeklyReset: number; // timestamp in ms
}

const initialState: QuestState = {
  progress: {},
  claimedQuests: [],
  claimedProgressRewards: [],
  lastDailyReset: Date.now(),
  lastWeeklyReset: Date.now(),
};

export const questSlice = createSlice({
  name: "quest",
  initialState,
  reducers: {
    setQuestState: (state, action: PayloadAction<QuestState>) => {
      return { ...initialState, ...action.payload };
    },
    updateQuestProgress: (
      state,
      action: PayloadAction<{ type: QuestRequirementType; amount: number }>,
    ) => {
      // Find all quests that match the requirement type and increment them
      questConfigData.quests.forEach((q) => {
        if (q.requirementType === action.payload.type) {
          // Initialize if not present
          if (state.progress[q.id] === undefined) {
            state.progress[q.id] = 0;
          }
          // Increment
          state.progress[q.id] += action.payload.amount;

          // Cap at targetCount (optional, but good for UI)
          if (state.progress[q.id] > q.targetCount) {
            state.progress[q.id] = q.targetCount;
          }
        }
      });
    },
    claimQuestReward: (state, action: PayloadAction<string>) => {
      if (!state.claimedQuests.includes(action.payload)) {
        state.claimedQuests.push(action.payload);
      }
    },
    claimProgressReward: (state, action: PayloadAction<string>) => {
      if (!state.claimedProgressRewards.includes(action.payload)) {
        state.claimedProgressRewards.push(action.payload);
      }
    },
    checkResets: (state) => {
      const now = new Date();

      // Daily Reset Logic: 12 AM locally
      const lastDaily = new Date(state.lastDailyReset);
      // If the day changed, or year/month changed
      if (
        now.getDate() !== lastDaily.getDate() ||
        now.getMonth() !== lastDaily.getMonth() ||
        now.getFullYear() !== lastDaily.getFullYear()
      ) {
        // Reset daily quests
        questConfigData.quests
          .filter((q) => q.type === "DAILY")
          .forEach((q) => {
            state.progress[q.id] = 0;
            state.claimedQuests = state.claimedQuests.filter(
              (id) => id !== q.id,
            );
          });

        // Reset daily progress rewards
        questConfigData.progressRewards
          .filter((p) => p.type === "DAILY")
          .forEach((p) => {
            state.claimedProgressRewards = state.claimedProgressRewards.filter(
              (id) => id !== p.id,
            );
          });

        state.lastDailyReset = now.getTime();
      }

      // Weekly Reset Logic: We can assume it resets on Sunday (0) or Monday (1). Let's say Sunday 12 AM.
      // A simple check is to see if we've passed a Sunday since lastWeeklyReset, or if difference > 7 days.
      // This is a basic implementation.
      const lastWeekly = new Date(state.lastWeeklyReset);
      // difference in days
      const daysDiff =
        (now.getTime() - lastWeekly.getTime()) / (1000 * 3600 * 24);

      const currentDay = now.getDay();
      const lastDay = lastWeekly.getDay();

      // Reset if more than 7 days have passed, OR we crossed a Sunday (current day is less than last day and days diff is positive, or diff >= 1 and current is Sunday)
      let needsWeeklyReset = false;
      if (daysDiff >= 7) needsWeeklyReset = true;
      else if (currentDay < lastDay && daysDiff > 0) needsWeeklyReset = true; // Crossed Sunday to Monday

      if (needsWeeklyReset) {
        // Reset weekly quests
        questConfigData.quests
          .filter((q) => q.type === "WEEKLY")
          .forEach((q) => {
            state.progress[q.id] = 0;
            state.claimedQuests = state.claimedQuests.filter(
              (id) => id !== q.id,
            );
          });

        // Reset weekly progress rewards
        questConfigData.progressRewards
          .filter((p) => p.type === "WEEKLY")
          .forEach((p) => {
            state.claimedProgressRewards = state.claimedProgressRewards.filter(
              (id) => id !== p.id,
            );
          });

        state.lastWeeklyReset = now.getTime();
      }
    },
  },
});

export const {
  setQuestState,
  updateQuestProgress,
  claimQuestReward,
  claimProgressReward,
  checkResets,
} = questSlice.actions;

export default questSlice.reducer;
