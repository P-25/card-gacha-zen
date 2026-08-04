# Summon (Gacha) Screen UI

## Purpose / Overview

The Summon screen is where the player spends Gems to pull cards/resources from the single active banner ("Dragon Slayer Rate Up"). It is a full-screen experience with four sub-phases:

1. **Idle** — currency header, animated magic circle portal, pity meter, and two summon buttons (x1 / x10) are shown.
2. **Charging** — a 2.5s "charge-up" animation plays: the magic circle accelerates and a dragon silhouette overlay flares and burns out.
3. **Flash/Release** — a full-screen white flash + radial ray burst covers the screen for ~1s while the actual RNG roll(s) resolve behind the scenes.
4. **Reveal** — a card-by-card full-screen carousel (`CardReveal`) shows each pulled item one at a time with rarity VFX, then (for x10 pulls) a grid summary (`SummonResults`) is shown.

Source files:
- `src/components/features/gacha/GachaSelection.tsx`
- `src/components/features/gacha/RateUpSummon/RateUpSummonSection.tsx` (main screen logic/layout)
- `src/components/features/gacha/RateUpSummon/MagicCircle.tsx` (portal animation)
- `src/components/summon/FloatingParticles.tsx` (ambient background)
- `src/components/features/gacha/CosmicBackground.tsx` (rarity light-burst behind revealed card — currently used as a standalone decorative component, not wired into the live reveal flow described below; see Unity Porting Notes)
- `src/components/features/gacha/GachaRevealView.tsx` (thin wrapper around `CardReveal`)
- `src/components/features/gacha/CardReveal.tsx` (per-card reveal carousel)
- `src/components/features/gacha/SummonResults.tsx` (post-reveal 10-pull grid)
- `src/components/features/gacha/CurrencyHeader.tsx` (delegates straight to `TopBar`)
- `src/components/features/home/TopBar.tsx`, `src/components/features/topbar/Gems.tsx`, `src/components/features/topbar/GoldCoin.tsx`

## Data Model

This screen is presentation/orchestration only; the underlying roll data model (banner config, pity state, rarity/rate math) is fully specified in `14-gacha-mechanics-rates-pity.md`. The relevant runtime state local to this screen:

```csharp
public enum SummonUiState { Idle, Charging, Summoning /* flash+resolve */ }

public class SummonScreenState
{
    public SummonUiState uiState;
    public bool isTooltipOpen;      // pity info tooltip toggle
    public bool showLowGemWarning;  // insufficient-currency modal
}
```

Suggested Unity representation: a `SummonScreenController : MonoBehaviour` driving an Animator/Timeline for the charge/flash sequence, reading banner + pity data from a `BannerConfigSO` / `PityStateSO` (see doc 14).

## UI Layout

Top to bottom / z-order (back to front):

