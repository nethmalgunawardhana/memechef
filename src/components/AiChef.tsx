import { useState, useEffect } from 'react';

interface AiChefProps {
  narration?: string;
  isNarrating: boolean;
  onStartNarration: () => void;
}

export default function AiChef({ narration, isNarrating, onStartNarration }: AiChefProps) {  const [isAnimating, setIsAnimating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  // Typewriter effect for narration
  useEffect(() => {
    if (narration && isNarrating) {
      setIsAnimating(true);
      setCurrentText('');
      let index = 0;
      
      const timer = setInterval(() => {
        if (index < narration.length) {
          setCurrentText(narration.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsAnimating(false);
        }
      }, 50);

      return () => clearInterval(timer);
    }
  }, [narration, isNarrating]);

  const chefFaces = {
    idle: '🧑‍🍳',
    talking: '😤🧑‍🍳',
    excited: '🤩🧑‍🍳',
    thinking: '🤔🧑‍🍳'
  };

  const getCurrentFace = () => {
    if (isNarrating) return chefFaces.talking;
    if (narration) return chefFaces.excited;
    return chefFaces.idle;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-orange-600 mb-2">🎭 Chef Chaos AI</h2>
        <p className="text-gray-600">Your unhinged culinary guide</p>
      </div>

      <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-6 shadow-lg">
        {/* Animated Chef Head */}
        <div className="text-center mb-4">
          <div 
            className={`text-8xl transition-transform duration-300 ${
              isAnimating ? 'animate-bounce' : 'hover:scale-110'
            }`}
          >
            {getCurrentFace()}
          </div>
          <div className="mt-2">
            <div className={`inline-block w-3 h-3 bg-green-500 rounded-full ${isNarrating ? 'animate-pulse' : ''}`}></div>
            <span className="ml-2 text-sm text-gray-600">
              {isNarrating ? 'Speaking...' : narration ? 'Ready to speak' : 'Waiting for recipe...'}
            </span>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="relative bg-white rounded-lg p-4 shadow-inner min-h-[120px]">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45"></div>
          
          {narration ? (
            <div className="space-y-3">
              <div className="text-gray-800 leading-relaxed">
                {currentText || narration}
                {isAnimating && <span className="animate-pulse">|</span>}
              </div>
              
              {!isNarrating && (
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={onStartNarration}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>🔊</span>
                    <span>Listen to Chef Chaos</span>
                  </button>
                </div>
              )}
            </div>
          ) : (            <div className="text-center text-gray-500 italic">
              Upload some ingredients and I&apos;ll tell you the most ridiculous way to cook them! 
              I&apos;ve got stories that&apos;ll make Gordon Ramsay question reality! 🍳✨
            </div>
          )}
        </div>

        {/* Voice Controls */}
        {narration && (
          <div className="mt-4 flex justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <span>🎭</span>
              <span>Drama Level: Maximum</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span>🔥</span>
              <span>Chaos Factor: UNHINGED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
