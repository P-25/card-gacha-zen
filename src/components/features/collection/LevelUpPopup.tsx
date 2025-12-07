import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface LevelUpPopupProps {
  oldLevel: number;
  newLevel: number;
  oldAtk: number;
  newAtk: number;
  oldHp: number;
  newHp: number;
  onClose: () => void;
}

const RollingNumber = ({
  value,
  delay = 0,
}: {
  value: number;
  delay?: number;
}) => {
  const spring = useSpring(0, { bounce: 0, duration: 1000 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasStarted(true);
      spring.set(value);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, spring, delay]);

  return <motion.span>{hasStarted ? display : 0}</motion.span>;
};

export default function LevelUpPopup({
  oldLevel,
  newLevel,
  oldAtk,
  newAtk,
  oldHp,
  newHp,
  onClose,
}: LevelUpPopupProps) {
  // Sound effect placeholder
  useEffect(() => {
    // In a real app, we would play a sound here
    // const audio = new Audio('/sounds/levelup.mp3');
    // audio.play();
  }, []);

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
        className="relative w-full max-w-xs bg-[#Fdfcf8] rounded-3xl p-6 shadow-2xl overflow-hidden text-center"
      >
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 mb-6"
        >
          <h2 className="text-2xl font-black text-[#1a2e2e] uppercase tracking-wider">
            LEVEL UP!
          </h2>
          <div className="w-12 h-1 bg-[#6A9A6A] mx-auto mt-2 rounded-full" />
        </motion.div>

        {/* Stats Grid */}
        <div className="space-y-3 relative z-10">
          {/* Level */}
          <StatRow
            label="LEVEL"
            oldVal={oldLevel}
            newVal={newLevel}
            delay={0.4}
            color="text-[#1a2e2e]"
          />

          {/* ATK */}
          <StatRow
            label="ATK"
            oldVal={oldAtk}
            newVal={newAtk}
            delay={0.6}
            color="text-[#588558]"
          />

          {/* HP */}
          <StatRow
            label="HP"
            oldVal={oldHp}
            newVal={newHp}
            delay={0.8}
            color="text-[#588558]"
          />
        </div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          onClick={onClose}
          className="mt-8 w-full py-3 bg-[#1a2e2e] text-white rounded-xl font-bold uppercase tracking-wider hover:bg-[#2a3b3b] transition-colors shadow-lg text-sm"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}

function StatRow({
  label,
  oldVal,
  newVal,
  delay,
  color,
}: {
  label: string;
  oldVal: number;
  newVal: number;
  delay: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
      className="flex items-center justify-between bg-white rounded-xl p-3 border border-black/5 shadow-sm"
    >
      <span className="font-bold text-gray-400 text-xs uppercase tracking-wider w-16 text-left">
        {label}
      </span>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <span className="text-gray-400 font-bold text-lg">{oldVal}</span>

        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-gray-300"
          >
            <path
              fillRule="evenodd"
              d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>

        <span className={`font-black text-xl ${color} w-12 text-right`}>
          <RollingNumber value={newVal} delay={delay * 1000} />
        </span>
      </div>
    </motion.div>
  );
}
