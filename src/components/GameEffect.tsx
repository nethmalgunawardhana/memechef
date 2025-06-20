'use client';

import { useEffect, useRef } from 'react';
import { Trophy, Star, Crown } from 'lucide-react';

interface GameEffectProps {
  type: 'success' | 'bonus' | 'level-up';
  message: string;
  onComplete?: () => void;
}

const GameEffect = ({ type, message, onComplete }: GameEffectProps) => {
  const effectRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (effectRef.current) {
      const timer = setTimeout(() => {
        if (effectRef.current) {
          effectRef.current.classList.add('opacity-0');
        }
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);
  
  return (
    <div ref={effectRef} className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className={`p-6 rounded-xl text-center transform animate-bounce-in ${
        type === 'success' ? 'bg-green-500/80 text-white' :
        type === 'bonus' ? 'bg-yellow-500/80 text-white' :
        'bg-purple-500/80 text-white'
      }`}>
        <div className="text-3xl font-bold mb-2">
          {type === 'success' && <Trophy className="inline-block mr-2" />}
          {type === 'bonus' && <Star className="inline-block mr-2" />}
          {type === 'level-up' && <Crown className="inline-block mr-2" />}
          {message}
        </div>
      </div>
    </div>
  );
};

export default GameEffect;
