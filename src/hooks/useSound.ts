import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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

  return { playClick };
};
