import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"
import { useProStore } from "@/store/proStore";
import { useTeamStore } from "@/store/teamStore";
import { useProAccess } from "@/hooks/useProAccess";
import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/contexts/AuthContext";
import { pdfService } from "@/services/apiService";
import UploadStep from './steps/UploadStep';
import ValidationStep from './steps/ValidationStep';
import PreflightStep from './steps/PreflightStep';
import OCRStep from './steps/OCRStep';
import RedactionStep from './steps/RedactionStep';
import FixesStep from './steps/FixesStep';
import { Lock } from 'lucide-react';

const steps = [
  { id: 'upload', title: 'Upload' },
  { id: 'validation', title: 'Validation' },
  { id: 'preflight', title: 'Preflight' },
  { id: 'ocr', title: 'OCR', proOnly: true },
  { id: 'redaction', title: 'Redaction', proOnly: true },
  { id: 'fixes', title: 'Fixes' }
];

interface WizardFormProps {
  isProOrTeam: boolean;
}

const WizardForm: React.FC<WizardFormProps> = ({ isProOrTeam }) => {
  const [currentStep, setCurrentStep] = useState(steps[0].id);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preflightSuccess, setPreflightSuccess] = useState(false);
  const [preflightResults, setPreflightResults] = useState<any[]>([]);
  const { isPro, checkProAccess } = useProAccess();
  const { user } = useAuth();

  const goToStep = (stepId: string) => {
    // Check if the step requires Pro and user doesn't have it
    const step = steps.find(s => s.id === stepId);
    if (step?.proOnly && !isProOrTeam) {
      checkProAccess(step.title); // This will show a toast
      return;
    }
    
    setCurrentStep(stepId);
  };

  const handleFileAccepted = (file: File) => {
    setSelectedFile(file);
    // After file upload, automatically go to validation step
    goToStep('validation');
  };

  const handlePreflightComplete = (results: any[]) => {
    setPreflightSuccess(true);
    setPreflightResults(results);
    
    // After preflight, determine next step based on Pro status
    if (isProOrTeam) {
      goToStep('ocr');
    } else {
      goToStep('fixes');
    }
  };

  // Determine visible steps based on Pro status
  const visibleSteps = isProOrTeam 
    ? steps 
    : steps.filter(step => !step.proOnly);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center">PDF Wizard</h1>
        <p className="text-muted-foreground text-center">
          Follow the steps to process your PDF file.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="steps flex space-x-4">
          {visibleSteps.map((step, index) => (
            <div 
              key={step.id} 
              className={`step flex items-center ${currentStep === step.id ? 'active' : ''} cursor-pointer`}
              onClick={() => selectedFile && goToStep(step.id)}
            >
              <span className="step-number flex items-center justify-center w-8 h-8 rounded-full bg-muted mr-2">
                {index + 1}
              </span>
              <span className="step-title">
                {step.title}
              </span>
              {step.proOnly && !isProOrTeam && (
                <Lock className="ml-1 h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 'upload' && (
        <UploadStep onFileAccepted={handleFileAccepted} />
      )}

      {currentStep === 'validation' && (
        <ValidationStep
          file={selectedFile}
          onBack={() => goToStep('upload')}
          onComplete={() => goToStep('preflight')}
        />
      )}

      {currentStep === 'preflight' && (
        <PreflightStep
          file={selectedFile}
          onPreflightComplete={handlePreflightComplete}
          isProOrTeam={isProOrTeam}
        />
      )}

      {currentStep === 'ocr' && (
        <OCRStep
          file={selectedFile}
          isProOrTeam={isProOrTeam}
          onBack={() => goToStep('preflight')}
          onOCRComplete={() => goToStep('redaction')}
          onComplete={() => goToStep('redaction')}
        />
      )}

      {currentStep === 'redaction' && (
        <RedactionStep
          file={selectedFile}
          isProOrTeam={isProOrTeam}
          userId={user?.id}
          onBack={() => goToStep('ocr')}
          onRedactionComplete={() => goToStep('fixes')}
        />
      )}

      {currentStep === 'fixes' && (
        <FixesStep
          file={selectedFile}
          preflightSuccess={preflightSuccess}
          preflightResults={preflightResults}
          isProOrTeam={isProOrTeam}
          onComplete={() => { }}
        />
      )}
      
      {!isProOrTeam && (
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
          <p className="text-muted-foreground mb-4">
            Get access to OCR, Redaction, and advanced PDF features
          </p>
          <Button variant="default">
            Upgrade Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default WizardForm;
