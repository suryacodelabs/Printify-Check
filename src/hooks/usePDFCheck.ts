
import { useState, useEffect } from 'react';
import { pdfService } from '@/services/apiService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PDFIssue {
  id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  page?: number;
  canAutoFix: boolean;
  fixDescription?: string;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PDFCheck {
  id: string;
  fileName: string;
  fileSize: number;
  qualityScore: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  issuesCount: number;
  fixedIssuesCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  issues: PDFIssue[];
}

export function usePDFCheck(checkId?: string) {
  const [check, setCheck] = useState<PDFCheck | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!checkId) return;
    
    const fetchCheck = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try the API to get detailed check results
        try {
          const apiResult = await pdfService.getCheckResults(checkId);
          
          if (apiResult) {
            // Map API result to our interface
            const mappedCheck: PDFCheck = {
              id: apiResult.id,
              fileName: apiResult.fileName || apiResult.file_name,
              fileSize: apiResult.fileSize || apiResult.file_size || 0,
              qualityScore: apiResult.qualityScore || apiResult.quality_score || 0,
              status: mapStatus(apiResult.status || 'completed'),
              issuesCount: apiResult.issuesCount || apiResult.issues_count || (apiResult.issues?.length || 0),
              fixedIssuesCount: apiResult.fixedIssuesCount || apiResult.issues_count || 0,
              createdAt: new Date(apiResult.createdAt || apiResult.created_at),
              updatedAt: new Date(apiResult.updatedAt || apiResult.updated_at),
              userId: apiResult.userId || apiResult.user_id,
              issues: mapIssues(apiResult.issues || [])
            };
            
            setCheck(mappedCheck);
            return;
          }
        } catch (apiError) {
          console.error("API error, falling back to database:", apiError);
        }
        
        // If API call fails, fallback to database query
        const { data, error: dbError } = await supabase
          .from('pdf_checks')
          .select('*')
          .eq('id', checkId)
          .single();
        
        if (dbError) throw dbError;
        
        if (data) {
          const mappedCheck: PDFCheck = {
            id: data.id,
            fileName: data.file_name,
            fileSize: data.file_size || 0,
            qualityScore: data.quality_score || 0,
            status: mapStatus(data.status || 'completed'),
            issuesCount: data.issues_count || 0,
            fixedIssuesCount: data.issues_count || 0,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            userId: data.user_id,
            issues: [] // Database doesn't store issues directly
          };
          
          setCheck(mappedCheck);
        } else {
          throw new Error("Check not found");
        }
      } catch (err: any) {
        console.error("Error fetching PDF check:", err);
        setError(err);
        
        toast({
          title: "Error",
          description: "Failed to load PDF check details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCheck();
  }, [checkId]);
  
  // Map API issues to our interface
  const mapIssues = (apiIssues: any[]): PDFIssue[] => {
    return apiIssues.map(issue => ({
      id: issue.id || Math.random().toString(36).substr(2, 9),
      type: issue.type || '',
      severity: mapSeverity(issue.severity),
      title: issue.title || issue.type || 'Unknown Issue',
      message: issue.message || issue.description || '',
      page: issue.page,
      canAutoFix: issue.autoFixable || issue.canAutoFix || false,
      fixDescription: issue.fixDescription || '',
      location: issue.location
    }));
  };
  
  // Map API severity to our enum
  const mapSeverity = (severity?: string): 'critical' | 'warning' | 'info' => {
    if (!severity) return 'info';
    
    const lower = severity.toLowerCase();
    if (lower === 'high' || lower === 'critical') return 'critical';
    if (lower === 'medium' || lower === 'warning') return 'warning';
    return 'info';
  };

  // Map API status to our enum
  const mapStatus = (status?: string): 'pending' | 'processing' | 'completed' | 'failed' => {
    if (!status) return 'pending';
    
    const lower = status.toLowerCase();
    if (lower === 'pending') return 'pending';
    if (lower === 'processing') return 'processing';
    if (lower === 'failed') return 'failed';
    return 'completed';
  };
  
  // Function to refresh the check data
  const refreshCheck = async () => {
    if (!checkId) return;
    
    try {
      setLoading(true);
      
      // Try API first
      try {
        const apiResult = await pdfService.getCheckResults(checkId);
        
        if (apiResult) {
          // Map API result to our interface
          const mappedCheck: PDFCheck = {
            id: apiResult.id,
            fileName: apiResult.fileName || apiResult.file_name,
            fileSize: apiResult.fileSize || apiResult.file_size || 0,
            qualityScore: apiResult.qualityScore || apiResult.quality_score || 0,
            status: mapStatus(apiResult.status || 'completed'),
            issuesCount: apiResult.issuesCount || apiResult.issues_count || (apiResult.issues?.length || 0),
            fixedIssuesCount: apiResult.fixedIssuesCount || apiResult.issues_count || 0,
            createdAt: new Date(apiResult.createdAt || apiResult.created_at),
            updatedAt: new Date(apiResult.updatedAt || apiResult.updated_at),
            userId: apiResult.userId || apiResult.user_id,
            issues: mapIssues(apiResult.issues || [])
          };
          
          setCheck(mappedCheck);
          return;
        }
      } catch (apiError) {
        console.error("API error on refresh, falling back to database:", apiError);
      }
      
      // Fallback to database
      const { data, error: dbError } = await supabase
        .from('pdf_checks')
        .select('*')
        .eq('id', checkId)
        .single();
      
      if (dbError) throw dbError;
      
      if (data) {
        const mappedCheck: PDFCheck = {
          id: data.id,
          fileName: data.file_name,
          fileSize: data.file_size || 0,
          qualityScore: data.quality_score || 0,
          status: mapStatus(data.status || 'completed'),
          issuesCount: data.issues_count || 0,
          fixedIssuesCount: data.issues_count || 0,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          userId: data.user_id,
          issues: check?.issues || [] // Keep existing issues if available
        };
        
        setCheck(mappedCheck);
      }
    } catch (err: any) {
      console.error("Error refreshing check:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    check,
    loading,
    error,
    refreshCheck
  };
}
