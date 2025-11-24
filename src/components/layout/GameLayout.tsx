"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "./Background";
import BottomNav from "@/components/BottomNav";
import { AppState } from "@/hooks/useGameState";
import Image from "next/image";

interface GameLayoutProps {
  children: ReactNode;
  appState: AppState;
  onNavigate: (screen: AppState) => void;
  showNav?: boolean;
}

export default function GameLayout({
  children,
  appState,
  onNavigate,
  showNav = true,
}: GameLayoutProps) {
  return (
    <div className="flex flex-col h-screen justify-center items-center overflow-hidden bg-[#1a1a1a]">
      {/* Desktop Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-[1920/1080] w-[1920px] hidden lg:block pointer-events-none">
        <Image
          src="/assets/bamboo-bg.png"
          alt="Desktop Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Mobile Container */}
      <main className="relative w-full h-full sm:h-[95vh] sm:aspect-[9/19.5] sm:max-w-[430px] sm:max-h-[932px] bg-black overflow-hidden flex flex-col shadow-2xl sm:rounded-[2rem] border-4 border-[#2a2a2a]">
        <Background />

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 w-full h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={appState}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Persistent Bottom Navigation */}
        {appState !== "loading" && showNav && (
          <BottomNav activeTab={appState} onNavigate={onNavigate} />
        )}
      </main>
    </div>
  );
}
