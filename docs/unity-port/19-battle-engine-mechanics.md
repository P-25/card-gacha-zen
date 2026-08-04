# Battle Engine Mechanics

## Purpose / Overview

This is the reference for the real-time stat-duel battle loop — the actual game. It is implemented entirely in `src/components/battle/BattlePhaseNew.tsx`, default-exported as `CardBattle`, and rendered for the `BATTLE` phase of `BattleFlow` (see [17-battle-flow-overview.md](17-battle-flow-overview.md)). Everything in this document — round loop, timers, AI, win condition, animation timeline, VFX, and opponent-deck generation — is sourced from that one file plus `src/lib/battleUtils.ts`. Treat this document as implementable pseudocode: a Unity dev should be able to build the engine directly from the tables and step sequences below without opening the JS source.

Source files read in full:
- `src/components/battle/BattlePhaseNew.tsx` (the engine itself)
- `src/components/battle/SingleCard.tsx` (per-card visual states referenced by the engine)
- `src/components/battle/RoundResultOverlay.tsx` (the round-win/lose banner)
- `src/lib/battleUtils.ts` (`generateOpponentDeck`, both branches)
- `src/config/battleModes.ts` (consumed by the rule-based opponent generator)

## Data Model (schema; suggested C# class/ScriptableObject shape)

```csharp
public enum GameState { Init, Selection, Battle, Resolve, End }
// NOTE: "Resolve" is declared in the source's type union but the reducer
// NEVER assigns it. See "Gotcha: the phantom RESOLVE state" below.

public enum BattleResult { Win, Lose, Draw }   // from the LOCAL PLAYER's perspective, per round
public enum StatType { Pow, Spd, Def }

public enum AnimPhase { Idle, Zoom, Tension, Charge, Attack, Impact, Destroy, Finale }

public class RoundState
{
    public int roundNumber;              // increments each startTurn(), starts at 1
    public StatType activeStat;           // the stat locked in for THIS round's comparison
    public bool isStatRevealing;          // true during the ~1.2s slot-machine reveal
    public int timeLeftSeconds;           // selection countdown, starts at 20
    public string selectedPlayerCardId;
    public string selectedOpponentCardId;
    public BattleResult roundResult;
}

public class Particle { public int id; public float size, angle, speed; public Color color; }
public class Shockwave { public int id; public float size; public Color color; }
```

## UI Layout (every element, hierarchy, states)

Two mutually-exclusive top-level visual modes, cross-faded by `gameState`:

**Selection UI** (visible when `gameState === "SELECTION"`, blurred/scaled-out otherwise):
- Opponent hand (top): up to 3 face-down cards, opponent avatar + running score pill (red).
- Center: "ROUND {n}" label, the animated stat-reveal text (see Behavior below), a "SELECT YOUR FIGHTER" prompt, and the countdown timer.
- Player hand (bottom): up to 3 face-up, tappable cards (grayed out and un-tappable during the stat reveal), player avatar + running score pill (blue).

**Battle Arena** (visible when `gameState === "BATTLE"` and both a player and opponent card are selected): both cards fly into a vertical face-off layout, with per-phase position/scale/rotation changes described in the Animation Timeline below, plus particle/shockwave/flash VFX layers and floating stat-value "bubbles" next to each card.

`RoundResultOverlay` is rendered only while `animPhase === "DESTROY"`: a full-screen banner sliding the winning side's colored background in from their edge, a flying score-orb animation, big "ROUND WON"/"ROUND LOST"/"DRAW" text, and an animated score counter tick.

When `gameState === "END"`, the entire selection/arena UI is replaced by one of `VictoryScreen` / `DefeatScreen` / `DrawScreen` (documented in [20-battle-result-rewards.md](20-battle-result-rewards.md)).

## Behavior & Logic — the full round loop as pseudocode

### Internal state machine

```
GameState = INIT | SELECTION | BATTLE | RESOLVE | END
```

- `INIT` is only the component's initial `useState` value at mount — nothing ever explicitly re-enters it.
- `startNewGame()` runs once on mount (`useEffect(() => { startNewGame() }, [])`), seeds `userHand`/`oppHand` from the props-supplied decks, zeroes both scores and the round counter, and calls `startTurn()`.
- `startTurn()` sets `gameState = SELECTION`.
- `handleCardSelect()` (fired when the player taps a card) sets `gameState = BATTLE`.
- After the full 7-round-resolution animation timeline (below) completes, either `startTurn()` runs again (next round) or, on the final round, `gameState = END` is set 100ms after entering the `FINALE` animation phase.

