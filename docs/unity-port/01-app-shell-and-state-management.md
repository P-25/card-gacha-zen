# App Shell & State Management

## Purpose / Overview

Riftgard is a **single page application**. There is no traditional multi-scene router — the entire game lives on one page (`src/pages/index.tsx`) and "navigation" is really just swapping which content component is rendered inside a fixed phone-shaped frame, based on one in-memory enum value (`appState`). A separate top-level splash/intro overlay (the Start Screen) is shown on top of everything until the player taps to begin.

For a Unity port, the equivalent architecture is:
- One persistent root Scene (or a DontDestroyOnLoad bootstrap object) containing the phone-frame Canvas, top bar, bottom nav, and background.
- A single "current screen" enum/state variable that controls which child Canvas/Panel is active, driven by a simple state machine or a `UnityEvent<ScreenId>` navigation service — not Unity's `SceneManager` scene loading (there is only ever one real "scene" here; sub-screens are UI panels, not scenes).
- A global save-data object (Redux store equivalent) injected into all UI panels.

## Data Model (suggested Unity equivalent)

The web app uses two separate pieces of state that should be merged conceptually in Unity:

1. **Ephemeral UI state** (`useGameState` hook, `src/hooks/useGameState.ts:22-56`) — not persisted, resets on every reload:
   - `appState: AppState` — current screen enum (see table below).
   - `resources: { gold: number; gems: number }` — **dead/unused legacy state**. It is initialized to `{ gold: 5000, gems: 500 }` and has a `spendResources` setter, but nothing in the app reads `resources` for display; the actual gold/gems shown in the UI come from the Redux `player` slice (`src/components/features/topbar/GoldCoin.tsx:8`, `Gems.tsx:8`). **Do not port this duplicate resource pool** — treat `player.gold`/`player.gems` (see below) as the single source of truth.

2. **Persistent save data** (Redux store, `src/store/store.ts:22-31`) — 4 slices, combined into `RootState`. Each slice is saved to local storage on every single action dispatch (see Behavior section). Suggested Unity C# shape:

```csharp
[Serializable]
public class GameSaveData
{
    public PlayerState player;
    public Dictionary<string, PityState> pity;      // keyed by bannerId
    public SettingsState settings;
    public QuestState quest;
}

[Serializable]
public class PlayerState
{
    public int gems;
    public int gold;
    public List<CardInstance> inventory;
    public int level;
    public int experience;
    // Profile
    public string name;
    public string tag;
    public string activeProfilePicId;
    public List<string> unlockedProfilePicIds;
    // Battle Tier
    public int battleTier;
    // Level-up popup tracking
    public int lastSeenLevel;
}

[Serializable]
public class SettingsState
{
    public bool isBgmMuted;
    public bool isSfxMuted;
}

[Serializable]
public class QuestState
{
    public Dictionary<string, int> progress;             // questId -> count
    public List<string> claimedQuests;
    public List<string> claimedProgressRewards;
    public long lastDailyReset;    // epoch ms
    public long lastWeeklyReset;   // epoch ms
}
```

Full detail on `player` fields is in [08-player-progression-currencies.md](08-player-progression-currencies.md), pity in [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md) / gacha docs, quest in [22-quest-system.md](22-quest-system.md), and persistence mechanics in [09-save-persistence-system.md](09-save-persistence-system.md). This doc only covers the shape needed to understand app-shell behavior.

## UI Layout — Phone Frame Shell

Source: `src/components/layout/GameLayout.tsx:17-67`, `src/components/layout/Background.tsx`.

Hierarchy (outermost to innermost):
1. **Root container** — full viewport height (`h-dvh`), centers its children, solid `#1a1a1a` background, `overflow: hidden`.
2. **Desktop-only decorative background** (only visible on wide/desktop viewports, `lg:` breakpoint and up — irrelevant for a mobile Unity build, but note for reference): a full-bleed blurred copy of `full-background.webp` at 50% opacity with a black/30% + 2px blur overlay, positioned behind the phone frame.
3. **"game-viewport" main frame** — this is the actual mobile game canvas:
   - On mobile widths: fills 100% of width/height.
   - On `sm:` breakpoint and up (simulating a phone within a browser window): fixed aspect ratio 9:19.5, max width 430px, max height 932px, height 95vh.
   - Visual chrome: black background, rounded corners (`rounded-4xl`, only on `sm:`+), 4px border `#2a2a2a`, drop shadow.
   - Contains, in z-order back to front:
     a. `Background` component (z-0) — see below.
     b. Main content area (z-10) — the currently active screen, cross-faded (see Animations).
     c. `BottomNav` (z-50, absolutely positioned at the bottom) — only rendered when `appState !== "loading"` AND the parent's `showNav` flag is true.

