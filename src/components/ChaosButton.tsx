import { useState } from 'react';
import { Shuffle, Zap, Skull, AlertTriangle, Flame } from 'lucide-react';
import { soundManager } from '@/services/soundManager';

interface ChaosButtonProps {
  onClick: () => void;
  isLoading: boolean;
  chaosCount: number;
  disabled?: boolean;
}

export default function ChaosButton({ onClick, isLoading, chaosCount, disabled = false }: ChaosButtonProps) {  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([]);
  
  // No need for sound management here, using sound manager

  const handleClick = () => {
    if (disabled || isLoading) return;
    
    setClickCount(prev => prev + 1);
    setIsShaking(true);
    
    // Play chaos button sound using sound manager
    soundManager.playSound('chaosButton');
    
    // Create particle explosion
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      emoji: getRandomEmoji(),
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(newParticles);
    
    // Clear particles and stop shaking
    setTimeout(() => {
      setIsShaking(false);
      setParticles([]);
    }, 1000);
    
    onClick();
  };
  const getChaosLevel = () => {
    if (chaosCount === 0) return { level: 'DORMANT', intensity: 0, color: 'gray' };
    if (chaosCount < 3) return { level: 'MILD CHAOS', intensity: 1, color: 'yellow' };
    if (chaosCount < 5) return { level: 'MODERATE MADNESS', intensity: 2, color: 'orange' };
    if (chaosCount < 10) return { level: 'EXTREME CHAOS', intensity: 3, color: 'red' };
    return { level: 'APOCALYPTIC ABSURDITY', intensity: 4, color: 'purple' };
  };

  const getButtonText = () => {
    if (isLoading) return 'SUMMONING CHAOS...';
    if (chaosCount === 0) return 'UNLEASH CHAOS';
    if (chaosCount < 5) return `MORE CHAOS! (${chaosCount})`;
    if (chaosCount < 10) return `EXTREME CHAOS! (${chaosCount})`;
    return `APOCALYPSE MODE! (${chaosCount})`;
  };

  const getRandomEmoji = () => {
    const chaosEmojis = ['🌪️', '💥', '🔥', '⚡', '🌋', '💫', '🎭', '🎪', '🎢', '🎯', '💀', '☄️', '🎮', '🎲', '🏆', '⭐', '✨', '💯'];
    return chaosEmojis[Math.floor(Math.random() * chaosEmojis.length)];
  };
    const getPowerUpText = () => {
    if (chaosCount === 0) return null;
    
    const powerUps = [
      'Spice Multiplier x2',
      'Flavor Boost +50',
      'Recipe Absurdity +100%',
      'Ingredient Randomizer',
      'Time Warp Cooking',
      'Chaos Enchantment',
      'Taste Confusion',
      'Gordon Ramsay Rage',
      'Flavor Explosion',
      'Kitchen Mayhem'
    ];
    
    if (chaosCount % 3 === 0) {
      const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
      return { text: powerUp, type: 'rare' };
    }
    
    if (chaosCount % 2 === 0) {
      const powerUp = powerUps[Math.floor(Math.random() * 5)];
      return { text: powerUp, type: 'common' };
    }
    
    return null;
  };

  const chaosStatus = getChaosLevel();

  const getButtonIcon = () => {
    if (isLoading) return <div className="animate-spin"><Zap size={28} /></div>;
    if (chaosStatus.intensity >= 4) return <Skull size={28} className="animate-bounce" />;
    if (chaosStatus.intensity >= 3) return <Flame size={28} className="animate-pulse" />;
    return <Shuffle size={28} />;
  };

  const getWarningLevel = () => {
    if (chaosStatus.intensity >= 4) return 'MAXIMUM';
    if (chaosStatus.intensity >= 3) return 'EXTREME';
    if (chaosStatus.intensity >= 2) return 'HIGH';
    return 'MODERATE';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
          <Zap className="text-yellow-400 animate-pulse" size={36} />
          <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Chaos Generator
          </span>
          <Zap className="text-yellow-400 animate-pulse" size={36} />
        </h3>
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-white/70 mb-1">Total Clicks</div>
              <div className="font-bold text-lg text-cyan-400">
                {chaosCount}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-1">Current Level</div>
              <div className={`font-bold text-lg text-${chaosStatus.color}-400`}>
                {chaosStatus.level}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-1">Warning Level</div>
              <div className="font-bold text-lg text-red-400 animate-pulse">
                {getWarningLevel()}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/70 mb-1">Reality Status</div>
              <div className="font-bold text-lg text-purple-400">
                {chaosStatus.intensity >= 3 ? 'BROKEN' : chaosStatus.intensity >= 2 ? 'UNSTABLE' : 'INTACT'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Chaos particles effect */}
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute text-3xl animate-ping"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  animationDuration: '0.8s'
                }}
              >
                {particle.emoji}
              </div>
            ))}
          </div>
        )}

        {/* Main Chaos Button */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${
            chaosStatus.intensity >= 4 ? 'from-purple-600 via-red-600 to-orange-600' :
            chaosStatus.intensity >= 3 ? 'from-red-600 via-orange-600 to-yellow-600' :
            chaosStatus.intensity >= 2 ? 'from-orange-600 via-red-600 to-pink-600' :
            chaosStatus.intensity >= 1 ? 'from-yellow-600 via-orange-600 to-red-600' :
            'from-gray-600 to-gray-700'
          } rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
          
          <button
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={`
              relative w-full py-8 px-10 rounded-3xl font-black text-2xl transition-all duration-300
              ${disabled 
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                : isLoading
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white cursor-wait animate-pulse'
                  : chaosStatus.intensity >= 4
                    ? 'bg-gradient-to-r from-purple-600 via-red-600 to-orange-600 text-white hover:scale-105 active:scale-95'
                    : chaosStatus.intensity >= 3
                      ? 'bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white hover:scale-105 active:scale-95'
                      : chaosStatus.intensity >= 2
                        ? 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white hover:scale-105 active:scale-95'
                        : chaosStatus.intensity >= 1
                          ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white hover:scale-105 active:scale-95'
                          : 'bg-gradient-to-r from-red-500 to-purple-600 text-white hover:scale-105 active:scale-95'
              }
              ${isShaking ? 'animate-bounce' : ''}
              shadow-2xl border-2 border-white/20
            `}
          >
            <div className="flex items-center justify-center space-x-4">
              {getButtonIcon()}
              <span className="leading-none">{getButtonText()}</span>
              {getButtonIcon()}
            </div>
            
            {/* Button glow effect */}
            <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              chaosStatus.intensity >= 3 ? 'bg-white/10' : 'bg-white/5'
            }`}></div>
          </button>
        </div>        {/* Power-Up Notification */}
        {getPowerUpText() && (
          <div className="mt-4 text-center animate-bounce">
            <div className={`inline-block px-4 py-2 rounded-lg ${
              getPowerUpText()?.type === 'rare' 
                ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50' 
                : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">
                  {getPowerUpText()?.type === 'rare' ? '🌟' : '✨'}
                </span>
                <span className={`font-bold ${
                  getPowerUpText()?.type === 'rare' 
                    ? 'text-purple-300' 
                    : 'text-blue-300'
                }`}>
                  {getPowerUpText()?.text} Unlocked!
                </span>
              </div>
            </div>
          </div>
        )}
      
        {/* Chaos intensity indicator */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <span className="text-white/70 text-sm font-medium">Chaos Intensity</span>
          </div>
          <div className="relative bg-white/20 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                chaosStatus.intensity === 0 ? 'bg-gray-500' :
                chaosStatus.intensity === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                chaosStatus.intensity === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                chaosStatus.intensity === 3 ? 'bg-gradient-to-r from-red-500 to-purple-500 animate-pulse' :
                'bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse'
              }`}
              style={{ width: `${Math.min((clickCount / 10) * 100, 100)}%` }}
            />
            {/* Intensity markers */}
            {[25, 50, 75, 100].map((mark, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/50">
            <span>Dormant</span>
            <span>Mild</span>
            <span>Extreme</span>
            <span>Apocalyptic</span>
          </div>
        </div>
      </div>

      {/* Warning messages */}
      {chaosStatus.intensity >= 2 && (
        <div className="mt-8 space-y-4">
          {chaosStatus.intensity >= 2 && chaosStatus.intensity < 4 && (
            <div className="backdrop-blur-sm bg-yellow-500/20 border border-yellow-400/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <AlertTriangle className="text-yellow-400" size={24} />
                <span className="text-yellow-300 font-bold text-lg">Warning: Dangerous Territory!</span>
                <AlertTriangle className="text-yellow-400" size={24} />
              </div>
              <p className="text-yellow-200">
                Chaos levels are approaching critical mass. Reality may start glitching!
              </p>
            </div>
          )}

          {chaosStatus.intensity >= 4 && (
            <div className="backdrop-blur-sm bg-red-500/20 border border-red-400/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Skull className="text-red-400 animate-bounce" size={28} />
                <span className="text-red-300 font-black text-xl animate-pulse">MAXIMUM CHAOS ACHIEVED!</span>
                <Skull className="text-red-400 animate-bounce" size={28} />
              </div>
              <p className="text-red-200 font-bold">
                🚨 REALITY HAS OFFICIALLY BROKEN! PROCEED AT YOUR OWN RISK! 🚨
              </p>
              <div className="mt-3 text-red-300 text-sm">
                The fabric of space-time is now questioning its life choices.
              </div>
            </div>
          )}
        </div>
      )}

      {disabled && !isLoading && (
        <div className="mt-6 text-center">
          <div className="inline-block backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl px-6 py-3">
            <span className="text-white/70 font-medium">
              🍳 Generate a recipe first to unleash chaos upon it!
            </span>
          </div>
        </div>
      )}

      {/* Fun chaos facts */}
      {chaosStatus.intensity >= 1 && (
        <div className="mt-6 text-center">
          <div className="inline-block backdrop-blur-sm bg-purple-500/10 border border-purple-400/30 rounded-xl px-4 py-2">
            <span className="text-purple-300 text-xs font-medium">
              💫 Fun Fact: Each chaos click increases recipe absurdity by approximately 247%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}