'use client';

import Image from 'next/image';

export default function Background() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none bg-[#F5F2EB]">
      <Image
        src="/assets/bamboo-bg.png"
        alt="Background"
        fill
        className="object-cover opacity-80"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60" />
    </div>
  );
}
