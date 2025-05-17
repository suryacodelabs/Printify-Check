
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isOptional?: boolean;
  isProOnly?: boolean;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  isNextDisabled?: boolean;
}

const WizardLayout: React.FC<WizardLayoutProps> = ({
  steps,
  currentStepIndex,
  onNext,
  onPrevious,
  onComplete,
  isNextDisabled = false
}) => {
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index < currentStepIndex 
                      ? "bg-primary text-primary-foreground"
                      : index === currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    step.isOptional && "border border-dashed"
                  )}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:inline-block">
                  {step.title}
                  {step.isOptional && <span className="text-muted-foreground ml-1">(Optional)</span>}
                  {step.isProOnly && <span className="bg-amber-100 text-amber-800 text-xs px-1 rounded ml-1">Pro</span>}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    index < currentStepIndex ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };
  
  const renderCurrentStep = () => {
    return (
      <div className="min-h-[300px]">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{currentStep.title}</h2>
          <p className="text-muted-foreground">{currentStep.description}</p>
        </div>
        
        <div className="mt-6">
          {currentStep.component}
        </div>
      </div>
    );
  };
  
  const renderNavigation = () => {
    return (
      <div className="flex justify-between mt-8 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStepIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        
        {isLastStep ? (
          <Button onClick={onComplete} disabled={isNextDisabled}>
            Complete
          </Button>
        ) : (
          <Button 
            onClick={onNext} 
            disabled={isNextDisabled}
            className="gap-2"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderStepIndicator()}
      {renderCurrentStep()}
      {renderNavigation()}
    </div>
  );
};

export default WizardLayout;
