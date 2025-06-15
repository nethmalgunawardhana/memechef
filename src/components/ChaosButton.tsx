import { useState } from 'react';

interface ChaosButtonProps {
  onChaosClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export default function ChaosButton({ onChaosClick, isLoading, disabled }: ChaosButtonProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    if (disabled || isLoading) return;
    
    setClickCount(prev => prev + 1);
    setIsShaking(true);
    
    // Stop shaking after animation
    setTimeout(() => setIsShaking(false), 500);
    
    onChaosClick();
  };

  const getChaosLevel = () => {
    if (clickCount === 0) return 'DORMANT';
    if (clickCount < 3) return 'MILD CHAOS';
    if (clickCount < 5) return 'MODERATE MADNESS';
    if (clickCount < 10) return 'EXTREME CHAOS';
    return 'APOCALYPTIC ABSURDITY';
  };

  const getButtonText = () => {
    if (isLoading) return 'SUMMONING CHAOS...';
    if (clickCount === 0) return 'UNLEASH CHAOS';
    return `MORE CHAOS! (${clickCount})`;
  };

  const getRandomEmoji = () => {
    const chaosEmojis = ['🌪️', '💥', '🔥', '⚡', '🌋', '💫', '🎭', '🎪', '🎢', '🎯'];
    return chaosEmojis[Math.floor(Math.random() * chaosEmojis.length)];
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-red-600 mb-2">⚡ Chaos Generator ⚡</h3>
        <div className="text-sm text-gray-600">
          Current Level: <span className="font-bold text-red-500">{getChaosLevel()}</span>
        </div>
      </div>

      <div className="relative">
        {/* Chaos particles effect */}
        {isShaking && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: '0.5s'
                }}
              >
                {getRandomEmoji()}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={disabled || isLoading}
          className={`
            w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300
            ${disabled 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : isLoading
                ? 'bg-orange-400 text-white cursor-wait animate-pulse'
                : 'bg-gradient-to-r from-red-500 to-purple-600 text-white hover:from-red-600 hover:to-purple-700 transform hover:scale-105 active:scale-95'
            }
            ${isShaking ? 'animate-bounce' : ''}
            shadow-lg hover:shadow-xl
          `}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">
              {isLoading ? '🌀' : clickCount > 5 ? '💀' : '🎲'}
            </span>
            <span>{getButtonText()}</span>
            <span className="text-2xl">
              {isLoading ? '🌀' : clickCount > 5 ? '💀' : '🎲'}
            </span>
          </div>
        </button>

        {/* Chaos intensity indicator */}
        <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              clickCount === 0 ? 'bg-gray-400' :
              clickCount < 3 ? 'bg-yellow-400' :
              clickCount < 5 ? 'bg-orange-500' :
              clickCount < 10 ? 'bg-red-500' :
              'bg-purple-600 animate-pulse'
            }`}
            style={{ width: `${Math.min((clickCount / 10) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Warning messages */}
      {clickCount > 3 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Warning: Chaos levels approaching dangerous territory! ⚠️
          </p>
        </div>
      )}

      {clickCount > 8 && (
        <div className="mt-2 p-3 bg-red-100 border border-red-400 rounded-lg text-center">
          <p className="text-red-800 text-sm font-bold animate-pulse">
            🚨 MAXIMUM CHAOS ACHIEVED! REALITY MAY BREAK! 🚨
          </p>
        </div>
      )}

      {disabled && !isLoading && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          Generate a recipe first to unleash chaos upon it!
        </div>
      )}
    </div>
  );
}
