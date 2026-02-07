export interface OpponentDeckRule {
  rarity: "COMMON" | "UNCOMMON" | "RARE";
  level: number;
  count: number;
}

export interface BattleMode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  fallbackIcon: string;
  color: string;
  borderColor: string;
  requiredPower?: number;
  opponentDeckRules?: OpponentDeckRule[];
}

export const BATTLE_MODES: BattleMode[] = [
  {
    id: "beginner",
    title: "BEGINNER SOLO",
    subtitle: "UNRAVEL THE MYSTERIES",
    icon: "/assets/icons/easy.webp",
    fallbackIcon: "🛡️",
    color: "bg-[#FDF6E3]",
    borderColor: "border-[#D4C5A5]",
    requiredPower: 100,
    opponentDeckRules: [
      { rarity: "COMMON", level: 3, count: 1 },
      { rarity: "COMMON", level: 1, count: 2 },
    ],
  },
  {
    id: "intermediate",
    title: "INTERMEDIATE SOLO",
    subtitle: "UNRAVEL THE MYSTERIES",
    icon: "/assets/icons/hard.webp",
    fallbackIcon: "⚔️",
    color: "bg-[#FDF6E3]",
    borderColor: "border-[#D4C5A5]",
    requiredPower: 225,
    opponentDeckRules: [
      { rarity: "RARE", level: 1, count: 2 },
      { rarity: "UNCOMMON", level: 6, count: 1 },
    ],
  },
  {
    id: "advanced",
    title: "ADVANCED SOLO",
    subtitle: "CHALLENGE AND REWARDS.",
    icon: "/assets/icons/very-hard.webp",
    fallbackIcon: "🐉",
    color: "bg-[#FDF6E3]",
    borderColor: "border-[#D4C5A5]",
    requiredPower: 420,
    opponentDeckRules: [
      { rarity: "RARE", level: 12, count: 2 },
      { rarity: "RARE", level: 11, count: 1 },
    ],
  },
  {
    id: "expert",
    title: "EXPERT SOLO",
    subtitle: "CHALLENGE AND REWARDS.",
    icon: "/assets/icons/expert.webp",
    fallbackIcon: "👑",
    color: "bg-[#FDF6E3]",
    borderColor: "border-[#D4C5A5]",
    requiredPower: 600,
    opponentDeckRules: [{ rarity: "RARE", level: 22, count: 3 }],
  },
];

export const getBattleModeById = (id: string): BattleMode | undefined => {
  return BATTLE_MODES.find((mode) => mode.id === id);
};
