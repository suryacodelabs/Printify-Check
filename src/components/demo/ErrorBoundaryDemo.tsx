
import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/utility/ErrorBoundary';
import { FormErrorBoundary } from '@/components/utility/FormErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAsyncErrorHandler } from '@/hooks/useAsyncErrorHandler';

// Component that will throw an error
const BuggyCounter: React.FC = () => {
  const [counter, setCounter] = useState(0);
  
  const handleClick = () => {
    // Once counter reaches 3, this will throw an error
    if (counter === 3) {
      throw new Error("Simulated error: Counter reached 3!");
    }
    setCounter(counter + 1);
  };
  
  return (
    <div className="p-4 border rounded">
      <p className="mb-2">Counter: {counter}</p>
      <Button onClick={handleClick}>Increment</Button>
      <p className="text-sm text-muted-foreground mt-2">
        (Will throw error at count 3)
      </p>
    </div>
  );
};

// Component with async operation that will fail
const AsyncErrorDemo: React.FC = () => {
  const { wrapAsync } = useAsyncErrorHandler();
  const [loading, setLoading] = useState(false);
  
  // Simulated API call that will fail
  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Throw an error
    throw new Error("Simulated API error");
  };
  
  const handleClick = async () => {
    try {
      await wrapAsync(fetchData, 'network', 'Data fetching');
    } catch (err) {
      // Error already logged and displayed by wrapAsync
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded">
      <p className="mb-2">Test async error handling</p>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Data (Will Fail)'}
      </Button>
    </div>
  );
};

// Demo component showing how to use error boundaries
const ErrorBoundaryDemo: React.FC = () => {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Error Boundary Demo</h1>
      <p className="text-muted-foreground mb-6">
        This page demonstrates how error boundaries catch and handle errors in React components.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Error Boundary</CardTitle>
            <CardDescription>
              Demonstrates a component that throws an error being caught by an error boundary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              <BuggyCounter />
            </ErrorBoundary>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Form Error Boundary</CardTitle>
            <CardDescription>
              Shows how a form-specific error boundary handles errors in a form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormErrorBoundary formName="Demo Form">
              <BuggyCounter />
            </FormErrorBoundary>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Async Error Handling</CardTitle>
            <CardDescription>
              Demonstrates handling errors in asynchronous operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AsyncErrorDemo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorBoundaryDemo;
