import { useState, useEffect, useRef } from 'react';
import { Play, Volume2, Sparkles, Zap, Crown } from 'lucide-react';

interface AiChefProps {
  narration?: string;
  isNarrating: boolean;
  onStartNarration: () => void;
}

export default function AiChef({ narration, isNarrating, onStartNarration }: AiChefProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [chefMood, setChefMood] = useState('idle');
  const [showChefKissEmoji, setShowChefKissEmoji] = useState(false);
  
  // Sound effect reference
  const kissSound = useRef<HTMLAudioElement | null>(null);

  // Initialize sound effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      kissSound.current = new Audio('/sounds/chef-kiss.mp3');
    }
  }, []);

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
          
          // Show chef's kiss emoji after narration ends and play sound
          setTimeout(() => {
            setShowChefKissEmoji(true);
            if (kissSound.current) {
              kissSound.current.play().catch(console.error);
            }
            
            // Hide the emoji after 2 seconds
            setTimeout(() => {
              setShowChefKissEmoji(false);
            }, 2000);
          }, 500);
        }
      }, 50);

      return () => clearInterval(timer);
    }
  }, [narration, isNarrating]);

  const chefFaces = {
    idle: '🧑‍🍳',
    talking: '😤🧑‍🍳',
    excited: '🤩🧑‍🍳',
    thinking: '🤔🧑‍🍳',
    crazy: '🤪🧑‍🍳'
  };

  const getCurrentFace = () => {
    if (isNarrating) return chefFaces.talking;
    if (narration) return chefFaces[chefMood as keyof typeof chefFaces];
    return chefFaces.idle;
  };

  // Random chef mood changes
  useEffect(() => {
    if (!isNarrating && narration) {
      const moods = ['excited', 'crazy', 'thinking'];
      const interval = setInterval(() => {
        setChefMood(moods[Math.floor(Math.random() * moods.length)]);
        setTimeout(() => setChefMood('excited'), 1000);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isNarrating, narration]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
          <Sparkles className="text-yellow-400 animate-pulse" size={36} />
          <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            Chef Chaos AI
          </span>
          <Crown className="text-yellow-400 animate-bounce" size={36} />
        </h2>
        <p className="text-xl text-white/80 relative">
          Your unhinged culinary guide to absolute madness
          {/* Chef's kiss emoji that appears after narration ends */}
          {showChefKissEmoji && (
            <span className="absolute top-0 right-0 transform translate-x-12 -translate-y-1 text-3xl animate-bounce">
              👨‍🍳👌
            </span>
          )}
        </p>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-400/30 rounded-3xl p-8 shadow-2xl shadow-orange-500/20">
        
        {/* Animated Chef Head */}
        <div className="text-center mb-8 relative">
          <div className="relative inline-block">
            <div 
              className={`text-9xl transition-all duration-500 ${
                isAnimating ? 'animate-bounce' : 'hover:scale-110 cursor-pointer'
              } ${isNarrating ? 'animate-pulse' : ''}`}
              onClick={() => !isNarrating && narration && onStartNarration()}
            >
              {getCurrentFace()}
            </div>
            
            {/* Status indicator */}
            <div className="absolute -bottom-2 -right-2">
              <div className={`w-6 h-6 rounded-full border-4 border-white ${
                isNarrating ? 'bg-red-500 animate-pulse' : 
                narration ? 'bg-green-500' : 'bg-gray-400'
              }`}>
              </div>
            </div>
            
            {/* Floating emojis around chef */}
            {isNarrating && (
              <div className="absolute inset-0 pointer-events-none">
                {['💫', '✨', '🌟', '🔥', '🎵', '🧂'].map((emoji, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-ping"
                    style={{
                      left: `${25 + (i * 50) % 100}%`,
                      top: `${25 + (i * 25) % 50}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '1.5s'
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-3">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isNarrating ? 'bg-red-500 animate-pulse' : 
              narration ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <span className="text-white/70 font-medium">
              {isNarrating ? 'Speaking with Maximum Drama...' : 
               narration ? 'Ready to unleash chaos' : 
               'Waiting for ingredients to roast...'}
            </span>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="relative">
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 min-h-[200px] relative overflow-hidden">
            {/* Speech bubble pointer */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white/10"></div>
            </div>
            
            {narration ? (
              <div className="space-y-6">
                <div className="text-white/95 text-lg leading-relaxed font-medium">
                  {currentText || narration}
                  {isAnimating && <span className="animate-pulse text-purple-400 font-bold">|</span>}
                </div>
                
                {!isNarrating && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={onStartNarration}
                      className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center space-x-3">
                        <Volume2 size={20} className="animate-pulse" />
                        <span>Listen to Chef Chaos</span>
                        <Play size={18} />
                      </div>
                    </button>
                    
                    <div className="text-white/60 text-sm text-center">
                      Click the chef or this button for maximum drama! 🎭
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-white/70 italic text-lg leading-relaxed">
                <div className="mb-4 text-6xl animate-bounce">🍳</div>
                <p className="mb-4">
                  Upload some ingredients and I&apos;ll tell you the most ridiculous way to cook them!
                </p>
                <p className="text-white/50">
                  I&apos;ve got stories that&apos;ll make Gordon Ramsay question reality! ✨
                </p>
                
                {/* Floating cooking icons */}
                <div className="mt-6 flex justify-center space-x-8 text-3xl">
                  {['🔥', '⚡', '💥', '🌪️'].map((emoji, i) => (
                    <div
                      key={i}
                      className="animate-pulse opacity-30"
                      style={{ animationDelay: `${i * 0.5}s` }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chef Stats/Mood Indicators */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
              <Zap size={20} />
              <span className="font-bold">Drama Level</span>
            </div>
            <div className="text-white text-xl font-bold">MAXIMUM</div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
              <span>🔥</span>
              <span className="font-bold">Chaos Factor</span>
            </div>
            <div className="text-white text-xl font-bold">UNHINGED</div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-center space-x-2 text-purple-400 mb-2">
              <span>🎭</span>
              <span className="font-bold">Sanity Level</span>
            </div>
            <div className="text-white text-xl font-bold">NONEXISTENT</div>
          </div>
        </div>

        {/* Fun fact or tip */}
        {!isNarrating && (
          <div className="mt-6 text-center">
            <div className="inline-block backdrop-blur-sm bg-purple-500/10 border border-purple-400/30 rounded-xl px-6 py-3">
              <span className="text-purple-300 text-sm font-medium">
                💡 Pro Tip: The more chaotic your ingredients, the more unhinged my recipes become!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}