1. **Ambient background** — `FloatingParticles`, absolutely positioned, covers the whole screen, `pointer-events: none`. Always running regardless of UI state.
2. **Screen content wrapper** (`id="rateupSummonSection"`), padding-bottom small, flex column, centered:
   - **Section title**: "Regular Summon" (purple bold text, `#3E206D`).
   - **Central Portal Container** — square aspect box, max-width `md` (~28rem):
     - `MagicCircle` SVG portal fills the box.
     - **Dragon overlay** image (`/assets/summon/active.webp`) absolutely positioned, offset left, `mix-blend-mode: color-dodge`, in front of the circle (z-30).
   - **Pity Counter panel** — dark rounded card (`bg #2D3748` @ 90% opacity, blurred, bordered):
     - Header row: `"{targetRarity} Rift Meter"` label (left) + info button (right, opens Offering Rates screen; disabled/greyed while not idle).
     - Progress bar (h-5, rounded-full, black background):
       - Fill: horizontal gradient bar (`#C5A059 → #FDB931 → #C5A059`), width animates to `pityProgress%`.
       - Centered text overlay: `"{pityCount} / {maxPity}"`. Clicking it toggles an info tooltip.
       - A continuously-sweeping vertical white-glow "shine" bar scrolls left→right across the fill on loop.
       - **"Rate Increased" floating badge**: appears above the bar, only when `pityCount >= softPity`. Red/pink pill with a pulsing white dot and a small downward-pointing arrow/tail. Animates in/out (fade + slide + scale).
       - **Tooltip** (click-toggled, anchored bottom-right of bar): dark card explaining "The rate increases after `{softPity}` summons and a `{targetRarity}` is guaranteed to appear after `{hardPity}` summons. Summon Support will reset when you obtain a `{targetRarity}`."
     - Footer line: `"Guaranteed {targetRarity} card in {pullsLeft} more summons!"` where `pullsLeft = max(hardPity - pityCount, 0)`.
   - **Summon Buttons row** (2 buttons, flex, gap-4):
     - **SUMMON x1** — cream/parchment button (`#FDF5E6` bg, `#2D3748` text), gold border (`#C5A059`), "pressed" bottom-shadow (`0 4px 0 #C5A059`) that collapses on active/press (`active:translate-y-1`). Shows gem icon + `banner.singlePrice` (formatted with thousands separators).
     - **SUMMON x10** — purple gradient button (`#4c2a85 → #3a1e69`), gold text (`#FDB931`) for label/price, same pressed-border styling. Shows gem icon + `banner.multiPrice`. Has a **"BEST VALUE" ribbon** (diagonal banner, top-left corner, dark red gradient, white text) and a continuously looping diagonal "sheen" light sweep across the button (period: 2s sweep + 3s pause, i.e. ~5s cycle).
3. **Starburst light-ray overlay** (`id="whiteRayFlash"`) — fixed, centered at 35% from top, small (20x20) ring using a repeating conic-gradient (gold/white pinwheel of rays), heavy white glow (`box-shadow` blur 50px spread 20px), blend mode `screen`. Hidden (scale 0) until `Summoning` state.
4. **Solid white flash overlay** — fixed, full-screen, plain white div, opacity 0 → 1 during `Summoning`.
5. **Low Gem Warning modal** — centered overlay (dark backdrop blur):
   - White rounded card, gold border, decorative gradient top strip.
   - Title: "💎 Insufficient Gems".
   - Body: "You don't have enough Gems to perform this summon. Complete daily missions or purchase more from the shop!"
   - Single "Okay" button (dark purple, dismisses modal).

### Reveal phase layout (`CardReveal.tsx`)

Full-screen, single active card centered:
- Card container: white rounded panel, aspect ~3:4, max-height 55vh.
  - **Ink burst halo**: a large (150% scaled, 40% opacity) rarity-specific "brush stroke" PNG/WebP behind the card (`rare_stroke.webp` / `uncommon_stroke.webp` / `common_stroke.webp`).
  - **Card art image**, subtly breathing (scale 0.9 ↔ 0.95, 6s loop).
  - **Sparkle overlay** (`/assets/extra/sparkle.png`), shown only when rarity is RARE, covering the full card.
  - **Rarity badge** — top-left corner ribbon, background = rarity color, text = rarity name (`COMMON`/`UNCOMMON`/`RARE`), slightly larger font for RARE.
  - **"NEW!" badge** — top-right corner ribbon, red background, white bold "NEW!" text. Only shown for cards (not resources) that are new to the inventory (see Behavior section for the exact — heuristic — rule).
  - Card box-shadow: purple glow + inset rarity-colored border for RARE; softer rarity-colored glow/border for Common/Uncommon.
- **Info block** below the card:
  - Card name (uppercase, bold, dark green-grey `#2D2D2D`).
  - Stat row (cards only): `POW: x  SPD: x  DEF: x  Level: x`.
  - Flavor text: card description in italic (cards), or a gold-coin icon + `x{value}` for resource pulls.
