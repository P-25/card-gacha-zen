# Home Screen

## Purpose / Overview

The main menu screen, shown when `appState === "home"`. It hosts the persistent top bar, a promotional season banner, the two primary navigation actions (Summon / Battle), and an overlay popup that appears after the player levels up. Source: `src/components/HomeScreen.tsx`.

## Data Model

No dedicated slice for this screen itself; it reads from the `player` Redux slice for the level-up popup (`level`, `lastSeenLevel`) and renders `TopBar` (which reads `battleTier`, `gold`, `gems`, `activeProfilePicId` — see [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md)).

Local ephemeral state: a `windowSize` (`{width, height}`) tracked via a resize listener — **dead code**, computed but never rendered (there's a commented-out debug block that used to display it). Do not port.

## UI Layout

Top to bottom, full-height flex column (`src/components/HomeScreen.tsx:42-71`):

1. **TopBar** (`title="Home"`) — persistent top bar; full breakdown in [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md).
2. **HomeBanner** — a single promotional banner card:
   - Container: horizontal padding 16px, `aspect-ratio: 2/1`, top margin 16px, bottom margin 32px, rounded corners (24px), drop shadow, `overflow: hidden`.
   - Background image: `/assets/banner/banner_dragon.png`, `object-cover`, scales to 105% on hover (desktop-only affordance).
   - Left-to-right dark gradient overlay (black/40% → transparent) for text legibility.
   - Text, vertically centered, left-aligned with 24px horizontal padding:
     - Small uppercase label: `"Season 1:"` (white/90%, tracked-out).
     - Large bold heading: `"DRAGON'S WAKE"` (white, 2xl, drop shadow).
   - This is entirely static/hardcoded — there is no banner rotation, carousel, or CMS-driven content; it's a single fixed image + fixed text.
3. **Main Actions Area** — a flex spacer (`flex-1`) that pushes its content (`HomeActions`) to the bottom of the remaining space, with 96px bottom padding (`pb-24`) to clear the persistent bottom nav.
   - **HomeActions**: two large square action buttons laid out side-by-side, horizontally centered, bottom-aligned, with 16px gaps and 24px horizontal / 32px bottom padding on the row:
     - **SUMMON** button — icon `/assets/icons/tornado.webp`, title "SUMMON", subtitle "(Draw Cards)". Tapping navigates to `appState = "gacha"`.
     - **BATTLE** button — icon `/assets/icons/sword.webp`, title "BATTLE", subtitle "(Matchmake)". Tapping navigates to `appState = "battle"`.
     - Button visual style (`MenuButton`, `src/components/features/home/MenuButton.tsx`): square aspect ratio, glassmorphic card — semi-transparent white background (20% → gradient 40%/10% top-to-bottom), backdrop blur, white/30% border, large rounded corners (`rounded-4xl`), soft dual drop-shadow, an inner diagonal highlight gradient overlay, icon roughly 112×112px centered, title below in bold 2xl dark teal (`#1a2e2e`), subtitle below that in the same color at 60% opacity, smaller font. Pressed state: scales down to 95% (active/press feedback), 200ms transition. Plays a click SFX on tap (see [23-audio-system.md](23-audio-system.md)).
4. **Nav spacer** — an empty, non-interactive `<div>` with horizontal padding; effectively unused today (`pointer-events-none`, no visible content). Likely a layout placeholder; safe to omit in Unity.
5. **LevelUpPopup** — conditionally rendered full-screen modal overlay (see below). Not part of the normal layout flow; only appears when triggered.

## Behavior & Logic

### Summon / Battle navigation
- Tapping SUMMON calls `onNavigate("gacha")` → sets global `appState` to `"gacha"` (bottom nav becomes hidden, per the rule in [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md)).
- Tapping BATTLE calls `onNavigate("battle")` → sets global `appState` to `"battle"` (bottom nav hidden by default on this screen too, until the battle screen itself chooses to reveal it).

### Level-Up Popup trigger condition
The popup is a pure derived-state overlay with **no explicit "level up" event/animation on the moment of leveling** — it is simply shown whenever, on render, `player.level > player.lastSeenLevel` (`src/components/HomeScreen.tsx:86`). This condition can remain true across screen navigations/reloads until the player explicitly claims it (see below), i.e. if a player levels up while on the Gacha or Battle screen, the popup will appear the next time they land on the Home screen (since it's only rendered inside `HomeScreen`), not immediately at the moment of leveling.

- `levelsGained = level - lastSeenLevel` — supports showing/rewarding multiple accumulated levels at once if the player leveled up more than once since last acknowledging.
- If `level <= lastSeenLevel`, nothing renders (component returns `null`).

### Claim behavior
Tapping the "Claim" button dispatches the `acknowledgeLevelUp` reducer (`src/store/slices/playerSlice.ts:233-244`):
1. Recomputes `levelsGained = level - lastSeenLevel` server-side (i.e. inside the reducer, independent of the popup's own render-time calculation — same formula, so they always agree).
2. If `levelsGained > 0`:
   - Sets `lastSeenLevel = level` (this is what makes the popup disappear on next render, since the trigger condition becomes false).
   - Grants `gems += 100 * levelsGained`.
   - Grants `gold += 300 * levelsGained`.
3. There is no "close without claiming" — the modal has no dismiss/backdrop-close affordance; the only interactive element is the Claim button itself (backdrop is a plain non-interactive `black/80%` blur, not clickable).

## Animations & Timing

| Element | Animation | Duration | Trigger |
|---|---|---|---|
| HomeActions buttons | Slide/fade in: `y` 50→0, `opacity` 0→1, spring physics | 500 ms, staggered by `index * 100ms` (Summon at 0ms delay, Battle at 100ms delay) | On HomeScreen mount |
| MenuButton press | `scale` → 0.95 on active/press | 200 ms | On tap-down |
| Level-Up Popup entrance | `scale` 0.8→1, `opacity` 0→1, `rotate` -5°→0° | default spring (no explicit duration override) | When popup becomes visible |
| Level-Up Popup background rays | Full 360° rotation of a conic-gradient ray burst layer, looping | 10,000 ms per loop, linear | Continuous while popup is open |
| Banner image hover zoom (desktop only) | `scale` 1→1.05 | 700 ms | Mouse hover (not applicable to touch/mobile) |

## Numbers & Formulas

| Formula / Constant | Value | Source |
|---|---|---|
| Level-up popup trigger | `player.level > player.lastSeenLevel` | `HomeScreen.tsx:86` |
| Levels gained (for reward calc) | `player.level - player.lastSeenLevel` | `HomeScreen.tsx:87` and `playerSlice.ts:235` |
| Gem reward per level-up claim | `100 × levelsGained` | `HomeScreen.tsx:90`, `playerSlice.ts:241` |
| Gold reward per level-up claim | `300 × levelsGained` | `HomeScreen.tsx:91`, `playerSlice.ts:242` |
| HomeActions stagger delay | `index × 0.1s` (0ms, 100ms for the 2 buttons) | `HomeActions.tsx:37` |
| Button press scale | 0.95 | `MenuButton.tsx:24` |
| Banner static text | `"Season 1:"` / `"DRAGON'S WAKE"` (hardcoded) | `HomeBanner.tsx:22-27` |

## Assets Used

- `/assets/banner/banner_dragon.png` — season banner artwork (also a preloaded critical asset).
- `/assets/icons/tornado.webp` — Summon button icon.
- `/assets/icons/sword.webp` — Battle button icon.
- `/assets/icons/gem.webp` — level-up popup gem reward icon.
- `/assets/icons/gold.webp` — level-up popup gold reward icon. **Note: this file was not found under `public/assets/icons/` in the current asset set** (only `gold-coin.webp` exists) — likely a missing/broken asset in the current build. Flag for the Unity port: either source a matching `gold.webp`-equivalent icon or intentionally reuse `gold-coin.webp` for this reward icon.

## Cross-References

- [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md) — `appState` navigation model, screen cross-fade.
- [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md) — TopBar rendered at the top of this screen.
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — full player leveling/XP model (`level`, `experience`, XP-per-level formula).
- [13-summon-gacha-screen-ui.md](13-summon-gacha-screen-ui.md) — destination of the Summon button.
- [17-battle-flow-overview.md](17-battle-flow-overview.md) — destination of the Battle button.
- [06-profile-modal.md](06-profile-modal.md) — reachable via the TopBar profile avatar, also displays level/XP.

## Unity Porting Notes

- The level-up popup is **not tied to a real-time "you just leveled up" event** — it's a render-time comparison (`level > lastSeenLevel`) checked wherever `HomeScreen` renders. Port this as a condition evaluated when the Home screen becomes active/visible, not as a one-shot event fired at the moment XP crosses a threshold (which may happen on a different screen, e.g. after a card-leveling or battle-reward action that increases `player.experience` and triggers `addPlayerExp`/`addRewards`).
- Because leveling can happen on any screen but the popup only exists inside `HomeScreen`, multiple accumulated level-ups compress into a single popup showing the total gained levels/rewards the next time the player visits Home — replicate this batching behavior rather than showing a separate popup per level.
- `gold.webp` asset appears to be missing from the current asset directory (see Assets Used) — verify before porting reward-icon art.
- The "Nav spacer" div in the layout (`HomeScreen.tsx:65`) is inert/unused; no need to replicate it as a distinct UI element in Unity, just ensure your bottom-safe-area padding accounts for the persistent bottom nav height (matches the `pb-24` on the actions container).
- `windowSize` resize-tracking state is dead code (never rendered) — omit from the Unity port.
