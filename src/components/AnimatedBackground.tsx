'use client';

import { useState, useEffect } from 'react';

interface AnimatedItem {
  id: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
  emoji?: string;
}

const AnimatedBackground = () => {
  const [floatingIcons, setFloatingIcons] = useState<AnimatedItem[]>([]);
  const [particles, setParticles] = useState<AnimatedItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Generate floating icons
    const icons: AnimatedItem[] = [];
    const emojis = ['🍳', '🔥', '✨', '🌟', '💫', '🎭', '🎪', '🌪️'];
    
    for (let i = 0; i < 15; i++) {
      icons.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 5,
        animationDuration: 3 + Math.random() * 4,
        emoji: emojis[Math.floor(Math.random() * emojis.length)]
      });
    }
    
    // Generate particles
    const particleItems: AnimatedItem[] = [];
    for (let i = 0; i < 30; i++) {
      particleItems.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3
      });
    }
    
    setFloatingIcons(icons);
    setParticles(particleItems);
  }, []);

  if (!isClient) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 opacity-20"></div>
      </div>
    );
  }  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 opacity-20"></div>
      
      {/* Floating Food Icons */}
      {floatingIcons.map((item) => (
        <div
          key={item.id}
          className="absolute text-white/10 text-4xl animate-pulse"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            animationDelay: `${item.animationDelay}s`,
            animationDuration: `${item.animationDuration}s`
          }}
        >
          {item.emoji}
        </div>
      ))}
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {particles.map((item) => (
          <div
            key={item.id}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              animationDelay: `${item.animationDelay}s`,
              animationDuration: `${item.animationDuration}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
