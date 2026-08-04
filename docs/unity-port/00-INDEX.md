# Riftgard — Unity Port Reference: Master Index

This is the entry point for rebuilding **Riftgard** in Unity. It and the 24 linked documents in this folder are the **sole reference** for the port — they describe every system, screen, formula, and asset in the original web/mobile game in engine-agnostic terms, with exact source citations (`file:line`) back into the original codebase for traceability. You should not need the original JS/React source open to use them, but if a citation looks incomplete or ambiguous, the citation tells you exactly where to look.

## Elevator Pitch

Riftgard is a mobile gacha card-collector and battler: players summon a roster of fantasy creature cards across three rarity tiers (Common / Uncommon / Rare) using two currencies (gold and gems), build them into a deck, and pit that deck against an AI opponent in single-player 3-vs-3 stat-comparison duels (no live PvP, no server/backend — everything runs and persists entirely on-device). Progression loops through leveling up cards, climbing a battle-tier ladder, completing daily/weekly/lifetime quests, and spending currency in a shop — all wrapped in a light, chibi-fantasy visual style.

## Original Tech Stack (context only — does not need to map 1:1 to Unity)

The original is a Next.js 16 / React 19 single-page mobile web app, not a native app. This list exists purely so you understand what pattern each Unity system is *replacing*, not because Unity needs an equivalent for every entry:

- **Next.js 16** — page routing/shell. → Unity equivalent: a single persistent scene with a `GameManager`-driven screen-switching system (see "Recommended Unity Project Structure" below), not multiple actual Unity scenes per "page."
- **React 19** — component/UI rendering. → Unity equivalent: UGUI or UI Toolkit view components/prefabs.
- **Redux Toolkit 2.x** — global app state, organized into "slices" (`questSlice`, `playerSlice`, `settingsSlice`, etc.), each a small reducer + typed actions. → Unity equivalent: a `GameState` singleton (or one ScriptableObject/manager class per former slice — e.g. `QuestManager`, `PlayerManager`, `SettingsManager`) each owning its own serializable state and exposing methods instead of dispatched actions.
- **Framer Motion 12.x** — declarative, timed UI animations (progress bar fills, card reveals, screen transitions). → Unity equivalent: Coroutines, DOTween, or Animator/Timeline, depending on the animation's complexity.
- **crypto-js 4.x** — used to obfuscate/encrypt the local save blob before writing it to storage. → Unity equivalent: covered in [09-save-persistence-system.md](09-save-persistence-system.md); Unity has its own serialization/encryption options (e.g. `System.Security.Cryptography`) that can replicate the same "obfuscated local save file" intent.
- Config data (cards, quests, shop items, etc.) lives in flat JSON files under `src/config/`. → Unity equivalent: ScriptableObjects (one definition asset per config entry, or one "database" ScriptableObject holding an array), as recommended throughout these docs.

