/* eslint-disable @typescript-eslint/no-explicit-any */
import CardDesign from "@/components/card/CardDesign";
import cards from "@/config/cards.json";
import { Card } from "@/types/game";
import {
  motion,
  MotionValue,
  PanInfo,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface LayoutConfig {
  radius: number;
  cardWidth: number;
  cardHeight: number;
  arcHeight: number;
}

interface CardContentProps {
  isCenter: boolean;
}

interface TiltArcCardProps {
  index: number;
  card: Card;
  rotation: MotionValue<number>;
  count: number;
  layout: LayoutConfig;
}

// Data Setup
const DATA: Card[] = cards as Card[];

export default function CardsCarousel() {
  const rotation = useMotionValue(0);
  const angularVelocity = useSpring(0.02, { stiffness: 50, damping: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<LayoutConfig>({
    radius: 160,
    cardWidth: 40,
    cardHeight: 60,
    arcHeight: 60,
  });

  useEffect(() => {
    let frame: number;
    const loop = () => {
      if (!isDragging) {
        const currentRotation = rotation.get();
        const velocity = angularVelocity.get();
        rotation.set(currentRotation + velocity);

        if (Math.abs(velocity) > 0.02) {
          angularVelocity.set(velocity * 0.98);
        } else {
          if (velocity !== 0.02) angularVelocity.set(0.02);
        }
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [isDragging, rotation, angularVelocity]);

  const handleDragStart = () => {
    setIsDragging(true);
    angularVelocity.set(0);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const velocity = info.velocity.x * 0.02;
    angularVelocity.set(velocity);
  };

  return (
    <div
      ref={containerRef}
      className="absolute z-100 w-full h-full flex flex-col items-center justify-center touch-none select-none perspective-[800px] overflow-visible"
      id="CardList"
    >
      <motion.div
        className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={(_, info) => {
          rotation.set(rotation.get() + info.delta.x * 0.15);
        }}
      />

      {/* Cards Container - Pushed lower to sit on the "floor" */}
      <div className="absolute top-[0%] left-1/2 w-0 h-0 z-20 preserve-3d">
        {DATA.map((card, index) => (
          <TiltArcCard
            key={`${card.id}-${index}`}
            index={index}
            card={card}
            rotation={rotation}
            count={DATA.length}
            layout={layout}
          />
        ))}
      </div>
    </div>
  );
}

const TiltArcCard: React.FC<TiltArcCardProps> = ({
  index,
  card,
  rotation,
  count,
  layout,
}) => {
  const { radius, cardWidth, cardHeight, arcHeight } = layout;
  const baseAngle = index * (360 / count);

  const rotateValue = useTransform(rotation, (r) => {
    return (baseAngle + r) % 360;
  });

  const x = useTransform(rotateValue, (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return Math.sin(angleRad) * radius;
  });

  const rawZ = useTransform(rotateValue, (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return Math.cos(angleRad) * radius;
  });

  const y = useTransform(rawZ, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);
    const curve = Math.pow(1 - normalizedZ, 2);
    return curve * -arcHeight * 1.2 + arcHeight * 0.3;
  });

  const z = useTransform(rawZ, (z) => z);

  const rotateX = useTransform(rawZ, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);
    return Math.max(0, (normalizedZ - 0.5) * 40);
  });

  const rotateZ = useTransform(rotateValue, (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const sinVal = Math.sin(angleRad);
    return sinVal * 15;
  });

  const scale = useTransform(z, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);
    return 0.4 + Math.pow(normalizedZ, 4) * 1.6;
  });

  const opacity = useTransform(z, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);
    if (normalizedZ < 0.7) return 0;
    return (normalizedZ - 0.7) * 3.5;
  });

  const zIndex = useTransform(z, (zVal) => {
    return Math.round(((zVal + radius) / (radius * 2)) * 500);
  });

  const blur = useTransform(z, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);
    if (normalizedZ > 0.9) return "blur(0px)";
    const amount = (1 - normalizedZ) * 10;
    return `blur(${amount}px)`;
  });

  const [isCenter, setIsCenter] = useState(false);
  useEffect(() => {
    const unsubscribe = rotateValue.onChange((v) => {
      const normalizedAngle = (v + 360) % 360;
      setIsCenter(normalizedAngle > 355 || normalizedAngle < 5);
    });
    return () => unsubscribe();
  }, [rotateValue]);

  return (
    <motion.div
      style={{
        x,
        y,
        z,
        rotateX,
        rotateZ,
        zIndex,
        scale,
        opacity,
        filter: blur,
        width: cardWidth,
        height: cardHeight,
        position: "absolute",
        marginLeft: -cardWidth / 2,
        marginTop: -cardHeight / 2,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
      }}
      className="will-change-transform flex items-center justify-center"
      id="CardWrapper"
    >
      <CardDesign card={card} />
    </motion.div>
  );
};
