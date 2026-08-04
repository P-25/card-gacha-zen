# Navigation: Top Bar & Bottom Nav

## Purpose / Overview

Two persistent chrome elements frame the game's content area: the **Top Bar** (profile avatar, battle-tier badge, gold, gems — shown at the top of `HomeScreen` only, not globally) and the **Bottom Nav** (5-tab navigation bar, rendered by `GameLayout` and shared across most screens). This doc covers both.

Important distinction from the web source: the "Top Bar" (`src/components/features/home/TopBar.tsx`) is **not** rendered by the global layout shell — it's rendered by `HomeScreen` itself (`src/components/HomeScreen.tsx:44`). Only the Bottom Nav (`src/components/BottomNav.tsx`) is truly global, rendered by `GameLayout` (`src/components/layout/GameLayout.tsx:61-63`) on top of whichever screen is active. Other screens outside this doc's read list may render their own top bars/headers independently (e.g. `SettingsScreen` has its own simple header — see [05-settings-screen.md](05-settings-screen.md)).

## Data Model

No dedicated slice; both components are pure read-views over the `player` slice plus two derived selectors:

```csharp
// Selectors (src/store/selectors.ts), recompute from PlayerState + inventory
int SelectPlayerTier(PlayerState p) => p.battleTier > 0 ? p.battleTier : 1;

// Sum of (pow+spd+def) across the top 3 highest-stat-total cards in inventory
int SelectMaxTotalPower(PlayerState p) => TopNCardsByStatSum(p.inventory, 3).Sum(StatTotal);

int SelectTierThreshold(int tier) => tier * 100;   // TP required to unlock next tier

bool SelectCanUpgradeTier(PlayerState p) =>
    SelectMaxTotalPower(p) >= SelectTierThreshold(SelectPlayerTier(p));
```

## UI Layout

### Top Bar (`src/components/features/home/TopBar.tsx:22-122`)

Single horizontal row, `justify-between`, transparent background, bottom border (teal/20% opacity 1px), padding 16px (8px below 400px width breakpoint):

**Left group** (gap 8px):
1. **Profile avatar** (`Profile.tsx`) — 48×48px circle (40×40px under 400px width breakpoint), gradient background (`#8FA89B` → `#7A9286`), 2px white border, drop shadow. Shows the player's currently-equipped avatar image (`activeProfilePicId` looked up in `profileIcons.json`, falling back to the first entry if not found). Tapping opens the Profile Modal (see [06-profile-modal.md](06-profile-modal.md)).
2. **Battle Tier badge** — only rendered if an `onNavigate` callback was passed to `TopBar` (it always is, from `HomeScreen`). 48×48px circle (40×40px under 400px breakpoint), white 2px border, drop shadow, `overflow: hidden`. Contains a shield background image (`rank-shield.webp`, 95% fill) with the current tier number overlaid as bold white text (drop-shadow for legibility), vertically offset slightly downward (`pt-3 pb-4`) to sit inside the shield's shape. Tapping navigates to `appState = "tier"` (the [21-battle-tier-screen.md](21-battle-tier-screen.md) screen). Note: this badge shows the tier number only — it does not itself show the "can upgrade" state visually (no badge/glow when `selectCanUpgradeTier` is true); that indicator, if any, lives inside the Tier screen itself.

**Right group** (gap 16px):
3. **Gold counter** (`GoldCoin.tsx`) — 24×24px coin icon (20×20px under 400px breakpoint) + gold amount as localized/thousands-separated text (`toLocaleString()`), dark teal color (`#1a2e2e`), reads directly from `player.gold`.
4. **Gems counter** (`Gems.tsx`) — 24×24px gem icon (20×20px under 400px breakpoint) + gems amount, same styling/formatting, reads directly from `player.gems`.

There is a commented-out debug button pair (Win/Lose, for forcing Victory/Defeat screens) in the source — not part of the shipped UI; ignore for porting.

### Bottom Nav (`src/components/BottomNav.tsx:14-95`)

Absolutely positioned at the bottom of the phone frame (`z-50`), full width. Visual bar: 80px tall, background `#ECEEFB` (pale lavender), rounded top corners (24px), items spaced `justify-around` with small horizontal padding, drop shadow above the bar.

Exactly **5 tabs**, left to right, each a vertical stack (icon above label) inside a 64px-wide tap target:

| Tab id | Label | Icon | Maps to `appState` |
|---|---|---|---|
| `home` | HOME | `/assets/icons/home.webp` | `"home"` |
| `collection` | COLLECTION | `/assets/icons/collection.webp` | `"collection"` |
| `shop` | SHOP | `/assets/icons/shop.webp` | `"shop"` |
| `quests` | QUESTS | `/assets/icons/quest.webp` | `"quests"` |
| `settings` | SETTINGS | `/assets/icons/setting.webp` | `"settings"` |

Per-tab visual states:
- **Icon**: 32×32px. Active tab: 110% scale, full color. Inactive tabs: 70% opacity + grayscale filter. Transition 300ms.
- **Label**: 10px, bold, widest letter-tracking. Active: dark gray `#4A4A4A`. Inactive: lighter gray `#8C8C8C`. Transition 300ms (color).
- **Active-tab indicator**: an 8×4px rounded pill in `#4A4A4A`, anchored to the bottom edge of the active tab only. Uses a **shared layout-animation id** (`layoutId="activeTabIndicator"`) so that when the active tab changes, the pill visually slides/morphs from its old position to the new tab's position rather than popping — spring physics (`stiffness: 500, damping: 30`).
- Tapping any tab plays a click SFX (see [23-audio-system.md](23-audio-system.md)) and calls `onNavigate(tabId)`.

