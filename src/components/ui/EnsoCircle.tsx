import { motion } from "framer-motion";

export const EnsoCircle = ({ className = "" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.path
        d="M50 15C30 15 15 30 15 50C15 70 30 85 50 85C70 85 85 70 85 50C85 35 75 20 60 15"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        style={{
          filter: "url(#brush-texture)",
        }}
      />
      <defs>
        <filter id="brush-texture">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
        </filter>
      </defs>
    </motion.svg>
  );
};
