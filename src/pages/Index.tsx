
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import WizardLayout, { WizardStep } from '@/components/wizard/WizardLayout';
import UploadStep from '@/components/wizard/steps/UploadStep';
import OCRStep from '@/components/wizard/steps/OCRStep';
import RedactionStep from '@/components/wizard/steps/RedactionStep';
import PreflightStep from '@/components/wizard/steps/PreflightStep';
import FixesStep from '@/components/wizard/steps/FixesStep';
import SuccessPage from '@/components/pages/SuccessPage';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileCheck, 
  FileSearch, 
  Upload, 
  Eye, 
  EyeOff, 
  Wrench, 
  ArrowRight, 
  FileType, 
  ShieldCheck, 
  FileText,
  User
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [preflightResults, setPreflightResults] = useState<any[]>([]);
  const [wizardComplete, setWizardComplete] = useState(false);
  const [preflightSuccess, setPreflightSuccess] = useState(false);
  
  // For demo purposes - would be determined by authentication state in real app
  const isProOrTeam = !!user;
  
  const handleFileAccepted = (file: File) => {
    setUploadedFile(file);
    setCurrentStepIndex(1); // Move to OCR step
  };
  
  const handleOCRComplete = () => {
    // In a real app, we'd track if OCR was successfully applied
    setCurrentStepIndex(2); // Move to redaction step
  };
  
  const handleRedactionComplete = () => {
    // In a real app, we'd track if redaction was successfully applied
    setCurrentStepIndex(3); // Move to preflight step
  };
  
  const handlePreflightComplete = (results: any[]) => {
    setPreflightResults(results);
    // Determine if preflight was successful (no errors)
    const hasErrors = results.some(r => r.status === 'error');
    setPreflightSuccess(!hasErrors);
    // In a real app, we'd wait for user to review results before proceeding
  };
  
  const handleWizardComplete = () => {
    setWizardComplete(true);
  };
  
  const resetWizard = () => {
    setUploadedFile(null);
    setCurrentStepIndex(0);
    setPreflightResults([]);
    setWizardComplete(false);
  };
  
  const steps: WizardStep[] = [
    {
      id: 'upload',
      title: 'Upload PDF',
      description: 'Upload a PDF or image file to begin the preflight process.',
      component: <UploadStep onFileAccepted={handleFileAccepted} />
    },
    {
      id: 'ocr',
      title: 'OCR (Optional)',
      description: 'Make scanned PDFs searchable and extract text for better preflight checks.',
      component: <OCRStep 
        file={uploadedFile} 
        isProOrTeam={isProOrTeam} 
        onOCRComplete={handleOCRComplete}
        onComplete={handleOCRComplete}
        onBack={() => setCurrentStepIndex(Math.max(currentStepIndex - 1, 0))}
      />,
      isOptional: true,
      isProOnly: true
    },
    {
      id: 'redaction',
      title: 'Redaction (Optional)',
      description: 'Remove sensitive data and metadata from your PDF.',
      component: <RedactionStep 
        file={uploadedFile} 
        isProOrTeam={isProOrTeam}
        userId={user?.id}
        onRedactionComplete={handleRedactionComplete}
        onBack={() => setCurrentStepIndex(Math.max(currentStepIndex - 1, 0))}
      />,
      isOptional: true,
      isProOnly: true
    },
    {
      id: 'preflight',
      title: 'Preflight Check',
      description: 'Identify issues in your PDF that could affect print quality.',
      component: <PreflightStep file={uploadedFile} onPreflightComplete={handlePreflightComplete} />
    },
    {
      id: 'fixes',
      title: 'Apply Fixes',
      description: 'Correct issues and export your print-ready PDF.',
      component: <FixesStep 
        file={uploadedFile} 
        preflightResults={preflightResults} 
        preflightSuccess={preflightSuccess}
        isProOrTeam={isProOrTeam} 
        onComplete={handleWizardComplete} 
      />
    }
  ];

  return (
    <Layout>
      {wizardComplete ? (
        <SuccessPage startNewCheck={resetWizard} />
      ) : (
        <>
          <div className="bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/30 dark:to-background border-b">
            <div className="container py-12 text-center">
              <h1 className="text-4xl font-bold mb-4">PDF Preflight & Correction</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
                Free, open-source PDF preflight with OCR, redaction, and smart fixes. Print perfect, every time!
              </p>
              
              {!user && (
                <div className="max-w-md mx-auto bg-card border shadow-sm rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium">Create a free account</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign up to access premium features and save your preflight history
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => navigate('/auth')}
                    >
                      Sign Up
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate('/auth')}
                    >
                      Sign In
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center items-center gap-4 flex-wrap max-w-xl mx-auto mb-8">
                <div className="flex items-center gap-2 bg-white dark:bg-muted p-2 px-3 rounded-full shadow-sm">
                  <FileCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">18 Preflight Checks</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-muted p-2 px-3 rounded-full shadow-sm">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">7 Automatic Fixes</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-muted p-2 px-3 rounded-full shadow-sm">
                  <Eye className="h-4 w-4 text-amber-600" />
                  <span className="text-sm">OCR for Scanned PDFs</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-muted p-2 px-3 rounded-full shadow-sm">
                  <EyeOff className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">PII Redaction</span>
                </div>
              </div>
            </div>
          </div>

          <div className="container py-12">
            <div className="max-w-4xl mx-auto">
              <WizardLayout 
                steps={steps}
                currentStepIndex={currentStepIndex}
                onNext={() => setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))}
                onPrevious={() => setCurrentStepIndex(prev => Math.max(prev - 1, 0))}
                onComplete={handleWizardComplete}
                isNextDisabled={currentStepIndex === 0 && !uploadedFile}
              />
            </div>
          </div>

          <div className="bg-muted">
            <div className="container py-16">
              <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-brand-100 rounded-full mb-4">
                    <Upload className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">1. Upload</h3>
                  <p className="text-muted-foreground">
                    Upload your PDF or image file. We support PDFs, JPEG, PNG, and TIFF files up to 50MB.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-brand-100 rounded-full mb-4">
                    <FileSearch className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">2. Check</h3>
                  <p className="text-muted-foreground">
                    We'll run 18 preflight checks to identify issues that could affect print quality.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-brand-100 rounded-full mb-4">
                    <FileText className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">3. Fix & Export</h3>
                  <p className="text-muted-foreground">
                    Apply automatic fixes to common issues and download your print-ready PDF.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <Button size="lg" className="gap-2" onClick={() => window.scrollTo(0, 0)}>
                  Start Now 
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="container py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Printify Check?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-green-100 rounded-full mb-4">
                  <FileType className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Comprehensive Checks</h3>
                <p className="text-sm text-muted-foreground">
                  18 preflight checks identify all common print issues from resolution to color spaces.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 rounded-full mb-4">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">OCR for Scanned PDFs</h3>
                <p className="text-sm text-muted-foreground">
                  Make scanned PDFs searchable and enable preflight checks for image-based files.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-amber-100 rounded-full mb-4">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Data Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  All PDFs are processed locally and securely with optional PII redaction.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-purple-100 rounded-full mb-4">
                  <FileCheck className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Open Source</h3>
                <p className="text-sm text-muted-foreground">
                  100% open-source under AGPL license. Transparent, free, and community-supported.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Index;

