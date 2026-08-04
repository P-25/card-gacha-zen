# Shop Screen

## Purpose / Overview

The Shop is a direct-purchase storefront, separate from the gacha/summon system, with three independent sections stacked vertically on one scrolling screen:

1. **Featured Cards** — buy specific named cards outright for Gold (a rotating/timed selection).
2. **Random Packs** — spend Gold for a random card of a chosen rarity tier.
3. **Gem Shop** — spend Gold to buy Gem packs (a soft-to-hard-currency exchange).

All purchases go through a shared confirmation modal, then grant the reward immediately; card-granting purchases (Featured + Random Packs) reuse the gacha system's `CardReveal` component to show the result with the same VFX as a gacha pull. Gem purchases instead show a simple "Purchase Successful" popup.

Source files:
- `src/components/features/shop/ShopScreen.tsx`
- `src/components/features/shop/ShopItemCard.tsx`
- `src/config/shopConfig.ts`

## Data Model

### Config schema (`src/config/shopConfig.ts`)

```ts
type ShopItemType = "SPECIFIC_CARD" | "RANDOM_PACK" | "GEM_PACK";

interface ShopItem {
  id: string;
  type: ShopItemType;
  name: string;
  cost: number;
  currency: "GOLD" | "GEMS";
  image: string;
  cardId?: string;                 // SPECIFIC_CARD: reference into cards.json
  cardDefinition?: Partial<Card>;  // SPECIFIC_CARD: inline full card def, for shop-exclusive cards not in cards.json (currently unused — see Behavior)
  rarity?: Rarity;                 // RANDOM_PACK: which rarity tier this pack draws from
  gemAmount?: number;               // GEM_PACK: gems granted
}

interface ShopFeaturedConfig {
  startDate: string; // ISO datetime
  endDate: string;   // ISO datetime
  cards: { cardId: string; goldPrice: number }[];
}
```

Two separate top-level exports drive the screen:
- `shopItems: ShopItem[]` — the flat list of Random Pack and Gem Pack items (see Behavior below re: the `SPECIFIC_CARD` entries also present in this array).
- `featuredShopConfig: ShopFeaturedConfig` — the actual source for the "Featured Cards" section (see Behavior).

### Suggested C# / Unity representation

```csharp
public enum ShopItemType { SpecificCard, RandomPack, GemPack }
public enum ShopCurrency { Gold, Gems }

[CreateAssetMenu(menuName = "Shop/Shop Item")]
public class ShopItemSO : ScriptableObject
{
    public string itemId;
    public ShopItemType type;
    public string displayName;
    public int cost;
    public ShopCurrency currency;
    public Sprite image;
    public string cardId;        // SpecificCard / used to resolve rarity for RandomPack styling
    public Rarity packRarity;    // RandomPack only
    public int gemAmount;        // GemPack only
}

[CreateAssetMenu(menuName = "Shop/Featured Rotation Config")]
public class FeaturedShopConfigSO : ScriptableObject
{
    public DateTime startDate;
    public DateTime endDate;
    public FeaturedEntry[] cards; // {cardId, goldPrice}
}
```

Recommend collapsing the current two-source-of-truth setup (see Behavior/Unity Porting Notes) into one clean `List<ShopItemSO>` categorized by an explicit `section` enum (`Featured`, `RandomPack`, `GemPack`) rather than mixing "Featured" as a derived/computed thing separate from the main item list.

## UI Layout

Full-screen scrollable page, top to bottom:

1. **Top bar** (`TopBar`, shows screen title + Gold/Gems currency readouts, same shared component as other screens).
2. **Featured Cards section**:
   - Header: "FEATURED Cards" (uppercase, bold, dark green-grey) + an info tooltip icon (tap/hover reveals: "Directly purchase specific units. The selection refreshes automatically when the timer ends.").
   - **Countdown pill** below the header: dark rounded pill with a clock icon and text `"Ends in 2d 4h"`.
   - 3-column grid of `ShopItemCard`s in "rarity style" mode (see below) — one per entry in `featuredShopConfig.cards`.
