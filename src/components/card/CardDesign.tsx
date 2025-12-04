import { Card } from "@/types/game";
import Image from "next/image";

interface CardDesignProps {
  card: Card;
  hideStates?: boolean;
  className?: string;
}

export default function CardDesign({
  card,
  hideStates = true,
  className = "",
}: CardDesignProps) {
  const { name, level, hp, atk, image, design_type, textColor } = card;

  // Optimized Layout Map
  const getLayout = () => {
    switch (design_type) {
      case "Eternal":
        return {
          level: "top-[2%] left-[2%]",
          stats: "bottom-[5%] inset-x-0 justify-center",
        };
      case "Hero":
        return {
          level: "top-[2%] left-[2%]",
          stats: "bottom-[10%] left-[6%] justify-start",
        };
      case "Landbound":
        return {
          level: "bottom-[4%] left-[4%]",
          stats: "bottom-[8%] inset-x-0 justify-center",
        };
      default:
        return {
          level: "top-[4%] left-[4%]",
          stats: "bottom-[8%] inset-x-0 justify-center",
        };
    }
  };

  const layout = getLayout();

  return (
    <div
      // PERF: Added transform-gpu and backface-hidden to prevent repaints during flip
      className={`relative w-full h-full aspect-[2/3] overflow-hidden shadow-2xl group rounded-xl transform-gpu backface-hidden ${className}`}
      // PERF: Only use container queries if absolutely necessary.
      // 'inline-size' is lighter than 'size'.
      style={{ containerType: "inline-size" }}
    >
      {/* Card Image */}
      <div className="absolute inset-0 bg-slate-800">
        {image && (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            // PERF: Drastically reduce image size fetch.
            // The card is rarely larger than 300px on screen.
            sizes="(max-width: 768px) 50vw, 300px"
            priority={true}
            // PERF: Eager loading helps, but 'priority' already handles this.
          />
        )}
      </div>

      {/* Level Indicator */}
      {card.type === "CARD" && !hideStates && (
        <div className={`absolute ${layout.level} z-10 w-[15%]`}>
          <div className="relative flex items-center justify-center w-full aspect-square">
            <div
              // PERF: Removed backdrop-blur-md. This causes massive lag on mobile GPUs.
              // Replaced with static alpha background.
              className="absolute inset-0 rotate-45 rounded-[15%] border bg-black/40"
              style={{
                color: textColor || "#fff",
                borderColor: textColor || "#fff",
                borderWidth: "1px", // Simplified border calc
              }}
            ></div>
            <span
              className="relative font-bold font-display leading-none"
              style={{
                color: textColor || "#fff",
                // PERF: Fixed weird 666cqw value.
                fontSize: "min(20cqw, 20px)",
              }}
            >
              {level || 1}
            </span>
          </div>
        </div>
      )}

      {/* Name / Stats */}
      {card.type === "CARD" && !hideStates && (
        <div
          className={`absolute ${layout.stats} z-10 px-[2%] w-full flex items-center`}
          style={{
            color: textColor || "#fff",
          }}
        >
          <div
            id="stats"
            className={`flex items-center gap-[3cqw] w-full transition-opacity duration-200`}
            style={{
              fontSize: "min(6cqw, 14px)",
              justifyContent: design_type === "Hero" ? "flex-start" : "center",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)", // Cheaper than drop-shadow filter
            }}
          >
            <span>•</span>
            <span className="whitespace-nowrap">{hp || 100} HP</span>
            <span>•</span>
            <span className="whitespace-nowrap">{atk || 10} ATK</span>
            <span>•</span>
          </div>
        </div>
      )}

      {/* Gloss Effect (Static, GPU friendly) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
