import { useState, useRef } from 'react';
import { Share2, Download, Copy, RefreshCw, Camera, Twitter, Instagram, Facebook, Music } from 'lucide-react';
import { Recipe } from '@/services/geminiService';

interface ShareRecipeProps {
  recipe: Recipe | null;
  memeCaption: string;
  onShare?: () => void;
  onGenerateCaption?: () => void;
}

export default function ShareRecipe({ recipe, memeCaption, onShare, onGenerateCaption }: ShareRecipeProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent(memeCaption);
    const hashtags = encodeURIComponent('MemeChef ChaosRecipe AIChef AbsurdCooking CulinaryChaos');
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`;
        break;
      case 'instagram':
        copyToClipboard(`${memeCaption} #${hashtags.replace(/%20/g, ' #')}`);
        alert('Caption copied to clipboard! Open Instagram and paste it with your recipe image.');
        onShare?.(); // Call onShare callback
        return;
      case 'tiktok':
        copyToClipboard(`${memeCaption} #${hashtags.replace(/%20/g, ' #')}`);
        alert('Caption copied to clipboard! Open TikTok and paste it with your recipe video.');
        onShare?.(); // Call onShare callback
        return;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      onShare?.(); // Call onShare callback
    }
  };

  const downloadImage = () => {
    if (shareUrl) {
      const link = document.createElement('a');
      link.href = shareUrl;
      link.download = `memechef-${recipe?.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'recipe'}.png`;
      link.click();
    }
  };

  if (!recipe) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6 animate-bounce">📤</div>
          <h3 className="text-2xl font-bold text-white/80 mb-3">Ready to Share?</h3>
          <p className="text-white/60 text-lg">Create a recipe first to share your culinary chaos with the world!</p>
          
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 opacity-50">
            {[
              { name: 'Twitter', icon: Twitter, color: 'from-blue-500 to-blue-600' },
              { name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
              { name: 'TikTok', icon: Music, color: 'from-gray-800 to-black' },
              { name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' }
            ].map((platform) => (
              <div
                key={platform.name}
                className={`p-4 bg-gradient-to-r ${platform.color} rounded-xl text-white/50 cursor-not-allowed`}
              >
                <platform.icon className="mx-auto mb-2" size={24} />
                <div className="text-sm">{platform.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
          <Share2 className="text-blue-400 animate-pulse" size={36} />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Share Your Chaos
          </span>
          <Camera className="text-green-400 animate-bounce" size={36} />
        </h2>
        <p className="text-xl text-white/80">Spread the culinary madness across the internet!</p>
      </div>

      {/* Recipe Card for Image Generation */}
      <div 
        ref={recipeCardRef}
        className="bg-white rounded-3xl p-8 mb-8 shadow-2xl border border-purple-200 text-black"
        style={{ minHeight: '500px' }}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🧑‍🍳</div>
          <h1 className="text-3xl font-black text-purple-800 mb-2">MemeChef Recipe</h1>
          <h2 className="text-2xl font-bold text-gray-800 leading-tight">{recipe.title}</h2>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 shadow-lg">
          <p className="text-gray-700 italic text-center mb-6 font-medium">{recipe.backstory}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-purple-700 mb-3 text-lg flex items-center">
                <span className="text-2xl mr-2">🥘</span>
                Ingredients:
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.slice(0, 6).map((ing, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <span className="text-purple-500 mr-2 font-bold">•</span>
                    <span className="text-gray-700">{ing}</span>
                  </li>
                ))}
                {recipe.ingredients.length > 6 && (
                  <li className="text-gray-500 italic text-sm">...and {recipe.ingredients.length - 6} more chaotic ingredients!</li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-purple-700 mb-3 text-lg flex items-center">
                <span className="text-2xl mr-2">📋</span>
                Instructions:
              </h3>
              <ol className="space-y-2">
                {recipe.instructions.slice(0, 5).map((step, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <span className="text-purple-500 mr-2 font-bold">{i + 1}.</span>
                    <span className="text-gray-700">
                      {step.length > 60 ? `${step.slice(0, 60)}...` : step}
                    </span>
                  </li>
                ))}
                {recipe.instructions.length > 5 && (
                  <li className="text-gray-500 italic text-sm">...continue the madness with {recipe.instructions.length - 5} more steps!</li>
                )}
              </ol>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-purple-600 font-bold">
            <span>✨</span>
            <span>Created with MemeChef AI</span>
            <span>•</span>
            <span>Where Chaos Meets Cuisine</span>
            <span>✨</span>
          </div>
        </div>
      </div>

      {/* Meme Caption Section */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span className="text-3xl">💬</span>
            <span>Meme Caption</span>
          </h3>
          <button
            onClick={onGenerateCaption}
            className="group relative px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl text-white font-medium overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-2">
              <RefreshCw size={18} />
              <span>Generate New</span>
            </div>
          </button>
        </div>
        
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
          <p className="text-white text-lg italic leading-relaxed">
            &quot;{memeCaption || 'Click generate to create a meme caption that will break the internet!'}&quot;
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => copyToClipboard(memeCaption)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              copiedToClipboard 
                ? 'bg-green-500 text-white' 
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }`}
          >
            <Copy size={16} />
            <span>{copiedToClipboard ? 'Copied!' : 'Copy Caption'}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={generateRecipeCard}
          disabled={isGeneratingImage}
          className={`group relative p-6 rounded-3xl font-bold text-lg transition-all duration-300 ${
            isGeneratingImage
              ? 'bg-gray-600/50 text-gray-400 cursor-wait'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-105 shadow-2xl shadow-purple-500/30'
          }`}
        >
          <div className="flex items-center justify-center space-x-3">
            {isGeneratingImage ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>Creating Magic...</span>
              </>
            ) : (
              <>
                <Camera size={24} />
                <span>Generate Recipe Card</span>
              </>
            )}
          </div>
        </button>

        {shareUrl && (
          <button
            onClick={downloadImage}
            className="group relative p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-3xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl shadow-green-500/30"
          >
            <div className="flex items-center justify-center space-x-3">
              <Download size={24} />
              <span>Download Image</span>
            </div>
          </button>
        )}
      </div>

      {/* Social Media Buttons */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-center text-white mb-6">Share on Social Media</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              name: 'Twitter', 
              platform: 'twitter',
              icon: Twitter, 
              color: 'from-blue-500 to-blue-600',
              hoverColor: 'hover:from-blue-600 hover:to-blue-700'
            },
            { 
              name: 'Instagram', 
              platform: 'instagram',
              icon: Instagram, 
              color: 'from-purple-500 to-pink-500',
              hoverColor: 'hover:from-purple-600 hover:to-pink-600'
            },
            { 
              name: 'TikTok', 
              platform: 'tiktok',
              icon: Music, 
              color: 'from-gray-800 to-black',
              hoverColor: 'hover:from-gray-900 hover:to-gray-800'
            },
            { 
              name: 'Facebook', 
              platform: 'facebook',
              icon: Facebook, 
              color: 'from-blue-600 to-blue-700',
              hoverColor: 'hover:from-blue-700 hover:to-blue-800'
            }
          ].map((social) => (
            <button
              key={social.name}
              onClick={() => shareToSocial(social.platform)}
              className={`group relative p-6 bg-gradient-to-r ${social.color} ${social.hoverColor} rounded-2xl text-white transition-all duration-300 hover:scale-105 shadow-xl overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center space-y-3">
                <social.icon size={32} />
                <span className="font-medium text-lg">{social.name}</span>
              </div>
              
              {/* Platform specific indicators */}
              {social.platform === 'instagram' || social.platform === 'tiktok' ? (
                <div className="absolute top-2 right-2 text-xs bg-white/20 rounded-full px-2 py-1">
                  Copy
                </div>
              ) : (
                <div className="absolute top-2 right-2 text-xs bg-white/20 rounded-full px-2 py-1">
                  Share
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Additional sharing options */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => copyToClipboard(`Check out this insane recipe I made with MemeChef: "${recipe.title}" - ${memeCaption}`)}
            className="flex items-center justify-center space-x-3 p-4 backdrop-blur-sm bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
          >
            <Copy size={20} />
            <span>Copy Shareable Link</span>
          </button>
          
          <button
            onClick={() => {
              const subject = encodeURIComponent(`You HAVE to see this crazy recipe: ${recipe.title}`);
              const body = encodeURIComponent(`I just created the most ridiculous recipe using MemeChef AI:\n\n"${recipe.title}"\n\n${memeCaption}\n\nCheck it out and create your own chaos at: ${window.location.href}`);
              window.open(`mailto:?subject=${subject}&body=${body}`);
            }}
            className="flex items-center justify-center space-x-3 p-4 backdrop-blur-sm bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
          >
            <span>📧</span>
            <span>Share via Email</span>
          </button>
        </div>
      </div>

      {/* Sharing tips */}
      <div className="mt-8 backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center space-x-2">
          <span>💡</span>
          <span>Pro Sharing Tips</span>
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-yellow-400 text-lg mb-2">📸</div>
            <div className="text-white/80 font-medium mb-1">Perfect for Instagram</div>
            <div className="text-white/60">Generate the recipe card image for stunning visual posts</div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-purple-400 text-lg mb-2">🎬</div>
            <div className="text-white/80 font-medium mb-1">TikTok Ready</div>
            <div className="text-white/60">Copy the caption and create your cooking chaos video</div>
          </div>
          
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-green-400 text-lg mb-2">🐦</div>
            <div className="text-white/80 font-medium mb-1">Twitter Viral</div>
            <div className="text-white/60">Share the absurdity with hashtags for maximum reach</div>
          </div>
        </div>
      </div>
    </div>
  );
}