import { motion } from "framer-motion";

export default function RateUpHighlight() {
  return (
    <>
      {/* Spinning Gradient Border - MASKED to be hollow */}
      <div
        className={`absolute -inset-[1.5px] rounded-xl z-0 overflow-hidden pointer-events-none`}
        style={{
          // Standard Mask Syntax
          maskImage: "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
          maskClip: "content-box, border-box",
          maskComposite: "exclude",

          // Webkit Mask Syntax (Chrome, Safari, etc)
          WebkitMaskImage:
            "linear-gradient(#fff 0 0), linear-gradient(#fff 0 0)",
          WebkitMaskClip: "content-box, border-box",
          WebkitMaskComposite: "xor",

          padding: "1.5px", // Thickness of the glowing border
        }}
      >
        <div
          className={`absolute inset-[-50%] animate-[spin_4s_linear_infinite] 
               bg-[conic-gradient(transparent_0deg,transparent_80deg,#ffd700_180deg,transparent_270deg)]
               `}
        />
      </div>
    </>
  );
}
