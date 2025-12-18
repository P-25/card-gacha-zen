"use client";

import CommonButton from "@/components/ui/buttons/CommonButton";
import RateUpSummonSection from "./RateUpSummon/RateUpSummonSection";

import { Card, Resource } from "@/types/game";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";

interface GachaSelectionProps {
  onSummon: (type: "gem", count: number, results?: (Card | Resource)[]) => void;
}

export default function GachaSelection({ onSummon }: GachaSelectionProps) {
  const router = useRouter();
  return (
    <>
      <RateUpSummonSection onSummon={onSummon} />
    </>
  );
}
