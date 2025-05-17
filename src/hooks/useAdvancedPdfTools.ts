
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { advancedPdfService } from '@/services/advancedPdfService';
import { useToast } from '@/hooks/use-toast';

interface AdvancedPdfJob {
  jobId: string;
  status: string;
  progress?: number;
  resultId?: string;
}

export type ProcessQuality = 'low' | 'medium' | 'high';
export type PdfALevel = '1a' | '1b' | '2a' | '2b' | '3a' | '3b';
export type PdfXStandard = '1a' | '3' | '4';

/**
 * Hook for working with advanced PDF manipulation features
 */
export const useAdvancedPdfTools = () => {
  const { toast } = useToast();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [resultJobId, setResultJobId] = useState<string | null>(null);
  
  // Linearization
  const linearizePdfMutation = useMutation({
    mutationFn: async (file: File) => {
      return advancedPdfService.linearizePdf(file);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "Web Optimization Started",
        description: "PDF linearization process has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Web Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to start optimization process.",
        variant: "destructive",
      });
    },
  });
  
  // Font Embedding
  const embedFontsMutation = useMutation({
    mutationFn: async (file: File) => {
      return advancedPdfService.embedFonts(file);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "Font Embedding Started",
        description: "PDF font embedding process has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Font Embedding Failed",
        description: error instanceof Error ? error.message : "Failed to start font embedding process.",
        variant: "destructive",
      });
    },
  });
  
  // RGB to CMYK conversion
  const convertToCmykMutation = useMutation({
    mutationFn: async ({ file, preserveBlack = true }: { file: File; preserveBlack?: boolean }) => {
      return advancedPdfService.convertToCmyk(file, preserveBlack);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "Color Conversion Started",
        description: "RGB to CMYK conversion has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Color Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to start color conversion process.",
        variant: "destructive",
      });
    },
  });
  
  // ICC Profile application
  const applyIccProfileMutation = useMutation({
    mutationFn: async ({ file, profileName = 'sRGB' }: { file: File; profileName?: string }) => {
      return advancedPdfService.applyIccProfile(file, profileName);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "ICC Profile Application Started",
        description: "ICC profile application has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "ICC Profile Application Failed",
        description: error instanceof Error ? error.message : "Failed to start ICC profile application.",
        variant: "destructive",
      });
    },
  });
  
  // Transparency flattening
  const flattenTransparencyMutation = useMutation({
    mutationFn: async ({ file, quality = 'high' }: { file: File; quality?: ProcessQuality }) => {
      return advancedPdfService.flattenTransparency(file, quality);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "Transparency Flattening Started",
        description: "Transparency flattening has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Transparency Flattening Failed",
        description: error instanceof Error ? error.message : "Failed to start transparency flattening.",
        variant: "destructive",
      });
    },
  });
  
  // PDF/A conversion
  const convertToPdfAMutation = useMutation({
    mutationFn: async ({ file, conformanceLevel = '1b' }: { file: File; conformanceLevel?: string }) => {
      return advancedPdfService.convertToPdfA(file, conformanceLevel);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "PDF/A Conversion Started",
        description: "PDF/A conversion has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "PDF/A Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to start PDF/A conversion.",
        variant: "destructive",
      });
    },
  });
  
  // PDF/X conversion
  const convertToPdfXMutation = useMutation({
    mutationFn: async ({ file, standard = '3' }: { file: File; standard?: string }) => {
      return advancedPdfService.convertToPdfX(file, standard);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "PDF/X Conversion Started",
        description: "PDF/X conversion has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "PDF/X Conversion Failed",
        description: error instanceof Error ? error.message : "Failed to start PDF/X conversion.",
        variant: "destructive",
      });
    },
  });
  
  // Add bleed
  const addBleedMutation = useMutation({
    mutationFn: async ({ file, bleedMargin = 9 }: { file: File; bleedMargin?: number }) => {
      return advancedPdfService.addBleed(file, bleedMargin);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "Adding Bleed Started",
        description: "Adding bleed to PDF has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Adding Bleed Failed",
        description: error instanceof Error ? error.message : "Failed to start adding bleed.",
        variant: "destructive",
      });
    },
  });
  
  // Print ready preparation
  const preparePrintReadyMutation = useMutation({
    mutationFn: async ({ 
      file, 
      options = { addBleed: true, convertToCmyk: true, flattenTransparency: true } 
    }: { 
      file: File; 
      options?: { addBleed: boolean; convertToCmyk: boolean; flattenTransparency: boolean } 
    }) => {
      return advancedPdfService.preparePrintReadyPdf(file, options);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "Print Preparation Started",
        description: "Print-ready PDF preparation has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Print Preparation Failed",
        description: error instanceof Error ? error.message : "Failed to start print preparation.",
        variant: "destructive",
      });
    },
  });
  
  // Generate preflight report
  const generatePreflightReportMutation = useMutation({
    mutationFn: async ({ 
      file, 
      issues, 
      qualityScore = 100 
    }: { 
      file: File; 
      issues: any[]; 
      qualityScore?: number 
    }) => {
      return advancedPdfService.generatePreflightReport(file, issues, qualityScore);
    },
    onSuccess: (data: AdvancedPdfJob) => {
      setActiveJobId(data.jobId);
      toast({
        title: "Report Generation Started",
        description: "Preflight report generation has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Failed to start report generation.",
        variant: "destructive",
      });
    },
  });
  
  // Job status polling
  const jobStatusQuery = useQuery({
    queryKey: ['advancedPdfJobStatus', activeJobId],
    queryFn: async () => {
      if (!activeJobId) return null;
      return advancedPdfService.getJobStatus(activeJobId);
    },
    enabled: !!activeJobId,
    refetchInterval: (query) => {
      // Stop polling when job is complete
      const data = query.state.data as AdvancedPdfJob | null;
      if (!data) return 2000; // Default polling interval
      
      if (data.status === 'completed' || data.status === 'error') {
        if (data.resultId) {
          setResultJobId(data.resultId);
        }
        // Show notification on completion
        if (data.status === 'completed') {
          toast({
            title: "Process Completed",
            description: "PDF processing has been completed successfully.",
          });
        } else {
          toast({
            title: "Process Failed",
            description: "PDF processing encountered an error.",
            variant: "destructive",
          });
        }
        return false; // Stop polling
      }
      
      return 2000; // Continue polling every 2 seconds
    }
  });
  
  // Download processed file
  const downloadProcessedFile = async (filename = 'processed.pdf'): Promise<string | null> => {
    if (!resultJobId) return null;
    
    try {
      const downloadUrl = await advancedPdfService.downloadProcessedFile(resultJobId);
      
      // Create a download link
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your processed PDF is downloading.",
      });
      
      return downloadUrl;
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download the processed file.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  // Reset state
  const resetState = () => {
    setActiveJobId(null);
    setResultJobId(null);
  };
  
  return {
    // Linearization
    linearizePdf: linearizePdfMutation.mutate,
    isLinearizing: linearizePdfMutation.isPending,
    
    // Font Embedding
    embedFonts: embedFontsMutation.mutate,
    isEmbeddingFonts: embedFontsMutation.isPending,
    
    // RGB to CMYK conversion
    convertToCmyk: convertToCmykMutation.mutate,
    isConvertingToCmyk: convertToCmykMutation.isPending,
    
    // ICC Profile application
    applyIccProfile: applyIccProfileMutation.mutate,
    isApplyingIccProfile: applyIccProfileMutation.isPending,
    
    // Transparency flattening
    flattenTransparency: flattenTransparencyMutation.mutate,
    isFlatteningTransparency: flattenTransparencyMutation.isPending,
    
    // PDF/A conversion
    convertToPdfA: convertToPdfAMutation.mutate,
    isConvertingToPdfA: convertToPdfAMutation.isPending,
    
    // PDF/X conversion
    convertToPdfX: convertToPdfXMutation.mutate,
    isConvertingToPdfX: convertToPdfXMutation.isPending,
    
    // Add bleed
    addBleed: addBleedMutation.mutate,
    isAddingBleed: addBleedMutation.isPending,
    
    // Print ready preparation
    preparePrintReady: preparePrintReadyMutation.mutate,
    isPreparingPrintReady: preparePrintReadyMutation.isPending,
    
    // Generate preflight report
    generatePreflightReport: generatePreflightReportMutation.mutate,
    isGeneratingPreflightReport: generatePreflightReportMutation.isPending,
    
    // Job status
    jobStatus: jobStatusQuery.data,
    isCheckingJobStatus: jobStatusQuery.isLoading || jobStatusQuery.isFetching,
    
    // Download
    downloadProcessedFile,
    
    // State management
    activeJobId,
    resultJobId,
    resetState
  };
};

export default useAdvancedPdfTools;
