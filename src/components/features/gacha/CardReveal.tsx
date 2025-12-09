"use client";

import FloatingParticles from "@/components/summon/FloatingParticles";
import { Card, Resource } from "@/types/game";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface CardRevealProps {
  onReset: () => void;
  results: (Card | Resource)[];
}

export default function CardReveal({ onReset, results }: CardRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const item = results[currentIndex];

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!item) return null;

  const isCard = item.type === "CARD";
  const cardItem = item as Card;
  const resourceItem = item as Resource;

  const handleNext = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onReset();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <FloatingParticles />

      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 py-10">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="flex flex-col items-center gap-6 w-full max-w-md px-6"
        >
          {/* Custom Card Container */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative perspective-1000 cursor-pointer w-full aspect-[3/4]"
          >
            <Image
              src={cardItem.image}
              alt={cardItem.name}
              fill
              sizes="(max-width: 768px) 80vw, 400px"
              priority
              className="no-global-filter"
            />
          </motion.div>

          {/* Card Name */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-[#5F5A46] tracking-wide uppercase text-center"
          >
            {item.name}
          </motion.h3>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <button
              onClick={handleNext}
              className="w-full bg-[#3E206D] text-[#FDB931] font-bold text-xl py-4 rounded-xl border-2 border-[#C5A059] shadow-lg active:scale-95 transition-transform uppercase tracking-widest relative overflow-hidden group cursor-pointer"
            >
              <span className="relative z-10">
                {currentIndex < results.length - 1 ? "NEXT" : "CLAIM"}
              </span>
              {/* Sheen */}
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
