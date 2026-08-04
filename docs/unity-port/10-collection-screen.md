# Collection Screen

## Purpose / Overview

The Collection Screen is the card-gallery/inventory view. It shows every card *instance* the player owns (duplicates of the same card are separate tiles), lets the player filter by rarity and sort by Total Power, and opens a detail sheet on tap. It is a pure browse/inspect screen — no editing happens here (leveling and deck-building are separate screens reached from elsewhere).

Source: `src/components/CollectionScreen.tsx`, `src/components/features/collection/CollectionGrid.tsx`, `src/components/features/collection/CollectionCard.tsx`.

## Data Model

The screen reads the player's `inventory: Card[]` from the player store (Redux `state.player.inventory`, see `src/store/slices/playerSlice.ts:8`). Each entry is a full `Card` object (`src/types/game.ts:12-30`):

```csharp
// Suggested C# shape for the Unity port
public enum Rarity { Common, Uncommon, Rare }

public class CardStats {
    public int Pow;
    public int Spd;
    public int Def;
}

public class CardInstance {
    public string DefinitionId;      // "id" in source — shared by all copies of the same card
    public string InstanceId;        // unique per owned copy — generated on acquire
    public string Name;
    public Rarity Rarity;
    public string SetName;           // elemental/set grouping, used as "Type" in detail view
    public string SetId;
    public int Level;
    public int Experience;           // current XP toward next card level
    public CardStats Stats;          // current pow/spd/def after level-ups
    public string Description;       // lore text
    public string ImagePath;
    public string DesignType;        // "Eternal" | "Hero" | "Landbound" — layout variant, not used on this screen
}
```

`TotalPower` (TP) is **not stored** — it is always computed on the fly as `Stats.Pow + Stats.Spd + Stats.Def` (`CollectionScreen.tsx:43-46`, `CollectionCard.tsx:16-17`). Port this as a computed property, not a saved field.

## UI Layout

Hierarchy, top to bottom (`CollectionScreen.tsx:105-211`):

1. **Root container** — full-height, dark background (`#1a1a1a`) with a decorative parallax `Background` layer behind everything.
2. **Top bar** — `TopBar` component, title text "Collections".
3. **Header row** (`CollectionScreen.tsx:116-177`):
   - **Rarity filter pills** — horizontally scrollable row of 4 pill buttons in this exact order: `ALL`, `RARE`, `UNCOMMON`, `COMMON` (`CollectionScreen.tsx:120`). Active pill: dark background (`bg-gray-800`) + white text. Inactive pill: medium-grey background (`bg-gray-500`) + white text, darkens on hover. Scrollbar is hidden.
   - **Sort toggle button** — single square icon button (right-aligned) that toggles Total-Power sort direction. Shows one of two SVG glyphs depending on current direction (a "sort descending" bars-and-down-arrow icon vs. a "sort ascending" bars-and-up-arrow icon).
4. **Scrollable content area** — vertical scroll container, hidden scrollbar, drives infinite-scroll pagination on its `onScroll` event.
   - **CollectionGrid** — see below.
   - **Loading spinner** — small spinning ring shown at the bottom while more pages remain (`visibleCount < filteredCards.length`).
5. **Card Detail Modal** — mounted conditionally when a card tile is tapped (see doc 11).

### CollectionGrid (`CollectionGrid.tsx`)

- **Populated state**: CSS grid, exactly **3 columns**, `gap-3` (~12px), each cell holding one `CollectionCard` tile. React key is `${card.id}-${index}` (positional, not `instanceId` — see Porting Notes).
- **Empty state** (`inventory` filtered to zero cards): centered column with:
  - Message text: "Your collection is empty! The stars await your summons."
  - An animated (spring-in, slides up from `y:50` fading in, 0.5s, 0.1s delay) **Summon** button that navigates to the Gacha/Summon screen. Label "SUMMON", subtitle "(Draw Cards)", icon `/assets/icons/tornado.webp`.

### CollectionCard tile (`CollectionCard.tsx:13-99`)

Per-tile composition, aspect ratio **2:3** (portrait), rounded corners (`rounded-xl`), drop shadow, background `white/80`:

| Layer (z-order, back to front) | Detail |
|---|---|
| Rarity border | `box-shadow: inset 0 0 0 4px <rarityColor>` — a 4px inset colored ring, not a real border, so it doesn't affect layout. Color from `getRarityBorderColor` (see doc 07 / table below). |
| Brush-stroke background art | Decorative rarity-specific "stroke" image (`getStrokeImage`), absolutely positioned behind the card art, 60% opacity, scaled 1.1×, overall wrapper opacity 80%. On hover it rotates 12° and scales to 1.25× over 500ms (desktop-only affordance; can be dropped or replaced with a controller-agnostic tap feedback on mobile). |
| Card artwork | `card.image`, `object-cover`, absolutely inset by 1px from the tile edge, its own rounded corners. Scales to 1.1× on hover (same note as above). |
| Level badge | Top-left corner. Black pill at 60% opacity + blur, white bold 10px text, format `Lv.{level}`, only rounded on the bottom-right corner. Hidden if `hideInfo` prop is true. |
| Total Power badge | Bottom-right corner, absolute. A 30×30px circle whose **fill color is the solid rarity color** (`background: borderColor`), with a 1px black outer ring (`box-shadow: 0 0 0 1px black`). Text: total power number, white, bold, black text-stroke (`-webkit-text-stroke: 4px black`, stroke painted before fill) so it reads over any art. Hidden if `hideInfo` prop is true. |

