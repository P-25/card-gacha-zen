import Image from "next/image";
import React from "react";

interface TypeIconProps {
  type: string;
  size?: number;
  className?: string;
}

export default function TypeIcon({
  type,
  size = 30,
  className = "",
}: TypeIconProps) {
  // Normalize type to lowercase to match filename conventions
  const normalizedType = type.toLowerCase();

  // Default to a generic icon or handle missing types if necessary
  // For now, assuming all valid types have a corresponding .webp file
  const iconPath = `/assets/icons/${normalizedType}.webp`;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconPath}
        alt={type}
        fill
        className="object-contain"
        sizes={`${size}px`}
      />
    </div>
  );
}
