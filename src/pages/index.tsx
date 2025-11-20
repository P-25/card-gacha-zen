'use client';

import { useGameState } from '@/hooks/useGameState';
import GameLayout from '@/components/layout/GameLayout';
import Loader from '@/components/Loader';
import HomeScreen from '@/components/HomeScreen';
import GachaScreen from '@/components/GachaScreen';
import { PlaceholderScreen } from '@/components/PlaceholderScreens';

export default function GamePage() {
  const { appState, navigateTo } = useGameState();

  return (
    <GameLayout appState={appState} onNavigate={navigateTo}>
      {appState === 'loading' && <Loader />}
      {appState === 'home' && <HomeScreen onNavigate={navigateTo} />}
      {appState === 'gacha' && <GachaScreen />}
      {appState === 'quests' && <PlaceholderScreen title="Quests" icon="📜" />}
      {appState === 'collection' && <PlaceholderScreen title="Collection" icon="📚" />}
    </GameLayout>
  );
}
