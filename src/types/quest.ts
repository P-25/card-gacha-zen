export type QuestType = "DAILY" | "WEEKLY" | "ALL";
export type QuestRequirementType =
  | "BATTLE_WIN"
  | "SUMMON"
  | "CARD_LEVEL_UP"
  | "LOGIN";

export interface QuestReward {
  gold?: number;
  gems?: number;
  exp?: number;
}

export interface QuestConfig {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  requirementType: QuestRequirementType;
  targetCount: number;
  reward: QuestReward;
}

export interface ProgressRewardConfig {
  id: string;
  type: QuestType;
  requiredCompletedCount: number;
  reward: QuestReward;
}

export interface QuestDataConfig {
  quests: QuestConfig[];
  progressRewards: ProgressRewardConfig[];
}
