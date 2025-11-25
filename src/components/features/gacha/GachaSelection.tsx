"use client";

import { useEffect, useState } from "react";
import GoldSummonSection from "./GoldSummom/GoldSummonSection";
import RateUpSummonSection from "./RateUpSummon/RateUpSummonSection";

interface GachaSelectionProps {
  onSummon: (type: "gem" | "gold", count: number) => void;
}

export default function GachaSelection({ onSummon }: GachaSelectionProps) {
  const [activeBanner, setActiveBanner] = useState<"gem" | "gold">("gold");

  useEffect(() => {
    console.log(`Debug - Active Banner: ${activeBanner}`);
  }, [activeBanner]);

  const onBannerChange = (banner: "gem" | "gold") => {
    setActiveBanner(banner);
  };

  return (
    <>
      {activeBanner === "gem" && (
        <GoldSummonSection
          onSummon={onSummon}
          onBannerChange={() => onBannerChange("gold")}
        />
      )}
      {activeBanner === "gold" && (
        <RateUpSummonSection
          onSummon={onSummon}
          onBannerChange={() => onBannerChange("gem")}
        />
      )}
    </>
  );
}
