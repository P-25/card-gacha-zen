# Battle Tier Screen

## Purpose / Overview

The Battle Tier screen (`src/components/features/tier/BattleTierScreen.tsx`) is a standalone meta-progression screen, separate from any individual battle. It tracks a single ever-increasing `battleTier` number on the player, gated by the combined strength of the player's **best 3 owned cards** (not the 3-card battle deck the player actually fights with). This document is the single source of truth for **the most commonly confused distinction in this subsystem**: Max Total Power here is computed from the player's whole card collection, live, every time this screen renders — it has no relationship to whatever team is currently slotted into the "Form Team" battle deck.

Source files read in full:
- `src/components/features/tier/BattleTierScreen.tsx`
- `src/config/tierConfig.ts`
- `src/store/selectors.ts` (`selectTop3Cards`, `selectMaxTP`, `selectTierThreshold`, `selectCanUpgradeTier`, `selectPlayerTier`)
- `src/store/slices/playerSlice.ts` (`increaseBattleTier` reducer only)

## Data Model (schema; suggested C# class/ScriptableObject shape)

```csharp
public class TierProgressionConfig   // maps to tierConfig.ts constants
{
    public const int TierRewardGems = 30;
    public const int TierRewardGold = 1000;

    public static int GetTierThreshold(int currentTier) => currentTier * 100;
}

// Derived, computed live from inventory — NOT stored/persisted separately
public class TierProgressSnapshot
{
    public List<CardInstance> topThreeCards;   // by (pow+spd+def) descending, top 3 of the WHOLE inventory
    public int maxTotalPower;                   // sum of those 3 cards' (pow+spd+def)
    public int currentTier;                      // player.battleTier, persisted
    public int threshold;                         // GetTierThreshold(currentTier)
    public bool canUpgrade;                       // maxTotalPower >= threshold
}
```

## UI Layout (every element, hierarchy, states)

Top to bottom, scrollable content area:
1. **Tier emblem** — a large shield graphic (`/assets/icons/rank-shield.webp`) with the current tier number overlaid, sitting on top of an animated `CircleBackground` (a magic-circle effect that only visually "charges" while `viewState === "ANIMATING"`).
2. **Progress bar** — a filled horizontal bar, label reads **"Progress to Tier {currentTier + 1}: {maxTP} / {threshold}"**.
3. **Two side-by-side info panels**:
   - Left (wider): **"Max Total Power (Top 3 Cards): {maxTP}"** header, with the actual top-3 card thumbnails (via `CollectionCard`, info-hidden) and their names displayed beneath.
   - Right: static "Rewards:" preview always showing the flat next-tier reward — `+30 Gems`, `+1000 Gold` (these numbers never change per tier; see Numbers & Formulas).
4. **"Increase Tier" button** (bottom, sticky) — disabled/greyed whenever `canUpgrade` is false; tapping it while enabled runs the full upgrade sequence (below).
5. **TierUpModal** (conditionally rendered overlay when `viewState === "REWARD"`) — "Tier Increased!" header, the shield graphic showing the **new** tier number with a slow idle bob/rotate/brightness-pulse loop, a Rewards Unlocked panel (+30 Gems / +1000 Gold), and a "Collect" button that dismisses the modal back to the main view.
6. A full-screen white flash overlay (`showFlash` state) used purely as a timed visual beat during the upgrade animation.

## Behavior & Logic

### Total Power — clarifying the common point of confusion

`selectTop3Cards` (`src/store/selectors.ts:16-29`) sorts the player's **entire `inventory`** array descending by `(state.pow + state.spd + state.def)` and takes the top 3. `selectMaxTP` (`selectors.ts:32-41`) sums those 3 cards' `(pow + spd + def)`.

**This is completely independent of the "Form Team" battle deck** documented in [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md). A player could have their weakest 3 cards slotted into their active battle deck (for whatever reason — testing, a specific matchup, an unfinished loadout) while their actual strongest 3 cards sit unused in the collection; the Battle Tier screen's Max Total Power figure always reflects the latter (best 3 in the whole collection), never the former (currently-equipped battle deck). There is no UI on this screen that shows or depends on the equipped battle deck at all.

### Tier threshold and upgrade gate

```
threshold = getTierThreshold(currentTier) = currentTier * 100
canUpgrade = maxTotalPower >= threshold
```

