interface Recipe {
  title: string;
  backstory: string;
  ingredients: string[];
  instructions: string[];
}

interface RecipeDisplayProps {
  recipe: Recipe | null;
}

export default function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  if (!recipe) {
    return <div>No recipe generated yet. Submit some ingredients!</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
      <p className="italic text-sm text-gray-600 mb-4">{recipe.backstory}</p>
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-1">Ingredients:</h3>
        <ul className="list-disc list-inside pl-4">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-1">Instructions:</h3>
        <ol className="list-decimal list-inside pl-4">
          {recipe.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
