
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PDFAccessibilitySummary } from '@/types/pdf';
import { AlertTriangle, Check, CheckCircle, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibilitySummaryProps {
  summary: PDFAccessibilitySummary;
  className?: string;
}

const AccessibilitySummary: React.FC<AccessibilitySummaryProps> = ({ summary, className }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>PDF Accessibility Score</span>
          <span className={cn("text-2xl font-bold", getScoreColor(summary.score))}>
            {summary.score}/100
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Accessibility Level</span>
            <span className="font-medium">{getScoreText(summary.score)}</span>
          </div>
          <Progress 
            value={summary.score} 
            max={100}
            className="h-2"
          />
        </div>

        <div className="divide-y">
          <div className="py-2 flex justify-between items-center">
            <span>Tagged PDF</span>
            {summary.isTagged ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="py-2 flex justify-between items-center">
            <span>Document Language</span>
            {summary.hasLanguage ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="py-2 flex justify-between items-center">
            <span>Document Title</span>
            {summary.hasTitle ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="py-2 flex justify-between items-center">
            <span>Images with Alt Text</span>
            {summary.missingAltText === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <div className="flex items-center text-red-600">
                <X className="h-5 w-5 mr-1" />
                <span className="text-sm">{summary.missingAltText} missing</span>
              </div>
            )}
          </div>
          
          <div className="py-2 flex justify-between items-center">
            <span>Table Structure</span>
            {summary.tableIssues === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <div className="flex items-center text-red-600">
                <X className="h-5 w-5 mr-1" />
                <span className="text-sm">{summary.tableIssues} issues</span>
              </div>
            )}
          </div>
          
          <div className="py-2 flex justify-between items-center">
            <span>Heading Structure</span>
            {summary.headingIssues === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <div className="flex items-center text-red-600">
                <X className="h-5 w-5 mr-1" />
                <span className="text-sm">{summary.headingIssues} issues</span>
              </div>
            )}
          </div>
        </div>
        
        {summary.score < 70 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Accessibility improvements needed</p>
              <p className="mt-1">This document has accessibility issues that should be fixed to ensure it's usable by everyone, including people with disabilities.</p>
            </div>
          </div>
        )}
        
        {summary.score >= 90 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Good accessibility</p>
              <p className="mt-1">This document has excellent accessibility structure and follows best practices for PDF accessibility.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessibilitySummary;
