"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import {
  claimQuestReward,
  claimProgressReward,
} from "../store/slices/questSlice";
import { addRewards } from "../store/slices/playerSlice";
import questConfigData from "../config/quests.json";
import { QuestType } from "../types/quest";
import Image from "next/image";

export default function QuestScreen() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<QuestType>("DAILY");

  const { progress, claimedQuests, claimedProgressRewards } = useSelector(
    (state: RootState) => state.quest,
  );

  const tabs: { id: QuestType; label: string }[] = [
    { id: "DAILY", label: "DAILY" },
    { id: "WEEKLY", label: "WEEKLY" },
    { id: "ALL", label: "ACHIEVEMENTS" },
  ];

  // Filter quests and progress config
  const currentQuests = questConfigData.quests.filter(
    (q) => q.type === activeTab,
  );
  const currentProgressRewards = questConfigData.progressRewards
    .filter((p) => p.type === activeTab)
    .sort((a, b) => a.requiredCompletedCount - b.requiredCompletedCount);

  // Calculate completed quests for the current tab
  const completedCount = currentQuests.filter(
    (q) => (progress[q.id] || 0) >= q.targetCount,
  ).length;

  const maxProgressNeeded = currentProgressRewards.length
    ? currentProgressRewards[currentProgressRewards.length - 1]
        .requiredCompletedCount
    : 1;

  const handleClaimQuest = (questId: string, reward: any) => {
    dispatch(claimQuestReward(questId));
    dispatch(addRewards(reward));
  };

  const handleClaimProgressReward = (rewardId: string, reward: any) => {
    dispatch(claimProgressReward(rewardId));
    dispatch(addRewards(reward));
  };

  const handleClearStorage = () => {
    if (
      window.confirm(
        "Are you sure you want to clear local storage? This will reset your game progress.",
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#F1EFE7] font-sans">
      {/* Background Decor (Parchment look) */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      {/* Header Tabs Area - Light Background */}
      <div className="relative z-10 pt-4 px-4 pb-2 bg-gradient-to-b from-[#FAF8F2] to-[#F1EFE7] rounded-b-3xl shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
        {/* Secret Reset Button Top Right */}
        <button
          onClick={handleClearStorage}
          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500/10 text-transparent hover:text-red-500 text-[8px] flex justify-center items-center z-50 overflow-hidden"
        >
          X
        </button>

        {/* Tabs */}
        <div className="flex bg-[#FAF8F2] p-1 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),_0_2px_10px_rgba(0,0,0,0.02)] border border-[#E5E0D8]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-xl text-sm font-black tracking-wider transition-all relative ${
                  isActive
                    ? "text-[#FCD34D] bg-[#2A3441] shadow-[0_4px_15px_rgba(42,52,65,0.4)] border-b-2 border-[#1E252F]"
                    : "text-[#9CA3AF] hover:text-[#4B5563]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Reset Timer Subtitle Placeholder */}
        <div className="mt-3 text-center text-[#6B7280] text-sm font-bold flex justify-center items-center gap-2">
          <span className="text-lg">🕒</span> Resets in: 14h 23m
        </div>
      </div>

      <div className="flex-1 relative z-10 overflow-y-auto px-4 pb-24 mt-2 no-scrollbar">
        {/* Progress Rewards Bar (Dark Theme Card) */}
        {currentProgressRewards.length > 0 && (
          <div className="mb-4 pt-4 pb-6 px-5 rounded-2xl bg-[#4A5565] border-b-4 border-[#374151] shadow-[0_8px_15px_rgba(0,0,0,0.1)] relative overflow-visible mt-2">
            <h3 className="text-sm font-black tracking-wider text-white uppercase mb-6 drop-shadow-md">
              {activeTab === "DAILY"
                ? "Daily Milestones"
                : activeTab === "WEEKLY"
                  ? "Weekly Milestones"
                  : "Milestones"}
            </h3>

            <div className="relative h-5 bg-[#2A3441] rounded-full overflow-visible border-[3px] border-[#374151] shadow-inner mt-4">
              {/* Progress Fill */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#9333EA] to-[#FCA5A5] rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (completedCount / maxProgressNeeded) * 100)}%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />

              {/* Reward Nodes (Chests) */}
              {currentProgressRewards.map((rewardItem) => {
                const position =
                  (rewardItem.requiredCompletedCount / maxProgressNeeded) * 100;
                const isUnlocked =
                  completedCount >= rewardItem.requiredCompletedCount;
                const isClaimed = claimedProgressRewards.includes(
                  rewardItem.id,
                );

                return (
                  <div
                    key={rewardItem.id}
                    className="absolute top-1/2 -translate-y-[60%] -translate-x-1/2 flex flex-col items-center z-10"
                    style={{ left: `${position}%` }}
                  >
                    <button
                      onClick={() => {
                        if (isUnlocked && !isClaimed)
                          handleClaimProgressReward(
                            rewardItem.id,
                            rewardItem.reward,
                          );
                      }}
                      disabled={!isUnlocked || isClaimed}
                      className={`relative w-16 h-16 flex items-center justify-center transition-all duration-300 ${
                        !isUnlocked
                          ? "opacity-60 grayscale hover:scale-100"
                          : isClaimed
                            ? "opacity-40"
                            : "hover:scale-110 active:scale-95 animate-pulse"
                      }`}
                    >
                      <div className="relative w-full h-full drop-shadow-xl">
                        {/* Chest Graphic placeholder, using CSS styling for now */}
                        <div
                          className={`w-full h-full rounded-md ${isUnlocked && !isClaimed ? "bg-purple-500 shadow-[0_0_20px_#A855F7]" : isClaimed ? "bg-gray-400" : "bg-gray-300"} flex items-center justify-center border-4 ${isUnlocked && !isClaimed ? "border-yellow-400" : "border-gray-500"}`}
                        >
                          <span className="text-2xl">
                            {isClaimed ? "✔️" : "🎁"}
                          </span>
                        </div>
                      </div>
                    </button>
                    <span className="absolute -bottom-6 text-[11px] font-bold text-[#D1D5DB] whitespace-nowrap">
                      Complete{" "}
                      <span className="text-[#FCD34D]">
                        {rewardItem.requiredCompletedCount}
                      </span>{" "}
                      Quests
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quests List */}
        <div className="space-y-3 mt-8">
          <AnimatePresence mode="wait">
            {currentQuests.map((quest, index) => {
              const currentProg = Math.min(
                progress[quest.id] || 0,
                quest.targetCount,
              );
              const isCompleted = currentProg >= quest.targetCount;
              const isClaimed = claimedQuests.includes(quest.id);

              return (
                <motion.div
                  key={`${activeTab}-${quest.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-3 rounded-2xl border-2 backdrop-blur-md overflow-hidden transition-colors flex items-center gap-3 ${
                    isClaimed
                      ? "bg-[#D1CFC7] border-[#BDBAB0] opacity-70"
                      : "bg-[#FFFDF6] border-[#E8E2D5] shadow-[0_8px_20px_rgba(0,0,0,0.06),_inset_0_2px_4px_rgba(255,255,255,0.8)]"
                  }`}
                >
                  {/* Icon Area */}
                  <div
                    className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-3xl  ${
                      isCompleted && !isClaimed
                        ? "drop-shadow-lg"
                        : "opacity-80"
                    }`}
                  >
                    {quest.requirementType === "BATTLE_WIN"
                      ? "⚔️"
                      : quest.requirementType === "SUMMON"
                        ? "🌪️"
                        : quest.requirementType === "LOGIN"
                          ? "💰"
                          : "🐉"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 mt-1">
                    <h4
                      className={`text-[15px] font-black tracking-wide uppercase ${isClaimed ? "text-[#6B7280]" : "text-[#1F2937]"}`}
                    >
                      {quest.title}
                    </h4>
                    <p
                      className={`text-[13px] leading-tight mb-2 ${isClaimed ? "text-[#9CA3AF]" : "text-[#4B5563]"}`}
                    >
                      {quest.description}
                    </p>

                    {/* Progress Bar (Pill style) */}
                    <div className="flex flex-col gap-1 w-[80%]">
                      <div className="relative h-4 bg-[#2A3441] border-[2px] border-[#1E252F] rounded-full overflow-hidden shadow-inner flex items-center justify-center">
                        <motion.div
                          className={`absolute inset-y-0 left-0 ${isCompleted ? "bg-gradient-to-r from-[#F59E0B] to-[#FCD34D]" : "bg-gradient-to-r from-[#8B5CF6] to-[#FCD34D]"}`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(currentProg / quest.targetCount) * 100}%`,
                          }}
                          transition={{ duration: 0.8 }}
                        />
                        <span className="relative z-10 text-[10px] font-black text-white drop-shadow-md pb-[1px]">
                          {currentProg}/{quest.targetCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rewards & Button Section */}
                  <div className="shrink-0 flex flex-col items-center justify-between w-[90px] self-stretch py-1 border-l-2 border-dashed border-[#D1D5DB] pl-2 gap-2">
                    {/* Rewards Summary */}
                    <div className="flex gap-1 justify-center items-center w-full mt-1">
                      {quest.reward.gold && (
                        <div className="flex items-center gap-[2px] font-black text-[#1F2937] text-[13px]">
                          <span className="text-[12px] border border-yellow-500 rounded-full bg-yellow-300 w-4 h-4 flex items-center justify-center -mr-0.5">
                            🪙
                          </span>
                          <span className="opacity-80">+</span>
                          {quest.reward.gold}
                        </div>
                      )}
                      {quest.reward.gems && (
                        <div className="flex items-center gap-[2px] font-black text-[#1F2937] text-[13px]">
                          <span
                            className="text-[12px] border border-purple-500 rounded-full bg-purple-400 w-4 h-4 flex items-center justify-center -mr-0.5"
                            style={{
                              filter: "hue-rotate(30deg) saturate(1.5)",
                            }}
                          >
                            💎
                          </span>
                          <span className="opacity-80">+</span>
                          {quest.reward.gems}
                        </div>
                      )}
                    </div>

                    {/* Interaction Button */}
                    {isClaimed ? (
                      <button className="w-full text-xs font-black uppercase tracking-wider text-[#9CA3AF] opacity-80 mt-auto flex items-center justify-center gap-1">
                        CLAIMED <span className="text-lg">✔️</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          isCompleted
                            ? handleClaimQuest(quest.id, quest.reward)
                            : null
                        }
                        className={`w-full py-1.5 rounded-lg border-2 border-b-4 font-black text-[13px] tracking-wider uppercase transition-all shadow-sm active:border-b-2 active:translate-y-[2px] mt-auto ${
                          isCompleted
                            ? "bg-[#FFFBEB] text-[#1F2937] border-[#FCD34D] hover:bg-[#FEF3C7]"
                            : "bg-[#FDFBF7] text-[#1F2937] border-[#E8E2D5] border-b-[#D1CFC7] hover:bg-[#F3F4F6]"
                        }`}
                      >
                        {isCompleted ? "CLAIM" : "GO"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {currentQuests.length === 0 && (
            <div className="py-10 text-center text-[#9CA3AF] font-bold italic">
              No quests available here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
