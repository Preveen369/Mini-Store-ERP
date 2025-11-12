// Simple in-memory cache for dashboard data
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number }>;
  private ttl: number; // Time to live in milliseconds

  constructor(ttlSeconds: number = 60) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create cache instances for different data types
// Dashboard data is cached for 30 seconds
export const dashboardCache = new SimpleCache(30);

// Clean up expired entries every minute
setInterval(() => {
  dashboardCache.cleanup();
}, 60000);

export default SimpleCache;