None of this stack needs to be reproduced literally — every doc below describes *behavior and data*, and leaves the Unity-specific implementation choice (ScriptableObject vs. plain C# class, Coroutine vs. DOTween, etc.) as a recommendation, not a requirement.

## Table of Contents

### Core Systems & Data
- [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md) — Card schema, stat fields, the 3 rarity tiers, and the 24-card roster.
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — Player level/XP curve, gold and gems, and the shared reward-granting contract used by battle, quests, and the shop.
- [09-save-persistence-system.md](09-save-persistence-system.md) — What state persists, the local save format/encryption, and load/migration behavior.

### App Shell & Navigation
- [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md) — Root app structure, global Redux store shape, and the screen-switching model.
- [02-start-screen.md](02-start-screen.md) — Boot/splash screen, asset preloading, and entry into the game.
- [03-home-screen.md](03-home-screen.md) — Main hub screen: mode tiles, banner, top bar summary.
- [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md) — Persistent top bar (currencies/profile) and bottom tab navigation.
- [05-settings-screen.md](05-settings-screen.md) — Music/SFX mute toggles and any other player-facing settings.
- [06-profile-modal.md](06-profile-modal.md) — Player name/tag, avatar selection, and profile-picture unlock state.

### Collection & Cards
- [10-collection-screen.md](10-collection-screen.md) — Card collection grid, filtering/sorting, and card ownership display.
- [11-card-detail-modal-and-leveling.md](11-card-detail-modal-and-leveling.md) — Per-card detail view, stats, elemental "Type" display, and the card-leveling flow.
- [12-deck-building-system.md](12-deck-building-system.md) — Deck composition rules and the deck-editing UI.

### Gacha / Summon
- [13-summon-gacha-screen-ui.md](13-summon-gacha-screen-ui.md) — Summon screen layout, single vs. 10x pull, and reveal presentation.
- [14-gacha-mechanics-rates-pity.md](14-gacha-mechanics-rates-pity.md) — Drop-rate table, rarity weighting, and any pity/guarantee logic.
- [15-offering-rates-screen.md](15-offering-rates-screen.md) — The rates-disclosure screen shown to the player.
- [16-shop-screen.md](16-shop-screen.md) — Shop item catalog (specific cards, random packs, gem packs) and purchase flow.

### Battle
- [17-battle-flow-overview.md](17-battle-flow-overview.md) — End-to-end battle flow from mode select through result screen.
- [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md) — Mode picker and pre-battle deck selection.
- [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md) — The 3v3 stat-comparison combat resolution logic itself.
- [20-battle-result-rewards.md](20-battle-result-rewards.md) — Victory/defeat/draw outcomes and reward granting.
- [21-battle-tier-screen.md](21-battle-tier-screen.md) — Battle tier ladder, difficulty tiers, and rank progression.

### Meta Systems
- [22-quest-system.md](22-quest-system.md) — Daily/Weekly/Achievement quests, milestone rewards, and reset rules.
- [23-audio-system.md](23-audio-system.md) — Background music and SFX behavior, and the mute-gating rules.
- [24-asset-inventory.md](24-asset-inventory.md) — Full `public/assets/` inventory by folder, usage cross-references, and orphaned-asset flags.

## Known Gaps / Unfinished Features in the Original

These are things left stubbed, disabled, or dead in the source. **Do not treat any of these as a real spec to replicate faithfully** — they're either bugs, abandoned work-in-progress, or leftover developer tooling. Where noted, they're also flagged as green-field design opportunities for the Unity version.

| Item | What's actually there | Where | Recommendation |
|---|---|---|---|
| **Story Mode** | Home screen has a fully-styled "Story Mode" button with its own icon and copy, but the `onClick` handler only does `console.log("Story Mode")` — no screen, no content behind it. | `src/components/BattleScreen.tsx:68-71` | Green-field: design and build Story Mode fresh for Unity: nothing to port, no existing spec to be faithful to. |
| **Rank Up (card fusion/evolution)** | Card Detail modal has a "Rank Up" button, but its handler is a debug stub: `console.log("Debug - Rank up coming soon")`. No fusion/evolution mechanic exists anywhere in the data model or battle logic. | `src/components/features/collection/CardDetailModal.tsx:299-315` | Green-field: this is exactly the hook point for the WWE-SuperCard-style fusion ladder discussed below — design it fresh, don't reverse-engineer a "coming soon" stub. |
| **Avatar/profile-picture unlock conditions unenforced** | `profileIcons.json` defines real unlock text ("Reach Level 5", "Reach Level 10") for 2 of the 3 avatars, and a `unlockProfilePic(id)` reducer action exists to grant them — but that action is never dispatched anywhere in the codebase. Those two avatars are permanently locked/grayed-out in the live app regardless of player level. | `src/config/profileIcons.json:8-19`, `src/store/slices/playerSlice.ts:188-192` (action defined, never called) | In the Unity port, actually wire level-based avatar unlocks into the level-up flow — this is a real, intended feature, just never connected in the source. |
| **Dead legacy battle component** | `BattlePhase.tsx` (the original battle-round component) is imported into `BattleFlow.tsx` but its usage is commented out; `BattlePhaseNew.tsx` is the component actually rendered and is the one all other docs describe/cite. | `src/components/battle/BattleFlow.tsx:16,19,195` | Ignore `BattlePhase.tsx` entirely — it is not live code. All battle-mechanics documentation in this folder is based on `BattlePhaseNew.tsx`. |
| **Non-functional Quests reset countdown** | The Quests screen shows a permanently static `"Resets in: 14h 23m"` label — it is a hardcoded string, not a computed countdown, and never changes. | `src/components/QuestScreen.tsx:104-107` | Implement a real countdown-to-next-reset in the Unity port. Full reset-timing algorithm is documented in [22-quest-system.md](22-quest-system.md). |
| **Hidden dev-debug "Secret Reset Button"** | A nearly-invisible 16×16px transparent button in the top-right corner of the Quests screen wipes the player's entire local save (`localStorage.clear()`) and reloads, after a confirm dialog. | `src/components/QuestScreen.tsx:58-67, 76-82` | **Omit from the Unity port entirely.** It's a developer QA tool left in the shipped UI, not a player-facing feature. If a save-reset debug tool is wanted, gate it behind an editor/QA-only build flag. |
| **Missing level-up SFX** | `LevelUpPopup.tsx` has a commented-out placeholder for a level-up sound effect (`// const audio = new Audio('/sounds/levelup.mp3')`), gated correctly behind the mute flag, but never actually implemented — no such file exists. | `src/components/features/collection/LevelUpPopup.tsx:53-60` | Green-field: implement a real level-up SFX in Unity; there's no existing asset or behavior to match. |
| **Elemental "Type" field is cosmetic only** | Every card has a `setName` field (Earth/Water/Wind/Dark/Fire/Light) shown as a "Type" icon in the Card Detail modal, and all 6 corresponding icon assets exist — but the field is never read anywhere in the battle-resolution code. There is no type-advantage/damage-modifier system. | `src/config/cards.json` (`setName` field), `src/components/common/TypeIcon.tsx`, confirmed absent from `src/components/battle/**` | See Design Discussion Context below — this is the explicit basis for a possible future elemental type-advantage system. Don't invent battle math to "explain" the existing icons; there isn't any in the source. |
| **Orphaned/unused assets** | Roughly 45 files under `public/assets/` are never referenced by any code path (leftover AI-generated background images, an entire unused "themed shop" art set, duplicate/legacy sound files, a full-resolution card-art source archive, stray brush-stroke SVGs, etc.). | Full breakdown in [24-asset-inventory.md](24-asset-inventory.md) | Do not port these as if they were live game art — each one is flagged individually in the asset inventory with the reason it's considered orphaned. |

## Recommended Unity Project Structure

```
Assets/
  _Riftgard/
    Scripts/
      Core/
        GameManager.cs        // singleton: current screen/state, boot sequence,
                               // owns/coordinates the manager singletons below
                               // (replaces Next.js page routing + top-level app shell)
        SaveManager.cs         // load/save/migrate the local save file
                               // (replaces the Redux persistence middleware + crypto-js)
        AudioManager.cs        // music + SFX playback, mute gating (see 23-audio-system.md)
      Data/                    // ScriptableObject definitions, one folder per config.json equivalent
        CardDefinition.cs
        QuestDefinition.cs
        ProgressRewardDefinition.cs
        ShopItemDefinition.cs
        ProfileIconDefinition.cs
        ...
      Systems/                 // one manager class per former Redux "slice"
        PlayerManager.cs        // <- playerSlice (level, xp, gold, gems, profile, unlocks)
        QuestManager.cs         // <- questSlice
        SettingsManager.cs      // <- settingsSlice
        BattleManager.cs        // <- battle flow/engine state
        CollectionManager.cs    // <- owned-card inventory state
      UI/
        Screens/                // one folder per screen doc (Home, Collection, Shop, Quests, ...)
        Modals/                 // CardDetail, Profile, LevelUp, etc.
        Components/             // shared buttons, top bar, bottom nav
    Data/                       // ScriptableObject *assets* (the actual authored data,
                                 // as opposed to the C# class definitions above)
      Cards/
      Quests/
      ShopItems/
      ProfileIcons/
    Art/                        // mirrors public/assets/ — see the full recommended
                                 // layout in 24-asset-inventory.md's Unity Porting Notes
    Audio/
    Resources/ or Addressables/ // whichever asset-loading strategy is chosen; either way,
                                 // key names should mirror the Art/ and Audio/ folder paths
                                 // 1:1 so "old web path -> new Unity key" stays obvious
```

Key structural recommendations:
- **ScriptableObjects for all `config/*.json` equivalents** (`cards.json`, `quests.json`, `shopConfig.ts`, `profileIcons.json`, `resources.json`, etc.) — author them as individual definition assets (or one "database" SO per system holding an array of definitions), giving designers an Inspector-editable equivalent of the original flat JSON files.
- **One `GameManager` singleton** for boot sequence and current-screen state, replacing the Next.js page-routing model — since the original is effectively a single-page app that swaps which "screen" component is mounted, Unity should do the same with one persistent scene and a screen-stack/state-machine, not a scene-per-screen approach.
- **One `SaveManager`** as the single point of contact for reading/writing the local save file, mirroring how the original centralizes all persisted Redux state through one save/load path (see [09-save-persistence-system.md](09-save-persistence-system.md) for exactly what fields need to persist and the original's encryption approach).
- **One manager class per former Redux slice** (`PlayerManager`, `QuestManager`, `SettingsManager`, etc.) rather than one giant monolithic state object — this mirrors the original's modular-slice structure and keeps each system's logic (e.g. the quest reset algorithm) testable in isolation, exactly as documented per-system in docs 01–24.

## Design Discussion Context

The original developer is considering two forward-looking features for the Unity version. **Neither exists in the current source** — they are not documented elsewhere in this folder as real systems, and nothing in docs 01–24 should be read as already implementing them. They're noted here purely so the Unity architecture can leave room for them:

1. **Elemental type-advantage system.** The card data already has a `setName` element field (Earth/Water/Wind/Dark/Fire/Light) and matching icon art for all 6 elements (`icons/earth.webp`, `water.webp`, `wind.webp`, `dark.webp`, `fire.webp`, `light.webp` — see [24-asset-inventory.md](24-asset-inventory.md)), currently displayed purely cosmetically in the Card Detail modal with zero effect on battle outcomes. The idea under discussion is to add real gameplay behind it: buffs/debuffs (e.g. damage or stat modifiers) based on a card's element relative to the opponent's card element, similar to a rock-paper-scissors style advantage wheel. When designing the Unity battle engine ([19-battle-engine-mechanics.md](19-battle-engine-mechanics.md)), consider structuring the stat-comparison/damage calculation so an elemental modifier step can be inserted later without a rewrite (e.g. a clean `ComputeElementalModifier(attackerElement, defenderElement)` seam in the combat resolution pipeline), even though it isn't implemented yet.
2. **Card fusion / rank-up progression ladder**, in the style of WWE SuperCard: evolving a card up through rarity tiers by consuming *other cards of the same rarity as fusion material* — deliberately **not** requiring exact duplicates of the same card, specifically to avoid punishing the player's summon-grind (i.e. any spare Common card can help rank up any other Common card, not just spare copies of that exact card). This would attach to the currently-stubbed "Rank Up" button in the Card Detail modal (see Known Gaps above — it's presently just a `console.log` debug placeholder with no logic behind it). When designing the Unity collection/leveling system ([11-card-detail-modal-and-leveling.md](11-card-detail-modal-and-leveling.md), [12-deck-building-system.md](12-deck-building-system.md)), leave room for a "consume N same-rarity cards to rank up" flow alongside the existing gold/XP leveling flow, without treating the stubbed button's current no-op behavior as the intended final design.
