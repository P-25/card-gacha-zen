"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Background() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#F5F2EB]">
      <Image
        src="/assets/background/light-bg.webp"
        alt="Background"
        fill
        className="no-global-filter object-cover opacity-80"
        priority
      />
      {/* Cloud Parallax Layer */}
      <motion.div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: "url('/assets/background/clouds.webp')",
          backgroundSize: "cover",
          backgroundRepeat: "repeat-x",
        }}
        animate={{
          backgroundPositionX: ["-100%", "140%"],
        }}
        transition={{
          duration: 300,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60" />
    </div>
  );
}
