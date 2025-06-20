import { useState, useEffect, useRef } from 'react';
import { Trophy, Star, Crown, Target, Award, Medal, Sparkles } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsProps {
  recipeCount: number;
  chaosCount: number;
  shareCount: number;
  playerLevel: number;
  playerXP: number;
  historicalRating?: string;
}

export default function Achievements({ 
  recipeCount, 
  chaosCount, 
  shareCount, 
  playerLevel,
  playerXP,
  historicalRating 
}: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const previousAchievements = useRef<Achievement[]>([]);

  useEffect(() => {
    const allAchievements: Achievement[] = [
      {
        id: 'first-recipe',
        title: 'Culinary Clown',
        description: 'Create your first absurd recipe',
        emoji: '🤡',
        unlocked: recipeCount >= 1,
        rarity: 'common'
      },
      {
        id: 'chaos-master',
        title: 'Master of Disaster',
        description: 'Use the chaos button 5 times',
        emoji: '💀',
        unlocked: chaosCount >= 5,
        progress: chaosCount,
        maxProgress: 5,
        rarity: 'rare'
      },
      {
        id: 'sauce-sorcerer',
        title: 'Sauce Sorcerer',
        description: 'Create 3 different recipes',
        emoji: '🧙‍♂️',
        unlocked: recipeCount >= 3,
        progress: recipeCount,
        maxProgress: 3,
        rarity: 'common'
      },
      {
        id: 'social-butterfly',
        title: 'Meme Spreader',
        description: 'Share your chaos on social media',
        emoji: '🦋',
        unlocked: shareCount >= 1,
        rarity: 'common'
      },
      {
        id: 'chaos-legend',
        title: 'Legend of Lunacy',
        description: 'Achieve maximum chaos (10+ clicks)',
        emoji: '👑',
        unlocked: chaosCount >= 10,
        progress: chaosCount,
        maxProgress: 10,
        rarity: 'epic'
      },
      {
        id: 'recipe-collector',
        title: 'Recipe Hoarder',
        description: 'Create 10 chaotic recipes',
        emoji: '📚',
        unlocked: recipeCount >= 10,
        progress: recipeCount,
        maxProgress: 10,
        rarity: 'epic'
      },
      {
        id: 'historically-approved',
        title: 'Historically Approved',
        description: 'Get a rating from a historical figure',
        emoji: '⚔️',
        unlocked: !!historicalRating,
        rarity: 'rare'
      },
      {
        id: 'chaos-apocalypse',
        title: 'Chaos Apocalypse',
        description: 'Click chaos button 25 times total',
        emoji: '🌪️',
        unlocked: chaosCount >= 25,
        progress: chaosCount,
        maxProgress: 25,
        rarity: 'legendary'
      },
      {
        id: 'level-5-master',
        title: 'Culinary Master',
        description: 'Reach level 5',
        emoji: '👑',
        unlocked: playerLevel >= 5,
        progress: playerLevel,
        maxProgress: 5,
        rarity: 'epic'
      },
      {
        id: 'xp-millionaire',
        title: 'XP Millionaire',
        description: 'Earn 1,000 XP points',
        emoji: '💰',
        unlocked: playerXP >= 1000,
        progress: playerXP,
        maxProgress: 1000,
        rarity: 'rare'
      },
      {
        id: 'level-7-legend',
        title: 'Chaos Culinary Legend',
        description: 'Reach the maximum level (7)',
        emoji: '🏆',
        unlocked: playerLevel >= 7,
        progress: playerLevel,
        maxProgress: 7,
        rarity: 'legendary'
      }    ];

    const prevAchievements = previousAchievements.current;
    const updatedAchievements = allAchievements;
    
    // Check for newly unlocked achievements
    const newUnlocks = updatedAchievements
      .filter(achievement => 
        achievement.unlocked && 
        !prevAchievements.find(prev => prev.id === achievement.id && prev.unlocked)
      )
      .map(achievement => achievement.id);
    
    if (newUnlocks.length > 0) {
      setNewlyUnlocked(newUnlocks);
      // Clear the notification after 4 seconds
      setTimeout(() => {
        setNewlyUnlocked(prev => prev.filter(id => !newUnlocks.includes(id)));
      }, 4000);
    }
    
    setAchievements(updatedAchievements);
    previousAchievements.current = updatedAchievements;
  }, [recipeCount, chaosCount, shareCount, historicalRating, playerLevel, playerXP]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

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

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'common', name: 'Common', icon: Star },
    { id: 'rare', name: 'Rare', icon: Award },
    { id: 'epic', name: 'Epic', icon: Medal },
    { id: 'legendary', name: 'Legendary', icon: Crown }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.rarity === selectedCategory);

  return (
    <div className="w-full max-w-6xl mx-auto">
      
      {/* New Achievement Notifications */}
      {newlyUnlocked.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-3">
          {newlyUnlocked.map(achievementId => {
            const achievement = achievements.find(a => a.id === achievementId);
            if (!achievement) return null;
            
            return (
              <div
                key={achievementId}
                className={`backdrop-blur-xl bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-4 rounded-2xl shadow-2xl ${getRarityGlow(achievement.rarity)} animate-bounce border-2 border-white/30 min-w-[300px]`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl animate-pulse">{achievement.emoji}</div>
                  <div className="flex-1">
                    <div className="font-black text-white text-lg">Achievement Unlocked!</div>
                    <div className="font-bold text-white/90">{achievement.title}</div>
                    <div className="text-white/70 text-sm capitalize">{achievement.rarity} • {achievement.description}</div>
                  </div>
                  <Sparkles className="text-white animate-spin" size={24} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-5xl font-black mb-4 flex items-center justify-center space-x-3">
          <Trophy className="text-yellow-400 animate-bounce" size={48} />
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Achievements
          </span>
          <Crown className="text-yellow-400 animate-pulse" size={48} />
        </h2>
        <p className="text-xl text-white/80 mb-8">Track your journey through culinary chaos!</p>
        
        {/* Overall Progress */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-white">Overall Progress</span>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {unlockedCount}/{achievements.length}
            </span>
          </div>
          
          <div className="relative bg-white/20 rounded-full h-6 overflow-hidden mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-full transition-all duration-1000 relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Recipes', value: recipeCount, color: 'blue', icon: '📝' },
              { label: 'Chaos Clicks', value: chaosCount, color: 'red', icon: '🌪️' },
              { label: 'Shares', value: shareCount, color: 'green', icon: '📤' },
              { label: 'Level', value: playerLevel, color: 'yellow', icon: '⭐' },
              { label: 'XP', value: playerXP.toLocaleString(), color: 'cyan', icon: '💎' },
              { label: 'Completed', value: unlockedCount, color: 'purple', icon: '🏆' }
            ].map((stat) => (
              <div key={stat.label} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-bold text-${stat.color}-300 mb-1`}>{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 scale-105'
                : 'backdrop-blur-sm bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            <category.icon size={18} />
            <span>{category.name}</span>
            {category.id !== 'all' && (
              <span className="bg-white/20 rounded-full px-2 py-1 text-xs">
                {achievements.filter(a => a.rarity === category.id && a.unlocked).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative group transition-all duration-500 ${
              achievement.unlocked
                ? `backdrop-blur-xl bg-gradient-to-br ${getRarityColor(achievement.rarity)}/20 border-2 border-white/30 rounded-3xl p-6 shadow-2xl ${getRarityGlow(achievement.rarity)} hover:scale-105`
                : 'backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl p-6 opacity-60 hover:opacity-80'
            }`}
          >
            {/* Rarity indicator */}
            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white capitalize ${
              achievement.unlocked 
                ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}` 
                : 'bg-gray-500'
            }`}>
              {achievement.rarity}
            </div>

            {/* Achievement Badge */}
            <div className="text-center mb-4">
              <div 
                className={`text-5xl mb-3 transition-transform duration-300 ${
                  achievement.unlocked ? 'scale-110 animate-pulse' : 'grayscale scale-90'
                }`}
              >
                {achievement.emoji}
              </div>
              <h3 
                className={`font-bold text-xl mb-2 ${
                  achievement.unlocked ? 'text-white' : 'text-white/50'
                }`}
              >
                {achievement.title}
              </h3>
            </div>

            {/* Description */}
            <p 
              className={`text-center mb-4 leading-relaxed ${
                achievement.unlocked ? 'text-white/90' : 'text-white/40'
              }`}
            >
              {achievement.description}
            </p>

            {/* Progress Bar (if applicable) */}
            {achievement.maxProgress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Progress</span>
                  <span className="text-white font-medium">
                    {Math.min(achievement.progress || 0, achievement.maxProgress)}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      achievement.unlocked 
                        ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}` 
                        : 'bg-gray-500'
                    }`}
                    style={{ 
                      width: `${Math.min(((achievement.progress || 0) / achievement.maxProgress) * 100, 100)}%` 
                    }}
                  >
                    {achievement.unlocked && (
                      <div className="h-full bg-white/20 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="text-center">
              {achievement.unlocked ? (
                <div className="space-y-2">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
                    <Trophy className="mr-2" size={16} />
                    Unlocked
                  </span>
                  {achievement.rarity === 'legendary' && (
                    <div className="text-xs text-yellow-300 font-medium animate-pulse">
                      ✨ Legendary Achievement! ✨
                    </div>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-500/20 text-gray-400">
                  <Target className="mr-2" size={16} />
                  Locked
                </span>
              )}
            </div>

            {/* Shine effect for unlocked achievements */}
            {achievement.unlocked && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 animate-pulse rounded-3xl"></div>
            )}

            {/* Legendary glow effect */}
            {achievement.unlocked && achievement.rarity === 'legendary' && (
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse -m-1"></div>
            )}
          </div>
        ))}
      </div>

      {/* Historical Rating Display */}
      {historicalRating && (
        <div className="mt-10 backdrop-blur-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 rounded-3xl p-8">
          <h4 className="font-bold text-amber-300 text-2xl mb-4 text-center flex items-center justify-center space-x-2">
            <Crown className="text-yellow-400" size={28} />
            <span>Historical Review</span>
            <Crown className="text-yellow-400" size={28} />
          </h4>
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6">
            <p className="text-amber-100 italic text-lg leading-relaxed text-center font-medium">
              &ldquo;{historicalRating}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Achievement completion message */}
      {unlockedCount === achievements.length && (
        <div className="mt-10 text-center">
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-400/40 rounded-3xl p-8">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-3xl font-black text-white mb-3">Chaos Master Achieved!</h3>
            <p className="text-white/80 text-lg">
              You&apos;ve unlocked every achievement! You are the ultimate chaos chef! 🧑‍🍳👑
            </p>
          </div>
        </div>
      )}
    </div>
  );
}