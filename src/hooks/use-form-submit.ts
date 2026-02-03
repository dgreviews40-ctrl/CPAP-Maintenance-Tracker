import { useState, useCallback } from 'react';
import { formatErrorMessage } from '@/lib/error-handling';

/**
 * Hook for handling form submission with error handling
 */
export function useFormSubmit<T,>(
  submitFn: () => Promise<T>,
  onSuccess?: (data: T) => void | Promise<void>,
  onError?: (error: unknown) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    try {
      setError(null);
      setSuccess(false);
      setIsSubmitting(true);

      const result = await submitFn();

      setSuccess(true);
      setError(null);

      if (onSuccess) {
        await onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMsg = formatErrorMessage(err);
      setError(errorMsg);
      setSuccess(false);

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, onSuccess, onError]);

  return {
    handleSubmit,
    isSubmitting,
    error,
    success,
    reset: () => {
      setError(null);
      setSuccess(false);
    },
    setError,
  };
}
