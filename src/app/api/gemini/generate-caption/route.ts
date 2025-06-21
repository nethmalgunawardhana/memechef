import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache for captions
const captionCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

function getCaptionKey(title: string): string {
  return `cap_${title.slice(0, 25)}`;
}

function getCachedCaption(key: string): string | null {
  const cached = captionCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  captionCache.delete(key);
  return null;
}

function setCaptionCache(key: string, data: string): void {
  captionCache.set(key, { data, timestamp: Date.now() });
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

    if (!recipe || !recipe.title) {
      return NextResponse.json(
        { error: 'Recipe object is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCaptionKey(recipe.title);
    const cached = getCachedCaption(cacheKey);
    if (cached) {
      return NextResponse.json({ caption: cached });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });const prompt = `
      Create a short, funny social media caption for: ${recipe.title}
      
      Make it relatable and shareable. Under 60 characters. Add emojis.
    `;    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const caption = response.text().trim();
    
    // Cache the result
    setCaptionCache(cacheKey, caption);
    
    return NextResponse.json({ caption });

  } catch (error) {
    console.error('Error generating caption:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate caption',
        caption: "Just created something that definitely shouldn't exist but somehow does 🍳✨"
      },
      { status: 500 }
    );
  }
}
