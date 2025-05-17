
import { useState } from 'react';
import { OCRParams, pdfService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

export type OcrStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface UseOcrResult {
  status: OcrStatus;
  progress: number;
  jobId: string | null;
  result: any | null;
  error: Error | null;
  processOcr: (file: File, params: OCRParams) => Promise<void>;
  processOcrOnPages: (file: File, params: OCRParams, pageRanges: string) => Promise<void>;
  extractText: (file: File, params: OCRParams) => Promise<void>;
  performAdvancedOcr: (file: File, params: OCRParams) => Promise<void>;
  checkStatus: (jobId: string) => Promise<void>;
  downloadOcrPdf: (jobId: string) => Promise<string>;
  getSupportedLanguages: () => Promise<{ languages: string[], languageNames: Record<string, string> }>;
  cancelProcess: (jobId: string) => Promise<void>;
  resetState: () => void;
}

export const useOcr = (): UseOcrResult => {
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const processOcr = async (file: File, params: OCRParams): Promise<void> => {
    try {
      setStatus('processing');
      setProgress(0);
      setError(null);
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Call the OCR service
      const response = await pdfService.processOcr(file, params);
      clearInterval(progressInterval);
      
      if (response.jobId) {
        setJobId(response.jobId);
        await checkStatus(response.jobId);
      } else {
        setStatus('completed');
        setProgress(100);
        setResult(response);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      toast({
        title: "OCR Processing Failed",
        description: err.message || "There was an error processing your document",
        variant: "destructive"
      });
    }
  };
  
  const processOcrOnPages = async (file: File, params: OCRParams, pageRanges: string): Promise<void> => {
    try {
      setStatus('processing');
      setProgress(0);
      setError(null);
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Call the OCR service for specific pages
      const response = await pdfService.processOcrOnPages(file, params, pageRanges);
      clearInterval(progressInterval);
      
      if (response.jobId) {
        setJobId(response.jobId);
        await checkStatus(response.jobId);
      } else {
        setStatus('completed');
        setProgress(100);
        setResult(response);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      toast({
        title: "OCR Processing Failed",
        description: err.message || "There was an error processing your document",
        variant: "destructive"
      });
    }
  };
  
  const extractText = async (file: File, params: OCRParams): Promise<void> => {
    try {
      setStatus('processing');
      setProgress(0);
      setError(null);
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Call the OCR text extraction service
      const response = await pdfService.extractTextWithOcr(file, params);
      clearInterval(progressInterval);
      
      setStatus('completed');
      setProgress(100);
      setResult(response);
    } catch (err: any) {
      setStatus('error');
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      toast({
        title: "Text Extraction Failed",
        description: err.message || "There was an error extracting text from your document",
        variant: "destructive"
      });
    }
  };
  
  const performAdvancedOcr = async (file: File, params: OCRParams): Promise<void> => {
    try {
      setStatus('processing');
      setProgress(0);
      setError(null);
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);
      
      // Call the advanced OCR service
      const response = await pdfService.performAdvancedOcr(file, params);
      clearInterval(progressInterval);
      
      if (response.jobId) {
        setJobId(response.jobId);
        await checkStatus(response.jobId);
      } else {
        setStatus('completed');
        setProgress(100);
        setResult(response);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      toast({
        title: "Advanced OCR Processing Failed",
        description: err.message || "There was an error processing your document",
        variant: "destructive"
      });
    }
  };
  
  const checkStatus = async (id: string): Promise<void> => {
    try {
      // Poll the status API
      const statusResponse = await pdfService.getOcrJobStatus(id);
      setProgress(statusResponse.progress || 0);
      
      if (statusResponse.status === 'completed') {
        setStatus('completed');
        setProgress(100);
        setResult(statusResponse);
        
        toast({
          title: "OCR Complete",
          description: "Your document has been processed successfully.",
          variant: "default"
        });
      } else if (statusResponse.status === 'error') {
        setStatus('error');
        setError(new Error(statusResponse.error || 'Unknown error'));
        
        toast({
          title: "OCR Processing Failed",
          description: statusResponse.error || "There was an error processing your document",
          variant: "destructive"
        });
      } else {
        // Continue polling for status updates
        setTimeout(() => checkStatus(id), 2000);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to check OCR status'));
      
      toast({
        title: "Status Check Failed",
        description: err.message || "There was an error checking the status of your document",
        variant: "destructive"
      });
    }
  };
  
  const downloadOcrPdf = async (id: string): Promise<string> => {
    try {
      // This would typically download the PDF file in a real implementation
      const blob = await pdfService.downloadOcrPdf(id);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // In a real app, this might trigger a download or open the PDF
      return url;
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.message || "There was an error downloading your document",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const getSupportedLanguages = async (): Promise<{ languages: string[], languageNames: Record<string, string> }> => {
    try {
      return await pdfService.getSupportedOcrLanguages();
    } catch (err: any) {
      toast({
        title: "Failed to Get Languages",
        description: err.message || "There was an error fetching supported languages",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const cancelProcess = async (id: string): Promise<void> => {
    try {
      await pdfService.cancelProcess(id);
      setStatus('idle');
      setProgress(0);
      setJobId(null);
      
      toast({
        title: "Process Cancelled",
        description: "The OCR process has been cancelled",
        variant: "default"
      });
    } catch (err: any) {
      toast({
        title: "Cancel Failed",
        description: err.message || "There was an error cancelling the process",
        variant: "destructive"
      });
      throw err;
    }
  };
  
  const resetState = (): void => {
    setStatus('idle');
    setProgress(0);
    setJobId(null);
    setResult(null);
    setError(null);
  };

  return {
    status,
    progress,
    jobId,
    result,
    error,
    processOcr,
    processOcrOnPages,
    extractText,
    performAdvancedOcr,
    checkStatus,
    downloadOcrPdf,
    getSupportedLanguages,
    cancelProcess,
    resetState
  };
};
