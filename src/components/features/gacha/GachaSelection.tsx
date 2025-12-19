"use client";

import CommonButton from "@/components/ui/buttons/CommonButton";
import RateUpSummonSection from "./RateUpSummon/RateUpSummonSection";

import { Card, Resource } from "@/types/game";

import { motion } from "framer-motion";

import Image from "next/image";
import { AppState } from "@/hooks/useGameState";

interface GachaSelectionProps {
  onSummon: (type: "gem", count: number, results?: (Card | Resource)[]) => void;
  onNavigate: (screen: AppState) => void;
}

export default function GachaSelection({
  onSummon,
  onNavigate,
}: GachaSelectionProps) {
  return (
    <>
      <RateUpSummonSection onSummon={onSummon} onNavigate={onNavigate} />
    </>
  );
}
