
import React from 'react';
import { SimpleErrorBoundary as ErrorBoundary, useErrorBoundary } from '@/components/utility/ErrorBoundary';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  formName: string;
  resetForm?: () => void;
}

const FormFallback: React.FC<{ 
  formName: string; 
  error: Error | null; 
  resetErrorBoundary: () => void;
  resetForm?: () => void;
}> = ({ 
  formName, 
  error, 
  resetErrorBoundary,
  resetForm 
}) => {
  const handleReset = () => {
    resetErrorBoundary();
    if (resetForm) {
      resetForm();
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader className="bg-destructive/5">
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Form Error
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          We encountered an error while rendering the {formName}. 
          This may be due to invalid input data or a temporary system issue.
        </p>
        
        {error && (
          <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
            {error.message}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/50 flex justify-end">
        <Button 
          onClick={handleReset} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Form
        </Button>
      </CardFooter>
    </Card>
  );
};

export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({
  children,
  formName,
  resetForm
}) => {
  const { key, reset } = useErrorBoundary();
  
  const resetAll = () => {
    reset();
    if (resetForm) {
      resetForm();
    }
  };
  
  return (
    <ErrorBoundary
      key={key}
      resetKeys={[key]}
      fallback={
        <FormFallback
          formName={formName}
          error={null}
          resetErrorBoundary={resetAll}
          resetForm={resetForm}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
};