- **Action buttons row** (fades/slides in ~0.5s after card appears):
  - Left button: **"SKIP ALL"** (only shown if this is not the last card in the results list) — outlined grey button; instantly ends the reveal sequence via `onReset`. On the last card, this slot instead shows a **"SHARE"** button (currently only plays a click sound; no share implementation).
  - Right/primary button: **"NEXT"** (or **"CLAIM"** on the final card) — dark purple pill with gold border and a hover sheen sweep; advances `currentIndex` or calls `onFinish`.

### Post-reveal summary (`SummonResults.tsx`, x10 pulls)

Shown after the reveal carousel finishes (`onFinish`), *not* automatically — it's a separate screen the caller navigates to. Layout:
- A 3-4-3 grid of the 10 pulled items (row1 = items 0-2, row2 = items 3-6, row3 = items 7-9).
- Each **card** result: rarity-bordered thumbnail with brush-stroke background, sparkle overlay + rotating gradient border highlight (`RateUpHighlight`) for RARE items, level badge (top-left), and a name label that fades in on hover.
- Each **resource** result: thumbnail with gold-coin icon + `x{value}` label bar at the bottom.
- Clicking any card thumbnail opens `CardInfoModal` with full details.
- Single **"Claim All"** button below the grid, dark purple/gold styled, returns to the summon screen (`onBack`).

## Behavior & Logic

### State machine (`RateUpSummonSection`)

`summonState: "idle" | "charging" | "summoning"`

1. **Tap SUMMON x1 or x10** (`handleSummonClick(count)`):
   - No-op if `summonState !== "idle"` (prevents double-taps).
   - If `gems < cost` → show Low Gem Warning modal, stay idle, return.
   - Otherwise: set state to `"charging"`, notify parent (`onSummonStateChange(true)`), play the summon SFX loop.
2. **After 2500ms** (charge duration): set state to `"summoning"` (triggers the white flash + ray burst).
3. **After a further 1000ms** (i.e. at t=3500ms total): call `handleSummonLogic(count)` — this is where the actual gem spend + RNG rolls + inventory/currency mutations + XP/quest updates happen (all synchronous, no animation tied to it — it happens "behind" the white flash). Then `onSummon("gem", count, results)` is called, which is expected to hand control to the reveal screen.
4. The component does **not** reset `summonState` back to `"idle"` itself — this only happens if the component unmounts or the parent screen changes away from Summon back to it fresh. In practice the caller navigates to the reveal view immediately after `onSummon` fires.

### `handleSummonLogic(count)` — economy transaction

1. Compute `cost = count === 1 ? banner.singlePrice : banner.multiPrice`.
2. Guard: if `gems < cost`, show warning and abort (state reset).
3. Deduct `cost` gems.
4. Loop `count` times: call `performSummon(bannerId, tempPity)` (see doc 14 for the algorithm), push the resulting item into `results`, carry the returned pity state forward as `tempPity` for the next iteration, and:
   - If the item is a `CARD`, add it to inventory.
   - If the item is a `RESOURCE`, add its `value` to gold.
   - Dispatch the updated pity state to the store **after every single pull** (not just once at the end).
5. After the loop: award player XP = `count * 10` (i.e. 10 XP for a single pull, 100 XP for a x10 pull), and update the "SUMMON" quest progress counter by `count`.
6. Call `onSummon("gem", count, results)` with the full ordered results array.

### "NEW!" badge logic (heuristic, not authoritative)

A pulled card shows "NEW!" if, **after** it has already been added to inventory, `inventory.filter(c => c.id === card.id).length === 1`. This is a heuristic based on current inventory count rather than a flag returned by the summon result — it works correctly for a single pull, but note the pity/inventory dispatch ordering: since inventory dispatch happens synchronously before reveal renders, by the time `CardReveal` reads the Redux inventory, all 10 pulls (for a x10 summon) have usually already been added. This means if the *same* new card is pulled twice in one x10 roll, only the first copy shown will read count===1; the second copy will read count===2 and will NOT show "NEW!" even though the player didn't own it before this summon batch. Recommend replacing this with an explicit `isNew` flag computed at roll time in the Unity port (see Porting Notes).

