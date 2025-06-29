'use client';

import { useState, useEffect } from 'react';
import { History, Star, Trash2, Download, Share2, Clock, ChefHat, Zap, Filter, Search } from 'lucide-react';
import { Recipe } from '@/services/geminiService';

interface RecipeHistoryEntry {
  id: string;
  recipe: Recipe;
  timestamp: Date;
  chaosLevel: number;
  rating?: number;
  favorite?: boolean;
  tags: string[];
}

interface RecipeHistoryProps {
  currentRecipe?: Recipe | null;
  onLoadRecipe: (recipe: Recipe) => void;
  onShareRecipe: (recipe: Recipe) => void;
}

export default function RecipeHistory({ 
  currentRecipe, 
  onLoadRecipe, 
  onShareRecipe 
}: RecipeHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<RecipeHistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'recent' | 'high-rated'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'chaos'>('newest');

  // Save current recipe to history
  useEffect(() => {
    if (!currentRecipe) return;

    const newEntry: RecipeHistoryEntry = {
      id: `recipe-${Date.now()}`,
      recipe: currentRecipe,
      timestamp: new Date(),
      chaosLevel: Math.floor(Math.random() * 10) + 1, // This should come from actual chaos count
      tags: generateTags(currentRecipe),
    };

    const savedHistory = localStorage.getItem('memechef-recipe-history');
    const existingHistory: RecipeHistoryEntry[] = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Check if this recipe already exists (prevent duplicates)
    const isDuplicate = existingHistory.some(entry => 
      entry.recipe.title === currentRecipe.title
    );
    
    if (!isDuplicate) {
      const updatedHistory = [newEntry, ...existingHistory].slice(0, 50); // Keep last 50 recipes
      setHistory(updatedHistory);
      localStorage.setItem('memechef-recipe-history', JSON.stringify(updatedHistory));
    }
  }, [currentRecipe]);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('memechef-recipe-history');
    if (savedHistory) {
      const parsedHistory: RecipeHistoryEntry[] = JSON.parse(savedHistory);
      // Convert timestamp strings back to Date objects
      const historyWithDates = parsedHistory.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setHistory(historyWithDates);
    }
  }, []);

  const generateTags = (recipe: Recipe): string[] => {
    const tags: string[] = [];
    
    // Extract ingredients as tags
    const ingredients = recipe.ingredients.map(ing => 
      ing.toLowerCase().split(' ')[0]
    ).slice(0, 3);
    tags.push(...ingredients);
    
    // Add difficulty tag
    if (recipe.instructions.length > 10) tags.push('complex');
    else if (recipe.instructions.length < 5) tags.push('simple');
    else tags.push('moderate');
    
    // Add cuisine style tags based on ingredients
    if (recipe.ingredients.some(ing => ing.toLowerCase().includes('cheese'))) tags.push('cheesy');
    if (recipe.ingredients.some(ing => ing.toLowerCase().includes('spic'))) tags.push('spicy');
    if (recipe.ingredients.some(ing => ing.toLowerCase().includes('sweet'))) tags.push('sweet');
    
    return tags;
  };

  const toggleFavorite = (id: string) => {
    const updatedHistory = history.map(entry =>
      entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
    );
    setHistory(updatedHistory);
    localStorage.setItem('memechef-recipe-history', JSON.stringify(updatedHistory));
  };

  const rateRecipe = (id: string, rating: number) => {
    const updatedHistory = history.map(entry =>
      entry.id === id ? { ...entry, rating } : entry
    );
    setHistory(updatedHistory);
    localStorage.setItem('memechef-recipe-history', JSON.stringify(updatedHistory));
  };

  const deleteRecipe = (id: string) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('memechef-recipe-history', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('memechef-recipe-history');
  };

  const exportHistory = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'memechef-recipe-history.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter and sort history
  const filteredHistory = history.filter(entry => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        entry.recipe.title.toLowerCase().includes(searchLower) ||
        entry.recipe.ingredients.some(ing => ing.toLowerCase().includes(searchLower)) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Category filter
    switch (filterBy) {
      case 'favorites':
        return entry.favorite === true;
      case 'recent':
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return entry.timestamp > threeDaysAgo;
      case 'high-rated':
        return (entry.rating || 0) >= 4;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.timestamp.getTime() - a.timestamp.getTime();
      case 'oldest':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'chaos':
        return b.chaosLevel - a.chaosLevel;
      default:
        return 0;
    }
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <>
      {/* History Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/40 rounded-2xl p-4 hover:scale-105 transition-all duration-300"
      >
        <div className="flex items-center space-x-2">
          <History className="text-blue-400" size={20} />
          <span className="text-white font-bold text-sm">History</span>
        </div>
        {history.length > 0 && (
          <div className="text-xs text-white/70 text-center mt-1">
            {history.length} recipes
          </div>
        )}
      </button>

      {/* History Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/90 to-cyan-900/90 border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <History className="text-blue-400" size={28} />
                  <span>Recipe History</span>
                  <span className="text-blue-400 text-lg">({history.length})</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                  <input
                    type="text"
                    placeholder="Search recipes, ingredients, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:border-blue-400/60"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-400/60"
                  >
                    <option value="all">All Recipes</option>
                    <option value="favorites">⭐ Favorites</option>
                    <option value="recent">🕒 Recent (3 days)</option>
                    <option value="high-rated">🏆 High Rated (4+)</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white/10 border border-white/20 rounded-xl text-white px-3 py-2 text-sm focus:outline-none focus:border-blue-400/60"
                  >
                    <option value="newest">📅 Newest First</option>
                    <option value="oldest">📅 Oldest First</option>
                    <option value="rating">⭐ By Rating</option>
                    <option value="chaos">🌪️ By Chaos Level</option>
                  </select>

                  <button
                    onClick={exportHistory}
                    className="bg-green-500/20 border border-green-400/40 rounded-xl text-green-400 px-3 py-2 text-sm hover:bg-green-500/30 transition-colors flex items-center space-x-1"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={clearAllHistory}
                    className="bg-red-500/20 border border-red-400/40 rounded-xl text-red-400 px-3 py-2 text-sm hover:bg-red-500/30 transition-colors flex items-center space-x-1"
                  >
                    <Trash2 size={16} />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recipe List */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="text-white/40 mx-auto mb-4" size={48} />
                  <p className="text-white/60 text-lg">
                    {history.length === 0 ? 'No recipes yet!' : 'No recipes match your search.'}
                  </p>
                  <p className="text-white/40 text-sm">
                    {history.length === 0 ? 'Create your first recipe to see it here!' : 'Try different search terms or filters.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">{entry.recipe.title}</h3>
                          <p className="text-white/70 text-sm mb-2 line-clamp-2">
                            {/* Replace with another property or remove if not needed */}
                            {/* {entry.recipe.description || ''} */}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {entry.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-xs text-white/60">
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatTimeAgo(entry.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Zap size={14} />
                              <span>Chaos: {entry.chaosLevel}/10</span>
                            </div>
                            <div>
                              {entry.recipe.ingredients.length} ingredients
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          {/* Rating */}
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => rateRecipe(entry.id, star)}
                                className={`transition-colors ${
                                  (entry.rating || 0) >= star ? 'text-yellow-400' : 'text-white/30'
                                } hover:text-yellow-400`}
                              >
                                <Star size={16} fill={(entry.rating || 0) >= star ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleFavorite(entry.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                entry.favorite
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/40'
                                  : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                              }`}
                            >
                              <Star size={16} fill={entry.favorite ? 'currentColor' : 'none'} />
                            </button>

                            <button
                              onClick={() => onShareRecipe(entry.recipe)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 border border-green-400/40 hover:bg-green-500/30 transition-colors"
                            >
                              <Share2 size={16} />
                            </button>

                            <button
                              onClick={() => {
                                onLoadRecipe(entry.recipe);
                                setIsOpen(false);
                              }}
                              className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/40 hover:bg-blue-500/30 transition-colors text-sm font-medium"
                            >
                              Load
                            </button>

                            <button
                              onClick={() => deleteRecipe(entry.id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-400/40 hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}