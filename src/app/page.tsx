'use client';

import { useState, useEffect, useRef } from 'react';
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
  
  // Stats for achievements
  const [recipeCount, setRecipeCount] = useState(0);
  const [chaosCount, setChaosCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  
  // Game mechanics
  const [playerXP, setPlayerXP] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [comboChain, setComboChain] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [floatingItems, setFloatingItems] = useState<Array<{id: number, emoji: string, points?: number, x: number, y: number}>>([]);
  const [gameEffects, setGameEffects] = useState<Array<{id: number, type: 'success' | 'bonus' | 'level-up', message: string}>>([]);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Sound effects
  const soundEffects = useRef({
    levelUp: null as HTMLAudioElement | null,
    achievement: null as HTMLAudioElement | null,
    combo: null as HTMLAudioElement | null,
    chaosButton: null as HTMLAudioElement | null,
    chefKiss: null as HTMLAudioElement | null,
    success: null as HTMLAudioElement | null,
    background: null as HTMLAudioElement | null
  });

  // Background music state
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('memechef-music-volume');
      return savedVolume ? parseFloat(savedVolume) : 0.3;
    }
    return 0.3;
  });
  
  const [, setUserHasInteracted] = useState(false);
  const [showMusicTip, setShowMusicTip] = useState(true);
  const [audioLoadingStatus, setAudioLoadingStatus] = useState<Record<string, string>>({});

  // Save music settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('memechef-music-volume', musicVolume.toString());
      localStorage.setItem('memechef-music-playing', isMusicPlaying ? 'true' : 'false');
    }
  }, [musicVolume, isMusicPlaying]);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize background music
      const bgMusic = new Audio('/sounds/background.mp3');
      bgMusic.loop = true;
      bgMusic.volume = musicVolume;
      soundEffects.current.background = bgMusic;
      
      // Initialize sound effects
      soundEffects.current.levelUp = new Audio('/sounds/level-up.mp3');
      soundEffects.current.achievement = new Audio('/sounds/achievement.mp3');
      soundEffects.current.combo = new Audio('/sounds/combo.mp3');
      soundEffects.current.chaosButton = new Audio('/sounds/chaos-button.mp3');
      soundEffects.current.chefKiss = new Audio('/sounds/chef-kiss.mp3');
      soundEffects.current.success = new Audio('/sounds/success.mp3');
      
      setAudioLoadingStatus({backgroundMusic: "Ready"});
    }
  }, [musicVolume]);

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  // Level up check
  useEffect(() => {
    const currentLevel = PLAYER_LEVELS.find((level, index) => 
      playerXP >= level.threshold && 
      (index === PLAYER_LEVELS.length - 1 || playerXP < PLAYER_LEVELS[index + 1].threshold)
    );
    
    if (currentLevel && currentLevel.level > playerLevel) {
      setPlayerLevel(currentLevel.level);
      
      if (soundEffects.current.levelUp) {
        soundEffects.current.levelUp.play().catch(console.error);
      }
      
      setGameEffects(prev => [...prev, {
        id: Date.now(),
        type: 'level-up',
        message: `Level Up! ${currentLevel.title}`
      }]);
      
      addXP(250, '⭐', window.innerWidth / 2, window.innerHeight / 2);
    }
  }, [playerXP, playerLevel]);

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
      title: currentLevel.title,
      icon: currentLevel.icon,
      level: currentLevel.level,
      progress: 100,
      nextTitle: null,
      xpNeeded: 0
    };
  };

  const addXP = (amount: number, emoji = '✨', x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    setPlayerXP(prev => prev + amount);
    
    setFloatingItems(prev => [...prev, {
      id: Date.now(),
      emoji,
      points: amount,
      x,
      y
    }]);
  };
  const toggleBackgroundMusic = () => {
    if (soundEffects.current.background) {
      try {
        if (isMusicPlaying) {
          soundEffects.current.background.pause();
          setIsMusicPlaying(false);
        } else {
          soundEffects.current.background.play()
            .then(() => setIsMusicPlaying(true))
            .catch(console.error);
        }
        setUserHasInteracted(true);
      } catch (error) {
        console.error("Error toggling music:", error);
      }
    }
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
      
    } catch (error) {
      console.error('Error processing image:', error);
      setComboChain(0);
      
      const fallbackRecipe: Recipe = {
        title: "The Recipe of Technical Difficulties",
        backstory: "Born from the chaos of AI confusion in the year 2025.",
        ingredients: ["1 cup of patience", "2 tablespoons of hope", "A pinch of magic"],
        instructions: [
          "Mix ingredients while the AI figures itself out",
          "Wait patiently for technology to cooperate", 
          "Serve with understanding"
        ]
      };
      setRecipe(fallbackRecipe);
      setNarration("Well, this is awkward! Seems like my AI brain had a little hiccup. But hey, that's just more chaos for the recipe!");
      setMemeCaption("When the AI chef has an existential crisis mid-recipe 🤖💭");
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
      
      if (soundEffects.current.chefKiss) {
        setTimeout(() => {
          soundEffects.current.chefKiss?.play().catch(console.error);
        }, 500);
      }
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
      
      <FixedStatsHeader 
        recipeCount={recipeCount}
        chaosCount={chaosCount}
        shareCount={shareCount}
        achievementCount={0}
        totalAchievements={0}
      />

      <LevelUpNotification gameEffects={gameEffects} />

      <MusicControl 
        isMusicPlaying={isMusicPlaying}
        musicVolume={musicVolume}
        onToggle={toggleBackgroundMusic}
        onVolumeChange={setMusicVolume}
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
            
            <GlassCard className="p-8 text-center" rarity="legendary" glow pulse>
              <ChaosButton 
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
            
            <GlassCard className="p-8">
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
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-red-400" />
            <span>Made with chaos and creativity</span>
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-sm">
            MemeChef © 2025 | Where culinary disasters become digital masterpieces
          </p>
        </div>
      </footer>
    </div>
  );
}
