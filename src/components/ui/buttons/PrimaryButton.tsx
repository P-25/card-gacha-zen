import React from "react";
import { useSound } from "@/hooks/useSound";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function PrimaryButton({
  children,
  className = "",
  ...props
}: PrimaryButtonProps) {
  const { playClick } = useSound();
  return (
    <button
      onClick={(e) => {
        playClick();
        props.onClick?.(e);
      }}
      className={`
        relative px-8 py-3 
        bg-linear-to-r from-blue-600 to-blue-500 
        hover:from-blue-500 hover:to-blue-400 
        text-white font-bold tracking-wider uppercase
        rounded-xl shadow-[0_4px_0_rgb(29,78,216)] 
        active:shadow-none active:translate-y-[4px] 
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_rgb(29,78,216)]
        ${className}
      `}
      {...props}
    >
      <span className="drop-shadow-md">{children}</span>
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl bg-linear-to-tr from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
}