### Bottom Nav visibility rules (recap; full detail in [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md))

The nav is entirely omitted (not just hidden — unmounted) when:
- `appState === "loading"` (checked in `GameLayout` directly), OR
- The computed `showNav` flag from `index.tsx` is false, which happens when:
  - `appState === "gacha"`, or
  - `appState === "offering-rates"`, or
  - `appState === "battle"` AND the battle screen has not explicitly requested the nav be shown (`isBattleNavVisible` starts `true` by default in `index.tsx` state, but the Battle screen can toggle it via the `setBattleNavVisible` prop it's given — exact battle-screen behavior is out of scope for this doc, see [17-battle-flow-overview.md](17-battle-flow-overview.md)).

Since `"tier"` and `"settings"` are not in the exclusion list, the Bottom Nav **remains visible** on the Battle Tier screen and the Settings screen, even though neither of those screens is one of the 5 nav tabs — meaning none of the tabs will show as "active" while on those screens (the `activeTab` prop will be `"tier"` or `"settings"`, which doesn't match any `navItems[].id`, so no pill indicator is shown and no icon is highlighted).

## Behavior & Logic

- Both bar components are stateless pass-throughs over Redux selectors — there is no local caching, debouncing, or animation queuing on value changes; gold/gems text updates immediately and synchronously whenever the underlying Redux state changes (e.g. after a purchase or reward).
- The Battle Tier badge's `onNavigate("tier")` and each Bottom Nav tab's `onNavigate(tabId)` both funnel into the same global `navigateTo` function described in [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md) — flat state overwrite, no navigation stack.

## Animations & Timing

| Element | Animation | Duration |
|---|---|---|
| Bottom nav icon active/inactive swap | Scale + grayscale/opacity transition | 300 ms |
| Bottom nav label color swap | Color transition | 300 ms |
| Active-tab indicator pill | Shared-layout slide/morph between tabs, spring | stiffness 500, damping 30 (no fixed ms — spring-based) |

## Numbers & Formulas

| Constant | Value | Source |
|---|---|---|
| Tier upgrade TP threshold | `currentTier × 100` | `src/config/tierConfig.ts:4-9` |
| Tier upgrade reward (on actual upgrade, applied elsewhere — see tier screen doc) | +30 gems, +1000 gold | `TIER_REWARD_GEMS`/`TIER_REWARD_GOLD`, `src/config/tierConfig.ts:1-2` |
| Max Total Power (MaxTP) | Sum of (pow+spd+def) across the top 3 cards by that same stat sum | `src/store/selectors.ts:16-41` |
| Top bar / avatar size | 48×48px (40×40px under 400px viewport width) | `Profile.tsx:24`, `TopBar.tsx:41` |
| Bottom nav bar height | 80px | `BottomNav.tsx:47` |
| Bottom nav icon size | 32×32px | `BottomNav.tsx:61` |
| Active indicator pill size | 32×4px | `BottomNav.tsx:85` |

## Assets Used

- `/assets/icons/home.webp`, `collection.webp`, `shop.webp`, `quest.webp`, `setting.webp` — bottom nav icons.
- `/assets/icons/gold-coin.webp` — top bar gold icon.
- `/assets/icons/gem.webp` — top bar gems icon.
- `/assets/icons/rank-shield.webp` — battle tier badge background.
- Profile avatar images come from `src/config/profileIcons.json` (`imagePath` field) — see [06-profile-modal.md](06-profile-modal.md) for the full list.

## Cross-References

- [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md) — navigation model, nav visibility gating logic.
- [03-home-screen.md](03-home-screen.md) — the only screen that renders `TopBar` (per the files read for this doc set).
- [06-profile-modal.md](06-profile-modal.md) — opened by tapping the profile avatar.
- [21-battle-tier-screen.md](21-battle-tier-screen.md) — opened by tapping the tier badge; owns the tier-upgrade UX itself.
- [05-settings-screen.md](05-settings-screen.md) — reachable via the Settings tab.
- [10-collection-screen.md](10-collection-screen.md), [13-summon-gacha-screen-ui.md](13-summon-gacha-screen-ui.md) (Shop not covered in this read list) — other nav destinations.
- [23-audio-system.md](23-audio-system.md) — click SFX played on tab/badge taps.

## Unity Porting Notes

- **Top Bar is per-screen, not global**, in the source (only `HomeScreen` renders it). Confirm with design whether the Unity port should keep gold/gems/profile visible only on Home, or promote it to a truly persistent header across all screens — the latter is a common mobile-gacha pattern and may be the intended direction even though the current code only wires it into Home.
- **Bottom Nav's `activeTab` has no visual "none of the above" treatment** beyond simply not lighting up any tab — this happens today whenever the player is on Tier or Settings (since those aren't nav destinations). Decide whether the Unity port should keep this (arguably confusing) behavior or add an explicit "no tab active" state/back button affordance on non-tab screens.
- The active-tab indicator's shared-layout-animation slide is a nice-to-have; in Unity this is straightforward as a `RectTransform` tween from the previous active tab's local X to the new one's, matching spring feel (approx. critically-damped spring, stiffness 500/damping 30 in Framer Motion terms — tune to taste with DOTween's `DOAnchorPos` + ease).
- The battle-tier badge shows only the numeric tier — no "ready to upgrade" affordance on the badge itself. If product wants an upgrade-available indicator badge (e.g. a glowing dot) in the Unity version, it would need `selectCanUpgradeTier` wired into this badge, which the current implementation does not do.
