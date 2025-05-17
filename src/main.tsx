
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/sonner"
import { BrowserRouter } from 'react-router-dom'
import { toast } from '@/components/ui/sonner'

// Global error handlers
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  
  // Show toast notification for unhandled promise rejections
  toast.error('An unexpected error occurred', {
    description: 'The application encountered an error. Please try again or refresh the page.',
  });
  
  // Prevent the default browser handling
  event.preventDefault();
};

const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error:', event.error || event.message);
  
  // Only show toast if not already handled by an error boundary
  if (!event.error?.isHandledByErrorBoundary) {
    toast.error('An unexpected error occurred', {
      description: 'The application encountered an error. Please try again or refresh the page.',
    });
  }
  
  // Prevent the default browser error handling
  event.preventDefault();
};

// Register the global error handlers
window.addEventListener('unhandledrejection', handleUnhandledRejection);
window.addEventListener('error', handleGlobalError);

// Create root and render app
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" richColors closeButton />
  </BrowserRouter>
);

// Log that the app has started successfully
console.log('Application initialized successfully');
