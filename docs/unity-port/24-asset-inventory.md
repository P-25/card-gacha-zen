# Asset Inventory

## Purpose / Overview

This is a full inventory of `public/assets/` (plus the two loose `public/*.png` app icons), organized by folder, with what each file is used for, its format, and — critically — which files are **orphaned/unused** in the current codebase and should not be blindly copied into the Unity project. Usage was verified by searching all source references to each asset path (`src/**`); anything not found by that search is flagged as orphaned. This matters for the port because carrying over dead files bloats the Unity project and can mislead the developer into thinking an asset is "the real one" when a different, differently-named file is actually live.

## Data Model (schema; suggested C# shape)

Assets themselves have no runtime data model in the source (they're referenced by hardcoded string paths in JSON configs and TSX components, e.g. `"image": "/assets/Card_Art/common/card_001.webp"`). For Unity, standardize on Addressables (or `Resources/`) keys that mirror the folder categories below, e.g.:

```csharp
public enum AssetCategory { CardArt, Avatars, Background, Banner, Icons, Shop, Sound, Summon, Extra }

// Example: a card's art reference becomes an AssetReference (Addressables) or a
// Resources-relative path string set on the ScriptableObject CardDefinition, e.g.
// "CardArt/Common/card_001" instead of a raw web path.
```

## UI Layout

N/A (this document is a raw inventory, not a screen).

## Behavior & Logic

N/A — see [24-asset-inventory.md#assets-used](#per-folder-inventory) below for per-file usage; this replaces both "Assets Used" and "Behavior & Logic" for this document since the entire doc *is* the assets used the reference.

## Numbers & Formulas

### Per-folder file counts

| Folder | File count | Formats | Orphaned count |
|---|---|---|---|
| `Card_Art/` (incl. subfolders) | 61 | `.png`, `.webp` | 30 (3 loose + 24 `Originals/` + 1 `random_rare_pack.png`, wait see breakdown) — see note below |
| `avatars/` | 3 | `.webp` | 0 (all referenced, but 2 of 3 are practically unreachable — see Known Gaps) |
| `background/` | 9 | `.webp` | 5 |
| `banner/` | 1 | `.png` | 0 |
| `icons/` | 43 | `.webp` | 0 confirmed unused paths, but 6 elemental icons have no gameplay effect (cosmetic only) — see note |
| `shop/` | 4 | `.webp` | 4 (entire folder unused) |
| `sound/` (incl. `sfx/`) | 11 | `.mp3`, `.wav` | 6 (see [23-audio-system.md](23-audio-system.md) for the exact list) |
| `summon/` | 4 | `.webp` | 0 |
| `extra/` (not in the requested category list, included for completeness) | 6 | `.svg`, `.png` | 4 |
| Loose files directly under `assets/` | 2 | `.png` | 0 |
| `public/*.png` (outside `assets/`, app-level) | 2 | `.png` | N/A (favicon/logo, not gameplay assets) |

`Card_Art/` orphan breakdown: 3 loose root files (`1.png`,`2.png`,`3.png`) + 24 files under `Originals/` (full `common`/`uncommon`/`rare` mirror, unused at runtime) + 1 unused pack image (`random_rare_pack.png`) = **28 orphaned**, 33 actively used.

## Per-folder Inventory

### `Card_Art/` — 61 files total

The single largest asset category; holds all playable-card artwork plus shop/resource imagery. Cross-reference: [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md), [10-collection-screen.md](10-collection-screen.md), [16-shop-screen.md](16-shop-screen.md).

| Path | Format | Count | Status | Used for |
|---|---|---|---|---|
| `Card_Art/common/card_001.webp` … `card_012.webp` | webp | 12 | **Used** | The 12 Common-rarity playable cards, referenced by `src/config/cards.json` (`image` field) and rendered on Collection, Card Detail, Battle, and Gacha reveal screens. |
| `Card_Art/uncommon/card_001.webp` … `card_008.webp` | webp | 8 | **Used** | The 8 Uncommon-rarity playable cards, same reference points as above. |
| `Card_Art/rare/card_001.webp` … `card_004.webp` | webp | 4 | **Used** | The 4 Rare-rarity playable cards, same reference points as above. |
| `Card_Art/back/card_001.webp` | webp | 1 | **Used** | Face-down card-back art shown during battle card selection/reveal (`src/components/battle/VersusPhase.tsx:215`, `src/components/battle/SingleCard.tsx:80`). |
| `Card_Art/resource/card_001.webp`, `card_002.webp` | webp | 2 | **Used** | "Resource" pack items (`src/config/resources.json`) — gold-pack visuals ("Spark of Fortune", "Luminous Stash"). |
| `Card_Art/resource/card_003.webp` | webp | 1 | **Used** | Present in the folder alongside `card_001`/`card_002`; not directly referenced by `resources.json` (only entries 001/002 exist there) — verify against [16-shop-screen.md](16-shop-screen.md) before porting; likely a spare/reserved resource slot. |
| `Card_Art/resource/card_004.png`, `card_005.png`, `card_006.png` | png | 3 | **Used** | Gem-pack purchase icons in the Shop (`src/config/shopConfig.ts:105,114,123` — "10 Gems"/"100 Gems"/"1000 Gems" items). Note these are `.png`, not `.webp`, unlike the rest of the optimized card art — inconsistent format, fine to re-export as a consistent Unity texture format on port. |
| `Card_Art/resource/random_common_pack.png` | png | 1 | **Used** | Shop "Common Pack" random-pack purchase icon (`shopConfig.ts:94`). |
| `Card_Art/resource/random_uncommon_pack.png` | png | 1 | **Used** | Shop "Uncommon Pack" random-pack purchase icon (`shopConfig.ts:85`). |
| `Card_Art/resource/random_rare_pack.png` | png | 1 | **Orphaned** | No "Rare Pack" shop item exists in `shopConfig.ts` (only Common and Uncommon random packs are defined) — leftover art for a shop item that was never added. Green-field opportunity: add the Rare Pack shop item in the Unity version, or drop the asset. |
| `Card_Art/1.png`, `2.png`, `3.png` (loose, folder root) | png | 3 | **Orphaned** | Not referenced anywhere in `src/`. Likely early test/placeholder card art predating the `common/uncommon/rare` structure. Do not port. |
| `Card_Art/Originals/common/card_001.png` … `card_012.png` | png | 12 | **Orphaned at runtime** | Full-resolution/source versions mirroring `common/` 1:1 (same 12 cards). Never referenced by any `src/` path. This is a designer source-art archive, not a runtime asset — see Unity Porting Notes. |
| `Card_Art/Originals/uncommon/card_001.png` … `card_008.png` | png | 8 | **Orphaned at runtime** | Source-art mirror of `uncommon/` (8 cards), same as above. |
| `Card_Art/Originals/rare/card_001.png` … `card_004.png` | png | 4 | **Orphaned at runtime** | Source-art mirror of `rare/` (4 cards), same as above. |

### `avatars/` — 3 files

Cross-reference: [06-profile-modal.md](06-profile-modal.md), [08-player-progression-currencies.md](08-player-progression-currencies.md).

| Path | Format | Status | Used for |
|---|---|---|---|
| `avatars/avatar_1.webp` | webp | **Used** | "Chrono Sent" — default profile picture, `unlockCondition: "Default"`, always unlocked (`src/config/profileIcons.json`, `src/store/slices/playerSlice.ts:33`). |
| `avatars/avatar_2.webp` | webp | **Used, but practically unreachable** | "Star Seeker" — configured `unlockCondition: "Reach Level 5"`, but no game code ever dispatches the unlock action for it (see Known Gaps in [00-INDEX.md](00-INDEX.md)). Displayed grayed-out/locked in the Profile modal forever under current logic. |
| `avatars/avatar_3.webp` | webp | **Used, but practically unreachable** | "Obsidian" — same issue, `unlockCondition: "Reach Level 10"`, never actually granted. |

### `background/` — 9 files

Cross-reference: [02-start-screen.md](02-start-screen.md), [03-home-screen.md](03-home-screen.md), [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md).

| Path | Format | Status | Used for |
|---|---|---|---|
| `background/full-background.webp` | webp | **Used** | Main app background (`src/components/layout/GameLayout.tsx:28`) and Start Screen background (`src/components/StartScreen.tsx:90`); also preloaded in the app's asset-preload list (`src/pages/index.tsx:19`). |
| `background/light-bg.webp` | webp | **Used** | Secondary lighter background used behind modal/overlay content (`src/components/layout/Background.tsx:10`, Card Info modal, Level Up screen); preloaded (`index.tsx:20`). |
| `background/clouds.webp` | webp | **Used** | Decorative cloud layer, CSS `backgroundImage` in `src/components/layout/Background.tsx:20`. |
| `background/start-screen.webp` | webp | **Used** | Start Screen specific art layer (`src/components/StartScreen.tsx:112`). |
| `background/Gemini_Generated_Image_7k7y8p7k7y8p7k7y.webp` | webp | **Orphaned** | Not referenced anywhere in `src/`. AI-generated filename pattern indicates a leftover generated-image candidate that was never wired into any screen. |
| `background/Gemini_Generated_Image_7t7l7k7t7l7k7t7l.webp` | webp | **Orphaned** | Same as above. |
| `background/Gemini_Generated_Image_j08b1nj08b1nj08b.webp` | webp | **Orphaned** | Same as above. |
| `background/Gemini_Generated_Image_lz8vy0lz8vy0lz8v.webp` | webp | **Orphaned** | Same as above. |
| `background/Gemini_Generated_Image_o6811bo6811bo681.webp` | webp | **Orphaned** | Same as above. |

### `banner/` — 1 file

| Path | Format | Status | Used for |
|---|---|---|---|
| `banner/banner_dragon.png` | png | **Used** | Home screen promotional banner (`src/components/features/home/HomeBanner.tsx:16`); also in the app's preload list (`src/pages/index.tsx:29`). See [03-home-screen.md](03-home-screen.md). |

### `icons/` — 43 files

General-purpose UI icon set. Cross-reference: [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md), [08-player-progression-currencies.md](08-player-progression-currencies.md), [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md), [21-battle-tier-screen.md](21-battle-tier-screen.md).

| Path | Status | Used for |
|---|---|---|
| `icons/home.webp`, `collection.webp`, `shop.webp`, `quest.webp`, `setting.webp` | Used | Bottom navigation tab icons (`src/components/BottomNav.tsx`). |
| `icons/atk.webp`, `hp.webp` | Used | Card stat icons (attack/HP) shown on card UI and in battle. |
| `icons/battle.webp`, `pvp.webp`, `story.webp` | Used | Home screen mode-select tiles ("Battle"/"PvP"/"Story Mode" — the latter is a non-functional stub, see [00-INDEX.md](00-INDEX.md) Known Gaps). |
| `icons/gem.webp`, `gold-coin.webp` | Used | Currency icons across TopBar, Shop, Quests reward chips, etc. |
| `icons/sword.webp`, `tornado.webp` | Used | Decorative/action icons (battle and summon contexts). |
| `icons/common_stroke.webp`, `uncommon_stroke.webp`, `rare_stroke.webp` | Used | Rarity-colored border/stroke overlays for card frames (`src/lib/rarityStyles.ts`). |
| `icons/back.webp`, `info.webp`, `info-simple.webp`, `info-white.webp` | Used | Back-navigation and info/tooltip buttons across multiple screens. |
| `icons/loader.webp` | Used | Loading-state spinner/graphic. |
| `icons/correct.webp`, `level-up.webp`, `exp.webp` | Used | Confirmation checkmark, level-up indicator, XP icon (Collection/Level Up screens). |
| `icons/easy.webp`, `hard.webp`, `expert.webp`, `very-hard.webp` | Used | Battle-tier / difficulty selector icons (`src/components/features/tier/BattleTierScreen.tsx`). See [21-battle-tier-screen.md](21-battle-tier-screen.md). |
| `icons/rank-shield.webp`, `gold-logo.webp`, `main-logo.webp` | Used | Battle tier rank badge and branding logos. |
| `icons/stepup.webp`, `stepup-new.webp` | Used | Step-Up Battle mode icon (two versions present — confirm with the dev which is current before porting both). |
| `icons/dark.webp`, `earth.webp`, `fire.webp`, `light.webp`, `water.webp`, `wind.webp` | **Used, cosmetic only** | These are the 6 elemental "type" icons. Every playable card has a `setName` field set to one of these six elements (`src/config/cards.json`), and `src/components/common/TypeIcon.tsx` renders the matching icon in the Card Detail modal's "Type" row (`type={activeCard.setName}`). **However, the element has zero effect on battle math** — `setName`/element is never read anywhere under `src/components/battle/`. This is exactly the "6 unused elemental sets" referenced as the basis for a possible future type-advantage system — see [00-INDEX.md](00-INDEX.md) Design Discussion Context. |
| `icons/power.webp`, `defense.webp`, `speed.webp` | Used | Additional stat/category icon set (distinct from the 6 elements above); confirm exact usage against [11-card-detail-modal-and-leveling.md](11-card-detail-modal-and-leveling.md) before final Unity wiring. |

### `shop/` — 4 files — **entire folder orphaned**

| Path | Format | Status | Notes |
|---|---|---|---|
| `shop/bg-cloud-shelf.webp` | webp | **Orphaned** | Not referenced anywhere in `src/`. |
| `shop/bg-scroll-header.webp` | webp | **Orphaned** | Not referenced anywhere in `src/`. |
| `shop/bg-scroll-vertical.webp` | webp | **Orphaned** | Not referenced anywhere in `src/`. |
| `shop/ui-button-gold.webp` | webp | **Orphaned** | Not referenced anywhere in `src/`. |

All four appear to be art for a themed "parchment/scroll shelf" redesign of the Shop screen that was never actually wired up — `src/components/features/shop/ShopScreen.tsx` currently uses plain icon assets from `icons/` instead (`icons/info.webp`, `icons/gem.webp`). Do not port these 4 files as "the shop art" — the live shop UI does not use them. If the dev wants that themed look, it needs to be (re)implemented from scratch in Unity using this leftover art as a starting point, not treated as an already-working reference.

### `sound/` — 11 files (incl. `sfx/` subfolder)

Full breakdown, usage, and volumes are documented in [23-audio-system.md](23-audio-system.md). Summary: 5 files used (`wind_bg.mp3`, `sfx/click.mp3`, `sfx/summon.mp3`, `sfx/card-reveal.mp3`, `sfx/rare-card-reveal.mp3`), 6 files orphaned (`Gacha Gridlock.mp3`, `Gacha Lobby Loops.mp3`, `click.wav`, `reward.mp3`, `sfx/click.wav`, `sfx/reward.mp3`).

### `summon/` — 4 files

Cross-reference: [13-summon-gacha-screen-ui.md](13-summon-gacha-screen-ui.md), [17-battle-flow-overview.md](17-battle-flow-overview.md) (victory/defeat/draw screens).

| Path | Status | Used for |
|---|---|---|
| `summon/active.webp` | Used | Animated "summoning" state art during a gacha pull (`src/components/features/gacha/RateUpSummon/RateUpSummonSection.tsx:217`). |
| `summon/dragon-raise.webp` | Used | Victory screen dragon art (`src/components/battle/VictoryScreen.tsx:69`). |
| `summon/dragon-sleep.webp` | Used | Defeat screen dragon art (`src/components/battle/DefeatScreen.tsx:62`). |
| `summon/dragon-wake.webp` | Used | Draw screen dragon art (`src/components/battle/DrawScreen.tsx:60`). |

### `extra/` — 6 files (not one of the requested categories, included for completeness)

| Path | Format | Status | Used for |
|---|---|---|---|
| `extra/sparkle.png` | png | **Used** | Particle/sparkle overlay in gacha card reveal (`src/components/features/gacha/CardReveal.tsx:123`, `SummonResults.tsx:317`). |
| `extra/blue-spark.png` | png | **Used** | Particle overlay in gacha summon results (`SummonResults.tsx:291`). |
| `extra/gold-spark.png` | png | **Orphaned** | Not found referenced in `src/`; likely an unused variant of the spark VFX above. |
| `extra/green_brush_stroke.svg` | svg | **Orphaned** | Not referenced anywhere in `src/`. |
| `extra/round_black_brush_stroke.svg` | svg | **Orphaned** | Not referenced anywhere in `src/`. |
| `extra/dark_upside_brush_stroke.svg` | svg | **Orphaned** | Not referenced anywhere in `src/`. |

### Loose files directly under `assets/`

| Path | Format | Status | Used for |
|---|---|---|---|
| `assets/chest-closed-clean.png` | png | **Used** | Battle rewards screen closed-chest art (`src/components/battle/RewardsPhase.tsx:37`). See [20-battle-result-rewards.md](20-battle-result-rewards.md). Note: the Quest screen's milestone "chest" nodes do NOT use this real asset — they render a plain colored CSS box with an emoji instead (see [22-quest-system.md](22-quest-system.md)). |
| `assets/chest-open-clean.png` | png | **Used** | Battle rewards screen opened-chest art (`RewardsPhase.tsx:51`). |

### `public/*.png` (app-level, outside `assets/`)

| Path | Status | Used for |
|---|---|---|
| `public/logo.png` | App-level | Browser/PWA icon or app logo, not a gameplay asset — verify against Next.js `manifest`/`favicon` config if porting brand assets. |
| `public/icon.png` | App-level | Same category as above. |

## Assets Used

See "Per-folder Inventory" above — this document's entire body is the assets-used listing.

## Cross-References

- [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md) — the 24-card roster that `Card_Art/common|uncommon|rare/` implements.
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — gold/gem icon usage.
- [10-collection-screen.md](10-collection-screen.md), [11-card-detail-modal-and-leveling.md](11-card-detail-modal-and-leveling.md) — primary consumers of `Card_Art/` and the elemental `icons/`.
- [16-shop-screen.md](16-shop-screen.md) — consumer of `Card_Art/resource/` and the (orphaned) `shop/` folder.
- [22-quest-system.md](22-quest-system.md) — consumer of `icons/quest.webp`; notes the unused real chest art vs. the emoji placeholder.
- [23-audio-system.md](23-audio-system.md) — full `sound/` folder breakdown.

## Unity Porting Notes

- **Recommended Addressables/Resources folder structure**, mirroring this inventory's categories 1:1 so the mapping from "old web asset path" to "new Unity asset key" stays obvious during the port:

```
Assets/
  Art/
    CardArt/
      Common/        <- Card_Art/common/*.webp  (12)
      Uncommon/      <- Card_Art/uncommon/*.webp (8)
      Rare/          <- Card_Art/rare/*.webp     (4)
      Back/          <- Card_Art/back/*.webp     (1)
      Resource/      <- Card_Art/resource/*      (used subset only)
      SourceArchive/ <- Card_Art/Originals/*     (OPTIONAL: keep out of the
                                                    Addressables build entirely;
                                                    high-res source art only,
                                                    not a runtime dependency)
    Avatars/         <- avatars/*.webp
    Backgrounds/     <- background/*.webp (used subset only — drop the 5 Gemini_* files)
    Banners/         <- banner/*.png
    Icons/
      Navigation/
      Currency/
      Stats/
      Elements/      <- dark/earth/fire/light/water/wind (kept together since
                          they're a natural set — this is also the natural
                          home for future elemental-advantage icon/VFX work)
      Difficulty/
      Rarity/
    Shop/            <- OMIT the 4 current files unless the dev revives the
                          parchment-shop redesign; do not treat as required art
    Summon/          <- summon/*.webp
    VFX/             <- extra/sparkle.png, extra/blue-spark.png (drop gold-spark.png
                          and the 3 unreferenced brush-stroke SVGs unless repurposed)
    Rewards/         <- assets/chest-closed-clean.png, chest-open-clean.png
  Audio/
    Music/           <- sound/wind_bg.mp3 only
    SFX/             <- sound/sfx/click.mp3, summon.mp3, card-reveal.mp3, rare-card-reveal.mp3
```

- **Do not port**: `Card_Art/1.png`/`2.png`/`3.png`, `Card_Art/resource/random_rare_pack.png`, the 24 `Card_Art/Originals/**` files (unless kept out-of-build as source archive), the 5 `Gemini_Generated_Image_*.webp` backgrounds, all 4 files in `shop/`, `extra/gold-spark.png`, the 3 `extra/*_brush_stroke.svg` files, and the 6 orphaned sound files listed in [23-audio-system.md](23-audio-system.md). Total orphaned: roughly 45 of the ~144 files under `public/assets/`.
- **`Card_Art/Originals/`** is almost certainly the pre-compression/source-resolution art used to generate the shipped `.webp` files (identical file counts per rarity tier: 12/8/4 in both). Recommend keeping these as an offline Unity-editor-only reference (e.g. a `SourceArt~` folder excluded from the build, or simply outside `Assets/` entirely) rather than importing them as Addressable/Resources content — they'd only bloat build size with no runtime purpose.
- **Elemental icons are a real, already-authored asset set** (`dark`, `earth`, `fire`, `light`, `water`, `wind`) tied to a real per-card data field (`setName`) that's already displayed in the UI — but currently has no gameplay logic behind it. This is the cleanest possible foundation for the type-advantage system discussed as a forward-looking goal (see [00-INDEX.md](00-INDEX.md) Design Discussion Context) — the art and the data field already exist, only the battle-math hookup is missing.
- Normalize all card/resource art to a single format (`.webp`-equivalent, e.g. Unity `Sprite` with compressed texture format) on import — the source project inconsistently mixes `.png` and `.webp` for what are functionally the same kind of asset (e.g. `resource/card_001-003.webp` vs `resource/card_004-006.png`).
