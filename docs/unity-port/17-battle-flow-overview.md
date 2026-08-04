# Battle Flow Overview

## Purpose / Overview

This document is the top-level map of the Battle feature: the 3 entry points reachable from the Battle tab, and the phase state machine that drives a single battle session from deck selection through to the post-battle result. **The single most important finding in this document is that two of the seven declared phases (`RESULT` and `REWARDS`) are unreachable dead code in the live app** — the actual battle engine resolves and displays its own result screens internally and exits straight back to the Battle tab menu, bypassing them entirely. A Unity port that faithfully implements the declared 7-phase enum without reading this doc first would build two screens nobody ever sees and miss that the real "what happens after the battle ends" flow lives inside the battle-engine screen itself (see [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md) and [20-battle-result-rewards.md](20-battle-result-rewards.md)).

Source files read in full:
- `src/components/BattleScreen.tsx`
- `src/components/battle/BattleFlow.tsx`
- `src/components/battle/StepUpBattle.tsx`
- `src/components/battle/DeckSelectionScreen.tsx`
- `src/components/battle/SelectCardsPhase.tsx`
- `src/components/battle/MatchmakingPhase.tsx`
- `src/components/battle/VersusPhase.tsx`
- `src/components/battle/BattlePhaseNew.tsx` (active engine, exported as `CardBattle`)
- `src/components/battle/BattlePhase.tsx` (legacy, confirmed dead)
- `src/components/battle/ResultPhase.tsx`, `RewardsPhase.tsx` (confirmed unreachable)
- `src/components/battle/BattleEndComponents.tsx` (confirmed dead, zero importers)
- `src/config/battleModes.ts`

## Data Model (schema; suggested C# class/ScriptableObject shape)

```csharp
public enum BattleTopLevelPhase
{
    Deck,          // "DECK" — Form Team summary screen
    Select,        // "SELECT" — Echo Loadout card picker
    Matchmaking,   // "MATCHMAKING" — fake search screen
    Versus,        // "VERSUS" — VS splash screen
    Battle,        // "BATTLE" — the real-time stat-duel engine (owns its own end screens)
    // NOTE: "Result" and "Reward" phases exist in the JS enum and have built
    // screens, but are never actually transitioned to in the live app.
    // Do not build them as separate Unity screens unless you intend to
    // actually wire them up — see "Dead / Unreachable Phases" below.
}

public class BattleSessionContext
{
    public List<CardInstance> playerDeck;      // exactly 3 cards once confirmed
    public List<CardInstance> opponentDeck;     // generated at Matchmaking time
    public string selectedBattleModeId;         // null = "no mode" (Story stub never sets one)
    public PlayerProfile opponentProfile;        // fabricated display-only profile
}
```

`selectedBattleModeId` is the one piece of context threaded through the whole flow — it decides both the required-power gate shown on the Deck screen and which branch of the opponent-deck generator runs (`src/lib/battleUtils.ts`, see [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md)).

## UI Layout (every element, hierarchy, states)

### Battle tab root menu — `src/components/BattleScreen.tsx:61-149`

A vertical stack of 3 large tappable mode cards under a `TopBar` ("BATTLE"):

| Card | Icon | Title | Subtitle copy | `onClick` behavior |
|---|---|---|---|---|
| 1 | `/assets/icons/story.webp` | "Story Mode" | "Unveil the masked realm's secrets." | `console.log("Story Mode")` only — **completely unimplemented stub**, no navigation occurs (`BattleScreen.tsx:66-91`) |
| 2 | `/assets/icons/stepup-new.webp` | "Step-Up Battle" | "Ascend through elite Battle Tiers." | `setMode("STEP_UP")` → renders `StepUpBattle` difficulty list (`BattleScreen.tsx:93-118`) |
| 3 | `/assets/icons/pvp.webp` | "Wild Mode" | "High-stakes draws, lawless duels." | `setReturnLocation("MENU")`, `setSelectedBattleModeId("wild")`, `setMode("1V1")` → jumps **directly** into `BattleFlow`, skipping the Step-Up list (`BattleScreen.tsx:119-146`) |

`BattleScreen` holds 3 pieces of local state: `mode` (`"MENU" | "1V1" | "STEP_UP"`), `returnLocation` (`"MENU" | "STEP_UP"` — where the "back" button from a finished/abandoned battle returns to), and `selectedBattleModeId`.

## Behavior & Logic (step-by-step flow / state machine)

### The 3 entry points, precisely