**Gotcha: the phantom `RESOLVE` state.** The type union includes `"RESOLVE"`, and the Battle Arena's visibility condition even checks for it (`gameState === "BATTLE" || gameState === "RESOLVE"`), but **no code anywhere ever calls `setGameState("RESOLVE")`**. It is dead/unused — the engine goes `SELECTION → BATTLE → (repeat) → END` and never touches `RESOLVE`. Do not build a distinct Resolve state in Unity unless you want to add real behavior to it; faithfully porting means this transition simply doesn't exist.

### Per-round sequence

**Step 1 — `startTurn()`** (`BattlePhaseNew.tsx:228-262`):
1. `gameState = SELECTION`; clear `selectedCardId`, `oppCardId`, `battleResult`; `animPhase = IDLE`; clear particles/shockwaves.
2. `round += 1`.
3. `timeLeft = 20` (this is set immediately, but see step 2's note — the visible countdown does not start ticking yet).
4. **Stat-reveal "slot machine" animation** begins: `isStatRevealing = true`.
   - Every **60ms**, cycle the displayed stat forward through the fixed order `[POW, SPD, DEF]` (wrapping).
   - After exactly **20 ticks** (20 × 60ms = **1200ms total**), stop the interval, pick a **uniformly random** final stat from `[POW, SPD, DEF]` (1/3 each), lock `displayStat` and `activeStat` to it, and set `isStatRevealing = false`.
   - This is the stat that both combatants will be compared on for the entire round.

**Step 2 — Selection countdown & auto-pick** (`BattlePhaseNew.tsx:265-284`, a `useEffect` gated on `gameState === "SELECTION" && !isStatRevealing`):
- While `isStatRevealing` is true, this effect early-returns — **the countdown display does not decrement during the ~1.2s stat reveal**, even though `timeLeft` was numerically set to 20 already. Practically: the player always sees a full, un-decremented "20" the moment the stat reveal finishes, then it starts ticking down.
- Once revealing is done: a 1-second interval decrements `timeLeft` by 1.
- If `timeLeft <= 0`: **auto-pick** a uniformly random card from the player's remaining (non-null) hand and treat it exactly as if the player had tapped it (`handleCardSelect`).
- Total player decision budget per round: **20 real seconds**, starting only after the 1.2s reveal locks in.

**Step 3 — Player selects a card, `handleCardSelect(card)`** (`BattlePhaseNew.tsx:311-325`):
- Guarded: no-op unless `gameState === "SELECTION" && !isStatRevealing`.
- `selectedCardId = card.id`; `gameState = BATTLE`.
- **AI opponent selection**: pick a **uniformly random card from the opponent's remaining (non-null) hand** — `Math.random()` index into the filtered array. **There is no strategy whatsoever**: the AI does not look at `activeStat`, does not try to counter the player's pick, does not consider its own hand's stat spread. It is pure chance.
- Calls `runBattleSequence(userCard, oppCard)`.

**Step 4 — `runBattleSequence(uCard, oCard)`** (`BattlePhaseNew.tsx:327-383`) — resolution formula and the full animation timeline:

```
uStat = uCard.state[activeStat]     // e.g. activeStat = "POW" -> uCard.state.pow
oStat = oCard.state[activeStat]

if uStat > oStat:  result = WIN     // player wins the round
elif uStat < oStat: result = LOSE   // player loses the round
else:              result = DRAW    // exact tie on the active stat -> no score change either side
```

This is a **direct, single-stat comparison** — whichever of POW/SPD/DEF was randomly locked in during the reveal, only that one stat matters for the round. The other two stats on both cards are irrelevant to this round's outcome (they'll matter in a future round if that stat gets rolled again).

### Full animation timeline (all offsets relative to the moment `runBattleSequence` is called, t=0)

