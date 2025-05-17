
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { veraPdfService } from '@/services/veraPdfService';
import { useToast } from '@/hooks/use-toast';

export const useVeraPdf = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Mutation for PDF/A validation
  const validatePdfAMutation = useMutation({
    mutationFn: async ({ file, flavour }: { file: File, flavour?: string }) => {
      setIsProcessing(true);
      return veraPdfService.validatePdfA(file, flavour);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: data.isCompliant ? "PDF/A Validation Passed" : "PDF/A Validation Issues Found",
        description: data.isCompliant ? 
          "Your document is compliant with PDF/A standards." : 
          `Found ${data.issues.length} issues with PDF/A compliance.`,
        variant: data.isCompliant ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "PDF/A Validation Failed",
        description: error.message || "Failed to validate PDF/A compliance.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for PDF/UA validation
  const validatePdfUAMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      setIsProcessing(true);
      return veraPdfService.validatePdfUA(file);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: data.isCompliant ? "PDF/UA Validation Passed" : "PDF/UA Validation Issues Found",
        description: data.isCompliant ? 
          "Your document is compliant with PDF/UA accessibility standards." : 
          `Found ${data.issues.length} issues with PDF/UA accessibility compliance.`,
        variant: data.isCompliant ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "PDF/UA Validation Failed",
        description: error.message || "Failed to validate PDF/UA compliance.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for WCAG validation
  const validateWcagMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      setIsProcessing(true);
      return veraPdfService.validateWcag(file);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: data.isCompliant ? "WCAG Validation Passed" : "WCAG Validation Issues Found",
        description: data.isCompliant ? 
          "Your document is compliant with WCAG accessibility standards." : 
          `Found ${data.issues.length} issues with WCAG accessibility compliance.`,
        variant: data.isCompliant ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "WCAG Validation Failed",
        description: error.message || "Failed to validate WCAG compliance.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for PDF/A conversion
  const convertToPdfAMutation = useMutation({
    mutationFn: async ({ file, flavour }: { file: File, flavour?: string }) => {
      setIsProcessing(true);
      return veraPdfService.convertToPdfA(file, flavour);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "PDF/A Conversion Successful",
        description: "Your document has been successfully converted to PDF/A format.",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "PDF/A Conversion Failed",
        description: error.message || "Failed to convert document to PDF/A format.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for metadata sanitization
  const sanitizeMetadataMutation = useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      setIsProcessing(true);
      return veraPdfService.sanitizeMetadata(file);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "Metadata Sanitization Successful",
        description: "Your document's metadata has been successfully sanitized.",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Metadata Sanitization Failed",
        description: error.message || "Failed to sanitize document metadata.",
        variant: "destructive",
      });
    }
  });
  
  return {
    // PDF/A validation
    validatePdfA: validatePdfAMutation.mutate,
    isValidatingPdfA: validatePdfAMutation.isPending,
    pdfAValidationResult: validatePdfAMutation.data,
    pdfAValidationError: validatePdfAMutation.error,
    
    // PDF/UA validation
    validatePdfUA: validatePdfUAMutation.mutate,
    isValidatingPdfUA: validatePdfUAMutation.isPending,
    pdfUAValidationResult: validatePdfUAMutation.data,
    pdfUAValidationError: validatePdfUAMutation.error,
    
    // WCAG validation
    validateWcag: validateWcagMutation.mutate,
    isValidatingWcag: validateWcagMutation.isPending,
    wcagValidationResult: validateWcagMutation.data,
    wcagValidationError: validateWcagMutation.error,
    
    // PDF/A conversion
    convertToPdfA: convertToPdfAMutation.mutate,
    isConvertingToPdfA: convertToPdfAMutation.isPending,
    pdfAConversionResult: convertToPdfAMutation.data,
    pdfAConversionError: convertToPdfAMutation.error,
    
    // Metadata sanitization
    sanitizeMetadata: sanitizeMetadataMutation.mutate,
    isSanitizingMetadata: sanitizeMetadataMutation.isPending,
    metadataSanitizationResult: sanitizeMetadataMutation.data,
    metadataSanitizationError: sanitizeMetadataMutation.error,
    
    // General processing state
    isProcessing
  };
};
