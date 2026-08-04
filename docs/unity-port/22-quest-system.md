# Quest System

## Purpose / Overview

The Quest System gives players short- and long-term objectives ("Daily", "Weekly", and permanent "Achievements") that reward gold, gems, and player XP for performing normal game actions (winning battles, summoning, leveling cards, logging in). It is a pure client-side, single-player system — no server validation, no timers running while the app is closed. Progress accumulates via a single generic "requirement type" event bus that any screen in the game can push into, and quests are read back out on one screen (`QuestScreen`) with three tabs.

Two reward layers exist simultaneously:
1. **Per-quest rewards** — claimed individually once a quest's progress reaches its target.
2. **Milestone / "progress" rewards** — a secondary track per tab that rewards the player for completing *N total quests* in that tab (independent of which quests), visualized as a chest/node progress bar.

Source: `src/components/QuestScreen.tsx`, `src/config/quests.json`, `src/store/slices/questSlice.ts`, `src/types/quest.ts`.

## Data Model (schema; suggested C# shape)

Original JSON config (`src/config/quests.json`) has two arrays: `quests` and `progressRewards`. Original TS types (`src/types/quest.ts:1-34`):

```ts
type QuestType = "DAILY" | "WEEKLY" | "ALL";
type QuestRequirementType = "BATTLE_WIN" | "SUMMON" | "CARD_LEVEL_UP" | "LOGIN";

interface QuestReward { gold?: number; gems?: number; exp?: number; }

interface QuestConfig {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  requirementType: QuestRequirementType;
  targetCount: number;
  reward: QuestReward;
}

interface ProgressRewardConfig {
  id: string;
  type: QuestType;
  requiredCompletedCount: number;
  reward: QuestReward;
}
```

Suggested Unity port — two ScriptableObject definitions (static config, authored in the editor, equivalent to the JSON files) plus one plain serializable save-state class (runtime/save data):

```csharp
public enum QuestType { Daily, Weekly, AllTime }
public enum QuestRequirementType { BattleWin, Summon, CardLevelUp, Login }

[System.Serializable]
public struct QuestReward {
    public int gold;   // 0 = not granted
    public int gems;
    public int exp;
}

[CreateAssetMenu(menuName = "Riftgard/Quest/Quest Definition")]
public class QuestDefinition : ScriptableObject {
    public string id;              // stable string id, e.g. "daily_battle_1"
    public QuestType type;
    public string title;
    public string description;
    public QuestRequirementType requirementType;
    public int targetCount;
    public QuestReward reward;
}

[CreateAssetMenu(menuName = "Riftgard/Quest/Progress Reward Definition")]
public class ProgressRewardDefinition : ScriptableObject {
    public string id;              // e.g. "daily_prog_3"
    public QuestType type;
    public int requiredCompletedCount; // number of quests of this `type` that must be completed
    public QuestReward reward;
}

// Recommend a QuestDatabase ScriptableObject holding QuestDefinition[] and
// ProgressRewardDefinition[] arrays, analogous to the single quests.json file.

[System.Serializable]
public class QuestSaveState {
    public SerializableDictionary<string,int> progress = new();       // questId -> current count
    public List<string> claimedQuestIds = new();
    public List<string> claimedProgressRewardIds = new();
    public long lastDailyResetUnixMs;
    public long lastWeeklyResetUnixMs;
}
```

This mirrors the Redux slice `QuestState` exactly (`src/store/slices/questSlice.ts:5-11`):
```ts
interface QuestState {
  progress: Record<string, number>;
  claimedQuests: string[];
  claimedProgressRewards: string[];
  lastDailyReset: number; // ms epoch
  lastWeeklyReset: number; // ms epoch
}
```

## UI Layout

Single full-screen view (`QuestScreen.tsx`), parchment/paper background theme, no sub-navigation beyond its own tab bar.

- **Tab bar** (top): 3 tabs — `DAILY`, `WEEKLY`, `ACHIEVEMENTS` (this label maps to the `"ALL"` quest type internally). Active tab styled dark navy pill with gold text; inactive tabs are plain gray text. (`QuestScreen.tsx:24-28, 84-102`)
- **Reset subtitle**: a clock icon + static text `"Resets in: 14h 23m"` directly under the tabs. **This value never changes** — see Behavior & Logic below. (`QuestScreen.tsx:104-107`)
- **Milestone / Progress Rewards bar** (dark card, only rendered if the active tab has any `progressRewards` entries — Achievements tab has none, so this section is hidden there):
  - Title: "Daily Milestones" / "Weekly Milestones" / "Milestones". (`QuestScreen.tsx:114-120`)
  - A horizontal progress track filled proportionally to `completedCount / maxProgressNeeded`.
  - One circular "chest" node per progress-reward threshold, positioned along the track at `(requiredCompletedCount / maxProgressNeeded) * 100`%. Node states: locked (grayscale, dim), unlocked-unclaimed (purple glow, pulsing, tappable), claimed (dim, checkmark). Label under each node: "Complete N Quests". (`QuestScreen.tsx:133-186`)
