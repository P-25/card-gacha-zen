import React, { useState } from "react";

// --- Types ---
interface CardInfoLevelProgressBarProps {
  level: number | string;
  currentXp: number;
  requiredXp: number;
  className?: string;
}

// --- The CSS Component ---
const CardInfoLevelProgressBar: React.FC<CardInfoLevelProgressBarProps> = ({
  level,
  currentXp,
  requiredXp,
  className = "",
}) => {
  // Calculate percentage for width
  const progressPercent =
    Math.min(Math.max(currentXp / requiredXp, 0), 1) * 100;

  return (
    <div className="p-1 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="relative z-10 w-full">
        <div
          className={`relative h-[40px] flex items-center select-none ${className}`}
        >
          {/* 2. Main Bar Container */}
          <div className="relative flex-grow ml-[10px] h-[25px] z-10">
            {/* Border Container */}
            <div className="absolute inset-0 bg-[#1a1a1a] rounded-lg border-[3px] border-black overflow-hidden flex">
              {/* Green Fill */}
              <div
                className="h-full bg-[#34a334] relative transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Glossy Highlight (Top Half) */}
                <div className="absolute top-0 left-0 w-full h-[45%] bg-[#7afa7a]" />
              </div>
            </div>

            {/* Text Layer - Sitting on top of the bar */}
            <div className="absolute inset-0 flex items-center justify-center px-4 z-20 pointer-events-none">
              {/* "Level" Label - Pushed right to clear the badge */}
              {/* <span
                className="font-black text-white text-md ml-2 tracking-wide"
                style={{
                  WebkitTextStroke: "4px black",
                  paintOrder: "stroke fill",
                }}
              >
                Level
              </span> */}

              {/* XP Values */}
              <span
                className="font-black text-white text-sm tracking-wide"
                style={{
                  WebkitTextStroke: "3px black",
                  paintOrder: "stroke fill",
                }}
              >
                {Math.floor(currentXp)} / {requiredXp}
              </span>
            </div>
          </div>

          {/* 3. The Badge (Absolute Left) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 filter">
            {/* Badge Circle Container */}
            <div
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center border-[2px] border-[#ffd700] relative"
              style={{
                // 3D Sphere Gradient
                background:
                  "radial-gradient(circle at 30% 30%, #d0a0ff 0%, #9d4edd 30%, #3c096c 100%)",
                // Outer black ring using box-shadow
                boxShadow: "0 0 0 2px black",
              }}
            >
              <span
                className="font-black text-white text-md z-10 relative top-[1px]"
                style={{
                  WebkitTextStroke: "4px black",
                  paintOrder: "stroke fill",
                }}
              >
                {level}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardInfoLevelProgressBar;
