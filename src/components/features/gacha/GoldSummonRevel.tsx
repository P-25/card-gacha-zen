/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DEFAULT PATHS ---
const DEFAULT_PATHS = {
  full: "/assets/summon_gold_gem.png",
  broken: "/assets/destroyed_golden_gem.png",
};

interface GoldSummonRevelProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function GoldSummonRevel({
  onComplete,
  autoStart = false,
}: GoldSummonRevelProps) {
  const [images, setImages] = useState(DEFAULT_PATHS);
  const [errors, setErrors] = useState({ full: false, broken: false });
  const [stage, setStage] = useState("idle");

  // Preload images
  useEffect(() => {
    Object.values(images).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  const handleSummonClick = () => {
    if (stage !== "idle") return;

    // 1. Tension (0s - 0.5s): Shake animation
    setStage("tension");

    // 2. Impact & Swap (0.5s): Image swaps instantly
    setTimeout(() => setStage("aftermath"), 500);

    // 3. Gone (3.5s): Cleanup
    setTimeout(() => setStage("gone"), 3500);
  };

  const resetSummon = () => {
    setStage("idle");
  };

  // Auto-start logic
  // useEffect(() => {
  //   if (autoStart && stage === "idle") {
  //     // Small delay to ensure mount
  //     const timer = setTimeout(() => {
  //       handleSummonClick();
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [autoStart, stage]); // Removed handleSummonClick from dependency to avoid infinite loop if not memoized, but since it's defined inside component it changes every render.
  // Better to disable exhaustiveness check or memoize it. But moving it up fixes the crash.

  // Completion logic
  useEffect(() => {
    if (stage === "gone" && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000); // Wait a bit after "gone" before calling complete
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  // --- ERROR HANDLING ---
  const handleImageError = (key: any) => {
    setErrors((prev) => ({ ...prev, [key]: true }));
  };

  const handleFileUpload = (key: any, event: any) => {
    const file = event.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImages((prev) => ({ ...prev, [key]: objectUrl }));
      setErrors((prev) => ({ ...prev, [key]: false }));
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-transparent overflow-hidden relative font-sans z-50">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black pointer-events-none" />

      {/* --- ANIMATION CONTAINER --- */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {/* STAGE 1: INTACT CRYSTAL (Idle & Tension) */}
          {(stage === "idle" || stage === "tension") && (
            <motion.img
              key="crystal-full"
              src={images.full}
              onError={() => handleImageError("full")}
              onClick={handleSummonClick}
              alt="Summon Crystal"
              className="absolute inset-0 w-full h-full object-contain cursor-pointer drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] z-20"
              initial={{ opacity: 1, scale: 1 }}
              animate={stage === "idle" ? "idle" : "tension"}
              // Exit immediately (duration: 0) for a hard cut
              exit={{ opacity: 0, transition: { duration: 0 } }}
              variants={{
                idle: {
                  scale: 2,
                  x: 0,
                  y: [0, -10, 0],
                  transition: {
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                  },
                },
                tension: {
                  scale: 2,
                  y: 0,
                  // Rapid shake (5px left/right)
                  x: [-5, 5, -5, 5, -5, 5, -5, 5, 0],
                  filter: "brightness(1.5)",
                  // transition: { duration: 0.5, ease: "linear" },
                },
              }}
            />
          )}

          {/* STAGE 2: AFTERMATH (Destroyed Crystal) */}
          {stage === "aftermath" && (
            <>
              {/* GOLDEN FLASH: Starts opaque, fades out */}
              <motion.div
                key="golden-flash"
                className="absolute inset-0 z-50 bg-[radial-gradient(circle,var(--tw-gradient-stops))] from-yellow-300 via-orange-500 to-transparent mix-blend-screen"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              {/* DESTROYED IMAGE: Appears instantly under flash, then expands */}
              <motion.img
                key="crystal-destroyed"
                src={images.broken}
                onError={() => handleImageError("broken")}
                alt="Destroyed Crystal"
                className="absolute inset-0 w-full h-full object-contain z-30"
                // Start scale 1 (match previous), fully opaque
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: 1,
                  scale: 2, // Simulate expansion of debris
                  x: [-2, 2, -2, 2, 0], // Residual shake
                }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                transition={{
                  scale: { duration: 3, ease: "easeOut" },
                  x: { duration: 0.5 },
                }}
              />
            </>
          )}
        </AnimatePresence>
      </div>

      {/* --- DEBUG & RESET UI --- */}
      {hasErrors && (
        <div className="absolute top-4 right-4 z-50 bg-gray-800 p-4 rounded-lg shadow-xl border border-red-500 max-w-sm">
          <h3 className="text-red-400 font-bold mb-2">⚠️ Images Not Found</h3>
          <div className="space-y-3">
            {errors.full && (
              <input
                type="file"
                onChange={(e) => handleFileUpload("full", e)}
                className="text-xs text-gray-400"
              />
            )}
            {errors.broken && (
              <input
                type="file"
                onChange={(e) => handleFileUpload("broken", e)}
                className="text-xs text-gray-400"
              />
            )}
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {stage === "idle" && !hasErrors && !autoStart && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="absolute bottom-10 text-white text-sm tracking-widest uppercase"
        >
          Tap the Crystal
        </motion.p>
      )}
    </div>
  );
}
