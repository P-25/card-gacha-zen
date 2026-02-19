import { useState, useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { motion, AnimatePresence } from "framer-motion";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const { name, tag } = useSelector((state: RootState) => state.player);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds loading

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    // Delay actual start to allow exit animation to play
    setTimeout(onStart, 800);
  };

  // Variants for the zoom-in transition
  const rootVariants = {
    exit: {
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut" as const },
    },
  };

  const mobileContainerVariants = {
    initial: { scale: 1, opacity: 1 },
    exit: {
      scale: 1,
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut" as const },
    },
  };

  const innerContentVariants = {
    initial: { scale: 1, filter: "blur(0px)" },
    exit: {
      scale: 2,
      filter: "blur(10px)",
      transition: { duration: 0.8, ease: "easeInOut" as const },
    },
  };

  const desktopVariants = {
    initial: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut" as const },
    },
  };

  const logoVariants = {
    initial: { scale: 1 },
    exit: {
      scale: 15, // Excessive zoom to simulate going "through" the logo
      opacity: 0,
      transition: { duration: 0.8, ease: "easeInOut" as const },
    },
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="start-screen"
          className="fixed inset-0 z-9999 flex flex-col h-dvh justify-center items-center overflow-hidden"
          initial="initial"
          exit="exit"
          variants={rootVariants}
        >
          {/* Desktop Background (Matches GameLayout) */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 aspect-video w-full h-full hidden lg:block pointer-events-none"
            variants={desktopVariants}
          >
            <Image
              src="/assets/background/full-background.webp"
              alt="Desktop Background"
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          </motion.div>

          {/* Mobile Container (Matches GameLayout) */}
          <motion.div
            className="relative w-full h-full sm:h-[95vh] sm:aspect-[9/19.5] sm:max-w-[430px] sm:max-h-[932px] bg-black overflow-hidden flex flex-col shadow-2xl sm:rounded-4xl border-4 border-[#2a2a2a]"
            variants={mobileContainerVariants}
          >
            {/* Splash Content */}
            <motion.div
              className="relative w-full h-full flex flex-col items-center justify-between pb-4"
              variants={innerContentVariants}
            >
              {/* Background Image within frame */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/assets/background/start-screen.webp"
                  alt="Start Screen Background"
                  fill
                  className="no-global-filter object-cover object-center"
                  priority
                  quality={90}
                />
                {/* Gradient Overlay for better text readability at bottom */}
                <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/80" />
              </div>

              {/* Center: Logo - Independent animation on exit */}
              <motion.div
                className="relative z-10 flex flex-col items-center w-full px-4 mb-auto mt-10"
                variants={logoVariants}
              >
                <div className="text-white/80 text-md font-bold mt-1 uppercase tracking-widest">
                  <p>P26 Games</p>
                </div>
                <div className="text-white/80 text-xs font-bold mt-1 uppercase tracking-widest">
                  <p>Presents</p>
                </div>
                {/* Logo Image */}
                <div className="relative w-64 h-24 md:w-80 md:h-32 animate-in fade-in zoom-in duration-700">
                  <Image
                    src="/assets/icons/gold-logo.webp"
                    alt="Game Logo"
                    fill
                    className="object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>
              </motion.div>

              {/* Loading State UI */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-20 z-20 w-full flex flex-col items-center gap-2 pointer-events-none"
                  >
                    <h2 className="text-white font-bold text-xl tracking-[0.3em] uppercase font-display text-center drop-shadow-lg">
                      Loading
                    </h2>
                    <motion.div
                      className="h-1 w-24 bg-linear-to-r from-transparent via-white to-transparent"
                      animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                ) : (
                  /* Tap to Start - Interaction Area */
                  <>
                    <div
                      className="absolute inset-0 z-10 cursor-pointer"
                      onClick={handleStart}
                    />

                    {/* Start Screen Bottom Section */}
                    <motion.div
                      className="relative z-20 w-full flex flex-col items-center pb-4 pointer-events-none"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Tap To Start Text */}
                      <div className="mb-8 animate-pulse">
                        <span className="text-white font-black text-2xl tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-black stroke-2">
                          Tap to Start
                        </span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Footer Info */}
              <div className="flex flex-col items-center gap-1 w-full px-4">
                <div className="text-white/70 text-[9px] font-bold text-center leading-tight drop-shadow-sm">
                  <p>Version: 1.0.0 (beta)</p>
                </div>

                {/* Player ID */}
                <div className="text-white/70 text-[9px] font-bold text-center leading-tight drop-shadow-sm">
                  Player ID: #{tag}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StartScreen;
