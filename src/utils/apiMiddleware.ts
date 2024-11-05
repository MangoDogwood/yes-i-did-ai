import { analytics } from './analytics';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export class ApiMiddleware {
  private static requestQueue: Promise<unknown>[] = [];
  private static MAX_CONCURRENT_REQUESTS = 3;

  static async enqueue<T>(
    requestFn: () => Promise<T>,
    options: {
      retryCount?: number;
      timeout?: number;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<T> {
    const { retryCount = 3, timeout = 30000, priority = 'normal' } = options;

    while (ApiMiddleware.requestQueue.length >= ApiMiddleware.MAX_CONCURRENT_REQUESTS) {
      await Promise.race(ApiMiddleware.requestQueue);
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    const request = async (): Promise<T> => {
      try {
        const requestPromise = requestFn();
        ApiMiddleware.requestQueue.push(requestPromise);

        const response = await Promise.race([requestPromise, timeoutPromise]);
        
        ApiMiddleware.requestQueue = ApiMiddleware.requestQueue.filter(p => p !== requestPromise);
        
        // Type assertion here is safe because requestFn returns Promise<T>
        return response as T;
      } catch (error) {
        const apiError = error as ApiError;
        
        if (retryCount > 0) {
          // Log retry attempt
          analytics.track('api_retry', {
            error: apiError.message,
            remainingRetries: retryCount - 1,
            status: apiError.status,
            code: apiError.code
          });

          // Exponential backoff
          await new Promise<void>(resolve => 
            setTimeout(resolve, Math.pow(2, 4 - retryCount) * 1000)
          );

          return ApiMiddleware.enqueue(requestFn, {
            ...options,
            retryCount: retryCount - 1
          });
        }

        throw apiError;
      }
    };

    return request();
  }

  static handleError(error: unknown): never {
    let apiError: ApiError;
    
    if (error instanceof Error) {
      apiError = error as ApiError;
    } else {
      apiError = new Error('An unexpected error occurred') as ApiError;
      apiError.status = 500;
      apiError.code = 'UNKNOWN_ERROR';
    }

    analytics.track('api_error', {
      message: apiError.message,
      status: apiError.status,
      code: apiError.code
    });

    throw apiError;
  }
}

// Example usage type
interface ApiResponse<T> {
  data: T;
  status: number;
}

// Usage example:
/*
const fetchData = async <T>(): Promise<ApiResponse<T>> => {
  return ApiMiddleware.enqueue(
    () => fetch('/api/data').then(res => res.json()),
    { retryCount: 3 }
  );
};
*/