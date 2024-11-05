import { NextApiResponse } from 'next';
import LRU from 'lru-cache';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitConfig {
  max: number;
  ttl: number;
}

interface TokenData {
  count: number;
  timestamp: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRU<string, TokenData>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  } as LRU.Options<string, TokenData>);

  return {
    check: async (res: NextApiResponse, limit: number, token: string): Promise<void> => {
      const now = Date.now();
      const tokenData = tokenCache.get(token) || { count: 0, timestamp: now };
      
      // Reset count if we're in a new interval
      if (now - tokenData.timestamp >= options.interval) {
        tokenData.count = 0;
        tokenData.timestamp = now;
      }
      
      tokenData.count += 1;
      tokenCache.set(token, tokenData);

      const currentUsage = tokenData.count;
      const isRateLimited = currentUsage >= limit;
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', isRateLimited ? 0 : limit - currentUsage);
      res.setHeader('X-RateLimit-Reset', new Date(tokenData.timestamp + options.interval).toISOString());

      if (isRateLimited) {
        throw new Error('Rate limit exceeded');
      }
    },
    
    // Added utility method to get current usage
    getCurrentUsage: (token: string): number => {
      const tokenData = tokenCache.get(token);
      return tokenData?.count || 0;
    },

    // Added utility method to reset usage for a token
    resetUsage: (token: string): void => {
      tokenCache.delete(token);
    }
  };
}

// Example usage:
/*
const limiter = rateLimit({
  interval: 60000, // 1 minute
  uniqueTokenPerInterval: 500
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await limiter.check(res, 10, 'CACHE_TOKEN'); // 10 requests per minute
    // Process the request
  } catch (error) {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
}
*/