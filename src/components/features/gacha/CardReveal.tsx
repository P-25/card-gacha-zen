"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Card, Resource } from "@/types/game";
import DivineRays from "./DivineRays";
import FloatingParticles from "@/components/summon/FloatingParticles";
import CosmicButton from "@/components/summon/CosmicButton";
import CardDesign from "@/components/card/CardDesign";

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
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background Effects */}
      <DivineRays rarity={item.rarity} />
      <FloatingParticles />

      <motion.div
        key={currentIndex}
        initial={{ scale: 0, rotateY: 180, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="flex flex-col items-center gap-8 z-10"
      >
        {/* Card Container with 3D Tilt */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative perspective-1000 cursor-pointer"
        >
          {/* Floating Animation Wrapper */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <CardDesign card={cardItem} />
          </motion.div>
        </motion.div>

        <div className="text-center relative z-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-3xl font-display font-bold mb-2 tracking-wider ${
              item.rarity === "LEGENDARY"
                ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                : item.rarity === "RARE"
                ? "text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                : item.rarity === "UNCOMMON"
                ? "text-emerald-400"
                : "text-slate-200"
            }`}
          >
            {item.name}
          </motion.h3>

          {!isCard && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-yellow-500 font-bold"
            >
              x{resourceItem.value}
            </motion.p>
          )}

          {isCard && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "3rem" }}
              transition={{ delay: 0.4 }}
              className={`h-1 mx-auto rounded-full mt-2 ${
                item.rarity === "LEGENDARY"
                  ? "bg-amber-500"
                  : item.rarity === "RARE"
                  ? "bg-blue-500"
                  : item.rarity === "UNCOMMON"
                  ? "bg-emerald-500"
                  : "bg-slate-500"
              }`}
            />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <CosmicButton
            onClick={handleNext}
            text={currentIndex < results.length - 1 ? "NEXT" : "CLAIM"}
            showCost={false}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
