import { useState } from 'react';

interface FixedStatsHeaderProps {
  recipeCount: number;
  chaosCount: number;
  shareCount: number;
  achievementCount: number;
  totalAchievements: number;
}

export default function FixedStatsHeader({ 
  recipeCount, 
  chaosCount, 
  shareCount, 
  achievementCount,
  totalAchievements 
}: FixedStatsHeaderProps) {
  const [isMinimized, setIsMinimized] = useState(true); // Start collapsed

  const progressPercentage = totalAchievements > 0 ? (achievementCount / totalAchievements) * 100 : 0;

  const getChaosLevel = () => {
    if (chaosCount === 0) return { level: 'DORMANT', color: 'text-gray-500' };
    if (chaosCount < 3) return { level: 'MILD', color: 'text-yellow-500' };
    if (chaosCount < 5) return { level: 'MODERATE', color: 'text-orange-500' };
    if (chaosCount < 10) return { level: 'EXTREME', color: 'text-red-500' };
    return { level: 'APOCALYPTIC', color: 'text-purple-600' };
  };

  const chaosStatus = getChaosLevel();
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className={`bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm transition-all duration-300 ${
          isMinimized ? 'py-2' : 'py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          {!isMinimized ? (
            /* Full Stats Display */
            <div className="space-y-3">
              {/* Top Row: Title and Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-gray-800">🧑‍🍳 MemeChef Progress</h2>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    chaosStatus.level === 'APOCALYPTIC' ? 'bg-purple-100 text-purple-700' :
                    chaosStatus.level === 'EXTREME' ? 'bg-red-100 text-red-700' :
                    chaosStatus.level === 'MODERATE' ? 'bg-orange-100 text-orange-700' :
                    chaosStatus.level === 'MILD' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    Chaos: {chaosStatus.level}
                  </div>
                </div>
                
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Minimize"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{recipeCount}</div>
                  <div className="text-xs text-gray-600">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{chaosCount}</div>
                  <div className="text-xs text-gray-600">Chaos Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{shareCount}</div>
                  <div className="text-xs text-gray-600">Shares</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{achievementCount}</div>
                  <div className="text-xs text-gray-600">Achievements</div>
                </div>
              </div>

              {/* Achievement Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Achievement Progress</span>
                  <span>{achievementCount}/{totalAchievements}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            /* Minimized Stats Display */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">🧑‍🍳</span>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-blue-600 font-medium">{recipeCount}R</span>
                  <span className="text-red-600 font-medium">{chaosCount}C</span>
                  <span className="text-green-600 font-medium">{shareCount}S</span>
                  <span className="text-purple-600 font-medium">{achievementCount}A</span>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
              </div>
              
              <button
                onClick={() => setIsMinimized(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Expand"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
