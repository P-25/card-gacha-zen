'use client';

import TopBar from '@/components/features/home/TopBar';
import SummonGate from '@/components/features/home/SummonGate';

interface HomeScreenProps {
  onNavigate: (screen: 'gacha' | 'quests' | 'collection') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <TopBar />
      <SummonGate onSummon={() => onNavigate('gacha')} />
      
      {/* Spacer for persistent nav */}
      <div className="relative z-20 pb-24 px-4 pointer-events-none" />
    </div>
  );
}
