import { analytics } from './analytics';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

interface ErrorHandlerOptions {
  silent?: boolean;
  retry?: boolean;
  fallback?: any;
}

export class ErrorHandler {
  static async handle<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      return this.processError(error, options);
    }
  }

  private static processError(error: unknown, options: ErrorHandlerOptions) {
    const appError = this.normalizeError(error);

    if (!options.silent) {
      this.logError(appError);
    }

    if (options.retry && this.isRetryable(appError)) {
      return this.retryOperation(() => {
        throw appError;
      }, options);
    }

    if (options.fallback !== undefined) {
      return options.fallback;
    }

    throw appError;
  }

  private static normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        { originalError: error }
      );
    }

    return new AppError(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      500,
      { originalError: error }
    );
  }

  private static async retryOperation<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= 3) {
        throw error;
      }

      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );

      return this.retryOperation(operation, options, attempt + 1);
    }
  }

  private static isRetryable(error: AppError): boolean {
    const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT'];
    return retryableCodes.includes(error.code);
  }

  private static logError(error: AppError) {
    console.error('Application error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    });

    analytics.track('error_occurred', {
      errorCode: error.code,
      errorMessage: error.message,
      errorStatus: error.status,
      timestamp: new Date().toISOString(),
    });
  }
}

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorHandlerOptions = {}
) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return ErrorHandler.handle(() => fn(...args), options);
  };
}