- **Quest list** (scrollable, below the milestone bar): one row per quest in the active tab, each row has:
  - Icon (emoji placeholder, no real art asset) keyed off `requirementType`: `BATTLE_WIN` → ⚔️, `SUMMON` → 🌪️, `LOGIN` → 💰, everything else (i.e. `CARD_LEVEL_UP`) → 🐉. (`QuestScreen.tsx:222-228`)
  - Title + description text.
  - A pill-shaped progress bar showing `current/target` as both a fill and a text overlay.
  - Reward summary chips (gold 🪙 / gems 💎 amounts, only shown if present on that quest).
  - Action button: `GO` (progress incomplete, disabled/no-op tap), `CLAIM` (progress complete, tappable, highlighted gold), or `CLAIMED` (already claimed, disabled, grayed with a checkmark). (`QuestScreen.tsx:291-311`)
  - Claimed quests render the whole row desaturated/grayed. (`QuestScreen.tsx:208-213`)
- **Hidden dev-only control**: a nearly invisible 16×16px transparent circular button in the very top-right corner of the header (`QuestScreen.tsx:76-82`) — see Behavior & Logic, flagged for omission.

## Behavior & Logic

### Progress tracking (event-driven, global fan-out)

There is **one** Redux action, `updateQuestProgress({ type, amount })`, that any screen dispatches when a trackable action happens. The reducer does **not** target a single quest — it scans the entire quest config and increments **every** quest whose `requirementType` matches, regardless of which tab (Daily/Weekly/Achievements) it belongs to (`questSlice.ts:28-48`). This means one gameplay event can advance up to 4 quests simultaneously (e.g. one battle win advances `daily_battle_1`, `daily_battle_3`, `weekly_battle_10`, and `all_battle_100` all at once).

```pseudocode
function updateQuestProgress(requirementType, amount):
    for each quest in QuestConfig where quest.requirementType == requirementType:
        progress[quest.id] = (progress[quest.id] ?? 0) + amount
        progress[quest.id] = min(progress[quest.id], quest.targetCount)  # clamp, no overflow
```

**Trigger call sites** (exact origin of each requirement type — port these hooks 1:1 into the Unity equivalent systems):

| Requirement type | Triggered from | Amount | Condition |
|---|---|---|---|
| `LOGIN` | App root mount, `src/pages/index.tsx:37-38` | 1 | Fires once every time the app/root screen mounts (i.e., effectively "session start" / app launch or full page reload) — not a true once-per-day guard by itself; the daily-reset + cap-at-target logic is what prevents it from over-counting within the same day. |
| `BATTLE_WIN` | End of a 3v3 battle, `src/components/battle/BattlePhaseNew.tsx:115` | 1 | Only when the player's score beats the opponent's score (a win, not a draw/loss). See [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md). |
| `SUMMON` | After a gacha pull resolves, `src/components/features/gacha/RateUpSummon/RateUpSummonSection.tsx:87` | `count` (1 or 10, matching the pull size) | Fires once per summon action, not per card pulled within a 10-pull — amount is the pull count itself. See [14-gacha-mechanics-rates-pity.md](14-gacha-mechanics-rates-pity.md). |
| `CARD_LEVEL_UP` | Card leveling confirmation, `src/components/features/collection/LevelUpScreen.tsx:259` | 1 | Fires once per level-up **action**, only if `levelsGained > 0` — i.e. leveling a card up multiple levels in one action still only counts as 1 toward this quest, not N. |

Also note `checkResets()` is dispatched from the exact same effect as the `LOGIN` progress update (`src/pages/index.tsx:36-39`), and only runs once on app mount — there is no polling/interval; resets are only evaluated when the app (re)loads.

### Claim flow

Two independent claim actions, both purely additive (idempotent — claiming twice is a no-op the second time because the reducer checks `includes()` first):

