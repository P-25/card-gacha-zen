import React from "react";

interface CommonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function CommonButton({
  children,
  className = "",
  ...props
}: CommonButtonProps) {
  return (
    <button
      className={`
        relative px-4 py-2
        bg-gray-200 hover:bg-gray-300
        text-gray-800 font-medium
        border border-gray-400
        rounded
        transition-colors duration-150
        active:bg-gray-400
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
