import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsProps {
  recipeCount: number;
  chaosCount: number;
  shareCount: number;
  historicalRating?: string;
}

export default function Achievements({ 
  recipeCount, 
  chaosCount, 
  shareCount, 
  historicalRating 
}: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  useEffect(() => {
    const allAchievements: Achievement[] = [
      {
        id: 'first-recipe',
        title: 'Culinary Clown',
        description: 'Create your first absurd recipe',
        emoji: '🤡',
        unlocked: recipeCount >= 1
      },
      {
        id: 'chaos-master',
        title: 'Master of Disaster',
        description: 'Use the chaos button 5 times',
        emoji: '💀',
        unlocked: chaosCount >= 5,
        progress: chaosCount,
        maxProgress: 5
      },
      {
        id: 'sauce-sorcerer',
        title: 'Sauce Sorcerer',
        description: 'Create 3 different recipes',
        emoji: '🧙‍♂️',
        unlocked: recipeCount >= 3,
        progress: recipeCount,
        maxProgress: 3
      },
      {
        id: 'social-butterfly',
        title: 'Meme Spreader',
        description: 'Share your chaos on social media',
        emoji: '🦋',
        unlocked: shareCount >= 1
      },
      {
        id: 'chaos-legend',
        title: 'Legend of Lunacy',
        description: 'Achieve maximum chaos (10+ clicks)',
        emoji: '👑',
        unlocked: chaosCount >= 10,
        progress: chaosCount,
        maxProgress: 10
      },
      {
        id: 'recipe-collector',
        title: 'Recipe Hoarder',
        description: 'Create 10 chaotic recipes',
        emoji: '📚',
        unlocked: recipeCount >= 10,
        progress: recipeCount,
        maxProgress: 10
      },
      {
        id: 'historically-approved',
        title: 'Historically Approved',
        description: 'Get a rating from a historical figure',
        emoji: '⚔️',
        unlocked: !!historicalRating
      },
      {
        id: 'chaos-apocalypse',
        title: 'Chaos Apocalypse',
        description: 'Click chaos button 25 times total',
        emoji: '🌪️',
        unlocked: chaosCount >= 25,
        progress: chaosCount,
        maxProgress: 25
      }
    ];

    const prevAchievements = achievements;
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
      // Clear the notification after 3 seconds
      setTimeout(() => {
        setNewlyUnlocked(prev => prev.filter(id => !newUnlocks.includes(id)));
      }, 3000);
    }
    
    setAchievements(updatedAchievements);
  }, [recipeCount, chaosCount, shareCount, historicalRating, achievements]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercentage = (unlockedCount / achievements.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2">🏆 Achievements</h2>
        <p className="text-gray-600 mb-4">Track your journey through culinary chaos!</p>
        
        {/* Overall Progress */}
        <div className="bg-white rounded-lg p-4 shadow-md mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-indigo-600">
              {unlockedCount}/{achievements.length}
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>
      </div>

      {/* New Achievement Notifications */}
      {newlyUnlocked.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newlyUnlocked.map(achievementId => {
            const achievement = achievements.find(a => a.id === achievementId);
            if (!achievement) return null;
            
            return (
              <div
                key={achievementId}
                className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg shadow-lg animate-bounce border-2 border-yellow-500"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{achievement.emoji}</span>
                  <div>
                    <div className="font-bold text-sm">Achievement Unlocked!</div>
                    <div className="text-xs">{achievement.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-400 shadow-md'
                : 'bg-gray-50 border-gray-300 opacity-60'
            }`}
          >
            {/* Achievement Badge */}
            <div className="text-center mb-3">
              <div 
                className={`text-4xl mb-2 transition-transform duration-300 ${
                  achievement.unlocked ? 'scale-110' : 'grayscale'
                }`}
              >
                {achievement.emoji}
              </div>
              <h3 
                className={`font-bold text-lg ${
                  achievement.unlocked ? 'text-amber-700' : 'text-gray-500'
                }`}
              >
                {achievement.title}
              </h3>
            </div>

            {/* Description */}
            <p 
              className={`text-sm text-center mb-3 ${
                achievement.unlocked ? 'text-gray-700' : 'text-gray-500'
              }`}
            >
              {achievement.description}
            </p>

            {/* Progress Bar (if applicable) */}
            {achievement.maxProgress && (
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{Math.min(achievement.progress || 0, achievement.maxProgress)}/{achievement.maxProgress}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500' 
                        : 'bg-gray-400'
                    }`}
                    style={{ 
                      width: `${Math.min(((achievement.progress || 0) / achievement.maxProgress) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="text-center">
              {achievement.unlocked ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  🔒 Locked
                </span>
              )}
            </div>

            {/* Shine effect for unlocked achievements */}
            {achievement.unlocked && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12 animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-center text-gray-700 mb-4">📊 Your Chaos Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{recipeCount}</div>
            <div className="text-sm text-gray-600">Recipes Created</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{chaosCount}</div>
            <div className="text-sm text-gray-600">Chaos Clicks</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{shareCount}</div>
            <div className="text-sm text-gray-600">Shares</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{unlockedCount}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </div>

      {/* Historical Rating Display */}
      {historicalRating && (
        <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
          <h4 className="font-bold text-amber-700 mb-2">👑 Historical Review</h4>
          <p className="text-amber-800 italic">{historicalRating}</p>
        </div>
      )}
    </div>
  );
}
