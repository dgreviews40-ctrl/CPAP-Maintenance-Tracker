import { useCallback, useState } from 'react';
import { useToast } from './use-toast';
import { formatErrorMessage } from '@/lib/error-handling';

interface UseAsyncOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  showNotification?: boolean;
}

/**
 * Hook for handling async operations with automatic error handling and notifications
 */
export function useAsync<T,>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { onSuccess, onError, showNotification = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMsg = formatErrorMessage(err);
      setError(errorMsg);
      onError?.(err);
      
      if (showNotification) {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError, showNotification, toast]);

  return {
    execute,
    loading,
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
      setLoading(false);
    },
  };
}
