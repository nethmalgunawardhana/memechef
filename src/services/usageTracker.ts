'use client';

interface UsageStats {
  geminiCalls: number;
  elevenLabsCalls: number;
  totalTokensUsed: number;
  cacheSaved: number;
  lastReset: number;
}

class UsageTracker {
  private stats: UsageStats;

  constructor() {
    this.stats = this.loadStats();
  }

  private loadStats(): UsageStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats();
    }

    try {
      const saved = localStorage.getItem('memechef-usage-stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reset daily
        if (Date.now() - parsed.lastReset > 24 * 60 * 60 * 1000) {
          return this.getDefaultStats();
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load usage stats:', error);
    }

    return this.getDefaultStats();
  }

  private getDefaultStats(): UsageStats {
    return {
      geminiCalls: 0,
      elevenLabsCalls: 0,
      totalTokensUsed: 0,
      cacheSaved: 0,
      lastReset: Date.now()
    };
  }

  private saveStats(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('memechef-usage-stats', JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Failed to save usage stats:', error);
    }
  }

  // Track API calls
  trackGeminiCall(tokensUsed: number = 0): void {
    this.stats.geminiCalls++;
    this.stats.totalTokensUsed += tokensUsed;
    this.saveStats();
  }

  trackElevenLabsCall(): void {
    this.stats.elevenLabsCalls++;
    this.saveStats();
  }

  trackCacheSave(): void {
    this.stats.cacheSaved++;
    this.saveStats();
  }

  // Get current usage
  getUsage(): UsageStats {
    return { ...this.stats };
  }

  // Check if approaching limits
  shouldWarnUser(): boolean {
    const { geminiCalls, elevenLabsCalls } = this.stats;
    
    // Warning thresholds (adjust based on your plans)
    const geminiWarningLimit = 50; // per day
    const elevenLabsWarningLimit = 20; // per day
    
    return geminiCalls > geminiWarningLimit || elevenLabsCalls > elevenLabsWarningLimit;
  }

  // Get optimization suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const { geminiCalls, elevenLabsCalls, cacheSaved } = this.stats;

    if (geminiCalls > 30) {
      suggestions.push('Consider using cached recipes more - you\'ve made many recipe requests today');
    }

    if (elevenLabsCalls > 15) {
      suggestions.push('TTS usage is high - try listening to cached narrations');
    }

    if (cacheSaved < 5 && (geminiCalls > 10 || elevenLabsCalls > 5)) {
      suggestions.push('Enable aggressive caching to save on API costs');
    }

    return suggestions;
  }

  // Reset stats (for testing or manual reset)
  resetStats(): void {
    this.stats = this.getDefaultStats();
    this.saveStats();
  }
}

export const usageTracker = new UsageTracker();
