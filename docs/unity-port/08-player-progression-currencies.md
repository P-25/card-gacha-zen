# Player Progression & Currencies

## Purpose / Overview

This document is the canonical reference for the player's persistent state schema, the two currencies (gold, gems) and every way to earn/spend each, the player level/XP curve, level-up rewards, profile fields, and the card fusion/leveling (XP-fodder) system. All formulas are cited directly from the Redux reducer logic in `src/store/slices/playerSlice.ts`, which is the single source of truth for these rules in the JS codebase.

Source files read in full:
- `src/store/slices/playerSlice.ts`
- `src/store/selectors.ts`
- `src/lib/rarityStyles.ts` (for `generateRandomPlayerInfo`)
- `src/config/tierConfig.ts`
- `src/types/game.ts`

## Data Model (full schema tables + suggested C# class)

### `PlayerState` — `src/store/slices/playerSlice.ts:5-20`

| Field | Type | Notes |
|---|---|---|
| `gems` | number | Premium currency |
| `gold` | number | Soft currency |
| `inventory` | `Card[]` | Every owned card copy (each with its own `instanceId`, level, experience, current stats — see doc 07 for the `Card` schema) |
| `level` | number | Player account level |
| `experience` | number | Player account XP, resets toward the next level's requirement each level-up (not cumulative lifetime XP) |
| `name` | string | Player display name |
| `tag` | string | Player discriminator tag, e.g. `"#1234"` |
| `activeProfilePicId` | string | Currently equipped profile picture id |
| `unlockedProfilePicIds` | string[] | All profile picture ids the player has unlocked |
| `battleTier` | number | Current Battle Tier (see 21-battle-tier-screen.md) |
| `lastSeenLevel` | number | The player `level` value as of the last time level-up rewards were acknowledged/claimed — used to detect "levels gained but not yet claimed" |

### Suggested Unity C# class

```csharp
[System.Serializable]
public class PlayerState
{
    // Currencies
    public int gems;
    public int gold;

    // Collection
    public List<OwnedCardInstance> inventory = new(); // see doc 07 for OwnedCardInstance

    // Account progression
    public int level;
    public int experience;      // XP progress toward next level, NOT lifetime cumulative
    public int lastSeenLevel;   // last level the level-up reward popup was acknowledged for

    // Profile
    public string playerName;
    public string tag;
    public string activeProfilePicId;
    public List<string> unlockedProfilePicIds = new();

    // Battle Tier
    public int battleTier;
}
```

## Behavior & Logic (step-by-step, exact formulas/conditions)

### Starting values — TWO CONFLICTING DEFINITIONS (see Data Inconsistency below)

