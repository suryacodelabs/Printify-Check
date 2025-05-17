
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// This component needs to be a class component because error boundaries must use
// lifecycle methods that aren't available in function components
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // If resetKeys changed, reset the error boundary
    if (this.state.hasError && this.props.resetKeys) {
      const didResetKeysChange = prevProps.resetKeys?.some(
        (key, i) => key !== this.props.resetKeys?.[i]
      );
      
      if (didResetKeysChange) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise render default fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={this.resetErrorBoundary} 
        />
      );
    }

    return this.props.children;
  }
}

// Props for the error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

// A function component for the default fallback UI
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="w-full flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="ml-2">Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              We encountered an error while rendering this component.
            </p>
            {error && (
              <div className="mt-2 p-2 bg-destructive/10 rounded text-sm font-mono overflow-auto max-h-32">
                {error.message}
              </div>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-center">
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simple error boundary wrapper that doesn't use hooks
export const SimpleErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

// Higher-order component to wrap the class component with React hooks context
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  // We'll modify this to avoid using hooks directly in the component render phase
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log the error to console directly for now
    console.error('Error caught by error boundary:', error, errorInfo);
    
    // Also call the onError callback if provided
    if (props.onError) {
      props.onError(error, errorInfo);
    }
  };
  
  return <ErrorBoundaryClass {...props} onError={handleError} />;
};

// Custom hook to create an error boundary
export const useErrorBoundary = () => {
  const [key, setKey] = React.useState(0);
  
  const reset = React.useCallback(() => {
    setKey((prevKey) => prevKey + 1);
  }, []);
  
  return { key, reset };
};
