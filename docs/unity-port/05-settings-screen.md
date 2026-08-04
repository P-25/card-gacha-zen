# Settings Screen

## Purpose / Overview

A minimal settings screen, shown when `appState === "settings"`. Currently exposes exactly two options: mute/unmute background music and mute/unmute sound effects. Source: `src/components/SettingsScreen.tsx`. Reached via the Bottom Nav "SETTINGS" tab (see [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md)); its own header has no visible back button in the code read (navigation back to Home happens only via the Bottom Nav Home tab, since `onBack` is wired in `index.tsx` to `navigateTo("home")` but nothing in `SettingsScreen`'s JSX actually calls `onBack` — see Unity Porting Notes).

## Data Model

Reads and writes the `settings` Redux slice (`src/store/slices/settingsSlice.ts`):

```csharp
[Serializable]
public class SettingsState
{
    public bool isBgmMuted;  // default false
    public bool isSfxMuted;  // default false
}
```

Two actions/reducers, both simple booleans toggles: `toggleBgmMute`, `toggleSfxMute` (flip the respective field). A third, `setSettings`, replaces the whole slice wholesale (used during save-data hydration on load, not by this screen directly).

## UI Layout

Full-height column, light blue-gray background (`#f0f4f8`):

1. **Header** — white background, shadow, centered: bold uppercase "Settings" title (`#1a2e2e`) with a small decorative rounded bar (32×4px, `#d0dbe5`) centered directly beneath it.
2. **Scrollable content area** (24px padding, 32px vertical gap between sections):
   - **"Sound" section**:
     - Section label: "Sound" (bold, 18px, `#1a2e2e`).
     - A single white rounded card (24px corner radius, subtle border/shadow, 24px internal padding, 24px vertical gap between rows) containing exactly two rows:
       - **Row 1 — Background music**: left side shows a speaker icon (mute/unmute variant swaps based on state, color `#8da2b3`) + label "Background music" (14px, medium weight, `#8da2b3`); right side shows a Toggle switch bound to `!isBgmMuted` (see below).
       - **Row 2 — Sound effects**: identical layout, label "Sound effects", toggle bound to `!isSfxMuted`.

No other settings exist today (no language, notifications, account, graphics quality, etc. — this is intentionally minimal).

### Toggle sub-component (`SettingsScreen.tsx:141-167`)

A pill-shaped switch, 56×32px, rounded-full, internal 4px padding. Track color: blue `#4a8cdb` when ON (checked), gray `#e5e7eb`-ish (Tailwind `gray-200`) when OFF. A 24×24px white circular knob sits inside, animated (see below). Tapping anywhere on the pill plays a click SFX and fires the `onChange` callback (which dispatches the corresponding toggle action).

Note the inversion: the Toggle's `checked` prop is `!isBgmMuted` / `!isSfxMuted` — i.e. the switch shows "ON"/blue when audio is **unmuted**, and toggling it dispatches the *mute* toggle action either way (so ON = unmuted = normal/default state).

## Behavior & Logic

1. Tapping either speaker icon area is not itself interactive — only the Toggle switch responds to taps (the icon is purely a state-reflecting label, mute/unmuted glyph swap based on current boolean).
2. Tapping a Toggle: plays click SFX first, then dispatches `toggleBgmMute()` or `toggleSfxMute()`, which flips the corresponding boolean in the `settings` slice. This is persisted immediately (the whole slice is written to storage on every Redux action — see [09-save-persistence-system.md](09-save-persistence-system.md)).
3. There is no confirmation, no "apply" button — every toggle takes effect and persists instantly.
4. Actual audio behavior driven by these flags (e.g. stopping/starting BGM playback, silencing SFX calls) lives in `BackgroundMusic` and `useSound` respectively — out of scope for this doc, see [23-audio-system.md](23-audio-system.md). Relevant detail already confirmed while reading source for this doc set: `useSound`'s `playClick`/`playSummon`/`playRevealCard` helpers all early-return (produce no sound) when `isSfxMuted` is true (`src/hooks/useSound.ts:13,20,40`).

## Animations & Timing

| Element | Animation | Duration |
|---|---|---|
| Toggle knob position | Slides `x: 0 → 24px` (or reverse) when checked state flips | spring, stiffness 500, damping 30 |
| Toggle press feedback | `scale` → 0.95 on press | instantaneous (`whileTap`, no separate duration — snaps back on release) |

No entrance/exit animation is defined for the screen itself in this file (the cross-fade on screen switch is handled globally by `GameLayout`, see [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md)).

## Numbers & Formulas

| Constant | Value | Source |
|---|---|---|
| Toggle track size | 56×32px | `SettingsScreen.tsx:155` |
| Toggle knob size | 24×24px | `SettingsScreen.tsx:161` |
| Toggle knob travel distance | 24px | `SettingsScreen.tsx:162` |
| Toggle ON color | `#4a8cdb` | `SettingsScreen.tsx:156` |
| Toggle OFF color | Tailwind `gray-200` (`#e5e7eb`) | `SettingsScreen.tsx:156` |
| Default state | Both unmuted (`isBgmMuted: false`, `isSfxMuted: false`) | `settingsSlice.ts:8-11` |

## Assets Used

No image assets — icons are inline SVG (lucide-style volume/volume-x glyphs), not sprite files. In Unity, use two simple vector/sprite icons (speaker-on / speaker-muted) per toggle row, swapped based on state.

## Cross-References

- [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md) — screen switching model; note `appState = "settings"` back-navigation is hardcoded to `"home"` at the `index.tsx` call site.
- [04-navigation-topbar-bottomnav.md](04-navigation-topbar-bottomnav.md) — entry point (Settings tab); note the Bottom Nav remains visible on this screen.
- [09-save-persistence-system.md](09-save-persistence-system.md) — how the settings slice is persisted.
- [23-audio-system.md](23-audio-system.md) — where these mute flags actually affect playback.

## Unity Porting Notes

- **No back button exists in the screen's own UI** — the `onBack` prop passed from `index.tsx` (`SettingsScreen onBack={() => navigateTo("home")}`) is accepted by the component's props interface but never invoked anywhere in the component body. The only way back to Home from this screen in the current build is tapping the Bottom Nav "HOME" tab (which remains visible here). Decide whether to add an explicit back button in the Unity port (likely a good idea for UX) or intentionally rely on the bottom nav only, matching current behavior.
- This is clearly a placeholder-scale settings screen — expect the Unity design to likely need to grow this significantly (account/login, language, notifications, credits, support links, etc.) but the *only currently implemented, working* options are the two audio mute toggles described here. Do not infer additional settings that don't exist in source.
- The mute toggles are simple booleans with no volume slider/granularity — "mute" is binary on/off, not a 0–100% volume level, for both BGM and SFX independently.
