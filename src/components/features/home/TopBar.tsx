'use client';

export default function TopBar() {
  return (
    <div className="relative z-20 pt-4 px-4 flex justify-between items-start">
      {/* Player Info */}
      <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md rounded-full p-1 pr-4 border border-white/30 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8FA89B] to-[#7A9286] border-2 border-white flex items-center justify-center font-display font-bold text-white text-lg shadow-md">
          5
        </div>
        <div className="flex flex-col">
          <span className="text-[#4A4A4A] font-bold text-sm leading-tight">PlayerOne</span>
          <div className="w-20 h-1.5 bg-white/50 rounded-full mt-1 overflow-hidden">
            <div className="w-[70%] h-full bg-[#D8B4A0]" />
          </div>
        </div>
      </div>

      {/* Currencies */}
      <div className="flex flex-col gap-2 items-end">
        <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-sm">
          <span className="text-[#D8B4A0] text-lg drop-shadow-sm">🪙</span>
          <span className="text-[#4A4A4A] font-bold font-display tracking-wide">1,250</span>
          <div className="w-6 h-6 bg-[#D8B4A0] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            +
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-sm">
          <span className="text-[#8FA89B] text-lg drop-shadow-sm">💎</span>
          <span className="text-[#4A4A4A] font-bold font-display tracking-wide">50</span>
          <div className="w-6 h-6 bg-[#8FA89B] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
            +
          </div>
        </div>
      </div>
    </div>
  );
}
