import { useState, useEffect } from "react";

export type AppState = "loading" | "home" | "gacha" | "quests" | "collection";

export interface GameResources {
  gold: number;
  gems: number;
}

export function useGameState() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [resources, setResources] = useState<GameResources>({
    gold: 5000,
    gems: 500,
  });

  // Simulate initial resource loading
  useEffect(() => {
    if (appState === "loading") {
      const timer = setTimeout(() => {
        setAppState("home");
      }, 3000); // 3 seconds loading time
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const navigateTo = (screen: AppState) => {
    setAppState(screen);
  };

  const spendResources = (cost: Partial<GameResources>) => {
    setResources((prev) => ({
      gold: prev.gold - (cost.gold || 0),
      gems: prev.gems - (cost.gems || 0),
    }));
  };

  return {
    appState,
    navigateTo,
    resources,
    spendResources,
  };
}