**Background component** (`src/components/layout/Background.tsx`):
- Base fill color `#F5F2EB` (warm off-white).
- `light-bg.webp` image, `object-cover`, 80% opacity, marked with a `no-global-filter` class (see Unity Porting Notes on the global image filter below).
- A parallax cloud layer: `clouds.webp` tiled/repeated horizontally at 10% opacity, animated (see Animations & Timing).
- A top-white-40% → transparent → bottom-white-60% linear gradient overlay on top of everything, for readability.

For a Unity port: this is 4 stacked full-screen Images inside a fixed-aspect Safe Area container (RectTransform matching a 9:19.5 phone canvas), not literal "frame chrome" — the black border/rounded corners are a browser-preview affordance and can be ignored for a native mobile build (only relevant if you also want a desktop/tablet letterboxed preview mode).

## Behavior & Logic

### appState values and screen mapping

`AppState` type, `src/hooks/useGameState.ts:3-15`. Screen routing happens in `src/pages/index.tsx:56-95`.

| appState value | Screen component rendered | Notes |
|---|---|---|
| `loading` | *(none — GameLayout shows only background, no nav)* | Initial state; see Animations for timing. |
| `home` | `HomeScreen` | Main menu — see [03-home-screen.md](03-home-screen.md). |
| `gacha` | `GachaScreen` | Bottom nav hidden. See [13-summon-gacha-screen-ui.md](13-summon-gacha-screen-ui.md). |
| `quests` | `QuestScreen` | See [22-quest-system.md](22-quest-system.md). |
| `collection` | `CollectionScreen` | See [10-collection-screen.md](10-collection-screen.md). |
| `battle` | `BattleScreen` | Bottom nav hidden unless the battle screen explicitly calls `setBattleNavVisible(true)`. See [17-battle-flow-overview.md](17-battle-flow-overview.md). |
| `deck` | `PlaceholderScreen title="Deck" icon="🃏"` | **Stub only** — not implemented. |
| `shop` | `ShopScreen title="Shop"` | Implementation not covered by this doc set's read list. |
| `social` | `PlaceholderScreen title="Social" icon="👥"` | **Stub only** — not implemented. |
| `offering-rates` | `OfferingRatesScreen` | Bottom nav hidden. Rates/odds info screen for gacha. |
| `tier` | `BattleTierScreen` | See [21-battle-tier-screen.md](21-battle-tier-screen.md). Back button returns to `home` directly (hardcoded, not previous screen). |
| `settings` | `SettingsScreen` | See [05-settings-screen.md](05-settings-screen.md). Back button returns to `home` directly (hardcoded). |

Navigation is a flat function `navigateTo(screen: AppState)` that simply overwrites `appState` — there is no navigation stack/history. "Back" buttons on sub-screens hardcode their destination (usually `home`), they do not pop a stack.

### Global loading gate

`isGlobalLoading = appState === "loading" || assetsLoading` (`src/pages/index.tsx:54`). While true, **no screen component is rendered at all** (all the `{!isGlobalLoading && appState === "x" && ...}` blocks are skipped), even though `GameLayout`/`Background` are already mounted underneath. `assetsLoading` comes from `useAssetLoader` (see below).

### Bottom nav visibility rule

`src/pages/index.tsx:49-52`:
```
showNav = appState !== "gacha"
       && appState !== "offering-rates"
       && (appState !== "battle" || isBattleNavVisible)
```
So the bottom nav is hidden on the gacha screen and the offering-rates screen unconditionally, hidden on `loading` (via the separate `appState !== "loading"` check in `GameLayout`), and on the battle screen it's hidden by default but can be toggled visible by the battle screen itself via the `setBattleNavVisible` callback it receives as a prop. Full detail in [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md).

