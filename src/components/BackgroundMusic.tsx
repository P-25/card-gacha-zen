import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const BackgroundMusic = () => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // List of routes where music should be blocked
  // Example: ["/login", "/settings"]
  const blockedRoutes: string[] = [];
  const { isBgmMuted } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    // strict check for browser environment
    if (typeof window === "undefined") return;

    if (!audioRef.current) {
      audioRef.current = new Audio("/assets/sound/wind_bg.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Set initial volume
    }

    const audio = audioRef.current;

    const playAudio = async () => {
      try {
        if (blockedRoutes.includes(router.pathname) || isBgmMuted) {
          audio.pause();
          setIsPlaying(false);
          return;
        }

        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Autoplay blocked, waiting for interaction", err);
        setIsPlaying(false);
      }
    };

    const handleUserInteraction = () => {
      if (
        !isPlaying &&
        !blockedRoutes.includes(router.pathname) &&
        !isBgmMuted
      ) {
        playAudio();
      }
    };

    // Attempt to play on mount/route change
    playAudio();

    // Add global click listener for autoplay policy
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [router.pathname, isBgmMuted]); // Re-run effect when route changes to check blockedRoutes

  return null; // This component doesn't render anything visible
};

export default BackgroundMusic;
