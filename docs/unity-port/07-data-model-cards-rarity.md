# Data Model: Cards, Items & Rarity

## Purpose / Overview

This document is the canonical reference for every static "content" definition in Riftgard: the `Card` and `Resource` item schemas, the full list of all 24 cards shipped in the game, the rarity tier system and its visual styling, and the elemental "set" grouping used purely as flavor text today. Every other doc that touches card data (collection screen, deck building, gacha, card leveling, battle) should treat this file as ground truth for exact stat numbers.

Source files read in full:
- `src/types/game.ts`
- `src/config/cards.json`
- `src/config/rarityTypes.json`
- `src/config/resources.json`
- `src/lib/rarityStyles.ts`
- `src/lib/gameLogic.ts` (for the Total Power formula)

## Data Model (full schema tables + suggested C# class)

### `GameItem` (base type) — `src/types/game.ts:4-10`

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique content id, e.g. `"common_card_001"` |
| `name` | string | Display name |
| `type` | `"CARD" \| "RESOURCE"` | Discriminator |
| `rarity` | `"COMMON" \| "UNCOMMON" \| "RARE"` | See Rarity section below |
| `image` | string | Web-relative path to art asset |

### `Card` (extends `GameItem`) — `src/types/game.ts:12-30`

| Field | Type | Notes |
|---|---|---|
| `type` | `"CARD"` | literal |
| `setName` | string | Elemental flavor grouping, e.g. `"Earth"` |
| `setId` | string | Short code for the set, e.g. `"E01"` |
| `level` | number | Card's current level (starts at 1 for all base defs) |
| `releaseDate` | string | ISO date string, all 24 cards ship with `"2025-12-08"` |
| `description` | string | Flavor text |
| `state.pow` | number | Power stat |
| `state.spd` | number | Speed stat |
| `state.def` | number | Defense stat |
| `tp` | number (optional) | Total Power — **calculated**, not stored in `cards.json`; see formula below |
| `experience` | number | Current XP toward next level; `0` in the base config |
| `design_type` | `"Eternal" \| "Hero" \| "Landbound"` | All 24 shipped cards use `"Eternal"` — the other two enum values are currently unused, likely a hook for future content |
| `backgroundColor` | string | Hex color, used as card background |
| `textColor` | string | Hex color, used as card text/accent color |
| `instanceId` | string (optional) | Assigned only once a card is placed into a player's inventory (see doc 08) — the base `cards.json` entries have no `instanceId`; it is generated at grant-time (`Math.random().toString(36).substr(2, 9)`) |

### `Resource` (extends `GameItem`) — `src/types/game.ts:32-35`

| Field | Type | Notes |
|---|---|---|
| `type` | `"RESOURCE"` | literal |
| `value` | number | Amount of gold this resource grants when consumed/opened |

### Suggested Unity C# representation

Recommend `ScriptableObject` definitions for static content (cards/resources are design-time data, not runtime save data) plus a plain serializable struct for the mutable per-instance stat block.

```csharp
public enum Rarity { Common, Uncommon, Rare }
public enum ItemType { Card, Resource }
public enum DesignType { Eternal, Hero, Landbound } // Hero/Landbound currently unused in content

[System.Serializable]
public struct CardStats
{
    public int pow;
    public int spd;
    public int def;

    public int TotalPower => pow + spd + def; // see "Total Power (TP)" below
}

// Static, design-time definition — one asset per card id, ships in the build.
[CreateAssetMenu(menuName = "Riftgard/Card Definition")]
public class CardDefinition : ScriptableObject
{
    public string id;              // e.g. "common_card_001"
    public string displayName;
    public Rarity rarity;
    public string setName;         // e.g. "Earth" (flavor grouping)
    public string setId;           // e.g. "E01" (flavor grouping code)
    public string releaseDate;     // ISO date, informational only
    [TextArea] public string description;
    public CardStats baseState;    // level-1 base stats
    public DesignType designType;
    public Color backgroundColor;
    public Color textColor;
    public Sprite art;
}

// Static, design-time definition for the 2 resource items.
[CreateAssetMenu(menuName = "Riftgard/Resource Definition")]
public class ResourceDefinition : ScriptableObject
{
    public string id;
    public string displayName;
    public Rarity rarity;
    public int goldValue;
    public Sprite art;
}

// Runtime, per-owned-card save data (mutable). Lives in the player's save file, NOT as a ScriptableObject.
[System.Serializable]
public class OwnedCardInstance
{
    public string instanceId;      // unique per copy owned, generated on grant
    public string cardDefId;       // FK into CardDefinition.id
    public int level;
    public int experience;
    public CardStats state;        // current (post-leveling) stats — starts equal to baseState
}
```

