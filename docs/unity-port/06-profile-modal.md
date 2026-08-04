# Profile Modal

## Purpose / Overview

A modal overlay showing the player's profile summary — avatar, name/tag, level/XP progress, placeholder trophy slots — and an avatar picker bottom sheet. Opened by tapping the profile avatar in the Top Bar (see [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md)); closed via an X button or by tapping the backdrop. Source: `src/components/features/profile/ProfileModal.tsx`; the picker's data source is `src/config/profileIcons.json`.

## Data Model

Reads from the `player` Redux slice: `name`, `tag`, `activeProfilePicId`, `unlockedProfilePicIds`, `level`, `experience`. Writes via one action: `setActiveProfilePic(iconId: string)` (`src/store/slices/playerSlice.ts:185-187`), which simply overwrites `activeProfilePicId` — no validation against `unlockedProfilePicIds` happens in the reducer itself (see Behavior & Logic and Unity Porting Notes).

Avatar catalog (`src/config/profileIcons.json`) — a flat static array, no pagination/paging, no rarity/category grouping:

```json
[
  { "id": "default_1",     "name": "Chrono Sent",  "imagePath": "/assets/avatars/avatar_1.webp", "unlockCondition": "Default" },
  { "id": "starter_cosmic","name": "Star Seeker",  "imagePath": "/assets/avatars/avatar_2.webp", "unlockCondition": "Reach Level 5" },
  { "id": "starter_fire",  "name": "Obsidian",     "imagePath": "/assets/avatars/avatar_3.webp", "unlockCondition": "Reach Level 10" }
]
```

Suggested Unity C# shape:
```csharp
[Serializable]
public class ProfileIconDef
{
    public string id;
    public string name;
    public string imagePath;       // -> Sprite reference/Addressable key in Unity
    public string unlockCondition; // human-readable only, see notes below
}
```

`unlockedProfilePicIds` (on `PlayerState`) defaults to `["default_1"]` only (`playerSlice.ts:33`) — i.e. every new player starts with only the first avatar unlocked, matching its `"Default"` unlock condition. The other two are locked by default.

## UI Layout

### Main modal (centered, `src/components/features/profile/ProfileModal.tsx:42-148`)

