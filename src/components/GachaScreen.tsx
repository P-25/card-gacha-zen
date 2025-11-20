'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChestAnimation from '@/components/features/gacha/ChestAnimation';
import CardReveal from '@/components/features/gacha/CardReveal';

export default function GachaScreen() {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const handleOpen = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);
    
    // Sequence: Shake -> Burst -> Open -> Show Card
    setTimeout(() => {
      setIsOpened(true);
      setIsOpening(false);
      setTimeout(() => setShowCard(true), 500);
    }, 2000);
  };

  const handleReset = () => {
    setShowCard(false);
    setIsOpened(false);
    setIsOpening(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-24">
      <AnimatePresence mode="wait">
        {!showCard ? (
          <ChestAnimation 
            isOpening={isOpening} 
            isOpened={isOpened} 
            onOpen={handleOpen} 
          />
        ) : (
          <CardReveal onReset={handleReset} />
        )}
      </AnimatePresence>
    </div>
  );
}
