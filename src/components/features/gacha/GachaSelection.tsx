"use client";

import CommonButton from "@/components/ui/buttons/CommonButton";
import RateUpSummonSection from "./RateUpSummon/RateUpSummonSection";

import { Card, Resource } from "@/types/game";

import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";

interface GachaSelectionProps {
  onSummon: (type: "gem", count: number, results?: (Card | Resource)[]) => void;
}

export default function GachaSelection({ onSummon }: GachaSelectionProps) {
  const router = useRouter();
  return (
    <>
      <RateUpSummonSection onSummon={onSummon} />

      {/* Back Button (Bottom Left) */}
      <div className="flex justify-between w-full absolute bottom-1 px-6">
        {/* <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/")}
          className="z-50 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:bg-black/60 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </motion.button> */}
        {/* <CommonButton onClick={() => router.push("/")}>
          <Image
            src="/assets/icons/back.webp"
            alt="Back"
            width={24}
            height={24}
          />
        </CommonButton> */}

        <button
          onClick={() => router.push("/")}
          className="relative px-4 py-2 text-gray-800 font-medium  bg-[#FDF5E6] rounded-xl shadow-lg border-2 border-[#C5A059] active:translate-y-1 transition-all cursor-pointer"
        >
          <Image
            src="/assets/icons/back.webp"
            alt="Info"
            width={24}
            height={24}
          />
        </button>
        <div className="flex items-center justify-center">
          <p className="text-[#4A5568] text-center px-4 text-sm font-medium animate-pulse max-[400px]:text-[9px]">
            Cast Gems into the Rift to summon.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="relative px-4 py-2 text-gray-800 font-medium  bg-[#FDF5E6] rounded-xl shadow-lg border-2 border-[#C5A059] active:translate-y-1 transition-all cursor-pointer"
        >
          <Image
            src="/assets/icons/info-simple.webp"
            alt="Info"
            width={24}
            height={24}
          />
        </button>

        {/* Info Icon (Bottom Right) */}
        {/* <CommonButton className="" onClick={() => router.push("/")}>
          <Image
            src="/assets/icons/info-simple.webp"
            alt="Info"
            width={24}
            height={24}
          />
        </CommonButton> */}
      </div>
    </>
  );
}
