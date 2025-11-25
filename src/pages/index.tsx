import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import GameLayout from "@/components/layout/GameLayout";
import Loader from "@/components/Loader";
import HomeScreen from "@/components/HomeScreen";
import GachaScreen from "@/components/GachaScreen";
import BattleScreen from "@/components/BattleScreen";
import { PlaceholderScreen } from "@/components/PlaceholderScreens";
import CollectionsPage from "@/pages/collections";

export default function GamePage() {
  const { appState, navigateTo, resources } = useGameState();
  const [isGachaSelectionMode, setIsGachaSelectionMode] = useState(true);

  // Show nav if not in gacha, OR if in gacha but in selection mode
  const showNav = appState !== "gacha" || isGachaSelectionMode;

  return (
    <GameLayout appState={appState} onNavigate={navigateTo} showNav={showNav}>
      {appState === "loading" && <Loader />}
      {appState === "home" && <HomeScreen onNavigate={navigateTo} />}
      {appState === "gacha" && (
        <GachaScreen
          resources={resources}
          onSelectionModeChange={setIsGachaSelectionMode}
        />
      )}
      {appState === "battle" && <BattleScreen onNavigate={navigateTo} />}
      {appState === "quests" && <PlaceholderScreen title="Quests" icon="📜" />}
      {appState === "collection" && <CollectionsPage />}
      {appState === "deck" && <PlaceholderScreen title="Deck" icon="🃏" />}
      {appState === "shop" && <PlaceholderScreen title="Shop" icon="🏪" />}
      {appState === "social" && <PlaceholderScreen title="Social" icon="👥" />}
    </GameLayout>
  );
}
