
import React, { useState } from 'react';
import { ValidationIssue, ValidationSeverity, ValidationCategory } from '@/types/validation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Info, AlertCircle, ArrowRight } from 'lucide-react';

interface ValidationIssuesListProps {
  issuesByCategory: Record<string, ValidationIssue[]>;
  onFixIssue?: (issue: ValidationIssue) => void;
  onViewInDocument?: (issue: ValidationIssue) => void;
  excludeCategories?: ValidationCategory[];
}

export const ValidationIssuesList: React.FC<ValidationIssuesListProps> = ({
  issuesByCategory,
  onFixIssue,
  onViewInDocument,
  excludeCategories = []
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  // Get severity icon
  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case ValidationSeverity.HIGH:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case ValidationSeverity.MEDIUM:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case ValidationSeverity.LOW:
        return <Info className="h-4 w-4 text-blue-500" />;
      case ValidationSeverity.INFO:
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: ValidationSeverity) => {
    switch (severity) {
      case ValidationSeverity.HIGH:
        return <Badge variant="destructive">Critical</Badge>;
      case ValidationSeverity.MEDIUM:
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Warning</Badge>;
      case ValidationSeverity.LOW:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Info</Badge>;
      case ValidationSeverity.INFO:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Note</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Format category title
  const formatCategoryTitle = (category: string): string => {
    return category
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  // Count issues by severity in a category
  const countIssuesBySeverity = (issues: ValidationIssue[], severity: ValidationSeverity): number => {
    return issues.filter(issue => issue.severity === severity).length;
  };
  
  // Get category title with issue counts
  const getCategoryTitle = (category: string, issues: ValidationIssue[]) => {
    const totalIssues = issues.length;
    const criticalCount = countIssuesBySeverity(issues, ValidationSeverity.HIGH);
    const warningCount = countIssuesBySeverity(issues, ValidationSeverity.MEDIUM);
    
    return (
      <div className="flex items-center justify-between w-full">
        <span>{formatCategoryTitle(category)}</span>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-xs">{criticalCount}</Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 text-xs">{warningCount}</Badge>
          )}
          <Badge variant="outline" className="text-xs">{totalIssues}</Badge>
        </div>
      </div>
    );
  };
  
  // Filter out categories that should be excluded
  const filteredIssuesByCategory = Object.entries(issuesByCategory)
    .filter(([category]) => !excludeCategories.includes(category as ValidationCategory))
    .reduce((acc, [category, issues]) => {
      acc[category] = issues;
      return acc;
    }, {} as Record<string, ValidationIssue[]>);
  
  // Calculate if there are issues in the data
  const hasIssues = Object.values(filteredIssuesByCategory).some(issues => issues && issues.length > 0);
  
  if (!hasIssues) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
        <h3 className="text-lg font-medium">No issues found</h3>
        <p className="text-muted-foreground mt-1">
          Your PDF document looks good and doesn't have any detected issues.
        </p>
      </div>
    );
  }
  
  return (
    <div className="validation-issues-list">
      <Accordion type="multiple" value={expandedCategories} className="w-full">
        {Object.entries(filteredIssuesByCategory).map(([category, issues]) => {
          if (!issues || issues.length === 0) return null;
          
          return (
            <AccordionItem 
              key={category} 
              value={category}
              className="border rounded-md mb-2"
            >
              <AccordionTrigger 
                onClick={() => toggleCategory(category)}
                className="px-4 py-2 hover:bg-muted/50"
              >
                {getCategoryTitle(category, issues)}
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2">
                <div className="space-y-3">
                  {issues.map((issue, index) => (
                    <div 
                      key={issue.id || index}
                      className="p-3 rounded-md border bg-background"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getSeverityIcon(issue.severity)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{issue.type}</h4>
                            {getSeverityBadge(issue.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{issue.message}</p>
                          {issue.page && (
                            <p className="text-xs text-muted-foreground">Page: {issue.page}</p>
                          )}
                          {(onFixIssue || onViewInDocument) && (
                            <div className="flex items-center justify-end gap-2 mt-2">
                              {onViewInDocument && issue.page && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onViewInDocument(issue)}
                                  className="text-xs"
                                >
                                  View in document
                                </Button>
                              )}
                              {onFixIssue && issue.autoFixable && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => onFixIssue(issue)}
                                  className="text-xs"
                                >
                                  Apply fix <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};
