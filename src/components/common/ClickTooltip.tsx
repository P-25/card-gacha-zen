import { AnimatePresence, motion } from "framer-motion";
import React, { ReactNode, useState } from "react";

interface ClickTooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function ClickTooltip({
  content,
  children,
  className = "",
  disabled = false,
}: ClickTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation(); // Prevent triggering parent click handlers if any
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 2000);
  };

  return (
    <div
      className={`relative ${className} cursor-pointer`}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs font-medium rounded-lg text-center pointer-events-none z-50 whitespace-nowrap shadow-xl backdrop-blur-sm border border-white/10"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