```pseudocode
# Per-quest claim (only enabled in UI when progress[quest.id] >= quest.targetCount)
on CLAIM tapped for quest:
    if quest.id not in claimedQuests: claimedQuests.push(quest.id)
    grant reward (gold/gems/exp) to player currencies   # separate dispatch, addRewards()

# Milestone claim (only enabled when completedCount >= rewardItem.requiredCompletedCount)
on chest tapped for progressReward:
    if rewardItem.id not in claimedProgressRewards: claimedProgressRewards.push(rewardItem.id)
    grant reward (gold/gems/exp) to player currencies
```

`completedCount` for the active tab = number of quests in that tab where `progress[quest.id] >= quest.targetCount` (this counts *completed*, not *claimed* — a quest still counts toward the milestone bar even before its own reward is claimed). `maxProgressNeeded` = the highest `requiredCompletedCount` among that tab's progress rewards (defaults to 1 if the tab has none, to avoid divide-by-zero). (`QuestScreen.tsx:38-46`)

Reward granting is a second, separate dispatch to the player-currency store (`addRewards(reward)`, from `playerSlice`) fired immediately alongside the claim dispatch — see [08-player-progression-currencies.md](08-player-progression-currencies.md) for the currency-grant contract.

### Daily reset (evaluated once, on app load)

```pseudocode
function checkDailyReset(now, lastDailyReset):
    last = dateFromEpoch(lastDailyReset)
    if now.day != last.day OR now.month != last.month OR now.year != last.year:
        for each quest where quest.type == "DAILY":
            progress[quest.id] = 0
            claimedQuests.remove(quest.id)
        for each progressReward where progressReward.type == "DAILY":
            claimedProgressRewards.remove(progressReward.id)
        lastDailyReset = now
```
This is a **local-midnight rollover check** — it compares calendar date components in the device's local timezone, not a rolling 24-hour timer. If the app isn't opened for several days, the very next app-open still only performs a single reset (progress is zeroed once, not once per missed day). (`questSlice.ts:59-90`)

### Weekly reset (evaluated once, on app load, alongside the daily check)

```pseudocode
function checkWeeklyReset(now, lastWeeklyReset):
    daysDiff = (now - lastWeeklyReset) / (1 day in ms)
    currentDay = now.dayOfWeek   # 0=Sunday..6=Saturday
    lastDay = lastWeeklyReset.dayOfWeek

    needsReset = false
    if daysDiff >= 7:
        needsReset = true
    else if currentDay < lastDay AND daysDiff > 0:
        needsReset = true   # calendar week rolled over a Sunday boundary

    if needsReset:
        for each quest where quest.type == "WEEKLY":
            progress[quest.id] = 0
            claimedQuests.remove(quest.id)
        for each progressReward where progressReward.type == "WEEKLY":
            claimedProgressRewards.remove(progressReward.id)
        lastWeeklyReset = now
```
Two independent trigger conditions, either one resets: (a) a full 7 days have elapsed since the last reset, OR (b) the day-of-week index went "backwards" (e.g. last check was Friday=5, this check is Monday=1 → `1 < 5`), which is the code's proxy for "we crossed a Sunday". This is intentionally approximate — it does not use ISO week numbers, and it can behave oddly if the device clock is changed or the app is opened less than once a week straddling exactly one Sunday vs. more than one. (`questSlice.ts:92-129`)

The **Achievements** tab (`type: "ALL"`) is never reset by any logic — it is a permanent, lifetime-progress tab.

## Numbers & Formulas

### Quests (`src/config/quests.json:2-102`)

| id | Tab | Title | Requirement | Target | Reward |
|---|---|---|---|---|---|
| `daily_login_1` | DAILY | Daily Supporter | LOGIN | 1 | 50 gold, 10 exp |
| `daily_battle_1` | DAILY | Sparring Partner | BATTLE_WIN | 1 | 100 gold, 20 exp |
| `daily_battle_3` | DAILY | Arena Challenger | BATTLE_WIN | 3 | 200 gold, 10 gems, 50 exp |
| `daily_summon_1` | DAILY | Seeker of Heroes | SUMMON | 1 | 20 gems, 30 exp |
| `daily_level_1` | DAILY | Training regimen | CARD_LEVEL_UP | 1 | 150 gold, 25 exp |
| `weekly_battle_10` | WEEKLY | Weekly Warrior | BATTLE_WIN | 10 | 500 gold, 50 gems, 200 exp |
| `weekly_summon_5` | WEEKLY | Astra's Favorite | SUMMON | 5 | 100 gems, 150 exp |
| `all_battle_100` | ALL (Achievements) | Centurion | BATTLE_WIN | 100 | 5000 gold, 500 gems, 1000 exp |

### Progress / Milestone rewards (`src/config/quests.json:103-132`)

