"use client";

import TopBar from "@/components/features/home/TopBar";
import HomeActions from "@/components/features/home/HomeActions";
import HomeBanner from "./features/home/HomeBanner";
import { useEffect, useState } from "react";

interface HomeScreenProps {
  onNavigate: (
    screen: "gacha" | "quests" | "collection" | "battle" | "deck" | "tier",
  ) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <TopBar title="Home" onNavigate={onNavigate} />
      <HomeBanner />

      {/* {windowSize.width ? (
        <ul className="space-y-1">
          <li>
            <strong>Width:</strong> {windowSize.width}px
          </li>
          <li>
            <strong>Height:</strong> {windowSize.height}px
          </li>
        </ul>
      ) : (
        <p>Loading dimensions...</p>
      )} */}
      {/* Main Actions Area */}
      <div className="flex-1 flex flex-col justify-end pb-24">
        <HomeActions onNavigate={onNavigate} />
      </div>

      {/* Spacer for persistent nav */}
      <div className="relative z-20 px-4 pointer-events-none" />
    </div>
  );
}
