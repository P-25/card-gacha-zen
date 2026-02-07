/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
import React from "react";

interface CircleBackgroundProps {
  summonStarted: boolean; // active ("fast") state
}

const CircleBackground = ({ summonStarted }: CircleBackgroundProps) => {
  const isActive = summonStarted;

  const runesOuter =
    "🜁 🜂 🜃 🜄 🜅 🜆 🜇 🜈 🜉 🜊 🜋 🜌 🜍 🜎 🜏 🜐 🜑 🜒 🜓 🜔 🜕 🜖 🜗 🜘 🜙 🜚 🜛 🜜 🜝 🜞 🜟 🜠 🜡 🜢 🜣 🜤 🜥 🜦";
  const runesInner = "🜧 🜨 🜩 🜪 🜫 🜬 🜭 🜮 🜯 🜰 🜱 🜲 🜳 🜴";
  const symbols = ["🜚", "🜛", "🜜", "🜝", "🜞", "🜟", "🜠", "🜡"];

  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden bg-transparent w-full h-full">
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        {/* --- MAGIC CIRCLE SCALABLE SVG --- */}
        <svg
          viewBox="0 0 500 500"
          className={`w-full h-full transition-all duration-1000 ${
            isActive
              ? "drop-shadow-[0_0_80px_rgba(255,200,50,0.9)]"
              : "drop-shadow-xl"
          }`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="goldGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={"#C5A059"} />
              <stop offset="50%" stopColor={"#E6D28F"} />
              <stop offset="100%" stopColor={"#8B7355"} />
            </linearGradient>

            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur
                stdDeviation={isActive ? "6" : "2"}
                result="blur"
              />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <path
              id="textCirclePath"
              d="M 250, 250 m -190, 0 a 190,190 0 1,1 380,0 a 190,190 0 1,1 -380,0"
            />
            <path
              id="innerCirclePath"
              d="M 250, 250 m -130, 0 a 130,130 0 1,1 260,0 a 130,130 0 1,1 -260,0"
            />
          </defs>

          {/* --- STATIC OUTER RIMS --- */}
          <circle
            cx="250"
            cy="250"
            r="235"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="4"
            className="opacity-80"
          />
          <circle
            cx="250"
            cy="250"
            r="225"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="2"
            className="opacity-60"
          />

          {/* Layer 1: Outer Runes (Clockwise) */}
          <g
            className="origin-center"
            style={
              {
                animation: `spin ${isActive ? "10s" : "60s"} linear infinite`,
              } as React.CSSProperties
            }
          >
            <text width="500">
              <textPath
                href="#textCirclePath"
                startOffset="0%"
                className={`font-bold tracking-[14px] transition-colors duration-300 ${
                  isActive ? "fill-[darkgoldenrod]" : "fill-[#A89F91]"
                }`}
                style={{ fontSize: "26px" }}
              >
                {runesOuter}
              </textPath>
            </text>
          </g>

          {/* Layer 2: Geometric Octagon & Squares (Counter-Clockwise) */}
          <g
            className="origin-center"
            style={
              {
                animation: `spin ${
                  isActive ? "3s" : "40s"
                } linear infinite reverse`,
              } as React.CSSProperties
            }
          >
            <rect
              x="125"
              y="125"
              width="250"
              height="250"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="4"
              className="opacity-60"
            />
            <rect
              x="125"
              y="125"
              width="250"
              height="250"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="4"
              className="opacity-40 origin-center rotate-45"
            />

            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <g key={i} transform={`rotate(${deg}, 250, 250)`}>
                <circle
                  cx="250"
                  cy="125"
                  r="5"
                  fill={isActive ? "darkgoldenrod" : "#C5A059"}
                  className="opacity-80"
                />
              </g>
            ))}
          </g>

          {/* Layer 3: Inner Runes & Compass (Clockwise Fast) */}
          <g
            className="origin-center"
            style={
              {
                animation: `spin ${innerTextRotation(isActive)} linear infinite`,
              } as React.CSSProperties
            }
          >
            <circle
              cx="250"
              cy="250"
              r="145"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="4"
            />
            <text width="500">
              <textPath
                href="#innerCirclePath"
                startOffset="0%"
                className={`font-bold tracking-[28px] transition-colors duration-300 ${
                  isActive ? "fill-[darkgoldenrod]" : "fill-[#8B7E66]"
                }`}
                style={{ fontSize: "18px" }}
              >
                {runesInner}
              </textPath>
            </text>
          </g>

          {/* Layer 4: Hexagram (6-pointed star) - Counter-Clockwise Rotation & Pulse */}
          <g
            className="origin-center"
            style={
              {
                animation: `spin ${
                  isActive ? "1s" : "30s"
                } linear infinite reverse`,
              } as React.CSSProperties
            }
          >
            <g className="animate-pulse-slow">
              <polygon
                points="250,150 336.6,300 163.4,300"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="4"
                className="opacity-70"
              />
              <polygon
                points="250,350 336.6,200 163.4,200"
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="4"
                className="opacity-70"
              />
            </g>

            {symbols.map((sym, i) => {
              const angle = i * (360 / 6);
              const r = 90;
              const x = 250 + r * Math.cos(((angle - 90) * Math.PI) / 180);
              const y = 250 + r * Math.sin(((angle - 90) * Math.PI) / 180);
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isActive ? "darkgoldenrod" : "#C5A059"}
                  fontSize="14"
                  transform={`rotate(${angle}, ${x}, ${y})`}
                >
                  {sym}
                </text>
              );
            })}
          </g>

          {/* Layer 5: Center Core */}
          <g className="origin-center">
            {/* Background Glow Pulse */}
            <circle
              cx="250"
              cy="250"
              r={isActive ? "100" : "40"}
              fill={"none"}
              stroke="url(#goldGradient)"
              strokeWidth="2"
              className="transition-all duration-1000"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur={isActive ? "3s" : "3s"}
                repeatCount="indefinite"
              />
            </circle>

            {/* Inner Eye */}
            <circle
              cx="250"
              cy="250"
              r="10"
              fill={isActive ? "darkgoldenrod" : "#C5A059"}
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.5;1;0.5"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-pulse-slow {
             animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

const innerTextRotation = (isActive: boolean) => (isActive ? "1.5s" : "25s");

export default CircleBackground;
