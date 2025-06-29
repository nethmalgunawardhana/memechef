'use client';

import { useState, useEffect } from 'react';
import { Calendar, Star, Zap, Trophy, Gift, Clock, Target, Sparkles } from 'lucide-react';
import { DailyChallenge as DailyChallengeType } from './DailyChallenge.1';

interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'recipe-count' | 'chaos-clicks' | 'combo-chain' | 'ingredient-type' | 'speed-run';
  target: number;
  reward: {
    xp: number;
    title?: string;
    emoji?: string;
  };
  progress: number;
  completed: boolean;
  streak?: number;
}

interface DailyChallengeProps {
  recipeCount: number;
  chaosCount: number;
  maxComboChain: number;
  onChallengeComplete: (reward: { xp: number; title?: string; emoji?: string }) => void;
}

export default function DailyChallenge({ 
  recipeCount, 
  chaosCount, 
  maxComboChain, 
  onChallengeComplete 
}: DailyChallengeProps) {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showCompletionEffect, setShowCompletionEffect] = useState(false);

  // Generate daily challenge based on current date
  const generateDailyChallenge = (): DailyChallenge => {
    const today = new Date().toDateString();
    const challengeTypes = [
      {
        type: 'recipe-count' as const,
        title: 'Recipe Master',
        description: 'Create 3 recipes today',
        target: 3,
        reward: { xp: 150, emoji: '🧑‍🍳' }
      },
      {
        type: 'chaos-clicks' as const,
        title: 'Chaos Creator',
        description: 'Click the chaos button 10 times',
        target: 10,
        reward: { xp: 200, emoji: '🌪️' }
      },
      {
        type: 'combo-chain' as const,
        title: 'Combo King',
        description: 'Achieve a 5-hit combo chain',
        target: 5,
        reward: { xp: 250, emoji: '⚡' }
      },
      {
        type: 'speed-run' as const,
        title: 'Speed Chef',
        description: 'Create 2 recipes in under 5 minutes',
        target: 2,
        reward: { xp: 300, title: 'Speed Demon', emoji: '💨' }
      }
    ];

    // Use date as seed for consistent daily challenge
    const seed = new Date().getDate() + new Date().getMonth();
    const selectedChallenge = challengeTypes[seed % challengeTypes.length];

    return {
      id: `challenge-${today}`,
      date: today,
      ...selectedChallenge,
      progress: 0,
      completed: false,
      streak: currentStreak
    };
  };

  // Load or generate daily challenge
  useEffect(() => {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem('memechef-daily-challenge');
    const savedStreak = localStorage.getItem('memechef-challenge-streak');
    
    if (savedStreak) {
      setCurrentStreak(parseInt(savedStreak));
    }

    if (savedChallenge) {
      const challenge = JSON.parse(savedChallenge) as DailyChallenge;
      if (challenge.date === today) {
        setDailyChallenge(challenge);
        return;
      }
    }

    // Generate new challenge for today
    const newChallenge = generateDailyChallenge();
    setDailyChallenge(newChallenge);
    localStorage.setItem('memechef-daily-challenge', JSON.stringify(newChallenge));
  }, [currentStreak]);

  // Update challenge progress
  useEffect(() => {
    if (!dailyChallenge || dailyChallenge.completed) return;

    let newProgress = 0;
    switch (dailyChallenge.type) {
      case 'recipe-count':
        newProgress = recipeCount;
        break;
      case 'chaos-clicks':
        newProgress = chaosCount;
        break;
      case 'combo-chain':
        newProgress = maxComboChain;
        break;
      case 'speed-run':
        // This would need additional timing logic
        newProgress = recipeCount;
        break;
    }

    if (newProgress !== dailyChallenge.progress) {
      const updatedChallenge = { ...dailyChallenge, progress: newProgress };
      
      // Check if challenge is completed
      if (newProgress >= dailyChallenge.target && !dailyChallenge.completed) {
        updatedChallenge.completed = true;
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        setShowCompletionEffect(true);
        
        // Bonus XP for streaks
        let bonusXP = 0;
        if (newStreak >= 7) bonusXP = 100; // Weekly streak bonus
        if (newStreak >= 30) bonusXP = 500; // Monthly streak bonus
        
        const totalReward = {
          ...dailyChallenge.reward,
          xp: dailyChallenge.reward.xp + bonusXP
        };
        
        onChallengeComplete(totalReward);
        localStorage.setItem('memechef-challenge-streak', newStreak.toString());
        
        setTimeout(() => setShowCompletionEffect(false), 3000);
      }
      
      setDailyChallenge(updatedChallenge);
      localStorage.setItem('memechef-daily-challenge', JSON.stringify(updatedChallenge));
    }
  }, [recipeCount, chaosCount, maxComboChain, dailyChallenge, currentStreak, onChallengeComplete]);

  if (!dailyChallenge) return null;

  const progressPercentage = Math.min((dailyChallenge.progress / dailyChallenge.target) * 100, 100);
  const timeLeft = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      {/* Daily Challenge Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-20 right-4 z-40 backdrop-blur-xl border-2 rounded-2xl p-4 transition-all duration-300 hover:scale-105 ${
          dailyChallenge.completed
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/40'
            : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/40 animate-pulse'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Calendar className={dailyChallenge.completed ? 'text-green-400' : 'text-purple-400'} size={20} />
          <span className="text-white font-bold text-sm">Daily</span>
          {dailyChallenge.completed && <Star className="text-yellow-400" size={16} />}
        </div>
        {currentStreak > 0 && (
          <div className="text-xs text-white/70 text-center mt-1">
            🔥 {currentStreak}
          </div>
        )}
      </button>

      {/* Challenge Completion Effect */}
      {showCompletionEffect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-3xl shadow-2xl">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-2xl font-bold">Challenge Complete!</div>
                <div className="text-lg">+{dailyChallenge.reward.xp} XP</div>
                {currentStreak > 1 && (
                  <div className="text-sm text-yellow-200">🔥 Streak: {currentStreak} days!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-900/90 to-pink-900/90 border border-white/20 rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Calendar className="text-purple-400" size={28} />
                <span>Daily Challenge</span>
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Challenge Details */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{dailyChallenge.reward.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-2">{dailyChallenge.title}</h3>
                <p className="text-white/80">{dailyChallenge.description}</p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-white">
                  <span>Progress</span>
                  <span>{Math.min(dailyChallenge.progress, dailyChallenge.target)}/{dailyChallenge.target}</span>
                </div>
                <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {dailyChallenge.completed && (
                      <div className="h-full bg-white/20 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rewards */}
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4">
                <h4 className="text-white font-bold mb-2 flex items-center space-x-2">
                  <Gift className="text-yellow-400" size={18} />
                  <span>Rewards</span>
                </h4>
                <div className="text-white/80">
                  <div>• {dailyChallenge.reward.xp} XP</div>
                  {dailyChallenge.reward.title && (
                    <div>• Title: "{dailyChallenge.reward.title}"</div>
                  )}
                  {currentStreak >= 7 && <div>• Streak Bonus: +100 XP</div>}
                  {currentStreak >= 30 && <div>• Legendary Streak: +500 XP</div>}
                </div>
              </div>

              {/* Streak & Time Left */}
              <div className="flex justify-between items-center text-sm">
                <div className="text-white/70 flex items-center space-x-1">
                  <Zap className="text-orange-400" size={16} />
                  <span>Streak: {currentStreak} days</span>
                </div>
                <div className="text-white/70 flex items-center space-x-1">
                  <Clock className="text-blue-400" size={16} />
                  <span>Resets in: {timeLeft()}</span>
                </div>
              </div>

              {/* Status */}
              {dailyChallenge.completed ? (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-2xl font-bold">
                    ✅ Challenge Completed!
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-2xl font-bold">
                    <Target className="inline mr-2" size={18} />
                    In Progress...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}