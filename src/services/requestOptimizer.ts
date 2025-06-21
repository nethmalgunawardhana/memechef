'use client';

// Request optimization utilities
export class RequestOptimizer {
  private pendingRequests = new Map<string, Promise<any>>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  // Prevent duplicate requests
  async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      console.log(`Deduplicating request for key: ${key}`);
      return this.pendingRequests.get(key);
    }

    const request = requestFn();
    this.pendingRequests.set(key, request);

    try {
      const result = await request;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // Debounce requests (useful for real-time features)
  debounceRequest<T>(key: string, requestFn: () => Promise<T>, delay: number = 500): Promise<T> {
    return new Promise((resolve, reject) => {
      // Clear existing timer
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
      }

      // Set new timer
      const timer = setTimeout(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
        }
      }, delay);

      this.debounceTimers.set(key, timer);
    });
  }

  // Batch multiple requests together
  async batchRequests<T>(requests: Array<() => Promise<T>>, batchSize: number = 3): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(req => req()));
      results.push(...batchResults);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}

export const requestOptimizer = new RequestOptimizer();
