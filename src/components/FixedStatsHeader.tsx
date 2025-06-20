import { useState } from 'react';
import { ChefHat, TrendingUp, Zap, Share2, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const progressPercentage = totalAchievements > 0 ? (achievementCount / totalAchievements) * 100 : 0;

  const getChaosLevel = () => {
    if (chaosCount === 0) return { level: 'DORMANT', color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-500/20', pulse: false };
    if (chaosCount < 3) return { level: 'MILD', color: 'from-yellow-400 to-orange-400', bgColor: 'bg-yellow-500/20', pulse: false };
    if (chaosCount < 5) return { level: 'MODERATE', color: 'from-orange-400 to-red-400', bgColor: 'bg-orange-500/20', pulse: true };
    if (chaosCount < 10) return { level: 'EXTREME', color: 'from-red-400 to-red-600', bgColor: 'bg-red-500/20', pulse: true };
    return { level: 'APOCALYPTIC', color: 'from-purple-400 to-pink-600', bgColor: 'bg-purple-500/20', pulse: true };
  };

  const chaosStatus = getChaosLevel();  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`backdrop-blur-xl bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-orange-900/90 border-b border-white/10 shadow-2xl transition-all duration-500 ${
        isExpanded ? 'py-6' : 'py-3'
      }`}>
        <div className="max-w-6xl mx-auto px-4">
          {!isExpanded ? (
            /* Minimized Display - Sleek and Modern */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <ChefHat className="text-orange-400 w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">MemeChef</span>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 font-semibold">{recipeCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className={`w-4 h-4 ${chaosStatus.pulse ? 'animate-pulse' : ''}`} style={{color: '#ef4444'}} />
                    <span className="text-red-300 font-semibold">{chaosCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 font-semibold">{shareCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-semibold">{achievementCount}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="w-20 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-white/70 text-sm font-medium">{Math.round(progressPercentage)}%</span>
                </div>

                {/* Chaos Status Badge */}
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${chaosStatus.bgColor} ${chaosStatus.pulse ? 'animate-pulse' : ''}`}>
                  <span className={`bg-gradient-to-r ${chaosStatus.color} bg-clip-text text-transparent`}>
                    {chaosStatus.level}
                  </span>
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
                title="Expand Stats"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Expanded Display - Full Stats */
            <div className="space-y-4">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ChefHat className="text-orange-400 w-8 h-8" />
                  <div>
                    <h2 className="text-xl font-bold text-white">MemeChef Dashboard</h2>
                    <p className="text-white/60 text-sm">Your culinary chaos metrics</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${chaosStatus.bgColor} ${chaosStatus.pulse ? 'animate-pulse' : ''}`}>
                    <span className={`bg-gradient-to-r ${chaosStatus.color} bg-clip-text text-transparent`}>
                      CHAOS: {chaosStatus.level}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white/60 hover:text-white transition-all duration-300 hover:scale-110"
                  title="Minimize"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{recipeCount}</div>
                  <div className="text-xs text-white/70 font-medium">Recipes Created</div>
                </div>
                
                <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/15 transition-all duration-300 ${chaosStatus.pulse ? 'animate-pulse' : ''}`}>
                  <Zap className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{chaosCount}</div>
                  <div className="text-xs text-white/70 font-medium">Chaos Unleashed</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <Share2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{shareCount}</div>
                  <div className="text-xs text-white/70 font-medium">Recipes Shared</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{achievementCount}</div>
                  <div className="text-xs text-white/70 font-medium">Achievements</div>
                </div>
              </div>

              {/* Achievement Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 font-medium">Achievement Progress</span>
                  <span className="text-white/60 text-sm">{achievementCount}/{totalAchievements} unlocked</span>
                </div>
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-full transition-all duration-1000 relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {Math.round(progressPercentage)}%
                  </span>
                  <span className="text-white/60 text-sm ml-2">Complete</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
