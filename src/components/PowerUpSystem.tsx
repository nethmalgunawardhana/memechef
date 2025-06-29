'use client';

import { useState, useEffect } from 'react';
import { Zap, Star, Flame, Shield, Clock, Sparkles, Gift, Crown } from 'lucide-react';

interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  effect: 'double-xp' | 'chaos-boost' | 'time-freeze' | 'combo-protection' | 'instant-recipe' | 'mega-multiplier';
  duration: number; // in seconds
  cost: number; // XP cost
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel: number;
}

interface ActivePowerUp {
  id: string;
  name: string;
  effect: string;
  remainingTime: number;
  icon: React.ReactNode;
}

interface PowerUpSystemProps {
  playerLevel: number;
  playerXP: number;
  onXPSpent: (amount: number) => void;
  onPowerUpActivated: (effect: string, duration: number) => void;
}

export default function PowerUpSystem({ 
  playerLevel, 
  playerXP, 
  onXPSpent, 
  onPowerUpActivated 
}: PowerUpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [selectedPowerUp, setSelectedPowerUp] = useState<PowerUp | null>(null);

  const availablePowerUps: PowerUp[] = [
    {
      id: 'double-xp',
      name: 'Double XP Boost',
      description: 'Earn 2x XP from all actions for 60 seconds',
      icon: <Star className="text-yellow-400" size={20} />,
      effect: 'double-xp',
      duration: 60,
      cost: 100,
      rarity: 'common',
      unlockLevel: 2
    },
    {
      id: 'chaos-boost',
      name: 'Chaos Amplifier',
      description: 'Next 3 chaos clicks give triple points',
      icon: <Flame className="text-red-400" size={20} />,
      effect: 'chaos-boost',
      duration: 180,
      cost: 150,
      rarity: 'rare',
      unlockLevel: 3
    },
    {
      id: 'time-freeze',
      name: 'Time Freezer',
      description: 'Pause all timers and extend combos for 30 seconds',
      icon: <Clock className="text-blue-400" size={20} />,
      effect: 'time-freeze',
      duration: 30,
      cost: 200,
      rarity: 'rare',
      unlockLevel: 4
    },
    {
      id: 'combo-protection',
      name: 'Combo Shield',
      description: 'Protect your combo from breaking for 2 minutes',
      icon: <Shield className="text-green-400" size={20} />,
      effect: 'combo-protection',
      duration: 120,
      cost: 175,
      rarity: 'rare',
      unlockLevel: 3
    },
    {
      id: 'instant-recipe',
      name: 'Recipe Generator',
      description: 'Instantly generate a random recipe with bonus XP',
      icon: <Sparkles className="text-purple-400" size={20} />,
      effect: 'instant-recipe',
      duration: 1,
      cost: 250,
      rarity: 'epic',
      unlockLevel: 5
    },
    {
      id: 'mega-multiplier',
      name: 'Mega Multiplier',
      description: 'All points and XP gains are multiplied by 5x for 45 seconds',
      icon: <Crown className="text-orange-400" size={20} />,
      effect: 'mega-multiplier',
      duration: 45,
      cost: 500,
      rarity: 'legendary',
      unlockLevel: 6
    }
  ];

  // Filter power-ups by unlock level
  const unlockedPowerUps = availablePowerUps.filter(powerUp => playerLevel >= powerUp.unlockLevel);

  // Update active power-ups timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePowerUps(prev => 
        prev.map(powerUp => ({
          ...powerUp,
          remainingTime: Math.max(0, powerUp.remainingTime - 1)
        })).filter(powerUp => powerUp.remainingTime > 0)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activatePowerUp = (powerUp: PowerUp) => {
    if (playerXP < powerUp.cost) return;

    // Check if this power-up is already active
    const isAlreadyActive = activePowerUps.some(active => active.id === powerUp.id);
    if (isAlreadyActive) return;

    // Spend XP
    onXPSpent(powerUp.cost);

    // Add to active power-ups
    const newActivePowerUp: ActivePowerUp = {
      id: powerUp.id,
      name: powerUp.name,
      effect: powerUp.effect,
      remainingTime: powerUp.duration,
      icon: powerUp.icon
    };

    setActivePowerUps(prev => [...prev, newActivePowerUp]);
    onPowerUpActivated(powerUp.effect, powerUp.duration);

    // Play activation sound effect
    try {
      const audio = new Audio('/sounds/level-up.mp3');
      audio.volume = 0.3;
      audio.play();
    } catch (error) {
      console.log('Could not play power-up sound');
    }

    setIsOpen(false);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'epic': return 'from-purple-400 to-purple-500';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/20';
      case 'rare': return 'shadow-blue-500/30';
      case 'epic': return 'shadow-purple-500/40';
      case 'legendary': return 'shadow-yellow-500/50';
      default: return 'shadow-gray-500/20';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Power-Up Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-32 right-4 z-40 backdrop-blur-xl border-2 rounded-2xl p-4 transition-all duration-300 hover:scale-105 ${
          activePowerUps.length > 0
            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/40 animate-pulse'
            : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/40'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Zap className={activePowerUps.length > 0 ? 'text-yellow-400' : 'text-purple-400'} size={20} />
          <span className="text-white font-bold text-sm">Power</span>
        </div>
        {activePowerUps.length > 0 && (
          <div className="text-xs text-white/70 text-center mt-1">
            {activePowerUps.length} active
          </div>
        )}
      </button>

      {/* Active Power-Ups Display */}
      {activePowerUps.length > 0 && (
        <div className="fixed top-48 right-4 z-30 space-y-2">
          {activePowerUps.map((powerUp) => (
            <div
              key={powerUp.id}
              className="backdrop-blur-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/40 rounded-xl p-3 min-w-[160px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {powerUp.icon}
                  <span className="text-white text-sm font-medium">{powerUp.name}</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xs text-white/70 mb-1">Time left: {formatTime(powerUp.remainingTime)}</div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-1000"
                    style={{ 
                      width: `${(powerUp.remainingTime / (activePowerUps.find(p => p.id === powerUp.id)?.remainingTime || 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Power-Up Shop Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/90 to-pink-900/90 border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Zap className="text-purple-400" size={28} />
                    <span>Power-Up Shop</span>
                  </h2>
                  <p className="text-white/70 mt-1">Current XP: {playerXP.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Power-Up Grid */}
            <div className="p-6 max-h-[calc(90vh-150px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unlockedPowerUps.map((powerUp) => {
                  const canAfford = playerXP >= powerUp.cost;
                  const isActive = activePowerUps.some(active => active.id === powerUp.id);

                  return (
                    <div
                      key={powerUp.id}
                      className={`relative group transition-all duration-500 ${
                        canAfford && !isActive
                          ? `backdrop-blur-xl bg-gradient-to-br ${getRarityColor(powerUp.rarity)}/20 border-2 border-white/30 rounded-3xl p-6 shadow-2xl ${getRarityGlow(powerUp.rarity)} hover:scale-105 cursor-pointer`
                          : 'backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-6 opacity-60'
                      }`}
                      onClick={() => canAfford && !isActive && activatePowerUp(powerUp)}
                    >
                      {/* Rarity indicator */}
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white capitalize ${
                        canAfford && !isActive
                          ? `bg-gradient-to-r ${getRarityColor(powerUp.rarity)}` 
                          : 'bg-gray-500'
                      }`}>
                        {powerUp.rarity}
                      </div>

                      {/* Icon and Title */}
                      <div className="text-center mb-4">
                        <div className={`text-4xl mb-3 transition-transform duration-300 ${
                          canAfford && !isActive ? 'scale-110' : 'grayscale scale-90'
                        }`}>
                          {powerUp.icon}
                        </div>
                        <h3 className={`font-bold text-lg mb-2 ${
                          canAfford && !isActive ? 'text-white' : 'text-white/50'
                        }`}>
                          {powerUp.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className={`text-center mb-4 text-sm leading-relaxed ${
                        canAfford && !isActive ? 'text-white/90' : 'text-white/40'
                      }`}>
                        {powerUp.description}
                      </p>

                      {/* Duration */}
                      <div className="text-center mb-4">
                        <span className="text-white/70 text-xs">
                          Duration: {powerUp.duration}s
                        </span>
                      </div>

                      {/* Cost and Status */}
                      <div className="text-center">
                        {isActive ? (
                          <div className="bg-green-500/20 text-green-400 py-2 px-4 rounded-xl font-bold border border-green-400/40">
                            ✅ Active
                          </div>
                        ) : canAfford ? (
                          <div className={`bg-gradient-to-r ${getRarityColor(powerUp.rarity)} text-white py-2 px-4 rounded-xl font-bold`}>
                            🔥 {powerUp.cost} XP
                          </div>
                        ) : (
                          <div className="bg-gray-500/20 text-gray-400 py-2 px-4 rounded-xl font-bold border border-gray-400/40">
                            💰 {powerUp.cost} XP
                          </div>
                        )}
                      </div>

                      {/* Legendary glow effect */}
                      {canAfford && !isActive && powerUp.rarity === 'legendary' && (
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse -m-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Locked Power-ups */}
              {availablePowerUps.length > unlockedPowerUps.length && (
                <div className="mt-8 pt-6 border-t border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    🔒 Locked Power-Ups
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availablePowerUps
                      .filter(powerUp => playerLevel < powerUp.unlockLevel)
                      .map((powerUp) => (
                        <div
                          key={powerUp.id}
                          className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-6 opacity-40"
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-2 grayscale">
                              {powerUp.icon}
                            </div>
                            <h3 className="font-bold text-white/60 mb-2">{powerUp.name}</h3>
                            <p className="text-white/40 text-sm mb-3">{powerUp.description}</p>
                            <div className="bg-red-500/20 text-red-400 py-2 px-4 rounded-xl text-sm font-bold border border-red-400/40">
                              🔒 Unlock at Level {powerUp.unlockLevel}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
