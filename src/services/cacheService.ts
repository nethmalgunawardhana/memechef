'use client';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_EXPIRE_TIME = 30 * 60 * 1000; // 30 minutes

  // Generate cache key from ingredients
  private generateKey(ingredients: string[], type: 'recipe' | 'narration' | 'caption' | 'rating'): string {
    const sortedIngredients = ingredients.sort().join(',').toLowerCase();
    return `${type}_${btoa(sortedIngredients).slice(0, 20)}`;
  }

  // Set cache with expiration
  set<T>(key: string, data: T, expiresIn: number = this.DEFAULT_EXPIRE_TIME): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`memechef_cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        expiresIn
      }));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  // Get from cache
  get<T>(key: string): T | null {
    // First check memory cache
    let item = this.cache.get(key);
    
    // If not in memory, check localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`memechef_cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          // Restore to memory cache
          if (item) this.cache.set(key, item);
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    if (!item) return null;

    // Check if expired
    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  // Delete cache entry
  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`memechef_cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  // Cache recipe
  cacheRecipe(ingredients: string[], recipe: any): void {
    const key = this.generateKey(ingredients, 'recipe');
    this.set(key, recipe, 60 * 60 * 1000); // 1 hour for recipes
  }

  // Get cached recipe
  getCachedRecipe(ingredients: string[]): any | null {
    const key = this.generateKey(ingredients, 'recipe');
    return this.get(key);
  }

  // Cache narration
  cacheNarration(ingredients: string[], narration: string): void {
    const key = this.generateKey(ingredients, 'narration');
    this.set(key, narration, 45 * 60 * 1000); // 45 minutes
  }

  // Get cached narration
  getCachedNarration(ingredients: string[]): string | null {
    const key = this.generateKey(ingredients, 'narration');
    return this.get(key);
  }

  // Cache TTS audio URL
  cacheTTSAudio(text: string, audioUrl: string): void {
    const textHash = btoa(text.slice(0, 50)).slice(0, 20);
    this.set(`tts_${textHash}`, audioUrl, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Get cached TTS audio
  getCachedTTSAudio(text: string): string | null {
    const textHash = btoa(text.slice(0, 50)).slice(0, 20);
    return this.get(`tts_${textHash}`);
  }

  // Clear old cache entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.expiresIn) {
        this.delete(key);
      }
    }
  }

  // Get cache stats
  getCacheStats(): { totalEntries: number, memoryEntries: number } {
    return {
      totalEntries: Object.keys(localStorage).filter(k => k.startsWith('memechef_cache_')).length,
      memoryEntries: this.cache.size
    };
  }
}

export const cacheService = new CacheService();
