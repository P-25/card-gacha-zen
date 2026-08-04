# Audio System

## Purpose / Overview

Riftgard has two independent audio paths with no shared audio manager: (1) a single looping background-music track that plays globally across the whole app, and (2) a small set of one-shot sound effects (SFX) fired ad-hoc from individual UI components via a shared hook. Both paths are gated by their own mute flag in Settings. There is no music ducking, no per-screen music tracks, no audio mixer/bus setup, and no volume sliders (only binary mute toggles) in the source.

Source: `src/components/BackgroundMusic.tsx`, `src/hooks/useSound.ts`, `src/store/slices/settingsSlice.ts`, `src/components/SettingsScreen.tsx`.

## Data Model (schema; suggested C# shape)

Original state is just two booleans in the Redux `settings` slice (`src/store/slices/settingsSlice.ts:1-11`):

```ts
interface SettingsState {
  isBgmMuted: boolean; // default false
  isSfxMuted: boolean; // default false
}
```

Suggested Unity port — a small `AudioManager` singleton (MonoBehaviour, `DontDestroyOnLoad`) owning one `AudioSource` for music and a pooled/one-shot player for SFX, plus a `SoundLibrary` ScriptableObject mapping logical cue names to `AudioClip`s:

```csharp
[CreateAssetMenu(menuName = "Riftgard/Audio/Sound Library")]
public class SoundLibrary : ScriptableObject {
    public AudioClip backgroundMusic;      // wind_bg.mp3 equivalent
    public AudioClip click;
    public AudioClip summonLoop;           // played during the summon animation, stopped manually
    public AudioClip cardReveal;
    public AudioClip rareCardReveal;
}

public class AudioManager : MonoBehaviour {
    public static AudioManager Instance { get; private set; }
    [SerializeField] AudioSource musicSource;   // loop = true, volume = 0.3
    [SerializeField] AudioSource sfxSource;     // PlayOneShot for most SFX
    [SerializeField] AudioSource summonSource;  // dedicated source: needs Stop() support mid-loop
    public bool IsBgmMuted { get; private set; }
    public bool IsSfxMuted { get; private set; }
    // PlayClick(), PlaySummon(), StopSummon(), PlayRevealCard(bool isRare)
}
```

## UI Layout

Audio has no dedicated screen of its own; its only UI surface is two toggle rows in **Settings** (`src/components/SettingsScreen.tsx:37-132`, see [05-settings-screen.md](05-settings-screen.md)):
- "Music" row — icon swaps between muted/unmuted speaker glyph based on `isBgmMuted`; `Toggle` control bound to `checked={!isBgmMuted}`, `onChange` dispatches `toggleBgmMute()`.
- "Sound Effects" row — same pattern, bound to `isSfxMuted` / `toggleSfxMute()`.

Every other screen is a silent consumer: it calls the shared `useSound()` hook's functions on interaction, with no visible audio UI of its own.

## Behavior & Logic

### Background music (`BackgroundMusic.tsx`)

A single non-visual component mounted once near the app root. Behavior on mount and on every route change:

```pseudocode
on mount / route change / isBgmMuted change:
    if audio element not yet created:
        create Audio("/assets/sound/wind_bg.mp3")
        set loop = true
        set volume = 0.3

    if currentRoute in blockedRoutes (currently EMPTY — no routes are blocked) OR isBgmMuted:
        pause audio
        return

    try:
        play audio   # browser may reject this if no user gesture has happened yet
    catch (autoplay rejected):
        # do nothing yet; wait for the fallback below
        log "Autoplay blocked, waiting for interaction"

# Fallback for browser autoplay restrictions:
on first global click OR keydown anywhere in the app:
    if music is not currently playing AND route is not blocked AND not muted:
        retry play()
```
(`BackgroundMusic.tsx:16-65`)

