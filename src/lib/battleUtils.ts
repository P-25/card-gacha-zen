import { Card } from "@/types/game";
import cardsData from "@/config/cards.json";
import { getBattleModeById } from "@/config/battleModes";

export const generateOpponentDeck = (
  playerDeck: Card[],
  selectedBattleModeId?: string | null,
): Card[] => {
  let opponentDeck: Card[] = [];

  console.log(`Debug - selectedBattleModeId`, selectedBattleModeId);
  const mode = selectedBattleModeId
    ? getBattleModeById(selectedBattleModeId)
    : null;

  if (mode && mode.opponentDeckRules && mode.opponentDeckRules.length > 0) {
    // --- RULE BASED GENERATION (Step-Up) ---
    mode.opponentDeckRules.forEach((rule) => {
      const possibleCards = cardsData.filter(
        (c) => c.rarity === rule.rarity,
      ) as unknown as Card[];

      if (possibleCards.length === 0) {
        console.warn(`No cards found for rarity ${rule.rarity}`);
        return;
      }

      for (let i = 0; i < rule.count; i++) {
        const randomCard =
          possibleCards[Math.floor(Math.random() * possibleCards.length)];
        const card = JSON.parse(JSON.stringify(randomCard)) as Card;
        card.level = rule.level;

        // Apply level stats (User Rule: +2 to each stat per level up)
        // Level 1 is base.
        // Level 3 means 2 level ups -> +4 to each stat.
        const levelBonus = (rule.level - 1) * 2;
        card.state.pow = (card.state.pow || 0) + levelBonus;
        card.state.def = (card.state.def || 0) + levelBonus;
        card.state.spd = (card.state.spd || 0) + levelBonus;

        card.instanceId = `opp-${card.id}-${Math.random()}`;
        opponentDeck.push(card);
      }
    });
  } else {
    // --- EXISTING LOGIC (Wild Mode / Default) ---
    // 1. Calculate User's Total Power
    const userTotalPower = playerDeck.reduce((sum, card) => {
      return (
        sum +
        (card.state.pow || 0) +
        (card.state.def || 0) +
        (card.state.spd || 0)
      );
    }, 0);

    const targetTotalPower = userTotalPower; // Aim for parity
    const targetAvgPower = targetTotalPower / 3;

    // 2. Select 3 Random Base Cards for Opponent
    const shuffled = [...cardsData].sort(() => 0.5 - Math.random());
    const selectedBaseCards = shuffled.slice(0, 3) as unknown as Card[];

    // 3. Level Up / Adjust Stats to Match Target Power
    opponentDeck = selectedBaseCards.map((baseCard) => {
      // Create a deep copy to avoid mutating source data
      const card = JSON.parse(JSON.stringify(baseCard)) as Card;

      const basePower =
        (card.state.pow || 0) + (card.state.def || 0) + (card.state.spd || 0);

      // If base power is already higher than target (unlikely for lvl 1 vs leveled), keep it.
      // Otherwise, buff it.
      if (basePower < targetAvgPower) {
        const powerDeficit = targetAvgPower - basePower;

        // Distribute deficit randomly across stats
        // We'll add roughly equal parts to POW, DEF, SPD, with some randomness
        const parts = 3;
        const baseBuff = Math.floor(powerDeficit / parts);
        const remainder = Math.floor(powerDeficit % parts);

        card.state.pow =
          (card.state.pow || 0) +
          baseBuff +
          (Math.random() > 0.5 ? remainder : 0);
        card.state.def = (card.state.def || 0) + baseBuff;
        card.state.spd = (card.state.spd || 0) + baseBuff;

        // Update Level Visual (Approximate: 1 level ~ 10 power? Just an estimate for visual flair)
        // Assuming base level is 1.
        const levelIncrease = Math.floor(powerDeficit / 5); // Arbitrary scaling
        card.level = (card.level || 1) + levelIncrease;
      }

      // Ensure unique IDs for the battle
      card.instanceId = `opp-${card.id}-${Math.random()}`;

      return card;
    });
  }

  console.log("--- DEBUG: GENERATED OPPONENT DECK ---");
  console.log("Battle Mode:", mode || "Wild/Default");
  console.table(
    opponentDeck.map((c) => ({
      Name: c.name,
      Rarity: c.rarity,
      Level: c.level,
      POW: c.state.pow,
      DEF: c.state.def,
      SPD: c.state.spd,
    })),
  );
  console.log("Full Deck Object:", opponentDeck);
  return opponentDeck;
};
