'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import IngredientUpload from "@/components/IngredientUpload";
import RecipeDisplay from "@/components/RecipeDisplay";
import AiChef from "@/components/AiChef";
import ChaosButton from "@/components/ChaosButton";
import ShareRecipe from "@/components/ShareRecipe";
import Achievements from "@/components/Achievements";
import FixedStatsHeader from "@/components/FixedStatsHeader";
import AnimatedBackground from "@/components/AnimatedBackground";
import FloatingGameItem from "@/components/FloatingGameItem";
import GameEffect from "@/components/GameEffect";
import GlassCard from "@/components/GlassCard";
import MusicControl from "@/components/MusicControl";
import MusicTip from "@/components/MusicTip";
import ComboCounter from "@/components/ComboCounter";
import LevelUpNotification from "@/components/LevelUpNotification";
import OnboardingGuide, { useOnboardingKeyboard } from "@/components/OnboardingGuide";
import BoltBadge from "@/components/BoltBadge";
import { 
  analyzeIngredients, 
  generateAbsurdRecipe, 
  generateChefNarration,
  mutateChaosRecipe,
  generateMemeCaption,
  getRatingFromHistoricalFigure,
  Recipe 
} from "@/services/geminiService";
import { ttsService } from "@/services/ttsService";
import { soundManager } from "@/services/soundManager";

// Game Levels and Player Titles
const PLAYER_LEVELS = [
  { level: 1, title: "Novice Chef", threshold: 0, icon: "🧑‍🍳" },
  { level: 2, title: "Apprentice Chef", threshold: 100, icon: "👨‍🍳" },
  { level: 3, title: "Sous Chef", threshold: 250, icon: "🔪" },
  { level: 4, title: "Head Chef", threshold: 500, icon: "👨‍🍳⭐" },
  { level: 5, title: "Executive Chef", threshold: 1000, icon: "🧑‍🍳🏆" },
  { level: 6, title: "Master Chef", threshold: 2000, icon: "👨‍🍳👑" },
  { level: 7, title: "Chaos Culinary Legend", threshold: 5000, icon: "🔥👨‍🍳✨" }
];

