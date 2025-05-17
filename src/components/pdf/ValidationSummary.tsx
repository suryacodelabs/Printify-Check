
import React from 'react';
import { ValidationResult, ValidationIssue, ValidationSeverity } from '@/types/validation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ValidationSummaryProps {
  result: ValidationResult;
  onApplyFixes?: (fixes: string[]) => void;
  onRevalidate?: () => void;
  onDownloadReport?: () => void;
  isFixing?: boolean;
  isPro?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  result,
  onApplyFixes,
  onRevalidate,
  onDownloadReport,
  isFixing = false,
  isPro = false
}) => {
  // Count issues by severity
  const countIssuesBySeverity = (severity: ValidationSeverity): number => {
    let count = 0;
    
    Object.values(result.issuesByCategory).forEach(issues => {
      if (issues) {
        count += issues.filter(issue => issue.severity === severity).length;
      }
    });
    
    return count;
  };
  
  const criticalCount = countIssuesBySeverity(ValidationSeverity.HIGH);
  const warningCount = countIssuesBySeverity(ValidationSeverity.MEDIUM);
  const infoCount = countIssuesBySeverity(ValidationSeverity.LOW) + countIssuesBySeverity(ValidationSeverity.INFO);
  
  // Get all fixable issues
  const getFixableIssues = (): ValidationIssue[] => {
    const allIssues: ValidationIssue[] = [];
    
    Object.values(result.issuesByCategory).forEach(issues => {
      if (issues) {
        issues.forEach(issue => {
          if (issue.autoFixable) {
            allIssues.push(issue);
          }
        });
      }
    });
    
    return allIssues;
  };
  
  const fixableIssues = getFixableIssues();
  const fixableCount = fixableIssues.length;
  
  // Get fix types based on supported fixes
  const getFixTypes = (): string[] => {
    const fixes: string[] = [];
    
    if (result.supportedFixes.linearization) fixes.push('linearization');
    if (result.supportedFixes.fontEmbedding) fixes.push('fontEmbedding');
    if (result.supportedFixes.rgbToCmyk) fixes.push('rgbToCmyk');
    if (result.supportedFixes.addBleed) fixes.push('addBleed');
    if (result.supportedFixes.fixOverprint) fixes.push('fixOverprint');
    if (result.supportedFixes.flattenTransparency) fixes.push('flattenTransparency');
    if (result.supportedFixes.optimizeImages) fixes.push('optimizeImages');
    if (result.supportedFixes.pdfA) fixes.push('pdfA');
    if (result.supportedFixes.pdfX) fixes.push('pdfX');
    if (result.supportedFixes.removeJavaScript) fixes.push('removeJavaScript');
    if (result.supportedFixes.sanitizeMetadata) fixes.push('sanitizeMetadata');
    
    return fixes;
  };
  
  // Get quality score class
  const getScoreClass = (): string => {
    if (result.qualityScore >= 90) return 'text-green-600';
    if (result.qualityScore >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get quality progress class
  const getProgressClass = (): string => {
    if (result.qualityScore >= 90) return 'bg-green-600';
    if (result.qualityScore >= 70) return 'bg-yellow-500';
    return 'bg-red-600';
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF Validation Summary</CardTitle>
        <CardDescription>
          Quality assessment for {result.fileName} ({formatFileSize(result.fileSize)})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Quality</span>
            <span className={`text-lg font-bold ${getScoreClass()}`}>
              {result.qualityScore}/100
            </span>
          </div>
          <Progress value={result.qualityScore} className={getProgressClass()} />
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-md">
            <AlertTriangle className="h-5 w-5 text-red-500 mb-1" />
            <span className="text-sm text-muted-foreground">Critical</span>
            <span className="text-lg font-bold text-red-600">{criticalCount}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-md">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-sm text-muted-foreground">Warnings</span>
            <span className="text-lg font-bold text-yellow-600">{warningCount}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-md">
            <Info className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-sm text-muted-foreground">Info</span>
            <span className="text-lg font-bold text-blue-600">{infoCount}</span>
          </div>
        </div>
        
        <div className="p-4 rounded-md border bg-muted/30">
          <div className="flex items-start gap-3">
            {fixableCount > 0 ? (
              <>
                <RefreshCw className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Auto-fixable issues detected</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {fixableCount} out of {result.totalIssues} issues can be automatically fixed.
                  </p>
                  {onApplyFixes && (
                    <Button 
                      onClick={() => onApplyFixes(getFixTypes())} 
                      disabled={isFixing}
                      className="mt-1"
                    >
                      {isFixing ? 'Applying fixes...' : 'Apply all automatic fixes'}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">No automatic fixes available</h4>
                  <p className="text-sm text-muted-foreground">
                    The detected issues require manual intervention.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-3">
        {onRevalidate && (
          <Button variant="outline" onClick={onRevalidate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Revalidate PDF
          </Button>
        )}
        {onDownloadReport && (
          <Button variant="secondary" onClick={onDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
