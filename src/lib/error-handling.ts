/**
 * Error handling utilities for the application
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends ApiError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'AuthError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Parse Supabase error and return a user-friendly message
 */
export function parseSupabaseError(error: unknown): {
  message: string;
  code?: string;
  isDeveloper?: boolean;
} {
  if (!error) {
    return { message: 'An unknown error occurred' };
  }

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('failed to fetch')) {
      return {
        message: 'Network connection failed. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }

    // Authentication errors
    if (errorMessage.includes('invalid') || errorMessage.includes('unauthorized')) {
      return {
        message: 'Authentication failed. Please log in again.',
        code: 'AUTH_ERROR',
      };
    }

    // Database errors
    if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
      return {
        message: 'This item already exists. Please use a different value.',
        code: 'DUPLICATE_ERROR',
      };
    }

    if (errorMessage.includes('not found')) {
      return {
        message: 'The requested item was not found.',
        code: 'NOT_FOUND',
      };
    }

    // Rate limiting
    if (errorMessage.includes('rate') || errorMessage.includes('too many')) {
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
      };
    }

    // Permission errors
    if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
      return {
        message: 'You do not have permission to perform this action.',
        code: 'PERMISSION_ERROR',
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
      isDeveloper: true,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if (err.message && typeof err.message === 'string') {
      return parseSupabaseError(new Error(err.message));
    }

    if (err.code && typeof err.code === 'string') {
      return {
        message: `Error: ${err.code}`,
        code: err.code,
      };
    }
  }

  return { message: 'An unexpected error occurred' };
}

/**
 * Safely handle async operations with error catching
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  fallbackValue?: T
): Promise<[T | undefined, ApiError | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const apiError = error instanceof ApiError
      ? error
      : new ApiError('An unexpected error occurred', undefined, undefined, error);
    return [fallbackValue, apiError];
  }
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: unknown): string {
  const { message } = parseSupabaseError(error);
  return message;
}
