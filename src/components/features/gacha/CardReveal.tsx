'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CardRevealProps {
  onReset: () => void;
}

const CARDS = [
  { id: 'stillness', name: 'Stillness', src: '/assets/cards/stillness.jpg' },
  { id: 'tranquility', name: 'Tranquility', src: '/assets/cards/tranquility.jpg' },
  { id: 'presence', name: 'Presence', src: '/assets/cards/presence.jpg' },
  { id: 'harmony', name: 'Harmony', src: '/assets/cards/harmony.jpg' },
  { id: 'forgiveness', name: 'Forgiveness', src: '/assets/cards/forgiveness.png' },
];

export default function CardReveal({ onReset }: CardRevealProps) {
  const [card, setCard] = useState(CARDS[0]);

  useEffect(() => {
    const randomCard = CARDS[Math.floor(Math.random() * CARDS.length)];
    setCard(randomCard);
  }, []);

  return (
    <motion.div
      key="card"
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="flex flex-col items-center gap-8"
    >
      {/* Card Reveal */}
      <div className="relative w-64 h-96 bg-[#F5F2EB] rounded-xl border-4 border-[#D8B4A0] shadow-2xl overflow-hidden group">
        <div className="absolute inset-0">
            <Image 
                src={card.src} 
                alt={card.name} 
                fill 
                className="object-cover"
            />
        </div>
        
        {/* Rarity Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#8FA89B]/20 to-transparent pointer-events-none" />
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-display font-bold text-[#4A4A4A] mb-1">{card.name}</h3>
        <div className="h-1 w-12 bg-[#8FA89B] mx-auto rounded-full" />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="px-8 py-3 bg-[#8FA89B] text-white font-bold rounded-full shadow-lg uppercase tracking-wider hover:bg-[#7A9286] transition-colors"
      >
        Meditate Again
      </motion.button>
    </motion.div>
  );
}
