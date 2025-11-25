"use client";

import TopBar from "../home/TopBar";

interface CurrencyHeaderProps {
  gold: number;
  gems: number;
}

export default function CurrencyHeader({ gold, gems }: CurrencyHeaderProps) {
  return <TopBar />;
}
