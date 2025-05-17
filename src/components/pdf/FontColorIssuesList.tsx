
import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ValidationIssue, 
  ValidationSeverity,
  FontValidationType,
  ColorValidationType
} from '@/types/validation';
import { FileType, Text, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FontColorIssuesListProps {
  fontIssues?: ValidationIssue[];
  colorIssues?: ValidationIssue[];
  onFixIssue: (issue: ValidationIssue) => void;
  onFixAllFontIssues?: () => void;
  onFixAllColorIssues?: () => void;
  onViewInDocument?: (issue: ValidationIssue) => void;
}

export const FontColorIssuesList: React.FC<FontColorIssuesListProps> = ({
  fontIssues = [],
  colorIssues = [],
  onFixIssue,
  onFixAllFontIssues,
  onFixAllColorIssues,
  onViewInDocument
}) => {
  // Get severity badge color
  const getSeverityColor = (severity: ValidationSeverity): string => {
    switch (severity) {
      case ValidationSeverity.HIGH:
        return 'bg-red-500';
      case ValidationSeverity.MEDIUM:
        return 'bg-yellow-500';
      case ValidationSeverity.LOW:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Check if all font issues are auto-fixable
  const allFontIssuesFixable = fontIssues.length > 0 && 
    fontIssues.every(issue => issue.autoFixable);

  // Check if all color issues are auto-fixable
  const allColorIssuesFixable = colorIssues.length > 0 && 
    colorIssues.every(issue => issue.autoFixable);

  return (
    <div className="space-y-4">
      {fontIssues.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 flex flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Text className="h-5 w-5" />
              <h3 className="font-medium">Font Issues ({fontIssues.length})</h3>
            </div>
            {allFontIssuesFixable && onFixAllFontIssues && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onFixAllFontIssues}
              >
                Fix All Font Issues
              </Button>
            )}
          </div>
          <Accordion type="multiple" className="w-full">
            {fontIssues.map((issue, index) => (
              <AccordionItem key={`font-${index}`} value={`font-${index}`}>
                <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                  <div className="flex flex-1 items-center justify-between pr-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("mr-2", getSeverityColor(issue.severity))}>
                        {issue.severity}
                      </Badge>
                      <span>{issue.type}</span>
                    </div>
                    {issue.page && (
                      <Badge variant="outline">Page {issue.page}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-1">
                  <div className="space-y-3">
                    <p className="text-sm">{issue.message}</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.autoFixable && (
                        <Button 
                          size="sm" 
                          onClick={() => onFixIssue(issue)}
                        >
                          {issue.fixDescription || "Fix Issue"}
                        </Button>
                      )}
                      {issue.page && onViewInDocument && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onViewInDocument(issue)}
                        >
                          View in Document
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {colorIssues.length > 0 && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 flex flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <h3 className="font-medium">Color Issues ({colorIssues.length})</h3>
            </div>
            {allColorIssuesFixable && onFixAllColorIssues && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onFixAllColorIssues}
              >
                Fix All Color Issues
              </Button>
            )}
          </div>
          <Accordion type="multiple" className="w-full">
            {colorIssues.map((issue, index) => (
              <AccordionItem key={`color-${index}`} value={`color-${index}`}>
                <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                  <div className="flex flex-1 items-center justify-between pr-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("mr-2", getSeverityColor(issue.severity))}>
                        {issue.severity}
                      </Badge>
                      <span>{issue.type}</span>
                    </div>
                    {issue.page && (
                      <Badge variant="outline">Page {issue.page}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3 pt-1">
                  <div className="space-y-3">
                    <p className="text-sm">{issue.message}</p>
                    <div className="flex flex-wrap gap-2">
                      {issue.autoFixable && (
                        <Button 
                          size="sm" 
                          onClick={() => onFixIssue(issue)}
                        >
                          {issue.fixDescription || "Fix Issue"}
                        </Button>
                      )}
                      {issue.page && onViewInDocument && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onViewInDocument(issue)}
                        >
                          View in Document
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {fontIssues.length === 0 && colorIssues.length === 0 && (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p>No font or color issues found in this document.</p>
        </div>
      )}
    </div>
  );
};
