interface CacheItem {
    data: string;
    timestamp: number;
  }
  
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  export function getCachedData(key: string): string | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
  
    const { data, timestamp }: CacheItem = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
  
    return data;
  }
  
  export function setCachedData(key: string, data: string): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(item));
  }