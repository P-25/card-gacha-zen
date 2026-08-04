# Start Screen

## Purpose / Overview

The Start Screen is a full-screen splash/intro overlay shown on top of the entire app on every single app load (it is gated by a local `hasStarted` flag that always starts `false` — see [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md)). It shows branding, a fake loading sequence, then a "Tap to Start" prompt; tapping triggers an exit animation and reveals the main app underneath. Source: `src/components/StartScreen.tsx`.

It is visually a duplicate of the `GameLayout` phone-frame shell (same desktop background + mobile frame markup) so that the transition into the real `GameLayout` is seamless.

## Data Model

No dedicated slice — purely local component state:

```csharp
public class StartScreenState
{
    public bool isLoading = true;   // true for first 2500ms
    public bool isExiting = false;  // set true on tap, triggers exit animation
}
```

It also reads two fields from the persisted player save data purely for display (does not modify them):
- `player.tag` — shown in the footer as `Player ID: #{tag}`.
- `player.name` — selected but not actually rendered anywhere in this component (dead read).

## UI Layout

Full-screen fixed overlay (`z-9999`), structured identically to `GameLayout`'s phone frame (see [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md) for the shared frame chrome: desktop letterbox background, black-bordered rounded mobile container). Inside the mobile frame, top to bottom:

1. **Full-bleed background image**: `start-screen.webp`, `object-cover`, plus a top-to-bottom gradient overlay (black/30% at top → transparent middle → black/80% at bottom) for text legibility.
2. **Branding block** (upper-center, `mt-10`, pinned toward the top via `mb-auto`):
   - Line 1: "P26 GAMES" — small bold uppercase, white/80% opacity, widest letter-tracking.
   - Line 2: "PRESENTS" — extra-small bold uppercase, white/80% opacity, widest letter-tracking.
   - Logo image: `gold-logo.webp`, roughly 256×96px (mobile) / 320×128px (desktop breakpoint), drop-shadow.
3. **Center-low dynamic area** (absolutely positioned near the bottom, swaps between two states — see Behavior):
   - **Loading state**: "LOADING" text (white, bold, xl, letter-spacing 0.3em, uppercase) above a thin horizontal bar (96px wide, gradient transparent→white→transparent) that pulses (scale + opacity animate 0→1→0, looping).
   - **Tap-to-start state**: an invisible full-screen tap-catcher `<div>` (click target for the entire frame) plus visible "TAP TO START" text (white, black-weight, 2xl, widest tracking, drop shadow, CSS pulse animation).
4. **Footer block** (bottom, `pb-4`, always visible regardless of loading state):
   - Line 1: `Version: 1.0.0 (beta)` — 9px, bold, white/70%, centered.
   - Line 2: `Player ID: #{player.tag}` — 9px, bold, white/70%, centered. (`tag` defaults to `"#1234"` from the player slice initial state, so the raw string already includes a leading `#`, meaning the footer literally renders `Player ID: ##1234` for a fresh save — see Unity Porting Notes.)

## Behavior & Logic

1. On mount, `isLoading = true`. A one-shot timer sets `isLoading = false` after **2500ms**.
2. While `isLoading` is true: the Loading UI (text + pulsing bar) is shown; the tap-catcher and "Tap to Start" text are not rendered, so taps do nothing during this phase.
3. Once `isLoading` flips to `false`: the Loading UI cross-fades out (see Animations) and the tap-catcher + "Tap to Start" text fade/slide in.
4. Tapping anywhere in the tap-catcher area calls `handleStart()`:
   - Immediately sets `isExiting = true`, which kicks off the exit animation (see Animations — several elements animate out simultaneously with their own per-element transforms).
   - Starts an 800ms timer; when it fires, calls the `onStart` prop (passed down from `_app.tsx`, sets `hasStarted = true`), which unmounts `StartScreen` entirely (its root is wrapped in `AnimatePresence`, so once `isExiting` makes the component return no visible child — actually the component conditionally renders `{!isExiting && (...)}`, so the moment `isExiting` becomes true the *animated exit* begins; the component is fully removed either when its exit animation completes via `AnimatePresence` or, functionally, once the parent stops mounting it after the 800ms `onStart` callback removes it from the tree).
5. There is no error/retry state and no real asset-loading tie-in on this screen — the "Loading" phase is a fixed-duration cosmetic delay only (separate from `useAssetLoader`, which runs concurrently in `index.tsx` underneath).

## Animations & Timing

All using a spring/tween animation library equivalent (Unity: use `LeanTween`, DOTween, or Animator clips):