### Skip-all behavior

Tapping "SKIP ALL" on any card except the last calls `onReset` immediately — this ends the per-card reveal carousel right away (does not auto-advance through remaining cards with animation; the parent is expected to jump straight to whatever comes after, e.g. the `SummonResults` grid, since all results were already computed and granted at roll time).

### Low Gem Warning

Triggered on tap only if `gems < cost`. Blocks the summon before it starts (state never leaves `idle` in this branch). Purely informational modal — no shop-navigation shortcut button, dismiss with "Okay" only.

## Animations & Timing

### Charge → Flash → Resolve sequence (`RateUpSummonSection` + `MagicCircle`, driven by `summonStarted` prop toggling)

All times below are from the moment the player taps a summon button (t=0):

| Time | Event |
|---|---|
| t=0 | `summonState → "charging"`. Summon SFX starts. Screen content (buttons, pity bar, title) begins fading out (`opacity → 0`, 0.5s). Dragon overlay begins its charging animation (scale 1→1.2→0 over 2.4s, `times: [0, 0.6, 1]`; brightness filter ramps `1x → 2x → 5x` over the same 2.4s; opacity fades to 0 near the end, `times: [0, 0.8, 1]`). |
| t=0 (MagicCircle internal) | `gameState → "SUMMONING"`. Rune rings/geometry accelerate their spin (outer runes: 60s→10s per rotation; octagon/squares: 40s→3s reverse; inner runes: 25s→1.5s; hexagram: 30s→1s reverse) and all layers begin an `expand-implode` scale animation (scale 1 → 1.2 at 10% → holds 1.2 until 60% → scales to 0 at 100%) over 2.5s. Rune/symbol colors shift to `darkgoldenrod`. Ambient particles switch from "idle drift" to an "implosion" pattern (rings start far out at x=200 and animate inward to x=0, opacity `[0,1,0]`, 1.5s loop, staggered random delay). |
| t=2000ms (MagicCircle) | Screen-shake begins on the portal container (`shake` CSS class, 0.5s "cubic-bezier rattle"). |
| t=2500ms | `summonState → "summoning"`. In `MagicCircle`: `flash → true` (white overlay snaps to opacity 100% over a fast 75ms transition), `shake → false`. In `RateUpSummonSection`: the fixed white overlay begins fading in (duration 2.0s, but with a 0.5s delay before it starts — so effectively ramps from t=3000ms), and the starburst ray element scales from 0 → 30 and rotates 180° over 2.0s (opacity keyframes `[0,1,0]` at `times:[0,0.2,1]`, i.e. it flashes in fast then fades out across the full 2s). |
| t=2600ms (MagicCircle) | Internal `gameState → "RESULT"` — the SVG portal is scaled/faded out (`scale-0 opacity-0`, CSS transition 500ms). |
| t=2800ms (MagicCircle) | `flash → false` — the internal white overlay begins fading back out (1000ms CSS transition). |
| t=3500ms (`RateUpSummonSection`) | `handleSummonLogic(count)` executes — gems spent, RNG rolled, rewards granted, pity updated, XP/quest updated, then `onSummon(...)` fires handing results to the parent, which is expected to switch the screen to the reveal view. |

Net: **charge phase ≈ 2.5s**, **flash/resolve phase ≈ 1.0s**, total **≈ 3.5s** from tap to reveal handoff.

### Idle-state MagicCircle (looping, no summon in progress)

- Outer rune ring: 360° every 60s, clockwise.
- Octagon/square geometry: 360° every 40s, counter-clockwise.
- Inner rune ring: 360° every 25s, clockwise.
- Hexagram + elemental symbols: 360° every 30s, counter-clockwise, plus a slow 3s pulse opacity animation on the star strokes.
- Center core: outer glow ring pulses opacity 0.3↔0.8 every 3s; inner "eye" dot pulses opacity 0.5↔1 every 1s.
- Idle particles (40 total): float outward from center, opacity `[0,0.8,0]`, x-distance `[0,60]`, 3s loop, random per-particle delay 0-2s.
- Idle dragon overlay: gentle breathing scale `1 → 1.03 → 1` over 3s, looping indefinitely.

