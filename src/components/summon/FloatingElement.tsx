"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  delay?: number; // To offset animations so they don't all move in perfect sync
  className?: string;
}

export default function FloatingElement({
  children,
  delay = 0,
  className = "",
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-8, 8, -8], // Float up and down smoothly
      }}
      transition={{
        duration: 6, // Slow duration for a calm feel
        ease: "easeInOut",
        repeat: Infinity,
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}
