import React, { useState } from 'react';
import { useVeraPdfExtended } from '@/hooks/useVeraPdfExtended';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/ui/file-uploader';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileText, ArrowRight, FileCheck, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useProAccess } from '@/hooks/useProAccess';
import ProFeatureGate from '@/components/pro/ProFeatureGate';
import { PdfFlavour, PDFValidationOptions, PDFFixOptions } from '@/types/pdf';
import MultiLevelValidationResults from '@/components/pdf/MultiLevelValidationResults';
import AccessibilitySummary from '@/components/pdf/AccessibilitySummary';
import PDFAccessibilitySettings from '@/components/pdf/PDFAccessibilitySettings';
import VeraPdfResults from '@/components/pdf/VeraPdfResults';

const PdfAccessibilityPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const { user } = useUser();
  const { isPro } = useProAccess();
  
  const [activeTab, setActiveTab] = useState('validate');
  
  const {
    // Multi-level validation
    validateMultiLevel,
    isValidatingMultiLevel,
    multiLevelValidationResult,
    
    // Tag structure validation
    validateTagStructure,
    isValidatingTagStructure,
    tagStructureValidationResult,
    
    // Accessibility summary
    getAccessibilitySummary,
    isGettingAccessibilitySummary,
    accessibilitySummary,
    
    // PDF/A validation
    validatePdfA,
    isValidatingPdfA,
    pdfAValidationResult,
    
    // PDF/UA validation
    validatePdfUA,
    isValidatingPdfUA,
    pdfUAValidationResult,
    
    // WCAG validation
    validateWcag,
    isValidatingWcag,
    wcagValidationResult,
    
    // Fix operations
    convertToPdfA,
    isConvertingToPdfA,
    enhanceAccessibility,
    isEnhancingAccessibility,
    addLanguage,
    isAddingLanguage,
    applyMultipleFixes,
    isApplyingFixes,
    
    // General state
    isProcessing
  } = useVeraPdfExtended();
  
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setActiveTab('validate');
  };
  
  const handleValidateComprehensive = () => {
    if (!file) return;
    
    const options: PDFValidationOptions = {
      levels: [
        PdfFlavour.PDFA_1B,
        PdfFlavour.PDFA_2A,
        isPro ? PdfFlavour.PDFUA_1 : undefined,
        isPro ? PdfFlavour.WCAG_21_AA : undefined
      ].filter(Boolean) as PdfFlavour[],
      includeTagValidation: isPro
    };
    
    validateMultiLevel({ file, options });
    
    if (isPro) {
      // Also get accessibility summary for Pro users
      getAccessibilitySummary({ file });
    }
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
  
  const handleValidateTagStructure = () => {
    if (!file) return;
    validateTagStructure({ file });
  };
  
  const handleConvertToPdfA = (flavour: PdfFlavour = PdfFlavour.PDFA_1B) => {
    if (!file) return;
    convertToPdfA({ file, flavour });
  };
  
  const handleEnhanceAccessibility = () => {
    if (!file) return;
    enhanceAccessibility({ file });
  };
  
  const handleAddLanguage = (language: string = 'en-US') => {
    if (!file) return;
    addLanguage({ file, language });
  };
  
  const handleApplyMultipleFixes = (options: PDFFixOptions) => {
    if (!file) return;
    applyMultipleFixes({ file, options });
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">PDF Accessibility & Compliance</h1>
      <p className="text-muted-foreground mb-6">
        Validate and fix PDF compliance with accessibility standards, archival formats, and more
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF</CardTitle>
              <CardDescription>
                Upload a PDF file to check accessibility and compliance with standards
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
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">VALIDATION OPTIONS</h3>
                
                <Button
                  onClick={handleValidateComprehensive}
                  disabled={!file || isProcessing}
                  className="w-full justify-start"
                  size="sm"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Comprehensive Validation
                </Button>
                
                <Button
                  onClick={handleValidatePdfA}
                  disabled={!file || isProcessing}
                  className="w-full justify-start"
                  size="sm"
                  variant="outline"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validate PDF/A (Archival)
                </Button>
                
                <ProFeatureGate featureName="Advanced Compliance Validation">
                  <Button
                    onClick={handleValidatePdfUA}
                    disabled={!file || isProcessing || !isPro}
                    className="w-full justify-start"
                    size="sm"
                    variant={isPro ? "outline" : "ghost"}
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
                    size="sm"
                    variant={isPro ? "outline" : "ghost"}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Validate WCAG 2.1
                  </Button>
                </ProFeatureGate>
                
                <ProFeatureGate featureName="Advanced Compliance Validation">
                  <Button
                    onClick={handleValidateTagStructure}
                    disabled={!file || isProcessing || !isPro}
                    className="w-full justify-start"
                    size="sm"
                    variant={isPro ? "outline" : "ghost"}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Validate Tag Structure
                  </Button>
                </ProFeatureGate>
                
                <Separator className="my-2" />
                
                <div className="flex justify-center">
                  <Button
                    onClick={() => setActiveTab('fix')}
                    disabled={!file}
                    variant="link"
                    className="text-primary"
                  >
                    Go to Fix Tools <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isPro && accessibilitySummary && (
            <div className="mt-6">
              <AccessibilitySummary summary={accessibilitySummary} />
            </div>
          )}
        </div>
        
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="validate">Validation Results</TabsTrigger>
              <TabsTrigger value="fix">Fix & Enhance</TabsTrigger>
              <TabsTrigger value="info">Standards Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="validate" className="space-y-6 mt-6">
              {!file && !multiLevelValidationResult && !pdfAValidationResult && !pdfUAValidationResult && !wcagValidationResult && !tagStructureValidationResult && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No results yet</AlertTitle>
                  <AlertDescription>
                    Upload a PDF file and select a validation option to see results.
                  </AlertDescription>
                </Alert>
              )}
              
              {multiLevelValidationResult && (
                <MultiLevelValidationResults
                  results={multiLevelValidationResult.results}
                  isCompliant={multiLevelValidationResult.isCompliant}
                  onFix={handleConvertToPdfA}
                  isFixing={isConvertingToPdfA}
                />
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
                  onFix={handleEnhanceAccessibility}
                  isFixing={isEnhancingAccessibility}
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
              
              {tagStructureValidationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Tag Structure Validation</span>
                      {tagStructureValidationResult.isAccessible ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Well Tagged</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="h-5 w-5" />
                          <span>Issues Found</span>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tagStructureValidationResult.isAccessible ? (
                      <div className="flex flex-col items-center justify-center py-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Good Tag Structure!</h3>
                        <p className="text-center text-muted-foreground">
                          This document has a well-formed tag structure for good accessibility.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Found {tagStructureValidationResult.issues.length} tag structure issues:
                        </p>
                        
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                          {tagStructureValidationResult.issues.map((issue, index) => (
                            <div key={issue.id || index} className="p-3 border rounded-md">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{issue.message}</h4>
                              </div>
                              {issue.description && (
                                <p className="mt-1.5 text-sm text-muted-foreground">{issue.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={handleEnhanceAccessibility}
                            disabled={isEnhancingAccessibility}
                          >
                            Enhance Accessibility
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="fix" className="mt-6">
              {!file ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No file selected</AlertTitle>
                  <AlertDescription>
                    Upload a PDF file first to access enhancement options.
                  </AlertDescription>
                </Alert>
              ) : (
                <PDFAccessibilitySettings
                  onApplyFixes={handleApplyMultipleFixes}
                  isProcessing={isApplyingFixes || isConvertingToPdfA || isEnhancingAccessibility || isAddingLanguage}
                />
              )}
            </TabsContent>
            
            <TabsContent value="info" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>PDF Standards Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">PDF/A (ISO 19005)</h3>
                    <p className="text-muted-foreground mb-2">
                      PDF/A is an ISO-standardized version of the PDF designed for long-term archiving.
                      It removes features that might make the document harder to preserve, such as
                      external dependencies, encryption, and embedded JavaScript.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="border rounded-md p-3">
                        <h4 className="font-medium">PDF/A-1 (a/b)</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on PDF 1.4, focused on preservable documents. The 'a' level adds accessibility requirements.
                        </p>
                      </div>
                      <div className="border rounded-md p-3">
                        <h4 className="font-medium">PDF/A-2 (a/b/u)</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on PDF 1.7, adds JPEG2000, transparency, and layers. The 'u' level ensures Unicode support.
                        </p>
                      </div>
                      <div className="border rounded-md p-3">
                        <h4 className="font-medium">PDF/A-3 (a/b/u)</h4>
                        <p className="text-sm text-muted-foreground">
                          Extends PDF/A-2 by allowing embedded files of any format.
                        </p>
                      </div>
                      <div className="border rounded-md p-3">
                        <h4 className="font-medium">PDF/A-4</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on PDF 2.0, with new features and simplified conformance levels.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">PDF/UA (ISO 14289)</h3>
                    <p className="text-muted-foreground">
                      PDF/UA (Universal Accessibility) is designed to make PDFs accessible to people with disabilities.
                      It requires document structure, alt text for images, and other features to ensure the content
                      can be accessed by everyone, including those using assistive technologies like screen readers.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">WCAG 2.1</h3>
                    <p className="text-muted-foreground">
                      Web Content Accessibility Guidelines (WCAG) 2.1 are a set of recommendations for making
                      web content more accessible to people with disabilities. When applied to PDFs, they
                      ensure that documents are perceivable, operable, understandable, and robust.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">PDF Tag Structure</h3>
                    <p className="text-muted-foreground">
                      Tag structure provides a standardized way to represent the logical structure and content of a PDF document.
                      It enables assistive technologies to properly interpret and present the document content
                      to users with disabilities, improving navigation, reading order, and overall accessibility.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Powered by VeraPDF {import.meta.env.VITE_VERAPDF_VERSION || '1.28.1'}</h3>
                    <p className="text-muted-foreground">
                      Our compliance validation is powered by veraPDF {import.meta.env.VITE_VERAPDF_VERSION || '1.28.1'}, the industry-standard open-source
                      PDF/A validator developed by the PDF Association and the Open Preservation Foundation.
                      It provides thorough validation against PDF/A, PDF/UA, and WCAG standards.
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

export default PdfAccessibilityPage;
