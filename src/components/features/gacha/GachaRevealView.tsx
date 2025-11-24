"use client";

import CardReveal from "@/components/features/gacha/CardReveal";

interface GachaRevealViewProps {
  onReset: () => void;
}

export default function GachaRevealView({ onReset }: GachaRevealViewProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-24">
      <CardReveal onReset={onReset} />
    </div>
  );
}
