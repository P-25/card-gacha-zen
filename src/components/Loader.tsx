"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-32 h-32"
      >
        <Image
          src="/assets/zen-icon-home-clean.png"
          alt="Loading"
          fill
          className="object-contain opacity-80"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 text-[#8FA89B] font-bold text-xl tracking-widest uppercase font-display"
      >
        Finding Peace...
      </motion.div>
    </div>
  );
}
