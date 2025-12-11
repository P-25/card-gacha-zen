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

export const getStrokeImage = (rarity: string) => {
  switch (rarity) {
    case "RARE":
      return "/assets/icons/rare_stroke.webp";
    case "UNCOMMON":
      return "/assets/icons/uncommon_stroke.webp";
    default:
      return "/assets/icons/common_stroke.webp";
  }
};

export const generateRandomPlayerName = (
  useNumbers: boolean = true
): string => {
  const adjectives = [
    // -- Colors & Elements --
    "Crimson",
    "Azure",
    "Obsidian",
    "Celestial",
    "Verdant",
    "Solar",
    "Lunar",
    "Void",
    "Frost",
    "Ember",
    "Gilded",
    "Silver",
    "Onyx",
    "Crystal",
    "Storm",
    "Thunder",
    "Neon",
    "Midnight",
    "Dawn",
    "Dusk",
    "Abyssal",

    // -- Status & Power --
    "Grand",
    "Noble",
    "Arcane",
    "Savage",
    "Hollow",
    "Silent",
    "Rapid",
    "Apex",
    "Prime",
    "Omega",
    "Mystic",
    "Divine",
    "Feral",
    "Ancient",
    "Radiant",
    "Chaos",
    "Holy",
    "Supreme",
    "Royal",
    "Elite",
    "Legendary",

    // -- Vibe & Personality --
    "Stoic",
    "Wild",
    "Swift",
    "Blind",
    "Lost",
    "Dark",
    "Pale",
    "Iron",
    "Steel",
    "Wicked",
    "Twisted",
    "Broken",
    "Rising",
    "Fallen",
    "Alpha",
    "Brave",
    "Cosmic",
    "Astral",
    "Vengeful",
    "Ethereal",
    "Nameless",
    "Infinite",
  ];

  const nouns = [
    // -- Classes & Roles --
    "Striker",
    "Guardian",
    "Shadow",
    "Hunter",
    "Spirit",
    "Weaver",
    "Captain",
    "Gladiator",
    "Paladin",
    "Rogue",
    "Summoner",
    "Sage",
    "Monk",
    "Bard",
    "Lancer",
    "Sniper",
    "Ronin",
    "Samurai",
    "Ninja",
    "Viking",
    "Nomad",
    "Warlord",
    "Emperor",
    "Oracle",
    "Alchemist",
    "Engineer",
    "Knight",

    // -- Creatures & Avatars --
    "Viper",
    "Lion",
    "Blade",
    "Wolf",
    "Drake",
    "Hawk",
    "Bear",
    "Crow",
    "Tiger",
    "Wyrm",
    "Demon",
    "Angel",
    "Phoenix",
    "Dragon",
    "Griffin",
    "Cobra",
    "Falcon",
    "Raven",
    "Beast",
    "Titan",
    "Hydra",
    "Gargoyle",

    // -- Abstract & Titles --
    "Whisper",
    "Walker",
    "Seeker",
    "Breaker",
    "Dancer",
    "Herald",
    "Warden",
    "Sovereign",
    "Drifter",
    "Phantom",
    "Specter",
    "Soul",
    "Fang",
    "Claw",
    "Shield",
    "Ace",
    "Joker",
    "Dreamer",
    "Reaper",
    "Slayer",
    "Architect",
  ];

  // 1. Pick a random Adjective
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];

  // 2. Pick a random Noun
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  let name = `${adj}${noun}`;

  // 3. (Optional) Add a suffix number for uniqueness (0-999)
  if (useNumbers) {
    const randomNum = Math.floor(Math.random() * 1000);
    name += randomNum.toString();
  }

  return name;
};

export function generateRandomPlayerInfo(level: number) {
  return {
    gems: 1000,
    gold: 500,
    inventory: [],
    level: level,
    experience: 0,
    name: generateRandomPlayerName(),
    tag: "#1234",
    activeProfilePicId: "default_1",
    unlockedProfilePicIds: ["default_1", "default_2"],
  };
}
