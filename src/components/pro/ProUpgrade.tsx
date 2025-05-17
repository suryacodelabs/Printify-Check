
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PRO_FEATURES } from '@/config/proFeatures';
import { Check, Crown } from 'lucide-react';

export const ProUpgrade: React.FC = () => {
  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center space-x-2">
          <Crown className="h-5 w-5 text-primary" />
          <CardTitle>Upgrade to Pro</CardTitle>
        </div>
        <CardDescription>
          Unlock advanced PDF processing features
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-2">
          {Object.entries(PRO_FEATURES).map(([key, feature]) => (
            <li key={key} className="flex items-start">
              <div className="mr-2 mt-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{feature.name}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button className="w-full" size="lg">
          Upgrade Now
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Starting at $9.99/month. Cancel anytime.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProUpgrade;
