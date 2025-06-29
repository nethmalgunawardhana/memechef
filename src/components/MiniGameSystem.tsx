'use client';

import { useState, useEffect, useRef, ReactElement } from 'react';
import { Gamepad2, Target, Timer, Zap, Trophy, Star } from 'lucide-react';

interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: ReactElement;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardXP: number;
  unlockLevel: number;
}

interface MiniGameSystemProps {
  playerLevel: number;
  onRewardEarned: (xp: number, gameType: string) => void;
}

export default function MiniGameSystem({ playerLevel, onRewardEarned }: MiniGameSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>({});
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const miniGames: MiniGame[] = [
    {
      id: 'ingredient-catcher',
      name: 'Ingredient Catcher',
      description: 'Catch falling ingredients! Avoid the rotten ones!',
      icon: <Target className="text-green-400" size={20} />,
      difficulty: 'easy',
      rewardXP: 75,
      unlockLevel: 1
    },
    {
      id: 'recipe-memory',
      name: 'Recipe Memory',
      description: 'Remember the ingredient sequence!',
      icon: <Star className="text-blue-400" size={20} />,
      difficulty: 'medium',
      rewardXP: 125,
      unlockLevel: 3
    },
    {
      id: 'chaos-clicker',
      name: 'Chaos Clicker',
      description: 'Click as fast as you can before time runs out!',
      icon: <Zap className="text-yellow-400" size={20} />,
      difficulty: 'hard',
      rewardXP: 200,
      unlockLevel: 5
    }
  ];

  // Ingredient Catcher Game Logic
  const IngredientCatcherGame = () => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [fallingItems, setFallingItems] = useState<Array<{
      id: number;
      x: number;
      y: number;
      emoji: string;
      type: 'good' | 'bad';
      speed: number;
    }>>([]);
    const [playerX, setPlayerX] = useState(50);
    const [gameStarted, setGameStarted] = useState(false);

    const goodIngredients = ['🍎', '🥕', '🧄', '🧅', '🍅', '🥬', '🥔', '🌶️'];
    const badIngredients = ['💀', '🦠', '🤮', '☠️'];

    useEffect(() => {
      if (!gameStarted || timeLeft <= 0) return;

      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }, [gameStarted, timeLeft]);

    useEffect(() => {
      if (!gameStarted) return;

      const spawnInterval = setInterval(() => {
        const isGood = Math.random() > 0.3;
        const ingredients = isGood ? goodIngredients : badIngredients;
        
        setFallingItems(prev => [...prev, {
          id: Date.now(),
          x: Math.random() * 90,
          y: 0,
          emoji: ingredients[Math.floor(Math.random() * ingredients.length)],
          type: isGood ? 'good' : 'bad',
          speed: Math.random() * 2 + 1
        }]);
      }, 800);

      return () => clearInterval(spawnInterval);
    }, [gameStarted]);

    useEffect(() => {
      if (!gameStarted) return;

      const moveInterval = setInterval(() => {
        setFallingItems(prev => prev
          .map(item => ({ ...item, y: item.y + item.speed }))
          .filter(item => {
            // Check collision with player
            if (item.y > 85 && item.y < 95 && Math.abs(item.x - playerX) < 8) {
              if (item.type === 'good') {
                setScore(s => s + 10);
              } else {
                setScore(s => Math.max(0, s - 20));
              }
              return false;
            }
            return item.y < 100;
          })
        );
      }, 50);

      return () => clearInterval(moveInterval);
    }, [gameStarted, playerX]);

    useEffect(() => {
      if (timeLeft <= 0 && gameStarted) {
        const reward = Math.floor(score / 10) * 5 + 25;
        onRewardEarned(reward, 'Ingredient Catcher');
        setCurrentGame(null);
      }
    }, [timeLeft, gameStarted, score]);

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!gameAreaRef.current) return;
      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setPlayerX(Math.max(5, Math.min(95, x)));
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold">Score: {score}</div>
          <div className="text-white font-bold">Time: {timeLeft}s</div>
        </div>
        
        {!gameStarted ? (
          <div className="text-center">
            <button
              onClick={() => setGameStarted(true)}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
            >
              Start Game!
            </button>
          </div>
        ) : (
          <div
            ref={gameAreaRef}
            className="relative bg-gradient-to-b from-blue-900/40 to-green-900/40 border border-white/20 rounded-xl h-80 overflow-hidden cursor-none"
            onMouseMove={handleMouseMove}
          >
            {/* Falling Items */}
            {fallingItems.map(item => (
              <div
                key={item.id}
                className="absolute text-2xl transition-all duration-100"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {item.emoji}
              </div>
            ))}
            
            {/* Player Basket */}
            <div
              className="absolute bottom-2 text-4xl transition-all duration-100"
              style={{
                left: `${playerX}%`,
                transform: 'translateX(-50%)'
              }}
            >
              🧺
            </div>
            
            <div className="absolute top-2 left-2 text-white/60 text-sm">
              Move mouse to control basket
            </div>
          </div>
        )}
      </div>
    );
  };

  // Recipe Memory Game Logic
  const RecipeMemoryGame = () => {
    const [sequence, setSequence] = useState<string[]>([]);
    const [playerSequence, setPlayerSequence] = useState<string[]>([]);
    const [showingSequence, setShowingSequence] = useState(false);
    const [level, setLevel] = useState(1);
    const [gameStarted, setGameStarted] = useState(false);
    const [message, setMessage] = useState('');

    const ingredients = ['🍎', '🥕', '🧄', '🧅', '🍅', '🥬'];

    const generateSequence = () => {
      const newSequence = [];
      for (let i = 0; i < level + 2; i++) {
        newSequence.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
      }
      setSequence(newSequence);
      setPlayerSequence([]);
      setShowingSequence(true);
      
      // Show sequence one by one
      newSequence.forEach((_, index) => {
        setTimeout(() => {
          if (index === newSequence.length - 1) {
            setTimeout(() => setShowingSequence(false), 800);
          }
        }, (index + 1) * 800);
      });
    };

    const handleIngredientClick = (ingredient: string) => {
      if (showingSequence) return;
      
      const newPlayerSequence = [...playerSequence, ingredient];
      setPlayerSequence(newPlayerSequence);
      
      // Check if correct
      if (ingredient !== sequence[newPlayerSequence.length - 1]) {
        setMessage('Wrong! Game Over');
        setTimeout(() => {
          const reward = (level - 1) * 25 + 50;
          onRewardEarned(reward, 'Recipe Memory');
          setCurrentGame(null);
        }, 2000);
        return;
      }
      
      // Check if sequence complete
      if (newPlayerSequence.length === sequence.length) {
        setLevel(prev => prev + 1);
        setMessage(`Level ${level} Complete!`);
        setTimeout(() => {
          setMessage('');
          generateSequence();
        }, 1500);
      }
    };

    useEffect(() => {
      if (gameStarted && sequence.length === 0) {
        generateSequence();
      }
    }, [gameStarted]);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold">Level: {level}</div>
          <div className="text-white font-bold">Progress: {playerSequence.length}/{sequence.length}</div>
        </div>
        
        {message && (
          <div className="text-center text-yellow-400 font-bold text-xl">{message}</div>
        )}
        
        {!gameStarted ? (
          <div className="text-center">
            <p className="text-white/80 mb-4">Remember the sequence and repeat it!</p>
            <button
              onClick={() => setGameStarted(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
            >
              Start Memory Test!
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sequence Display */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-white/70 text-sm mb-2">
                {showingSequence ? 'Watch the sequence:' : 'Repeat the sequence:'}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {sequence.map((ingredient, index) => (
                  <div
                    key={index}
                    className={`text-3xl p-2 rounded-lg transition-all duration-300 ${
                      showingSequence && index === Math.floor((Date.now() % (sequence.length * 800)) / 800)
                        ? 'bg-yellow-400/40 scale-110'
                        : 'bg-white/10'
                    } ${
                      !showingSequence && index < playerSequence.length
                        ? 'bg-green-500/40'
                        : ''
                    }`}
                  >
                    {showingSequence || index < playerSequence.length ? ingredient : '❓'}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ingredient Buttons */}
            {!showingSequence && (
              <div className="grid grid-cols-3 gap-3">
                {ingredients.map(ingredient => (
                  <button
                    key={ingredient}
                    onClick={() => handleIngredientClick(ingredient)}
                    className="text-4xl p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    {ingredient}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Chaos Clicker Game Logic
  const ChaosClickerGame = () => {
    const [clicks, setClicks] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameStarted, setGameStarted] = useState(false);
    const [multiplier, setMultiplier] = useState(1);

    useEffect(() => {
      if (!gameStarted || timeLeft <= 0) return;

      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }, [gameStarted, timeLeft]);

    useEffect(() => {
      if (timeLeft <= 0 && gameStarted) {
        const reward = clicks * 2 + 50;
        onRewardEarned(reward, 'Chaos Clicker');
        setCurrentGame(null);
      }
    }, [timeLeft, gameStarted, clicks]);

    const handleClick = () => {
      setClicks(prev => prev + multiplier);
      
      // Random multiplier boost
      if (Math.random() < 0.1) {
        setMultiplier(3);
        setTimeout(() => setMultiplier(1), 2000);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold">Clicks: {clicks}</div>
          <div className="text-white font-bold">Time: {timeLeft}s</div>
          {multiplier > 1 && (
            <div className="text-yellow-400 font-bold animate-pulse">
              {multiplier}x BOOST!
            </div>
          )}
        </div>
        
        {!gameStarted ? (
          <div className="text-center">
            <p className="text-white/80 mb-4">Click the button as fast as you can!</p>
            <button
              onClick={() => setGameStarted(true)}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
            >
              Start Clicking!
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={handleClick}
              className={`w-40 h-40 rounded-full text-6xl font-bold transition-all duration-100 active:scale-95 ${
                multiplier > 1
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              } hover:scale-105 text-white shadow-2xl`}
            >
              🔥
            </button>
            <div className="mt-4 text-white/70">Click the chaos button!</div>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentGame = () => {
    switch (currentGame) {
      case 'ingredient-catcher':
        return <IngredientCatcherGame />;
      case 'recipe-memory':
        return <RecipeMemoryGame />;
      case 'chaos-clicker':
        return <ChaosClickerGame />;
      default:
        return null;
    }
  };

  const availableGames = miniGames.filter(game => playerLevel >= game.unlockLevel);

  return (
    <>
      {/* Mini-Game Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-52 right-4 z-40 backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-teal-500/20 border-2 border-green-400/40 rounded-2xl p-4 hover:scale-105 transition-all duration-300"
      >
        <div className="flex items-center space-x-2">
          <Gamepad2 className="text-green-400" size={20} />
          <span className="text-white font-bold text-sm">Games</span>
        </div>
        <div className="text-xs text-white/70 text-center mt-1">
          {availableGames.length} games
        </div>
      </button>

      {/* Mini-Game Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-900/90 to-teal-900/90 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Gamepad2 className="text-green-400" size={28} />
                  <span>Mini-Games</span>
                </h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setCurrentGame(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {currentGame ? (
                /* Game Area */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {miniGames.find(g => g.id === currentGame)?.name}
                    </h3>
                    <button
                      onClick={() => setCurrentGame(null)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/40 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                      Exit Game
                    </button>
                  </div>
                  {renderCurrentGame()}
                </div>
              ) : (
                /* Game Selection */
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Choose Your Challenge</h3>
                    <p className="text-white/70">Play mini-games to earn bonus XP!</p>
                  </div>

                  <div className="grid gap-4">
                    {availableGames.map(game => (
                      <div
                        key={game.id}
                        onClick={() => setCurrentGame(game.id)}
                        className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {game.icon}
                            <div>
                              <h4 className="text-white font-bold text-lg">{game.name}</h4>
                              <p className="text-white/70 text-sm">{game.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">+{game.rewardXP} XP</div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              game.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                              game.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {game.difficulty.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white/10 rounded-xl p-3">
                          <div className="text-white/60 text-sm">
                            Difficulty: {game.difficulty} • Reward: {game.rewardXP} XP
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Locked Games */}
                  {miniGames.length > availableGames.length && (
                    <div className="mt-8 pt-6 border-t border-white/20">
                      <h4 className="text-white font-bold mb-4 text-center">🔒 Locked Games</h4>
                      <div className="grid gap-4">
                        {miniGames
                          .filter(game => playerLevel < game.unlockLevel)
                          .map(game => (
                            <div
                              key={game.id}
                              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 opacity-60"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {game.icon}
                                  <div>
                                    <h4 className="text-white/60 font-bold">{game.name}</h4>
                                    <p className="text-white/40 text-sm">{game.description}</p>
                                  </div>
                                </div>
                                <div className="bg-red-500/20 text-red-400 px-3 py-2 rounded-xl text-sm font-bold border border-red-400/40">
                                  Level {game.unlockLevel}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