Key details for the port:
- **One track only** — `wind_bg.mp3`, looped, volume fixed at `0.3` (not user-adjustable, only mute/unmute).
- **`blockedRoutes` is an empty array in the shipped code** — the mechanism for silencing music on specific screens exists but is unused; every screen currently plays the same music.
- **Autoplay-with-fallback pattern**: attempts to play immediately; if the browser blocks autoplay (no prior user gesture), it silently waits and retries on the very next click or keydown anywhere on the page. This is a browser-only concern — Unity does not have this restriction, so the Unity `AudioManager` can simply play on scene start / game boot without needing an interaction-gated fallback. Still worth preserving the *intent* (music should start as soon as possible, and definitely no later than the first player input) in case of platform-specific autoplay policies (e.g. some WebGL or mobile-browser wrapper contexts).
- Re-evaluated whenever the mute flag or route changes (it does **not** re-evaluate on an interval/timer).

### Sound effects (`useSound.ts`)

A shared hook, not a component — any UI component calls its functions directly in an `onClick`/event handler. Every call is a **fire-and-forget new `Audio` instance** except `playSummon`, which reuses one module-level singleton instance so it can be explicitly stopped mid-playback.

| Function | Sound file | Volume | Behavior |
|---|---|---|---|
| `playClick()` | `/assets/sound/sfx/click.mp3` | 0.3 | New `Audio` instance every call; fire-and-forget, not stoppable. |
| `playSummon()` | `/assets/sound/sfx/summon.mp3` | 0.2 | Reuses one lazily-created module-level `Audio` instance; resets `currentTime = 0` and replays on every call (so repeated calls restart it rather than overlapping instances). |
| `stopSummon()` | — | — | Pauses the shared summon instance and resets `currentTime = 0`. Called when the summon reveal sequence finishes/is dismissed. |
| `playRevealCard(isRare)` | `/assets/sound/sfx/rare-card-reveal.mp3` if `isRare`, else `/assets/sound/sfx/card-reveal.mp3` | 0.2 | New `Audio` instance every call. |

All four are individually gated by `isSfxMuted` at the top of the function (early-return, no sound object even created if muted) (`useSound.ts:12-51`).

**"Click sound on every button" convention**: `playClick()` is wired into essentially every interactive button across the app, not just literal "Click"-styled buttons — confirmed call sites include the shared button primitives (`SecondaryButton`, `PrimaryButton`, `CommonButton`, `EventButton`, `SpecialButton` in `src/components/ui/buttons/`), navigation (`BottomNav.tsx`, `BackButtonTopBar.tsx`, `MenuButton.tsx`), and numerous screen-specific actions (`SettingsScreen.tsx`, `CollectionScreen.tsx`, `BattleScreen.tsx`, `CardDetailModal.tsx`, `CardInfoModal.tsx`, `LevelUpScreen.tsx`, `LevelUpAnimation.tsx`, `RateUpSummonSection.tsx`, `SummonResults.tsx`, `CardReveal.tsx`). Treat this as a global rule for the Unity port: **any tappable UI control should play the click SFX on press**, ideally centralized (e.g. a shared `UIButton` base class/component that plays the click cue automatically) rather than called ad-hoc from every screen, to avoid missed spots.

- `playSummon()` is started when a gacha pull animation begins and `stopSummon()` when the reveal sequence completes — see [14-gacha-mechanics-rates-pity.md](14-gacha-mechanics-rates-pity.md) / [13-summon-gacha-screen-ui.md](13-summon-gacha-screen-ui.md).
- `playRevealCard(isRare)` fires per-card as gacha results are revealed, with the "rare" variant used for higher-rarity pulls (exact rarity threshold documented in the gacha doc).
- **Known gap**: `LevelUpPopup.tsx:53-60` has a commented-out placeholder (`// const audio = new Audio('/sounds/levelup.mp3'); // audio.play();`) gated behind `if (!isSfxMuted)` — a level-up SFX was planned but never implemented. There is no `levelup.mp3` asset in the project. Treat this as a green-field opportunity in the Unity port (e.g. reuse `card-reveal.mp3`-style cue or author a new one), not a spec to replicate literally.

### Mute gating summary

| Flag | Default | Gates | Set by |
|---|---|---|---|
| `isBgmMuted` | `false` | Background music play/pause | Settings screen "Music" toggle → `toggleBgmMute()` |
| `isSfxMuted` | `false` | All 4 `useSound()` functions (early-return before creating/playing any `Audio`) | Settings screen "Sound Effects" toggle → `toggleSfxMute()` |

