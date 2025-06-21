import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache for narrations
const narrationCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_DURATION = 45 * 60 * 1000; // 45 minutes

function getNarrationKey(recipe: any): string {
  return `narr_${recipe.title?.slice(0, 20) || 'unknown'}`;
}

function getCachedNarration(key: string): string | null {
  const cached = narrationCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  narrationCache.delete(key);
  return null;
}

function setNarrationCache(key: string, data: string): void {
  narrationCache.set(key, { data, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();    const { recipe } = body;

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe object is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getNarrationKey(recipe);
    const cached = getCachedNarration(cacheKey);
    if (cached) {
      return NextResponse.json({ narration: cached });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });const prompt = `
      Create a fun, simple narration for this recipe: ${JSON.stringify(recipe)}
      
      Be encouraging and funny like a cool friend teaching cooking. Keep it under 120 words.
      Use simple words and make jokes about how easy it is.
    `;    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const narration = response.text();

    // Cache the result
    setNarrationCache(cacheKey, narration);

    return NextResponse.json({ narration });

  } catch (error) {
    console.error('Error generating narration:', error);
    return NextResponse.json(
      { 
        narration: "Yo yo yo! Welcome to the kitchen of chaos! Today we're making something that definitely exists and is totally edible! Let's get weird with it! *chef's kiss*" 
      },
      { status: 500 }
    );
  }
}
