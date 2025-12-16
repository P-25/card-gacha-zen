"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-transparent flex flex-col items-center justify-center">
      <motion.div className="relative w-64 h-64">
        <Image
          src="/assets/icons/loader.webp"
          alt="Loading"
          fill
          className="object-contain opacity-80"
          priority
        />
      </motion.div>

      <motion.div
        key={"loading"}
        // initial={{ opacity: 0 }}
        // animate={{ opacity: [0.5, 1, 0.5] }}
        // transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 text-[#3C595E] font-bold text-xl tracking-widest uppercase font-display text-center px-4"
      >
        Loading
      </motion.div>
    </div>
  );
}