Unity porting note: keep the **definition** (rules/art/base stats) separate from the **instance** (owned copy with level/xp/current stats), mirroring the JS split between `cards.json` (design data) and `PlayerState.inventory: Card[]` (save data, see doc 08). In the JS source these are actually the same `Card` shape reused for both purposes — the Unity port should NOT copy that conflation; a definition/instance split is cleaner and avoids duplicating flavor text/art references per owned copy.

## Behavior & Logic (step-by-step, exact formulas/conditions)

### Total Power (TP)

Defined once, in `src/lib/gameLogic.ts:16-18`:

```
TP(card) = card.state.pow + card.state.spd + card.state.def
```

This exact formula is duplicated ad-hoc in three other places in the codebase (`src/store/selectors.ts:22-26`, `src/components/battle/SelectCardsPhase.tsx:29`, `src/components/features/collection/CollectionCard.tsx:16`, `src/components/battle/DeckSelectionScreen.tsx:62`) — all four implementations are numerically identical (`pow + spd + def`). Treat TP as a single derived stat computed on demand; do not persist it (the `tp?` field on `Card` is explicitly a scratch/calculated field, not authoritative save data).

**Player Max TP** (used to gate Battle Tier upgrades, see doc 08 and 21-battle-tier-screen.md): sum of TP across the player's **top 3 cards by individual TP**, taken from the full inventory:

```
topCards = inventory.filter(hasValidState).sortDescendingBy(TP).take(3)
MaxTP = sum(TP(c) for c in topCards)
```
Source: `src/store/selectors.ts:16-41` (`selectTop3Cards`, `selectMaxTP`).

### Rarity tier list

`src/config/rarityTypes.json` defines exactly 3 rarities, in ascending order:

1. `COMMON`
2. `UNCOMMON`
3. `RARE`

There is no `EPIC`/`LEGENDARY`/etc. tier anywhere in the current content or type system (`src/types/game.ts:1` hard-types `Rarity` to these 3 values only).

### Rarity visual styling — `src/lib/rarityStyles.ts:3-25`

| Rarity | Border Color (hex) | Border Color Name (source comment) | Stroke/Frame Image Path |
|---|---|---|---|
| COMMON | `#A8A29E` | Stone Grey — "Soft, matte ash" | `/assets/icons/common_stroke.webp` |
| UNCOMMON | `#6A9A6A` | Sage Green — "Desaturated, earthy green" | `/assets/icons/uncommon_stroke.webp` |
| RARE | `#5B7C99` | Slate Blue — "Cool, dusty blue" | `/assets/icons/rare_stroke.webp` |
| *(default/unknown)* | `transparent` | — | `/assets/icons/common_stroke.webp` (falls through to the `default` case, i.e. same as COMMON) |

Card art paths follow the pattern `/assets/Card_Art/{lowercase_rarity}/card_{NNN}.webp` where `{NNN}` is a per-rarity zero-padded 3-digit sequence (each rarity restarts its own numbering at 001; see full table below). Resource art lives under `/assets/Card_Art/resource/card_{NNN}.webp`.

## Numbers & Formulas (table of every constant/formula found)

| Constant / Formula | Value | Source |
|---|---|---|
| Number of rarities | 3 (COMMON, UNCOMMON, RARE) | `src/config/rarityTypes.json` |
| Total cards in `cards.json` | 24 (12 COMMON, 8 UNCOMMON, 4 RARE) | `src/config/cards.json` |
| Total resources in `resources.json` | 2 | `src/config/resources.json` |
| TP formula | `pow + spd + def` | `src/lib/gameLogic.ts:16-18` |
| Player Max TP formula | sum of TP of top 3 highest-TP owned cards | `src/store/selectors.ts:16-41` |
| COMMON border color | `#A8A29E` | `src/lib/rarityStyles.ts:6` |
| UNCOMMON border color | `#6A9A6A` | `src/lib/rarityStyles.ts:8` |
| RARE border color | `#5B7C99` | `src/lib/rarityStyles.ts:10` |

