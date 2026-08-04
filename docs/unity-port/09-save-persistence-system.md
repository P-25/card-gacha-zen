# Save & Persistence System

## Purpose / Overview

This document describes exactly what game state is persisted, how it is encrypted, the load ("hydration") sequence and why its ordering matters, the save-migration/backfill logic that repairs old save shapes, and recommended Unity-native equivalents. This is a browser-based (localStorage) persistence model; the Unity port will need a different storage backend but should preserve the same data boundaries and migration discipline.

Source files read in full:
- `src/store/store.ts`
- `src/lib/storage.ts`
- `src/components/ReduxProvider.tsx`
- `src/store/slices/playerSlice.ts` (for the `setPlayerState` migration reducer)
- `src/store/slices/pitySlice.ts`
- `src/store/slices/settingsSlice.ts`
- `src/store/slices/questSlice.ts`

## Data Model (full schema tables + suggested C# class)

### What gets persisted — exact list of state slices/keys

The Redux store has exactly 4 top-level slices, and **all 4, in full, are persisted on every single dispatched action** (see Behavior section for why "every action" matters). Each slice is saved under its own independent localStorage key:

| localStorage key | Redux slice | Slice shape | Source |
|---|---|---|---|
| `"player_state"` | `player` | `PlayerState` (see doc 08 — gems, gold, inventory, level, experience, name, tag, activeProfilePicId, unlockedProfilePicIds, battleTier, lastSeenLevel) | `store.ts:14`, `playerSlice.ts:5-20` |
| `"pity_state"` | `pity` | `{ [bannerId: string]: PlayerPityState }` where `PlayerPityState = { pullsSinceLastRare: number }` — a dictionary keyed by gacha banner id, one pity counter object per banner | `store.ts:15`, `pitySlice.ts:5-9`, `src/types/game.ts:60-63` |
| `"settings_state"` | `settings` | `{ isBgmMuted: boolean, isSfxMuted: boolean }` | `store.ts:16`, `settingsSlice.ts:3-6` |
| `"quest_state"` | `quest` | `{ progress: Record<string, number>, claimedQuests: string[], claimedProgressRewards: string[], lastDailyReset: number (ms timestamp), lastWeeklyReset: number (ms timestamp) }` | `store.ts:17`, `questSlice.ts:5-11` |

Nothing else is persisted — there is no separate "settings.json" or account/auth data; this is a fully local, single-profile save system (no cloud save, no multiple save slots visible in this code).

### Suggested Unity-native save schema

```csharp
[System.Serializable]
public class SaveData
{
    public int saveVersion = 1;          // NEW: not present in JS source — see Migration notes below
    public PlayerState player;
    public Dictionary<string, PityState> pity = new(); // bannerId -> PityState
    public SettingsState settings;
    public QuestState quest;
}

[System.Serializable]
public class PityState
{
    public int pullsSinceLastRare;
}

[System.Serializable]
public class SettingsState
{
    public bool isBgmMuted;
    public bool isSfxMuted;
}

[System.Serializable]
public class QuestState
{
    public Dictionary<string, int> progress = new();       // questId -> current count
    public List<string> claimedQuests = new();
    public List<string> claimedProgressRewards = new();
    public long lastDailyReset;   // store as Unix ms or ticks, matching JS Date.now() semantics
    public long lastWeeklyReset;
}
```

Recommend serializing as **one combined JSON file** rather than 4 separate localStorage-style keys (see Unity Porting Notes) — the "4 independent keys" split is an artifact of how the JS persistence middleware happens to iterate slices, not a meaningful architectural boundary worth preserving 1:1.

## Behavior & Logic (step-by-step, exact formulas/conditions)

### Save (write) path

`src/store/store.ts:9-20` — a Redux middleware, `persistenceMiddleware`:

```
on EVERY dispatched action (any action, from any slice):
    1. let the action run through the reducers first (next(action))
    2. read the FULL current state tree
    3. saveSecureData("player_state", state.player)
    4. saveSecureData("pity_state",   state.pity)
    5. saveSecureData("settings_state", state.settings)
    6. saveSecureData("quest_state",  state.quest)
```

This means: there is no explicit "Save Game" action, no debounce, and no dirty-checking — literally every single Redux action (a gold spend, a card level-up, a quest progress tick, a settings toggle) triggers a full re-save of **all 4 slices**, not just the slice that actually changed. This is simple but means write frequency scales with total game action frequency; on Unity this pattern would translate to "save after every state mutation," which may be too aggressive for a file-based save (vs. localStorage, which is cheap) — see Unity Porting Notes.

