import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

let summonAudioInstance: HTMLAudioElement | null = null;

export const useSound = () => {
  const isSfxMuted = useSelector(
    (state: RootState) => state.settings.isSfxMuted,
  );

  const playClick = useCallback(() => {
    if (isSfxMuted) return;
    const audio = new Audio("/assets/sound/sfx/click.mp3");
    audio.volume = 0.3; // Optional: Adjust volume if needed
    audio.play().catch((e) => console.error("Failed to play click sound:", e));
  }, [isSfxMuted]);

  const playSummon = useCallback(() => {
    if (isSfxMuted) return;
    if (!summonAudioInstance) {
      summonAudioInstance = new Audio("/assets/sound/sfx/summon.mp3");
      summonAudioInstance.volume = 0.2;
    }
    summonAudioInstance.currentTime = 0;
    summonAudioInstance
      .play()
      .catch((e) => console.error("Failed to play summon sound:", e));
  }, [isSfxMuted]);

  const stopSummon = useCallback(() => {
    if (summonAudioInstance) {
      summonAudioInstance.pause();
      summonAudioInstance.currentTime = 0;
    }
  }, []);

  const playRevealCard = useCallback(
    (isRare: boolean = false) => {
      if (isSfxMuted) return;
      const soundFile = isRare
        ? "/assets/sound/sfx/rare-card-reveal.mp3"
        : "/assets/sound/sfx/card-reveal.mp3";
      const audio = new Audio(soundFile);
      audio.volume = 0.2;
      audio
        .play()
        .catch((e) => console.error("Failed to play reveal card sound:", e));
    },
    [isSfxMuted],
  );

  return { playClick, playSummon, stopSummon, playRevealCard };
};
