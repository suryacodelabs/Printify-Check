
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, FileType, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PreflightIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  page?: number;
  canAutoFix: boolean;
}

interface PDFPreflightReportProps {
  issues: PreflightIssue[];
  qualityScore?: number;
  fileName?: string;
}

const PDFPreflightReport: React.FC<PDFPreflightReportProps> = ({ 
  issues,
  qualityScore = 0,
  fileName = "document.pdf"
}) => {
  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const warnings = issues.filter(issue => issue.severity === 'warning');
  const infoIssues = issues.filter(issue => issue.severity === 'info');
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Critical
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-500 text-white">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case 'info':
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Info
          </Badge>
        );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileType className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Preflight Report</CardTitle>
          </div>
          {qualityScore > 0 && (
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Quality Score</span>
              <div className={`text-xl font-bold ${
                qualityScore >= 80 ? 'text-green-600' : 
                qualityScore >= 60 ? 'text-amber-600' : 
                'text-red-600'
              }`}>
                {qualityScore}/100
              </div>
            </div>
          )}
        </div>
        <CardDescription>
          {issues.length === 0 
            ? 'No issues found in your document.' 
            : `Found ${issues.length} issue${issues.length !== 1 ? 's' : ''} in your document.`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Checks Passed!</h3>
            <p className="text-center text-muted-foreground">
              Your document is print-ready and meets all quality standards.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {criticalIssues.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Critical Issues ({criticalIssues.length})
                </h3>
                <div className="space-y-3">
                  {criticalIssues.map(issue => (
                    <div key={issue.id} className="p-3 border rounded-md bg-destructive/5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{issue.title}</h4>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                      {issue.page && (
                        <p className="mt-1 text-xs text-muted-foreground">Page: {issue.page}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {warnings.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Warnings ({warnings.length})
                </h3>
                <div className="space-y-3">
                  {warnings.map(issue => (
                    <div key={issue.id} className="p-3 border rounded-md bg-amber-50 dark:bg-amber-950/20">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{issue.title}</h4>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                      {issue.page && (
                        <p className="mt-1 text-xs text-muted-foreground">Page: {issue.page}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {infoIssues.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Informational ({infoIssues.length})
                </h3>
                <div className="space-y-3">
                  {infoIssues.map(issue => (
                    <div key={issue.id} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{issue.title}</h4>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                      {issue.page && (
                        <p className="mt-1 text-xs text-muted-foreground">Page: {issue.page}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {issues.length > 0 && (
        <CardFooter>
          <div className="w-full text-sm text-muted-foreground">
            <Separator className="my-3" />
            <p>Use the tools in the sidebar to address these issues before printing.</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default PDFPreflightReport;
