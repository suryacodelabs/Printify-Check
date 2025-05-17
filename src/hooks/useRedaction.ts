
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { redactionService, RedactionParams, MetadataStrippingParams } from '@/services/redactionService';
import { useToast } from '@/hooks/use-toast';

export const useRedaction = (userId: string) => {
  const [redactionJobId, setRedactionJobId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Mutation for applying redaction
  const redactionMutation = useMutation({
    mutationFn: async ({ file, params }: { file: File, params: RedactionParams }) => {
      return redactionService.applyRedaction(file, userId, params);
    },
    onSuccess: (data) => {
      setRedactionJobId(data.jobId);
      toast({
        title: "Redaction Started",
        description: `Redaction process initiated for ${data.fileName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redaction Failed",
        description: error.message || "Failed to start redaction process",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for stripping metadata
  const metadataStrippingMutation = useMutation({
    mutationFn: async ({ file, params }: { file: File, params?: MetadataStrippingParams }) => {
      return redactionService.stripMetadata(file, userId, params);
    },
    onSuccess: (data) => {
      setRedactionJobId(data.jobId);
      toast({
        title: "Metadata Stripping Started",
        description: `Metadata stripping process initiated for ${data.fileName}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Metadata Stripping Failed",
        description: error.message || "Failed to start metadata stripping process",
        variant: "destructive",
      });
    }
  });
  
  // Query for redaction status
  const redactionStatusQuery = useQuery({
    queryKey: ['redactionStatus', redactionJobId],
    queryFn: async () => {
      if (!redactionJobId) return null;
      return redactionService.getRedactionStatus(redactionJobId);
    },
    enabled: !!redactionJobId,
    refetchInterval: (query) => {
      const data = query.state?.data;
      if (!data) return 2000; // Default polling interval if no data
      
      if (data.status === 'completed' || data.status === 'error') {
        return false; // Stop polling
      }
      
      // Continue polling every 2 seconds
      return 2000;
    }
  });
  
  // Mutation for downloading redacted PDF
  const downloadRedactedPdfMutation = useMutation({
    mutationFn: async ({ jobId, fileName }: { jobId: string, fileName: string }) => {
      return redactionService.downloadRedactedPdf(jobId, fileName);
    },
    onSuccess: () => {
      toast({
        title: "Download Complete",
        description: "Redacted PDF has been downloaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download redacted PDF",
        variant: "destructive",
      });
    }
  });
  
  return {
    // Apply redaction
    applyRedaction: redactionMutation.mutate,
    isRedacting: redactionMutation.isPending,
    
    // Strip metadata
    stripMetadata: metadataStrippingMutation.mutate,
    isStrippingMetadata: metadataStrippingMutation.isPending,
    
    // Status
    redactionStatus: redactionStatusQuery.data,
    isCheckingStatus: redactionStatusQuery.isLoading || redactionStatusQuery.isFetching,
    
    // Download
    downloadRedactedPdf: downloadRedactedPdfMutation.mutate,
    isDownloading: downloadRedactedPdfMutation.isPending,
    
    // State
    redactionJobId,
    resetRedaction: () => {
      setRedactionJobId(null);
    }
  };
};
