'use client';

import { motion } from 'framer-motion';

interface PlaceholderScreenProps {
  title: string;
  icon?: string;
}

export function PlaceholderScreen({ title, icon = "🔒" }: PlaceholderScreenProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8FA89B] via-[#F5F2EB] to-[#F5F2EB]" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-2xl bg-white/40 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-sm"
        >
          <span className="text-4xl text-[#4A4A4A]">{icon}</span>
        </motion.div>
        
        <h2 className="text-3xl font-display font-bold text-[#4A4A4A]">
          {title}
        </h2>
        
        <p className="text-[#8FA89B] font-bold tracking-widest uppercase text-sm">
          Coming Soon
        </p>
      </div>
    </div>
  );
}