## Full Card List (all 24 cards)

All cards have `level: 1`, `experience: 0`, `design_type: "Eternal"`, and `releaseDate: "2025-12-08"` in the base config (`cards.json`). Stats shown are level-1 base stats. TP = pow+spd+def, calculated (not stored).

### COMMON (12 cards)

| id | name | setName | setId | pow | spd | def | TP | backgroundColor | textColor | image |
|---|---|---|---|---|---|---|---|---|---|---|
| common_card_001 | Moss Guard | Earth | E01 | 5 | 3 | 22 | 30 | #36594F | #98A668 | /assets/Card_Art/common/card_001.webp |
| common_card_002 | Deep Diver | Water | W01 | 8 | 12 | 10 | 30 | #2F5373 | #A68863 | /assets/Card_Art/common/card_002.webp |
| common_card_003 | Silent Fist | Earth | E01 | 12 | 10 | 8 | 30 | #9A6E4B | #BF5A36 | /assets/Card_Art/common/card_003.webp |
| common_card_004 | Mech Butler | Earth | E01 | 8 | 6 | 16 | 30 | #734434 | #F2F2F2 | /assets/Card_Art/common/card_004.webp |
| common_card_005 | Silent Bard | Wind | W02 | 6 | 14 | 10 | 30 | #8C4F49 | #D9B573 | /assets/Card_Art/common/card_005.webp |
| common_card_006 | Whisper | Dark | D01 | 10 | 15 | 5 | 30 | #402D3D | #5C6273 | /assets/Card_Art/common/card_006.webp |
| common_card_007 | Wild Heart | Wind | W02 | 12 | 10 | 8 | 30 | #402F29 | #F2F2F2 | /assets/Card_Art/common/card_007.webp |
| common_card_008 | Ash Walker | Fire | F01 | 14 | 10 | 6 | 30 | #4A4742 | #F2CF8D | /assets/Card_Art/common/card_008.webp |
| common_card_009 | Bound Soul | Dark | D01 | 8 | 8 | 14 | 30 | #5F6273 | #F2F2F2 | /assets/Card_Art/common/card_009.webp |
| common_card_010 | Vein Miner | Earth | E01 | 10 | 5 | 15 | 30 | #8C735D | #F2F2F2 | /assets/Card_Art/common/card_010.webp |
| common_card_011 | Antler Sage | Earth | E01 | 8 | 8 | 14 | 30 | #BF6734 | #F2F2F2 | /assets/Card_Art/common/card_011.webp |
| common_card_012 | Venom Shade | Dark | D01 | 12 | 14 | 4 | 30 | #261A40 | #F2F2F2 | /assets/Card_Art/common/card_012.webp |

Note: every COMMON card's base TP is exactly 30 — this looks like an intentional design constant (all commons are power-balanced, differing only in stat distribution), not a coincidence.

### UNCOMMON (8 cards)

| id | name | setName | setId | pow | spd | def | TP | backgroundColor | textColor | image |
|---|---|---|---|---|---|---|---|---|---|---|
| uncommon_card_001 | Spore Chem | Earth | E01 | 15 | 10 | 20 | 45 | #9249A6 | #F2F2F2 | /assets/Card_Art/uncommon/card_001.webp |
| uncommon_card_002 | Star Seeker | Light | L01 | 25 | 10 | 10 | 45 | #151B40 | #F2F2F2 | /assets/Card_Art/uncommon/card_002.webp |
| uncommon_card_003 | Sky Lance | Wind | W02 | 15 | 22 | 8 | 45 | #3C5E73 | #F2F2F2 | /assets/Card_Art/uncommon/card_003.webp |
| uncommon_card_004 | Justicar | Light | L01 | 10 | 5 | 30 | 45 | #8C5D42 | #F2F2F2 | /assets/Card_Art/uncommon/card_004.webp |
| uncommon_card_005 | Frost Guard | Water | W01 | 15 | 5 | 25 | 45 | #204C73 | #F2F2F2 | /assets/Card_Art/uncommon/card_005.webp |
| uncommon_card_006 | Sun Aegis | Light | L01 | 8 | 5 | 32 | 45 | #735438 | #F2F2F2 | /assets/Card_Art/uncommon/card_006.webp |
| uncommon_card_007 | Bone Weaver | Dark | D01 | 22 | 10 | 13 | 45 | #192625 | #F2F2F2 | /assets/Card_Art/uncommon/card_007.webp |
| uncommon_card_008 | Rune Break | Light | L01 | 25 | 12 | 8 | 45 | #735646 | #F2F2F2 | /assets/Card_Art/uncommon/card_008.webp |

