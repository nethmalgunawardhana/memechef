// Frontend service for communicating with backend API routes
// No longer using direct Gemini API calls for security

import { cacheService } from './cacheService';
import { requestOptimizer } from './requestOptimizer';

// Generate a unique key for request deduplication
function generateRequestKey(type: string, data: unknown): string {
  return `${type}_${JSON.stringify(data).slice(0, 100)}`;
}

export interface Recipe {
  title: string;
  backstory: string;
  ingredients: string[];
  instructions: string[];
}

export interface IngredientAnalysis {
  ingredients: string[];
  confidence: string;
}

// Convert file to base64 for API upload
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });
}

export async function analyzeIngredients(imageFile: File): Promise<IngredientAnalysis> {
  try {
    // Create a simple hash of the image for caching (size + name + type)
    const imageHash = `${imageFile.size}_${imageFile.name}_${imageFile.type}`;
    const cachedResult = cacheService.get<IngredientAnalysis>(`ingredients_${imageHash}`);
    
    if (cachedResult) {
      console.log('Using cached ingredient analysis');
      return cachedResult;
    }

    // Use request deduplication to prevent multiple identical requests
    const requestKey = generateRequestKey('analyze_ingredients', imageHash);
    
    return requestOptimizer.deduplicateRequest(requestKey, async () => {
      const imageBase64 = await fileToBase64(imageFile);
      
      const response = await fetch('/api/gemini/analyze-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageFile.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result for 2 hours
      cacheService.set(`ingredients_${imageHash}`, result, 2 * 60 * 60 * 1000);
      
      return result;
    });
  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    return {
      ingredients: ['mystery ingredient', 'something questionable', 'pure chaos'],
      confidence: 'unknown - The AI chef\'s eyes are malfunctioning, but its spirit is willing!'
    };
  }
}

export async function generateAbsurdRecipe(ingredients: string[]): Promise<Recipe> {
  try {
    // Check cache first
    const cachedRecipe = cacheService.getCachedRecipe(ingredients);
    if (cachedRecipe) {
      console.log('Using cached recipe');
      return cachedRecipe;
    }

    // Use request deduplication for identical ingredient combinations
    const requestKey = generateRequestKey('generate_recipe', ingredients.sort());

    return requestOptimizer.deduplicateRequest(requestKey, async () => {
      const response = await fetch('/api/gemini/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      cacheService.cacheRecipe(ingredients, result);
      
      return result;
    });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return {
      title: "The Recipe of Mysterious Doom",
      backstory: "Born from the chaos of a broken AI chef's dreams.",
      ingredients: ingredients.map(ing => `Some amount of ${ing} (measurement lost to time)`),
      instructions: [
        "Do something with the ingredients",
        "Hope for the best",
        "Pray to the cooking gods",
        "Serve with extreme caution"
      ]
    };
  }
}

export async function generateChefNarration(recipe: Recipe): Promise<string> {
  try {
    // Use request deduplication for identical recipes
    const requestKey = generateRequestKey('generate_narration', recipe.title);

    return requestOptimizer.deduplicateRequest(requestKey, async () => {
      const response = await fetch('/api/gemini/generate-narration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return result.narration;
    });
  } catch (error) {
    console.error('Error generating narration:', error);
    return "Yo yo yo! Welcome to the kitchen of chaos! Today we're making something that definitely exists and is totally edible! Let's get weird with it! *chef's kiss*";
  }
}

export async function mutateChaosRecipe(currentRecipe: Recipe): Promise<Recipe> {
  try {
    // Use request deduplication but with a timestamp to allow some variation
    const requestKey = generateRequestKey('chaos_recipe', `${currentRecipe.title}_${Date.now()}`);

    return requestOptimizer.deduplicateRequest(requestKey, async () => {
      const response = await fetch('/api/gemini/chaos-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentRecipe,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    });
  } catch (error) {
    console.error('Error mutating recipe:', error);
    return {
      ...currentRecipe,
      title: `CHAOTIC ${currentRecipe.title}`,
      ingredients: currentRecipe.ingredients.map(ing => `${ing} + essence of pure chaos`),
      instructions: [
        ...currentRecipe.instructions,
        "Dance around the kitchen while chanting ancient recipes",
        "Ask a nearby pigeon for cooking advice",
        "Replace all water with tears of laughter"
      ]
    };
  }
}

export async function generateMemeCaption(recipe: Recipe): Promise<string> {
  try {
    // Use request deduplication for identical recipes
    const requestKey = generateRequestKey('generate_caption', recipe.title);

    return requestOptimizer.deduplicateRequest(requestKey, async () => {
      const response = await fetch('/api/gemini/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return result.caption;
    });
  } catch (error) {
    console.error('Error generating caption:', error);
    return "Just created something that definitely shouldn't exist but somehow does 🍳✨";
  }
}

export async function getRatingFromHistoricalFigure(recipe: Recipe): Promise<string> {
  try {
    // Use request deduplication for identical recipes
    const requestKey = generateRequestKey('historical_rating', recipe.title);

    return requestOptimizer.deduplicateRequest(requestKey, async () => {
      const response = await fetch('/api/gemini/historical-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      return result.rating;
    });
  } catch (error) {
    console.error('Error generating rating:', error);
    return "Shakespeare gives this recipe 4 quills out of 5 - 'Tis a dish most foul, yet strangely compelling.'";
  }
}

// Utility functions that leverage request optimizer's batch capabilities

// Generate multiple recipe variations in batches
export async function generateRecipeVariations(
  baseIngredients: string[], 
  variationCount: number = 3
): Promise<Recipe[]> {
  const requests = Array.from({ length: variationCount }, (_, index) => {
    // Add slight variations to ingredients to create different recipes
    const modifiedIngredients = [...baseIngredients];
    if (index > 0) {
      modifiedIngredients.push(`mystery element #${index}`);
    }
    
    return () => generateAbsurdRecipe(modifiedIngredients);
  });

  return requestOptimizer.batchRequests(requests, 2); // Process 2 at a time
}

// Generate multiple content types for a recipe in batches
export async function generateRecipeContent(recipe: Recipe): Promise<{
  narration: string;
  caption: string;
  rating: string;
}> {
  const requests = [
    () => generateChefNarration(recipe),
    () => generateMemeCaption(recipe),
    () => getRatingFromHistoricalFigure(recipe)
  ];

  const [narration, caption, rating] = await requestOptimizer.batchRequests(requests, 3);

  return { narration, caption, rating };
}

// Debounced recipe generation for real-time ingredient updates
export function generateRecipeDebounced(
  ingredients: string[], 
  delay: number = 1000
): Promise<Recipe> {
  const requestKey = generateRequestKey('debounced_recipe', ingredients.sort().join(','));
  
  return requestOptimizer.debounceRequest(
    requestKey,
    () => generateAbsurdRecipe(ingredients),
    delay
  );
}
