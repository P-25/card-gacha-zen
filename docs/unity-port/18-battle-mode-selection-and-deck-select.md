# Battle Mode Selection & Deck Select

## Purpose / Overview

This document covers everything between choosing a battle mode and the moment the real-time engine takes over: the Step-Up difficulty list, the full `battleModes.ts` configuration (every mode's opponent-deck rule set), the "Form Team" (Deck) and "Echo Loadout" (Card Select) screens, and the two fixed-duration transition screens (Matchmaking fake-search, Versus splash) that bookend them.

Source files read in full:
- `src/components/battle/StepUpBattle.tsx`
- `src/config/battleModes.ts`
- `src/components/battle/DeckSelectionScreen.tsx`
- `src/components/battle/SelectCardsPhase.tsx`
- `src/components/battle/MatchmakingPhase.tsx`
- `src/components/battle/VersusPhase.tsx`
- `src/lib/rarityStyles.ts` (border colors / brush-stroke assets reused across all these screens)

## Data Model (schema; suggested C# class/ScriptableObject shape)

```csharp
[System.Serializable]
public class OpponentDeckRule
{
    public Rarity rarity;     // COMMON | UNCOMMON | RARE
    public int level;
    public int count;
}

[System.Serializable]
public class BattleModeConfig     // one per Step-Up difficulty tier — good fit for a ScriptableObject
{
    public string id;
    public string title;
    public string subtitle;           // defined but NOT currently rendered anywhere (see UI Layout note)
    public string iconPath;
    public int requiredPower;         // advisory only — see 17-battle-flow-overview.md
    public List<OpponentDeckRule> opponentDeckRules;
}
```

## UI Layout (every element, hierarchy, states)

### Step-Up difficulty list — `StepUpBattle.tsx:17-82`

- Header: back button (top-left, translucent circle) + centered title "Step-Up Battle".
- Scrollable vertical list of one row per entry in `BATTLE_MODES` (currently 4), staggered fade/slide-in (`delay: index * 0.1`, framer-motion).
- Each row: 48×48 icon image (`mode.icon`) · title (`mode.title`, uppercase) · a line of text reading **"Total Power Requirement: {mode.requiredPower}"** · a decorative info icon (Lucide `Info`, non-interactive, no `onClick`).
  - **Note:** `BattleMode.subtitle` is a defined config field but the row explicitly comments out rendering it (`StepUpBattle.tsx:68`, `{/* {mode.subtitle} */}`) in favor of always showing the required-power line instead. `subtitle` is dead data currently.
- Tapping a row calls `onSelectMode(mode.id)`.

### `battleModes.ts` — full configuration table

| id | title | requiredPower | opponentDeckRules (rarity × level → count) | Total opponent cards |
|---|---|---|---|---|
| `beginner` | BEGINNER SOLO | 100 | COMMON Lv.3 ×1, COMMON Lv.1 ×2 | 3 |
| `intermediate` | INTERMEDIATE SOLO | 225 | RARE Lv.1 ×2, UNCOMMON Lv.6 ×1 | 3 |
| `advanced` | ADVANCED SOLO | 420 | RARE Lv.12 ×2, RARE Lv.11 ×1 | 3 |
| `expert` | EXPERT SOLO | 600 | RARE Lv.22 ×3 | 3 |

Every mode's rule counts sum to exactly 3 — this matches the player's fixed 3-card deck size and is an implicit invariant to preserve if new modes are added in Unity (a mode whose rule counts don't sum to 3 would silently produce a mismatched-size opponent deck; nothing in the code enforces this at config-authoring time).

Icons referenced (`icon` field): `/assets/icons/easy.webp` (beginner), `/assets/icons/hard.webp` (intermediate), `/assets/icons/very-hard.webp` (advanced), `/assets/icons/expert.webp` (expert). A `fallbackIcon` emoji field also exists per mode (🛡️/⚔️/🐉/👑) but is not read anywhere in `StepUpBattle.tsx` — dead data, same as `subtitle`.

See [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md) for exactly how `opponentDeckRules` is consumed to build the actual opponent deck (the rule-based generator branch).

### Deck Selection Screen — "Form Team" — `DeckSelectionScreen.tsx`

Layout, top to bottom:
1. Header — back button, "Form Team" title, gold underline rule.
2. If a battle mode is active: mode title + `"Total Power Requirement: {requiredPower}"` subheading (`DeckSelectionScreen.tsx:118-131`). For Wild Mode (`selectedBattleModeId = "wild"`, unresolvable), this block doesn't render since `getBattleModeById` returns `undefined` — no title, no requirement line shown.
3. Stats summary pill: **Total Power** (sum of POW+SPD+DEF across all 3 slotted cards; shown in red if below `requiredPower`) and **Cards** count (`{deck.length}/3`, orange until 3, green at 3).
4. 3 deck slots (empty = dashed border + "➕ Add Card" placeholder; filled = card art + rarity-colored brush-stroke background + level badge + POW/SPD/DEF footer + rarity border). **Tapping any slot (filled or empty) navigates to the Select phase** — there is no per-slot "remove" action on this screen, only "go edit the whole loadout."
5. Bottom action row: **Auto-form** (ghost button) and **Enter** (primary button, disabled unless exactly 3 cards are slotted).
6. Hidden debug button (🐞, top-right) that dumps a freshly-generated opponent deck to the console via `console.table` — a dev tool only, not part of the player-facing flow, skip in the port.
7. Conditional "Insufficient Power" warning modal (see [17-battle-flow-overview.md](17-battle-flow-overview.md) for the advisory-only gating behavior) with **Retreat** (dismiss) / **Fight** (dismiss and start anyway) buttons.

**Auto-form algorithm** (`handleAutoForm`, `DeckSelectionScreen.tsx:96-130`):
1. Deduplicate the player's full inventory by card `id`, keeping whichever duplicate instance has the higher `(state.def + state.pow)` sum.
2. Sort the deduplicated list descending by `(state.def + state.pow)`.
3. Take the top 3.

**Note the SPD stat is excluded from this ranking** — Auto-form optimizes for `POW + DEF` only, even though the "Total Power" figure shown everywhere else (including the requirement gate) is `POW + SPD + DEF`. A card with very high SPD but modest POW/DEF could be auto-form-skipped in favor of a lower-total-power card. Flag this to the designer before deciding whether the Unity port should fix it (include SPD) or preserve it faithfully.

### Card Select Screen — "Echo Loadout" — `SelectCardsPhase.tsx`

Layout, top to bottom:
1. Header: "Echo Loadout" title, gold underline.
2. 3 selection-slot preview row (same visual language as the Deck screen slots, smaller). Tapping a **filled** slot removes that card from the loadout. Empty slots show "Slot {n}".
3. Hint text: "Tap to fill slots."
4. Scrollable 3-column grid of the player's **entire inventory**, sorted descending by `(state.def + state.pow)` (`SelectCardsPhase.tsx:129-133` — again **SPD is excluded from the sort**, same quirk as Auto-form above). Initially renders 24 cards (`visibleCount = 24`); scrolling within 100px of the bottom loads 24 more (`SCROLL_INCREMENT = 24`) until the full inventory is shown (infinite-scroll pattern, `SelectCardsPhase.tsx:163-176`).
   - Each grid card shows: rarity brush-stroke background, card art, level badge, and a large stroked total-power number (`pow + def + spd` — this display DOES include SPD, unlike the sort order).
   - A card currently occupying one of the 3 slots renders a dark "IN USE" overlay and cannot be re-added by tapping it again in the grid (`toggleCardSelection(card, "list")` no-ops if the card is already selected — it can only be removed via the slot itself, not the grid tile) (`SelectCardsPhase.tsx:138-161`).
   - Tapping an unselected grid card fills the **first empty slot** (left-to-right), or does nothing if all 3 slots are already full.
5. Bottom "Ready" button — filters the 3 slots down to non-null cards and calls `onConfirm(deck)`, which (per doc 17) saves to `localStorage` and returns the flow to the **Deck** screen, not straight into Matchmaking.

### Matchmaking Screen — `MatchmakingPhase.tsx`

Full-screen overlay, centered content: a static loader image (`/assets/icons/loader.webp`, 256×256, 80% opacity — note it has no rotation/spin animation applied despite being named "loader") above the text "Preparing the Battle..." (fades/slides in over 0.5s) and a horizontal gradient bar that pulses (`scaleX: 0→1→0`, `opacity: 0→1→0`, 1.5s loop, infinite). **The entire screen is purely cosmetic filler for a fixed 3000ms `setTimeout`** (`MatchmakingPhase.tsx:23-34`) — the actual opponent deck (`generateOpponentDeck(playerDeck, selectedBattleModeId)`, see doc 19) is computed synchronously right when that timer fires, not progressively.

### Versus Screen — `VersusPhase.tsx`

Full-screen split-reveal splash, held for a fixed **3000ms** before auto-advancing (`VersusPhase.tsx:32-37`). Content and exact timing (all delays relative to component mount at t=0):

| Time | Event |
|---|---|
| t=0, duration 800ms, ease `circOut` | Opponent-side background panel wipes in from the right with a diagonal clip-path (`polygon(80% 0, 100% 0, 100% 100%, 20% 100%)`) |
| delay 400ms, duration 600ms | Player-side content block (avatar, name, 3-card deck preview — full stats, face-up) slides in from the left |
| delay 400ms, duration 600ms | Opponent-side content block (avatar icon, name, 3-card deck preview — **face-down**, all showing the shared card-back art) also animates in from an `x: -100` start offset, same as the player block — **this looks like a copy/paste of the player-block animation rather than a deliberate mirrored entrance** (it visually enters from the same direction instead of from the right, where its background panel came from); note this quirk if the Unity port wants to intentionally mirror it instead |
| delay 600ms, duration 400ms | Diagonal divider line draws across the screen (SVG `pathLength` 0→1) |
| delay 800ms, duration 300ms, ease `easeIn` | Center "VS" badge slams in — starts at `scale: 10, opacity: 0` (simulating "behind the camera") and animates to `scale: 1, opacity: 1` |
| delay 1000ms, duration 400ms | Whole-screen shake (small alternating x/y offsets), timed to land just after the VS badge's impact |
| t=3000ms | Automatic transition to the `BATTLE` phase (`onComplete()`), regardless of whether any of the above animations are still technically settling (they've all finished well before 3s) |

Player deck preview cards show real stats (POW/SPD/DEF footer); opponent deck preview cards are rendered fully face-down (card-back art only, no stats), reinforcing that the opponent's actual roster is a surprise until the battle itself begins.

## Behavior & Logic

See the transition table already fully documented in [17-battle-flow-overview.md](17-battle-flow-overview.md) — this document only elaborates the internals of each screen named there.

## Animations & Timing

Summarized inline above per-screen. Quick reference:

| Screen | Fixed duration | Key animation beats |
|---|---|---|
| Matchmaking | 3000ms | Pulsing gradient bar loop (1.5s cycle), static loader icon |
| Versus | 3000ms | Background wipe (800ms) → content slide-ins (600ms, delay 400ms) → divider draw (400ms, delay 600ms) → VS badge slam (300ms, delay 800ms) → screen shake (400ms, delay 1000ms) |

## Numbers & Formulas

| Value | Formula / Number | Source |
|---|---|---|
| Total Power (deck screen, requirement check) | `Σ(state.pow) + Σ(state.spd) + Σ(state.def)` across all slotted cards | `DeckSelectionScreen.tsx:53-62` |
| Auto-form ranking key | `state.def + state.pow` (SPD excluded) | `DeckSelectionScreen.tsx:121-123` |
| Card grid sort key (Echo Loadout) | `state.def + state.pow` (SPD excluded) | `SelectCardsPhase.tsx:129-133` |
| Card grid display total (per-tile number) | `state.pow + state.def + state.spd` (SPD included) | `SelectCardsPhase.tsx:29` |
| Initial grid page size | 24 cards | `SelectCardsPhase.tsx:122` |
| Grid infinite-scroll increment | 24 cards | `SelectCardsPhase.tsx:123` |
| Matchmaking delay | 3000ms | `MatchmakingPhase.tsx:31` |
| Versus splash hold | 3000ms | `VersusPhase.tsx:35` |
| Required power — beginner/intermediate/advanced/expert | 100 / 225 / 420 / 600 | `battleModes.ts:28,42,56,70` |

## Assets Used

- `/assets/icons/easy.webp`, `/assets/icons/hard.webp`, `/assets/icons/very-hard.webp`, `/assets/icons/expert.webp` — Step-Up mode row icons.
- `/assets/icons/loader.webp` — Matchmaking screen loader graphic.
- `/assets/icons/{common,uncommon,rare}_stroke.webp` — rarity brush-stroke background, via `getStrokeImage()` (`src/lib/rarityStyles.ts:16-25`), used on every card tile across Deck/Select/Versus screens.
- Card back art: `"./assets/Card_Art/back/card_001.webp"` — used for face-down opponent cards on the Versus screen. **Note the leading `./` relative path** (inconsistent with the `/assets/...` absolute-path convention used everywhere else in the codebase) — verify this resolves correctly if replicating the exact path structure; in Unity, just reference the sprite directly and this quirk is moot.

## Cross-References

- [17-battle-flow-overview.md](17-battle-flow-overview.md) — the phase state machine these screens plug into
- [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md) — how `opponentDeckRules` (rule-based branch) and the power-matching branch (Wild Mode) actually build the opponent's `Card[]`
- [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md) — `Card`/rarity schema
- [12-deck-building-system.md](12-deck-building-system.md) — related deck-building UI conventions

## Unity Porting Notes

- **SPD is silently excluded from both "pick my best cards" algorithms** (Auto-form and the Echo Loadout grid sort) but **included** in the Total Power figure used for the requirement gate and the per-tile power number. Decide deliberately whether to fix this for Unity (consistent formula everywhere) or preserve the quirk — it currently means a SPD-heavy card can rank lower in "recommended" lists than its true Total Power would suggest.
- **`subtitle` and `fallbackIcon` fields on `BattleMode` are configured but unused** by the current UI. Either wire them up in the Unity version or drop them from the ScriptableObject to avoid dead-data confusion.
- **The Matchmaking loader graphic doesn't actually animate/spin** despite the name — don't assume motion exists just because the asset is called "loader"; add a spin explicitly in Unity if that's the intended feel, since the JS source doesn't currently do it.
- **The Versus screen's opponent-side content slide-in direction likely has a copy/paste bug** (enters from the left like the player block, rather than mirrored from the right). Worth a deliberate decision when porting rather than blindly replicating a probable oversight.
- **Both Matchmaking and Versus are fixed-duration filler screens with no skip button** — a real matchmaking/versus UX. Preserve the "always exactly 3s" pacing unless product wants to add a skip.
