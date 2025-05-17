
import React, { useCallback } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from '@/hooks/use-toast';

type AsyncFunction<T, Args extends any[]> = (...args: Args) => Promise<T>;

export function useAsyncErrorHandler() {
  const { logError } = useErrorHandler();

  /**
   * Wraps an async function to catch errors
   */
  const wrapAsync = useCallback(<T, Args extends any[]>(
    asyncFn: AsyncFunction<T, Args>,
    errorType: 'validation' | 'processing' | 'system' | 'network' | 'unknown' = 'unknown',
    context?: string,
    showToast: boolean = true
  ) => {
    return async (...args: Args): Promise<T | undefined> => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        const errorDetails = logError(error, errorType, context);
        
        if (showToast) {
          toast({
            title: `${context || 'Operation'} failed`,
            description: errorDetails.message,
            variant: "destructive",
          });
        }
        
        // Re-throw the error for the caller to handle if needed
        // but with our structured error data
        throw errorDetails;
      }
    };
  }, [logError]);

  /**
   * Creates a safe event handler that won't crash the UI on errors
   */
  const createSafeEventHandler = useCallback(<T extends (...args: any[]) => any>(
    handler: T,
    errorType: 'validation' | 'processing' | 'system' | 'network' | 'unknown' = 'unknown',
    context?: string
  ) => {
    return ((...args: Parameters<T>): ReturnType<T> | undefined => {
      try {
        return handler(...args);
      } catch (error) {
        logError(error, errorType, context);
        return undefined;
      }
    }) as T;
  }, [logError]);

  return {
    wrapAsync,
    createSafeEventHandler
  };
}
