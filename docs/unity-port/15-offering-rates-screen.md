# Offering Rates Screen (Drop-Rate Transparency)

## Purpose / Overview

A read-only informational screen ("Offering Rates") that shows the player the gacha's drop-rate breakdown by rarity, and lets them browse exactly which cards can drop at each rarity tier. It exists purely for transparency/compliance (common requirement for gacha games) and has no gameplay interaction beyond navigation and viewing card details.

Reached from the Summon screen's pity panel info button (see `13-summon-gacha-screen-ui.md`).

Source file: `src/components/OfferingRatesScreen.tsx`.

## Data Model

Entirely derived/computed from existing config at load time — there is no separate "offering rates" config file. Computed once, module-level (`STATIC_RARITY_GROUPS`, computed outside the React component so it only runs once per app session, not per-render):

```ts
type Rarity = "Rare" | "Uncommon" | "Common"; // display-only enum (title case, unlike the game's "RARE"/"UNCOMMON"/"COMMON")

interface RarityGroup {
  rarity: Rarity;
  percentage: number | string; // e.g. "1.40" — base rate * 100, fixed to 2 decimals, stored as a string
  stars: number;                // 3=Rare, 2=Uncommon, 1=Common (defined but not currently rendered — see UI Layout)
  colorClass: string;           // Tailwind text-color class per rarity
  units: Card[];                // every card in cards.json matching this rarity
}
```

Build steps (`calculateRarityGroups()`):
1. Load `banner_rate_up` from `summons.json` and read its `rates` map (the **base** rates — see Behavior section for why this matters).
2. Group all entries of `cards.json` by `rarity`.
3. For each of `["RARE", "UNCOMMON", "COMMON"]` (in that fixed order): if any cards exist for that rarity, push a `RarityGroup` with `percentage = (rate * 100).toFixed(2)`.
4. Resources (gold packs) are **not** included in the card lists shown here — only `Card` entries from `cards.json`.

### Suggested C# / Unity representation

```csharp
public struct RarityGroupViewModel
{
    public Rarity rarity;         // RARE/UNCOMMON/COMMON
    public string displayName;    // "Rare"/"Uncommon"/"Common"
    public string percentageText; // "1.40" — precompute once from BannerConfigSO.baseRates
    public Color accentColor;
    public List<CardDefinition> units; // all CardDefinitions with matching rarity
}
```

Build this once (e.g. on screen open or app start) from the same `BannerConfigSO` used by the gacha roll (doc 14) and the card database, exactly mirroring the JS grouping logic — do not hand-author a separate rates table that could drift from the live banner config.

## UI Layout

Top to bottom:
- **Back button top bar** (`BackButtonTopBar`), navigates back to the `gacha` screen on tap.
- Scrollable content area (hidden scrollbar, standard `overflow-y-auto`), vertical list of **3 accordion sections**, one per rarity, in fixed order **Rare → Uncommon → Common** (top to bottom, matches rarity value/prestige, not alphabetical).

### Each accordion section (`RaritySection`)

- **Header row** (tap target, toggles open/closed):
  - Left: `"{Rarity} Summon"` label in bold uppercase, colored per rarity (`text-[#5B7C99]` slate-blue for Rare, `text-[#6A9A6A]` sage-green for Uncommon, `text-[#A8A29E]` stone-grey for Common). Note: a star-rating display (`{stars}★`) is defined in the data model but is commented out in the current UI — not rendered.
  - Right: percentage badge (gold text, e.g. `"1.40%"`) + a chevron icon that flips between up (open) and down (closed).
- **Collapsible content** (CSS grid-row animated open/close, 300ms ease-in-out):
  - A grid of card thumbnails (5 columns on narrow screens, 6 columns above 400px width), each thumbnail:
    - Card art image (`fill`, `object-cover`, scaled to 90% with hover-zoom to 110%).
    - Subtle inset shadow + top gradient overlay for a "glossy" look.
    - Clicking a thumbnail opens `CardInfoModal` with full card details.
  - If a rarity tier has fewer than 12 cards, **empty filler slots** are padded in (`max(0, 12 - count)`) so the grid always reads as at least a 12-slot block, keeping visual density consistent across tiers with very different card counts.
  - If a rarity tier has zero cards at all, shows a centered "No units in this pool" placeholder message instead of a grid.
- **Default open state on screen load**: Rare section starts expanded; Uncommon and Common start collapsed.
- **Card Info Modal**: shared component (`CardInfoModal`), shown as an overlay (`AnimatePresence`) when a thumbnail is tapped; closing it returns to the accordion list.

