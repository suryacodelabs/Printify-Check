
import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiresSubscription?: 'pro' | 'basic' | boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresSubscription = false 
}) => {
  const { user, isLoading, subscriptionTier } = useAuth();
  const location = useLocation();

  // Show a toast if the user is redirected due to insufficient permissions
  useEffect(() => {
    if (!isLoading && !user && location.pathname !== '/auth') {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page.",
        variant: "default",
      });
    } else if (!isLoading && user && requiresSubscription && typeof requiresSubscription === 'string') {
      const tierLevels = {
        'free': 0,
        'basic': 1,
        'pro': 2,
        'enterprise': 3
      };
      
      const requiredLevel = tierLevels[requiresSubscription];
      const userLevel = tierLevels[subscriptionTier];
      
      if (userLevel < requiredLevel) {
        toast({
          title: "Subscription Required",
          description: `This feature requires a ${requiresSubscription.charAt(0).toUpperCase() + requiresSubscription.slice(1)} subscription or higher.`,
          variant: "default",
        });
      }
    }
  }, [isLoading, user, location.pathname, requiresSubscription, subscriptionTier]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // If not logged in, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check subscription requirements if specified
  if (requiresSubscription) {
    // If requiresSubscription is a string, check if user has that tier or higher
    if (typeof requiresSubscription === 'string') {
      const tierLevels = {
        'free': 0,
        'basic': 1,
        'pro': 2,
        'enterprise': 3
      };
      
      const requiredLevel = tierLevels[requiresSubscription];
      const userLevel = tierLevels[subscriptionTier];
      
      if (userLevel < requiredLevel) {
        // Redirect to upgrade page
        return <Navigate to="/pricing" state={{ from: location }} replace />;
      }
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