Both flags persist as part of the `settings` slice — see [09-save-persistence-system.md](09-save-persistence-system.md).

## Numbers & Formulas

| Cue | Volume (0–1) | Loop |
|---|---|---|
| Background music (`wind_bg.mp3`) | 0.3 | Yes |
| Click SFX | 0.3 | No |
| Summon SFX | 0.2 | No (but restarts from 0 on repeat calls) |
| Card reveal SFX | 0.2 | No |
| Rare card reveal SFX | 0.2 | No |

No fade-in/fade-out, no crossfade, no dynamic mixing — every sound is played at a fixed static volume.

## Assets Used

**Actually referenced in code (port these):**
- `public/assets/sound/wind_bg.mp3` — background music loop.
- `public/assets/sound/sfx/click.mp3` — UI click SFX.
- `public/assets/sound/sfx/summon.mp3` — summon-in-progress loop/stinger.
- `public/assets/sound/sfx/card-reveal.mp3` — common/normal card reveal stinger.
- `public/assets/sound/sfx/rare-card-reveal.mp3` — rare+ card reveal stinger.

**Present in `public/assets/sound/` but never referenced anywhere in the codebase — legacy/unused, do NOT carry over into the Unity port as-is (evaluate individually if the dev wants to repurpose the audio, but they are not part of the current shipped feature set):**
- `public/assets/sound/Gacha Gridlock.mp3` — unused alternate music track candidate.
- `public/assets/sound/Gacha Lobby Loops.mp3` — unused alternate music track candidate.
- `public/assets/sound/click.wav` — unused duplicate of the click SFX (root folder, wrong location/format vs. the one actually used at `sfx/click.mp3`).
- `public/assets/sound/reward.mp3` — unused; no reward SFX is wired into any code path.
- `public/assets/sound/sfx/click.wav` — unused duplicate of `sfx/click.mp3` (same cue, different format, not referenced).
- `public/assets/sound/sfx/reward.mp3` — unused; duplicate of the root-level `reward.mp3`, no reward SFX call site exists.

## Cross-References

- [08-player-progression-currencies.md](08-player-progression-currencies.md)
- [09-save-persistence-system.md](09-save-persistence-system.md) — persistence of `isBgmMuted`/`isSfxMuted`.
- [13-summon-gacha-screen-ui.md](13-summon-gacha-screen-ui.md) / [14-gacha-mechanics-rates-pity.md](14-gacha-mechanics-rates-pity.md) — summon SFX start/stop and reveal SFX timing.
- [05-settings-screen.md](05-settings-screen.md) — mute toggle UI.

## Unity Porting Notes

- Centralize into one `AudioManager` singleton with a music `AudioSource` (loop on, volume 0.3) and a pooled SFX player, instead of the source's pattern of creating a brand-new `Audio` object per SFX call (fine in a browser, wasteful/unnecessary in Unity — use `AudioSource.PlayOneShot` against a shared `AudioClip` library).
- Preserve the "summon" cue as a **stoppable, restartable** single-instance sound (start when the pull animation begins, explicit stop when the reveal completes) — this is the one SFX that isn't fire-and-forget in the source, and that distinction matters for the Unity implementation (use a dedicated `AudioSource`, not `PlayOneShot`, for this one cue).
- No autoplay-permission workaround is needed in a native Unity build; simply start music on boot. Only revisit this if shipping to a browser-embedded platform (WebGL) where the same policy could apply.
- Do not port the unused/legacy sound files listed above — bring over only the 5 clips actually referenced in code. If the developer wants the unused music tracks (`Gacha Gridlock.mp3`, `Gacha Lobby Loops.mp3`) as additional BGM options later, that's a new feature decision, not something to silently resurrect as "the spec."
- Consider implementing the missing level-up SFX (stubbed out but never wired in the source) as a genuine feature in the Unity port, since the mute-gating and intent are already implied by the dead code in `LevelUpPopup.tsx`.
- Add real volume control (not just mute) as a natural improvement — the source only ever exposes binary mute toggles, no sliders.
