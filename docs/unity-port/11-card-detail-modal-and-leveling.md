# Card Detail Modal and Leveling (Fusion) Flow

## Purpose / Overview

Two connected screens:

1. **Card Detail Modal** (`CardDetailModal.tsx`) — a draggable bottom sheet opened by tapping any card tile (Collection Screen, or elsewhere). Shows the card's live stats and offers two actions: **Level Up** and **Rank Up**.
2. **Level-Up Screen** (`LevelUpScreen.tsx`) — a full-screen "fusion" flow opened from the Level Up button. The player selects other owned card copies as XP "fodder", feeds them to the target card for XP/levels, and gold is spent per fodder card. This is the game's only duplicate/fusion sink — there is no separate "shard" currency.

There is also a secondary full-card-art viewer, `CardInfoModal.tsx`, reached by tapping the card portrait inside either of the above.

Source: `src/components/features/collection/CardDetailModal.tsx`, `LevelUpScreen.tsx`, `LevelUpAnimation.tsx`, `LevelUpPopup.tsx`, `CardInfoModal.tsx`, `CardInfoLevelProgressBar.tsx`; reducer logic in `src/store/slices/playerSlice.ts`.

## Data Model

No new persisted fields — this flow reads/writes the same `CardInstance` records described in doc 07 / doc 10. Relevant subset:

```csharp
public class CardInstance {
    public string DefinitionId;   // shared "id" across duplicates
    public string InstanceId;     // unique per copy
    public Rarity Rarity;
    public int Level;
    public int Experience;        // XP progress toward next level (resets to 0/overflow on level-up)
    public CardStats Stats;       // pow/spd/def, +2 each per level gained
}

// Ephemeral, screen-local state only — not persisted
public class LevelUpPreview {
    public List<string> SelectedFodderInstanceIds;
    public int SelectedXpTotal;
    public int PredictedLevel;
    public int PredictedXp;
    public int GoldCost;          // SelectedFodderInstanceIds.Count * 10
}
```

