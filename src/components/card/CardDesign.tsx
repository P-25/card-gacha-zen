import { Card } from "@/types/game";
import Image from "next/image";

interface CardDesignProps {
  card: Card;
  className?: string;
}

export default function CardDesign({ card, className = "" }: CardDesignProps) {
  const {
    name,
    level,
    hp,
    atk,
    image,
    design_type,
    backgroundColor,
    textColor,
  } = card;

  // Define layout configurations based on design_type
  const getLayout = () => {
    switch (design_type) {
      case "Eternal":
        return {
          level: "top-3 left-3",
          states: "bottom-8 inset-x-0 text-center",
        };
      case "Hero":
        return {
          level: "top-3 left-3",
          states: "bottom-10 left-4 text-left",
        };
      case "Landbound":
        return {
          level: "bottom-3 left-3",
          states: "bottom-8 inset-x-0 text-center",
        };
      default:
        return {
          level: "top-3 left-3",
          states: "bottom-8 inset-x-0 text-center",
        };
    }
  };

  const layout = getLayout();

  return (
    <div className={`relative aspect-2/3  overflow-hidden shadow-xl group`}>
      {/* Card Image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Level Indicator */}
      <div className={`absolute ${layout.level} z-10`}>
        <div className="relative flex items-center justify-center w-10 h-10">
          <div
            className="absolute inset-0 rotate-45 rounded-sm border backdrop-blur-md"
            style={{
              backgroundColor: backgroundColor,
              color: textColor,
              borderColor: textColor,
            }}
          ></div>
          <span
            className="relative text-white font-bold font-display text-lg"
            style={{
              color: textColor,
            }}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Name */}
      <div
        className={`absolute ${layout.states} z-10 px-2`}
        style={{
          color: textColor,
        }}
      >
        <div
          id="stats"
          className={`flex justify-center items-center gap-4 text-xs min-h-[16px] transition-opacity duration-200`}
        >
          <span>•</span>
          <span>{hp} HP</span>
          <span>•</span>
          <span>{atk} ATK</span>
          <span>•</span>
        </div>
      </div>
    </div>
  );
}