| Element | Animation | Duration | Easing | Trigger |
|---|---|---|---|---|
| Loading text/bar block | Fade in on mount, fade out when loading ends | opacity 0↔1 | default (no explicit duration override for the wrapper fade) | On `isLoading` change |
| Pulsing loading bar | `scaleX`: 0 → 1 → 0, `opacity`: 0 → 1 → 0, looping | 1500 ms per loop | linear (implicit) | Continuous while loading |
| Bottom "Tap to Start" section | Slide/fade in: `opacity` 0→1, `y` 20→0 | 500 ms | default ease | When loading ends |
| "Tap to Start" text | CSS `animate-pulse` (opacity breathing loop) | Tailwind default (~2s cycle) | ease-in-out | Continuous once shown |
| Logo image entrance | CSS `fade-in zoom-in` on mount | 700 ms | — | On mount |
| **Exit sequence** (all fire together when `isExiting` becomes true): | | | | |
| — Root overlay | Fades `opacity` 1→0 | 800 ms | easeInOut | Tap |
| — Mobile frame container | `scale` stays 1, `opacity` 1→0 | 800 ms | easeInOut | Tap |
| — Inner splash content | `scale` 1→2, `filter: blur(0px)→blur(10px)` | 800 ms | easeInOut | Tap |
| — Desktop background | `opacity` 1→0 | 800 ms | easeInOut | Tap |
| — Logo (independent nested animation) | `scale` 1→**15** (dramatic "fly through logo" zoom), `opacity` 1→0 | 800 ms | easeInOut | Tap |
| Actual screen swap (`onStart` fires, unmounts StartScreen) | — | 800 ms after tap (matches exit animation length) | — | `setTimeout` in `handleStart` |

Total time from app boot to interactive tap: 2500 ms (loading). Total time from tap to home screen visible: 800 ms.

## Numbers & Formulas

| Constant | Value | Source |
|---|---|---|
| Loading phase duration | 2500 ms | `StartScreen.tsx:20` |
| Exit animation / start delay | 800 ms | `StartScreen.tsx:28,35,44,53,61,70` |
| Pulsing bar loop duration | 1500 ms | `StartScreen.tsx:162` |
| Bottom section entrance duration | 500 ms | `StartScreen.tsx:178` |
| Logo exit zoom scale | 15x | `StartScreen.tsx:68` |
| Version string | `"1.0.0 (beta)"` (hardcoded) | `StartScreen.tsx:194` |
| Studio branding text | `"P26 Games"` / `"Presents"` (hardcoded) | `StartScreen.tsx:129,132` |

## Assets Used

- `/assets/background/full-background.webp` — desktop letterbox background (matches `GameLayout`).
- `/assets/background/start-screen.webp` — main splash background image (opts out of the global image contrast/saturation filter via `no-global-filter`).
- `/assets/icons/gold-logo.webp` — game logo.

## Cross-References

- [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md) — boot sequence context, why this screen always shows on load, shared phone-frame chrome.
- [03-home-screen.md](03-home-screen.md) — the screen revealed after `onStart` fires.
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — `player.tag`/`player.name` fields shown in the footer.
- [23-audio-system.md](23-audio-system.md) — `BackgroundMusic` is mounted concurrently with this screen and begins playing on interaction.

## Unity Porting Notes

- This screen and `GameLayout`'s background/frame are visually near-duplicates by design (so the cross-fade into gameplay looks seamless). Consider sharing one prefab/background asset between the two in Unity rather than duplicating markup, as the source does — just be careful to preserve the `start-screen.webp` vs `light-bg.webp` distinction (different images).
- `Player ID: #{tag}` footer text: since the default `tag` value already contains a leading `#` (`"#1234"`, `src/store/slices/playerSlice.ts:31`), the rendered string is currently `Player ID: ##1234` (double hash) for a fresh save. Decide whether to fix this cosmetic bug in the Unity port or intentionally match it.
- The "Loading" phase is a **pure cosmetic timer**, not connected to real asset loading (that happens separately/concurrently, see [01-app-shell-and-state-management.md](01-app-shell-and-state-management.md)). In Unity you can keep it cosmetic or wire it to real bootstrap progress — either is a legitimate product decision, just note the original does not block on real loading here.
- The exit animation is deliberately elaborate (5 elements animating different properties simultaneously, logo scaling 15x to simulate flying through it). Budget for a dedicated Timeline/Animator sequence rather than a single simple fade when porting.
- `player.name` is read via the Redux selector but never displayed on this screen — safe to omit that read in the Unity port unless a future design wants to show it.
