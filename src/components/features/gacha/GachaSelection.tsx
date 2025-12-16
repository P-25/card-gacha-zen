"use client";

import RateUpSummonSection from "./RateUpSummon/RateUpSummonSection";

import { Card, Resource } from "@/types/game";

interface GachaSelectionProps {
  onSummon: (type: "gem", count: number, results?: (Card | Resource)[]) => void;
}

export default function GachaSelection({ onSummon }: GachaSelectionProps) {
  return (
    <>
      <RateUpSummonSection onSummon={onSummon} />
    </>
  );
}
