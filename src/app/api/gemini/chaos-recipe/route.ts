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
    const { currentRecipe } = body;

    if (!currentRecipe) {
      return NextResponse.json(
        { error: 'Current recipe is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Take this recipe and make it EVEN MORE CHAOTIC and absurd:
      ${JSON.stringify(currentRecipe)}
      
      Add more chaos by:
      - Replacing normal ingredients with impossible ones ("tears of joy", "essence of confusion")
      - Adding impossible cooking steps ("summon a goblin for taste testing")
      - Making measurements even more ridiculous
      - Adding mystical elements
      
      Return in the same JSON format but make it more unhinged!
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const chaosRecipe = JSON.parse(jsonMatch[0]);
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
