
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Share2, FileCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { pdfService } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useChecks } from '@/hooks/useChecks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface SuccessPageProps {
  startNewCheck?: () => void;
  checkId?: string;
}

interface CheckResult {
  id: string;
  file_name: string;
  file_size: number;
  quality_score: number;
  issues_count: number;
  fixed_issues_count?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({
  startNewCheck,
  checkId: propCheckId
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: paramCheckId } = useParams();
  const { getCheckById } = useChecks();
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadInProgress, setDownloadInProgress] = useState<string | null>(null);
  
  // Use the checkId from props, or from URL params
  const checkId = propCheckId || paramCheckId;
  
  useEffect(() => {
    if (!checkId) {
      setError("No check ID provided");
      setLoading(false);
      return;
    }
    
    const fetchCheckResult = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get the check from our hook first
        const result = await getCheckById(checkId);
        
        if (!result) {
          // If not found in our hook, try direct DB query
          const { data, error } = await supabase
            .from('pdf_checks')
            .select('*')
            .eq('id', checkId)
            .single();
            
          if (error) throw error;
          
          setCheckResult(data as CheckResult);
        } else {
          setCheckResult(result as unknown as CheckResult);
        }
      } catch (err: any) {
        console.error("Error fetching check results:", err);
        setError(err.message || "Failed to fetch check results");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheckResult();
  }, [checkId, getCheckById]);
  
  const handleDownload = async () => {
    if (!checkId) return;
    
    try {
      setDownloadInProgress('pdf');
      toast({
        title: "Preparing download",
        description: "Your file is being prepared for download...",
      });
      
      const downloadUrl = await pdfService.getFixedPdf(checkId);
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `printready_${checkResult?.file_name || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your print-ready PDF is downloading.",
      });
    } catch (err: any) {
      toast({
        title: "Download failed",
        description: err.message || "Failed to download the PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadInProgress(null);
    }
  };
  
  const handleDownloadReport = async () => {
    if (!checkId) return;
    
    try {
      setDownloadInProgress('report');
      toast({
        title: "Preparing report",
        description: "Your preflight report is being prepared...",
      });
      
      const reportUrl = await pdfService.downloadPreflightReport(checkId);
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = reportUrl;
      a.download = `preflight_report_${checkResult?.file_name || 'document'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Report downloaded",
        description: "Your preflight report has been downloaded.",
      });
    } catch (err: any) {
      toast({
        title: "Report download failed",
        description: err.message || "Failed to download the report",
        variant: "destructive",
      });
    } finally {
      setDownloadInProgress(null);
    }
  };
  
  const handleShareLink = () => {
    if (!checkId) return;
    
    const shareUrl = `${window.location.origin}/share/${checkId}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Share link copied to clipboard!",
          });
        })
        .catch(err => {
          console.error("Failed to copy: ", err);
          toast({
            title: "Copy failed",
            description: "Failed to copy link to clipboard",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard!",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Please copy the link manually",
          variant: "destructive",
        });
      }
      
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-xl font-medium">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Results</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">PDF Ready for Print!</h1>
        <p className="text-xl text-muted-foreground">
          Your document has been successfully processed and is now print-ready.
        </p>
        
        {checkResult?.fixed_issues_count ? (
          <p className="text-green-600 dark:text-green-400 mt-1 font-medium">
            {checkResult.fixed_issues_count} issues automatically fixed
          </p>
        ) : checkResult?.issues_count === 0 ? (
          <p className="text-green-600 dark:text-green-400 mt-1 font-medium">
            No issues found - your PDF was already print-ready!
          </p>
        ) : (
          <p className="text-amber-600 dark:text-amber-400 mt-1 font-medium">
            {checkResult?.issues_count || 0} issues identified
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Download Options</h2>
          
          <div className="space-y-4">
            <Button 
              className="w-full justify-start gap-2" 
              onClick={handleDownload}
              disabled={downloadInProgress === 'pdf'}
            >
              {downloadInProgress === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Print-Ready PDF
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleDownloadReport}
              disabled={downloadInProgress === 'report'}
            >
              {downloadInProgress === 'report' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              Download Preflight Report
            </Button>
          </div>
        </div>
        
        <div className="bg-card border shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
          
          <div className="space-y-4">
            <Button 
              variant="secondary" 
              className="w-full justify-start gap-2"
              onClick={() => startNewCheck ? startNewCheck() : navigate('/')}
            >
              <ArrowRight className="h-4 w-4" />
              Start New Preflight Check
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleShareLink}
            >
              <Share2 className="h-4 w-4" />
              Share PDF Link
            </Button>
          </div>
        </div>
      </div>
      
      {!user && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
          <h3 className="font-medium mb-2">Save your preflight history</h3>
          <p className="text-muted-foreground mb-4">
            Create a free account to save this PDF and access your preflight history anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/auth')}>
              Create Free Account
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      )}
      
      {checkResult?.quality_score !== undefined && (
        <div className="mt-8">
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              PDF Quality Score
            </span>
            <div className={`text-xl font-bold ${
              checkResult.quality_score >= 80 ? 'text-green-600 dark:text-green-400' : 
              checkResult.quality_score >= 60 ? 'text-amber-600 dark:text-amber-400' : 
              'text-red-600 dark:text-red-400'
            }`}>
              {checkResult.quality_score}/100
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          File: {checkResult?.file_name} • Size: {checkResult?.file_size ? Math.round(checkResult.file_size / 1024) : 0} KB • 
          Processed: {checkResult?.updated_at ? new Date(checkResult.updated_at).toLocaleString() : ''}
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
