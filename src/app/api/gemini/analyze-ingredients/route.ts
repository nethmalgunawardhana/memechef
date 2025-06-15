import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };
    
    const prompt = `
      Analyze this image and identify the main food ingredients you can see. 
      If the image is unclear or contains non-food items, make humorous guesses with confidence levels.
      
      Return your response in this exact JSON format:
      {
        "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
        "confidence": "high/medium/low with humorous comment"
      }
      
      Examples of humorous responses for unclear images:
      - "low - Possibly broccoli, or a cursed cucumber that's seen too much"
      - "medium - Definitely pasta, unless it's angry worms having a meeting"
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]);
      return NextResponse.json(analysisResult);
    }
    
    // Fallback if JSON parsing fails
    return NextResponse.json({
      ingredients: ['mysterious substance', 'unidentified edible object', 'chaos element'],
      confidence: 'low - The AI chef is confused but excited to experiment!'
    });

  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze ingredients',
        ingredients: ['mystery ingredient', 'something questionable', 'pure chaos'],
        confidence: 'unknown - The AI chef\'s eyes are malfunctioning, but its spirit is willing!'
      },
      { status: 500 }
    );
  }
}
