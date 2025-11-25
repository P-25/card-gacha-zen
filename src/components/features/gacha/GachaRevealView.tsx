"use client";

import CardReveal from "@/components/features/gacha/CardReveal";

import { Card, Resource } from "@/types/game";

interface GachaRevealViewProps {
  onReset: () => void;
  results: (Card | Resource)[];
}

export default function GachaRevealView({
  onReset,
  results,
}: GachaRevealViewProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-24">
      <CardReveal onReset={onReset} results={results} />
    </div>
  );
}
