"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import profileIcons from "../../../config/profileIcons.json";
import { setActiveProfilePic } from "../../../store/slices/playerSlice";
import { RootState } from "../../../store/store";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const dispatch = useDispatch();
  const {
    name,
    tag,
    activeProfilePicId,
    unlockedProfilePicIds,
    level,
    experience,
  } = useSelector((state: RootState) => state.player);

  const [showIconSelector, setShowIconSelector] = useState(false);

  // Find active profile icon object
  const activeIcon =
    profileIcons.find((icon) => icon.id === activeProfilePicId) ||
    profileIcons[0];

  // XP Calculation (Assuming 100 XP per level as per playerSlice)
  const xpNeeded = level * 100;
  const xpProgress = (experience / xpNeeded) * 100;

  const handleIconSelect = (iconId: string) => {
    dispatch(setActiveProfilePic(iconId));
    setShowIconSelector(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Main Profile Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#Fdfcf8] rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl overflow-hidden flex flex-col items-center gap-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Profile Picture */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#6A9A6A] shadow-lg relative">
            <Image
              src={activeIcon.imagePath}
              alt={activeIcon.name}
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={() => setShowIconSelector(true)}
            className="absolute bottom-0 right-0 bg-[#2a3b3b] text-white p-2 rounded-full shadow-md hover:bg-[#1a2e2e] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
          </button>
        </div>

        {/* Name & Tag */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1a2e2e]">{name}</h2>
          <p className="text-[#5F5A46] font-medium">{tag}</p>
        </div>

        {/* Level & XP */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-sm font-bold text-[#1a2e2e]">
              Level {level}
            </span>
            <span className="text-xs font-medium text-[#5F5A46]">
              {experience} / {xpNeeded} XP
            </span>
          </div>
          <div className="w-full h-3 bg-[#E0DCC0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6A9A6A]"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats / Badges Placeholder (Optional based on image) */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2">
          {/* Example placeholders */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square bg-[#EDE8D0] rounded-xl flex items-center justify-center opacity-50"
            >
              <span className="text-2xl">🏆</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Icon Selector Bottom Sheet */}
      <AnimatePresence>
        {showIconSelector && (
          <>
            {/* Sheet Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIconSelector(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#Fdfcf8] rounded-t-3xl z-[70] p-6 pb-12 flex flex-col gap-4 pb-26"
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-2" />
              <h3 className="text-xl font-bold text-[#1a2e2e] text-center">
                Select Icon
              </h3>

              <div className="grid grid-cols-3 gap-4 overflow-y-auto p-2">
                {profileIcons.map((icon) => {
                  const isUnlocked = (unlockedProfilePicIds || []).includes(
                    icon.id
                  );
                  const isActive = activeProfilePicId === icon.id;

                  return (
                    <button
                      key={icon.id}
                      disabled={!isUnlocked}
                      onClick={() => handleIconSelect(icon.id)}
                      className={`relative aspect-square rounded-full overflow-hidden border-4 transition-all ${
                        isActive
                          ? "border-[#6A9A6A] scale-105 shadow-lg"
                          : isUnlocked
                          ? "border-transparent hover:border-[#E0DCC0]"
                          : "border-transparent opacity-50 grayscale cursor-not-allowed"
                      }`}
                    >
                      <Image
                        src={icon.imagePath}
                        alt={icon.name}
                        fill
                        className="object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-[#6A9A6A]/20 flex items-center justify-center">
                          <div className="w-6 h-6 bg-[#6A9A6A] rounded-full flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
