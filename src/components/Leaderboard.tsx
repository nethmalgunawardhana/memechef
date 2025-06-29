'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Users, Star, TrendingUp, Calendar, Zap } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  level: number;
  xp: number;
  recipeCount: number;
  chaosCount: number;
  achievementCount: number;
  lastActive: Date;
  title: string;
  avatar: string;
}

interface LeaderboardProps {
  playerLevel: number;
  playerXP: number;
  recipeCount: number;
  chaosCount: number;
  achievementCount: number;
}

export default function Leaderboard({ 
  playerLevel, 
  playerXP, 
  recipeCount, 
  chaosCount, 
  achievementCount 
}: LeaderboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'xp' | 'level' | 'recipes' | 'chaos'>('xp');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('all-time');
  const [playerUsername, setPlayerUsername] = useState('Chef Anonymous');
  const [playerEntry, setPlayerEntry] = useState<LeaderboardEntry | null>(null);

  // Generate mock leaderboard data (in a real app, this would come from a server)
  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const mockNames = [
      'ChaosChef42', 'RecipeRebel', 'KitchenKing', 'FlavorFury', 'CookingCarnage',
      'FoodFrenzy', 'ChefChaos', 'RecipeRiot', 'CulinaryWildcard', 'DishDestroyer',
      'MixMaster', 'FlavorPhantom', 'SpiceSpecter', 'IngredientInsanity', 'TasteTornado'
    ];

    const titles = [
      'Chaos Culinary Legend', 'Master Chef', 'Executive Chef', 'Head Chef', 
      'Sous Chef', 'Apprentice Chef', 'Novice Chef'
    ];

    const avatars = ['🧑‍🍳', '👨‍🍳', '👩‍🍳', '🤖', '🎭', '🦄', '🔥', '⚡', '🌟', '👑'];

    return Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i}`,
      username: mockNames[Math.floor(Math.random() * mockNames.length)] + Math.floor(Math.random() * 1000),
      level: Math.floor(Math.random() * 7) + 1,
      xp: Math.floor(Math.random() * 10000) + 500,
      recipeCount: Math.floor(Math.random() * 100) + 5,
      chaosCount: Math.floor(Math.random() * 200) + 10,
      achievementCount: Math.floor(Math.random() * 20) + 3,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      title: titles[Math.floor(Math.random() * titles.length)],
      avatar: avatars[Math.floor(Math.random() * avatars.length)]
    }));
  };

  // Initialize leaderboard and player data
  useEffect(() => {
    const savedUsername = localStorage.getItem('memechef-username');
    if (savedUsername) {
      setPlayerUsername(savedUsername);
    }

    const mockData = generateMockLeaderboard();
    setLeaderboard(mockData);

    // Create player entry
    const player: LeaderboardEntry = {
      id: 'player',
      username: playerUsername,
      level: playerLevel,
      xp: playerXP,
      recipeCount,
      chaosCount,
      achievementCount,
      lastActive: new Date(),
      title: 'You',
      avatar: '👨‍🍳'
    };
    setPlayerEntry(player);
  }, [playerLevel, playerXP, recipeCount, chaosCount, achievementCount, playerUsername]);

  const updateUsername = (newUsername: string) => {
    setPlayerUsername(newUsername);
    localStorage.setItem('memechef-username', newUsername);
    if (playerEntry) {
      setPlayerEntry({ ...playerEntry, username: newUsername });
    }
  };

  // Sort leaderboard based on selected category
  const sortedLeaderboard = [...leaderboard, ...(playerEntry ? [playerEntry] : [])]
    .sort((a, b) => {
      switch (selectedCategory) {
        case 'xp':
          return b.xp - a.xp;
        case 'level':
          return b.level - a.level || b.xp - a.xp;
        case 'recipes':
          return b.recipeCount - a.recipeCount;
        case 'chaos':
          return b.chaosCount - a.chaosCount;
        default:
          return b.xp - a.xp;
      }
    });

  const playerRank = sortedLeaderboard.findIndex(entry => entry.id === 'player') + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="text-yellow-400" size={24} />;
      case 2: return <Medal className="text-gray-300" size={24} />;
      case 3: return <Medal className="text-amber-600" size={24} />;
      default: return <span className="text-white font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/40';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/40';
      default: return 'bg-white/10 border-white/20';
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (date.getTime() === now.getTime() || days === 0) return 'Online';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    return `${Math.floor(days / 7)} weeks ago`;
  };

  return (
    <>
      {/* Leaderboard Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-36 right-4 z-40 backdrop-blur-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400/40 rounded-2xl p-4 hover:scale-105 transition-all duration-300"
      >
        <div className="flex items-center space-x-2">
          <Trophy className="text-orange-400" size={20} />
          <span className="text-white font-bold text-sm">Ranks</span>
        </div>
        {playerRank > 0 && (
          <div className="text-xs text-white/70 text-center mt-1">
            #{playerRank}
          </div>
        )}
      </button>

      {/* Leaderboard Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-gradient-to-br from-orange-900/90 to-red-900/90 border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Trophy className="text-orange-400" size={28} />
                  <span>Global Leaderboard</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Player Info & Username Editor */}
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">👨‍🍳</div>
                    <div>
                      <input
                        type="text"
                        value={playerUsername}
                        onChange={(e) => updateUsername(e.target.value)}
                        className="bg-transparent text-white font-bold text-lg border-b border-white/40 focus:border-white focus:outline-none"
                        maxLength={20}
                      />
                      <div className="text-white/70 text-sm">Rank #{playerRank} • Level {playerLevel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-bold">{playerXP.toLocaleString()} XP</div>
                    <div className="text-white/70 text-sm">{recipeCount} recipes</div>
                  </div>
                </div>
              </div>

              {/* Category and Timeframe Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="flex gap-2">
                  {[
                    { id: 'xp', label: '💎 XP', icon: Star },
                    { id: 'level', label: '⭐ Level', icon: TrendingUp },
                    { id: 'recipes', label: '📝 Recipes', icon: Users },
                    { id: 'chaos', label: '🌪️ Chaos', icon: Zap }
                  ].map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id as any)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  {[
                    { id: 'all-time', label: '🏆 All Time', icon: Calendar },
                    { id: 'monthly', label: '📅 Monthly', icon: Calendar },
                    { id: 'weekly', label: '📊 Weekly', icon: Calendar },
                    { id: 'daily', label: '📈 Daily', icon: Calendar }
                  ].map((time) => (
                    <button
                      key={time.id}
                      onClick={() => setTimeframe(time.id as any)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        timeframe === time.id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="p-6 max-h-[calc(90vh-280px)] overflow-y-auto">
              <div className="space-y-3">
                {sortedLeaderboard.slice(0, 100).map((entry, index) => {
                  const rank = index + 1;
                  const isPlayer = entry.id === 'player';
                  const getValue = () => {
                    switch (selectedCategory) {
                      case 'xp': return entry.xp.toLocaleString();
                      case 'level': return `Level ${entry.level}`;
                      case 'recipes': return `${entry.recipeCount} recipes`;
                      case 'chaos': return `${entry.chaosCount} chaos`;
                      default: return entry.xp.toLocaleString();
                    }
                  };

                  return (
                    <div
                      key={entry.id}
                      className={`backdrop-blur-sm border rounded-2xl p-4 transition-all duration-300 ${
                        isPlayer
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/60 shadow-lg shadow-purple-500/20'
                          : getRankBackground(rank)
                      } ${rank <= 3 ? 'hover:scale-[1.02]' : 'hover:bg-white/20'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10">
                            {getRankIcon(rank)}
                          </div>

                          {/* Avatar & User Info */}
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{entry.avatar}</div>
                            <div>
                              <div className={`font-bold ${isPlayer ? 'text-purple-300' : 'text-white'}`}>
                                {entry.username}
                                {isPlayer && <span className="text-purple-400 ml-2">(You)</span>}
                              </div>
                              <div className="text-white/70 text-sm flex items-center space-x-3">
                                <span>{entry.title}</span>
                                <span>•</span>
                                <span>{formatLastActive(entry.lastActive)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className={`font-bold text-lg ${isPlayer ? 'text-purple-300' : 'text-white'}`}>
                            {getValue()}
                          </div>
                          <div className="text-white/70 text-sm">
                            {entry.achievementCount} achievements
                          </div>
                        </div>
                      </div>

                      {/* Progress indicators for top 3 */}
                      {rank <= 3 && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-blue-400 text-sm font-bold">{entry.level}</div>
                              <div className="text-white/60 text-xs">Level</div>
                            </div>
                            <div>
                              <div className="text-green-400 text-sm font-bold">{entry.recipeCount}</div>
                              <div className="text-white/60 text-xs">Recipes</div>
                            </div>
                            <div>
                              <div className="text-red-400 text-sm font-bold">{entry.chaosCount}</div>
                              <div className="text-white/60 text-xs">Chaos</div>
                            </div>
                            <div>
                              <div className="text-yellow-400 text-sm font-bold">{entry.achievementCount}</div>
                              <div className="text-white/60 text-xs">Badges</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Special effects for rank 1 */}
                      {rank === 1 && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 animate-pulse -m-1 pointer-events-none"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer stats */}
              <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/70">
                  <div>
                    <div className="text-2xl font-bold text-white">{sortedLeaderboard.length}</div>
                    <div className="text-sm">Total Players</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-400">#{playerRank}</div>
                    <div className="text-sm">Your Rank</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {Math.max(0, Math.round(((sortedLeaderboard.length - playerRank) / sortedLeaderboard.length) * 100))}%
                    </div>
                    <div className="text-sm">Better Than</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {playerRank <= 10 ? '🏆' : playerRank <= 50 ? '🥇' : playerRank <= 100 ? '🥈' : '🥉'}
                    </div>
                    <div className="text-sm">Tier</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