3. **Random Packs section**:
   - Header: "Random Packs" + info tooltip ("Get a random card of select rarity").
   - 2-column grid of `ShopItemCard`s in "standard/title" mode.
4. **Gem Shop section**:
   - Header: "Gem Shop" + info tooltip ("Purchase gems").
   - 2-column grid of `ShopItemCard`s in "standard/title" mode.

### `ShopItemCard` — two visual modes

- **`showRarityStyle` mode** (used only for Featured Cards): dark semi-transparent card background, rarity-colored border glow (`inset 0 0 0 2px {rarityColor}80` + soft outer glow), rarity brush-stroke background image behind the art, item name shown as white text below the art, price shown in a dark pill (`bg #1a2e2e/90`, gold border) with gold-icon/text.
- **`showTitle` mode** (used for Random Packs + Gem Packs): plain white card, no rarity border, name shown as an overlay bar across the top of the art, price shown as plain icon+number beneath the art (no pill background).
- **Disabled/insufficient-funds state** (either mode): if `canAfford` is false, a dark blurred overlay covers the whole card with a red "Insufficient Funds" pill centered on top; the card also stops responding to tap (click handler no-ops) and loses its hover/tap scale animation.
- Currency icon: gold-coin icon for `GOLD` items, gem icon for `GEMS` items (no shop item currently prices in Gems — see pricing table).

### Confirmation Modal (all purchases)

- Dark backdrop (blurred), centered white card.
- Title: "Confirm Purchase".
- Body: `Buy {item.name} for?`
- Item image (100×100, centered).
- Price line: `{cost} {Gold|Gems}`.
- Two buttons: "Cancel" (closes modal, no changes) / "Confirm" (executes the purchase).

### Post-purchase feedback

- **Card rewards** (Featured + Random Pack): the whole shop screen is replaced by a full-screen `CardReveal` (same component used by the gacha reveal flow — see doc 13) showing the single granted card with full rarity VFX (sparkle, brush-stroke halo, badges, NEXT/CLAIM button). Closing/finishing it returns to the shop screen.
- **Gem rewards** (Gem Pack): a centered "Purchase Successful!" popup with gem icon + `x{amount}` and a single "Awesome" dismiss button — no reveal carousel.

## Behavior & Logic

### Section sourcing (important — two different data sources feed the three sections)

1. **Featured Cards is built from `featuredShopConfig.cards`**, not from `shopItems`. Each entry (`{cardId, goldPrice}`) is resolved against `cards.json` at render time to pull the card's name/image/rarity, then wrapped into a synthetic `ShopItem` with `id: "featured_{index}_{cardId}"`, `currency: "GOLD"`.
2. **`shopItems` also contains 3 `SPECIFIC_CARD` entries** (`shop_card_rare_001`, `shop_card_uncommon_001`, `shop_card_common_001`) which are filtered into a `specificCards` variable in `ShopScreen.tsx` — **but this variable is never rendered anywhere in the JSX.** It is dead code in the current build. (Notably, these 3 entries reference the *same* card IDs and Gold prices as the 3 entries in `featuredShopConfig.cards`, so functionally nothing is lost by their being unused — but do not assume both lists need to be ported; only the `featuredShopConfig`-driven path is live.)
3. **Random Packs** = `shopItems` filtered to `type === "RANDOM_PACK"` (2 entries).
4. **Gem Packs** = `shopItems` filtered to `type === "GEM_PACK"` (3 entries).

### Purchase flow

