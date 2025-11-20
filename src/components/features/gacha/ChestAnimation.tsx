'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ChestAnimationProps {
  isOpening: boolean;
  isOpened: boolean;
  onOpen: () => void;
}

export default function ChestAnimation({ isOpening, isOpened, onOpen }: ChestAnimationProps) {
  return (
    <motion.div
      key="chest"
      className="relative flex flex-col items-center"
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chest Animation */}
      <motion.div
        className="relative w-64 h-64 cursor-pointer"
        onClick={onOpen}
        animate={isOpening ? {
          x: [-2, 2, -2, 2, 0],
          rotate: [-1, 1, -1, 1, 0],
          scale: [1, 1.02, 0.98, 1.02, 1]
        } : {}}
        transition={{ duration: 0.5, repeat: isOpening ? Infinity : 0 }}
      >
        <Image
          src={isOpened ? "/assets/box-open.png" : "/assets/box-close.png"}
          alt="Keepsake Box"
          fill
          className="object-contain drop-shadow-xl"
          priority
        />
        
        {/* Burst Effect */}
        {isOpened && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-[#E6C9A8]/40 rounded-full blur-2xl z-[-1]"
          />
        )}
      </motion.div>

      {/* Instruction Text */}
      {!isOpened && !isOpening && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-[#4A4A4A]/80 font-display text-lg tracking-widest uppercase animate-pulse"
        >
          Open
        </motion.p>
      )}
    </motion.div>
  );
}
