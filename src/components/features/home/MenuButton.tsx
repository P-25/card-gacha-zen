import Image from "next/image";

interface MenuButtonProps {
  title: string;
  subtitle: string;
  iconSrc: string;
  onClick?: () => void;
}

export default function MenuButton({
  title,
  subtitle,
  iconSrc,
  onClick,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full aspect-square bg-wh rounded-4xl shadow-[0_10px_30px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-4 group active:scale-95 transition-transform duration-200 border cursor-pointer min-w-[160px] bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl bg-gradient-to-b from-white/40 to-white/10"
    >
      {/* Icon */}
      <div className="relative w-28 h-28 mb-2 group-hover:scale-105 transition-transform duration-300">
        <Image
          src={iconSrc}
          alt={title}
          fill
          className="object-contain drop-shadow-md opacity-90"
        />
      </div>

      {/* Text */}
      <div className="text-center z-10">
        <h2 className="text-[#1a2e2e] text-2xl font-bold tracking-wide mb-0">
          {title}
        </h2>
        <p className="text-[#1a2e2e]/60 text-sm font-medium">{subtitle}</p>
      </div>

      {/* Inner Glow/Highlight */}
      <div className="absolute inset-0 rounded-4xl bg-linear-to-tr from-white/80 via-transparent to-transparent pointer-events-none" />
    </button>
  );
}
