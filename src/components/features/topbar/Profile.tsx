"use client";

import Image from "next/image";
import { useSelector } from "react-redux";
import profileIcons from "../../../config/profileIcons.json";
import { RootState } from "../../../store/store";

interface ProfileProps {
  onClick: () => void;
}

export default function Profile({ onClick }: ProfileProps) {
  const { activeProfilePicId } = useSelector(
    (state: RootState) => state.player
  );

  const activeIcon =
    profileIcons.find((icon) => icon.id === activeProfilePicId) ||
    profileIcons[0];

  return (
    <div
      onClick={onClick}
      className="w-12 h-12 max-[400px]:w-10 max-[400px]:h-10 rounded-full bg-gradient-to-br from-[#8FA89B] to-[#7A9286] border-2 border-white flex items-center justify-center shadow-md cursor-pointer overflow-hidden relative"
    >
      <Image
        src={activeIcon.imagePath}
        alt="Profile"
        fill
        className="object-cover"
      />
    </div>
  );
}