## Behavior & Logic

1. On mount, the rarity/percentage/card-list data is precomputed once (not reactive to any live state — see Numbers & Formulas caveat below).
2. Tapping a section header toggles only that section's open/closed boolean in local component state (`openSections` map); other sections' state is independent and unaffected (multiple sections can be open simultaneously — this is a standard multi-open accordion, not an exclusive one).
3. Tapping any card thumbnail opens the shared `CardInfoModal` for that card; tapping elsewhere/closing the modal returns to the list with all accordion open/closed states preserved.
4. Tapping the back button (top bar) navigates back to the `gacha` screen (`AppState = "gacha"`).

## Animations & Timing

- Accordion expand/collapse: CSS grid-template-rows transition, `duration-300 ease-in-out` (open: `grid-rows-[1fr]`, closed: `grid-rows-[0fr]`), content clipped via `overflow-hidden` wrapper.
- Card thumbnail hover: `scale-90 → scale-110` over `duration-300` on hover/group-hover (desktop pointer only; has no equivalent tap-and-hold treatment on touch, so port as a straightforward hover-only polish effect, not required interaction feedback).
- Modal open/close: standard `AnimatePresence`-driven `CardInfoModal` transition (see collection docs for that shared component's own timing, if separately documented).

## Numbers & Formulas

This screen displays the **base** rarity rates only — reads directly from `summons.json`'s `rates` object, exactly as configured (see `14-gacha-mechanics-rates-pity.md` for the canonical numbers):

| Rarity | Displayed Percentage |
|---|---|
| Rare | 1.40% |
| Uncommon | 13.20% |
| Common | 85.40% |

**Important caveat to preserve or deliberately improve in the Unity port**: this screen does **not** reflect the live, pity-adjusted probability. If a player is deep into a soft-pity ramp (e.g. at pull #75, where the actual Rare chance is 81.40% per doc 14's ramp table), this screen still shows the flat 1.40% base rate with no indication that the real current odds are far higher. This matches many real gacha games' convention of publishing only base rates for regulatory/legibility reasons, but flag it explicitly as a product decision to confirm, not an oversight to silently fix.

Card counts per rarity (for grid sizing reference, from `cards.json`):

| Rarity | Card count |
|---|---|
| Rare | 4 |
| Uncommon | 8 |
| Common | 12 |

(Resources like `gold_pack_small`/`gold_pack_large` are Uncommon/Common-rarity items in the roll pool per doc 14, but are excluded from this screen's card grids since they are not `Card` type entries.)

## Assets Used

- Card art images: whatever `Card.image` path each card entry specifies (e.g. `/assets/Card_Art/rare/...`, `/assets/Card_Art/uncommon/...`, `/assets/Card_Art/common/...`) — no offering-rates-specific art assets exist; this screen is entirely built from shared card art and generic chevron/back-button icons.

## Cross-References

- [13-summon-gacha-screen-ui.md](./13-summon-gacha-screen-ui.md) — the Summon screen this is navigated from (via the pity panel info button).
- [14-gacha-mechanics-rates-pity.md](./14-gacha-mechanics-rates-pity.md) — canonical source of the percentages displayed here; also documents the live pity-ramp math this screen deliberately does not surface.
- [07-data-model-cards-rarity.md](./07-data-model-cards-rarity.md) — Card schema and the shared `CardInfoModal` this screen opens on thumbnail tap.

## Unity Porting Notes

- **Derive this screen's data from the same `BannerConfigSO` used by the roll algorithm** (doc 14) — never hand-maintain a duplicate rates table for display, or the two will drift when the banner is rebalanced.
- **Precompute once, not per-frame/per-open**: the JS version computes `STATIC_RARITY_GROUPS` at module load (effectively "once per app session"). In Unity, compute this at screen-open or cache it after first build; it's static data that never changes at runtime (base rates + card list are both fixed config).
- **Multi-open accordion**: confirm with design whether independent multi-section-open behavior (current JS behavior) or exclusive single-open-at-a-time is desired for the Unity UI — either is a straightforward Toggle-Group implementation, just note the current app allows all three open at once.
- **Decide on live-vs-base rate display** explicitly (see Numbers & Formulas caveat) — this is the one place in the current app where a Unity rebuild has an easy opportunity to be more transparent than the source if desired, by also surfacing the current pity-adjusted rate alongside the base rate.
- **The `stars` field on `RarityGroup` is dead/unused** in the current render output (commented out) — no need to port unless you plan to actually display it.
