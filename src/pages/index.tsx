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
import QuestScreen from "@/components/QuestScreen";
import { useAssetLoader } from "@/hooks/useAssetLoader";

const CRITICAL_ASSETS = [
  "/assets/background/full-background.webp",
  "/assets/background/light-bg.webp",
  "/assets/icons/home.webp",
  "/assets/icons/battle.webp",
  "/assets/icons/collection.webp",
  "/assets/icons/shop.webp",
  "/assets/icons/quest.webp",
  "/assets/icons/gem.webp",
  "/assets/icons/gold-coin.webp",
  "/assets/icons/info.webp",
  "/assets/banner/banner_dragon.png",
];

export default function GamePage() {
  const { appState, navigateTo, resources } = useGameState();
  const [isGachaSelectionMode, setIsGachaSelectionMode] = useState(true);
  const [isBattleNavVisible, setBattleNavVisible] = useState(true);

  const { isLoading: assetsLoading, progress } =
    useAssetLoader(CRITICAL_ASSETS);

  // Show nav if not in gacha
  // AND if not in battle OR if in battle but nav is explicitly visible
  const showNav =
    appState !== "gacha" && (appState !== "battle" || isBattleNavVisible);

  const isGlobalLoading = appState === "loading" || assetsLoading;

  return (
    <GameLayout appState={appState} onNavigate={navigateTo} showNav={showNav}>
      {isGlobalLoading && <Loader />}
      {!isGlobalLoading && appState === "home" && (
        <HomeScreen onNavigate={navigateTo} />
      )}
      {!isGlobalLoading && appState === "gacha" && (
        <GachaScreen
          resources={resources}
          onSelectionModeChange={setIsGachaSelectionMode}
          onNavigate={navigateTo}
        />
      )}
      {!isGlobalLoading && appState === "battle" && (
        <BattleScreen
          onNavigate={navigateTo}
          setBattleNavVisible={setBattleNavVisible}
        />
      )}
      {!isGlobalLoading && appState === "quests" && <QuestScreen />}
      {!isGlobalLoading && appState === "collection" && (
        <CollectionScreen onNavigate={navigateTo} />
      )}
      {!isGlobalLoading && appState === "deck" && (
        <PlaceholderScreen title="Deck" icon="🃏" />
      )}
      {!isGlobalLoading && appState === "shop" && <ShopScreen title="Shop" />}
      {!isGlobalLoading && appState === "social" && (
        <PlaceholderScreen title="Social" icon="👥" />
      )}
    </GameLayout>
  );
}
