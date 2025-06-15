'use client';

import { useState, useEffect } from 'react';
import IngredientUpload from "@/components/IngredientUpload";
import RecipeDisplay from "@/components/RecipeDisplay";
import AiChef from "@/components/AiChef";
import ChaosButton from "@/components/ChaosButton";
import ShareRecipe from "@/components/ShareRecipe";
import Achievements from "@/components/Achievements";
import FixedStatsHeader from "@/components/FixedStatsHeader";
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
  
  // Stats for achievements
  const [recipeCount, setRecipeCount] = useState(0);
  const [chaosCount, setChaosCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

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

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('memechef-stats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setRecipeCount(stats.recipeCount || 0);
      setChaosCount(stats.chaosCount || 0);
      setShareCount(stats.shareCount || 0);
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    const stats = { recipeCount, chaosCount, shareCount };
    localStorage.setItem('memechef-stats', JSON.stringify(stats));
  }, [recipeCount, chaosCount, shareCount]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Fixed Stats Header */}
      <FixedStatsHeader 
        recipeCount={recipeCount}
        chaosCount={chaosCount}
        shareCount={shareCount}
        achievementCount={unlockedAchievements}
        totalAchievements={allAchievements.length}
      />

      {/* Header - add top padding to account for fixed header */}
      <header className="text-center py-8 px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            🧑‍🍳 MemeChef
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            The AI-Powered Absurd Recipe Generator
          </p>
          <p className="text-sm text-gray-500">
            Where chaos meets cuisine and sanity goes to die! 🔥✨
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Ingredient Upload */}
          <section>
            <IngredientUpload 
              onImageUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
            />
          </section>

          {/* AI Chef */}
          <section>
            <AiChef 
              narration={narration}
              isNarrating={isNarrating}
              onStartNarration={handleStartNarration}
            />
          </section>

          {/* Recipe Display */}
          {(recipe || isGeneratingRecipe) && (
            <section>
              {isGeneratingRecipe ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                  <h2 className="text-2xl font-bold text-purple-600 mb-2">Generating Chaos...</h2>
                  <p className="text-gray-600">The AI chef is concocting something ridiculous!</p>
                </div>
              ) : (
                <RecipeDisplay recipe={recipe} />
              )}
            </section>
          )}

          {/* Chaos Button */}
          {recipe && (
            <section>
              <ChaosButton 
                onChaosClick={handleChaosClick}
                isLoading={isChaosLoading}
                disabled={!recipe}
              />
            </section>
          )}

          {/* Share Recipe */}
          {recipe && (
            <section>
              <ShareRecipe 
                recipe={recipe}
                memeCaption={memeCaption}
                onGenerateCaption={handleGenerateCaption}
              />
            </section>
          )}

          {/* Achievements */}
          <section>
            <Achievements 
              recipeCount={recipeCount}
              chaosCount={chaosCount}
              shareCount={shareCount}
              historicalRating={historicalRating}
            />
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-gray-600 mb-2">
            Made with ❤️ and a questionable amount of chaos
          </p>
          <p className="text-sm text-gray-500">
            Powered by Gemini AI • Built for the Bolt.new Hackathon 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
