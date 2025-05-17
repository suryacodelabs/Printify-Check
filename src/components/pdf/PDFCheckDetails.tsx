import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PDFIssue } from '@/types/pdf';
import { PREFLIGHT_CATEGORIES, AVAILABLE_FIXES, useChecks } from '@/hooks/useChecks';
import { Eye, Download, CheckCircle2, AlertTriangle, XCircle, Clock, FileText, Settings, Zap, Info } from 'lucide-react';
import PDFViewer from './PDFViewer';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface PDFCheckDetailsProps {
  checkId: string;
  fileName: string;
  status: string;
  issues: PDFIssue[];
  qualityScore?: number;
  file: string | null;
}

const PDFCheckDetails: React.FC<PDFCheckDetailsProps> = ({
  checkId,
  fileName,
  status,
  issues,
  qualityScore = 0,
  file
}) => {
  const { downloadFixedPdf, downloadPreflightReport, isLoading } = useChecks();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [applyingFixes, setApplyingFixes] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<PDFIssue | null>(null);
  
  // Count issues by category
  const issuesByCategory = issues.reduce((acc, issue) => {
    const category = issue.category || 'structural';
    if (!acc[category]) acc[category] = [];
    acc[category].push(issue);
    return acc;
  }, {} as Record<string, PDFIssue[]>);
  
  // Count issues by severity
  const criticalCount = issues.filter(issue => issue.severity === 'high').length;
  const warningCount = issues.filter(issue => issue.severity === 'medium').length;
  const infoCount = issues.filter(issue => issue.severity === 'low').length;
  
  const handleIssueSelect = (issueId: string) => {
    setSelectedIssues(prev => {
      if (prev.includes(issueId)) {
        return prev.filter(id => id !== issueId);
      } else {
        return [...prev, issueId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedIssues.length === issues.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(issues.map(issue => issue.id));
    }
  };
  
  const handleSelectAllAutoFixable = () => {
    const autoFixableIds = issues
      .filter(issue => issue.autoFixable)
      .map(issue => issue.id);
      
    setSelectedIssues(autoFixableIds);
  };
  
  const handleApplyFixes = async () => {
    if (selectedIssues.length === 0) {
      toast({
        title: "No Issues Selected",
        description: "Please select at least one issue to fix",
        variant: "default",
      });
      return;
    }
    
    setApplyingFixes(true);
    try {
      // Get the issue types for the selected issue IDs
      const selectedIssueTypes = issues
        .filter(issue => selectedIssues.includes(issue.id))
        .map(issue => issue.type);
        
      // Call the API to apply fixes
      const result = await fetch(`/api/preflight/fix/${checkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issues: selectedIssueTypes })
      }).then(res => res.json());
      
      if (result.success) {
        toast({
          title: "Fixes Applied",
          description: "Your PDF is being processed with the selected fixes",
          variant: "default",
        });
        
        // Reset selection
        setSelectedIssues([]);
      } else {
        throw new Error(result.message || "Failed to apply fixes");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to apply fixes: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setApplyingFixes(false);
    }
  };
  
  const handleDownloadReport = async () => {
    try {
      const reportUrl = await downloadPreflightReport(checkId);
      if (reportUrl) {
        const a = document.createElement('a');
        a.href = reportUrl;
        // Fix the type issue with fileName
        const fileNameStr = String(fileName);
        a.download = `${fileNameStr.replace('.pdf', '')}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download preflight report",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadFixed = async () => {
    try {
      const pdfUrl = await downloadFixedPdf(checkId);
      if (pdfUrl) {
        const a = document.createElement('a');
        a.href = pdfUrl;
        // Make sure fileName is treated as a string
        const fileNameStr = String(fileName);
        a.download = `${fileNameStr.replace('.pdf', '')}_fixed.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download fixed PDF",
        variant: "destructive",
      });
    }
  };
  
  const renderStatusBadge = () => {
    switch (status.toLowerCase()) {
      case 'complete':
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-700 border-blue-500">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };
  
  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Critical
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      case 'low':
      case 'info':
      default:
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-700 border-blue-500">
            <Info className="w-3 h-3 mr-1" />
            Info
          </Badge>
        );
    }
  };
  
  const getScoreColor = () => {
    if (qualityScore >= 90) return 'text-green-600';
    if (qualityScore >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderIssuesList = (categoryIssues: PDFIssue[]) => {
    return (
      <div className="space-y-2">
        {categoryIssues.map((issue) => (
          <div 
            key={issue.id} 
            className="flex items-start border rounded-md p-3 hover:bg-muted/50 cursor-pointer"
            onClick={() => setViewingIssue(issue)}
          >
            <div className="flex-shrink-0 mr-2 mt-0.5">
              <input 
                type="checkbox"
                className="h-4 w-4"
                checked={selectedIssues.includes(issue.id)}
                onChange={() => handleIssueSelect(issue.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">{issue.type}</div>
                <div className="flex items-center gap-2">
                  {issue.autoFixable && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500">
                      <Zap className="w-3 h-3 mr-1" />
                      Auto-fixable
                    </Badge>
                  )}
                  {renderSeverityBadge(issue.severity)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{issue.description}</p>
              {issue.page && (
                <div className="text-xs text-muted-foreground mt-1">Page {issue.page}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header with status and quality score */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{fileName}</h2>
          <div className="flex items-center gap-2 mt-1">
            {renderStatusBadge()}
            <span className="text-sm text-muted-foreground">
              {issues.length} issues found
            </span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">Quality Score</div>
          <div className={`text-3xl font-bold ${getScoreColor()}`}>
            {qualityScore}/100
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleDownloadReport}
          disabled={isLoading}
        >
          <FileText className="h-4 w-4" /> Preflight Report
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleDownloadFixed}
          disabled={isLoading || status.toLowerCase() !== 'complete'}
        >
          <Download className="h-4 w-4" /> Download Fixed PDF
        </Button>
      </div>
      
      {/* Progress bar for processing */}
      {(status === 'processing' || status === 'pending') && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Processing your PDF</span>
            <span>Please wait...</span>
          </div>
          <Progress value={status === 'processing' ? 45 : 5} className="h-2" />
        </div>
      )}
      
      {/* Tabs for different views */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Issues Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-red-600 flex items-center">
                      <XCircle className="w-4 h-4 mr-1" />
                      Critical
                    </span>
                    <span>{criticalCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Warnings
                    </span>
                    <span>{warningCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Info
                    </span>
                    <span>{infoCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PREFLIGHT_CATEGORIES).map(([key, value]) => {
                    const count = issuesByCategory[value]?.length || 0;
                    return (
                      <div key={key} className="flex justify-between items-center p-2 rounded-md border">
                        <span className="capitalize">{value.replace('_', ' ')}</span>
                        <Badge variant={count > 0 ? "destructive" : "outline"}>
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* PDF Preview */}
          {file ? (
            <PDFViewer file={file} issues={issues} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              PDF preview is not available
            </div>
          )}
          
          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('issues')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  View All Issues
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSelectAllAutoFixable}
                  disabled={!issues.some(i => i.autoFixable)}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Auto-Fix Issues
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownloadReport}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button 
                  className="w-full justify-start"
                  onClick={handleApplyFixes}
                  disabled={selectedIssues.length === 0 || status !== 'complete'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Apply Selected Fixes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {issues.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedIssues.length === issues.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAllAutoFixable}
                    disabled={!issues.some(i => i.autoFixable)}
                  >
                    Select Auto-fixable
                  </Button>
                </div>
                <Button 
                  disabled={selectedIssues.length === 0 || applyingFixes} 
                  size="sm"
                  onClick={handleApplyFixes}
                >
                  {applyingFixes ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      Apply Fixes ({selectedIssues.length})
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  {Object.entries(issuesByCategory).map(([category, categoryIssues]) => (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg capitalize">
                          {category.replace('_', ' ')} Issues ({categoryIssues.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {renderIssuesList(categoryIssues)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div>
                  <div className="sticky top-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Issue Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {viewingIssue ? (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">{viewingIssue.type}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {viewingIssue.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {renderSeverityBadge(viewingIssue.severity)}
                              {viewingIssue.page && (
                                <Badge variant="outline">Page {viewingIssue.page}</Badge>
                              )}
                            </div>
                            
                            {viewingIssue.autoFixable && (
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Auto-fixable Issue</AlertTitle>
                                <AlertDescription>
                                  This issue can be automatically fixed by our system.
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            <div className="flex justify-end">
                              <Button 
                                size="sm" 
                                disabled={!viewingIssue.autoFixable} 
                                onClick={() => {
                                  setSelectedIssues([viewingIssue.id]);
                                  handleApplyFixes();
                                }}
                              >
                                Fix Issue
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Eye className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>Select an issue to view details</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Selected Fixes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedIssues.length > 0 ? (
                          <div className="space-y-2">
                            {selectedIssues.map(id => {
                              const issue = issues.find(i => i.id === id);
                              return (
                                <div key={id} className="flex justify-between items-center">
                                  <span className="text-sm truncate max-w-[200px]">
                                    {issue?.type}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleIssueSelect(id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                            
                            <Separator className="my-2" />
                            
                            <Button 
                              className="w-full"
                              onClick={handleApplyFixes}
                              disabled={applyingFixes}
                            >
                              {applyingFixes ? (
                                <>
                                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>Apply Selected Fixes</>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>No fixes selected</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <h3 className="text-xl font-bold mb-2">No Issues Found</h3>
              <p className="text-muted-foreground">
                Your PDF has no issues and is ready for printing.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">PDF Preview</CardTitle>
              <CardDescription>
                Your uploaded PDF file with issues highlighted
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              {file ? (
                <PDFViewer file={file} issues={issues} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  PDF preview is not available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PDFCheckDetails;
