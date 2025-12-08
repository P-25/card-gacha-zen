import { Rarity } from "@/types/game";

export const getRarityBorderColor = (rarity: Rarity): string => {
  switch (rarity) {
    case "COMMON":
      return "#A8A29E"; // Stone Grey: Soft, matte ash
    case "UNCOMMON":
      return "#6A9A6A"; // Sage Green: Desaturated, earthy green
    case "RARE":
      return "#5B7C99"; // Slate Blue: Cool, dusty blue
    default:
      return "transparent";
  }
};
