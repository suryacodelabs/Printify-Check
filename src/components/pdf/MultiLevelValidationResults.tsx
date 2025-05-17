
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PDFIssue, PdfFlavour } from '@/types/pdf';
import { CheckCircle, XCircle, AlertTriangle, Info, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlavourResult {
  issues: PDFIssue[];
  isCompliant: boolean;
  level: string;
}

interface MultiLevelValidationResultsProps {
  results: Record<string, FlavourResult>;
  isCompliant: boolean;
  className?: string;
  onFix?: (flavour: PdfFlavour) => void;
  isFixing?: boolean;
}

const MultiLevelValidationResults: React.FC<MultiLevelValidationResultsProps> = ({
  results,
  isCompliant,
  className,
  onFix,
  isFixing = false
}) => {
  const [activeTab, setActiveTab] = useState(Object.keys(results)[0] || 'PDFA_1B');
  
  const getFlavourName = (level: string): string => {
    switch (level) {
      case 'PDFA_1B': return 'PDF/A-1b';
      case 'PDFA_1A': return 'PDF/A-1a';
      case 'PDFA_2B': return 'PDF/A-2b';
      case 'PDFA_2A': return 'PDF/A-2a';
      case 'PDFA_3B': return 'PDF/A-3b';
      case 'PDFA_3A': return 'PDF/A-3a';
      case 'PDFA_4': return 'PDF/A-4';
      case 'PDFUA_1': return 'PDF/UA';
      case 'PDFVT_1': return 'PDF/VT';
      case 'PDFX_1A': return 'PDF/X-1a';
      case 'PDFX_4': return 'PDF/X-4';
      case 'WCAG_2_1_AA': return 'WCAG 2.1 AA';
      default: return level;
    }
  };
  
  const getFlavourDescription = (level: string): string => {
    switch (level) {
      case 'PDFA_1B': return 'Basic PDF for long-term preservation (ISO 19005-1)';
      case 'PDFA_1A': return 'Accessible PDF for long-term preservation (ISO 19005-1)';
      case 'PDFA_2B': return 'Basic PDF with advanced features (ISO 19005-2)';
      case 'PDFA_2A': return 'Accessible PDF with advanced features (ISO 19005-2)';
      case 'PDFA_3B': return 'Basic PDF with embedded files (ISO 19005-3)';
      case 'PDFA_3A': return 'Accessible PDF with embedded files (ISO 19005-3)';
      case 'PDFA_4': return 'Latest PDF/A standard (ISO 19005-4)';
      case 'PDFUA_1': return 'Universal Accessibility standard (ISO 14289-1)';
      case 'PDFVT_1': return 'Variable transactional printing standard (ISO 16612-2)';
      case 'PDFX_1A': return 'Print production standard, CMYK workflow (ISO 15930-4)';
      case 'PDFX_4': return 'Print production standard with transparency (ISO 15930-7)';
      case 'WCAG_2_1_AA': return 'Web Content Accessibility Guidelines Level AA';
      default: return 'PDF validation standard';
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Critical
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-500 text-white">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case 'low':
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Info
          </Badge>
        );
    }
  };
  
  const getFlavourToPdfFlavour = (level: string): PdfFlavour | undefined => {
    switch (level) {
      case 'PDFA_1B': return PdfFlavour.PDFA_1B;
      case 'PDFA_1A': return PdfFlavour.PDFA_1A;
      case 'PDFA_2B': return PdfFlavour.PDFA_2B;
      case 'PDFA_2A': return PdfFlavour.PDFA_2A;
      case 'PDFA_3B': return PdfFlavour.PDFA_3B;
      case 'PDFA_3A': return PdfFlavour.PDFA_3A;
      case 'PDFA_4': return PdfFlavour.PDFA_4;
      default: return undefined;
    }
  };
  
  const handleFix = () => {
    if (onFix) {
      const flavour = getFlavourToPdfFlavour(activeTab);
      if (flavour) {
        onFix(flavour);
      }
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Multi-Standard Validation Results</span>
            {isCompliant ? (
              <Badge variant="outline" className="flex items-center gap-1 bg-green-500 text-white">
                <CheckCircle className="h-3 w-3" />
                All Standards Met
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Standards Not Met
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Comprehensive validation against multiple PDF standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Object.keys(results).length}, 1fr)` }}>
              {Object.keys(results).map(level => (
                <TabsTrigger key={level} value={level} className="relative">
                  {getFlavourName(level)}
                  {results[level].isCompliant ? (
                    <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.keys(results).map(level => (
              <TabsContent key={level} value={level} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{getFlavourName(level)} Validation</h3>
                    <p className="text-sm text-muted-foreground">{getFlavourDescription(level)}</p>
                  </div>
                  
                  {results[level].isCompliant ? (
                    <Badge variant="outline" className="flex items-center gap-1 bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3" />
                      Compliant
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Compliant
                    </Badge>
                  )}
                </div>
                
                {results[level].isCompliant ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Validation Passed!</h3>
                    <p className="text-center text-muted-foreground">
                      This document is fully compliant with {getFlavourName(level)} standards.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Found {results[level].issues.length} issues
                      </div>
                      
                      {level.startsWith('PDFA_') && onFix && (
                        <Button 
                          size="sm" 
                          onClick={handleFix} 
                          disabled={isFixing}
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          {isFixing ? 'Converting...' : `Convert to ${getFlavourName(level)}`}
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {results[level].issues.map((issue, index) => (
                        <div key={issue.id || index} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{issue.message}</h4>
                            {getSeverityBadge(issue.severity)}
                          </div>
                          {issue.description && (
                            <p className="mt-1.5 text-sm text-muted-foreground">{issue.description}</p>
                          )}
                          {issue.ruleId && (
                            <p className="mt-1 text-xs text-muted-foreground">Rule ID: {issue.ruleId}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiLevelValidationResults;