1. Tap any affordable `ShopItemCard` → `handleItemClick(item)` → sets `selectedItem`, opens confirmation modal. (Unaffordable cards no-op on tap — modal never opens.)
2. Tap "Confirm" → `handleConfirmBuy()`:
   - Re-checks `gold >= item.cost` for Gold items (defensive re-check; if it now fails, does nothing — no error is displayed, purchase just silently doesn't proceed. Note: this Gold re-check exists but there is no equivalent re-check for `currency === "GEMS"` items, which is currently moot since no live shop item is Gems-priced).
   - Deducts cost (`spendGold` if currency is GOLD; nothing is deducted for GEMS-priced items — nowhere in this file is `spendGems` ever called, a latent gap if a Gems-priced item is ever added — see Porting Notes).
   - Closes the confirmation modal.
   - Grants reward based on `item.type`:
     - **`SPECIFIC_CARD`**: resolves the card (prefers inline `cardDefinition` if present, else looks up `cardId` in `cards.json`), adds it to inventory, sets it as the single `revealResults` entry, shows the `CardReveal` overlay.
     - **`RANDOM_PACK`**: filters `cards.json` to the item's `rarity`, picks one uniformly at random (`Math.floor(Math.random() * pool.length)` — flat uniform, no weighting), adds it to inventory, shows `CardReveal` for that one card.
     - **`GEM_PACK`**: adds `gemAmount` to the player's Gems, shows the Gem success popup.
3. Dismissing the `CardReveal` (its Claim/Next-to-finish flow, see doc 13) or the Gem success popup returns the player to the shop grid.

### Currency check for the "afford" state per section

- Featured Cards: `canAfford = gold >= item.cost` (always Gold-priced).
- Random Packs / Gem Packs: `canAfford = item.currency === "GOLD" ? gold >= item.cost : true` — note items priced in Gems are **never** gated by affordability (always shown as affordable) since this ternary defaults to `true` for non-Gold currency. This is currently harmless because no live item is Gems-priced, but is a latent bug if one is ever added without also updating this check.

## Animations & Timing

- `ShopItemCard` hover/tap: scale to 1.02 + lift `y:-2` on hover, scale to 0.98 on tap (only when affordable) — standard Framer Motion spring, no explicit duration override (uses library defaults).
- Info tooltip: fade+slide+scale in/out (`y: ±10`, `scale: 0.9 → 1`), directionally anchored above (`placement="top"`, used for Random Packs/Gem Shop tooltips) or below (`placement="bottom"`, used for the Featured Cards tooltip) its trigger icon. Toggled by hover (desktop) or tap (mobile) — click also toggles it directly.
- Confirmation modal / Success popup: standard `AnimatePresence` fade (backdrop) + scale+fade (card), enter `scale: 0.9/0.8 → 1`, exit reverse.
- Card reward reveal: identical to the gacha `CardReveal` sequence documented fully in `13-summon-gacha-screen-ui.md` (per-card entrance spring, breathing art, rarity sparkle, NEW badge, etc.) — since a shop card purchase always yields exactly one item, the "SKIP ALL" vs. "SHARE" button branch always shows "SHARE" (single-item reveals never have a next card) and the primary button always reads "CLAIM".
- **Countdown timer is static, non-functional**: `"Ends in 2d 4h"` is a hardcoded string, not a live ticking countdown. `featuredShopConfig.endDate` is computed once at module load as `Date.now() + 2 days + 4 hours` (`src/config/shopConfig.ts:139-141`), but nothing in `ShopScreen.tsx` reads `startDate`/`endDate` to render an actual live timer or to rotate/expire the featured selection — the displayed text is a literal string, not derived from the dates at all. **Flag this as non-functional and needing real implementation in the Unity port if a live countdown + rotating featured selection is desired** (see Unity Porting Notes for a concrete approach).

## Numbers & Formulas

### Full pricing table (all shop items, `src/config/shopConfig.ts`)

| Section | Item ID | Name | Cost | Currency | Notes |
|---|---|---|---|---|---|
| Featured Cards | `featured_0_rare_card_001` | Horizon Keeper* | 12,000 | Gold | *Config name says "Horizon Keeper" but `cardId` resolves to `rare_card_001`, whose actual name in `cards.json` is **"Astro Judge"** — the display shows the live-resolved `cards.json` name ("Astro Judge"), not the stale label in the config comment. Rarity: RARE. |
| Featured Cards | `featured_1_uncommon_card_001` | Frost Guard* | 3,000 | Gold | *Config comment says "Celestial Serpent" but `cardId = uncommon_card_001` resolves to **"Spore Chem"** in `cards.json`. Displayed name is "Spore Chem". Rarity: UNCOMMON. |
| Featured Cards | `featured_2_common_card_001` | Whisper* | 500 | Gold | *Config comment says "Clay Golem" but `cardId = common_card_001` resolves to **"Moss Guard"** in `cards.json`. Displayed name is "Moss Guard". Rarity: COMMON. |
| Random Packs | `pack_uncommon` | Uncommon Pack | 1,500 | Gold | Grants 1 random card, uniform, from all 8 UNCOMMON cards in `cards.json` (resource entries like `gold_pack_large` are excluded — this pool is Card-only, unlike the gacha's dynamic pool). |
| Random Packs | `pack_common` | Common Pack | 250 | Gold | Grants 1 random card, uniform, from all 12 COMMON cards in `cards.json` (Card-only pool). |
| Gem Shop | `gems_10` | 10 Gems | 1,000 | Gold | 100 Gold per Gem. |
| Gem Shop | `gems_100` | 100 Gems | 10,000 | Gold | 100 Gold per Gem (same rate as the 10-pack — no bulk discount). |
| Gem Shop | `gems_1000` | 1000 Gems | 100,000 | Gold | 100 Gold per Gem (same rate — no bulk discount at any tier). |

**Note on the naming mismatch above**: the hardcoded `name` field on the `shopItems`/`ShopItem` objects (`Horizon Keeper`, `Frost Guard`, `Whisper`) is only actually used for the Featured section's *dead* `specificCards` array (see Behavior). The live Featured Cards grid derives its displayed name fresh from `cards.json` via `cardId` lookup, so what players actually see are the correct current card names (Astro Judge / Spore Chem / Moss Guard), not the stale labels. **Port using the live `cards.json` names** — do not use the stale `shopConfig.ts` name strings as the source of truth.

### Reference: which specific cards are currently in the Featured rotation

| Slot | `cardId` | Live card name | Rarity | Gold price |
|---|---|---|---|---|
| 1 | `rare_card_001` | Astro Judge | RARE | 12,000 |
| 2 | `uncommon_card_001` | Spore Chem | UNCOMMON | 3,000 |
| 3 | `common_card_001` | Moss Guard | COMMON | 500 |

### Random Pack odds

Uniform across the applicable rarity's card list (Card-type entries only, resources excluded):
- Uncommon Pack: 1-in-8 (12.5%) per specific card.
- Common Pack: 1-in-12 (≈8.33%) per specific card.

## Assets Used

- `/assets/icons/gold-coin.webp` — Gold currency icon (prices, top bar, resource reveals).
- `/assets/icons/gem.webp` — Gem currency icon (Gem Shop prices, success popup, top bar).
- `/assets/icons/info.webp` — info tooltip trigger icon (dark variant; note the Summon screen's pity panel uses a separate `info-white.webp`).
- `/assets/Card_Art/resource/random_uncommon_pack.png` — Uncommon Pack thumbnail.
- `/assets/Card_Art/resource/random_common_pack.png` — Common Pack thumbnail.
- `/assets/Card_Art/resource/card_004.webp` / `card_005.webp` / `card_006.webp` — Gem Pack thumbnails (10/100/1000 respectively; note these are generic "resource" art assets reused for gem packs, not gem-specific artwork).
- Featured card art: resolved dynamically from each card's own `image` path in `cards.json` (e.g. `/assets/Card_Art/rare/card_001.webp` for Astro Judge — the `image` field hardcoded on the `ShopItem` config entries themselves is unused for Featured, since the live render always re-resolves from `cards.json`).
- Rarity brush-stroke backgrounds (Featured cards only): `/assets/icons/rare_stroke.webp`, `/assets/icons/uncommon_stroke.webp`, `/assets/icons/common_stroke.webp` (same shared assets as the gacha reveal screen).

## Cross-References

- [13-summon-gacha-screen-ui.md](./13-summon-gacha-screen-ui.md) — `CardReveal` component reused here for card-purchase reveals; also the primary place Gems are spent (the reason a player ends up buying Gems here).
- [14-gacha-mechanics-rates-pity.md](./14-gacha-mechanics-rates-pity.md) — contrast: the gacha's weighted-pool + pity system vs. this screen's simple flat-uniform Random Pack draw (no pity, no weighting, Card-only pool).
- [07-data-model-cards-rarity.md](./07-data-model-cards-rarity.md) — Card schema, rarity colors/assets reused by `ShopItemCard`'s rarity-style mode.
- [08-player-progression-currencies.md](./08-player-progression-currencies.md) — Gold/Gems economy this screen both spends (Gold, always) and grants (Gems, via Gem Packs).

## Unity Porting Notes

- **Fix the countdown before shipping, or explicitly cut it**: `"Ends in 2d 4h"` is a static label with zero live timer logic behind it, despite `featuredShopConfig` carrying real `startDate`/`endDate` fields that go completely unused for display. If the Unity port wants a genuine rotating-Featured-selection-with-countdown feature, implement: (1) a live ticking timer UI bound to `endDate - now`; (2) server/save-driven (or scheduled ScriptableObject swap) logic to actually rotate the `cards` array when `endDate` is reached; (3) persistence so the countdown doesn't just reset every time the app restarts (current `startDate: new Date().toISOString()` is computed fresh on every module load, meaning in the JS version the "timer" — if it were wired up — would restart from ~2d4h on every app launch/reload; do not carry this bug forward).
- **Collapse the two competing data sources for Featured Cards** (`shopItems`'s unused `specificCards` filter vs. the actually-live `featuredShopConfig.cards`) into one clean source in the Unity data model — carrying forward two overlapping/duplicated definitions of the same 3 cards is exactly the kind of drift risk that caused the name-string staleness noted in the pricing table above (config said "Horizon Keeper"/"Celestial Serpent"/"Clay Golem"; live data resolves to "Astro Judge"/"Spore Chem"/"Moss Guard"). Always resolve display name/image/rarity live from the card database by ID; never hardcode a duplicate copy of card display fields into shop config.
- **Add the missing Gems-currency spend path**: `handleConfirmBuy` only ever calls a Gold-spend function; there is no `spendGems` call anywhere in `ShopScreen.tsx`, and the "afford" check for non-Gold items silently defaults to `true`. No current shop item is Gems-priced so this has never surfaced as a live bug, but if the Unity port's shop config allows Gems-priced items (e.g. premium/direct-purchase specials), make sure both the affordability check and the deduct-on-confirm logic handle both currencies symmetrically — don't port the Gold-only assumption as-is if Gems items are planned.
- **Random Pack draws are simple uniform `Random.Range` over a Card-only filtered list** — no weighting, no pity, no resource entries mixed in. Keep this deliberately simpler than the gacha roll (doc 14); don't accidentally route Shop pack purchases through the gacha's weighted-pool/pity code path, they are separate systems by design in the source.
- **Reuse one `CardRevealView` prefab/controller for both the Summon screen and the Shop screen** (as the JS code does by sharing the literal `CardReveal` component) rather than building a second reveal UI — this guarantees VFX/sound/badge-logic consistency between "won via gacha" and "bought via shop" reveals for free, and halves the animation-tuning surface area.
- **Confirm the "no bulk discount" Gem pack pricing is intentional** — all three Gem Pack tiers (10/100/1000 Gems) price at an identical flat 100 Gold-per-Gem rate; there's no economy-of-scale incentive for buying the larger pack besides convenience. Flag to design in case a discount curve was intended but never implemented.
