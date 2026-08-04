# Deck Building System

## Purpose / Overview

The 3-card team-building flow used before every battle. Two screens work together:

1. **"Form Team" screen** (`DeckSelectionScreen.tsx`) — the hub: shows the currently-assembled 3-card deck, its summed Total Power vs. the selected battle mode's power requirement, and lets the player enter the card-picker, auto-form a deck, or proceed to battle.
2. **"Echo Loadout" screen** (`SelectCardsPhase.tsx`) — the card picker: fills 3 slots from the player's full inventory.

Both are steps inside the larger `BattleFlow` phase machine (`BattleFlow.tsx`), which also owns the mechanism for persisting the chosen deck so other screens (Collection/Level-Up) know which card instances are currently "in use" and must be locked from being consumed as XP fodder.

Source: `src/components/battle/DeckSelectionScreen.tsx`, `src/components/battle/SelectCardsPhase.tsx`, `src/components/battle/BattleFlow.tsx`, `src/config/battleModes.ts`.

## Data Model

```csharp
// The in-progress / active deck — just an ordered list of up to 3 card instances.
// Slots are positional: index 0/1/2. A null/empty slot is allowed while building.
public class Deck {
    public CardInstance[] Slots = new CardInstance[3];
}

public class BattleMode {
    public string Id;
    public string Title;
    public string Subtitle;
    public int? RequiredPower;               // Total-Power gate for entering this mode
    public List<OpponentDeckRule> OpponentDeckRules; // not part of this doc's scope
}
```

Battle modes and their power requirements (`src/config/battleModes.ts`) — fixed config, not player data:

| Mode id | Title | Required Power |
|---|---|---|
| `beginner` | Beginner Solo | 100 |
| `intermediate` | Intermediate Solo | 225 |
| `advanced` | Advanced Solo | 420 |
| `expert` | Expert Solo | 600 |

## UI Layout

### Echo Loadout — card picker (`SelectCardsPhase.tsx:178-296`)

- **Title**: "Echo Loadout" with a decorative underline bar.
- **3 selected-card slots**, horizontally centered row: each slot is a fixed-size box (`96×144px`). Empty slots show a dashed gold border and "Slot {n}" placeholder text. Filled slots show the mini card (brush-stroke background, art, level badge top-left, 4px inset rarity border) and are tappable to **remove** that card back to an empty slot.
- Helper text: "Tap to fill slots".
- **Full inventory grid**, 3 columns, scrollable, infinite-scroll pagination identical in mechanics to the Collection Screen (see below). Each tile:
  - Same visual base as a `CollectionCard` (brush-stroke rarity art, 4px inset rarity border, `LV {n}` badge top-left, Total-Power number bottom-left on a light gradient strip).
  - If the card (matched by base `id`, not `instanceId`) is already occupying one of the 3 slots, an **"IN USE"** dark overlay covers the tile and taps on it from the grid are ignored (can only be removed via the slot itself, not by tapping it again in the grid).
- **Ready button** (bottom, fixed): confirms the current slot contents (nulls filtered out) and returns to the Form Team screen.

### Form Team — deck confirmation (`DeckSelectionScreen.tsx:71-340`)

