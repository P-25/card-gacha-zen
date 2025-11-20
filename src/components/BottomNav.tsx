'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface BottomNavProps {
  activeTab: 'home' | 'gacha' | 'quests' | 'collection';
  onNavigate: (tab: 'home' | 'gacha' | 'quests' | 'collection') => void;
}

export default function BottomNav({ activeTab, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'quests', label: 'Quests', icon: '/assets/scroll_icon.svg', isMain: false },
    { id: 'home', label: 'Home', icon: '/assets/zen-icon-home-clean.png', isMain: true },
    { id: 'collection', label: 'Collection', icon: '/assets/zen-icon-collection-clean.png', isMain: false },
  ] as const;

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6 pt-4 z-50 pointer-events-none">
      <div className="relative flex items-center justify-around px-6 h-20 min-w-[320px] w-[90%] max-w-md bg-[#E8F3E8]/90 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id as any)}
              className={`relative flex flex-col items-center justify-center ${item.isMain ? '-mt-12' : ''} cursor-pointer`}
              whileTap={{ scale: 0.95 }}
            >
              {/* Main Icon Background Glow */}
              {item.isMain && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#E8F3E8] to-transparent opacity-60 blur-2xl rounded-full transform scale-150" />
              )}

              <motion.div
                animate={{
                  y: isActive ? (item.isMain ? -5 : -2) : 0,
                  scale: isActive ? 1.1 : 1,
                }}
                className={`relative flex items-center justify-center ${
                  item.isMain 
                    ? 'w-20 h-20 bg-[#F0F7F4] rounded-full shadow-xl border-4 border-[#E8F3E8] backdrop-blur-sm' 
                    : 'w-12 h-12'
                }`}
              >
                <div className={`relative ${item.isMain ? 'w-12 h-12' : 'w-8 h-8'}`}>
                  <Image
                    src={item.icon}
                    alt={item.label}
                    fill
                    className={`object-contain transition-all duration-300 ${
                      isActive 
                        ? 'brightness-0 opacity-100 drop-shadow-sm' 
                        : 'brightness-0 opacity-60 hover:opacity-80'
                    }`}
                  />
                </div>
              </motion.div>
              
              {!item.isMain && (
                <span className={`text-[10px] font-bold tracking-widest mt-1 transition-colors duration-300 ${
                  isActive ? 'text-[#1A2F23]' : 'text-[#2C4A3B]/70'
                }`}>
                  {item.label}
                </span>
              )}
              
              {isActive && !item.isMain && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-2 w-1 h-1 bg-[#1A2F23] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
