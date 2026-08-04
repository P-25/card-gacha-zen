# Gacha Mechanics: Rates & Pity

## Purpose / Overview

This is the authoritative specification of the gacha roll algorithm (`performSummon` in `src/lib/gameLogic.ts:31-173`). It covers: banner configuration schema, base drop rates, hard pity, soft pity (with the exact ramping formula), how the non-Rare probability space splits between Common and Uncommon, weighted item selection within a rarity pool, and how pity state is persisted/reset between pulls.

**This file is the single most important porting reference in this set — a subtly wrong translation here silently breaks the entire in-game economy (players getting Rares far more/less often than intended, pity never triggering, etc.). Port it as literally as possible; do not "improve" or re-derive the math without flagging the change to design first.**

There is currently exactly **one** banner in the game (`banner_rate_up`, "Dragon Slayer Rate Up"), defined in `src/config/summons.json`. The algorithm is written generically over "the banner," so a Unity port done as a data-driven `BannerConfig` asset will support future additional banners for free.

## Data Model

### Source types (`src/types/game.ts`)

```ts
type Rarity = "COMMON" | "UNCOMMON" | "RARE";

interface PitySettings {
  targetRarity: Rarity;      // which rarity the pity system guarantees ("RARE")
  hardPity: number;          // pull count at which targetRarity is FORCED
  softPity: number;          // pull count at which the ramp begins
  softPityIncrement: number; // per-pull additive rate increase during ramp
}

interface SummonPoolItem {
  id: string;      // Card.id or Resource.id
  weight: number;  // relative weight within its rarity's pool
  type?: ItemType; // optional, unused by current algorithm
}

interface SummonBanner {
  id: string;
  name: string;
  cost: number;              // unused by current banner (superseded by singlePrice/multiPrice, see below)
  currency: string;
  rates: Record<string, number>; // Rarity -> base probability (0-1), should sum to 1.0
  pity: PitySettings;
  pool: SummonPoolItem[];    // explicit pool; EMPTY means "use all Cards+Resources, weight 10 each" (see Behavior)
}

interface PlayerPityState {
  pullsSinceLastRare: number; // consecutive non-target-rarity pulls; resets to 0 on a target-rarity hit
}

interface SummonResult {
  item: Card | Resource;
  newPityState: PlayerPityState;
}
```

Note: `summons.json` entries also carry `singlePrice` and `multiPrice` (Gem cost for a x1 / x10 pull respectively) which are read directly by the UI layer, not by `performSummon` itself. The `SummonBanner.cost`/`currency` fields exist in the type but are not actually used for pricing by the current banner or UI code — `singlePrice`/`multiPrice` are what matters.

### Suggested C# / Unity representation

```csharp
[CreateAssetMenu(menuName = "Gacha/Banner Config")]
public class BannerConfigSO : ScriptableObject
{
    public string bannerId;
    public string displayName;
    public int singlePrice;      // Gem cost, x1 pull
    public int multiPrice;       // Gem cost, x10 pull
    public CurrencyType currency; // Gems (only currency currently used)

    // Base rates. Must sum to 1.0. Index/key by Rarity enum.
    public RarityRate[] baseRates; // e.g. [{COMMON,0.8540},{UNCOMMON,0.1320},{RARE,0.0140}]

    public Rarity pityTargetRarity;   // RARE
    public int hardPity;              // 90
    public int softPity;              // 60
    public float softPityIncrement;   // 0.05

    public WeightedPoolEntry[] explicitPool; // empty => dynamic "use all cards+resources, weight 10" fallback
}

[System.Serializable]
public struct RarityRate { public Rarity rarity; public float rate; }

[System.Serializable]
public struct WeightedPoolEntry { public string itemId; public float weight; }

[System.Serializable]
public class PlayerPityState
{
    public int pullsSinceLastRare;
}
```

Persist `Dictionary<string bannerId, PlayerPityState>` per player save (mirrors the Redux `pitySlice`, keyed by banner ID — `src/store/slices/pitySlice.ts`).

## Behavior & Logic — The Roll Algorithm

`performSummon(bannerId, currentPity)` runs **once per individual pull** (a x10 pull is simply 10 sequential calls, each one's output pity state feeding into the next call's input — see doc 13 for the calling loop). Steps, translated to pseudocode:

