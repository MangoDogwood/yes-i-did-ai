import { analytics } from './analytics';

interface ErrorContext {
  userId?: string;
  route?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

export class ErrorMonitoring {
  private static instance: ErrorMonitoring;
  private errors: Array<{ error: Error; context: ErrorContext }> = [];

  private constructor() {
    this.setupGlobalHandlers();
  }

  static getInstance(): ErrorMonitoring {
    if (!ErrorMonitoring.instance) {
      ErrorMonitoring.instance = new ErrorMonitoring();
    }
    return ErrorMonitoring.instance;
  }

  private setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        action: 'global_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        action: 'unhandled_promise_rejection',
      });
    });
  }

  captureError(error: Error, context: ErrorContext = {}) {
    this.errors.push({ error, context });

    analytics.track('error_captured', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', {
        error,
        context,
      });
    }
  }

  getRecentErrors(limit: number = 10) {
    return this.errors.slice(-limit);
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorMonitoring = ErrorMonitoring.getInstance();