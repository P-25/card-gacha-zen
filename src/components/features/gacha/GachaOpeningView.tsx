"use client";

import ChestAnimation from "@/components/features/gacha/ChestAnimation";

interface GachaOpeningViewProps {
  isOpening: boolean;
  isOpened: boolean;
}

export default function GachaOpeningView({
  isOpening,
  isOpened,
}: GachaOpeningViewProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-24">
      <ChestAnimation
        isOpening={isOpening}
        isOpened={isOpened}
        onOpen={() => {}} // Already triggered by parent state
      />
    </div>
  );
}
