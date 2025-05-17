
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useProStore } from '@/store/proStore';

export const ProSettings: React.FC = () => {
  const { isPro, setIsPro } = useProStore();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = () => {
    setIsToggling(true);
    // Simulate API call with a small delay
    setTimeout(() => {
      setIsPro(!isPro);
      setIsToggling(false);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pro Mode Settings</CardTitle>
        <CardDescription>
          Manage your Pro feature settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Pro Mode</p>
            <p className="text-sm text-muted-foreground">
              {isPro ? 'Pro features are currently enabled' : 'Enable Pro features'}
            </p>
          </div>
          <Switch
            checked={isPro}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Pro Features</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isPro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              OCR Technology
            </li>
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isPro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              Document Redaction
            </li>
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isPro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              Advanced PDF Fixes
            </li>
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${isPro ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              Compliance Validation
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProSettings;
