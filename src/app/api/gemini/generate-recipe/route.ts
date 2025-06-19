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
    const { ingredients } = body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'Ingredients array is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Create a completely absurd, meme-worthy recipe using these ingredients: ${ingredients.join(', ')}
      
      Make it hilarious and chaotic with:
      - Mix real cooking terms with absurd instructions (e.g., "emotionally dice the onion," "whisk with regret")
      - Include a fake historical backstory
      - Use measurements that make no sense
      - Add impossible steps
      
      Return response in this exact JSON format:
      {
        "title": "Recipe Name (should be ridiculous)",
        "backstory": "Fake historical origin story (1-2 sentences)",
        "ingredients": ["ingredient with absurd measurement", "another ingredient with chaos"],
        "instructions": ["step 1 with chaos", "step 2 with more chaos", "etc"]
      }
      
      Example style:
      - "3 cups of existential dread"
      - "Whisper sweet nothings to the pasta for 7 minutes"
      - "Summon the ancient spirits of flavor"
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recipe = JSON.parse(jsonMatch[0]);
      return NextResponse.json(recipe);
    }
    
    // Fallback recipe
    return NextResponse.json({
      title: "The Catastrophic Chaos Casserole",
      backstory: "Invented in 1420 by a wizard-chef who forgot salt and accidentally used dragon tears instead.",
      ingredients: ingredients.map(ing => `2 cups of confused ${ing}`),
      instructions: [
        "Emotionally prepare your ingredients while questioning your life choices",
        "Mix everything together with the fury of a thousand disappointed grandmothers",
        "Cook until it looks like abstract art",
        "Serve to your enemies"
      ]
    });
  } catch (error) {
    console.error('Error generating recipe:', error);
    
    const { ingredients: fallbackIngredients } = await request.json().catch(() => ({ ingredients: ['unknown ingredient'] }));
    
    return NextResponse.json(
      {
        title: "The Recipe of Mysterious Doom",
        backstory: "Born from the chaos of a broken AI chef's dreams.",
        ingredients: fallbackIngredients?.map((ing: string) => `Some amount of ${ing} (measurement lost to time)`) || ['Some mystery ingredient'],
        instructions: [
          "Do something with the ingredients",
          "Hope for the best",
          "Pray to the cooking gods",
          "Serve with extreme caution"
        ]
      },
      { status: 500 }
    );
  }
}