### Encryption approach — `src/lib/storage.ts`

- Library: `crypto-js` (`^4.2.0`, per `package.json`), specifically `CryptoJS.AES`.
- Key: `process.env.NEXT_PUBLIC_ENCRYPTION_KEY`, falling back to the **hardcoded literal string `"default-secret-key-change-me"`** if the env var is unset (`storage.ts:4-5`). No `.env` file defining this variable exists in the repo at the time of this audit — meaning **in practice, the fallback hardcoded key is what's actually used** unless a deployment environment sets it externally (e.g. in a hosting provider's dashboard).
- Save (`saveSecureData(key, data)`, `storage.ts:12-22`):
  ```
  jsonString = JSON.stringify(data)
  encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString()
  localStorage.setItem(key, encrypted)   // only if window is defined (SSR guard)
  ```
- Load (`loadSecureData<T>(key)`, `storage.ts:29-46`):
  ```
  encrypted = localStorage.getItem(key)
  if not encrypted: return null
  bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
  decrypted = bytes.toString(CryptoJS.enc.Utf8)
  if not decrypted: return null   // wrong key / corrupted data decrypts to empty string, not an exception
  return JSON.parse(decrypted)
  ```
  Any error (bad JSON, decrypt failure) is caught and logged to console, returning `null` — the caller (`hydrateStore`) then simply skips dispatching for that slice and the slice's Redux `initialState` remains in effect, i.e. **corrupted/undecryptable save data silently resets that slice to defaults rather than crashing the app.**

