'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import IngredientUpload from "@/components/IngredientUpload";
import RecipeDisplay from "@/components/RecipeDisplay";
import AiChef from "@/components/AiChef";
import ChaosButton from "@/components/ChaosButton";
import ShareRecipe from "@/components/ShareRecipe";
import Achievements from "@/components/Achievements";
import FixedStatsHeader from "@/components/FixedStatsHeader";
import LoadingScreen from '@/components/LoadingScreen';
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

// Background Animation Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 opacity-20"></div>
      
      {/* Floating Food Icons */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={`absolute text-white/10 text-4xl animate-pulse`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        >
          {['🍳', '🔥', '✨', '🌟', '💫', '🎭', '🎪', '🌪️'][Math.floor(Math.random() * 8)]}
        </div>
      ))}
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// Glass Card Component
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const GlassCard = ({ children, className = "", hover = true, ...props }: GlassCardProps & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`
    backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl
    shadow-2xl shadow-purple-500/20
    ${hover ? 'hover:bg-white/15 hover:scale-105 hover:shadow-purple-500/30' : ''}
    transition-all duration-500 ease-out
    ${className}
  `} {...props}>
    {children}
  </div>
);

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
  const [progress, setProgress] = useState(0);
  
  // Stats for achievements
  const [recipeCount, setRecipeCount] = useState(0);
  const [chaosCount, setChaosCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 500); // brief pause
          return 100;
        }
        return prevProgress + Math.random() * 5;
      });
    }, 80); 

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Load stats from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('memechef-stats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setRecipeCount(stats.recipeCount || 0);
        setChaosCount(stats.chaosCount || 0);
        setShareCount(stats.shareCount || 0);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stats = { recipeCount, chaosCount, shareCount };
      localStorage.setItem('memechef-stats', JSON.stringify(stats));
    }
  }, [recipeCount, chaosCount, shareCount]);

  if (isLoading) {
    return <LoadingScreen progress={progress} />;
  }

  // Calculate achievement progress
  const allAchievements = [
    { id: 'first-recipe', unlocked: recipeCount >= 1 },
    { id: 'chaos-master', unlocked: chaosCount >= 5 },
    { id: 'sauce-sorcerer', unlocked: recipeCount >= 3 },
    { id: 'social-butterfly', unlocked: shareCount >= 1 },
    { id: 'chaos-legend', unlocked: chaosCount >= 10 },
    { id: 'recipe-collector', unlocked: recipeCount >= 10 },
    { id: 'historically-approved', unlocked: !!historicalRating },
    { id: 'chaos-apocalypse', unlocked: chaosCount >= 25 }
  ];
  
  const unlockedAchievements = allAchievements.filter(a => a.unlocked).length;

  // Handle image upload and ingredient analysis
  const handleImageUpload = async (file: File) => {
    setIsAnalyzing(true);
    setIsGeneratingRecipe(true);
    
    try {
      // Analyze ingredients from image
      const analysis = await analyzeIngredients(file);
      
      // Generate absurd recipe
      const newRecipe = await generateAbsurdRecipe(analysis.ingredients);
      setRecipe(newRecipe);
      setRecipeCount(prev => prev + 1);
      
      // Generate chef narration
      const chefScript = await generateChefNarration(newRecipe);
      setNarration(chefScript);
      
      // Generate meme caption
      const caption = await generateMemeCaption(newRecipe);
      setMemeCaption(caption);
      
      // Get historical rating
      const rating = await getRatingFromHistoricalFigure(newRecipe);
      setHistoricalRating(rating);
      
    } catch (error) {
      console.error('Error processing image:', error);
      // Show fallback recipe
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

  // Handle chaos button click
  const handleChaosClick = async () => {
    if (!recipe) return;
    
    setIsChaosLoading(true);
    setChaosCount(prev => prev + 1);
    
    try {
      // Mutate the recipe with more chaos
      const chaosRecipe = await mutateChaosRecipe(recipe);
      setRecipe(chaosRecipe);
      
      // Generate new narration for chaos recipe
      const chefScript = await generateChefNarration(chaosRecipe);
      setNarration(chefScript);
      
      // Generate new meme caption
      const caption = await generateMemeCaption(chaosRecipe);
      setMemeCaption(caption);
      
    } catch (error) {
      console.error('Error generating chaos:', error);
    } finally {
      setIsChaosLoading(false);
    }
  };

  // Handle chef narration
  const handleStartNarration = async () => {
    if (!narration || isNarrating) return;
    
    setIsNarrating(true);
    try {
      await ttsService.speak(narration);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    } finally {
      setIsNarrating(false);
    }
  };

  // Handle meme caption generation
  const handleGenerateCaption = async () => {
    if (!recipe) return;
    
    try {
      const caption = await generateMemeCaption(recipe);
      setMemeCaption(caption);
      // Increment share count when caption is generated (user intent to share)
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating caption:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <AnimatedBackground />
        {/* Fixed Stats Header */}
      <FixedStatsHeader 
        recipeCount={recipeCount}
        chaosCount={chaosCount}
        shareCount={shareCount}
        achievementCount={unlockedAchievements}
        totalAchievements={allAchievements.length}
      />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
              🧑‍🍳 MemeChef
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light">
              The AI-Powered Absurd Recipe Generator
            </p>
            <p className="text-lg text-purple-200">
              Where chaos meets cuisine and sanity goes to die! 🔥✨
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 space-y-12 pb-20">
        
        {/* Ingredient Upload */}
        <section>
          <GlassCard className="p-8">
            <IngredientUpload 
              onImageUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
            />
          </GlassCard>
        </section>

        {/* AI Chef */}
        <section>
          <GlassCard className="p-8">
            <AiChef 
              narration={narration}
              isNarrating={isNarrating}
              onStartNarration={handleStartNarration}
            />
          </GlassCard>
        </section>

        {/* Recipe Display */}
        {(recipe || isGeneratingRecipe) && (
          <section>
            {isGeneratingRecipe ? (
              <GlassCard className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-purple-300 mb-2">Generating Chaos...</h2>
                <p className="text-white/70">The AI chef is concocting something ridiculous!</p>
              </GlassCard>
            ) : (
              <GlassCard className="p-8">
                <RecipeDisplay recipe={recipe} />
              </GlassCard>
            )}
          </section>
        )}

        {/* Chaos Button */}
        {recipe && (
          <section>
            <GlassCard className="p-8">
              <ChaosButton 
                onChaosClick={handleChaosClick}
                isLoading={isChaosLoading}
                disabled={!recipe}
              />
            </GlassCard>
          </section>
        )}

        {/* Share Recipe */}
        {recipe && (
          <section>
            <GlassCard className="p-8">
              <ShareRecipe 
                recipe={recipe}
                memeCaption={memeCaption}
                onGenerateCaption={handleGenerateCaption}
              />
            </GlassCard>
          </section>
        )}

        {/* Achievements */}
        <section>
          <GlassCard className="p-8">
            <Achievements 
              recipeCount={recipeCount}
              chaosCount={chaosCount}
              shareCount={shareCount}
              historicalRating={historicalRating}
            />
          </GlassCard>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative">
        <GlassCard className="m-4 p-8 text-center" hover={false}>
          <div className="space-y-2">
            <p className="text-white/80 flex items-center justify-center space-x-2">
              <Heart className="text-red-400" size={18} />
              <span>Made with ❤️ and a questionable amount of chaos</span>
            </p>
            <p className="text-white/60 text-sm">
              Powered by Gemini AI • Built for the Bolt.new Hackathon 2025
            </p>
          </div>
        </GlassCard>
      </footer>
    </div>
  );
}