### Boot sequence — what fires on every app load

1. `_app.tsx` mounts `ReduxProvider` first (`src/components/ReduxProvider.tsx:7-23`). It renders **nothing** (`return null`) until an initial `useEffect` runs `hydrateStore()` synchronously and flips a local `isHydrated` flag — this loads all 4 slices from local storage (see [09-save-persistence-system.md](09-save-persistence-system.md)) before any UI mounts, so screens never see default/pre-load state.
2. Once hydrated, `_app.tsx` (`src/pages/_app.tsx:18-37`) mounts, always in this order: `BackgroundMusic` (always mounted, plays on user interaction — see [23-audio-system.md](23-audio-system.md)), then conditionally `StartScreen` (shown while local `hasStarted` state is false — this is a component-local flag, not part of `appState` or Redux; it always starts `false` on every load, i.e. the splash/start screen replays every single page load/app boot), then the actual page (`index.tsx`).
3. `index.tsx` mounts and its own `useEffect` (`src/pages/index.tsx:36-39`) fires exactly once per load, dispatching, in order:
   - `checkResets()` (quest slice) — checks whether a new day/week has begun since `lastDailyReset`/`lastWeeklyReset` and resets daily/weekly quest progress + un-claims their rewards if so. Daily reset triggers when the local calendar date differs; weekly reset triggers if ≥7 days have elapsed OR the current weekday number is less than the last-reset weekday number (i.e. a Sunday→Monday boundary was crossed). Exact logic: `src/store/slices/questSlice.ts:59-129`.
   - `updateQuestProgress({ type: "LOGIN", amount: 1 })` — increments progress by 1 on every quest whose `requirementType === "LOGIN"`, capped at that quest's `targetCount`. This is effectively a "daily login" tick that fires on every app load (not just once per day).
   - These two dispatches happen independently of the `useGameState` "loading" timer described below — they fire as soon as `index.tsx` mounts, in parallel with the 3-second fake-loading timer.
4. Simultaneously, `useGameState`'s `appState` starts at `"loading"` and a `setTimeout` unconditionally flips it to `"home"` after exactly **3000ms** (`src/hooks/useGameState.ts:30-37`) — this is not tied to real asset-loading completion, it's a fixed timer.
5. Also simultaneously, `useAssetLoader` (`src/hooks/useAssetLoader.ts`) preloads a fixed critical-asset list (see below) by creating `Image` objects for each URL and listening for `onload`/`onerror` (errors are treated as "loaded" — i.e. loading never blocks forever on a missing file). `isLoading` becomes `false` once every asset has fired load-or-error. `assetsLoading` gates the "no screen shown" state independent of the 3-second timer — i.e. actual UI in `index.tsx` only appears once **both** the 3-second timer has elapsed AND all critical assets have loaded/errored.

### Critical asset preload list

Exact list passed to `useAssetLoader`, `src/pages/index.tsx:18-30`:
```
/assets/background/full-background.webp
/assets/background/light-bg.webp
/assets/icons/home.webp
/assets/icons/battle.webp
/assets/icons/collection.webp
/assets/icons/shop.webp
/assets/icons/quest.webp
/assets/icons/gem.webp
/assets/icons/gold-coin.webp
/assets/icons/info.webp
/assets/banner/banner_dragon.png
```
Note `icons/info.webp` is preloaded but not obviously used by any of the screens covered in this doc set — likely used by a screen outside this read list (shop or offering-rates info tooltip). In Unity, preload the equivalent sprite atlas entries during your loading-screen/splash phase.

## Animations & Timing

| Element | Effect | Duration / Timing | Source |
|---|---|---|---|
| Screen cross-fade (any `appState` change) | Outgoing screen: fades out, scales 1→1.05, blurs 0→10px. Incoming screen: fades in from opacity 0, scales 0.95→1, blur 10px→0. Uses "wait" mode (outgoing fully exits before incoming enters — not simultaneous crossfade). | 400ms, easing `circOut` | `GameLayout.tsx:46-57` |
| Cloud parallax layer | Background-position X animates from `-100%` to `140%`, linear, loops forever | 300,000ms (300s) per loop | `Background.tsx:24-31` |
| Fake loading timer (`useGameState`) | `appState` forced from `loading` → `home` | Fixed 3000ms, one-shot | `useGameState.ts:32-35` |

