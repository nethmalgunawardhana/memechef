import { Clock, Users, ChefHat, Flame, Star, Sparkles } from 'lucide-react';

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
    return (
      <div className="text-center p-12 backdrop-blur-sm bg-white/5 border border-white/10 rounded-3xl">
        <div className="text-6xl mb-4 animate-bounce">🍽️</div>
        <h3 className="text-2xl font-bold text-white/70 mb-2">No Recipe Generated Yet</h3>
        <p className="text-white/50">Submit some chaotic ingredients to begin the madness!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Recipe Header */}
      <div className="text-center mb-10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <ChefHat className="text-orange-400" size={32} />
            <Sparkles className="text-yellow-400 animate-pulse" size={24} />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-4 leading-tight">
            {recipe.title}
          </h2>
          
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-purple-200 italic text-lg leading-relaxed font-medium">
              {recipe.backstory}
            </p>
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: 'Prep Time', value: '∞ minutes', color: 'blue' },
              { icon: Users, label: 'Serves', value: 'Brave souls', color: 'green' },
              { icon: Flame, label: 'Difficulty', value: 'Impossible', color: 'red' },
              { icon: Star, label: 'Chaos Level', value: 'Maximum', color: 'yellow' }
            ].map((stat, index) => (
              <div key={index} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <stat.icon className={`mx-auto mb-2 text-${stat.color}-400`} size={20} />
                <div className="text-white/80 text-xs font-medium mb-1">{stat.label}</div>
                <div className="text-white font-bold text-sm">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recipe Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Ingredients Section */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-purple-400/30 rounded-3xl p-8 hover:scale-105 transition-all duration-500 shadow-2xl shadow-purple-500/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-4xl">🥘</div>
            <div>
              <h3 className="text-2xl font-bold text-yellow-300">Chaotic Ingredients</h3>
              <p className="text-white/60 text-sm">Gather these if you dare...</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {recipe.ingredients.map((ingredient, i) => (
              <div 
                key={i} 
                className="group flex items-start space-x-3 p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <span className="text-white/95 font-medium group-hover:text-white transition-colors">
                    {ingredient}
                  </span>
                </div>
                <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ✨
                </div>
              </div>
            ))}
          </div>

          {/* Ingredient count */}
          <div className="mt-6 text-center">
            <div className="inline-block backdrop-blur-sm bg-purple-500/20 border border-purple-400/40 rounded-xl px-4 py-2">
              <span className="text-purple-300 text-sm font-medium">
                {recipe.ingredients.length} ingredients of pure chaos
              </span>
            </div>
          </div>
        </div>
        
        {/* Instructions Section */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-400/30 rounded-3xl p-8 hover:scale-105 transition-all duration-500 shadow-2xl shadow-green-500/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="text-4xl">📋</div>
            <div>
              <h3 className="text-2xl font-bold text-green-300">Madness Instructions</h3>
              <p className="text-white/60 text-sm">Follow at your own risk...</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {recipe.instructions.map((step, i) => (
              <div 
                key={i} 
                className="group flex items-start space-x-4 p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                style={{ animationDelay: `${(i + recipe.ingredients.length) * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <span className="text-white/95 font-medium leading-relaxed group-hover:text-white transition-colors">
                    {step}
                  </span>
                </div>
                <div className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  🔥
                </div>
              </div>
            ))}
          </div>

          {/* Steps count */}
          <div className="mt-6 text-center">
            <div className="inline-block backdrop-blur-sm bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-2">
              <span className="text-green-300 text-sm font-medium">
                {recipe.instructions.length} steps to culinary chaos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Footer */}
      <div className="mt-10">
        <div className="backdrop-blur-xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-400/30 rounded-3xl p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">⚠️</span>
              <h4 className="text-xl font-bold text-orange-300">Chaos Disclaimer</h4>
              <span className="text-3xl">⚠️</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-red-400 text-lg mb-2">🚨</div>
                <div className="text-white/80 font-medium">Side effects may include uncontrollable laughter</div>
              </div>
              
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-yellow-400 text-lg mb-2">⚡</div>
                <div className="text-white/80 font-medium">Reality distortion is a normal side effect</div>
              </div>
              
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-purple-400 text-lg mb-2">🌪️</div>
                <div className="text-white/80 font-medium">Chef Chaos is not responsible for kitchen explosions</div>
              </div>
            </div>
            
            <p className="text-white/60 text-xs italic">
              This recipe has been scientifically proven to defy at least 3 laws of physics and 7 health codes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}