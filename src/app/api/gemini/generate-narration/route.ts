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

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe object is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Create a chaotic, meme-worthy narration script for this recipe in the voice of an unhinged AI chef.
      Mix TikTok energy with Shakespearean drama. Be over-the-top, funny, and slightly concerning.
      
      Recipe: ${JSON.stringify(recipe)}
      
      Style guidelines:
      - Use modern slang mixed with fancy cooking terms
      - Be dramatically passionate about cooking
      - Include random chef wisdom that makes no sense
      - Act like this recipe will change the world
      - Maximum 200 words for TTS
      
      Example tone: "BEHOLD! *chef's kiss* We're about to create culinary CHAOS that would make Gordon Ramsay weep tears of confusion! This recipe? ICONIC. Your taste buds? UNPREPARED. Let's get chaotic, my beautiful disasters!"
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const narration = response.text();

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