```
function PerformSummon(banner, currentPity) -> SummonResult:
    pulls = currentPity.pullsSinceLastRare   // consecutive non-target pulls so far, BEFORE this pull
    selectedRarity = COMMON                  // default

    // ---- STEP 1: HARD PITY CHECK ----
    if pulls >= banner.pity.hardPity - 1:
        // This pull IS the hardPity-th consecutive pull in the streak (0-indexed pulls counter
        // reaches hardPity-1 after hardPity-1 misses, so THIS pull is guaranteed).
        selectedRarity = banner.pity.targetRarity
    else:
        // ---- STEP 2: SOFT PITY RATE RAMP ----
        rareRate = banner.rates[banner.pity.targetRarity]   // base rate, e.g. 0.014

        if pulls >= banner.pity.softPity:
            extraRate = (pulls - banner.pity.softPity + 1) * banner.pity.softPityIncrement
            rareRate = rareRate + extraRate
            rareRate = min(rareRate, 1.0)   // hard cap

        // ---- STEP 3: RARITY ROLL ----
        roll = Random.Range(0.0, 1.0)   // uniform, half-open [0,1)

        if roll < rareRate:
            selectedRarity = banner.pity.targetRarity
        else:
            // Re-normalize the LEFTOVER probability space (1 - rareRate) back to [0,1)
            remainingRoll = (roll - rareRate) / (1.0 - rareRate)

            uncommonRate = banner.rates["UNCOMMON"]
            commonRate   = banner.rates["COMMON"]
            totalNonRare = uncommonRate + commonRate
            normalizedUncommon = uncommonRate / totalNonRare   // constant regardless of pity ramp

            if remainingRoll < normalizedUncommon:
                selectedRarity = UNCOMMON
            else:
                selectedRarity = COMMON

    // ---- STEP 4: POOL SELECTION (weighted random) ----
    pool = banner.pool
    if pool is empty:
        // Dynamic fallback: ALL cards + ALL resources in the game, uniform weight 10 each
        pool = AllCards.map(c => {id: c.id, weight: 10})
             + AllResources.map(r => {id: r.id, weight: 10})

    candidates = pool.filter(item => ResolveRarity(item.id) == selectedRarity)
    if candidates.isEmpty:
        throw ConfigurationError("No items for rarity " + selectedRarity)  // treat as fatal config bug

    totalWeight = sum(candidates.weight)
    weightRoll = Random.Range(0.0, 1.0) * totalWeight
    selected = candidates[0]   // fallback if loop below never breaks (shouldn't happen)
    for item in candidates:
        if weightRoll < item.weight:
            selected = item
            break
        weightRoll -= item.weight

    finalItem = ResolveFullItem(selected.id)   // look up Card (compute TP) or Resource

    // ---- STEP 5: PITY STATE UPDATE ----
    newPity = copy(currentPity)
    if selectedRarity == banner.pity.targetRarity:
        newPity.pullsSinceLastRare = 0
    else:
        newPity.pullsSinceLastRare += 1

    return { item: finalItem, newPityState: newPity }
```

### Important implementation details / gotchas to preserve exactly

