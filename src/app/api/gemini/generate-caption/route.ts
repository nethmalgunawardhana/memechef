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
      Create a funny, shareable meme caption for this absurd recipe: ${recipe.title}
      
      Style: Short, punchy, relatable. Like "Just cooked forbidden ramen. My ancestors weep." or "POV: You're explaining to your grandmother why you added existential dread to soup"
      
      Keep it under 100 characters for social media.
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const caption = response.text().trim();
    
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