**Canonical player initial state** — `src/store/slices/playerSlice.ts:22-35` (the Redux slice's `initialState`, used whenever there is no save file to hydrate from):

| Field | Value |
|---|---|
| `gems` | 900 |
| `gold` | 100 |
| `inventory` | `[]` (empty) |
| `level` | 1 |
| `experience` | 0 |
| `lastSeenLevel` | 1 |
| `name` | `"Trainer"` |
| `tag` | `"#1234"` |
| `activeProfilePicId` | `"default_1"` |
| `unlockedProfilePicIds` | `["default_1"]` (only 1 unlocked) |
| `battleTier` | 1 |

### Currency: Gold

| Action | Reducer | Effect |
|---|---|---|
| Add gold | `addGold(amount)` | `state.gold += amount` — no cap (`playerSlice.ts:88-90`) |
| Spend gold | `spendGold(amount)` | Only decrements if `state.gold >= amount`; **silently no-ops (does nothing) if insufficient funds** — there is no error thrown or returned; callers must pre-check affordability themselves (`playerSlice.ts:91-95`) |
| Sources | Battle Tier upgrade reward (flat `TIER_REWARD_GOLD` = 1000 gold per tier), Level-up reward (300 gold × levels gained, via `acknowledgeLevelUp`), Quest rewards (`QuestReward.gold`, variable per quest, see `src/config/quests.json`), Resource items opened from gacha (`gold_pack_small` = 50, `gold_pack_large` = 100, see doc 07), generic `addRewards({gold})` action used by multiple reward-granting flows | |
| Sinks | Card fusion/leveling cost (see below — **NOTE**: current `consumeCardsForXp` reducer as implemented does **not** actually deduct gold; see Behavior note below), Gacha summon cost when a banner's `currency` is `"gold"` (see doc 14) | |

### Currency: Gems

| Action | Reducer | Effect |
|---|---|---|
| Add gems | `addGems(amount)` | `state.gems += amount` — no cap (`playerSlice.ts:80-82`) |
| Spend gems | `spendGems(amount)` | Only decrements if `state.gems >= amount`; **silently no-ops if insufficient**, same pattern as `spendGold` (`playerSlice.ts:83-87`) |
| Sources | Battle Tier upgrade reward (flat `TIER_REWARD_GEMS` = 30 gems per tier), Level-up reward (100 gems × levels gained, via `acknowledgeLevelUp`), Quest rewards (`QuestReward.gems`), generic `addRewards({gems})` | |
| Sinks | Gacha summon cost when a banner's `currency` is `"gems"` (primary premium-pull currency, see doc 14) | |

### Player Level / XP curve

Two separate reducers implement the **same** level-up loop (duplicated logic, not shared code):

**`addPlayerExp(amount)`** — `playerSlice.ts:199-211`:
```
state.experience += amount
nextLevelXp = state.level * 100
while state.experience >= nextLevelXp:
    state.experience -= nextLevelXp
    state.level += 1
    nextLevelXp = state.level * 100   // recompute for the new level, supports multi-level-ups in one grant
```

**`addRewards({experience})`** — `playerSlice.ts:212-232` — identical loop, embedded inline inside a combined gold/gems/experience reward-granting action.

So the **Player XP-to-next-level formula is**:
```
XP required to go from level N to N+1 = N * 100
```
(Level 1→2 needs 100 XP, Level 2→3 needs 200 XP, Level 9→10 needs 900 XP, etc. — an arithmetic, not exponential, curve.)

Both reducers correctly handle overflow (a single large XP grant can trigger multiple level-ups in one dispatch, decrementing `experience` and re-checking against the new level's threshold each iteration) and both leave any leftover `experience` after the last level-up as the carry-over progress toward the next level.

### Level-Up Rewards

`acknowledgeLevelUp()` — `playerSlice.ts:233-244`:
```
levelsGained = state.level - state.lastSeenLevel
if levelsGained > 0:
    state.lastSeenLevel = state.level
    state.gems += 100 * levelsGained
    state.gold += 300 * levelsGained
```
This is a separate, explicit "claim" step — leveling up (via `addPlayerExp`/`addRewards`) does **not** immediately grant the reward; the UI must dispatch `acknowledgeLevelUp` (presumably when the player views/dismisses a level-up popup) to actually receive **100 gems + 300 gold per level gained**, and to advance `lastSeenLevel` so it isn't re-claimed.

Note: the source has a code comment at `playerSlice.ts:238-240` reading *"Grant rewards: 100 Gems, 300 Gold per level? The prompt says 'reward the user with 100Gems and 300 Gold'. Let's assume this fixed amount per level up."* — i.e. this exact number was a best-guess implementation from an ambiguous spec, not a rigorously tuned design value. Flag for the game designer to confirm before treating 100/300 as final balance numbers in Unity.

### Battle Tier upgrade reward

`increaseBattleTier()` — `playerSlice.ts:193-198`:
```
state.battleTier += 1
state.gems += 30      // TIER_REWARD_GEMS
state.gold += 1000    // TIER_REWARD_GOLD
```
Gating (whether the player is *allowed* to call this) is computed by a selector, not the reducer itself — `selectCanUpgradeTier` (`src/store/selectors.ts:49-52`) requires `MaxTP >= getTierThreshold(currentTier)`, where `getTierThreshold(tier) = tier * 100` (`src/config/tierConfig.ts:4-9`; e.g. Tier 1→2 requires 100 Max TP, Tier 2→3 requires 200 Max TP). See doc 07 for the Max TP formula (sum of top-3-owned-cards' TP) and doc 21 for the full Battle Tier screen flow.

### Profile fields

- `setProfileInfo({name, tag})` — direct overwrite of both fields (`playerSlice.ts:178-184`)
- `setActiveProfilePic(id)` — direct overwrite (`playerSlice.ts:185-187`)
- `unlockProfilePic(id)` — pushes `id` into `unlockedProfilePicIds` only if not already present, i.e. idempotent unlock (`playerSlice.ts:188-192`)

### Card Fusion / Leveling — `consumeCardsForXp` — `playerSlice.ts:104-177`

Payload: `{ targetInstanceId: string, consumedInstanceIds: string[] }` — one "target" card being leveled up, plus a list of "fodder" cards (by instance id) to be consumed for XP.

Step-by-step:

1. Find the target card in inventory by `instanceId`. Abort (no-op) if not found.
2. **Calculate total XP granted** by summing, for every card in the consumed list:
   ```
   baseXp = 50 if rarity == COMMON
          = 100 if rarity == UNCOMMON
          = 200 if rarity == RARE
   cardXp = baseXp * fodderCard.level   // level multiplier, NOT a fixed value — a level-5 Common fodder card grants 250 XP (50*5), not 50
   totalXpToAdd = sum(cardXp for each fodder card)
   ```
3. **Remove** all consumed cards from `inventory` (they are destroyed/consumed permanently — no undo).
4. Re-find the target card (post-removal, for safe Immer mutation) and abort if it somehow vanished.
5. **Apply level-up loop**, capped by the player's own account level:
   ```
   maxLevel = player.level              // a card can never out-level the player's account level
   currentXp = target.experience + totalXpToAdd
   currentLevel = target.level
   while currentLevel < maxLevel:
       xpNeeded = currentLevel * 100    // SAME curve shape as player XP, but keyed off the CARD's current level
       if currentXp >= xpNeeded:
           currentXp -= xpNeeded
           currentLevel += 1
           target.state.pow += 2        // flat +2 per stat per level gained
           target.state.spd += 2
           target.state.def += 2
       else:
           break                        // not enough XP for the next level; stop and bank the leftover currentXp
   target.level = currentLevel
   target.experience = currentXp
   ```

**Formulas summary:**

| Formula | Value |
|---|---|
| XP per fodder card | `baseXp(rarity) * fodderCard.level` |
| `baseXp` by rarity | COMMON=50, UNCOMMON=100, RARE=200 |
| XP required for a card to go from level N to N+1 | `N * 100` (identical shape to player XP curve) |
| Stat gain per card level-up | +2 pow, +2 spd, +2 def (flat, regardless of rarity or which level) |
| Card level cap | Hard-capped at the player's current account `level` — a card literally cannot be leveled past whatever the player's own level is, even with excess XP (excess XP beyond the cap is simply never applied; the `while` loop condition `currentLevel < maxLevel` stops the loop, and any leftover `currentXp` accumulated but unspent stays stored on the card until the player's own level rises) |

**IMPORTANT — no gold cost is charged in code.** The reducer `consumeCardsForXp` only touches `inventory`, card `level`, and card `experience`/`state`; it never dispatches or contains any `gold -=` logic. If the game design intends a gold cost for fusion/leveling (common in gacha games), that cost must be paid via a *separate* `spendGold` dispatch from the calling UI code (outside this reducer) before/alongside calling `consumeCardsForXp` — it is not enforced or coupled at the state-management level. **Unity porting note: do not assume a gold cost exists in the underlying rule; verify against the actual calling UI component (`src/components/features/collection/LevelUpScreen.tsx`, not read as part of this doc) if a gold-sink balance number is needed, or treat this as a design decision to make fresh.**

## Numbers & Formulas (table of every constant/formula found)

| Constant / Formula | Value | Source |
|---|---|---|
| Starting gems (canonical) | 900 | `playerSlice.ts:23` |
| Starting gold (canonical) | 100 | `playerSlice.ts:24` |
| Starting player level | 1 | `playerSlice.ts:26` |
| Starting unlocked profile pics | `["default_1"]` (1 entry) | `playerSlice.ts:33` |
| Player XP to level N→N+1 | `N * 100` | `playerSlice.ts:203, 225` |
| Level-up reward: gems per level | 100 | `playerSlice.ts:241` |
| Level-up reward: gold per level | 300 | `playerSlice.ts:242` |
| Battle Tier upgrade reward: gems | 30 (`TIER_REWARD_GEMS`) | `tierConfig.ts:1` |
| Battle Tier upgrade reward: gold | 1000 (`TIER_REWARD_GOLD`) | `tierConfig.ts:2` |
| Battle Tier threshold (Max TP needed) | `tier * 100` | `tierConfig.ts:4-9` |
| Fodder XP — Common base | 50 | `playerSlice.ts:126` |
| Fodder XP — Uncommon base | 100 | `playerSlice.ts:127` |
| Fodder XP — Rare base | 200 | `playerSlice.ts:128` |
| Fodder XP multiplier | `× fodderCard.level` | `playerSlice.ts:131-132` |
| Card XP to level N→N+1 | `N * 100` | `playerSlice.ts:158` |
| Card stat gain per level | +2 pow / +2 spd / +2 def | `playerSlice.ts:166-168` |
| Card level cap | `== player.level` (cannot exceed) | `playerSlice.ts:152, 157` |
| Gold cost for card fusion/leveling | **Not implemented in reducer** — must be sourced from calling UI or newly designed | `playerSlice.ts:104-177` (absence confirmed) |

## Data Inconsistency: Two Different "Starting Player Info" Definitions

The codebase contains **two different functions that both produce a full player-state-shaped object with starting currency values**, and they disagree:

**1. `playerSlice.ts` `initialState`** (`playerSlice.ts:22-35`) — this is the actual Redux store default used the moment the app boots with no save data (see doc 09 for hydration flow). This is what a genuinely new player receives.

| Field | Value |
|---|---|
| gems | 900 |
| gold | 100 |
| name | `"Trainer"` (fixed, not randomized) |
| tag | `"#1234"` |
| unlockedProfilePicIds | `["default_1"]` (1 entry) |

**2. `generateRandomPlayerInfo(level)`** in `src/lib/rarityStyles.ts:337-351`:

| Field | Value |
|---|---|
| gems | 1000 |
| gold | 500 |
| name | randomly generated (e.g. `"NeoWolf482"`) via `generateRandomPlayerName()` |
| tag | `"#1234"` |
| unlockedProfilePicIds | `["default_1", "default_2"]` (2 entries) |
| battleTier | 1 |
| lastSeenLevel | `level` (passed-in param, matches `level`) |

**Important clarifying finding**: despite its generic name and full `PlayerState`-shaped return value, `generateRandomPlayerInfo` is **not currently used to initialize the human player's save state at all**. Its only call site is `src/components/battle/BattleFlow.tsx:153` (`const opponentInfo = generateRandomPlayerInfo(level || 1)`), where it fabricates a plausible-looking **AI opponent's** profile (name/tag/currencies/level) for display during the pre-battle "Versus" screen. The function's shape mirroring `PlayerState` appears to be either leftover from an earlier design (e.g. maybe once used for player onboarding, then repurposed) or simply convenient reuse of a "generate a plausible player-like blob" helper for both purposes.

**Recommendation for the Unity port**: treat **`playerSlice.ts` initial state (900 gems / 100 gold / name "Trainer" / 1 unlocked profile pic) as the sole canonical new-player starting state.** Port `generateRandomPlayerInfo`'s values (1000 gems / 500 gold / random name / 2 unlocked profile pics) separately and explicitly as an **"AI opponent profile generator"** used only for populating the Versus/matchmaking screen with a fake opponent identity — do not reuse it for real player save initialization, and do not let a Unity dev who greps for "starting gems" accidentally pick up the 1000/500 numbers meant for fake opponents instead of the real 900/100 new-player defaults.

## Cross-References

- 07-data-model-cards-rarity.md — `Card`/`OwnedCardInstance` schema referenced by `inventory`, Total Power formula referenced by Battle Tier gating
- 09-save-persistence-system.md — how/when `PlayerState` is persisted and hydrated, and the `setPlayerState` migration/backfill logic that repairs old saves missing these fields
- 10-collection-screen.md — displays inventory, level, and rarity styling
- 11-card-detail-modal-and-leveling.md — the UI that dispatches `consumeCardsForXp` (target/fodder selection flow)
- 12-deck-building-system.md — deck composition, separate from the top-3-TP Battle Tier gating described here
- 14-gacha-mechanics-rates-pity.md — gold/gem sinks via summon banners, and resource items as gold sources
- 21-battle-tier-screen.md — full Battle Tier upgrade flow built on `selectCanUpgradeTier`/`increaseBattleTier`

## Unity Porting Notes

- **Both currency spend reducers fail silently on insufficient funds.** Port this exact behavior deliberately (no exception, no partial spend, just a no-op) if fidelity to current game feel matters, but note it means the calling UI is fully responsible for affordability checks/error messaging — there is no state-layer guarantee against a UI bug that lets a player attempt an unaffordable action with no feedback. Consider whether the Unity port should return a bool/result instead of silently no-op'ing, as a quality improvement.
- **XP curves (`N * 100`) are identical in shape** for player level-ups and card level-ups, but are two independently-coded loops in the source, not shared code. Port as a single shared `int XpForLevel(int currentLevel) => currentLevel * 100;` utility used by both player and card leveling paths, to avoid the duplication-drift risk present in the JS source.
- **Card level cap coupling to player level is a hard design rule**, not a soft suggestion — a maxed-out player at level 1 literally cannot level up any card past level 1 regardless of how much fodder is fed in. Make sure the Unity leveling UI clearly communicates this cap (e.g. greys out or explains why XP isn't applying) since it's a common source of "why isn't my card leveling" confusion.
- **No gold cost currently exists in `consumeCardsForXp`.** Before porting, explicitly decide with the game designer whether card fusion should cost gold in the Unity version — do not assume the JS behavior (free, XP-only) reflects final intended design; it may simply be an oversight, especially since gold has few sinks otherwise (only gacha `currency: "gold"` banners, if any — verify against doc 14).
- **`lastSeenLevel` / `acknowledgeLevelUp` is a "pending reward" pattern**: level-up currency is not granted at the moment of leveling, only when explicitly acknowledged. Port this as an explicit two-phase state machine (leveled-but-unclaimed vs. claimed) rather than auto-granting on XP gain, to preserve the level-up popup/celebration UX moment.
- **Resolve the starting-currency ambiguity explicitly in Unity** by naming the two concepts distinctly in code from day one: `NewPlayerDefaults` (900/100) vs. `FakeOpponentProfileGenerator` (1000/500) — do not give them similar names that invite the same confusion the JS source has.
