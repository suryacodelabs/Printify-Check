
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { pdfService } from '@/services/apiService';

// Define types
export interface PDFIssue {
  id: string;
  page: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  message?: string;
  fix_suggestion?: string;
  status: 'open' | 'fixed' | 'ignored';
  autoFixable: boolean;
  category: string;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PDFCheck {
  id: string;
  file_name: string;
  file_size: number;
  user_id: string;
  project_id?: string;
  issues_count: number;
  created_at: string;
  updated_at: string;
  quality_score?: number;
  status: 'pending' | 'processing' | 'complete' | 'completed' | 'failed';
}

export interface PDFCheckDetail {
  checkId: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  status: string;
  issues: PDFIssue[];
  qualityScore?: number;
}

// Categories of PDF preflight checks
export const PREFLIGHT_CATEGORIES = {
  STRUCTURAL: 'structural',
  FONTS: 'fonts',
  COLOR: 'color',
  IMAGE: 'image',
  COMPLIANCE: 'compliance',
  SECURITY: 'security',
  PRINT_PRODUCTION: 'print_production'
};

// Define available fixes
export const AVAILABLE_FIXES = {
  // Structural fixes
  SYNTAX_REPAIR: 'syntax_repair',
  LINEARIZE: 'linearize',
  REMOVE_EMBEDDED_FILES: 'remove_embedded_files',
  FIX_PAGE_BOX: 'fix_page_box',
  OPTIMIZE_STREAM: 'optimize_stream',
  
  // Font fixes
  EMBED_FONTS: 'embed_fonts',
  SUBSET_FONTS: 'subset_fonts',
  FIX_ENCODING: 'fix_encoding',
  REPLACE_TYPE3_FONTS: 'replace_type3_fonts',
  
  // Color fixes
  CONVERT_RGB_TO_CMYK: 'convert_rgb_to_cmyk',
  APPLY_ICC_PROFILES: 'apply_icc_profiles',
  FIX_OVERPRINT: 'fix_overprint',
  FLATTEN_TRANSPARENCY: 'flatten_transparency',
  NORMALIZE_SPOT_COLORS: 'normalize_spot_colors',
  
  // Image fixes
  DOWNSCALE_TO_300DPI: 'downscale_to_300dpi',
  RECOMPRESS_IMAGES: 'recompress_images',
  FIX_IMAGE_TRANSPARENCY: 'fix_image_transparency',
  OPTIMIZE_IMAGE_SIZE: 'optimize_image_size',
  
  // Compliance fixes
  CONVERT_TO_PDFA: 'convert_to_pdfa',
  ADJUST_FOR_PDFX: 'adjust_for_pdfx',
  ENHANCE_PDFUA: 'enhance_pdfua',
  ENSURE_WCAG21: 'ensure_wcag21',
  
  // Security fixes
  REMOVE_METADATA_JAVASCRIPT: 'remove_metadata_javascript',
  REDACT_CONTENT: 'redact_content',
  APPLY_ENCRYPTION: 'apply_encryption'
};

export const useChecks = () => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [checks, setChecks] = useState<PDFCheck[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all checks with pagination
  const { data, isLoading: isLoadingChecks, error: checksError, refetch: refetchChecks } = useQuery({
    queryKey: ['pdf-checks', user?.id, pagination.page, pagination.pageSize],
    queryFn: async () => {
      if (!user?.id) return { data: [], pagination: { totalItems: 0, totalPages: 0 } };
      
      const { data, error, count } = await supabase
        .from('pdf_checks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(
          pagination.page * pagination.pageSize,
          (pagination.page + 1) * pagination.pageSize - 1
        );
      
      if (error) throw error;
      
      // Update pagination state
      if (count !== null) {
        setPagination(prev => ({
          ...prev,
          totalItems: count,
          totalPages: Math.ceil(count / pagination.pageSize)
        }));
        setTotalItems(count);
        setTotalPages(Math.ceil(count / pagination.pageSize));
      }
      
      // Ensure status values are compatible with our type
      const formattedChecks = (data as any[]).map(check => ({
        ...check,
        status: check.status === 'completed' ? 'complete' : check.status
      })) as PDFCheck[];
      
      setChecks(formattedChecks);
      
      return {
        data: formattedChecks,
        pagination: {
          totalItems: count || 0,
          totalPages: count ? Math.ceil(count / pagination.pageSize) : 0
        }
      };
    },
    enabled: !!user,
  });

  // Change page
  const changePage = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Load checks with filters
  const loadChecks = async (page = 0, pageSize = 10, sortBy = 'created_at', sortDir = 'desc') => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('pdf_checks')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order(sortBy, { ascending: sortDir === 'asc' })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) throw error;
      
      // Update pagination
      if (count !== null) {
        setPagination({
          page,
          pageSize,
          totalItems: count,
          totalPages: Math.ceil(count / pageSize)
        });
        setTotalItems(count);
        setTotalPages(Math.ceil(count / pageSize));
      }
      
      const formattedChecks = (data as any[]).map(check => ({
        ...check,
        status: check.status === 'completed' ? 'complete' : check.status
      })) as PDFCheck[];
      
      setChecks(formattedChecks);
      
