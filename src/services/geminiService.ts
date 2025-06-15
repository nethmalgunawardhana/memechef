import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface Recipe {
  title: string;
  backstory: string;
  ingredients: string[];
  instructions: string[];
}

export interface IngredientAnalysis {
  ingredients: string[];
  confidence: string;
}

// Convert file to base64 for Gemini
async function fileToGenerativePart(file: File) {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export async function analyzeIngredients(imageFile: File): Promise<IngredientAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const imagePart = await fileToGenerativePart(imageFile);
    
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
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      ingredients: ['mysterious substance', 'unidentified edible object', 'chaos element'],
      confidence: 'low - The AI chef is confused but excited to experiment!'
    };
  } catch (error) {
    console.error('Error analyzing ingredients:', error);
    return {
      ingredients: ['mystery ingredient', 'something questionable', 'pure chaos'],
      confidence: 'unknown - The AI chef\'s eyes are malfunctioning, but its spirit is willing!'
    };
  }
}

export async function generateAbsurdRecipe(ingredients: string[]): Promise<Recipe> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
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
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback recipe
    return {
      title: "The Catastrophic Chaos Casserole",
      backstory: "Invented in 1420 by a wizard-chef who forgot salt and accidentally used dragon tears instead.",
      ingredients: ingredients.map(ing => `2 cups of confused ${ing}`),
      instructions: [
        "Emotionally prepare your ingredients while questioning your life choices",
        "Mix everything together with the fury of a thousand disappointed grandmothers",
        "Cook until it looks like abstract art",
        "Serve to your enemies"
      ]
    };
  } catch (error) {
    console.error('Error generating recipe:', error);
    return {
      title: "The Recipe of Mysterious Doom",
      backstory: "Born from the chaos of a broken AI chef's dreams.",
      ingredients: ingredients.map(ing => `Some amount of ${ing} (measurement lost to time)`),
      instructions: [
        "Do something with the ingredients",
        "Hope for the best",
        "Pray to the cooking gods",
        "Serve with extreme caution"
      ]
    };
  }
}

export async function generateChefNarration(recipe: Recipe): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
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
    return response.text();
  } catch (error) {
    console.error('Error generating narration:', error);
    return "Yo yo yo! Welcome to the kitchen of chaos! Today we're making something that definitely exists and is totally edible! Let's get weird with it! *chef's kiss*";
  }
}

export async function mutateChaosRecipe(currentRecipe: Recipe): Promise<Recipe> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
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
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback chaos mutation
    return {
      ...currentRecipe,
      title: `CHAOTIC ${currentRecipe.title}`,
      ingredients: currentRecipe.ingredients.map(ing => `${ing} + essence of pure chaos`),
      instructions: [
        ...currentRecipe.instructions,
        "Dance around the kitchen while chanting ancient recipes",
        "Ask a nearby pigeon for cooking advice",
        "Replace all water with tears of laughter"
      ]
    };
  } catch (error) {
    console.error('Error mutating recipe:', error);
    return currentRecipe;
  }
}

export async function generateMemeCaption(recipe: Recipe): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      Create a funny, shareable meme caption for this absurd recipe: ${recipe.title}
      
      Style: Short, punchy, relatable. Like "Just cooked forbidden ramen. My ancestors weep." or "POV: You're explaining to your grandmother why you added existential dread to soup"
      
      Keep it under 100 characters for social media.
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating caption:', error);
    return "Just created something that definitely shouldn't exist but somehow does 🍳✨";
  }
}

export async function getRatingFromHistoricalFigure(recipe: Recipe): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      Have a random historical figure rate this recipe: ${recipe.title}
      
      Pick someone like Napoleon, Cleopatra, Einstein, etc. and give their humorous review with a rating out of 5 using their era-appropriate items (horses, pyramids, theories, etc.)
      
      Example: "Napoleon gives this soup 3 horses out of 5 - 'It lacks the strategic complexity of my military campaigns, but the chaos reminds me of Waterloo.'"
      
      Keep it short and funny!
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating rating:', error);
    return "Shakespeare gives this recipe 4 quills out of 5 - 'Tis a dish most foul, yet strangely compelling.'";
  }
}
