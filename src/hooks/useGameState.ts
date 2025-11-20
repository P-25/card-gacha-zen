import { useState, useEffect } from 'react';

export type AppState = 'loading' | 'home' | 'gacha' | 'quests' | 'collection';

export function useGameState() {
  const [appState, setAppState] = useState<AppState>('loading');

  // Simulate initial resource loading
  useEffect(() => {
    if (appState === 'loading') {
      const timer = setTimeout(() => {
        setAppState('home');
      }, 3000); // 3 seconds loading time
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const navigateTo = (screen: AppState) => {
    setAppState(screen);
  };

  return {
    appState,
    navigateTo,
  };
}
