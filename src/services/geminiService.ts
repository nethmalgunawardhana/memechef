// Frontend service for communicating with backend API routes
// No longer using direct Gemini API calls for security

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

// Convert file to base64 for API upload
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.readAsDataURL(file);
  });
}

export async function analyzeIngredients(imageFile: File): Promise<IngredientAnalysis> {
  try {
    const imageBase64 = await fileToBase64(imageFile);
    
    const response = await fetch('/api/gemini/analyze-ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        mimeType: imageFile.type,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
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
    const response = await fetch('/api/gemini/generate-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
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
    const response = await fetch('/api/gemini/generate-narration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.narration;
  } catch (error) {
    console.error('Error generating narration:', error);
    return "Yo yo yo! Welcome to the kitchen of chaos! Today we're making something that definitely exists and is totally edible! Let's get weird with it! *chef's kiss*";
  }
}

export async function mutateChaosRecipe(currentRecipe: Recipe): Promise<Recipe> {
  try {
    const response = await fetch('/api/gemini/chaos-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentRecipe,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error mutating recipe:', error);
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
  }
}

export async function generateMemeCaption(recipe: Recipe): Promise<string> {
  try {
    const response = await fetch('/api/gemini/generate-caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.caption;
  } catch (error) {
    console.error('Error generating caption:', error);
    return "Just created something that definitely shouldn't exist but somehow does 🍳✨";
  }
}

export async function getRatingFromHistoricalFigure(recipe: Recipe): Promise<string> {
  try {
    const response = await fetch('/api/gemini/historical-rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return result.rating;
  } catch (error) {
    console.error('Error generating rating:', error);
    return "Shakespeare gives this recipe 4 quills out of 5 - 'Tis a dish most foul, yet strangely compelling.'";
  }
}