- **Header**: Back button (top-left, floating), "Form Team" title with underline, and — only if a battle mode was selected on the way in — the mode's title + "Total Power Requirement: {n}" subtext.
- A small circular 🐞 **debug button** (top-right) that dumps a generated opponent deck to the console. **Debug-only, omit in Unity.**
- **Stats summary pill**: two stats side by side in a rounded glass panel: "Total Power" (turns red if below the mode's requirement) and "Cards" (`{count}/3`, orange until full, green at 3).
- **3 deck slots**, horizontally laid out, each ~1/3 of the available width (or fixed `144×208px` on larger screens): filled slots show the full card visual (brush-stroke art, level badge, rarity border, and — unique to this screen — a **3-column stat footer** showing POW/SPD/DEF numbers under the art) plus a rarity border. Empty slots show a dashed border and a "+ Add Card" placeholder. **Tapping any slot** (filled or empty) navigates to the Echo Loadout picker.
- Helper text: "Tap any slot to edit your deck".
- **Bottom action row**: 
  - **Auto-form** (ghost/outline button, left) — auto-assembles a deck (see logic below).
  - **Enter** (primary purple/gold button, right, disabled unless all 3 slots are filled) — proceeds to battle, or opens the Insufficient Power warning if under-powered.
- **Insufficient Power modal** (conditional overlay): red/orange top accent bar, "⚠️ Insufficient Power" heading, explanatory copy ("Your team power is slightly lower than recommended. The battle might be tougher than usual!"), a Required-vs-Your-Power comparison box, and two buttons: **Retreat** (closes the modal, stays on this screen) and **Fight** (closes the modal and proceeds to battle anyway — the requirement is a soft warning, never a hard block).

## Behavior & Logic

### Slot-filling (Echo Loadout)

1. Screen initializes its 3 local slots from whatever deck was passed in (`initialDeck`), positionally (first up to 3 cards fill slots 0/1/2 in order).
2. Tapping a card in the inventory grid (`source: "list"`): if that card's `id` already occupies a slot, the tap is a no-op (must be removed via the slot instead). Otherwise it's placed into the **first empty slot**, in order (no manual slot targeting from the grid).
3. Tapping a filled slot directly: removes that specific card back to an empty slot (this is the only way to clear a slot from the grid path).
4. Duplicate handling: matching is by base card `id`, so having two *different instances* of the same card definition — only one copy of any given card `id` can occupy the deck at a time via the grid-tap path (the "IN USE" overlay covers every instance sharing that `id`, not just the exact instance placed).
5. Inventory list sort: **fixed**, by `pow + def` descending (note: excludes `spd` — see Porting Notes). No filter/sort UI on this screen (unlike Collection/Level-Up).
6. Pagination: identical mechanics to Collection Screen — starts at 24 visible, +24 per scroll-near-bottom trigger (100px threshold).
7. **Ready** button always confirms whatever is currently in the 3 slots (1, 2, or 3 filled — no minimum enforced here; the 3-card minimum is enforced on the *next* screen instead, by disabling its Enter button).

### Deck confirmation (Form Team)

1. Derives `totalPOW`, `totalSPD`, `totalDEF` by summing each stat across all cards currently in the deck (nulls-safe), and `totalPower = totalPOW + totalSPD + totalDEF` — this is the **true** Total-Power formula (all three stats), consistent with the Collection Screen.
2. Looks up the selected battle mode's `requiredPower` (0/undefined if no mode was pre-selected, e.g. free/wild battles) and compares: `isPowerSufficient = totalPower >= requiredPower`.
3. `isReady = deck.length === 3` — the **Enter** button is disabled entirely until all 3 slots are filled, regardless of power.
4. Tapping **Enter** while ready:
   - If power is sufficient → proceed straight to battle.
   - If power is insufficient → show the Insufficient Power modal instead (does not block progress, just warns).
5. **Retreat** just closes the modal (no deck change). **Fight** closes the modal and proceeds to battle anyway — sufficiency is advisory only, never a hard gate.
6. **Auto-form** (`BattleFlow.tsx:96-130`):
   - Deduplicate the full inventory by base `id`, keeping — for each `id` — whichever owned instance has the higher `pow + def` (again, **spd excluded** from this comparison, matching the picker's list sort — see Porting Notes).
   - Sort the deduplicated list descending by `pow + def`.
   - Take the top 3 and set them as the deck (immediately persisted, see below) — no further confirmation step.

### Deck persistence & cross-screen locking

- `BattleFlow.tsx` owns a `playerDeck: Card[]` piece of screen state. On mount, it attempts to load a previously-saved deck from `localStorage["player_deck_v1"]` (`DECK_STORAGE_KEY`), validating that each parsed entry looks like a card object with a `state` field before accepting it.
- Both **confirming a deck from Echo Loadout** and **Auto-form** immediately write the full deck (an array of complete card objects, not just IDs) back to that same `localStorage` key, synchronously, in addition to updating in-memory state.
- **Why this exists**: the Collection Screen's Level-Up flow (doc 11) independently reads this same `localStorage` key on its own mount to build a `Set` of "locked" instance IDs, so cards currently sitting in the active deck can't be fed away as XP fodder out from under the player mid-battle-prep. It is a cross-screen signal, not battle logic — battle itself uses the in-memory `playerDeck` state directly, not the localStorage copy.
- The localStorage snapshot is a full serialized `Card[]`, not just instance IDs — meaning if the underlying card's stats change elsewhere (e.g. a level-up) after the deck was saved, the deck screens keep showing the stats as of the moment it was saved until the deck is re-saved (re-confirmed or re-Auto-formed). It is **not reactively kept in sync**.

## Animations & Timing

This flow is comparatively static — mostly instant state transitions, not scripted animations:

| Animation | Where | Timing |
|---|---|---|
| Screen fade in/out | Both screens (top-level wrapper) | `opacity 0→1` on enter, standard Framer Motion transition (no explicit duration override — default ~0.3s) |
| Slot/tile hover-scale (1.05×) / tap-scale (0.95×) | Deck slots, picker tiles | Framer Motion default spring |
| Insufficient Power modal enter/exit | Form Team screen | `scale 0.9→1`, `opacity 0→1` (no explicit duration override — Framer Motion default) |
| Sheen sweep on Enter button (hover only) | Form Team primary button | CSS translate sweep on hover, ~0.5s |
| Layout animation on slot fill (Echo Loadout) | `layoutId` shared-element transition when a card enters a slot | Framer Motion `layoutId` auto-animates position/size — treat as a simple "snap into slot" tween in Unity, no need to replicate FLIP-style shared elements |

Nothing here is on a critical timing path for gameplay — all transitions are cosmetic and can be simplified to a uniform ~200-300ms tween/scale in Unity.

## Numbers & Formulas

| Value | Formula |
|---|---|
| Deck size | Exactly 3 cards to be battle-ready (`Enter` disabled otherwise) |
| Total Power (Form Team screen, used for the power gate) | `sum(pow) + sum(spd) + sum(def)` across the 3 deck cards |
| "Power" used for Echo Loadout's list sort | `pow + def` only (excludes `spd` — inconsistent with the above, see Porting Notes) |
| "Power" used for Auto-form dedupe-keep and final sort | `pow + def` only (same inconsistency) |
| Battle-mode required power | `beginner 100 / intermediate 225 / advanced 420 / expert 600` (see table above; some modes may have no requirement) |
| Insufficient-power behavior | Warning only — never blocks entering battle |
| Picker inventory pagination | 24 initial / +24 per scroll-near-bottom (100px threshold) — same as Collection Screen |

## Assets Used

- `/assets/icons/rare_stroke.webp`, `/assets/icons/uncommon_stroke.webp`, `/assets/icons/common_stroke.webp` — rarity brush-stroke tile backgrounds (both screens)
- Each card's own `card.image`
- No screen-specific icons beyond inline SVGs (back arrow, plus sign as text glyph, warning emoji) — these should be replaced with proper Unity UI icons/sprites rather than emoji/inline SVG in the port

## Cross-References

- [10-collection-screen.md](./10-collection-screen.md) — shares the Total-Power display convention and the same infinite-scroll pagination pattern
- [11-card-detail-modal-and-leveling.md](./11-card-detail-modal-and-leveling.md) — consumes the active-deck lock this system produces, to block deck cards from being used as fusion fodder
- [17-battle-flow-overview.md](./17-battle-flow-overview.md) — where "Form Team" sits in the overall battle phase sequence (`DECK → SELECT → MATCHMAKING → VERSUS → BATTLE → RESULT → REWARDS`)
- [18-battle-mode-selection-and-deck-select.md](./18-battle-mode-selection-and-deck-select.md) — how a battle mode ID is chosen before reaching this screen, and where `requiredPower` comes from

## Unity Porting Notes

- **Replace the `localStorage["player_deck_v1"]` mechanism with a single authoritative in-memory (or save-file) "current deck" value**, not a serialized snapshot read independently by multiple screens. Concretely: maintain one `List<string> currentDeckInstanceIds` (or `List<CardInstance>` if you prefer denormalized convenience, but IDs are safer against staleness) on your player/save-data singleton, updated the instant the deck is confirmed or auto-formed, and read directly by whatever "is this instance locked?" check the fusion screen needs (doc 11). This removes both problems the source has: (a) the deck being read fresh only on mount of each consuming screen, so it can go stale if changed elsewhere in the same session, and (b) storing full card snapshots instead of live references, so stat changes after saving don't retroactively show up in "Form Team" until the deck is re-touched. In Unity, since everything lives in one process, this is just a normal shared reference/singleton — no serialization round-trip needed at all except for the actual save file.
- **Unify the "power" formula.** Three different partial formulas exist across the codebase for near-identical concepts: Collection Screen/Card tiles use `pow+spd+def`; Form Team's power-gate check also correctly uses `pow+spd+def`; but Echo Loadout's inventory sort and Auto-form's dedupe/sort both use `pow+def` (silently dropping `spd`). This means Auto-form can select a *different* "best" card than a human sorting by true Total Power would, and the picker list order doesn't match the Collection Screen's sort order for the same cards. Recommend implementing one shared `TotalPower(CardInstance) => pow+spd+def` function and using it everywhere (picker sort, Auto-form, Form Team gate, Collection sort/badge) for a consistent player-facing "Power" number.
- **Auto-form has no confirmation step** — it silently overwrites the current deck and persists it. Preserve this "instant apply" UX if desired, or add a confirm step; either is a legitimate design choice, but be deliberate since the source silently discards whatever was manually assembled beforehand.
- **The Insufficient Power modal is a soft warning only** — there is no hard minimum-power gate to enter a battle mode, only the "must have 3 cards" gate. Preserve this design intentionally (don't accidentally make the power requirement a hard block when porting).
- **Grid "IN USE" matching is by base card `id`, not `instanceId`.** If the player owns 2 copies of the same card and places one in the deck, the *other* copy also shows "IN USE" and cannot be tapped from the grid (even though it's a different physical instance). Decide whether this is desired in Unity — an alternative, arguably more intuitive design would let each instance be selected/blocked independently.
- **Debug button**: the 🐞 icon on the Form Team screen (`DeckSelectionScreen.tsx:107-116`) that logs a generated opponent deck to the console is a development tool — **omit it from the Unity port**.
- Console `console.log` render-tracing calls in `DeckSelectionScreen.tsx:28-31` and `BattleFlow.tsx:45-48` are leftover debug instrumentation, not functional behavior — no need to port.