`getTierThreshold` (`tierConfig.ts:4-9`): Tier 1 requires 100 Max TP to reach Tier 2; Tier 2 requires 200 Max TP to reach Tier 3; Tier N requires `N * 100` Max TP to reach Tier N+1. Linear, self-scaling — there is no cap defined; the threshold grows forever as the player advances.

### Upgrade action & reducer

`increaseBattleTier()` (`playerSlice.ts:193-198`) is a pure, ungated reducer:
```
state.battleTier += 1
state.gems += 30       // TIER_REWARD_GEMS
state.gold += 1000      // TIER_REWARD_GOLD
```
Gating is entirely enforced by the **UI/selector layer** (`canUpgrade`), not the reducer itself — the reducer will happily execute if dispatched directly regardless of `maxTP`. The screen's `handleUpgrade` function only dispatches it behind an `if (canUpgrade || force)` check (the `force` path is wired to a commented-out demo button in the source, effectively unused in the live UI).

**No cards are consumed and no "spend" happens on tier-up** — it is purely a progress-gate-then-reward action; the player's inventory is untouched by leveling up their tier.

### Upgrade sequence — exact step-by-step (`handleUpgrade`, `BattleTierScreen.tsx:192-229`)

1. **t=0ms**: Snapshot `prevStats = { tier: currentTier, limit: threshold }` (used to keep the OLD tier number displayed during the charge-up animation, before the actual state mutation happens). `viewState = "ANIMATING"` set immediately. A single haptic pulse fires immediately: `navigator.vibrate(200)` (200ms buzz), guarded by a `typeof navigator !== "undefined" && navigator.vibrate` check.
2. **t=0 → 1500ms**: The shield emblem plays a 1.5-second charge-up animation (framer-motion, keyframed): scale grows `1 → 1.02 → 1.05 → 1.1`, an intensifying shake (`x` offset oscillating with growing amplitude across 11 keyframe steps, up to ±4px), and brightness filter ramping `1 → 1.2 → 1.5 → 2.5`. The `CircleBackground` behind it also switches into its "charging" visual mode for this same window.
3. **t=1200ms**: `showFlash = true` — a full-screen white overlay begins fading in (300ms CSS transition).
4. **t=1500ms**: **`dispatch(increaseBattleTier())` fires here** — this is the exact moment `battleTier`/`gems`/`gold` actually change in the store, roughly synced to the visual "flash peak."
5. **t=1600ms**: `viewState = "REWARD"` (shows `TierUpModal`, now displaying the already-updated `currentTier`), `showFlash = false` (flash overlay begins fading back out), and a second haptic pattern fires: `navigator.vibrate([100, 50, 100])` (100ms buzz, 50ms pause, 100ms buzz).
6. Player taps **"Collect"** on the modal → `viewState = "MAIN"`, returning to the normal screen (now showing the new tier, new threshold, and a progress bar recalculated against the new, higher threshold).

### Gating Step-Up difficulty access via `requiredPower`

Each `BattleMode` in `battleModes.ts` (see [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md)) declares a `requiredPower` value (100/225/420/600 across the 4 configured modes). **This is checked against the currently-equipped 3-card battle deck's total power** on the Deck Selection screen (`DeckSelectionScreen.tsx`), not against `battleTier` or `maxTP` from this screen directly — there is no code anywhere that reads `player.battleTier` to lock or unlock a Step-Up mode outright. The connection between this Battle Tier screen and Step-Up access is therefore **indirect**: raising your Battle Tier has no mechanical gating effect on which Step-Up modes you can attempt; what actually gates Step-Up access is having your **equipped battle deck's** total power meet `requiredPower` — and (per doc 17) even that gate is advisory-only (a warning modal with a "Fight anyway" bypass), never a hard lock. Grinding for a stronger inventory (which raises Max TP, and separately lets the player build a stronger 3-card battle deck) is the practical, but not code-enforced, link between "raising your tier" and "clearing harder Step-Up fights." Port this relationship as designed rather than assuming `battleTier` is read anywhere as an explicit unlock flag — it currently is not.

## Animations & Timing

