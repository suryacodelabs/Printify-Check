
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { validationService } from '@/services/validationService';
import { useToast } from '@/hooks/use-toast';

export const useDownloadFixedPDF = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  // Mutation for getting download URL
  const getDownloadUrlMutation = useMutation({
    mutationFn: async (fixJobId: string) => {
      return validationService.getFixedPdfDownloadUrl(fixJobId);
    },
  });
  
  // Mutation for direct download
  const downloadMutation = useMutation({
    mutationFn: async (fixJobId: string) => {
      return validationService.downloadFixedPdf(fixJobId);
    },
  });
  
  // Download the fixed PDF
  const downloadFixedPdf = async (fixJobId: string, fileName: string) => {
    setIsDownloading(true);
    try {
      // First try to get a direct download URL from the server
      const downloadUrl = await getDownloadUrlMutation.mutateAsync(fixJobId);
      
      if (downloadUrl) {
        // Create a link and trigger the download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName.replace('.pdf', '_fixed.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: "Your fixed PDF is being downloaded",
        });
      } else {
        // Fallback: direct download through API call
        const blob = await downloadMutation.mutateAsync(fixJobId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.replace('.pdf', '_fixed.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Complete",
          description: "Your fixed PDF has been downloaded",
        });
      }
    } catch (error: any) {
      console.error('Error downloading fixed PDF:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download the fixed PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return {
    downloadFixedPdf,
    isDownloading
  };
};