      return formattedChecks;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load checks: ${err.message}`,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get check details by ID
  const getCheckById = async (id: string): Promise<PDFCheckDetail | null> => {
    setIsLoading(true);
    try {
      // First get the basic check info from Supabase
      const { data: checkData, error: checkError } = await supabase
        .from('pdf_checks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (checkError) throw checkError;
      
      if (!checkData) {
        throw new Error("Check not found");
      }
      
      // Now get detailed issues from the API
      let issues: PDFIssue[] = [];
      try {
        const response = await axios.get(`/api/preflight/results/${id}`);
        if (response.data && response.data.issues) {
          issues = response.data.issues.map((issue: any) => ({
            id: issue.id || `${Math.random()}`,
            page: issue.page || 1,
            type: issue.type || issue.title || "Unknown issue",
            severity: mapSeverity(issue.severity),
            description: issue.message || issue.description || "",
            status: "open",
            autoFixable: issue.autoFixable || false,
            category: mapCategory(issue.type)
          }));
        }
      } catch (apiErr) {
        console.error("API error, using database fallback:", apiErr);
        // Fallback to any stored issues in the database
      }
      
      return {
        checkId: checkData.id,
        fileName: checkData.file_name,
        fileSize: checkData.file_size,
        createdAt: checkData.created_at,
        status: checkData.status,
        issues: issues,
        qualityScore: checkData.quality_score
      };
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load check details: ${err.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for getCheckById to maintain compatibility with existing components
  const fetchCheckDetails = async (id: string): Promise<PDFCheckDetail | null> => {
    return await getCheckById(id);
  };

  const mapSeverity = (severity: string): 'low' | 'medium' | 'high' | 'critical' => {
    if (!severity) return 'low';
    const lower = severity.toLowerCase();
    if (lower === 'critical' || lower === 'high') return 'high';
    if (lower === 'medium' || lower === 'warning') return 'medium';
    return 'low';
  };

  const mapCategory = (type: string): string => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType.includes('font') || lowerType.includes('text')) {
      return PREFLIGHT_CATEGORIES.FONTS;
    } else if (lowerType.includes('color') || lowerType.includes('rgb') || lowerType.includes('cmyk')) {
      return PREFLIGHT_CATEGORIES.COLOR;
    } else if (lowerType.includes('image') || lowerType.includes('dpi') || lowerType.includes('resolution')) {
      return PREFLIGHT_CATEGORIES.IMAGE;
    } else if (lowerType.includes('pdf/a') || lowerType.includes('compliance') || lowerType.includes('wcag')) {
      return PREFLIGHT_CATEGORIES.COMPLIANCE;
    } else if (lowerType.includes('security') || lowerType.includes('encrypt') || lowerType.includes('password')) {
      return PREFLIGHT_CATEGORIES.SECURITY;
    } else if (lowerType.includes('bleed') || lowerType.includes('trim') || lowerType.includes('print')) {
      return PREFLIGHT_CATEGORIES.PRINT_PRODUCTION;
    } else {
      return PREFLIGHT_CATEGORIES.STRUCTURAL;
    }
  };

  // Create new check from uploaded file
  const createCheck = async (file: File): Promise<PDFCheck | null> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to check your PDFs",
        variant: "destructive",
      });
      return null;
    }
    
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      // First, create a record in the database
      const { data: dbCheck, error: dbError } = await supabase
        .from('pdf_checks')
        .insert({
          file_name: file.name,
          file_size: file.size,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      // Then, upload the file to storage
      const filePath = `${user.id}/checks/${dbCheck.id}/original.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('pdf_files')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          },
          cacheControl: '3600',
          contentType: file.type
        });
      
      if (uploadError) throw uploadError;
      
      // Finally, start the preflight process via API
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);
        
        const response = await axios.post('/api/preflight/check', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });
        
        // Update the check status based on API response
        if (response.data && response.data.jobId) {
          await supabase
            .from('pdf_checks')
            .update({
              status: 'processing'
            })
            .eq('id', dbCheck.id);
        }
        
        // Invalidate cache to refresh queries
        queryClient.invalidateQueries({ queryKey: ['pdf-checks'] });
        
        return {
          ...dbCheck,
          status: 'processing'
        };
      } catch (apiError: any) {
        console.error("API error:", apiError);
        
        // Update db status to failed if API call fails
        await supabase
          .from('pdf_checks')
          .update({
            status: 'failed'
          })
          .eq('id', dbCheck.id);
        
        throw new Error("Failed to process PDF: " + (apiError.message || "Unknown error"));
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Download preflight report
  const downloadPreflightReport = async (checkId: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const result = await pdfService.downloadPreflightReport(checkId);
      return result;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to download report: ${err.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Download fixed PDF
  const downloadFixedPdf = async (checkId: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const result = await pdfService.getFixedPdf(checkId);
      return result;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to download fixed PDF",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadChecks,
    getCheckById,
    fetchCheckDetails,
    createCheck,
    downloadPreflightReport,
    downloadFixedPdf,
    checks,
    isLoading,
    error: error || (checksError ? (checksError as Error).message : null),
    totalItems,
    totalPages,
    changePage,
    pagination,
    uploadProgress,
    refetchChecks
  };
};
