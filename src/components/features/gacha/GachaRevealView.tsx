"use client";

import CardReveal from "@/components/features/gacha/CardReveal";

import { Card, Resource } from "@/types/game";

interface GachaRevealViewProps {
  onReset: () => void;
  onFinish: () => void;
  results: (Card | Resource)[];
}

export default function GachaRevealView({
  onReset,
  onFinish,
  results,
}: GachaRevealViewProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <CardReveal onReset={onReset} onFinish={onFinish} results={results} />
    </div>
  );
}
