import React from "react";

interface SpecialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function SpecialButton({
  children,
  className = "",
  ...props
}: SpecialButtonProps) {
  return (
    <button
      className={`
        relative px-10 py-4
        bg-linear-to-r from-purple-600 via-pink-500 to-purple-600
        bg-size-[200%_auto] animate-shine
        text-white font-black tracking-widest uppercase
        rounded-full
        shadow-[0_0_20px_rgba(168,85,247,0.5)]
        hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]
        hover:scale-105
        active:scale-95
        transition-all duration-300
        border-2 border-white/20
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:scale-100
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
        {children}
      </span>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
}
