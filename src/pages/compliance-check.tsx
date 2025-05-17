
import React, { useState } from 'react';
import { useVeraPdf } from '@/hooks/useVeraPdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/ui/file-uploader';
import VeraPdfResults from '@/components/pdf/VeraPdfResults';
import { AlertCircle, CheckCircle2, FileCheck, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser } from '@/hooks/useUser';
import { useProAccess } from '@/hooks/useProAccess';
import ProFeatureGate from '@/components/pro/ProFeatureGate';

const ComplianceCheckPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const { user } = useUser();
  const { isPro } = useProAccess();
  
  const {
    validatePdfA,
    isValidatingPdfA,
    pdfAValidationResult,
    validatePdfUA,
    isValidatingPdfUA,
    pdfUAValidationResult,
    validateWcag,
    isValidatingWcag,
    wcagValidationResult,
    convertToPdfA,
    isConvertingToPdfA,
    sanitizeMetadata,
    isSanitizingMetadata,
    isProcessing
  } = useVeraPdf();
  
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
  };
  
  const handleValidatePdfA = () => {
    if (!file) return;
    validatePdfA({ file, flavour: '1b' });
  };
  
  const handleValidatePdfUA = () => {
    if (!file) return;
    validatePdfUA({ file });
  };
  
  const handleValidateWcag = () => {
    if (!file) return;
    validateWcag({ file });
  };
  
  const handleConvertToPdfA = () => {
    if (!file) return;
    convertToPdfA({ file, flavour: '1b' });
  };
  
  const handleSanitizeMetadata = () => {
    if (!file) return;
    sanitizeMetadata({ file });
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">PDF Compliance Check</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>
                Upload a PDF file to check its compliance with various standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFileSelected={handleFileSelected}
                acceptedFileTypes={['application/pdf']}
                maxFileSize={50 * 1024 * 1024} // 50MB
                label="Drag and drop a PDF file here"
              />
              
              {file && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">VALIDATION OPTIONS</h3>
                
                <Button
                  onClick={handleValidatePdfA}
                  disabled={!file || isProcessing}
                  className="w-full justify-start"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validate PDF/A
                </Button>
                
                <ProFeatureGate featureName="Advanced Compliance Validation">
                  <Button
                    onClick={handleValidatePdfUA}
                    disabled={!file || isProcessing || !isPro}
                    className="w-full justify-start"
                    variant={isPro ? "default" : "outline"}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Validate PDF/UA (Accessibility)
                  </Button>
                </ProFeatureGate>
                
                <ProFeatureGate featureName="Advanced Compliance Validation">
                  <Button
                    onClick={handleValidateWcag}
                    disabled={!file || isProcessing || !isPro}
                    className="w-full justify-start"
                    variant={isPro ? "default" : "outline"}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Validate WCAG 2.1
                  </Button>
                </ProFeatureGate>
                
                <h3 className="font-medium text-sm text-muted-foreground mb-2 mt-4">FIX OPTIONS</h3>
                
                <Button
                  onClick={handleConvertToPdfA}
                  disabled={!file || isProcessing}
                  className="w-full justify-start"
                  variant="secondary"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Convert to PDF/A
                </Button>
                
                <ProFeatureGate featureName="Metadata Sanitization">
                  <Button
                    onClick={handleSanitizeMetadata}
                    disabled={!file || isProcessing || !isPro}
                    className="w-full justify-start"
                    variant={isPro ? "secondary" : "outline"}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Sanitize Metadata
                  </Button>
                </ProFeatureGate>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-6 mt-6">
              {!file && !pdfAValidationResult && !pdfUAValidationResult && !wcagValidationResult && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No results yet</AlertTitle>
                  <AlertDescription>
                    Upload a PDF file and select a validation option to see results.
                  </AlertDescription>
                </Alert>
              )}
              
              {pdfAValidationResult && (
                <VeraPdfResults
                  isCompliant={pdfAValidationResult.isCompliant}
                  flavour={pdfAValidationResult.flavour}
                  issues={pdfAValidationResult.issues}
                  onFix={handleConvertToPdfA}
                  onRevalidate={handleValidatePdfA}
                  isFixing={isConvertingToPdfA}
                  standardName="PDF/A"
                />
              )}
              
              {pdfUAValidationResult && (
                <VeraPdfResults
                  isCompliant={pdfUAValidationResult.isCompliant}
                  issues={pdfUAValidationResult.issues}
                  onRevalidate={handleValidatePdfUA}
                  standardName="PDF/UA"
                />
              )}
              
              {wcagValidationResult && (
                <VeraPdfResults
                  isCompliant={wcagValidationResult.isCompliant}
                  issues={wcagValidationResult.issues}
                  onRevalidate={handleValidateWcag}
                  standardName="WCAG 2.1"
                />
              )}
            </TabsContent>
            
            <TabsContent value="info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>About PDF Standards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">PDF/A</h3>
                    <p className="text-muted-foreground">
                      PDF/A is an ISO-standardized version of the PDF designed for long-term archiving.
                      It removes features that might make the document harder to preserve, such as
                      external dependencies, encryption, and embedded JavaScript.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">PDF/UA</h3>
                    <p className="text-muted-foreground">
                      PDF/UA (Universal Accessibility) is designed to make PDFs accessible to people with disabilities.
                      It requires document structure, alt text for images, and other features to ensure the content
                      can be accessed by everyone.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">WCAG 2.1</h3>
                    <p className="text-muted-foreground">
                      Web Content Accessibility Guidelines (WCAG) 2.1 are a set of recommendations for making
                      web content more accessible to people with disabilities. When applied to PDFs, they
                      ensure that documents are perceivable, operable, understandable, and robust.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Powered by VeraPDF</h3>
                    <p className="text-muted-foreground">
                      Our compliance validation is powered by VeraPDF, the industry-standard open-source
                      PDF/A validator developed by the PDF Association and the Open Preservation Foundation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCheckPage;