| Offset | `animPhase` | What happens |
|---|---|---|
| **0ms** | `ZOOM` | Both cards begin entering the arena from off-screen (opponent from top, player from bottom), scaling up from 50%/0 opacity. |
| **1000ms** | `TENSION` | Cards settle into their face-off position at full scale; stat-value "bubbles" fade/slide in next to each card. |
| **1800ms** | `CHARGE` | The **eventual winner's card only** pulls back and visually "charges" (pulsing red aura + a slight scale/rotate windup); the loser holds position. |
| **2600ms** | `ATTACK` | The winner's card lunges hard toward the loser (fast, 150ms CSS transition) while the loser stays put. |
| **2750ms** | `IMPACT` | Contact frame: `spawnVisuals()` fires (50 particles + 2 shockwave rings, see VFX section below), a full-screen white flash (300ms fade), a violent screen-shake (400ms), and a "SMASH!" text pop-in on the winning side. The loser's card visually recoils/knocks back with a blur. |
| **4000ms** | `DESTROY` | The loser's card shatters into 4 randomly-flung polygon shards (0.8s ease-out fling animation) and fades to 0 opacity; the winner's card scales up to 150% and centers itself triumphantly. **Score is incremented here**: `userScore += 1` if `result === WIN`, `oppScore += 1` if `result === LOSE` (a `DRAW` result increments neither). `RoundResultOverlay` becomes visible for this window (see below). |
| **7000ms** | cleanup | Both hands have their played card's slot set to `null` (slot position preserved, not spliced out). Then: if this was the last card in the player's hand (see exact remaining-count nuance below), `animPhase = FINALE` and, **100ms later**, `gameState = END`. Otherwise, `startTurn()` runs immediately, beginning the next round with a fresh stat reveal. |

`RoundResultOverlay`'s visible window is therefore **[4000ms, 7000ms) = exactly 3 seconds** on any non-final round (it disappears the instant the next `startTurn()` resets `animPhase` back to `IDLE`).

**Exact "is this the last round" check** (`BattlePhaseNew.tsx:371-382`): the code computes `remainingCount = userHand.filter(c => c !== null).length` using the hand snapshot **from before this round's card is removed** (a stale closure over `userHand` at the time `runBattleSequence` was invoked, not the post-cleanup value). So `remainingCount` counts the just-played card too. The finale condition is `remainingCount <= 1` — i.e. "the card that was just played was the only one left in hand." With the standard 3-card deck, this means **round 3 always triggers the finale**; rounds 1 and 2 always call `startTurn()` again. Port this as: *finale triggers when the round about to be resolved is the player's last card*, not "when 0 cards remain after resolving" (same practical outcome for a 3-card deck, but state it precisely in case deck size ever becomes variable).

**`FINALE` phase visual**: the winning side's final card zooms into the camera at 5x scale over 1000ms while fading out (a "victory lunge at the viewer" beat) and the losing side's card scales to 0 and vanishes; a full-screen dark curtain fades in over 1500ms underneath it. 100ms after `FINALE` begins, `gameState` flips to `END`.

### Match-end condition

The match ends purely by **hand exhaustion** — there is no separate "best of 3" score check mid-match, no early termination on a 2-0 sweep. All 3 rounds always play out (assuming a standard 3-card deck), and only then does `gameState = END` trigger the win/lose/draw screen (`userScore` vs `oppScore`, documented fully in [20-battle-result-rewards.md](20-battle-result-rewards.md)).

## Animations & Timing — VFX spawn detail

`spawnVisuals()` (`BattlePhaseNew.tsx:286-309`), called exactly once per round at the **2750ms** `IMPACT` mark:

