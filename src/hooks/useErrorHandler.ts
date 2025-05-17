
import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

type ErrorType = 'validation' | 'processing' | 'system' | 'network' | 'unknown';

interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string;
  timestamp: Date;
  data?: any;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const { toast } = useToast();

  const logError = useCallback((error: any, type: ErrorType = 'unknown', context?: string) => {
    // Create a structured error object
    const errorDetails: ErrorDetails = {
      type,
      message: error?.message || 'An unknown error occurred',
      code: error?.code,
      timestamp: new Date(),
      data: error?.data
    };

    // Log to console for debugging
    console.error(`Error [${type}]${context ? ` in ${context}` : ''}:`, error);
    
    // Add to local error state
    setErrors(prev => [...prev, errorDetails]);
    
    // Display user-friendly toast
    toast({
      title: getErrorTitle(type),
      description: errorDetails.message,
      variant: "destructive",
    });

    return errorDetails;
  }, [toast]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrorTitle = (type: ErrorType): string => {
    switch (type) {
      case 'validation':
        return 'Validation Error';
      case 'processing':
        return 'Processing Failed';
      case 'system':
        return 'System Error';
      case 'network':
        return 'Network Error';
      case 'unknown':
      default:
        return 'Error';
    }
  };

  return {
    errors,
    logError,
    clearErrors
  };
};
