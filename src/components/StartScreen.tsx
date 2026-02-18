import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { name, tag } = useSelector((state: RootState) => state.player);

  const handleStart = () => {
    setIsVisible(false);
    // slight delay to allow animation if we added an exit animation
    setTimeout(onStart, 100);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-9999 flex flex-col h-dvh justify-center items-center overflow-hidden bg-[#1a1a1a]">
      {/* Desktop Background (Matches GameLayout) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-video w-full h-full hidden lg:block pointer-events-none">
        <Image
          src="/assets/background/full-background.webp"
          alt="Desktop Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Mobile Container (Matches GameLayout) */}
      <div className="relative w-full h-full sm:h-[95vh] sm:aspect-[9/19.5] sm:max-w-[430px] sm:max-h-[932px] bg-black overflow-hidden flex flex-col shadow-2xl sm:rounded-4xl border-4 border-[#2a2a2a]">
        {/* Splash Content */}
        <div className="relative w-full h-full flex flex-col items-center justify-between">
          {/* Background Image within frame */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/background/start-screen.webp"
              alt="Start Screen Background"
              fill
              className="object-cover object-center"
              priority
              quality={90}
            />
            {/* Gradient Overlay for better text readability at bottom */}
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/80" />
          </div>

          {/* Center: Logo */}
          <div className="relative z-10 flex flex-col items-center w-full px-4 mb-auto mt-10">
            <div className="text-white/80 text-md font-bold mt-1 uppercase tracking-widest">
              <p>P26 Games</p>
            </div>
            <div className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">
              <p>presents</p>
            </div>
            {/* Logo Image */}
            <div className="relative w-64 h-32 md:w-80 md:h-40 animate-in fade-in zoom-in duration-700">
              <Image
                src="/logo.png"
                alt="Game Logo"
                fill
                className="object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                priority
              />
            </div>
          </div>

          {/* Tap to Start - Clickable Area */}
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleStart}
          />

          {/* Bottom Section */}
          <div className="relative z-20 w-full flex flex-col items-center pb-8 pointer-events-none">
            {/* Tap To Start Text */}
            <div className="mb-12 animate-pulse">
              <span className="text-white font-black text-2xl tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-black stroke-2">
                Tap to Start
              </span>
            </div>

            {/* Footer Info */}
            <div className="flex flex-col items-center gap-1 w-full px-4">
              {/* Fake Loading Indicator */}
              {/* <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                <span className="text-white/90 text-[10px] font-bold uppercase tracking-wide">
                  Loading...
                </span>
              </div> */}

              {/* Version Info */}
              <div className="text-white/70 text-[9px] font-bold text-center leading-tight drop-shadow-sm">
                <p>Version: 1.0.0 (beta)</p>
              </div>

              {/* Player ID */}
              <div className="text-white/60 text-[9px] font-bold mt-1 tracking-wide">
                Player ID: #{tag}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