1. **`pulls` is read BEFORE this pull is resolved**, and represents how many consecutive non-target pulls already happened. It is *not* "the index of the pull about to happen." A fresh player/banner starts at `pullsSinceLastRare = 0`.
2. **Hard pity fires on the Nth pull of the streak, not after N misses.** With `hardPity = 90`: the check is `pulls >= 89`. Since `pulls` only reaches 89 after 89 consecutive non-Rare pulls, the pull where `pulls == 89` is the **90th** pull of the streak, and it is forced to Rare. So "hard pity at 90" means: at most 89 non-Rare pulls in a row can ever happen; the 90th pull in any such streak is guaranteed Rare.
3. **Soft pity ramp is strictly additive per pull**, not a smooth curve: `extraRate = (pulls - softPity + 1) * softPityIncrement`. The `+1` means the very first pull at `pulls == softPity` already gets one full increment applied (i.e. the ramp doesn't start at +0%).
4. **The Common/Uncommon split ratio is pity-independent.** Because the non-Rare space is re-normalized proportionally (`normalizedUncommon = uncommonRate / (uncommonRate + commonRate)`), the *relative* odds of Common vs. Uncommon (given the pull wasn't Rare) never change during the soft-pity ramp — only the overall chance of landing in that "not Rare" bucket shrinks as `rareRate` grows. At the current banner's rates this ratio is a constant **86.61% Common / 13.39% Uncommon** among non-Rare results, at every point in the pity cycle including pull #1.
5. **The base rates are self-consistent**: at `pulls < softPity` (no ramp active), the formula reduces exactly back to the configured `rates.COMMON` / `rates.UNCOMMON` / `rates.RARE` (this is a good regression-test invariant for the Unity port: at `pullsSinceLastRare = 0`, rolling many times should reproduce 85.40% / 13.20% / 1.40% within statistical noise).
6. **Pool weighting is per-rarity-filtered, not global.** Item weights only compete against other items of the *same rolled rarity* — weight is never compared across rarities. Cross-rarity odds are controlled entirely by Step 1-3; Step 4 only decides *which specific item* within the already-chosen rarity.
7. **Dynamic pool fallback uses flat weight 10 for every single Card and Resource in the entire game database**, regardless of rarity-specific balancing intentions elsewhere — since all weights are equal, this collapses to a **uniform random pick** among all items of the resolved rarity. The current banner (`banner_rate_up`) has `pool: []`, so it always uses this fallback.
8. **Rarity resolution for pool filtering** looks the item ID up in both the cards table and the resources table (whichever matches) — a pool entry can reference either a Card or a Resource by ID.
9. **A config error where a rarity has zero matching pool items throws a hard exception** (`Configuration Error: No items in pool for {rarity}`) rather than silently falling back — preserve this as a fail-loud invariant/assert in the Unity port (e.g. throw or `Debug.LogError` + abort the pull) so pool/rarity misconfigurations are caught immediately in testing rather than producing silently-wrong drops.
10. **Random source**: base game uses `Math.random()` (uniform `[0, 1)`), abstracted behind a single `getRandom()` helper explicitly called out in the source as mockable for tests — mirror this with a single injectable RNG service in Unity (e.g. `System.Random` or `UnityEngine.Random` wrapped behind an interface) so pity/rate logic is deterministic and unit-testable.

## Animations & Timing

N/A — this document is pure data/logic. All roll computation is instantaneous and happens synchronously behind the screen's white-flash transition (see `13-summon-gacha-screen-ui.md`, "Charge → Flash → Resolve" timing table, t=3500ms).

## Numbers & Formulas

### Banner: `banner_rate_up` ("Dragon Slayer Rate Up") — full config (`src/config/summons.json`)

| Field | Value |
|---|---|
| `id` | `banner_rate_up` |
| `name` | Dragon Slayer Rate Up |
| `singlePrice` (x1 cost) | 10 Gems |
| `multiPrice` (x10 cost) | 90 Gems (10% cheaper than 10× single) |
| `currency` | Gems |
| Base rate — COMMON | 0.8540 (85.40%) |
| Base rate — UNCOMMON | 0.1320 (13.20%) |
| Base rate — RARE | 0.0140 (1.40%) |
| Pity `targetRarity` | RARE |
| Pity `hardPity` | 90 |
| Pity `softPity` | 60 |
| Pity `softPityIncrement` | 0.05 (5 percentage points per pull) |
| `pool` | `[]` (empty → dynamic fallback: all Cards + all Resources, weight 10 each) |

### Soft-pity ramp table (Rare probability by consecutive-miss count)

`rareRate(pulls) = min(1.0, 0.014 + max(0, pulls - 59) * 0.05)` for `pulls < 89`; forced 1.0 (100%) at `pulls >= 89` via hard pity regardless of the formula.

| `pullsSinceLastRare` (misses so far) | This pull number in streak | Rare chance this pull |
|---|---|---|
| 0 – 59 | 1 – 60 | 1.40% (flat base rate) |
| 60 | 61 | 6.40% |
| 61 | 62 | 11.40% |
| 62 | 63 | 16.40% |
| 65 | 66 | 31.40% |
| 70 | 71 | 56.40% |
| 75 | 76 | 81.40% |
| 78 | 79 | 96.40% |
| 79 | 80 | 100.00% (formula alone already saturates here — 22 pulls before hard pity would have forced it anyway) |
| 80 – 88 | 81 – 89 | 100.00% (still via soft-pity formula, already capped) |
| 89 | 90 | 100.00% (hard-pity branch takes over explicitly, same result) |

**Design note (traceable gotcha):** because the soft-pity formula saturates at 100% by pull #80, the `hardPity: 90` setting is currently *cosmetic* for this banner — no player can ever reach the true hard-pity branch (`pulls >= 89`) without already having received a guaranteed Rare nine pulls earlier via the ramp. If a future banner is tuned with a smaller `softPityIncrement` relative to the gap between `softPity` and `hardPity`, this would no longer hold — implement both branches faithfully rather than assuming hard pity is unreachable.

### Common vs. Uncommon split (within "not Rare" results, any point in the pity cycle)

| Rarity | Share of non-Rare results | Effective overall rate at base (no ramp) |
|---|---|---|
| Common | 86.61% (`0.8540 / 0.9860`) | 85.40% |
| Uncommon | 13.39% (`0.1320 / 0.9860`) | 13.20% |

### Item pool composition (dynamic fallback — current live behavior since `pool: []`)

All weights = 10 (flat), so within a rarity this is a **uniform** pick.

**RARE pool (4 items, each 25% conditional chance once RARE is rolled):**
| ID | Name |
|---|---|
| rare_card_001 | Astro Judge |
| rare_card_002 | Obsidian |
| rare_card_003 | Chrono Sent |
| rare_card_004 | Aurum |

**UNCOMMON pool (9 items, each 11.11% conditional chance once UNCOMMON is rolled):**
| ID | Name / Type |
|---|---|
| uncommon_card_001 | Spore Chem |
| uncommon_card_002 | Star Seeker |
| uncommon_card_003 | Sky Lance |
| uncommon_card_004 | Justicar |
| uncommon_card_005 | Frost Guard |
| uncommon_card_006 | Sun Aegis |
| uncommon_card_007 | Bone Weaver |
| uncommon_card_008 | Rune Break |
| gold_pack_large | Resource: "Luminous Stash", grants 100 Gold |

**COMMON pool (13 items, each 7.69% conditional chance once COMMON is rolled):**
| ID | Name / Type |
|---|---|
| common_card_001 | Moss Guard |
| common_card_002 | Deep Diver |
| common_card_003 | Silent Fist |
| common_card_004 | Mech Butler |
| common_card_005 | Silent Bard |
| common_card_006 | Whisper |
| common_card_007 | Wild Heart |
| common_card_008 | Ash Walker |
| common_card_009 | Bound Soul |
| common_card_010 | Vein Miner |
| common_card_011 | Antler Sage |
| common_card_012 | Venom Shade |
| gold_pack_small | Resource: "Spark of Fortune", grants 50 Gold |

### End-to-end absolute item probabilities (single pull, no pity active, `pulls=0`)

`P(specific RARE card) = 1.40% × 25% = 0.350%` each (4 cards).
`P(specific UNCOMMON card) = 13.20% × 11.11% ≈ 1.467%` each (8 cards); `P(gold_pack_large) ≈ 1.467%`.
`P(specific COMMON card) = 85.40% × 7.69% ≈ 6.569%` each (12 cards); `P(gold_pack_small) ≈ 6.569%`.

### Player-facing rewards per pull (from `RateUpSummonSection`, not part of `performSummon` itself)

| Reward | x1 pull | x10 pull |
|---|---|---|
| Player XP | 10 | 100 |
| "SUMMON" quest progress | +1 | +10 |

## Assets Used

N/A — this is a data/logic document. Rate-related UI (pity bar, rate-increase badge) is covered in `13-summon-gacha-screen-ui.md`; rarity-percentage display is covered in `15-offering-rates-screen.md`.

## Cross-References

- [13-summon-gacha-screen-ui.md](./13-summon-gacha-screen-ui.md) — where this algorithm is invoked and how its output is presented/animated.
- [15-offering-rates-screen.md](./15-offering-rates-screen.md) — the player-facing transparency screen that displays these same base rates (note: it shows **base** rates only, not the live pity-adjusted rate).
- [07-data-model-cards-rarity.md](./07-data-model-cards-rarity.md) — Card/Resource schema, rarity enum, and rarity-to-color/asset mapping used throughout.
- [08-player-progression-currencies.md](./08-player-progression-currencies.md) — Gem/Gold/XP economy this algorithm spends from and grants into.

### Forward-looking design context (not implemented in current code)

Per earlier game-design discussion: the long-term plan is to add a **duplicate-independent fusion / rank-up system** so that pulling a duplicate of an already-owned card isn't purely "wasted" — duplicates would feed into a rank-up/ascension resource independent of the gacha roll itself. **This does not exist anywhere in the current codebase** — `performSummon` and the reward-granting code in `RateUpSummonSection.handleSummonLogic` simply add every pulled card to inventory as a new full copy (see `src/store/slices/playerSlice.ts` `addCardToInventory`, which always pushes a new inventory entry with a fresh `instanceId`, doing no duplicate/ownership check at grant time). If/when this system is built, the natural integration point is: (a) at grant time, check if `cardId` is already owned; (b) if so, route the pull into a fusion-material currency instead of (or in addition to) a new inventory copy; (c) surface this distinction in the `CardReveal` UI (distinct visual treatment from a genuinely new card, replacing today's simplistic/heuristic "NEW!" badge — see doc 13's Behavior section and Porting Notes for the existing badge's known accuracy issues, which a proper `isNew` flag from this system would also fix as a side effect). This is design context for the Unity port to keep the door open for (e.g. don't hard-code "every pull = one new inventory row" so deeply that adding a fusion path later requires a rewrite) — it is not a spec to implement now.

## Unity Porting Notes

- **Translate `performSummon` as a pure function**: `(BannerConfig, PityState, IRandomSource) -> (RolledItem, NewPityState)`, with no side effects (no currency spend, no inventory writes) — mirrors the JS source exactly (`gameLogic.ts` performs zero mutation of external state; all spend/grant/pity-dispatch happens in the *caller*, `RateUpSummonSection.handleSummonLogic`). Keep this separation in Unity: one pure "roll resolver" service, and a separate "transaction" layer that spends currency, calls the resolver N times for a multi-pull, and only then commits inventory/currency/pity changes.
- **For a x10 pull, chain pity state sequentially** — each of the 10 calls must feed the previous call's `newPityState` in as its `currentPity`, exactly like the JS `for` loop's `tempPity` accumulator. Do not resolve all 10 pulls against the pre-pull pity snapshot in parallel; a Rare on pull #3 of a x10 must reset the counter before pull #4 is rolled.
- **Use double/float carefully around the rate cap**: the JS `if (rareRate > 1.0) rareRate = 1.0` cap should be a `Mathf.Min(rareRate, 1f)` (or clamp) in C# — don't let floating point drift push `rareRate` fractionally above 1.0 and cause `roll < rareRate` to behave unexpectedly (harmless either way since `roll` is always `<1`, but clamp explicitly to keep intent obvious).
- **Make hard pity and soft pity both independently correct**, even though the current banner's numbers happen to make hard pity unreachable (see Design Note above) — a future banner or a rebalance could change `softPityIncrement` or the gap between `softPity`/`hardPity` and suddenly rely on the hard-pity branch actually firing. Do not "optimize away" the hard-pity check just because it's currently redundant.
- **Recommend adding automated regression tests** (the JS codebase has none currently touching `performSummon`) verifying, over a large simulated sample (e.g. 1,000,000 rolls at `pulls=0`): observed rarity distribution ≈ configured base rates within tolerance; and a scripted no-Rare streak reaches exactly 100% Rare chance by pull 90 (never later).
- **ScriptableObject-based `BannerConfigSO`** is strongly recommended over hardcoded banner data, mirroring `summons.json` — this both matches the existing data-driven pattern (`cards.json`, `resources.json`, `summons.json` are all flat JSON tables read at runtime) and makes it trivial to add additional banners later without touching the roll algorithm.
- **Persist pity state per-banner, keyed by banner ID**, exactly like `pitySlice` (`Dictionary<string, PlayerPityState>`) — this already anticipates multiple banners even though only one exists today.
