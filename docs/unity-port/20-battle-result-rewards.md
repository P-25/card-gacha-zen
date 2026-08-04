# Battle Result & Rewards

## Purpose / Overview

This document covers what happens the instant the battle engine's internal `gameState` becomes `"END"` (see [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md)): the reward calculation, the three outcome screens (Victory/Defeat/Draw), and which quest counter gets bumped. **These are the `VictoryScreen.tsx`/`DefeatScreen.tsx`/`DrawScreen.tsx` components inside `src/components/battle/`, rendered from within `BattlePhaseNew.tsx`'s own `BattleResultHandler` — not** the similarly-named-sounding `ResultPhase.tsx`/`RewardsPhase.tsx` at the `BattleFlow` level, which are confirmed dead/unreachable (see [17-battle-flow-overview.md](17-battle-flow-overview.md)).

Source files read in full:
- `src/components/battle/BattlePhaseNew.tsx` (specifically `BattleResultHandler`, lines 76-160)
- `src/components/battle/VictoryScreen.tsx`
- `src/components/battle/DefeatScreen.tsx`
- `src/components/battle/DrawScreen.tsx`
- `src/store/slices/playerSlice.ts` (`addRewards` reducer)
- `src/store/slices/questSlice.ts` / `src/types/quest.ts` (`updateQuestProgress`, `BATTLE_WIN`)

## Data Model (schema; suggested C# class/ScriptableObject shape)

```csharp
public class BattleRewards
{
    public int experience;
    public int gold;
    public int gems;
}

public enum BattleOutcome { Victory, Defeat, Draw }
```

## UI Layout (every element, hierarchy, states)

All three screens share one structural pattern (`Background` full-bleed backdrop → header text → hero image → rewards panel → single "Continue" button), each themed differently:

| Screen | Header text | Hero image | Rewards panel content |
|---|---|---|---|
| `VictoryScreen` | "VICTORY!" (purple, italic, thick stroke) | `/assets/summon/dragon-raise.webp`, plus a `MagicCircle` effect layered behind it | Up to 3 cards shown conditionally (`rewards.X > 0`): EXP, GOLD, GEMS — each its own icon + `+{value}` |
| `DefeatScreen` | "DEFEATED!" (dark red/maroon, italic) | `/assets/summon/dragon-sleep.webp` (slightly desaturated) | GOLD only if `> 0`, else literal text **"NO REWARDS"** |
| `DrawScreen` | "DRAW" (grey, italic) | `/assets/summon/dragon-wake.webp` | GOLD only if `> 0`, else **"NO REWARDS"** if both `exp === 0 && gold === 0` |

**Important display gap on `DrawScreen`**: a draw actually grants `exp = 10` (see reward table below) but the component's rewards panel **only ever renders a GOLD reward card** — there is no EXP display block in `DrawScreen.tsx` at all (unlike `VictoryScreen`, which shows EXP/GOLD/GEMS). The player receives 10 EXP on a draw but is never shown it on this screen. Decide whether to fix this visual omission in the Unity port or preserve it faithfully.

Each screen's "Continue" button calls the same `onContinue` prop, which in practice is `CardBattle`'s `onComplete` prop — wired all the way back to `BattleFlow`'s `onBack`, which returns the player to the Battle tab menu (or the Step-Up list) in one step. See [17-battle-flow-overview.md](17-battle-flow-overview.md).

## Behavior & Logic — reward calculation (`BattleResultHandler`, `BattlePhaseNew.tsx:76-160`)

Runs once per battle end, guarded by a `rewardsCalculated` flag so it never double-fires:

```
if userScore > oppScore:                       // VICTORY
    if oppScore == 0:                            // "Perfect Win"
        exp = 20; gold = 30; gems = 5
    else:                                         // Normal Win
        exp = 10; gold = 20; gems = 0
    dispatch(updateQuestProgress({ type: "BATTLE_WIN", amount: 1 }))

elif userScore < oppScore:                       // DEFEAT
    exp = 0; gold = 10; gems = 0
    // no quest progress dispatched

else:                                             // DRAW (userScore == oppScore)
    exp = 10; gold = 20; gems = 0                 // same numbers as a Normal Win
    // no quest progress dispatched

dispatch(addRewards({ experience: exp, gold, gems }))
render <VictoryScreen | DefeatScreen | DrawScreen> with these rewards
```

