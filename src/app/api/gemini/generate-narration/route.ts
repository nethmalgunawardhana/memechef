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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });    const prompt = `
      Create a fun, simple narration for this recipe: ${JSON.stringify(recipe)}
      
      Be encouraging and funny like a cool friend teaching cooking. Keep it under 120 words.
      Use simple words and make jokes about how easy it is.
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
