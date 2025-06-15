import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { recipe } = body;

    if (!recipe || !recipe.title) {
      return NextResponse.json(
        { error: 'Recipe object is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      Have a random historical figure rate this recipe: ${recipe.title}
      
      Pick someone like Napoleon, Cleopatra, Einstein, etc. and give their humorous review with a rating out of 5 using their era-appropriate items (horses, pyramids, theories, etc.)
      
      Example: "Napoleon gives this soup 3 horses out of 5 - 'It lacks the strategic complexity of my military campaigns, but the chaos reminds me of Waterloo.'"
      
      Keep it short and funny!
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const rating = response.text().trim();
    
    return NextResponse.json({ rating });

  } catch (error) {
    console.error('Error generating historical rating:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate rating',
        rating: "Shakespeare gives this recipe 4 quills out of 5 - 'Tis a dish most foul, yet strangely compelling.'"
      },
      { status: 500 }
    );
  }
}
