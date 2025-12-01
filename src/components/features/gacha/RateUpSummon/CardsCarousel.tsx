import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
  PanInfo,
} from "framer-motion";

// --- Types ---
type CardType = "fire" | "water" | "grass" | "electric" | "psychic" | "dark";

interface CardData {
  id: number;
  type: CardType;
}

interface LayoutConfig {
  radius: number;
  cardWidth: number;
  cardHeight: number;
  arcHeight: number;
}

interface CardContentProps {
  type: CardType;
  isCenter: boolean;
}

interface TiltArcCardProps {
  index: number;
  card: CardData;
  rotation: MotionValue<number>;
  count: number;
  layout: LayoutConfig;
}

// --- Assets & Icons ---
const CardContent: React.FC<CardContentProps> = ({ type, isCenter }) => {
  const gradients: Record<CardType, string> = {
    fire: "from-orange-600 to-red-800",
    water: "from-blue-500 to-indigo-700",
    grass: "from-green-500 to-emerald-800",
    electric: "from-yellow-400 to-amber-600",
    psychic: "from-purple-500 to-fuchsia-800",
    dark: "from-gray-700 to-slate-900",
  };

  const icons: Record<CardType, string> = {
    fire: "🔥",
    water: "💧",
    grass: "🌿",
    electric: "⚡",
    psychic: "🔮",
    dark: "🌑",
  };

  return (
    <motion.div
      className={`w-full h-full rounded-2xl bg-gradient-to-br ${
        gradients[type] || gradients.fire
      } p-1 relative overflow-hidden group select-none touch-none border-2 transition-all duration-300 border-yellow-400/90 ${
        isCenter
          ? "drop-shadow-[0_0_50px_rgba(255,215,0,0.8)]"
          : "drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
      }`}
    >
      {/* Holographic overlay */}
      <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay pointer-events-none" />

      {/* Glossy Sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* Inner Card Frame */}
      <div className="w-full h-full border-[3px] border-yellow-500/60 rounded-xl bg-black/40 flex flex-col items-center justify-between p-4 relative z-10 backdrop-blur-md">
        <div className="flex justify-between w-full text-white font-bold uppercase tracking-widest text-[8px] md:text-[10px] opacity-80">
          <span>{type}</span>
          <span>150</span>
        </div>

        {/* Central Art */}
        <div
          className={`rounded-full bg-white/5 border border-white/10 shadow-inner flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
            isCenter ? "w-32 h-32" : "w-20 h-20"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div
            className={`filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 transition-all duration-300 ${
              isCenter ? "text-7xl" : "text-4xl"
            }`}
          >
            {icons[type] || "❓"}
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-white/60" />
          </div>
          <div className="flex justify-between text-[7px] text-white/50 font-mono">
            <span>ATK 40</span>
            <span>DEF 20</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Starry Background ---
const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0,
      height = 0;

    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
    }

    const stars: Star[] = Array.from({ length: 300 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5,
      opacity: Math.random(),
      speed: 0.0001 + Math.random() * 0.0003,
    }));

    let frame: number;
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) star.y = 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      frame = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    handleResize();
    animate();
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

// --- Data Setup ---
const BASE_DATA: CardData[] = [
  { id: 1, type: "electric" },
  { id: 2, type: "fire" },
  { id: 3, type: "water" },
  { id: 4, type: "grass" },
  { id: 5, type: "psychic" },
  { id: 6, type: "dark" },
];
const DATA: CardData[] = [...BASE_DATA, ...BASE_DATA];

export default function CardsCarousel() {
  const rotation = useMotionValue(0);
  const angularVelocity = useSpring(0.02, { stiffness: 50, damping: 30 });
  const [isDragging, setIsDragging] = useState(false);

  // Responsive Layout Settings
  const [layout, setLayout] = useState<LayoutConfig>({
    radius: 500, // Increased radius for wider gap
    cardWidth: 140, // Decreased width slightly
    cardHeight: 220,
    arcHeight: 120, // Reduced arc height for a flatter, fanned look
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setLayout({
          radius: 300,
          cardWidth: 100,
          cardHeight: 160,
          arcHeight: 80,
        });
      } else {
        setLayout({
          radius: 550,
          cardWidth: 150,
          cardHeight: 240,
          arcHeight: 140,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Physics Loop ---
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
      id="CardList"
      className="absolute w-[80%] h-full flex flex-col items-center justify-center font-sans touch-none select-none perspective-[1000px] z-100 top-[32%]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-indigo-950/60 via-slate-950 to-black z-0" />
      <StarryBackground />

      {/* --- Central Axis / Stick --- */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none h-[70vh] flex flex-col items-center justify-end pb-10">
        <div className="w-1 h-full bg-gradient-to-t from-cyan-400/40 via-white/10 to-transparent blur-[1px]" />
        <div className="absolute bottom-5 w-48 h-16 bg-cyan-500/20 blur-2xl rounded-[100%]" />
      </div>

      {/* --- Interactive Layer --- */}
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

      {/* --- Cards Container --- */}
      {/* Pushed lower to anchor the arc at the bottom */}
      <div className="absolute top-[65%] left-1/2 w-0 h-0 z-20 preserve-3d">
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

      <div className="absolute top-10 md:top-16 z-40 pointer-events-none text-center w-full">
        <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-100 tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
          Ascension Deck
        </h1>
      </div>
    </div>
  );
}

// --- The Visible Front-Arc Logic ---
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

  // --- 3D Position Math ---

  const x = useTransform(rotateValue, (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return Math.sin(angleRad) * radius;
  });

  const rawZ = useTransform(rotateValue, (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return Math.cos(angleRad) * radius;
  });

  // Y Position:
  // Front (Z+) is very LOW (positive Y)
  // Back (Z-) is very HIGH (negative Y)
  const y = useTransform(rawZ, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2); // 0 to 1

    // Smooth curve: Flat at front, steep at sides
    const curve = Math.pow(1 - normalizedZ, 2);
    return curve * -arcHeight * 1.2 + arcHeight * 0.3;
  });

  const z = useTransform(rawZ, (z) => z);

  // --- Rotations ---

  // RotateX:
  // Front Card tilts BACK to face the camera (Positive RotateX)
  const rotateX = useTransform(rawZ, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);
    // At front (1): Tilt 20deg (Slightly reduced to allow Z-tilt to shine)
    return Math.max(0, (normalizedZ - 0.5) * 40);
  });

  // RotateZ (The Splay/Fan effect):
  // Left cards tilt left (-), Right cards tilt right (+)
  const rotateZ = useTransform(rotateValue, (angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const sinVal = Math.sin(angleRad);

    // Tilt based on horizontal position.
    // Max tilt of ~15 degrees at the edges of the fan.
    return sinVal * 15;
  });

  // --- Scale & Visibility ---
  const scale = useTransform(z, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);
    // Exponential scale for front item
    return 0.4 + Math.pow(normalizedZ, 4) * 1.6; // Massive front card (2.0x)
  });

  const opacity = useTransform(z, (zVal) => {
    const normalizedZ = (zVal + radius) / (radius * 2);

    // Strict Cutoff: Only show the front ~30% of the circle
    if (normalizedZ < 0.7) return 0;

    // Fade the edges of the visible area
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

  // --- Center Detection ---
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
        rotateZ, // Applied the new splay rotation
        zIndex,
        scale,
        opacity,
        filter: blur,
        width: cardWidth,
        height: cardHeight,
        position: "absolute",
        marginLeft: -cardWidth / 1,
        marginTop: -cardHeight / 2,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
      }}
      className="will-change-transform flex items-center justify-center"
    >
      <CardContent type={card.type} isCenter={isCenter} />
    </motion.div>
  );
};
