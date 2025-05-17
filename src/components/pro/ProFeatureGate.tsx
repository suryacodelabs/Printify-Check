
import React from 'react';
import { useProAccess } from '@/hooks/useProAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from 'lucide-react';

interface ProFeatureGateProps {
  featureName: string;
  children: React.ReactNode;
}

export const ProFeatureGate: React.FC<ProFeatureGateProps> = ({ 
  featureName, 
  children 
}) => {
  const { isPro } = useProAccess();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          Pro Feature: {featureName}
        </CardTitle>
        <CardDescription>
          Unlock {featureName} and other premium features with a Pro subscription.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This feature requires a Pro subscription to access.
          </p>
          <Button>Upgrade to Pro</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProFeatureGate;