| id | Tab | Required completed count | Reward |
|---|---|---|---|
| `daily_prog_3` | DAILY | 3 | 300 gold, 30 gems |
| `daily_prog_5` | DAILY | 5 | 500 gold, 50 gems, 100 exp |
| `weekly_prog_2` | WEEKLY | 2 | 1500 gold, 150 gems |

Achievements tab has **no** progress-reward track (the milestone bar UI is not rendered there).

### Progress bar fill formula

```
fillPercent = min(100, (completedCountForTab / maxRequiredCompletedCountForTab) * 100)
```

## Assets Used

- `public/assets/icons/quest.webp` — bottom-nav icon for the Quests tab (`src/components/BottomNav.tsx:35`).
- No dedicated per-quest icon art exists; requirement-type icons in the quest list are plain emoji glyphs (⚔️ 🌪️ 💰 🐉) rendered as text, not sprites. Recommend replacing with real icon sprites in the Unity port (see [24-asset-inventory.md](24-asset-inventory.md) for candidates such as `icons/battle.webp`, `icons/tornado.webp`, `icons/gold-coin.webp`).
- `public/assets/icons/gem.webp`, `public/assets/icons/gold-coin.webp` — real currency icon assets exist in the general icon set but the quest screen currently uses emoji (💎 🪙) instead of these image assets; use the real assets in the Unity port for visual consistency with the rest of the UI.
- Reward-node "chest" graphics are CSS-styled colored boxes with an emoji (🎁 / ✔️), not real chest art, despite chest art existing elsewhere in the project (`public/assets/chest-closed-clean.png`, `public/assets/chest-open-clean.png` at the asset root) — recommend using those real chest sprites for milestone nodes in the port.

## Cross-References

- [07-data-model-cards-rarity.md](07-data-model-cards-rarity.md)
- [08-player-progression-currencies.md](08-player-progression-currencies.md) — currency-grant contract (`addRewards`) used by both claim flows.
- [09-save-persistence-system.md](09-save-persistence-system.md) — how `QuestState` (progress/claims/reset timestamps) is persisted and rehydrated.
- [19-battle-engine-mechanics.md](19-battle-engine-mechanics.md) — source of the `BATTLE_WIN` trigger.
- [14-gacha-mechanics-rates-pity.md](14-gacha-mechanics-rates-pity.md) — source of the `SUMMON` trigger.

## Unity Porting Notes

- **Omit the "Secret Reset Button"**: a nearly-invisible 16×16px transparent button in the top-right of the Quest screen header (`QuestScreen.tsx:58-67, 76-82`) that calls `window.confirm(...)` then `localStorage.clear()` + full page reload, wiping the entire save. This is a leftover developer debug tool, not a real feature — do not port it into the shipped Unity build. If a "reset save" debug tool is wanted for QA builds, gate it behind a proper debug-menu / build flag, not a hidden UI element in the live Quests screen.
- **The "Resets in: 14h 23m" label is a hardcoded string**, not a computed countdown (`QuestScreen.tsx:106`). It never changes regardless of real time remaining. In the Unity port, implement a real countdown: compute seconds-until-next-local-midnight for the Daily tab, and seconds-until-next-Sunday-local-midnight for the Weekly tab, and update it live (e.g. once per second or once per frame-tick via a coroutine) while the Quests screen is open.
- Recommend evaluating resets **every time the Quests screen (or app) becomes active/foregrounded**, not just once at cold boot — the original only checks on the root page's mount effect, meaning a session that stays open across a real-world midnight will show stale "still incomplete" dailies until the next full reload. A Unity `GameManager` should re-run `CheckResets()` on `OnApplicationFocus(true)` / app-resume in addition to boot.
- Preserve the "any quest with matching requirement type advances" fan-out behavior — it's simple and works well as an `event bus` / `Action<QuestRequirementType,int>` broadcast that the quest system subscribes to, decoupled from whichever gameplay system raises it (battle, gacha, leveling, login).
- The reward-claim step is two separate operations in the source (mark claimed, then grant currency) dispatched together from the UI layer; keep them as two decoupled calls in Unity too (`QuestManager.ClaimQuest(id)` marking state, then `CurrencyManager.Grant(reward)`), so quest-claim state and currency-grant logic stay independently testable.
- Use a `Dictionary<string,int>` (or a serializable wrapper) for `progress`, and `HashSet<string>` for `claimedQuestIds` / `claimedProgressRewardIds` for O(1) contains-checks, matching the array `.includes()` idempotency guards in the source.