**"Perfect Win" is defined as `oppScore === 0`, not literally "won all 3 rounds."** With a 3-round match, most Perfect Wins will in fact be 3–0 sweeps, but the condition as coded is purely "the opponent never scored a point" — a `WIN, WIN, DRAW` sequence (`userScore = 2, oppScore = 0`) also qualifies as a Perfect Win under this exact check, even though it wasn't a literal 3-0. Port the condition as `oppScore === 0`, not as `userScore === 3`, to preserve this exact behavior.

`addRewards` (`playerSlice.ts:212-232`) applies gold/gems directly and, for experience, runs the same player-level-up loop documented in [08-player-progression-currencies.md](08-player-progression-currencies.md) (`XP required for level N→N+1 = N × 100`, with overflow handling for multi-level-ups in one grant).

## Numbers & Formulas — full reward table

| Outcome | Condition | EXP | Gold | Gems | Quest progress |
|---|---|---|---|---|---|
| **Perfect Win** | `userScore > oppScore` AND `oppScore === 0` | 20 | 30 | 5 | `BATTLE_WIN` +1 |
| **Normal Win** | `userScore > oppScore` AND `oppScore >= 1` | 10 | 20 | 0 | `BATTLE_WIN` +1 |
| **Draw** | `userScore === oppScore` | 10 | 20 | 0 | none |
| **Defeat** | `userScore < oppScore` | 0 | 10 | 0 | none |

Note that **Draw and Normal Win grant identical reward amounts** — the only practical difference between them is the quest counter and, obviously, the header/theming shown to the player.

## Animations & Timing

All three screens use the same staggered spring-entrance choreography (framer-motion `spring` transitions, not fixed-duration tweens, so exact millisecond timing is approximate/spring-physics-driven rather than a strict linear timeline — port the *order and relative delay*, not literal ms):

| Delay | Element |
|---|---|
| ~0ms | Header container slides down from above (`y: -50 → 0`) |
| ~0.2s | Hero image scales in (`0.8 → 1`, fade in) |
| ~0.4s | Header text itself pops in (scale `2 → 1`, spring bounce) and the rewards panel slides up from below |
| ~0.5s / 0.6s / 0.7s | Individual reward cards (EXP/Gold/Gems, `VictoryScreen` only — Defeat/Draw have just one Gold slot) pop in one after another via spring, each `delay += 0.1s` from the previous |
| ~0.8s | Continue button pops in (spring), typically the last element to appear |

## Assets Used

- `/assets/summon/dragon-raise.webp` — Victory hero image.
- `/assets/summon/dragon-sleep.webp` — Defeat hero image.
- `/assets/summon/dragon-wake.webp` — Draw hero image.
- `/assets/icons/exp.webp`, `/assets/icons/gold-coin.webp`, `/assets/icons/gem.webp` — reward icons.
- `MagicCircle` component (shared with the gacha summon feature) — decorative backdrop behind the Victory dragon image only.
- `Background` component (`src/components/layout/Background.tsx`) — shared full-bleed backdrop across all three screens.

## Cross-References

- [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md) — how `userScore`/`oppScore` are produced (one point per round win, no points for a round draw)
- [17-battle-flow-overview.md](17-battle-flow-overview.md) — confirms `ResultPhase.tsx`/`RewardsPhase.tsx` are NOT these screens and are unreachable dead code
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — the `addRewards` EXP/level-up loop, and gold/gem sourcing in general
- [22-quest-system.md](22-quest-system.md) — the `BATTLE_WIN` requirement type and how quest progress/claiming works

## Unity Porting Notes

- **Do not confuse these screens with the dead `ResultPhase.tsx`/`RewardsPhase.tsx`.** The real post-battle UX is `VictoryScreen`/`DefeatScreen`/`DrawScreen`, invoked from inside the battle engine itself, not from `BattleFlow`'s phase switch.
- **"Perfect Win" = `oppScore === 0`**, not a literal 3-0 sweep check — preserve the exact condition, since a partial draw-inclusive sweep also qualifies.
- **Draw and Normal Win share identical numeric rewards** (10 EXP / 20 gold / 0 gems) — only the quest counter and screen theming differ. If tuning reward balance in Unity, decide deliberately whether draws should keep matching normal-win rewards or be nerfed relative to a genuine win.
- **`DrawScreen` never visually displays the EXP it grants.** This is very likely an oversight (the data is there, `VictoryScreen` shows EXP just fine) rather than an intentional "hide it" design. Recommend fixing this display gap during the port rather than reproducing it, but flag the discrepancy to the designer either way.
- **Quest progress (`BATTLE_WIN`) only fires on a win** (perfect or normal) — draws and defeats never touch quest state, even though draws grant win-tier currency rewards. Keep the quest-progress trigger tied strictly to `userScore > oppScore`.
