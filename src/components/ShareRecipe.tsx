import { useState, useRef } from 'react';
import { Recipe } from '@/services/geminiService';

interface ShareRecipeProps {
  recipe: Recipe | null;
  memeCaption: string;
  onGenerateCaption: () => void;
}

export default function ShareRecipe({ recipe, memeCaption, onGenerateCaption }: ShareRecipeProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const recipeCardRef = useRef<HTMLDivElement>(null);

  const generateRecipeCard = async () => {
    if (!recipe || !recipeCardRef.current) return;

    setIsGeneratingImage(true);
    
    try {
      // Use html2canvas to convert the recipe card to image
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(recipeCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setShareUrl(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent(memeCaption);
    const hashtags = encodeURIComponent('#MemeChef #ChaosRecipe #AIChef #AbsurdCooking');
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`;
        break;
      case 'instagram':
        // Instagram doesn't have direct sharing, but we can copy the caption
        navigator.clipboard.writeText(`${memeCaption} ${hashtags}`);
        alert('Caption copied to clipboard! Open Instagram and paste it with your recipe image.');
        return;
      case 'tiktok':
        // TikTok doesn't have direct web sharing
        navigator.clipboard.writeText(`${memeCaption} ${hashtags}`);
        alert('Caption copied to clipboard! Open TikTok and paste it with your recipe video.');
        return;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const downloadImage = () => {
    if (shareUrl) {
      const link = document.createElement('a');
      link.href = shareUrl;
      link.download = `memechef-${recipe?.title || 'recipe'}.png`;
      link.click();
    }
  };

  if (!recipe) {
    return (
      <div className="w-full max-w-lg mx-auto mb-8">
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <div className="text-4xl mb-2">📤</div>
          <p className="text-gray-600">Create a recipe first to share your culinary chaos!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-2">📱 Share Your Chaos</h2>
        <p className="text-gray-600">Spread the culinary madness across the internet!</p>
      </div>

      {/* Recipe Card for Image Generation */}
      <div 
        ref={recipeCardRef}
        className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-6 mb-6 shadow-lg"
        style={{ minHeight: '400px' }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🧑‍🍳</div>
          <h1 className="text-2xl font-bold text-purple-800 mb-2">MemeChef Recipe</h1>
          <h2 className="text-xl font-semibold text-gray-800">{recipe.title}</h2>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-sm italic text-gray-600 mb-3">{recipe.backstory}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-purple-700 mb-2">Ingredients:</h3>
              <ul className="text-sm space-y-1">
                {recipe.ingredients.slice(0, 5).map((ing, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-purple-500 mr-1">•</span>
                    <span>{ing}</span>
                  </li>
                ))}
                {recipe.ingredients.length > 5 && (
                  <li className="text-gray-500 italic">...and more chaos!</li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-700 mb-2">Instructions:</h3>
              <ol className="text-sm space-y-1">
                {recipe.instructions.slice(0, 4).map((step, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-purple-500 mr-1 font-medium">{i + 1}.</span>
                    <span>{step.length > 50 ? `${step.slice(0, 50)}...` : step}</span>
                  </li>
                ))}
                {recipe.instructions.length > 4 && (
                  <li className="text-gray-500 italic">...continue the madness!</li>
                )}
              </ol>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-purple-600 font-medium">
          Created with MemeChef AI • Where Chaos Meets Cuisine
        </div>
      </div>

      {/* Meme Caption */}
      <div className="mb-6">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Meme Caption:</h3>
            <button
              onClick={onGenerateCaption}
              className="text-pink-600 hover:text-pink-700 text-sm font-medium"
            >
              🎲 Generate New
            </button>
          </div>          <p className="text-gray-800 italic bg-gray-50 p-3 rounded border-l-4 border-pink-400">
            &quot;{memeCaption || 'Click generate to create a meme caption!'}&quot;
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex gap-3 justify-center">
          <button
            onClick={generateRecipeCard}
            disabled={isGeneratingImage}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isGeneratingImage
                ? 'bg-gray-300 text-gray-500 cursor-wait'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isGeneratingImage ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Image...</span>
              </span>
            ) : (
              '📸 Generate Recipe Card'
            )}
          </button>

          {shareUrl && (
            <button
              onClick={downloadImage}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              💾 Download Image
            </button>
          )}
        </div>

        {/* Social Media Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => shareToSocial('twitter')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <span>🐦</span>
            <span className="text-sm">Twitter</span>
          </button>
          
          <button
            onClick={() => shareToSocial('instagram')}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors"
          >
            <span>📷</span>
            <span className="text-sm">Instagram</span>
          </button>
          
          <button
            onClick={() => shareToSocial('tiktok')}
            className="flex items-center justify-center space-x-2 p-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            <span>🎵</span>
            <span className="text-sm">TikTok</span>
          </button>
          
          <button
            onClick={() => shareToSocial('facebook')}
            className="flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <span>📘</span>
            <span className="text-sm">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}