**Why this is tamper-resistance, not real security**:
1. The encryption key ships in the client bundle — `NEXT_PUBLIC_*` env vars in Next.js are, by design, inlined into the JavaScript sent to the browser at build time. Anyone can extract the key from browser devtools / the built JS bundle.
2. Even without extracting the key, the fallback literal `"default-secret-key-change-me"` is public (it's in this open-source-readable file) and is almost certainly the key actually in effect for any build that didn't bother setting the env var.
3. AES here is being used purely to obscure localStorage contents from a casual player poking around in browser devtools (Application → Local Storage) trying to hand-edit their gold/gems — it does nothing to stop a determined player who can read the client-side JS and derive the key, since the encryption and decryption both happen entirely client-side with a key the client itself possesses.
4. There is no server-side validation of save data anywhere in this codebase (no backend calls visible in the read files) — the client is fully trusted, so encryption here is best understood as "raise the effort bar above trivially editing plaintext JSON," not a cheat-prevention mechanism.

### Hydrate-on-load flow and why order matters

`src/components/ReduxProvider.tsx:14-18`:
```
useEffect (runs once, on client mount only):
    hydrateStore()
    setIsHydrated(true)
if not isHydrated: render nothing (return null)
render <Provider store={store}>{children}</Provider>
```
So the entire React tree is withheld from rendering until hydration completes — this prevents any component from reading/dispatching against the Redux store before saved data has been loaded in.

`src/store/store.ts:34-55` — `hydrateStore()`:
```
1. Load ALL 4 slices from storage FIRST, into local variables (savedPlayer, savedPity, savedSettings, savedQuest) — none are dispatched yet.
2. THEN dispatch setPlayerState(savedPlayer)   if savedPlayer exists
3. THEN dispatch setPityState(savedPity)       if savedPity exists
4. THEN dispatch setSettingsState(savedSettings) if savedSettings exists   [action is setSettings]
5. THEN dispatch setQuestState(savedQuest)     if savedQuest exists
```

**Why order matters (per the source code's own comment, `store.ts:35-37`):** *"Load everything from local storage FIRST before dispatching any actions. Because our persistence middleware triggers on ANY action and saves ALL state slices, we must ensure that no slice is prematurely overwritten with its initialState before it is loaded."* Concretely: the `persistenceMiddleware` re-saves **all 4 slices** after every single dispatch — including the hydration dispatches themselves. If, hypothetically, `setPlayerState` were dispatched (triggering a save of all 4 slices, including whatever `pity`/`settings`/`quest` currently hold, which at that point would still be their untouched Redux `initialState` defaults) *before* `savedPity`/`savedSettings`/`savedQuest` had been read from storage into local variables, the act of loading player data would clobber the not-yet-loaded other slices' saved data with their defaults. By reading **all 4 raw values from storage into local variables first**, then dispatching all 4 `set*State` actions, the middleware's incidental full-state re-save on step 2's dispatch will already have the correct (still Redux-default, about to be overwritten in step 3) values queued to be replaced in the following steps — actually, more precisely: reading all 4 into locals first means each dispatch always has the *next* correct value ready to hydrate, so by the time all 4 dispatches complete, every slice holds its true saved value, and each intermediate re-save (while momentarily inconsistent) is harmless because it will be corrected by the very next dispatch, and the *final* state after all 4 dispatches is fully correct and gets saved correctly on the 4th dispatch's middleware pass.

### Migration / backfill logic for old saves

Only the `player` slice has explicit migration logic, inside its own `setPlayerState` reducer (not a separate migration step) — `playerSlice.ts:41-79`:

```
setPlayerState(loadedState):
    1. Inventory instanceId sanitation:
       - track a Set of seen instanceIds
       - for each card in loadedState.inventory:
           if card.instanceId is missing OR already seen (duplicate):
               generate a new instanceId = Math.random().toString(36).substr(2, 9)
           mark instanceId as seen
       - this guarantees every card in the loaded inventory has a UNIQUE, non-empty instanceId,
         even if the save file predates instanceIds existing at all, or has a duplication bug
    2. Field backfill (for saves from before these fields existed):
       - if level is undefined       -> level = 1
       - if experience is undefined  -> experience = 0
       - if lastSeenLevel is undefined -> lastSeenLevel = level (the now-resolved level, not hardcoded 1)
       - if name is falsy            -> name = "Trainer"
       - if tag is falsy             -> tag = "#1234"
       - if activeProfilePicId is falsy -> activeProfilePicId = "default_1"
       - if unlockedProfilePicIds is falsy -> unlockedProfilePicIds = ["default_1"]
       - if battleTier is falsy      -> battleTier = 1
    3. return the fully-backfilled newState as the new player slice state
```

Note the `unlockProfilePicIds`/`battleTier`/`name`/`tag`/`activeProfilePicId` checks use **falsy** checks (`if (!newState.name)`), not `undefined` checks, meaning an explicit `0`, `""`, `null`, or `false` value would also be overwritten by the default — for `battleTier` specifically this means a save with `battleTier: 0` would be silently bumped to `1` (relevant since `0` is not a semantically valid tier in this game anyway, so likely harmless, but worth flagging for exact-fidelity porting).

The `pity`, `settings`, and `quest` slices have **no migration/backfill logic at all** — their `set*State` reducers are pure `return action.payload` overwrites (`pitySlice.ts:15-17`, `settingsSlice.ts:23-25`) or a shallow-merge-with-defaults (`questSlice.ts:25-27`: `return { ...initialState, ...action.payload }`, which does provide a basic top-level-key backfill for quest state, but with no per-field validation like the player slice has).

## Numbers & Formulas (table of every constant/formula found)

| Constant / Item | Value | Source |
|---|---|---|
| localStorage keys used | `player_state`, `pity_state`, `settings_state`, `quest_state` (4 total) | `store.ts:14-17` |
| Encryption algorithm | AES (via crypto-js `CryptoJS.AES.encrypt`/`decrypt`) | `storage.ts:15, 36` |
| Encryption key env var | `NEXT_PUBLIC_ENCRYPTION_KEY` | `storage.ts:4` |
| Encryption key fallback (hardcoded) | `"default-secret-key-change-me"` | `storage.ts:5` |
| instanceId generation | `Math.random().toString(36).substr(2, 9)` (used identically in `setPlayerState` sanitation and `addCardToInventory`) | `playerSlice.ts:52, 100` |
| Save trigger frequency | Every single dispatched Redux action (all 4 slices re-saved each time) | `store.ts:9-20` |
| Save/load failure behavior | Caught, logged to console, returns `null`/no-op — never throws to caller | `storage.ts:19-21, 42-45` |

## Cross-References

- 08-player-progression-currencies.md — full `PlayerState` schema and the exact migration/backfill defaults applied on load
- 07-data-model-cards-rarity.md — `Card`/`instanceId` schema referenced by the inventory-sanitation migration step
- 01-app-shell-and-state-management.md — where `ReduxProvider` fits into the overall app shell/mount sequence
- 14-gacha-mechanics-rates-pity.md — consumer of the `pity_state` slice (per-banner pull counters)

## Unity Porting Notes

- **PlayerPrefs is not a safe analog for this system.** Unity's `PlayerPrefs` is unencrypted by default, has no structured-object support (it's flat key/value, string/int/float only), and on some platforms (WebGL) is itself just a browser localStorage wrapper with the same caveats as this JS implementation. Recommend instead: serialize the full `SaveData` object (see Data Model above) to JSON via `JsonUtility` or a library like `Newtonsoft.Json`, then write it to a file under `Application.persistentDataPath` (this is the standard cross-platform sandboxed-per-app save location on iOS/Android/Desktop).
- **Encryption choice**: if porting the "obscure it from casual save-editing" goal (not real anti-cheat), AES via a built-in `System.Security.Cryptography.Aes` class is a reasonable equivalent to `crypto-js`. **Critically, do not ship the encryption key as a plain constant in a client-visible config file or a `NEXT_PUBLIC`-style env var equivalent** — on Unity there's no meaningful difference between "public env var" and "hardcoded string," both end up in the shipped build and can be extracted via decompilation (e.g. via a tool that reads `Assembly-CSharp.dll` or Il2Cpp string dumps) about as easily as the current JS version can be read from browser devtools. If real save-tamper resistance matters for this game (e.g. to prevent gold/gem/inventory editing before a future server-authoritative model exists), treat this as explicitly out of scope for local-only encryption — a determined player can always extract an embedded key from a client binary. Communicate this limitation to the game designer the same way this doc flags it for the JS version, rather than let "AES-encrypted" imply a false sense of security.
- **Mobile app sandboxing consideration**: since this is described as a mobile card-gacha-battler, note that both iOS and Android already sandbox `Application.persistentDataPath` per-app (not directly player-editable without jailbreak/root/USB debugging tools), which is actually a *stronger* real-world barrier against casual tampering than encrypting localStorage in a browser — browser localStorage is trivially visible via devtools on any desktop browser, whereas a mobile app's private storage directory requires more effort to access at all. This means the Unity port may get adequate "casual tamper resistance" for free from platform sandboxing alone, and could deprioritize the encryption layer if development time is constrained, while still keeping it as a defense-in-depth nice-to-have.
- **Rethink "save everything on every action."** The JS pattern (re-save all 4 slices on every single dispatch) is simple but wasteful; for a file-based mobile save it's worth batching (e.g. save on scene transitions, app pause/background/quit via `OnApplicationPause`/`OnApplicationQuit`, and/or a debounced timer after any mutation) rather than a synchronous full-state file write on every minor state change, both for I/O performance and to reduce flash storage wear on some platforms.
- **Preserve the "load all, then apply all" hydration order** as a discipline even if the Unity save is a single combined file (where the specific JS clobbering risk mostly disappears since one file read naturally returns everything atomically) — the underlying principle (don't let a partial/incremental apply of loaded data trigger an intermediate save of not-yet-loaded slices) is good practice to carry forward if the save system is ever split into multiple files or async-loaded pieces (e.g. streaming a large inventory list separately from core player state).
- **Explicitly design a save-version field from the start** (`SaveData.saveVersion` in the suggested C# above) — the JS source has **no version field at all**; its migration strategy is purely ad-hoc `if (field === undefined)` per-field patching inside `setPlayerState`, and only for the `player` slice (pity/settings/quest have no migration at all, just raw overwrite or shallow merge). This works for the JS game's incremental field additions so far but is fragile and doesn't scale to larger schema changes (e.g. renaming a field, changing a field's type, restructuring inventory). Recommend the Unity port use an explicit integer save-version + a chain of versioned migration functions (`MigrateV1ToV2`, `MigrateV2ToV3`, ...) applied in sequence on load, which is far more maintainable long-term than scattered undefined-checks.
- **Match the "corrupt save silently resets to defaults, never crashes" behavior deliberately** — it's a reasonable UX choice (a mobile game shouldn't hard-crash on a corrupted save) but should be a conscious design decision in the Unity port too, ideally paired with either a backup/previous-save fallback or at minimum a non-intrusive "your save could not be loaded" notice, rather than silently and invisibly resetting a player's progress to zero the way the current JS implementation does.