1. **Story Mode** — dead button, no-op. Flag for the Unity dev: build the button visually if desired for parity, but there is no destination screen to port; it doesn't exist in the JS source at all.
2. **Step-Up Battle** — `mode = "STEP_UP"` renders `StepUpBattle.tsx`, a list of the 4 configured difficulty tiers from `BATTLE_MODES` (full table in [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md)). Tapping a row calls `onSelectMode(mode.id)` (`BattleScreen.tsx:51-56`), which sets `selectedBattleModeId = mode.id`, `returnLocation = "STEP_UP"`, `mode = "1V1"`. Backing out of the resulting battle returns to the Step-Up list, not the root menu.
3. **Wild Mode** — sets `selectedBattleModeId = "wild"`. **Important:** `"wild"` is not an id present in `BATTLE_MODES` (`src/config/battleModes.ts` only defines `beginner`/`intermediate`/`advanced`/`expert`). `getBattleModeById("wild")` therefore always returns `undefined`. This is not a bug to "fix" during porting — it's the mechanism by which Wild Mode falls through to the power-matching opponent-generation branch and shows no required-power gate on the Deck screen (see [18](18-battle-mode-selection-and-deck-select.md) and [19](19-battle-engine-mechanics.md)). Backing out returns to the root Battle menu.

### `BattleFlow` phase state machine — `src/components/battle/BattleFlow.tsx:21-28`

```
type BattlePhaseType =
  | "DECK" | "SELECT" | "MATCHMAKING" | "VERSUS" | "BATTLE" | "RESULT" | "REWARDS"
```

Initial phase on mount: `"DECK"`. On mount, `BattleFlow` also loads any previously-saved 3-card deck from `localStorage["player_deck_v1"]` (`BattleFlow.tsx:52-69`), so the Deck screen may already show a pre-filled team from the player's last battle.

Transition table (only these transitions actually fire):

| From | Trigger | To | Notes |
|---|---|---|---|
| `DECK` | Tap any deck slot (`onEditDeck`) | `SELECT` | |
| `SELECT` | Tap "Ready" (`onConfirm`) | `DECK` | Deck is saved to `localStorage`, **not** forwarded straight to matchmaking — player always lands back on the Deck summary screen to confirm |
| `SELECT` | Back arrow | `DECK` | |
| `DECK` | Tap "Enter" with `deck.length === 3` (`onStartBattle`) | `MATCHMAKING` | See power-gate note below — this check never actually blocks |
| `MATCHMAKING` | Automatic, fixed 3000ms timer | `VERSUS` | Opponent deck is generated during this wait (`generateOpponentDeck`) |
| `VERSUS` | Automatic, fixed 3000ms timer | `BATTLE` | |
| `BATTLE` | — | **never transitions to `RESULT`** | See "Dead / Unreachable Phases" below |

### The power-requirement gate is advisory only

On the Deck screen, if the player's total deck power is below the selected mode's `requiredPower`, tapping "Enter" shows a warning modal ("Insufficient Power") instead of starting the battle (`DeckSelectionScreen.tsx:259-274`). But the modal's own **"Fight" button calls `onStartBattle()` anyway** (`DeckSelectionScreen.tsx:324-332`) — there is no code path where the power requirement actually prevents a battle from starting. Treat `requiredPower` as a UI warning threshold only, never a hard gate, when porting.

### Dead / Unreachable Phases — `RESULT` and `REWARDS`

`BattleFlow` renders `<CardBattle>` (the file `BattlePhaseNew.tsx` default-exports a component named `CardBattle`) for the `"BATTLE"` phase, and wires its `onComplete` prop directly to `onBack` — the same callback `BattleScreen` passes down to return to the Battle tab menu (`BattleFlow.tsx:194-209`):

```tsx
{phase === "BATTLE" && (
  <CardBattle
    playerDeck={playerDeck}
    opponentDeck={opponentDeck}
    playerInfo={playerInfo}
    opponentInfo={opponentInfo}
    onComplete={onBack}   // <-- goes straight back to the Battle tab, NOT to setPhase("RESULT")
  />
)}
```

`CardBattle` fully owns battle resolution internally: it runs its own `INIT/SELECTION/BATTLE/RESOLVE/END` sub-state-machine (documented in [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md)), and when the match ends it renders its own `VictoryScreen`/`DefeatScreen`/`DrawScreen` components (also in `src/components/battle/`, distinct from `ResultPhase.tsx`/`RewardsPhase.tsx`) and computes/dispatches rewards itself (documented in [20-battle-result-rewards.md](20-battle-result-rewards.md)). When the player taps "Continue" on that internal result screen, it calls the `onComplete` prop it was given — which is `onBack` — exiting all the way back out to the Battle tab menu in one step.

Consequently:
- `BattleFlow.handleBattleComplete` (`BattleFlow.tsx:147-149`) — a function that only does `console.log(...)` — is **never called**. It looks like it should be the bridge into `RESULT`, but nothing invokes it.
- `phase === "RESULT"` (rendering `ResultPhase.tsx`, a generic score/avatar summary screen with "Continue"/"Try Again"/"Home" buttons) is **never reached**.
- `phase === "REWARDS"` (rendering `RewardsPhase.tsx`, a "tap to open a chest" screen with a **hardcoded** `+50 gold` / `+10 gems` visual, unrelated to the actual reward math) is **never reached**.