export default function Home() {
  // State management
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [narration, setNarration] = useState<string>('');
  const [memeCaption, setMemeCaption] = useState<string>('');
  const [historicalRating, setHistoricalRating] = useState<string>('');
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isChaosLoading, setIsChaosLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Stats for achievements
  const [recipeCount, setRecipeCount] = useState(0);
  const [chaosCount, setChaosCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  // Initialize client-side rendering
  useEffect(() => {
    setIsClient(true);
    // Check if user has played before
    const hasPlayedBefore = localStorage.getItem('memechef-has-played');
    if (hasPlayedBefore) {
      setShowStartScreen(false);
      setGameStarted(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Game mechanics
  const [playerXP, setPlayerXP] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [comboChain, setComboChain] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [floatingItems, setFloatingItems] = useState<Array<{id: number, emoji: string, points?: number, x: number, y: number}>>([]);
  const [gameEffects, setGameEffects] = useState<Array<{id: number, type: 'success' | 'bonus' | 'level-up', message: string}>>([]);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);  // Background music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.3);  const [, setUserHasInteracted] = useState(false);
  const [showMusicTip, setShowMusicTip] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user is new (first time visitor)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('memechef-onboarding-seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);
  // Initialize music volume from localStorage after component mounts
  useEffect(() => {
    const savedVolume = localStorage.getItem('memechef-music-volume');
    if (savedVolume) {
      setMusicVolume(parseFloat(savedVolume));
    }
  }, []);

  // Onboarding handlers
  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('memechef-onboarding-seen', 'true');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('memechef-onboarding-seen', 'true');
  };

  // Keyboard navigation for onboarding
  useOnboardingKeyboard(
    showOnboarding,
    () => {}, // handled internally by component
    () => {}, // handled internally by component
    handleOnboardingClose
  );
  const [audioLoadingStatus, setAudioLoadingStatus] = useState<Record<string, string>>({});  // Save music settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('memechef-music-volume', musicVolume.toString());
      localStorage.setItem('memechef-music-playing', isMusicPlaying ? 'true' : 'false');
    }
  }, [musicVolume, isMusicPlaying]);

  // Initialize audio with sound manager (only once)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      soundManager.initializeSounds();
      setAudioLoadingStatus({backgroundMusic: "Ready"});
    }
  }, []); // Empty dependency array - only run once

  // Update sound manager config when music settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // When music is playing, isMuted should be false
      soundManager.updateConfig(!isMusicPlaying, musicVolume);
    }
  }, [musicVolume, isMusicPlaying]);
  // Loading screen
  // Removed the duplicate loading screen useEffect since it's now combined with isClient

  // Load/save stats
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('memechef-stats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setRecipeCount(stats.recipeCount || 0);
        setChaosCount(stats.chaosCount || 0);
        setShareCount(stats.shareCount || 0);
        setPlayerXP(stats.playerXP || 0);
        setPlayerLevel(stats.playerLevel || 1);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stats = { recipeCount, chaosCount, shareCount, playerXP, playerLevel };
      localStorage.setItem('memechef-stats', JSON.stringify(stats));
    }
  }, [recipeCount, chaosCount, shareCount, playerXP, playerLevel]);
  // Helper function to play sound effects
  const playSound = useCallback((soundName: string) => {
    soundManager.playSound(soundName);
  }, []);

  const addXP = useCallback((amount: number, emoji = '✨', x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    setPlayerXP(prev => prev + amount);
    
    // Play achievement sound for big XP gains
    if (amount >= 100) {
      playSound('achievement');
    }
    
    setFloatingItems(prev => [...prev, {
      id: Date.now(),
      emoji,
      points: amount,
      x,
      y
    }]);
  }, [playSound]);
  // Level up check
  useEffect(() => {
    const currentLevel = PLAYER_LEVELS.find((level, index) => 
      playerXP >= level.threshold && 
      (index === PLAYER_LEVELS.length - 1 || playerXP < PLAYER_LEVELS[index + 1].threshold)
    );
      if (currentLevel && currentLevel.level > playerLevel) {
      setPlayerLevel(currentLevel.level);
      
      // Play level up sound
      playSound('levelUp');
      
      setGameEffects(prev => [...prev, {
        id: Date.now(),
        type: 'level-up',
        message: `Level Up! ${currentLevel.title}`
      }]);
      
      // Add level up floating effect without triggering XP change
      setFloatingItems(prev => [...prev, {
        id: Date.now(),
        emoji: '⭐',
        points: 250,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      }]);
    }
  }, [playerXP, playerLevel, playSound]);

  // Combo timer
  useEffect(() => {
    if (comboChain > 0) {
      if (comboTimer) {
        clearTimeout(comboTimer);
      }
      
      const timer = setTimeout(() => {
        setComboChain(0);
      }, 10000);
      
      setComboTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [comboChain, lastAction, comboTimer]);
  
  // Cleanup effects
  useEffect(() => {
    if (floatingItems.length > 0) {
      const timer = setTimeout(() => {
        setFloatingItems([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [floatingItems]);
  
  useEffect(() => {
    if (gameEffects.length > 0) {
      const timer = setTimeout(() => {
        setGameEffects(prev => prev.slice(1));
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameEffects]);

  // Helper functions
  const getCurrentLevelInfo = () => {
    const currentLevel = PLAYER_LEVELS.find(l => l.level === playerLevel) || PLAYER_LEVELS[0];
    const nextLevel = PLAYER_LEVELS.find(l => l.level === playerLevel + 1);
    
    if (nextLevel) {
      const currentLevelXP = currentLevel.threshold;
      const nextLevelXP = nextLevel.threshold;
      const levelProgress = ((playerXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
      return {
        title: currentLevel.title,
        icon: currentLevel.icon,
        level: currentLevel.level,
        progress: levelProgress,
        nextTitle: nextLevel.title,
        xpNeeded: nextLevelXP - playerXP
      };
    }
    
    return {
      title: currentLevel.title,      icon: currentLevel.icon,
      level: currentLevel.level,
      progress: 100,
      nextTitle: null,
      xpNeeded: 0
    };
  };
  const toggleBackgroundMusic = () => {
    try {
      const isPlaying = soundManager.toggleBackgroundMusic();
      setIsMusicPlaying(isPlaying);
      setUserHasInteracted(true);
    } catch (error) {
      console.error("Error toggling music:", error);
    }
  };  const handleVolumeChange = (volume: number) => {
    setMusicVolume(volume);
    // The sound manager will be updated by the useEffect hook
  };

  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);
    setIsGeneratingRecipe(true);
    setLastAction('upload');
    setComboChain(prev => prev + 1);
    
    try {
      const analysis = await analyzeIngredients(file);
      const ingredientScore = analysis.ingredients.length * 25;
      const comboBonus = comboChain > 1 ? comboChain * 10 : 0;
      const totalPointsEarned = ingredientScore + comboBonus;
      
      const newRecipe = await generateAbsurdRecipe(analysis.ingredients);
      setRecipe(newRecipe);
      setRecipeCount(prev => prev + 1);
      setPlayerXP(prev => prev + totalPointsEarned);
      
      const chefScript = await generateChefNarration(newRecipe);
      setNarration(chefScript);
      
      const caption = await generateMemeCaption(newRecipe);
      setMemeCaption(caption);
      
      const rating = await getRatingFromHistoricalFigure(newRecipe);
      setHistoricalRating(rating);
      
      addXP(totalPointsEarned, '🍽️', window.innerWidth / 2, window.innerHeight / 2);
      
      // Play success sound
      playSound('success');
      
    } catch (error) {
      console.error('Error processing image:', error);
      setComboChain(0);
        const fallbackRecipe: Recipe = {
        title: "The 'My Internet Broke' Sandwich",
        backstory: "Created when the AI got confused and decided to take a nap instead of helping.",
        ingredients: [
          "2 slices of bread (any bread, we're not picky here)",
          "Whatever's in your fridge that won't kill you",
          "1 tablespoon of hope",
          "A pinch of 'this will probably work out'"
        ],
        instructions: [
          "Put the stuff between the bread (revolutionary, I know)",
          "Squish it a little so it feels loved",
          "Take a bite and pretend it's gourmet",
          "If it tastes weird, add ketchup - ketchup fixes everything",
          "Enjoy while questioning your life choices!"
        ]
      };
      setRecipe(fallbackRecipe);
      setNarration("Oops! Looks like my AI brain took a little vacation there! But hey, at least we can make a sandwich, right? Sometimes the simplest things are the best things. Plus, I bet this sandwich has more personality than most fancy restaurant food!");
      setMemeCaption("When the AI chef.exe stops working but you're still hungry 🤖🥪");
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingRecipe(false);
    }
  };

  const handleChaosClick = async () => {
    if (!recipe) return;
    
    setIsChaosLoading(true);
    setLastAction('chaos');
    
    if (lastAction === 'chaos') {
      setComboChain(prev => prev + 1);
    } else {
      setComboChain(1);
    }
    
    const newChaosCount = chaosCount + 1;
    setChaosCount(newChaosCount);
    
    try {
      let chaosPoints = 50;
      const comboMultiplier = Math.min(comboChain, 5);
      chaosPoints *= comboMultiplier;
      
      if (newChaosCount === 5) chaosPoints += 250;
      if (newChaosCount === 10) chaosPoints += 500;
      if (newChaosCount === 25) chaosPoints += 1000;
      
      setPlayerXP(prev => prev + chaosPoints);
      
      const chaosRecipe = await mutateChaosRecipe(recipe);
      setRecipe(chaosRecipe);
      
      const chefScript = await generateChefNarration(chaosRecipe);
      setNarration(chefScript);
      
      const caption = await generateMemeCaption(chaosRecipe);
      setMemeCaption(caption);
      
      addXP(chaosPoints, '🔥', window.innerWidth / 2, window.innerHeight / 2);
      
      // Play chaos/combo sound
      if (comboChain > 1) {
        playSound('combo');
      } else {
        playSound('chefKiss');
      }
      
    } catch (error) {
      console.error('Error generating chaos:', error);
      setComboChain(0);
    } finally {
      setIsChaosLoading(false);
    }
  };

  const handleStartNarration = async () => {
    if (!narration || isNarrating) return;
      setIsNarrating(true);
    try {
      await ttsService.speak(narration);
      
      // Play chef kiss sound after narration
      setTimeout(() => {
        playSound('chefKiss');
      }, 500);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    } finally {
      setIsNarrating(false);
    }
  };

  const handleGenerateCaption = async () => {
    if (!recipe) return;
    
    try {
      const caption = await generateMemeCaption(recipe);
      setMemeCaption(caption);
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating caption:', error);
    }
  };
  // Game start handler
  const handleGameStart = () => {
    // Play sound effect if available
    try {
      playSound('success');
    } catch {
      // Silently fail if sound is not available
    }
    
    setGameStarted(true);
    setLoadingProgress(0);
    
    // Animate loading progress from 0 to 100%
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += increment;
      setLoadingProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setShowStartScreen(false);
          setIsLoading(false);
          localStorage.setItem('memechef-has-played', 'true');
        }, 500);
      }
    }, interval);
  };

  // Show start screen for new players
  if (!isClient || (showStartScreen && !gameStarted)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center z-10 relative">
          <div className="text-8xl mb-6 animate-bounce">🧑‍🍳</div>
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-4">
            MemeChef
          </h1>
          <p className="text-2xl text-white/80 font-light mb-8">
            The Ultimate Culinary Chaos Game
          </p>
          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
            Turn your ingredients into absurd recipes, embrace the chaos, and become a culinary legend!
          </p>
          <button
            onClick={handleGameStart}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95"
          >
            🚀 Start Your Culinary Adventure
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen during game initialization
  if (showStartScreen && gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center relative overflow-hidden">
        <AnimatedBackground />
        <div className="text-center z-10 relative">
          <div className="text-6xl mb-4 animate-spin">🍳</div>
          <div className="text-2xl font-bold mb-6">Preparing Your Kitchen...</div>
          <div className="w-80 h-4 bg-white/20 rounded-full overflow-hidden mx-auto mb-4">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="text-lg text-white/70">{Math.round(loadingProgress)}%</div>
          <div className="text-sm text-white/50 mt-2">
            {loadingProgress < 30 && "Sharpening knives..."}
            {loadingProgress >= 30 && loadingProgress < 60 && "Heating up the stove..."}
            {loadingProgress >= 60 && loadingProgress < 90 && "Gathering ingredients..."}
            {loadingProgress >= 90 && "Almost ready to cook!"}
          </div>
        </div>
      </div>
    );
  }

  // Show regular loading for returning players
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧑‍🍳</div>
          <div className="text-2xl font-bold mb-2">Loading MemeChef...</div>
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Onboarding Guide */}
      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onSkip={handleOnboardingSkip}
      />
      
      <FixedStatsHeader
        recipeCount={recipeCount}
        chaosCount={chaosCount}
        shareCount={shareCount}
        achievementCount={0}
        totalAchievements={0}
      />

      <LevelUpNotification gameEffects={gameEffects} />      <MusicControl 
        isMusicPlaying={isMusicPlaying}
        musicVolume={musicVolume}
        onToggle={toggleBackgroundMusic}
        onVolumeChange={handleVolumeChange}
        audioLoadingStatus={audioLoadingStatus}
      />
      
      <ComboCounter comboChain={comboChain} />

      <MusicTip
        showMusicTip={showMusicTip && !isLoading}
        onClose={() => setShowMusicTip(false)}
        audioLoadingStatus={audioLoadingStatus}
      />

      {floatingItems.map(item => (
        <FloatingGameItem
          key={item.id}
          emoji={item.emoji}
          points={item.points}
          x={item.x}
          y={item.y}
        />
      ))}

      {gameEffects.map(effect => (
        <GameEffect
          key={effect.id}
          type={effect.type}
          message={effect.message}
          onComplete={() => setGameEffects(prev => prev.filter(e => e.id !== effect.id))}
        />
      ))}

      <div className="relative pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4 relative">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl"></div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse relative">
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl text-yellow-300 opacity-70">🏆 LEVEL {playerLevel} 🏆</span>
              🧑‍🍳 MemeChef
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light">
              The Ultimate Culinary Chaos Game
            </p>
            <div className="inline-block mx-auto mt-2 px-4 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
              <span className="text-sm text-purple-300 font-medium">EARLY ACCESS v0.4.2</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-purple-200">
                Level: <span className="text-yellow-400 font-bold">{playerLevel}</span>
              </span>
              <span className="px-2">•</span>
              <span className="text-lg text-purple-200">
                XP: <span className="text-green-400 font-bold">{playerXP.toLocaleString()}</span>
              </span>
              <span className="px-2">•</span>
              <span className="text-lg text-purple-200">
                Title: <span className={`font-bold`}>{getCurrentLevelInfo().title}</span>
              </span>
            </div>
            
            {/* Built with Bolt Badge */}
            <div className="flex justify-center mt-6">
              <BoltBadge variant="default" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 space-y-12 pb-20">
        <section>
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              STAGE 1
            </div>
            <h2 className="text-2xl font-bold mt-2">Select Your Ingredients</h2>
          </div>
            <GlassCard 
            className="p-8" 
            rarity={recipeCount >= 10 ? 'legendary' : recipeCount >= 5 ? 'epic' : recipeCount >= 3 ? 'rare' : 'common'}
            glow={recipeCount >= 5}
            data-tutorial="ingredient-upload"
          >
            <IngredientUpload 
              onImageUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
            />
          </GlassCard>
        </section>

        <section>
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              STAGE 2
            </div>
            <h2 className="text-2xl font-bold mt-2">Meet Your Culinary Guide</h2>
          </div>
            <GlassCard 
            className="p-8" 
            rarity={chaosCount >= 5 ? 'epic' : chaosCount >= 3 ? 'rare' : 'common'} 
            pulse={isNarrating}
            data-tutorial="ai-chef"
          >
            <AiChef 
              narration={narration}
              isNarrating={isNarrating}
              onStartNarration={handleStartNarration}
            />
          </GlassCard>
        </section>

        {(recipe || isGeneratingRecipe) && (
          <section>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                STAGE 3
              </div>
              <h2 className="text-2xl font-bold mt-2">Your Chaotic Creation</h2>
            </div>
            
            {isGeneratingRecipe ? (
              <GlassCard className="p-12 text-center" rarity="rare" glow>
                <div className="space-y-4">
                  <div className="text-6xl animate-spin">🍳</div>
                  <h3 className="text-2xl font-bold">Cooking up something special...</h3>
                  <p className="text-gray-300">The AI chef is working its magic!</p>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="space-y-6" rarity="epic" glow>
                <RecipeDisplay 
                  recipe={recipe!}
                  memeCaption={memeCaption}
                  historicalRating={historicalRating}
                  onGenerateCaption={handleGenerateCaption}
                />
              </GlassCard>
            )}
          </section>
        )}

        {recipe && (
          <section>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                STAGE 4
              </div>
              <h2 className="text-2xl font-bold mt-2">Embrace the Chaos</h2>
            </div>
            
            <GlassCard className="p-8 text-center" rarity="legendary" glow pulse data-tutorial="chaos-button">              <ChaosButton 
                onClick={handleChaosClick}
                isLoading={isChaosLoading}
                chaosCount={chaosCount}
              />
            </GlassCard>
          </section>
        )}

        {recipe && (
          <section>
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                STAGE 5
              </div>
              <h2 className="text-2xl font-bold mt-2">Share the Madness</h2>
            </div>
              <GlassCard className="p-8" data-tutorial="share-recipe">
              <ShareRecipe
                recipe={recipe}
                memeCaption={memeCaption}
                onShare={() => setShareCount(prev => prev + 1)}
              />
            </GlassCard>
          </section>
        )}

        <section>
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
              ACHIEVEMENTS
            </div>
            <h2 className="text-2xl font-bold mt-2">Your Culinary Journey</h2>
          </div>
          
          <GlassCard className="p-8">
            <Achievements 
              recipeCount={recipeCount}
              chaosCount={chaosCount}
              shareCount={shareCount}
              playerLevel={playerLevel}
              playerXP={playerXP}
            />
          </GlassCard>
        </section>
      </main>

      <footer className="relative">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-white/50">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Made with chaos and creativity</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span>•</span>
            <BoltBadge variant="minimal" showText={false} />
          </div>
          <p className="text-sm">
            MemeChef © 2025 | Where culinary disasters become digital masterpieces
          </p>
        </div>
      </footer>
    </div>
  );
}