Note: every UNCOMMON card's base TP is exactly 45 — same balanced-TP pattern as COMMON.

### RARE (4 cards)

| id | name | setName | setId | pow | spd | def | TP | backgroundColor | textColor | image |
|---|---|---|---|---|---|---|---|---|---|---|
| rare_card_001 | Astro Judge | Light | L01 | 25 | 20 | 30 | 75 | #63458C | #F2F2F2 | /assets/Card_Art/rare/card_001.webp |
| rare_card_002 | Obsidian | Earth | E01 | 30 | 5 | 40 | 75 | #400601 | #F2F2F2 | /assets/Card_Art/rare/card_002.webp |
| rare_card_003 | Chrono Sent | Light | L01 | 20 | 35 | 20 | 75 | #3CA692 | #F2F2F2 | /assets/Card_Art/rare/card_003.webp |
| rare_card_004 | Aurum | **Fire** (setId `L01`) | L01 | 28 | 12 | 35 | 75 | #A64826 | #F2F2F2 | /assets/Card_Art/rare/card_004.webp |

Note: every RARE card's base TP is exactly 75, continuing the balanced-TP-per-rarity pattern (30 / 45 / 75 for Common/Uncommon/Rare).

**DATA INCONSISTENCY — `rare_card_004` "Aurum"**: its `setName` field is `"Fire"` but its `setId` field is `"L01"`, which is the id used by every other Light-set card (`src/config/cards.json:490-491`, compare to `uncommon_card_002` etc. which all pair `setName: "Light"` with `setId: "L01"`). Every other card in the file has a consistent `setName`↔`setId` pairing. This is almost certainly a copy-paste bug in the source data (Aurum's flavor text also describes it as a "Sun Dragon" / fire-and-gold themed card, reinforcing that `setName: "Fire"` is the intended value and `setId` should have been `"F01"` to match `common_card_008` Ash Walker, the game's only other Fire card). **Recommendation for the Unity port: treat `setName` as authoritative and either fix `setId` to `"F01"` in the ported content, or drop `setId` entirely and group sets by `setName` string alone** (see Unity Porting Notes below).

## Resources (2 items)

| id | name | rarity | value (gold) | image |
|---|---|---|---|---|
| gold_pack_small | Spark of Fortune | COMMON | 50 | /assets/Card_Art/resource/card_001.webp |
| gold_pack_large | Luminous Stash | UNCOMMON | 100 | /assets/Card_Art/resource/card_002.webp |

Both resources are pure gold-grant items obtainable from the gacha pool (see 14-gacha-mechanics-rates-pity.md) — there is no "RARE" resource tier defined.

## Elemental Set Grouping

Six elemental "sets" exist as flavor/visual grouping across the 24 cards. **Counts are NOT even across sets** — do not assume 4-per-set; the actual distribution (grouped by `setName`, the more reliable field) is:

