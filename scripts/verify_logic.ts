import { performSummon } from "../src/lib/gameLogic";
import { PlayerPityState } from "../src/types/game";

const BANNER_ID = "banner_rate_up"; // Changed to Rate Up Banner
const SIMULATIONS = 10000;

function runSimulation() {
  console.log(
    `Starting simulation of ${SIMULATIONS} summons on ${BANNER_ID}...`
  );

  let pityState: PlayerPityState = { pullsSinceLastRare: 0 };
  const results = {
    COMMON: 0,
    UNCOMMON: 0,
    RARE: 0,
    LEGENDARY: 0,
    GOLD: 0,
  };

  const cardCounts: Record<string, number> = {};

  let maxPullsWithoutRare = 0;
  let currentPullsWithoutRare = 0;
  const rarePullsAtCount: Record<number, number> = {};

  for (let i = 0; i < SIMULATIONS; i++) {
    try {
      const { item, newPityState } = performSummon(BANNER_ID, pityState);

      // Track Rarity
      results[item.rarity]++;

      // Track Specific Card Counts
      cardCounts[item.id] = (cardCounts[item.id] || 0) + 1;

      // Track Gold
      if (item.type === "RESOURCE") {
        results.GOLD++;
      }

      // Track Pity Stats
      if (item.rarity === "RARE") {
        const pullsTaken = currentPullsWithoutRare + 1;
        rarePullsAtCount[pullsTaken] = (rarePullsAtCount[pullsTaken] || 0) + 1;

        currentPullsWithoutRare = 0;
      } else {
        currentPullsWithoutRare++;
        if (currentPullsWithoutRare > maxPullsWithoutRare) {
          maxPullsWithoutRare = currentPullsWithoutRare;
        }
      }

      pityState = newPityState;
    } catch (e) {
      console.error("Simulation Error:", e);
      break;
    }
  }

  console.log("--- Simulation Results ---");
  console.log("Total Summons:", SIMULATIONS);
  console.log("Rarity Distribution:");
  console.log(
    `  COMMON: ${results.COMMON} (${(
      (results.COMMON / SIMULATIONS) *
      100
    ).toFixed(2)}%)`
  );
  console.log(
    `  UNCOMMON: ${results.UNCOMMON} (${(
      (results.UNCOMMON / SIMULATIONS) *
      100
    ).toFixed(2)}%)`
  );
  console.log(
    `  RARE: ${results.RARE} (${((results.RARE / SIMULATIONS) * 100).toFixed(
      2
    )}%)`
  );
  console.log(
    `  GOLD Drops: ${results.GOLD} (${(
      (results.GOLD / SIMULATIONS) *
      100
    ).toFixed(2)}%)`
  );

  console.log("\nCard Distribution (Top 5):");
  Object.entries(cardCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([id, count]) => {
      console.log(
        `  ${id}: ${count} (${((count / SIMULATIONS) * 100).toFixed(2)}%)`
      );
    });

  console.log("\nPity System Stats:");
  console.log("  Max Pulls Without Rare:", maxPullsWithoutRare);
  console.log("  Rare Pull Distribution (Pull Count -> Frequency):");
  Object.keys(rarePullsAtCount)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((k) => {
      console.log(`    Pull #${k}: ${rarePullsAtCount[Number(k)]}`);
    });
}

runSimulation();
