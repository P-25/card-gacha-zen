/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

interface SummoningRitualProps {
  isSummoning: boolean;
}

export default function SummoningRitual({ isSummoning }: SummoningRitualProps) {
  return (
    <div className="min-h-screen min-w-[90%] bg-transparent flex flex-col items-center justify-center overflow-hidden absolute z-50">
      {/* Main Scene Container */}
      <div className="absolute top-[54%] w-full max-w-4xl aspect-video flex items-center justify-center z-10 p-4">
        {/* 1. The Summoning Circle Image / Upload Layer */}
        <div className="relative z-10 w-full flex justify-center items-center">
          {/* Ground Glow (Under the image) - Only shows if image is valid */}

          {/* The Image OR The Error State */}
          {/* <div className="relative z-20 w-full max-w-2xl flex justify-center items-center">
            <div className="cursor-pointer group relative flex items-center justify-center">
              <AnimatePresence>
                {isSummoning && <ParticleSystem count={40} />}
              </AnimatePresence>
            </div>
          </div> */}

          {/* 2. Rising Light Beams (The "Blue Rays") */}
          <AnimatePresence>
            {isSummoning && (
              <div className="absolute inset-0 z-50 flex justify-center items-center pointer-events-none top-1/2 -translate-y-1/2">
                {/* Central Core Beam - White/Pink */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "300px", opacity: 0.9 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-0 w-32 bg-gradient-to-t from-white via-fuchsia-300 to-transparent blur-2xl transform origin-bottom mix-blend-overlay"
                />
                {/* Inner Core Beam - Purple */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "300px", opacity: 0.6 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-0 w-16 bg-gradient-to-t from-fuchsia-100 via-purple-400 to-transparent blur-md transform origin-bottom mix-blend-screen"
                />
                <Rays />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components for cleaner code ---

// Generates random vertical light shafts
const Rays = () => {
  // Create a few random rays with fixed random values to prevent re-render jitter
  const rays = useMemo(
    () =>
      [...Array(5)].map((_, i) => ({
        id: i,
        left: `${20 + Math.random() * 60}%`, // Restrict to middle 60% of width
        width: `${10 + Math.random() * 40}px`,
        delay: Math.random() * 0.2,
        duration: 1 + Math.random(),
      })),
    []
  );

  console.log(`Debug - rays`, rays);
  return (
    <>
      {rays.map((ray) => (
        <motion.div
          id="yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
          key={ray.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: ["0vh", "60vh", "80vh"],
            opacity: [0.4, 0.8, 0],
          }}
          transition={{
            duration: ray.duration,
            repeat: Infinity,
            repeatType: "loop",
            delay: ray.delay,
            ease: "easeInOut",
          }}
          style={{
            left: ray.left,
            width: ray.width,
          }}
          className="absolute bottom-0 bg-gradient-to-t from-purple-200/50 via-pink-400/20 to-transparent blur-md transform origin-bottom mix-blend-screen"
        />
      ))}
    </>
  );
};

// Generates particles that float up from the elliptical floor
const ParticleSystem = ({ count = 30 }) => {
  // Generate random particles within an ellipse shape
  const particles = useMemo(() => {
    return [...Array(count)].map((_, i) => {
      // Math to distribute points inside an ellipse (perspective circle)
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()); // Sqrt for even distribution
      const width = 250; // Approximate half-width of the circle image in pixels
      const height = 80; // Approximate half-height (perspective squish)

      return {
        id: i,
        x: Math.cos(angle) * radius * width,
        y: Math.sin(angle) * radius * height,
        size: Math.random() * 4 + 1,
        duration: 1.5 + Math.random() * 2, // 1.5s to 3.5s float time
        delay: Math.random() * 2,
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white shadow-[0_0_2px_#fff,0_0_12px_#d946ef] mix-blend-screen"
          style={{
            width: p.size,
            height: p.size,
            // Initial position based on ellipse math relative to center
            left: `calc(50% + ${p.x}px)`,
            top: `calc(50% + ${p.y}px)`,
          }}
          initial={{ opacity: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: -300 - Math.random() * 200, // Move UP (negative Y)
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};
