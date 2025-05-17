import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PDFIssue } from '@/types/pdf';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface VeraPdfResultsProps {
  isCompliant: boolean;
  flavour?: string;
  issues: PDFIssue[];
  onFix?: () => void;
  onRevalidate?: () => void;
  isFixing?: boolean;
  standardName: string;
}

const VeraPdfResults: React.FC<VeraPdfResultsProps> = ({
  isCompliant,
  flavour,
  issues,
  onFix,
  onRevalidate,
  isFixing = false,
  standardName
}) => {
  const severityCounts = {
    HIGH: issues.filter(issue => issue.severity === "high").length,
    MEDIUM: issues.filter(issue => issue.severity === "medium").length,
    LOW: issues.filter(issue => issue.severity === "low").length
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {standardName} Validation {flavour ? `(${flavour})` : ''}
          </span>
          {isCompliant ? (
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCompliant ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Validation Passed!</h3>
            <p className="text-center text-muted-foreground">
              This document is fully compliant with {standardName} standards.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Found {issues.length} issues:
                {severityCounts.HIGH > 0 && (
                  <span className="ml-2 text-red-600">{severityCounts.HIGH} critical</span>
                )}
                {severityCounts.MEDIUM > 0 && (
                  <span className="ml-2 text-amber-600">{severityCounts.MEDIUM} warnings</span>
                )}
                {severityCounts.LOW > 0 && (
                  <span className="ml-2 text-blue-600">{severityCounts.LOW} info</span>
                )}
              </div>
              
              <div className="flex gap-2">
                {onFix && (
                  <Button 
                    size="sm" 
                    onClick={onFix} 
                    disabled={isFixing}
                  >
                    {isFixing ? 'Fixing...' : 'Auto-Fix'}
                  </Button>
                )}
                {onRevalidate && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onRevalidate}
                    disabled={isFixing}
                  >
                    Revalidate
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {issues.map((issue, index) => (
                <div key={issue.id || index} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{issue.message}</h4>
                    {getSeverityBadge(issue.severity)}
                  </div>
                  {issue.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{issue.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VeraPdfResults;
