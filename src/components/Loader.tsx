"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

// Array of Zen/Spiritual loading messages
const LOADING_MESSAGES = [
  "Finding Peace...",
  "Consulting the stars...",
  "Manifesting destiny...",
  "Shuffling the cosmic deck...",
  "Connecting to the spirit realm...",
  "Breathing in starlight...",
  "Gathering celestial energy...",
  "Aligning the constellations...",
  "Weaving your fate...",
  "Seeking clarity...",
];

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  // Initialize with a default to prevent hydration mismatch
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    // Select a random message once the component mounts in the browser
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(LOADING_MESSAGES[randomIndex]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center">
      <motion.div className="relative w-64 h-64">
        <div
          className="absolute left-1/2 -translate-x-1/2 z-0"
          style={{
            bottom: "-2%",
            width: "70%",
            height: "40px",
            background:
              "radial-gradient(rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0) 70%)",
            opacity: 0.8,
          }}
        />
        <Image
          src="/assets/summon_rate_gate2.png"
          alt="Loading"
          fill
          className="object-contain opacity-80"
          priority
        />
      </motion.div>

      <motion.div
        key={message}
        // initial={{ opacity: 0 }}
        // animate={{ opacity: [0.5, 1, 0.5] }}
        // transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 text-[#fff] font-bold text-xl tracking-widest uppercase font-display text-center px-4"
      >
        {message}
      </motion.div>
    </div>
  );
}
