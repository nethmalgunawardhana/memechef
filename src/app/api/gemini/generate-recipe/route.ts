import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface Recipe {
  title: string;
  backstory: string;
  ingredients: string[];
  instructions: string[];
}

interface CacheEntry {
  data: Recipe;
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCacheKey(ingredients: string[]): string {
  return ingredients.sort().join(',').toLowerCase();
}

function getFromCache(key: string): Recipe | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: Recipe): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json() as { ingredients: string[] };
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Ingredients array is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(ingredients);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });const prompt = `
      Create a simple, funny recipe using: ${ingredients.join(', ')}
      
      Make it hilarious but easy to understand. Use silly measurements and funny steps.
      
      JSON format:
      {
        "title": "funny recipe name",
        "backstory": "one silly sentence",
        "ingredients": ["simple ingredient with funny amount"],
        "instructions": ["easy step with joke"]
      }
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();
      // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recipe = JSON.parse(jsonMatch[0]);
      // Cache the result
      setCache(cacheKey, recipe);
      return NextResponse.json(recipe);
    }
      // Fallback recipe
    const fallbackRecipe: Recipe = {
      title: "The Catastrophic Chaos Casserole",
      backstory: "Invented in 1420 by a wizard-chef who forgot salt and accidentally used dragon tears instead.",
      ingredients: ingredients.map(ing => `2 cups of confused ${ing}`),
      instructions: [
        "Emotionally prepare your ingredients while questioning your life choices",
        "Mix everything together with the fury of a thousand disappointed grandmothers",
        "Cook until it looks like abstract art",
        "Serve to your enemies"
      ]
    };
    return NextResponse.json(fallbackRecipe);  } catch (error) {
    console.error('Error generating recipe:', error);
    
    let fallbackIngredients: string[] = ['unknown ingredient'];
    try {
      const errorBody = await request.json() as { ingredients?: string[] };
      fallbackIngredients = errorBody.ingredients || fallbackIngredients;
    } catch {
      // Use default fallback ingredients
    }
    
    const errorRecipe: Recipe = {
      title: "The Recipe of Mysterious Doom",
      backstory: "Born from the chaos of a broken AI chef's dreams.",
      ingredients: fallbackIngredients.map((ing: string) => `Some amount of ${ing} (measurement lost to time)`),
      instructions: [
        "Do something with the ingredients",
        "Hope for the best",
        "Pray to the cooking gods",
        "Serve with extreme caution"
      ]
    };
    
    return NextResponse.json(errorRecipe, { status: 500 });
  }
}
