import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pdfService } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, CheckCircle, FileCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PDFPreflightReport from '@/components/reports/PDFPreflightReport';
import PDFViewer from '@/components/pdf/PDFViewer';

interface PreflightStepProps {
  file: File | null;
  onPreflightComplete: (results: any[]) => void;
  isProOrTeam?: boolean;
}

interface PreflightIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  page?: number;
  canAutoFix: boolean;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const PreflightStep: React.FC<PreflightStepProps> = ({ file, onPreflightComplete, isProOrTeam }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processId, setProcessId] = useState<string | null>(null);
  const [issues, setIssues] = useState<PreflightIssue[]>([]);
  const [qualityScore, setQualityScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [prefightCompleted, setPrefightCompleted] = useState(false);
  
  // Auto-start preflight when component mounts if file is available
  useEffect(() => {
    if (file && !isProcessing && !prefightCompleted) {
      startPreflight();
    }
  }, [file]);
  
  // Poll for process status if we have an active processId
  useEffect(() => {
    if (!processId || !isProcessing) return;
    
    const interval = setInterval(async () => {
      try {
        const status = await pdfService.getProcessStatus(processId);
        
        if (status.progress) {
          setProgress(status.progress);
        }
        
        if (status.status === 'completed') {
          clearInterval(interval);
          
          // Get the results
          if (status.resultId) {
            const results = await pdfService.getCheckResults(status.resultId);
            handlePreflightResults(results);
          } else {
            throw new Error("Missing result ID in completed preflight");
          }
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setIsProcessing(false);
          setError(status.error || "Preflight check failed");
          
          toast({
            title: "Preflight Failed",
            description: status.error || "Failed to check your PDF.",
            variant: "destructive",
          });
        }
        // Otherwise keep polling - status is 'processing'
      } catch (err: any) {
        console.error("Error checking preflight status:", err);
        // Don't stop polling on error, just log it
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, [processId, isProcessing]);
  
  const startPreflight = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      toast({
        title: "Preflight Check",
        description: "Starting preflight check on your PDF...",
      });
      
      // Prepare parameters
      const params = {
        userId: user?.id,
        checkResolution: true,
        checkBleed: true,
        checkColorSpace: true,
        checkFonts: true,
        checkTransparency: true,
        checkPdfVersion: true,
        checkAnnotations: true,
        checkOverprint: true,
        checkInkDensity: true,
        checkLayers: true,
        checkMetadata: true,
        minDpi: 300,
        minBleedMm: 3,
        requireCmyk: true
      };
      
      // Begin preflight
      const result = await pdfService.uploadForPreflightCheck(file, params);
      
      if (result.processId) {
        setProcessId(result.processId);
        // Polling will handle completion
      } else if (result.status === 'completed') {
        // Immediate completion (unusual but handle it)
        handlePreflightResults(result);
      } else {
        throw new Error("Invalid response from preflight service");
      }
    } catch (error: any) {
      console.error("Preflight error:", error);
      setIsProcessing(false);
      setError(error.message || "Failed to check PDF");
      
      toast({
        title: "Preflight Failed",
        description: error.message || "Failed to check your PDF.",
        variant: "destructive",
      });
    }
  };
  
  const handlePreflightResults = (results: any) => {
    setIsProcessing(false);
    setPrefightCompleted(true);
    
    const { issues = [], quality_score = 0, annotations = [] } = results;
    
    // Transform API issues into the format our components expect
    const transformedIssues: PreflightIssue[] = issues.map((issue: any) => ({
      id: issue.id || Math.random().toString(36).substring(2),
      severity: mapSeverity(issue.severity),
      title: issue.title || issue.type,
      description: issue.message || issue.description,
      page: issue.page,
      canAutoFix: issue.autoFixable || false,
      location: issue.location
    }));
    
    setIssues(transformedIssues);
    setQualityScore(quality_score);
    setAnnotations(annotations);
    
    // Notify parent component
    onPreflightComplete(transformedIssues);
    
    // Show toast with results summary
    const criticalCount = transformedIssues.filter(i => i.severity === 'critical').length;
    const warningCount = transformedIssues.filter(i => i.severity === 'warning').length;
    
    if (criticalCount === 0 && warningCount === 0) {
      toast({
        title: "Preflight Complete",
        description: "Your PDF passed all checks and is ready for print!",
      });
    } else {
      toast({
        title: "Preflight Complete",
        description: `Found ${criticalCount} critical issues and ${warningCount} warnings in your PDF.`,
        variant: criticalCount > 0 ? "destructive" : "default",
      });
    }
  };
  
  const mapSeverity = (severity: string): 'critical' | 'warning' | 'info' => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'critical';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'info';
    }
  };
  
  const handleCancelPreflight = async () => {
    if (processId) {
      try {
        await pdfService.cancelProcess(processId);
        setIsProcessing(false);
        setProcessId(null);
        toast({
          title: "Preflight Canceled",
          description: "Preflight check has been canceled.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to cancel preflight process.",
          variant: "destructive",
        });
      }
    }
  };

  if (!file) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No file uploaded. Please go back and upload a file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={startPreflight}>
              Retry
            </Button>
          </div>
        </Alert>
      )}
      
      {isProcessing ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div>
                <h3 className="text-lg font-medium mb-1">Running Preflight Checks</h3>
                <p className="text-muted-foreground mb-4">
                  We're analyzing your PDF for print readiness. This may take a few moments.
                </p>
                
                <div className="w-full max-w-md mx-auto">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {progress < 100 ? `${Math.round(progress)}% complete` : "Processing results..."}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={handleCancelPreflight}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            {prefightCompleted ? (
              <PDFPreflightReport 
                issues={issues} 
                qualityScore={qualityScore}
                fileName={file.name}
              />
            ) : (
              <Card className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <FileCheck className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-medium">Start Preflight Check</h3>
                </div>
                
                <p className="text-center text-muted-foreground my-4">
                  Check your PDF for print readiness and identify any issues.
                </p>
                
                <div className="flex justify-center">
                  <Button onClick={startPreflight}>
                    Start Preflight
                  </Button>
                </div>
              </Card>
            )}
          </div>
          
          <div>
            <Card className="p-4 h-full">
              <PDFViewer file={file} annotations={annotations} />
            </Card>
          </div>
        </div>
      )}
      
      {prefightCompleted && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {issues.length === 0 ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">No issues found in your PDF!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium">
                  Found {issues.length} issue{issues.length !== 1 ? 's' : ''} in your PDF
                </span>
              </>
            )}
          </div>
          
          <Button 
            onClick={() => onPreflightComplete(issues)}
            variant={issues.length === 0 ? "default" : "outline"}
          >
            {issues.length === 0 ? "Continue" : "View Issues & Fixes"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PreflightStep;