| setName | setId (nominal) | Card count | Cards |
|---|---|---|---|
| Earth | E01 | 7 | Moss Guard, Silent Fist, Mech Butler, Vein Miner, Antler Sage (commons), Spore Chem (uncommon), Obsidian (rare) |
| Water | W01 | 2 | Deep Diver (common), Frost Guard (uncommon) |
| Wind | W02 | 3 | Silent Bard, Wild Heart (commons), Sky Lance (uncommon) |
| Dark | D01 | 4 | Whisper, Bound Soul, Venom Shade (commons), Bone Weaver (uncommon) |
| Fire | F01 (nominal; Aurum's actual setId is `L01`, see inconsistency above) | 2 | Ash Walker (common), Aurum (rare) |
| Light | L01 | 6 (7 if grouping by `setId` instead, since Aurum carries `setId: "L01"`) | Star Seeker, Justicar, Sun Aegis, Rune Break (uncommons), Astro Judge, Chrono Sent (rares) |

Total: 7+2+3+4+2+6 = 24. ✓

**Sets currently do nothing mechanically.** `setName`/`setId` are pure metadata — grepping the full codebase (battle logic in `src/lib/battleUtils.ts`, deck building, gacha pool weighting) shows zero code that reads `setName` or `setId` to affect battle outcomes, deck composition rules, or drop rates. This is a clear **hook point for a future elemental-advantage system** (e.g. rock-paper-scissors style Fire>Wind>Earth>Water>Fire, or Light/Dark opposition) that the Unity port could implement cleanly since the data already carries the grouping — it just needs a rule layer added. Recommend the Unity port keep `setName` as a first-class enum-like field on `CardDefinition` specifically so this system can be bolted on later without a data migration.

## Cross-References

- 08-player-progression-currencies.md — how cards enter a player's inventory, leveling/fusion formulas, XP granted per fodder card by rarity
- 10-collection-screen.md — where the rarity border colors / stroke images and TP are rendered
- 11-card-detail-modal-and-leveling.md — per-card leveling UI built on the `consumeCardsForXp` logic
- 12-deck-building-system.md — deck composition rules (top-3-by-TP is also used for Battle Tier gating, not deck selection)
- 14-gacha-mechanics-rates-pity.md — how `cards.json` and `resources.json` entries are weighted into summon pools
- 21-battle-tier-screen.md — consumes `selectMaxTP` / `selectCanUpgradeTier` from this doc's TP formula

## Unity Porting Notes

- **Definition vs. instance split**: `cards.json` is design-time content; a player's owned copies are separate mutable records. Port as `CardDefinition` ScriptableObjects (24 assets) + `OwnedCardInstance` save records, not one unified class — see suggested C# above.
- **TP is always derived, never stored**: compute `pow+spd+def` on read. Do not add a persisted `TotalPower` save field; this avoids drift bugs if stat-modifying features (buffs, equipment, elemental bonuses) are added later.
- **Balanced TP-per-rarity is a real content rule**: all Commons sum to TP 30, all Uncommons to 45, all Rares to 75 (30/45/75 = a clean 2:3:5 ratio). If new cards are authored for the Unity version, preserve this balance rule unless deliberately deprecating it — several systems (Battle Tier thresholds in `tierConfig.ts`, see doc 08) were tuned assuming roughly this power curve.
- **Fix or explicitly re-flag the Aurum data bug** before porting: decide once whether Aurum belongs to Fire or Light and make `setName`/`setId` agree, since any future elemental-advantage system would silently misclassify this card otherwise.
- **`design_type` enum has 2 unused values** (`Hero`, `Landbound`) — every shipped card is `Eternal`. Port the enum as-is for forward compatibility, but don't invest in unique handling for the unused values until content actually uses them.
- **Rarity is a closed 3-value set today** (`COMMON`/`UNCOMMON`/`RARE`). If Unity design plans to add EPIC/LEGENDARY, make sure the rarity enum, the border-color/stroke-image lookup, and the gacha rate table (doc 14) are all updated together — they're three independently-hardcoded switch statements in the JS source (`rarityStyles.ts`), not a single data-driven table, so nothing enforces they stay in sync. Consider making this a single data-driven Unity ScriptableObject table (`RarityDefinition[]`) so a new rarity is one asset add instead of three code edits.
- **Art path convention**: `/assets/Card_Art/{rarity_lowercase}/card_{NNN}.webp`, numbering restarts per rarity. When importing into Unity, either preserve this folder convention under `Resources`/Addressables or map it explicitly in each `CardDefinition.art` field — don't rely on runtime path construction from id, since the id (`common_card_001`) and the file number (`card_001.webp`) are two different numbering schemes that happen to align today but aren't guaranteed to.