### CardReveal per-card animations

- Card entrance: spring animation (`damping: 20, stiffness: 100`) scaling in from 0.9→1 opacity 0→1, keyed on `currentIndex` so it replays for every card.
- Card art: continuous breathing scale `0.9 → 0.95 → 0.9` over 6s, looping.
- Action buttons: fade+slide in (`y: 20 → 0`) with a 0.5s delay after the card mounts.
- Reveal SFX: on every card index change, the summon loop SFX is stopped and a reveal SFX plays — `rare-card-reveal.mp3` if the card is RARE, else `card-reveal.mp3`.

### FloatingParticles (ambient background, always running)

- 30 particles, each independently animated:
  - Size: random 1-9px.
  - Travel: starts at `x = startX vw` (random 0-100), `y = 50vh` (mid-screen), opacity 0 → animates to `x = endX vw` (random 0-100), `y = -20vh` (drifts up and off the top of the screen), opacity → 1. Linear easing, infinite repeat.
  - Duration: random between 28s and 37s per particle.
  - Delay: random 0-37s (staggers start times).
  - Additionally each particle pulses internally: scale `0.4 → 2.2 → 0.4`, opacity `1 → 0.7 → 1`, 2s loop, ease-in-out, independent of the outer drift animation.
  - Color: randomly one of 3 per theme — dark theme: cyan `#99FFFF`, gold `#FFD700`, white `#FFFFFF` (blend mode `screen`); light theme: dark cyan `#008B8B`, dark goldenrod `#B8860B`, grey `#808080` (blend mode `multiply`). The summon screen always uses the default `theme="dark"`.
  - Z-order: each particle randomly renders either behind (z-0) or in front (z-50) of surrounding UI (~50/50 split via `Math.random() > 1.5`... effectively `Math.random() + 1 > 1.5` i.e. `Math.random() > 0.5`).

## Numbers & Formulas

| Value | Source |
|---|---|
| Charge duration | 2500 ms |
| Shake start (within charge) | 2000 ms |
| Flash trigger (within charge) | 2500 ms |
| Flash-to-logic delay | 1000 ms (logic runs at 3500ms total) |
| Internal portal "RESULT" state switch | 2600 ms |
| Internal flash fade-out start | 2800 ms |
| Single pull cost | 10 Gems (`banner.singlePrice`) |
| Ten-pull cost | 90 Gems (`banner.multiPrice`) — an effective 10% discount vs. 10×singlePrice (100) |
| XP per pull | 10 XP × pull count (10 XP for x1, 100 XP for x10) |
| Quest progress per pull | +1 "SUMMON" progress per individual pull (so +10 for a x10) |
| Ambient particle count | 30 |
| Magic circle idle particle count | 40 |
| Card reveal breathing cycle | 6 s |
| Button sheen loop (x10 button) | 2s sweep + 3s pause ≈ 5s cycle |

Full rate/pity numbers live in `14-gacha-mechanics-rates-pity.md` — this file only covers UI timing/cost.

## Assets Used

- `/assets/summon/active.webp` — dragon overlay art on the portal.
- `/assets/icons/gem.webp` — gem currency icon (summon buttons, header).
- `/assets/icons/gold-coin.webp` — gold currency icon (resource reveal, header).
- `/assets/icons/info-white.webp` — pity-panel info button (opens Offering Rates).
- `/assets/icons/rare_stroke.webp`, `/assets/icons/uncommon_stroke.webp`, `/assets/icons/common_stroke.webp` — rarity-specific ink/brush halo behind revealed card.
- `/assets/extra/sparkle.png` — RARE-only overlay sparkle on the card face.
- `/assets/extra/blue-spark.png` — RARE overlay used in the `SummonResults` grid thumbnails.
- `/assets/sound/sfx/summon.mp3` — looping charge SFX (single shared `Audio` instance, restarted each summon).
- `/assets/sound/sfx/card-reveal.mp3` — non-rare reveal SFX.
- `/assets/sound/sfx/rare-card-reveal.mp3` — rare reveal SFX.
- `/assets/sound/sfx/click.mp3` — generic UI click SFX (buttons throughout this screen).