**Particles — 50 spawned per impact:**
| Property | Value |
|---|---|
| Count | 50 |
| Color | 50/50 random choice between `#fbbf24` (amber) and `#ef4444` (red) |
| Size | random 4–16px |
| Angle | random 0–360° |
| Speed | random 8–28 (used as travel distance = `speed × 20px` over the particle's lifetime) |
| Lifetime / motion | 0.6s ease-out, radial burst outward from the impact point, fading to 0 opacity |
| Spawn origin | screen-space, fixed at `(50%, 20%)` if the player won that round or `(50%, 80%)` if the player lost — i.e. always centered on whichever side is about to shatter |

**Shockwaves — exactly 2 per impact, fixed sizes:**
| Ring | Size | Color |
|---|---|---|
| 1 | 100px | `#ffffff` (white) |
| 2 | 200px | `#fbbf24` (amber) |

Both rings animate `scale 0.5 → 2, opacity 1 → 0, border-width 10px → 0` over 0.5s ease-out, same origin logic as the particles.

**Screen flash**: full-viewport white overlay, `mix-blend-overlay`, fades 1 → 0 opacity over 0.3s, triggered at the same 2750ms `IMPACT` moment.

**Screen shake**: applied only while `animPhase === "IMPACT"`; an 11-keyframe shake (alternating up to ±8px on x/y plus small rotation) over 0.4s.

## Numbers & Formulas — full round-timing table

| Value | Number | Source |
|---|---|---|
| Stat-reveal tick interval | 60ms | `BattlePhaseNew.tsx:243` |
| Stat-reveal tick count | 20 ticks | `BattlePhaseNew.tsx:242` |
| Stat-reveal total duration | 1200ms (20 × 60ms) | derived |
| Final stat selection | uniform random among POW/SPD/DEF (1/3 each) | `BattlePhaseNew.tsx:255-256` |
| Player selection timer | 20 seconds, starts after reveal locks in | `BattlePhaseNew.tsx:203, 237` |
| Auto-pick on timeout | uniform random from remaining player hand | `BattlePhaseNew.tsx:270-274` |
| AI opponent card pick | uniform random from remaining opponent hand — **no stat awareness** | `BattlePhaseNew.tsx:318-321` |
| Round outcome formula | `uCard.state[stat] > oCard.state[stat] ? WIN : < ? LOSE : DRAW` | `BattlePhaseNew.tsx:334-336` |
| Animation timeline offsets | 0 / 1000 / 1800 / 2600 / 2750 / 4000 / 7000 ms | `BattlePhaseNew.tsx:342-382` |
| Round-result overlay visible window | 3000ms (4000–7000ms) on non-final rounds | derived |
| Particles per impact | 50 | `BattlePhaseNew.tsx:288` |
| Shockwave rings per impact | 2 (100px white, 200px amber) | `BattlePhaseNew.tsx:304-307` |
| Rounds per match | 3 (fixed by deck size) | derived |
| Finale-to-End delay | 100ms | `BattlePhaseNew.tsx:378` |

## Numbers & Formulas — opponent deck generation (`src/lib/battleUtils.ts`)

`generateOpponentDeck(playerDeck, selectedBattleModeId)` picks one of two branches:

### Branch A — Rule-based (Step-Up modes with a matching, non-empty `opponentDeckRules`)

```
for each rule { rarity, level, count } in mode.opponentDeckRules:
    for i in 1..count:
        pool = all cards in cardsData where card.rarity == rule.rarity
        baseCard = uniform-random pick from pool   // skip with a console.warn if pool is empty
        card = deep-clone(baseCard)
        card.level = rule.level

        levelBonus = (rule.level - 1) * 2   // e.g. level 3 = 2 level-ups above base = +4
        card.state.pow += levelBonus
        card.state.def += levelBonus
        card.state.spd += levelBonus         // SAME bonus applied identically to all 3 stats

        card.instanceId = "opp-{id}-{random}"   // uniqueness only, not gameplay-relevant
        push card to opponentDeck
```

This is the exact same "+2 per stat per level" scaling used by the player's card fusion/leveling system (see [08-player-progression-currencies.md](08-player-progression-currencies.md)) — consistent across the game.

### Branch B — Power-matching (Wild Mode, or any `selectedBattleModeId` that resolves to no config / empty rules)

```
userTotalPower = Σ over player's 3 deck cards of (pow + def + spd)
targetTotalPower = userTotalPower           // opponent aims for exact parity with the player
targetAvgPower = targetTotalPower / 3        // per-card target

shuffle the FULL card pool (cardsData) randomly, take the first 3 as base cards
  (any rarity, base/level-1 stats — no rarity or level filtering at all in this branch)

for each selected base card:
    basePower = pow + def + spd of the unmodified base card

    if basePower < targetAvgPower:
        powerDeficit = targetAvgPower - basePower
        baseBuff = floor(powerDeficit / 3)
        remainder = floor(powerDeficit % 3)     // NOTE: always 0 in practice — see gotcha below

        card.state.pow += baseBuff + (50% random chance ? remainder : 0)
        card.state.def += baseBuff
        card.state.spd += baseBuff
        // stats are only ever buffed UP toward the target, never reduced if already above it

        levelIncrease = floor(powerDeficit / 5)   // "Arbitrary scaling" — cosmetic level display only
        card.level = (card.level or 1) + levelIncrease
    // else: card is used completely unmodified (including its original level)

    card.instanceId = "opp-{id}-{random}"
```

**Gotcha — the `remainder` calculation is dead code.** `baseBuff = floor(powerDeficit / 3)` and `remainder = floor(powerDeficit % 3)` — but `floor(x) % 3` applied to an already-integer `floor(powerDeficit/3)`'s remainder concept doesn't actually work this way: `remainder` here is computed as `floor(powerDeficit % 3)`, and since `powerDeficit % 3` is already a value in `[0, 3)` (a difference of two numbers, not necessarily integer if source stats aren't integers — but in practice all stats in this game are integers), `floor()` of it just re-truncates a value that's typically already whole. The practical effect: `remainder` is a small 0–2 value that gets added **only to POW, never to DEF/SPD**, applied only half the time (50% coin flip). This is a deliberately-asymmetric-looking piece of code but is almost certainly an unintentional oddity rather than a designed "POW gets the leftover" rule — flag it to the designer; don't treat the POW-favoring remainder distribution as an intentional balance decision worth preserving unless confirmed.

**"Arbitrary scaling" comment** (`battleUtils.ts:93`, verbatim in source): the `levelIncrease = floor(powerDeficit / 5)` line is explicitly commented by the original author as an estimate, not a tuned value — it only affects the **displayed level number**, not any stat calculation (stats were already fully determined by the buff above). Since this is explicitly flagged in-source as arbitrary, it's a good, low-risk candidate to replace with a proper level curve when porting, without worrying about breaking balance — no other system reads this opponent's `level` field for anything except display.

## Assets Used

- Card art per-card (`card.image`, data-driven — see [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md)).
- Rarity brush-stroke backgrounds and rarity border colors (`getStrokeImage`/`getRarityBorderColor`, `src/lib/rarityStyles.ts`), same as doc 18.
- Card back art: `"./assets/Card_Art/back/card_001.webp"` for face-down opponent cards.
- All particle/shockwave/flash/shake/shatter VFX are **pure CSS/DOM effects with no sprite assets** — in Unity these need a real particle system (e.g. Shuriken/VFX Graph) or procedural sprite animation; there is no art asset to directly port for the explosion/shockwave, only the numeric parameters documented above.
- `profileIcons.json` — avatar images for the player/opponent portrait circles during the Selection UI.

## Cross-References

- [17-battle-flow-overview.md](17-battle-flow-overview.md) — where this engine sits in the overall flow
- [18-battle-mode-selection-and-deck-select.md](18-battle-mode-selection-and-deck-select.md) — `battleModes.ts` config consumed by Branch A above
- [20-battle-result-rewards.md](20-battle-result-rewards.md) — what happens the instant `gameState === "END"`
- [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md) — `Card` schema, rarity, and the same "+2 per stat per level" formula used elsewhere
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — the card fusion/leveling system sharing the same stat-scaling formula

## Unity Porting Notes

- **The AI has zero strategy** — it is a uniform random pick every round, blind to the active stat and to its own hand's composition. This is explicitly the best place to add real opponent intelligence in the Unity port (e.g. picking the card most likely to win the revealed stat) without needing to change anything else about the engine's structure — the "AI decision" is a single, cleanly isolated `pick a card from oppHand` call site.
- **The phantom `RESOLVE` state is unused** — don't build UI/logic around it; the real machine is `SELECTION → BATTLE → SELECTION → BATTLE → SELECTION → BATTLE → END` for a 3-card deck.
- **The countdown timer visually "sits" at 20 during the 1.2s stat reveal** before it starts ticking. If your Unity port shows the timer during the reveal, replicate this held-at-20 behavior rather than starting the countdown immediately, or players will lose real decision time to a timer that's silently already running.
- **The "remainder" distribution asymmetry in the Wild Mode power-matching generator is very likely an unintentional artifact**, not balance design — verify with the designer before preserving it as intentional POW-favoritism.
- **The "Arbitrary scaling" level-display formula is explicitly flagged as a guess by the original author** — safe to replace with a real level curve for the opponent's displayed level without any risk of affecting actual combat stats (which are computed independently, before the level number is derived).
- **Rule-based (Step-Up) opponent stat scaling reuses the exact same "+2 per stat per level above 1" formula as player card leveling** (see doc 08) — keep these unified in a single shared Unity utility function rather than reimplementing the constant twice, to avoid the kind of formula drift already present between other duplicated systems in the JS source.
- **Round count is implicitly tied to deck size (currently always 3)** — if the Unity design ever supports variable deck sizes, the "is this the finale round" check needs to be ported as *"is the card about to be played the last one in hand"*, matching the exact pre-removal-count semantics described above, not a naive post-removal check (they happen to agree for size-3 decks but would diverge for other sizes).