**Unity porting note:** Do not build `ResultPhase`/`RewardsPhase` as functioning screens unless you deliberately want to add that intermediate step to the Unity flow. Their code exists and is fully-formed (readable for visual reference — score display, deck thumbnails, chest-opening animation — if you like the aesthetic), but they are orphaned in the current app. The real "what does the player see after the battle" answer is entirely inside `BattlePhaseNew.tsx`'s `BattleResultHandler` + `VictoryScreen`/`DefeatScreen`/`DrawScreen`.

### `BattlePhase.tsx` — confirmed dead legacy code

`src/components/battle/BattlePhase.tsx` is an entire alternate implementation of the battle engine (3-fixed-round duel, `ATK`/`HP` stats, its own `ZOOM/CLASH/HIT/DESTROY` animation phases). It is imported in `BattleFlow.tsx:19` but its only usage is commented out (`BattleFlow.tsx:195-201`), replaced by the `CardBattle` (`BattlePhaseNew.tsx`) import directly below it. **It is never rendered anywhere in the app.** Do not port its mechanics — its round/timing numbers are superseded by the active engine in `BattlePhaseNew.tsx`. It's useful only as historical context for why some animation-phase naming (`ZOOM`, `DESTROY`) persisted into the new file.

### `BattleEndComponents.tsx` — confirmed dead, zero importers

`src/components/battle/BattleEndComponents.tsx` exports `ToonSword`, `SkullCrossbones`, `GameCard`, `RewardItem`, `Confetti`, `Smoke` — a set of decorative components for an end-of-battle screen. A repo-wide search found **no import of this file anywhere** outside itself. It is entirely orphaned. Skip it in the port.

## Animations & Timing (every animation, EXACT duration in ms, sequence order)

Phase-level timing (see [18](18-battle-mode-selection-and-deck-select.md) and [19](19-battle-engine-mechanics.md) for full breakdowns of each phase's internal animation):

| Phase | Duration | Trigger to advance |
|---|---|---|
| `MATCHMAKING` | Fixed 3000ms | Automatic `setTimeout` |
| `VERSUS` | Fixed 3000ms | Automatic `setTimeout` |
| `BATTLE` | Variable — 3 rounds, each round is (~1200ms stat reveal) + (up to 20000ms player selection) + (7000ms fixed resolution animation) | Internal to the engine, see doc 19 |

## Numbers & Formulas

| Value | Number | Source |
|---|---|---|
| Deck size required to enable "Enter" | exactly 3 cards | `DeckSelectionScreen.tsx:33`, `BattleFlow.tsx:132-136` |
| Matchmaking fake-search delay | 3000ms | `MatchmakingPhase.tsx:25-31` |
| Versus splash hold duration | 3000ms | `VersusPhase.tsx:32-37` |
| `localStorage` deck save key | `"player_deck_v1"` | `BattleFlow.tsx:37` |

## Assets Used

- `/assets/icons/story.webp`, `/assets/icons/stepup-new.webp`, `/assets/icons/pvp.webp` — the 3 Battle-tab menu card icons.

(Per-screen assets for Deck/Select/Matchmaking/Versus are cataloged in [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md); battle-engine assets in [19](19-battle-engine-mechanics.md).)

## Cross-References

- [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md) — Step-Up list, `battleModes.ts` config, Deck/Select screens, Matchmaking/Versus screen contents
- [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md) — the real-time stat-duel engine that lives inside the `BATTLE` phase
- [20-battle-result-rewards.md](20-battle-result-rewards.md) — the actual (internal-to-the-engine) result screens and reward table
- [21-battle-tier-screen.md](21-battle-tier-screen.md) — the separate meta-progression screen that gates Step-Up access indirectly via card power
- [12-deck-building-system.md](12-deck-building-system.md) — general deck-building UI patterns shared with `SelectCardsPhase`
- [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md) — the `Card` schema referenced throughout this flow

## Unity Porting Notes

- **Do not implement `RESULT`/`REWARDS` as real screens by default.** They are fully-coded but orphaned. If a Unity redesign wants a distinct "results" step separate from the in-battle victory/defeat overlay, that's a legitimate design upgrade over the current JS app — but it is a *new* feature, not a port of existing wired behavior.
- **`BattlePhase.tsx` (legacy) and `BattleEndComponents.tsx` are both 100% dead code.** Do not spend porting effort on either. They're safe to read for animation-naming inspiration only.
- **The required-power gate never blocks.** If the Unity design wants a hard gate (can't even attempt an under-powered fight), that's a deliberate behavior change from the source, not a faithful port — call it out to the game designer explicitly.
- **Story Mode is unimplemented in the source.** There is no reference behavior to port; it's a placeholder button only.
- **`selectedBattleModeId = "wild"` matching no config entry is intentional-by-omission, not a bug** — it's how Wild Mode's power-matching opponent generator gets selected. Preserve a `null`/"no mode" and `"wild"` sentinel distinction (or just always pass `null` for Wild Mode) rather than trying to add a real `"wild"` entry to the mode config.
