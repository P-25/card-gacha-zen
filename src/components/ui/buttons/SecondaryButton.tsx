import React from "react";

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function SecondaryButton({
  children,
  className = "",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`
        relative px-6 py-2.5
        bg-white/10 backdrop-blur-sm
        border border-white/30
        hover:bg-white/20 hover:border-white/50
        text-white/90 font-semibold tracking-wide
        rounded-lg
        transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
