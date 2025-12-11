import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import GameLayout from "@/components/layout/GameLayout";
import Loader from "@/components/Loader";
import HomeScreen from "@/components/HomeScreen";
import GachaScreen from "@/components/GachaScreen";
import BattleScreen from "@/components/BattleScreen";
import { PlaceholderScreen } from "@/components/PlaceholderScreens";
import CollectionScreen from "@/components/CollectionScreen";
import ShopScreen from "@/components/features/shop/ShopScreen";

export default function GamePage() {
  const { appState, navigateTo, resources } = useGameState();
  const [isGachaSelectionMode, setIsGachaSelectionMode] = useState(true);
  const [isBattleNavVisible, setBattleNavVisible] = useState(true);

  // Show nav if not in gacha, OR if in gacha but in selection mode
  // AND if not in battle OR if in battle but nav is explicitly visible
  const showNav =
    (appState !== "gacha" || isGachaSelectionMode) &&
    (appState !== "battle" || isBattleNavVisible);

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
      {appState === "battle" && (
        <BattleScreen
          onNavigate={navigateTo}
          setBattleNavVisible={setBattleNavVisible}
        />
      )}
      {appState === "quests" && <PlaceholderScreen title="Quests" icon="📜" />}
      {appState === "collection" && (
        <CollectionScreen onNavigate={navigateTo} />
      )}
      {appState === "deck" && <PlaceholderScreen title="Deck" icon="🃏" />}
      {appState === "shop" && <ShopScreen title="Shop" />}
      {appState === "social" && <PlaceholderScreen title="Social" icon="👥" />}
    </GameLayout>
  );
}