- **Backdrop**: full-screen black/60% + blur, tapping it closes the modal.
- **Card**: cream background (`#Fdfcf8`), rounded (24px), 24px padding, centered column layout, 24px gaps between sections, max width ~384px (`max-w-sm`).
  - **Close button** (top-right, absolute): 32×32px circle, translucent black background, X icon.
  - **Avatar** (centered): 128×128px circle, 4px green border (`#6A9A6A`), shadow, shows the active avatar image (`activeProfilePicId` looked up in the catalog, falling back to the catalog's first entry if not found — same fallback pattern as the Top Bar avatar). An **edit/pencil button** overlaps the bottom-right corner of the avatar (dark teal `#2a3b3b` circular button with a pencil icon) — tapping it opens the icon selector bottom sheet.
  - **Name & tag** (centered text below avatar): player display name (`player.name`, bold, 2xl, dark teal) then tag (`player.tag`, medium weight, olive `#5F5A46`) on the line below.
  - **Level & XP bar**:
    - Row above the bar: left = `"Level {level}"` (bold, 14px, dark teal); right = `"{experience} / {xpNeeded} XP"` (12px, medium, olive).
    - Bar: 12px tall track, pale olive background (`#E0DCC0`), fully rounded, filled portion in green (`#6A9A6A`) sized to `min(xpProgress, 100)%` of width, where `xpProgress = (experience / xpNeeded) * 100`.
    - `xpNeeded = level × 100` (same formula as the player-progression XP-per-level rule used elsewhere, e.g. `acknowledgeLevelUp`/`addPlayerExp` in the player slice).
  - **Trophy/badge placeholder row**: a static 3-column grid of identical placeholder tiles (aspect-square, pale olive `#EDE8D0` background, rounded corners (12px), 50% opacity, each containing a centered 🏆 emoji glyph). These are **non-interactive decorative placeholders only** — no real trophy/achievement data is wired up; there are exactly 3 slots, hardcoded, with no tap handlers, no unlock state, no tooltips.

### Icon Selector bottom sheet (`ProfileModal.tsx:151-234`)

Shown when the edit/pencil button is tapped (`showIconSelector` local boolean).

- **Sheet backdrop**: separate full-screen black/60% + blur layer, above the main modal backdrop (`z-60`); tapping it closes the sheet only (not the whole profile modal).
- **Sheet panel**: slides up from the bottom, cream background, rounded top corners (24px), 24px padding + extra bottom padding for safe area, `z-70`.
  - Small centered drag-handle bar (48×6px, black/10%) at the top.
  - Centered heading: "Select Icon".
  - **3-column grid** of every entry in `profileIcons.json`, each rendered as a circular (aspect-square, `rounded-full`) button:
    - **Active** icon: green border (`#6A9A6A`), slightly scaled up (105%), shadow, plus a green/20% overlay with a small green checkmark badge (✓) centered on top of the thumbnail.
    - **Unlocked, not active**: transparent border that turns pale-olive (`#E0DCC0`) on hover; fully tappable.
    - **Locked** (`id` not present in `unlockedProfilePicIds`): thumbnail rendered at 50% opacity + grayscale, dark overlay (black/40%), a white padlock icon centered on top; button `disabled` — not tappable at all.

## Behavior & Logic

1. Opening: `TopBar` sets local `showProfileModal = true`; `ProfileModal` mounts (wrapped in `AnimatePresence` at the call site for enter/exit transition).
2. Closing the main modal: tapping the X button or the backdrop calls `onClose`, which unmounts it.
3. Opening the icon picker: tapping the pencil button sets local `showIconSelector = true`, revealing the bottom sheet (the main modal stays mounted underneath).
4. Closing the icon picker: tapping its own backdrop sets `showIconSelector = false`. There is no explicit close/X button on the sheet itself — backdrop tap is the only dismiss affordance (aside from selecting an icon, which also closes it — see next point).
5. Selecting an icon: `handleIconSelect(iconId)` dispatches `setActiveProfilePic(iconId)` and immediately sets `showIconSelector = false` (picker closes right after selection, no separate "confirm" step).
6. **Locked icons cannot be selected** — the button element itself has the HTML `disabled` attribute whenever `iconId` is not in `unlockedProfilePicIds`, so `onClick`/`handleIconSelect` never fires for locked entries via normal interaction.
7. XP bar fill is clamped to 100% max even if `experience >= xpNeeded` were ever true at render time (defensive `Math.min(xpProgress, 100)`), though in practice the player slice's leveling reducers (`addPlayerExp`, `addRewards`, `acknowledgeLevelUp`) roll excess XP into level-ups so `experience` should always be `< xpNeeded` for the current `level` by the time this renders.

### Unlock enforcement — IMPORTANT

**The `unlockCondition` strings in `profileIcons.json` ("Default", "Reach Level 5", "Reach Level 10") are not enforced anywhere in the code that was read for this doc.** There is no logic anywhere in `playerSlice.ts`, `ProfileModal.tsx`, or elsewhere in the read set that:
- Checks the player's level against an avatar's `unlockCondition` string, or
- Ever calls `unlockProfilePic` (the reducer exists — `playerSlice.ts:188-192`, and simply appends an id to `unlockedProfilePicIds` if not already present — but nothing in the codebase read for this task dispatches it).

In practice, this means: **a fresh save can never unlock `starter_cosmic` or `starter_fire` through any code path found in this read set** — they will remain permanently locked/grayed-out in the picker for a player who never has something external add them to `unlockedProfilePicIds` (e.g. a debug tool, a future quest reward, or manual save editing). The `unlockCondition` field is purely descriptive/display text today; it is not parsed or evaluated as executable logic.

**Unity porting decision required:** the Unity developer should decide fresh whether to implement real unlock-condition enforcement (e.g. a check on level-up that parses/matches `unlockCondition` and calls the equivalent of `unlockProfilePic`), since no working reference implementation exists to port from. If replicating current behavior exactly (as a stub), locked avatars will simply stay locked forever.

## Animations & Timing

| Element | Animation | Duration |
|---|---|---|
| Modal backdrop | Fade `opacity` 0→1 | default fade (no explicit override) |
| Modal card | `scale` 0.9→1, `opacity` 0→1 | default (no explicit override) |
| Icon-picker sheet backdrop | Fade `opacity` 0→1 | default fade |
| Icon-picker sheet panel | Slide `y: 100% → 0` | spring, damping 30, stiffness 300 |

(Exit animations mirror the entrance values in reverse, standard Framer Motion `AnimatePresence` behavior — no custom exit-only values were set.)

## Numbers & Formulas

| Formula / Constant | Value | Source |
|---|---|---|
| XP needed for current level | `level × 100` | `ProfileModal.tsx:34` |
| XP progress percentage | `(experience / xpNeeded) × 100`, clamped to 100 max | `ProfileModal.tsx:35,131` |
| Avatar image size (main modal) | 128×128px | `ProfileModal.tsx:83` |
| Default unlocked avatar set | `["default_1"]` only | `playerSlice.ts:33` |
| Trophy placeholder slot count | 3 (hardcoded, non-functional) | `ProfileModal.tsx:139` |

## Assets Used

- `/assets/avatars/avatar_1.webp` (Chrono Sent, id `default_1`, unlocked by default)
- `/assets/avatars/avatar_2.webp` (Star Seeker, id `starter_cosmic`, listed unlock condition "Reach Level 5" — not enforced)
- `/assets/avatars/avatar_3.webp` (Obsidian, id `starter_fire`, listed unlock condition "Reach Level 10" — not enforced)

## Cross-References

- [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md) — entry point (tap profile avatar); the Top Bar's own avatar uses the same `profileIcons.json` lookup/fallback pattern.
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — full detail on `level`/`experience`/XP-per-level mechanics referenced by the XP bar here.
- [03-home-screen.md](03-home-screen.md) — the level-up popup on Home uses the same `level × 100`-family reward logic (though a different formula: flat 100 gems/300 gold per level, not XP-related).
- [09-save-persistence-system.md](09-save-persistence-system.md) — how `activeProfilePicId`/`unlockedProfilePicIds` persist.

## Unity Porting Notes

- **Avatar unlock enforcement is entirely unimplemented in the source** (see Behavior & Logic above) — this is the single most important gap to flag. The Unity dev must design this fresh: decide where/when to check `unlockCondition` (e.g. on every level-up via a listener on the level field, or lazily computed at picker-render time by parsing the condition string against current player state) and call the equivalent of `unlockProfilePic`. There is no existing pattern to mirror for the "Reach Level N" parsing — `unlockCondition` is currently a free-form display string ("Default", "Reach Level 5", "Reach Level 10"), not a structured/typed condition object. Consider restructuring it into a typed field (e.g. `{ type: "level", value: 5 }`) in the Unity data model rather than parsing English strings, since this JSON is being rebuilt from scratch anyway.
- The trophy/badge grid is purely decorative placeholder content (3 identical grayed tiles, no data model, no tap behavior) — do not treat it as a real achievements feature; it's a visual stub for a future feature that doesn't exist yet.
- Locked-avatar taps are blocked via a disabled button state, not via a "locked" toast/tooltip — there's no user feedback on why an avatar is locked beyond the visual grayscale+padlock treatment and the (unenforced) `unlockCondition` text shown nowhere in the picker UI itself (the condition string is present in the JSON data but is never actually rendered/displayed anywhere in `ProfileModal.tsx` — a player has no in-app way to learn *how* to unlock a locked avatar today). Consider surfacing the unlock condition as a tooltip/label in the Unity port for better UX, since the underlying data already supports it.
- `setActiveProfilePic` has no validation against `unlockedProfilePicIds` at the reducer level — the UI-level `disabled` attribute is the only gate. If any other code path in the full game (outside this read set) ever calls `setActiveProfilePic` directly, it could theoretically set a locked avatar as active. Consider adding a defensive check in the Unity equivalent of this reducer/command.