Interaction: whole tile scales to 1.05× on hover/press-in and 0.95× on tap-down (spring-like tap feedback), and calls `onCardClick(card)` which opens the Card Detail Modal (doc 11) for that card instance.

## Behavior & Logic

Step-by-step (`CollectionScreen.tsx:33-79`):

1. Start from the full `inventory` array (one entry per owned card copy).
2. **Rarity filter**: if `rarityFilter !== "ALL"`, keep only cards whose `rarity` matches exactly.
3. **Sort**: **always** by Total Power (`pow + def + spd`), ascending or descending per `sortDirection` (default **descending**). There is no other sort key (no name, no level, no rarity-then-power, etc.) — the sort toggle button is the only sort control.
4. **Pagination reset**: whenever the filtered/sorted list identity changes (filter or sort changed), `visibleCount` resets to the page size (24).
5. **Visible slice**: only the first `visibleCount` cards of the filtered/sorted list are rendered.
6. **Infinite scroll**: on every scroll event in the content container, if the user is within 100px of the bottom AND more cards remain beyond `visibleCount`, increase `visibleCount` by the page size (clamped to the filtered list length).
7. Tapping a tile plays a click sound and opens the Card Detail Modal for that exact card instance (doc 11). The modal itself re-resolves the card live from the inventory (by `instanceId`) so it reflects any level-up that happens while it's open.

## Animations & Timing

| Animation | Trigger | Duration / Easing |
|---|---|---|
| Tile hover scale (1.05×) | Pointer hover | Framer Motion default spring |
| Tile tap scale (0.95×) | Press down | Framer Motion default spring |
| Brush-stroke rotate+scale on hover | Pointer hover | 500ms, standard ease (`transition-transform duration-500`) |
| Card art zoom on hover (1.1×) | Pointer hover | 300ms |
| Empty-state Summon button entrance | Screen mount with 0 cards | Spring, 0.5s, 0.1s delay, from `y:50, opacity:0` |
| Infinite-scroll spinner | Continuous while more pages exist | CSS `animate-spin`, indefinite |

None of these are gameplay-critical; on Unity/mobile they can be simplified to simple tap-scale feedback (e.g. 0.95× on press) without the hover-only brush-stroke/zoom effects, which don't apply to touch input anyway.

## Numbers & Formulas

| Value | Formula / Constant |
|---|---|
| Total Power (TP) shown on badge and used for sort | `pow + spd + def` (current, post-level stats) |
| Grid columns | 3 |
| Page size (initial `visibleCount`) | 24 |
| Page size increment (infinite scroll) | 24 |
| Infinite-scroll trigger distance from bottom | 100px |
| Default sort direction | Descending (highest TP first) |
| Rarity filter order (pills) | ALL, RARE, UNCOMMON, COMMON |

## Assets Used

- `/assets/icons/tornado.webp` — Summon button icon (empty state)
- `/assets/icons/rare_stroke.webp` — brush-stroke background art for Rare tiles
- `/assets/icons/uncommon_stroke.webp` — brush-stroke background art for Uncommon tiles
- `/assets/icons/common_stroke.webp` — brush-stroke background art for Common tiles (also the fallback for any unrecognized rarity)
- Each card's own `card.image` path (per-card artwork, defined in card data, not enumerated here)

## Cross-References

- [07-data-model-cards-rarity.md](./07-data-model-cards-rarity.md) — full `Card` schema and rarity color/style table
- [11-card-detail-modal-and-leveling.md](./11-card-detail-modal-and-leveling.md) — what opens when a tile is tapped
- [08-player-progression-currencies.md](./08-player-progression-currencies.md) — player level context (caps card level, see doc 11)

## Unity Porting Notes

- **Dead code warning**: `CollectionScreen.tsx` defines a `getRarityStyle(r, isActive)` helper (lines 81-103) that builds elaborate per-rarity pill colors/glows — but it is **never called anywhere in the file**. The actual rendered filter pills use a simple two-state style (dark active pill vs. flat grey inactive pill, `CollectionScreen.tsx:127-131`), not rarity-tinted pills. Do not port the rarity-colored pill look unless you intentionally want to improve on the source — the live game does not show it.
- **Total Power formula inconsistency elsewhere**: this screen and the card tile use the *true* Total Power (`pow+spd+def`). Other screens in this codebase (deck-building's card list sort and Auto-Form, see doc 12) compute a "power" that omits `spd` (`pow+def` only). Pick **one** canonical TP formula for the Unity port — `pow+spd+def` is recommended since it's what's used for the battle-mode power-gate check (the more consequential mechanic) — and use it everywhere, including here.
- Grid tile React `key` uses list index (`${card.id}-${index}`) rather than the card's unique `instanceId`; in Unity this is irrelevant (no virtual-DOM keying concept) but if you build a recycled/pooled scroll view, key/identify cells by `InstanceId`, not array index, to avoid stale-cell bugs when the filtered list changes.
- The infinite-scroll pattern (manual scroll-position check, 24-card pages) is a reasonable UX to replicate, but Unity's `ScrollRect` + pooled content is a more natural implementation than literally increasing a "visible count" — consider a virtualized/pooled grid instead of instantiating all visible cards.