## Cross-References

- [14-gacha-mechanics-rates-pity.md](./14-gacha-mechanics-rates-pity.md) — the roll algorithm, banner config, and pity math driving this screen.
- [15-offering-rates-screen.md](./15-offering-rates-screen.md) — reached via the pity panel's info button.
- [16-shop-screen.md](./16-shop-screen.md) — reuses `CardReveal` for its own purchase-reveal flow; also where players buy more Gems if the low-gem warning fires.
- [07-data-model-cards-rarity.md](./07-data-model-cards-rarity.md) — Card/Resource schema and rarity color/asset conventions referenced throughout this screen.
- [08-player-progression-currencies.md](./08-player-progression-currencies.md) — Gold/Gems/XP economy this screen writes to.
- [22-quest-system.md](./22-quest-system.md) — the "SUMMON" quest progress type incremented here.

## Unity Porting Notes

- **Timing**: implement the charge/flash/reveal sequence as a Timeline or a sequenced Coroutine using the exact millisecond marks above (2000 / 2500 / 2600 / 2800 / 3500). The React code uses independent `setTimeout` calls in two different components (`RateUpSummonSection` and `MagicCircle`) keyed off the same trigger — in Unity, drive this from one authoritative sequencer to avoid drift.
- **RNG resolves "invisibly"**: note that all gem-spend, dice-rolls, and inventory/currency mutation happen instantly at t=3500ms, hidden behind the white flash — the "roll" itself has no separate animation; only the *reveal* of already-determined results is animated afterward. Keep this order in the C# port: resolve full economy transaction synchronously, then animate the reveal of the already-known results.
- **CosmicBackground.tsx is currently unused in the live flow** — it defines a nice rarity-tinted radial-burst/particle-ray effect (conic gradient "god rays" + 30 flying lens-flare particles) but `CardReveal.tsx` does not render it; only the static brush-stroke halo + optional sparkle overlay are used per-card. If the intent is a bigger "flash" moment on Rare pulls, port `CosmicBackground`'s effect but treat it as a design opportunity to wire in, not existing confirmed behavior.
- **"NEW!" badge should be computed at roll time**, not re-derived from a heuristic inventory count in the UI layer — pass an explicit `bool isNewCard` alongside each pulled item from the roll/grant step (compute "was this card ID already owned before this whole summon batch started" once, before any of the batch's cards are added to inventory).
- **Recommend a single source of truth for currency**: `CurrencyHeader.tsx` takes `gold`/`gems` props but ignores them entirely, rendering `TopBar` (which reads from the global player store) instead — this is dead/vestigial prop-plumbing. In the Unity port, just bind currency UI directly to the player-economy singleton/service; don't pass currency values down as parameters if they're not used.
- **Low-Gem Warning** has no "Go to Shop" call-to-action button despite the body text suggesting the shop; consider adding one in the Unity port as a UX improvement (flagged, not required — matches current shipped behavior otherwise).
- **Skip-all** does not "fast forward" through the remaining cards' individual VFX — it's a hard cut. Preserve this (simpler + avoids needing to worry about interrupting mid-animation state) unless product wants a montage-skip instead.
- **Sound**: `summon.mp3` uses a module-level singleton `Audio` element (`summonAudioInstance`) reused across all summons/components — in Unity, use a single dedicated AudioSource for this looping SFX rather than firing one-shots, to match the "restart from 0 on each summon" behavior (`currentTime = 0` on each play).
