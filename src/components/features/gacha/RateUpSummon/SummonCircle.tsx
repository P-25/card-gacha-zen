/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

export default function SummoningRitual() {
  const [isSummoning, setIsSummoning] = useState(false);
  const [imageSrc, setImageSrc] = useState<any>("summon-circle-new3.jpg");
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // Toggle the summoning state
  const handleSummon = () => {
    if (imageError) return; // Prevent summoning if no image
    setIsSummoning(!isSummoning);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setIsSummoning(false); // Stop ritual if image fails
  };

  // Handle file upload
  const handleFileUpload = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = (e: any) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />

      {/* Main Scene Container */}
      <div className="relative w-full max-w-4xl aspect-video flex items-center justify-center z-10 p-4">
        {/* 1. The Summoning Circle Image / Upload Layer */}
        <div className="relative z-10 w-full flex justify-center items-center">
          {/* Ground Glow (Under the image) - Only shows if image is valid */}
          {!imageError && (
            <motion.div
              animate={{
                opacity: isSummoning ? 0.8 : 0.2,
                scale: isSummoning ? 1.2 : 1,
              }}
              transition={{
                duration: 2,
                repeat: isSummoning ? Infinity : 0,
                repeatType: "reverse",
              }}
              className="absolute w-2/3 h-2/3 bg-cyan-600/30 blur-3xl rounded-[100%] transform scale-y-50 pointer-events-none"
            />
          )}

          {/* The Image OR The Error State */}
          <div className="relative z-20 w-full max-w-2xl flex justify-center items-center">
            {imageError ? (
              // ERROR / UPLOAD STATE
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full aspect-[4/3] max-w-lg rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-slate-400 p-8 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/50 transition-colors group"
                onClick={triggerFileUpload}
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-200">
                    Summoning Artifact Missing
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Click to upload your circle image
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </motion.div>
            ) : (
              // SUCCESS STATE
              <div
                onClick={handleSummon}
                className="cursor-pointer group relative flex items-center justify-center"
              >
                <motion.img
                  src={imageSrc}
                  onError={handleImageError}
                  alt="Summon Circle"
                  className="w-full h-auto object-contain drop-shadow-2xl max-h-[60vh] relative z-20"
                  initial={{ filter: "brightness(1) contrast(1)" }}
                  animate={{
                    filter: isSummoning
                      ? "brightness(1.3) contrast(1.2) drop-shadow(0 0 20px rgba(6,182,212,0.6))"
                      : "brightness(1) contrast(1) drop-shadow(0 0 0px rgba(6,182,212,0))",
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Floating particles only when valid image */}
                <AnimatePresence>
                  {isSummoning && <ParticleSystem count={40} />}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* 2. Rising Light Beams (The "Blue Rays") */}
          <AnimatePresence>
            {isSummoning && !imageError && (
              <div className="absolute inset-0 z-10 flex justify-center items-center pointer-events-none top-1/2 -translate-y-1/2">
                {/* Main Central Beam */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "100vh", opacity: 0.6 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-0 w-32 bg-gradient-to-t from-cyan-400 via-cyan-200/20 to-transparent blur-xl transform origin-bottom"
                />

                {/* Secondary Beams */}
                <Rays />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Control UI */}
      <div className="absolute top-12 z-50 flex flex-col items-center gap-4 w-full px-4">
        {imageError ? (
          <div className="flex items-center gap-2 text-red-400 bg-red-950/30 px-4 py-2 rounded-full border border-red-900/50">
            <span className="text-sm">Image source not found</span>
          </div>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSummon}
              className={`
                px-8 py-4 rounded-full font-bold text-lg tracking-widest uppercase transition-all duration-300 flex items-center gap-2
                ${
                  isSummoning
                    ? "bg-cyan-500 text-white shadow-[0_0_40px_rgba(6,182,212,0.6)] border-cyan-400 border-2"
                    : "bg-transparent text-cyan-500 border-2 border-cyan-800 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                }
              `}
            >
              {isSummoning ? <>Deactivate</> : <>Activate Ritual</>}
            </motion.button>

            <div className="flex gap-4 items-center">
              <p className="text-slate-500 text-sm font-mono">
                {isSummoning ? "RITUAL IN PROGRESS..." : "AWAITING INPUT"}
              </p>
              <button
                onClick={triggerFileUpload}
                className="text-xs text-slate-600 hover:text-cyan-400 underline underline-offset-4 transition-colors"
              >
                Change Artifact
              </button>
            </div>
          </>
        )}
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

  return (
    <>
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: ["0vh", "60vh", "80vh"],
            opacity: [0, 0.4, 0],
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
          className="absolute bottom-0 bg-gradient-to-t from-blue-500/50 via-cyan-400/10 to-transparent blur-md transform origin-bottom"
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
          className="absolute rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
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
