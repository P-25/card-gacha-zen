import { getRarityBorderColor, getStrokeImage } from "@/lib/rarityStyles";
import { Card } from "@/types/game";
import Image from "next/image";

interface CardProps {
  data: Card;
  isOpponent?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  status?: "WINNER" | "LOSER" | "NEUTRAL";
  isCharging?: boolean;
  activeState?: string;
}

const CRACK_OVERLAY = `
<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 50 L20 10 L30 40 L10 50 L40 60 L20 90 L50 70 L80 90 L70 50 L90 20 L60 30 Z" fill="black" fill-opacity="0.6"/>
  <path d="M50 50 L20 20 M50 50 L80 20 M50 50 L20 80 M50 50 L80 80" stroke="black" stroke-width="2"/>
</svg>
`;

export default function SingleCard({
  data,
  isFaceDown,
  onClick,
  disabled,
  className = "",
  status = "NEUTRAL",
  isCharging,
  activeState,
}: CardProps) {
  const borderColor = getRarityBorderColor(data.rarity || "common");

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`
        relative w-1/3 aspect-2/3 rounded-md shadow-md transition-all duration-300 transform preserve-3d
        ${
          disabled
            ? "cursor-default"
            : "cursor-pointer hover:scale-105 active:scale-95 hover:shadow-black-500/50"
        }
        ${isCharging ? "animate-pulse-fast" : ""}
        ${className}
      `}
      style={{ perspective: "1000px" }}
    >
      <div
        className="absolute inset-0 z-30 pointer-events-none rounded-lg"
        style={{ boxShadow: `inset 0 0 0 4px ${borderColor}` }}
      />
      {/* Charging Aura */}
      {isCharging && (
        <div
          className={`absolute -inset-4 rounded-xl blur-xl opacity-60 bg-red-500 animate-pulse`}
        ></div>
      )}

      <div
        className={`
        relative w-full h-full rounded-xl overflow-hidden
        transition-all duration-500 backface-hidden
        ${
          !isFaceDown &&
          `${
            status === "LOSER"
              ? "border-red-900 grayscale brightness-50"
              : "border-white border-opacity-50"
          }`
        }
      `}
      >
        {isFaceDown ? (
          // Card Back
          <div className="w-full h-full flex items-center justify-center relative">
            <Image
              src={"./assets/Card_Art/back/card_001.webp"}
              alt={data.name}
              fill
              className="object-cover no-global-filter"
            />
          </div>
        ) : (
          // Card Front
          <div className={`w-full h-full flex flex-col relative`}>
            {/* Image Area */}
            <div className="flex-1 h-full flex items-center justify-center relative overflow-hidden bg-white/60">
              <Image src={data.image} alt={data.name} fill />
            </div>

            {/* Stats Area */}
            <div className="absolute w-full bottom-0 bg-gradient-to-t from-black via-black/80 to-black/60 backdrop-blur-md p-1.5 flex flex-col justify-between z-10">
              <div className="flex justify-between items-end text-[9px] font-mono">
                <div className={`flex flex-col items-center flex-1`}>
                  <span
                    className={`${
                      activeState === "POW" ? "text-[#913833]" : "text-gray-400"
                    }`}
                  >
                    POW
                  </span>
                  <span
                    className={`font-bold text-xs ${
                      activeState === "POW" ? "text-[#913833]" : "text-white"
                    }`}
                  >
                    {data.state.pow}
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center flex-1 border-l border-gray-800`}
                >
                  <span
                    className={`${
                      activeState === "SPD" ? "text-[#8a46c2]" : "text-gray-400"
                    }`}
                  >
                    SPD
                  </span>
                  <span
                    className={`font-bold text-xs ${
                      activeState === "SPD" ? "text-[#8a46c2]" : "text-white"
                    }`}
                  >
                    {data.state.spd}
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center flex-1 border-l border-gray-800`}
                >
                  <span
                    className={`${
                      activeState === "DEF" ? "text-[#335991]" : "text-gray-400"
                    }`}
                  >
                    DEF
                  </span>
                  <span
                    className={`font-bold text-xs ${
                      activeState === "DEF" ? "text-[#335991]" : "text-white"
                    }`}
                  >
                    {data.state.def}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Light Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>

            {/* Cracks Overlay (Loser) */}
            {status === "LOSER" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-appear-crack z-20 mix-blend-multiply">
                <div
                  className="w-full h-full opacity-80"
                  dangerouslySetInnerHTML={{ __html: CRACK_OVERLAY }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