## Numbers & Formulas

| Constant | Value | Source |
|---|---|---|
| Fake loading duration (post-splash) | 3000 ms | `useGameState.ts:34` |
| Screen transition duration | 400 ms | `GameLayout.tsx:52` |
| Screen transition easing | `circOut` | `GameLayout.tsx:52` |
| Cloud parallax loop duration | 300 s | `Background.tsx:28` |
| Legacy unused starting resources (`useGameState`) | gold 5000, gems 500 | `useGameState.ts:24-27` — **not used for display, do not port** |
| Actual starting player resources (Redux) | gems 900, gold 100 | `playerSlice.ts:23-24` — this is the real starting currency |
| Global image filter (applied to all `<img>` except those explicitly opted out) | `contrast(130%) saturate(110%)` | `src/styles/globals.css:39-41` |

## Assets Used

- `/assets/background/full-background.webp` — desktop letterbox background (also preloaded critical asset).
- `/assets/background/light-bg.webp` — in-frame background base layer (also preloaded).
- `/assets/background/clouds.webp` — parallax cloud tile.
- Font: Google Font "Luckiest Guy" (`next/font/google`), loaded as CSS var `--font-luckiest-guy`, applied globally as the default sans font and via a `.font-display` utility class. In Unity, source the equivalent TTF/OTF for "Luckiest Guy" (open, licensed under OFL) as the primary UI font.

## Cross-References

- [02-start-screen.md](02-start-screen.md) — the splash/intro overlay described in the boot sequence above.
- [03-home-screen.md](03-home-screen.md)
- [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md)
- [09-save-persistence-system.md](09-save-persistence-system.md) — full detail on `hydrateStore`/local-storage persistence.
- [22-quest-system.md](22-quest-system.md) — full detail on quest slice, reset logic, LOGIN quest type.
- [23-audio-system.md](23-audio-system.md) — `BackgroundMusic` component behavior.

## Unity Porting Notes

- **Single "scene", not multiple Unity scenes.** Model `appState` as an enum-driven UI panel switcher within one loaded Scene (e.g. a `ScreenManager` MonoBehaviour holding references to each screen's root Canvas/Panel, enabling exactly one at a time). Using separate Unity Scenes per screen would lose the shared persistent top bar/bottom nav and cross-fade transition and is not recommended.
- **No navigation history/stack exists in the source.** Every "back" button hardcodes its target (always `home` in the screens read for this doc). Decide explicitly whether the Unity port should introduce a real back-stack or intentionally preserve this flat, stackless behavior — it is a deliberate simplicity choice in the original, not an oversight, but worth a product decision either way.
- **The `resources` state in `useGameState` is dead code / a duplicate currency pool.** Only `player.gold`/`player.gems` (Redux) are actually displayed or spent by the UI components read for this doc set. Do not port `resources`/`spendResources` — treat player currency as living solely in the save-data player object.
- **The 3-second "loading" delay is an artificial timer, not tied to real work.** In Unity you'll have genuine async asset loading (Addressables/Resources); replace this with real completion signals, but preserve the *behavior* that the splash/start screen and first screen only appear once both a minimum-display-time AND real asset loading are satisfied (mirroring the `isGlobalLoading = loading-timer || assetsLoading` gate), to avoid a jarring flash on fast devices.
- **Global image filter**: nearly every image in the app (any without the `no-global-filter` opt-out class) has a CSS `contrast(130%) saturate(110%)` filter applied globally for a punchier art style. A handful of images (background layers, start-screen background) explicitly opt out via `no-global-filter`. In Unity, decide whether to bake this into the source art, apply a global post-process/color-grade, or apply a shared material/shader adjustment to most UI Images — but exclude the specific backgrounds that opted out in the original (`light-bg.webp`, `start-screen.webp`) if matching 1:1.
- **Quest LOGIN tick fires every app load**, not just once per calendar day — confirm with design whether this is intended (it effectively means a "login" quest counts every time the app is opened/refreshed, including rapid dev-reloads) before replicating literally in Unity, or gate it behind the daily reset if that was the actual intent.
