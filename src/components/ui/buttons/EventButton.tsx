import React from "react";

interface EventButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function EventButton({
  children,
  className = "",
  ...props
}: EventButtonProps) {
  return (
    <button
      className={`
        relative px-8 py-3
        bg-linear-to-br from-red-600 to-orange-600
        text-white font-bold uppercase tracking-wider
        border-2 border-yellow-400
        rounded-sm
        shadow-[4px_4px_0_#b45309]
        hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#b45309]
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#b45309]
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_#b45309]
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="text-yellow-300">★</span>
        <span className="drop-shadow-md">{children}</span>
        <span className="text-yellow-300">★</span>
      </div>
    </button>
  );
}