| Offset | Event |
|---|---|
| t=0 | `viewState = "ANIMATING"`; haptic buzz (200ms) fires; shield charge-up animation begins (1.5s total) |
| t=1200ms | White flash overlay begins fading in (300ms fade) |
| t=1500ms | `increaseBattleTier()` dispatched — actual tier/currency state change happens here |
| t=1600ms | `viewState = "REWARD"` (modal appears); flash fades back out; second haptic pattern (100ms/50ms pause/100ms) fires |
| ongoing (modal open) | Shield icon in the modal loops a slow idle bob + slight rotate + brightness pulse, 3s cycle, infinite, purely decorative |

Progress bar fill itself animates independently: `width: 0 → {progressPercent}%` over 1s ease-out whenever the underlying `maxTP`/`threshold` values change (i.e., on screen mount and again after a tier-up resets the denominator).

## Numbers & Formulas

| Value | Formula / Number | Source |
|---|---|---|
| Max Total Power | `Σ (pow+spd+def)` of the top 3 cards in the **entire inventory**, sorted descending | `selectors.ts:16-41` |
| Tier threshold | `currentTier × 100` | `tierConfig.ts:4-9` |
| Can-upgrade condition | `maxTP >= threshold` | `selectors.ts:49-52` |
| Tier-up reward — gems | flat 30 (`TIER_REWARD_GEMS`), same every tier | `tierConfig.ts:1` |
| Tier-up reward — gold | flat 1000 (`TIER_REWARD_GOLD`), same every tier | `tierConfig.ts:2` |
| Starting tier | 1 | `playerSlice.ts:34` |
| Haptic pulse 1 (upgrade start) | 200ms single buzz | `BattleTierScreen.tsx:204-206` |
| Haptic pulse 2 (reward reveal) | pattern `[100, 50, 100]` ms | `BattleTierScreen.tsx:224-226` |
| Charge animation duration | 1500ms | `BattleTierScreen.tsx:276-289` |
| Flash-in delay | 1200ms | `BattleTierScreen.tsx:211-213` |
| Reducer dispatch delay | 1500ms | `BattleTierScreen.tsx:216-218` |
| Reward modal shown delay | 1600ms | `BattleTierScreen.tsx:221-227` |

## Assets Used

- `/assets/icons/rank-shield.webp` — tier emblem (main screen and modal).
- `/assets/icons/gem.webp`, `/assets/icons/gold-coin.webp` — reward icons (right info panel and the TierUpModal).
- `CircleBackground` component (`src/components/features/tier/CircleBackground.tsx`) — magic-circle backdrop behind the shield emblem, with a distinct charging visual state.
- `CollectionCard` component (reused from the Collection screen) — renders the top-3 card thumbnails with `hideInfo={true}`.

## Cross-References

- [08-player-progression-currencies.md](08-player-progression-currencies.md) — full currency/reducer reference, includes this same tier reward formula cross-referenced from the other direction
- [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md) — `requiredPower` per Step-Up mode, and how the (unrelated) equipped-deck power check works
- [17-battle-flow-overview.md](17-battle-flow-overview.md) — confirms the required-power gate is advisory-only, never a hard lock
- [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md) — `Card` stat schema used for the Total Power sum

## Unity Porting Notes

- **This is the single most important clarification for this screen: "Max Total Power" is derived live from the player's full card inventory (best 3 owned cards), completely independent of whatever 3 cards are currently equipped as the active battle deck.** Do not wire this screen's power calculation to the same deck data used by `DeckSelectionScreen` — they are two separate computations over two separate data sources (`inventory` vs. the saved battle deck) that happen to use the same underlying stat-sum formula.
- **`battleTier` does not mechanically gate anything else in the current codebase.** It is a pure number-go-up meta-progression loop with a flat reward, not an unlock system. If the Unity port wants Battle Tier to actually unlock Step-Up difficulties, that is a new feature to design, not a faithful port of existing gating logic.
- **The reward is flat (30 gems / 1000 gold) regardless of which tier is being reached** — Tier 1→2 and Tier 50→51 pay identically. Confirm with the designer whether this is the final intended balance (a flat reward against an ever-rising threshold implies steeply diminishing returns at high tiers) before treating it as tuned.
- **No inventory cost/consumption on tier-up** — purely a threshold check followed by a currency grant. Don't add a hidden "spend cards" cost unless explicitly designed.
- **The upgrade animation's dispatch timing (t=1500ms) is decoupled from the visual flash peak and the modal appearance (t=1600ms)** — preserve this staggered timing (rather than mutating state and showing the modal in the same frame) to keep the "flash → reveal new tier" beat feeling intentional in the Unity version.