Deck-lock lookup (which instances are currently in the player's active battle deck) is read from the same source described in doc 12 — in Unity this should be a simple in-memory/save "current deck instance IDs" set, not a localStorage blob (see doc 12 Porting Notes).

## UI Layout

### 1. Card Detail Modal (`CardDetailModal.tsx:58-349`)

Rendered into a portal target (`#game-viewport`) so it always overlays the whole game frame regardless of which screen opened it.

- **Backdrop** — full-screen, black at 60% opacity, blurred, tap-to-close. Hidden/non-interactive while the Level-Up Screen overlay is open.
- **Bottom sheet** (`#bottom-sheet-single-card`) — rounded top corners, white background, max height 90% of viewport, slides up from off-screen.
  - **Drag handle** — small horizontal pill at the top, purely decorative (indicates the sheet is draggable).
  - **Title** — card name, centered, bold.
  - **Top row** (image + stats), 2 columns:
    - **Left (1/3 width)**: card portrait, aspect 2:3, 4px inset rarity-colored border, rarity name label pill at the bottom edge of the image. Tapping the portrait opens `CardInfoModal` (the full lore/stats viewer).
    - **Right (2/3 width)**:
      - `CardInfoLevelProgressBar` showing current level and XP progress (see component breakdown below).
      - 2×2 stat grid, each cell an icon + label + value, wrapped in a tooltip-on-click:
        - Row 1: **POWER** (`/assets/icons/power.webp`) | **Speed** (`/assets/icons/speed.webp`)
        - Row 2: **Defense** (`/assets/icons/defense.webp`) | **Type** (element/set icon via the shared `TypeIcon` component, driven by `card.setName`)
      - Two side-by-side action buttons:
        - **Level Up** — purple gradient pill button, gold border, animated diagonal "sheen" sweep loops every ~5s (2s sweep + 3s pause). Disabled + greyscale + tooltip ("Max Level Reached. Increase Player Level to upgrade.") when the card is already at the player's account level cap.
        - **Rank Up** — visually identical pill button style but **permanently disabled/greyscale** (see Porting Notes — this is a stub).

### 2. Card Info Modal (`CardInfoModal.tsx`)

A separate full-screen (not bottom-sheet) overlay, centered content card, light parchment-style background (`/assets/background/light-bg.webp`), used as a "zoomed in" lore/stat viewer:

- Header: "Card Info" title + close (X) button.
- Large card portrait (2/3 width, centered), 4px inset rarity border, rarity name overlay near the bottom of the art.
- Stats box: card name header, then a single row of `POW: x`, `SPD: x`, `DEF: x`, `Level: x`, divider line, then a "Lore" section rendering `card.description`.

### 3. Level-Up (Fusion) Screen (`LevelUpScreen.tsx:269-501`)

Full-screen, replaces the bottom sheet (slides in from the bottom, same spring transition) while the Card Detail Modal is pushed fully off-screen behind it.

- **Top bar** — Back button + gold-coin counter (no gems shown).
- **Fixed header** (does not scroll):
  - Target card thumbnail (small, aspect 2:3, 2px inset rarity border).
  - Card name + "Max LVL {playerLevel}" label.
  - `CardInfoLevelProgressBar` reused, showing **live predicted** level/XP as fodder is selected (falls back to the card's actual current level/XP when nothing is selected).
  - Small "(+{selectedXp})" green delta label next to the bar when fodder is selected.
  - **LEVEL UP** confirm button — purple gradient, shows the gold cost inside a dark pill (or "Not Enough Gold" in red-ish styling when the player can't afford it); disabled when no fodder is selected or gold is insufficient.
  - **`[DEV] Add 10,000 Gold`** — small blue underlined text link beneath the confirm button. **Debug-only leftover; omit entirely from the Unity port** (see Porting Notes).
  - Divider line.
- **Filter/sort bar** (sticky under the header): rarity pills `ALL / COMMON / UNCOMMON / RARE`, and an "XP ↑/↓" sort toggle button (right-aligned) that flips fodder sort order.
- **Scrollable fodder grid** — 3-column grid of `FodderCard` tiles (see below), infinite-scrolled via an `IntersectionObserver` sentinel at the bottom (not a manual scroll handler like the Collection Screen). Empty state: italic "No cards available" text spanning all 3 columns.
- **Level-Up Animation overlay** — shown after a successful confirm (see Animations section).
- **Card Info Modal** — re-used here too, opened by long-pressing (1000ms press-and-hold) a fodder tile, to let the player inspect it before feeding it.

#### FodderCard tile (`LevelUpScreen.tsx:504-649`)

Same visual base as a `CollectionCard` (rarity brush-stroke background, 4px inset rarity border, image, `Lvl {n}` badge — here bottom-center instead of top-left, colored with the rarity color as a solid pill background) plus fusion-specific states:

- **Selected**: border/glow switches to a thick gold ring (`0 0 0 3px #fbbf24` + glow), tile scales down slightly (0.95×), a centered gold checkmark icon (`/assets/icons/correct.webp`, tinted gold) overlays the art with a warm gradient wash.
- **Locked** (either "in active deck" or "same base card as the target = reserved for future Rank Up"): art desaturated (50% greyscale), whole tile dimmed to 80% opacity, a grey padlock icon overlay, plus a small colored tag: blue **"IN DECK"** or purple **"RANK UP"**.
- Tap toggles selection (unless locked). Press-and-hold for 1000ms opens the read-only `CardInfoModal` for that card instead of toggling selection (a `isLongPressTriggered` ref suppresses the click that would otherwise fire on release).

## Behavior & Logic

### Card Detail Modal

1. On open, the modal re-resolves the "active card" live from `inventory` by `instanceId` every render, so any change (e.g. after a level-up) is reflected without needing to be re-opened (`CardDetailModal.tsx:44-47`).
2. `isMaxLevel = activeCard.level >= playerLevel` — a card can never be leveled past the player's own account level. This gate disables the Level Up button entirely, with an explanatory tooltip.
3. Tapping **Level Up** (when not max level) plays a click sound and opens the Level-Up Screen as a full overlay.
4. Tapping **Rank Up** just plays a click sound and logs `"Debug - Rank up coming soon"` to the console — no state changes. It is coded as unconditionally disabled (`CardDetailModal.tsx:303-306`, the ternary condition is a hardcoded `true`), so it is not reachable behind any future flag either; it is dead-end placeholder UI only.
5. Dragging the sheet down (`dragElastic` top 0.1 / bottom 0.8) past **100px offset** or with a **downward velocity over 500** closes it (spring-animated back off-screen, then unmounts).
6. Tapping the backdrop also closes it. Tapping the card portrait opens `CardInfoModal` instead (and hides the bottom sheet/backdrop while that's open).

### Level-Up (Fusion) Screen

Step-by-step (`LevelUpScreen.tsx:40-267`):

1. **On mount**, load the active battle-deck's instance IDs from persistent storage (`player_deck_v1`, see doc 12) into a local `Set` used purely for the fodder-locking check below — this screen does not otherwise interact with deck data.
2. **Available fodder list** = full inventory, minus the target card's own instance, optionally filtered by rarity pill, then sorted with **locked cards always pushed to the bottom**, and unlocked cards ordered by their fodder XP value (ascending or descending per the XP sort toggle).
   - A card is **locked** (cannot be selected) if: its `instanceId` is in the active-deck set, **or** its `id` (base definition, not instance) equals the target card's `id` — i.e. true duplicates of the card being leveled are reserved and cannot be fed as generic XP fodder.
3. **Selecting/deselecting fodder** (`handleToggleCard`): locked cards ignore taps entirely. Otherwise toggling is free — there is **no cap on how many fodder cards can be selected** — except once the **live prediction** shows the target card would reach the player's level cap, no *additional* cards can be added (existing selections can still be removed).
4. **Live XP/level prediction** runs on every render from the current selection (`LevelUpScreen.tsx:162-194`):
   - Sum the fodder XP value (see formula table) of every selected instance → `selectedXp`.
   - Starting from the target card's current level/XP, repeatedly: compute XP needed for the next level (`level * 100`); if `selectedXp` covers it, subtract, increment predicted level, reset predicted XP to 0, and continue; otherwise add the remainder to predicted XP and stop. The loop also stops the instant `predictedLevel` reaches the player's account level (cards cannot be predicted, or actually leveled, past that cap).
   - The progress bar and level badge update live using this prediction while any fodder is selected; with nothing selected they show the card's real current level/XP.
5. **Confirm** (`handleConfirmLevelUp`, `LevelUpScreen.tsx:212-262`):
   - Compute `goldCost = selectedInstanceIds.length * 10`; abort if the player can't afford it (button is also disabled in that case, this is a defensive re-check).
   - Compute `levelsGained = predictedLevel − currentLevel` and the corresponding before/after stat block (`+2 POW / +2 SPD / +2 DEF` per level gained), purely for driving the results animation — this is **not** where the authoritative stat math happens.
   - Spend the gold, then dispatch the actual fusion reducer (`consumeCardsForXp`) with the target instance ID and the list of consumed fodder instance IDs. That reducer (see below) is the source of truth for the resulting level/XP/stats.
   - Clear the current selection.
   - If at least one level was gained, log quest progress (`CARD_LEVEL_UP`, +1) and show the level-up results animation.

### Authoritative fusion reducer — `consumeCardsForXp` (`src/store/slices/playerSlice.ts:104-177`)

This is the ground truth; re-implement this exact algorithm in Unity rather than trusting the screen's prediction math to always agree with it (they are two separate implementations of the same formula in the source and could in principle drift):

1. Find the target card by `instanceId`; abort if not found.
2. For every consumed instance ID, look up its rarity + level in the (still-intact) inventory and sum `baseXpForRarity(rarity) * card.level` into `totalXpToAdd`. (Unlike the screen's helper, the reducer does **not** apply the 5000-per-card cap — see Porting Notes discrepancy below.)
3. Remove all consumed instances from the inventory.
4. Re-fetch the target card (post-removal) and add `totalXpToAdd` to its `experience`.
5. Loop: while `currentLevel < playerAccountLevel` and `currentXp >= currentLevel * 100`: subtract the threshold from `currentXp`, increment `currentLevel`, and add `+2` to each of `pow`/`spd`/`def`. Stop as soon as either condition fails (excess XP beyond the level cap is simply retained on the card, not discarded, but produces no further level-ups once the cap is hit).
6. Write the final `level` and `experience` back onto the card.

## Animations & Timing

| Animation | Where | Timing |
|---|---|---|
| Level Up button sheen sweep | Card Detail Modal | Loops: 2s sweep, then 3s pause, repeat indefinitely |
| Rank Up button sheen sweep | Card Detail Modal (still animates even though disabled) | Same 2s sweep / 3s pause loop |
| Bottom sheet enter/exit | Card Detail Modal | Spring (`damping: 30, stiffness: 300`) |
| Sheet drag-to-dismiss | Card Detail Modal | Real-time drag; commits to close if `offset.y > 100px` or `velocity.y > 500` |
| Level-Up Screen slide-in | Replaces bottom sheet | Spring (`damping: 30, stiffness: 300`), from `y:"100%"` |
| Fodder tile select/deselect | Level-Up Screen grid | 0.2s ease-in-out (border glow + 0.95× scale) |
| **Level-Up "feeding" animation** (`LevelUpAnimation.tsx`) | After a successful confirm with `levelsGained > 0` | See sequence below |
| Level entrance flash overlay | Wraps the animation | White full-screen flash, opacity 1→0 over 0.4s ease-out, blend-mode overlay |

### Level-Up Animation sequence detail (`LevelUpAnimation.tsx:261-412`)

This is a scripted particle sequence, not a data-driven system — port it as a fixed cutscene sequence:

1. **Entrance delay** — 450ms after mount before anything starts (lets the parent's spring-in settle first).
2. **"Feeding" phase** — 3 card-shaped particles fly in one at a time from off-screen (bottom-left, bottom-right, bottom-center) toward the target card, each flight taking 0.5s, launched at staggered delays of `0ms, 600ms, 1200ms` (`FEEDER_INTERVAL = 600ms`). Each arrival triggers:
   - A "thud" squash/stretch on the target card (0.2s).
   - A burst of impact particles: 4 small arrow glyphs + 12 radiating spark dots (colors alternate gold/white), fired ~100ms before each card's flight technically completes (`impactTime = (delay+duration)*1000 - 100`).
   - Total feeding duration: `FEEDER_COUNT(3) * FEEDER_INTERVAL(600) + 500 = 2300ms`.
3. **"Burst" phase** — at `TOTAL_FEED_TIME` (2300ms), the target card gets a bigger glow/scale-up (1.1×) and 30 upward-floating arrow particles spawn with randomized position/scale/rotation and staggered delay (0–0.5s), each animating over 1.5s.
4. **"Finished" phase** — 1500ms after the burst starts, the **Results panel** slides up from the bottom (0.5s ease-out): "LEVELED UP!" header, then Level / POW / SPD / DEF rows each showing `old → new` with an up-arrow, culminating in an **OK** button that closes the overlay and returns to the fodder-selection screen (fresh, selection already cleared).
5. Approximate total time from confirm-tap to results-panel-visible: **~450ms (entrance) + 2300ms (feeding) + 1500ms (burst) ≈ 4.25s**, then the results panel is user-paced (no auto-dismiss).

## Numbers & Formulas

| Value | Formula |
|---|---|
| Fodder XP value per consumed card | `baseXp(rarity) * card.level`, where `baseXp` = **Common 50 / Uncommon 100 / Rare 200** |
| Fodder XP display cap (screen-side helper only) | `min(computedValue, 5000)` — **not applied by the authoritative reducer**, see Porting Notes |
| Gold cost | `10 gold × number of fodder cards selected` |
| Card XP-to-next-level | `currentCardLevel × 100` (identical formula/shape to player account leveling) |
| Stat gain per card level | `+2 POW, +2 SPD, +2 DEF` |
| Card level ceiling | Player's account level (`state.player.level`) — a card can never out-level the player |
| Fodder selection limit | None, other than the target reaching the player's level cap (blocks *adding more*, not removing) |
| Card Detail sheet dismiss thresholds | drag `offset.y > 100px` OR `velocity.y > 500` |
| Fodder grid page size / increment | 21 / 21 (IntersectionObserver-triggered, not scroll-position-triggered) |
| Long-press duration to open Card Info from a fodder tile | 1000ms |

## Assets Used

- `/assets/icons/power.webp`, `/assets/icons/speed.webp`, `/assets/icons/defense.webp` — stat icons (Card Detail Modal stat grid)
- `/assets/icons/gold-coin.webp` — gold cost icon on the Level-Up confirm button
- `/assets/icons/correct.webp` — selection checkmark on selected fodder tiles (tinted gold via CSS filter)
- `/assets/icons/rare_stroke.webp`, `/assets/icons/uncommon_stroke.webp`, `/assets/icons/common_stroke.webp` — rarity brush-stroke backgrounds (target card + fodder tiles)
- `/assets/background/light-bg.webp` — parchment background for Card Info Modal and the Level-Up Screen's base layer
- Element/type icons resolved dynamically per card via `TypeIcon` → `/assets/icons/{normalizedSetName}.webp`
- Each card's own `card.image`

## Cross-References

- [10-collection-screen.md](./10-collection-screen.md) — where the Card Detail Modal is opened from
- [07-data-model-cards-rarity.md](./07-data-model-cards-rarity.md) — `Card` schema, rarity colors
- [08-player-progression-currencies.md](./08-player-progression-currencies.md) — player account level (the leveling cap) and gold economy
- [12-deck-building-system.md](./12-deck-building-system.md) — the active-deck lock (`player_deck_v1`) referenced by the fodder-locking logic

## Unity Porting Notes

- **Rank Up is a non-functional stub.** In the current source, tapping it only logs a console message; the button is hardcoded disabled (`true` literal in the enable condition, `CardDetailModal.tsx:304`) and there is no reducer, no data field, and no UI screen for it anywhere in the codebase. **Design it fresh for Unity.** Per the design discussion this doc was commissioned under: Rank Up should **not** require hoarding exact-match duplicates of the same card ID (that's what the current "locked = same `id` as target" fodder rule implies, but it's dead-end plumbing, not a real mechanic). Instead, Rank Up fusion material should be **any card of the same rarity** as the target — i.e. decouple the "reserved duplicate" concept entirely and design Rank Up around a rarity-based material pool. Since none of the old logic is reusable, treat this as new feature design, not a port.
- **`LevelUpPopup.tsx` is dead code within this flow.** It's imported into `LevelUpScreen.tsx` (line 16) and its local state variable is literally named `showLevelUpPopup`, but that flag actually gates rendering of `<LevelUpAnimation>` (`LevelUpScreen.tsx:452-489`) — the `LevelUpPopup` component itself is never instantiated in JSX anywhere in this file. Its "rolling number" stat-comparison card design (old→new value that spring-animates upward) is not shown to players during card leveling. Do not treat it as the real level-up popup; `LevelUpAnimation.tsx`'s built-in results panel is what players actually see. (Note: an *unrelated*, differently-scoped `LevelUpPopup` local component exists in `HomeScreen.tsx` for the **player's account** level-up — do not confuse the two.)
- **XP cap discrepancy**: the screen's `getXpValue` helper caps a single fodder card's contribution at 5000 XP (used for the live prediction and the button's cost/level display), but the authoritative `consumeCardsForXp` reducer applies **no cap** when actually computing XP on confirm. In practice this only matters for very high-level Rare fodder (rarity 200 × level ≥ 25 exceeds 5000); decide which behavior you want in Unity and apply it consistently in both the preview and the real calculation (recommend: apply the cap in one place only, shared by both).
- **`[DEV] Add 10,000 Gold` button** (`LevelUpScreen.tsx:369-378`) is a leftover debug tool with no user-facing purpose — **omit it from the Unity port** entirely.
- The fodder-locking "IN DECK" check depends on the active deck's instance IDs (currently read from `localStorage["player_deck_v1"]`, loaded fresh on this screen's mount). In Unity, back this with a proper single source of truth for "current deck" (see doc 12) rather than a serialized snapshot re-read on each screen open — otherwise you risk the same class of staleness bug the source has (the deck list is loaded once on mount and not reactively updated if the deck changes in another tab/screen instance).
- Two independent implementations of the leveling math exist (screen-side prediction vs. reducer). For Unity, implement it **once** (e.g. a pure function `PredictLevelUp(CardInstance target, List<CardInstance> fodder, int playerLevel) -> (int newLevel, int newXp, CardStats newStats, int goldCost)`) and call that same function both for the live UI preview and for the actual commit, eliminating the drift risk described above.
