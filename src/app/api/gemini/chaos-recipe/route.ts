import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple cache for chaos recipes
const chaosCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getChaosKey(recipe: any): string {
  return `${recipe.title}_${recipe.ingredients?.length || 0}`;
}

function getCachedChaos(key: string): any | null {
  const cached = chaosCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  chaosCache.delete(key);
  return null;
}

function setChaosCache(key: string, data: any): void {
  chaosCache.set(key, { data, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();    const { currentRecipe } = body;

    if (!currentRecipe) {
      return NextResponse.json(
        { error: 'Current recipe is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getChaosKey(currentRecipe);
    const cached = getCachedChaos(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });const prompt = `
      Make this recipe funnier and sillier: ${JSON.stringify(currentRecipe)}
      
      Add silly ingredients and funny steps. Keep it simple and easy to understand.
      Return same JSON format.
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();
      // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const chaosRecipe = JSON.parse(jsonMatch[0]);
      // Cache the result
      setChaosCache(cacheKey, chaosRecipe);
      return NextResponse.json(chaosRecipe);
    }
    
    // Fallback chaos mutation
    return NextResponse.json({
      ...currentRecipe,
      title: `CHAOTIC ${currentRecipe.title}`,
      ingredients: currentRecipe.ingredients.map((ing: string) => `${ing} + essence of pure chaos`),
      instructions: [
        ...currentRecipe.instructions,
        "Dance around the kitchen while chanting ancient recipes",
        "Ask a nearby pigeon for cooking advice",
        "Replace all water with tears of laughter"
      ]
    });
  } catch (error) {
    console.error('Error mutating recipe:', error);
    return NextResponse.json(
      { 
        error: 'Failed to mutate recipe',
        title: "CHAOTIC Recipe of Doom",
        backstory: "Born from pure chaos when the AI chef had a meltdown.",
        ingredients: ["essence of confusion", "digital tears", "pure chaos"],
        instructions: [
          "Accept that cooking is an illusion",
          "Embrace the chaos",
          "Serve with existential dread"
        ]
      },
      { status: 500 }
    );
  }
}
