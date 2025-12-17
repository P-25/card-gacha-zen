import { getStrokeImage } from "@/lib/rarityStyles";
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
}

const CARD_BACK_PATTERN = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#1f2937"/>
  <path d="M0 0 L50 50 L0 100" fill="none" stroke="#374151" stroke-width="2"/>
  <path d="M100 0 L50 50 L100 100" fill="none" stroke="#374151" stroke-width="2"/>
  <circle cx="50" cy="50" r="20" stroke="#4b5563" stroke-width="2" fill="none"/>
  <path d="M50 20 L50 80 M20 50 L80 50" stroke="#374151" stroke-width="1"/>
</svg>
`;

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
}: CardProps) {
  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`
        relative w-28 h-44 rounded-xl shadow-2xl transition-all duration-300 transform preserve-3d
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
              className="object-cover"
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
            <div className="absolute h-16 w-full bottom-0 bg-black bg-opacity-90 backdrop-blur-md p-1.5 flex flex-col justify-between border-t border-white border-opacity-20 z-10">
              <div className="text-[10px] font-black text-white truncate text-center uppercase tracking-widest bg-gradient-to-r from-transparent via-gray-800 to-transparent py-0.5 mb-1 border-b border-gray-800">
                {data.name}
              </div>
              <div className="flex justify-between items-end text-[9px] text-gray-400 font-mono">
                <div
                  className={`flex flex-col items-center flex-1 ${
                    data.state.pow > 80 ? "text-red-400" : ""
                  }`}
                >
                  <span>ATK</span>
                  <span className="font-bold text-white text-xs">
                    {data.state.pow}
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center flex-1 border-l border-gray-800 ${
                    data.state.def > 80 ? "text-yellow-400" : ""
                  }`}
                >
                  <span>HP</span>
                  <span className="font-bold text-white text-xs">
                    {data.state.def}
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center flex-1 border-l border-gray-800 ${
                    data.state.def > 80 ? "text-blue-400" : ""
                  }`}
                >
                  <span>HP</span>
                  <span className="font-bold text-white text-xs">
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
