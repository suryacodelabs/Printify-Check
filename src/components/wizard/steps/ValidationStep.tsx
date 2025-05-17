import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useValidation } from '@/hooks/useValidation';
import { useVeraPdf } from '@/hooks/useVeraPdf';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ValidationParams, 
  ValidationIssue, 
  ValidationCategory, 
  StructuralValidationType,
  FontValidationType,
  ColorValidationType 
} from '@/types/validation';
import { ValidationIssuesList } from '@/components/pdf/ValidationIssuesList';
import { FontColorIssuesList } from '@/components/pdf/FontColorIssuesList';
import { ValidationSummary } from '@/components/pdf/ValidationSummary';
import PDFViewer from '@/components/pdf/PDFViewer';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, FileCheck, Loader2 } from 'lucide-react';
import { PDFIssue } from '@/types/pdf';
import { useProAccess } from '@/hooks/useProAccess';
import ProFeatureGate from '@/components/pro/ProFeatureGate';

interface ValidationStepProps {
  file: File | null;
  onBack: () => void;
  onComplete: () => void;
}

export const ValidationStep: React.FC<ValidationStepProps> = ({
  file,
  onBack,
  onComplete
}) => {
  const { user } = useUser();
  const { 
    validatePDF, 
    isValidating,
    validationStatus,
    isCheckingStatus,
    validationResults,
    isLoadingResults,
    applyFixes,
    isApplyingFixes,
    applyFontEmbedding,
    isEmbeddingFonts,
    convertRgbToCmyk,
    isConvertingRgbToCmyk,
    applyIccProfile,
    flattenTransparency,
    resetValidation
  } = useValidation(user?.id || 'anonymous');
  
  const { isPro, checkProAccess } = useProAccess();
  
  // Add VeraPDF hook
  const {
    validatePdfA,
    isValidatingPdfA,
    pdfAValidationResult,
    validatePdfUA,
    isValidatingPdfUA,
    pdfUAValidationResult,
    convertToPdfA,
    isConvertingToPdfA,
    isProcessing: isVeraProcessing
  } = useVeraPdf();
  
  const [activeTab, setActiveTab] = useState('validation');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Start validation when component mounts with a file
  const startValidation = () => {
    if (!file) return;
    
    const params: ValidationParams = {
      checkStructural: true,
      checkFonts: true,
      checkColor: true,
      checkImage: true,
      checkCompliance: isPro, // Only run compliance checks for Pro users
      checkSecurity: true,
      checkPrintProduction: isPro, // Only run print production checks for Pro users
    };
    
    validatePDF({ file, params });
  };
  
  // Apply fixes to the PDF
  const handleApplyFixes = (fixes: string[]) => {
    if (!file) return;
    applyFixes({ file, fixes });
  };
  
  // Apply font embedding fixes
  const handleApplyFontEmbedding = () => {
    if (!file) return;
    applyFontEmbedding(file);
  };
  
  // Apply RGB to CMYK conversion
  const handleConvertRgbToCmyk = () => {
    if (!file) return;
    convertRgbToCmyk({ file, preserveBlack: true }); // Fixed: Passing object with file property
  };
  
  // Apply ICC profile
  const handleApplyIccProfile = (profileName: string = 'FOGRA39') => {
    if (!file) return;
    applyIccProfile({ file, profileName });
  };
  
  // Flatten transparency
  const handleFlattenTransparency = () => {
    if (!file) return;
    flattenTransparency({ file, quality: 'high' }); // Fixed: Passing object with file property
  };
  
  // Fix all font issues
  const handleFixAllFontIssues = () => {
    if (!file) return;
    handleApplyFixes(['embedFonts', 'generateCmaps', 'fixGlyphWidths']);
  };
  
  // Fix all color issues
  const handleFixAllColorIssues = () => {
    if (!file) return;
    handleApplyFixes(['convertRgbToCmyk', 'embedIccProfile', 'fixOverprintSettings', 'flattenTransparency']);
  };
  
  // Apply advanced fixes (Pro only)
  const handleApplyAdvancedFixes = () => {
    if (!checkProAccess('Advanced Fixes')) return;
    if (!file) return;
    
    // Apply comprehensive fixes for Pro users
    handleApplyFixes([
      'embedFonts', 
      'generateCmaps', 
      'fixGlyphWidths',
      'convertRgbToCmyk', 
      'embedIccProfile', 
      'fixOverprintSettings', 
      'flattenTransparency'
    ]);
  };
  
  // VeraPDF specific functions
  const handleValidatePdfA = () => {
    if (!file) return;
    validatePdfA({ file, flavour: '1b' });
  };

  const handleValidatePdfUA = () => {
    if (!file) return;
    validatePdfUA({ file });
  };

  const handleConvertToPdfA = () => {
    if (!file) return;
    convertToPdfA({ file, flavour: '1b' });
  };
  
  // View issue in document
  const handleViewIssue = (issue: any) => {
    if (issue.page) {
      setCurrentPage(issue.page);
      setActiveTab('document');
    }
  };
  
  // Map issue type to fix type
  const mapIssueTypeToFixType = (issueType: string): string => {
    switch (issueType) {
      // Structural fixes
      case StructuralValidationType.LINEARIZATION:
        return 'linearization';
      case StructuralValidationType.OBJECT_STREAMS:
        return 'objectStreams';
      case StructuralValidationType.XREF_TABLE:
        return 'repairXref';
      case StructuralValidationType.XREF_STREAM:
        return 'convertToXrefStream';
      case StructuralValidationType.DAMAGED_OBJECTS:
        return 'repairDamagedObjects';
      case StructuralValidationType.PDF_VERSION:
        return 'updatePdfVersion';
        
      // Font fixes
      case FontValidationType.EMBEDDING:
        return 'embedFonts';
      case FontValidationType.CMAPS:
        return 'generateCmaps';
      case FontValidationType.GLYPH_WIDTHS:
        return 'fixGlyphWidths';
      case FontValidationType.TYPE3_FONTS:
        return 'convertType3Fonts';
      case FontValidationType.SUBSETTING:
        return 'applyFontSubsetting';
      case FontValidationType.TEXT_ENCODING:
        return 'convertTextEncoding';
        
      // Color fixes
      case ColorValidationType.RGB_IN_CMYK:
        return 'convertRgbToCmyk';
      case ColorValidationType.SPOT_COLORS:
        return 'convertSpotColors';
      case ColorValidationType.ICC_PROFILES:
        return 'embedIccProfile';
      case ColorValidationType.OVERPRINT:
        return 'fixOverprintSettings';
      case ColorValidationType.INK_DENSITY:
        return 'reduceInkDensity';
      case ColorValidationType.COLOR_SPACE_MISMATCHES:
        return 'normalizeColorSpaces';
      case ColorValidationType.TRANSPARENCY:
        return 'flattenTransparency';
      case ColorValidationType.LAYER_MISUSE:
        return 'flattenLayers';
        
      // Other cases
      case "Bleed":
        return 'addBleed';
      case "JavaScript":
        return 'removeJavaScript';
      default:
        return '';
    }
  };
  
  // Render loading state during validation
  const renderLoading = () => {
    const progress = validationStatus?.progress || 0;
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium mb-2">Validating your PDF</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          We're thoroughly analyzing your document against printing industry standards. 
          This may take a few moments depending on the file size and complexity.
        </p>
        <div className="w-full max-w-md mb-2">
          <Progress value={progress} className="h-2" />
        </div>
        <p className="text-sm text-muted-foreground">{progress}% complete</p>
      </div>
    );
  };
  
  // Render start validation button
  const renderStartValidation = () => {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileCheck className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">PDF Validation</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Our comprehensive validation will check your PDF against industry standards
          and identify issues that could affect print quality.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <Button onClick={startValidation} size="lg">
            Start Standard Validation
          </Button>
          {isPro && (
            <div className="flex gap-3 mt-2">
              <Button 
                onClick={handleValidatePdfA} 
                variant="outline" 
                disabled={isVeraProcessing}>
                Validate PDF/A
              </Button>
              <Button 
                onClick={handleValidatePdfUA} 
                variant="outline"
                disabled={isVeraProcessing}>
                Validate PDF/UA
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render validation results
  const renderResults = () => {
    if (!validationResults) return null;
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validation">Summary</TabsTrigger>
          <TabsTrigger value="font-color">Font & Color</TabsTrigger>
          <TabsTrigger value="document">Document View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="validation" className="space-y-4 mt-4">
          <ValidationSummary
            result={validationResults}
            onApplyFixes={handleApplyFixes}
            onRevalidate={() => {
              resetValidation();
              startValidation();
            }}
            isFixing={isApplyingFixes}
            isPro={isPro}
          />
          
          {validationResults.issuesByCategory[ValidationCategory.COMPLIANCE] && (
            isPro ? (
              <div className="mt-4 mb-2">
                <h3 className="text-lg font-medium mb-2">Compliance Validation</h3>
                <ValidationIssuesList
                  issuesByCategory={{ 
                    [ValidationCategory.COMPLIANCE]: 
                    validationResults.issuesByCategory[ValidationCategory.COMPLIANCE] 
                  }}
                  onFixIssue={(issue) => {
                    const fixType = mapIssueTypeToFixType(issue.type);
                    if (fixType) {
                      handleApplyFixes([fixType]);
                    } else if (issue.type === "PDF/A Compliance") {
                      // Use VeraPDF for PDF/A conversion
                      if (file) convertToPdfA({ file, flavour: '1b' });
                    }
                  }}
                  onViewInDocument={handleViewIssue}
                />
              </div>
            ) : (
              <ProFeatureGate featureName="Compliance Validation">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-medium">Compliance validation available for Pro users</h3>
                </div>
              </ProFeatureGate>
            )
          )}
          
          <ValidationIssuesList
            issuesByCategory={validationResults.issuesByCategory as Record<string, ValidationIssue[]>}
            onFixIssue={(issue) => {
              // Handle single issue fix by type
              const fixType = mapIssueTypeToFixType(issue.type);
              if (fixType) {
                handleApplyFixes([fixType]);
              }
            }}
            onViewInDocument={handleViewIssue}
            excludeCategories={[ValidationCategory.COMPLIANCE]}
          />
        </TabsContent>
        
        <TabsContent value="font-color" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <FontColorIssuesList
              fontIssues={validationResults.issuesByCategory[ValidationCategory.FONTS]}
              colorIssues={validationResults.issuesByCategory[ValidationCategory.COLOR]}
              onFixIssue={(issue) => {
                const fixType = mapIssueTypeToFixType(issue.type);
                if (fixType) {
                  handleApplyFixes([fixType]);
                }
              }}
              onFixAllFontIssues={handleFixAllFontIssues}
              onFixAllColorIssues={handleFixAllColorIssues}
              onViewInDocument={handleViewIssue}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="document" className="mt-4">
          {renderDocumentViewTab()}
        </TabsContent>
      </Tabs>
    );
  };
  
  // Render document view tab content with proper type conversion
  const renderDocumentViewTab = () => {
    if (!validationResults?.issuesByCategory?.STRUCTURAL) return null;
    
    const pdfIssues = validationResults.issuesByCategory.STRUCTURAL.map(issue => {
      // Convert from ValidationIssue to PDFIssue format
      const pdfIssue: PDFIssue = {
        id: issue.id || '',
        type: issue.type,
        severity: issue.severity.toLowerCase(),
        message: issue.message,
        page: issue.page || 1,
        location: issue.location,
        autoFixable: issue.autoFixable || false,
        description: issue.message,
        category: "STRUCTURAL",
        status: "active"
      };
      return pdfIssue;
    });
    
    return (
      <Card className="p-4">
        <PDFViewer 
          file={file} 
          issues={pdfIssues}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </Card>
    );
  };
  
  return (
    <div className="validation-step w-full space-y-6">
      <div className="flex flex-col w-full">
        {!validationStatus && !isValidating && renderStartValidation()}
        {(isValidating || isCheckingStatus) && renderLoading()}
        {validationResults && !isLoadingResults && renderResults()}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        {validationResults && (
          <Button onClick={onComplete}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ValidationStep;
