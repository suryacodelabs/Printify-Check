
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { veraPdfExtendedService } from '@/services/veraPdfExtendedService';
import { useToast } from '@/hooks/use-toast';
import { useVeraPdf } from '@/hooks/useVeraPdf';
import { 
  PdfFlavour, 
  PDFValidationOptions, 
  PDFFixOptions, 
  PDFAccessibilitySummary,
  PDFTagIssue
} from '@/types/pdf';

export const useVeraPdfExtended = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Import base veraPDF hooks
  const veraPdfHooks = useVeraPdf();
  
  // Multi-level validation mutation
  const multiLevelValidationMutation = useMutation({
    mutationFn: async ({ file, options }: { file: File, options?: PDFValidationOptions }) => {
      setIsProcessing(true);
      return veraPdfExtendedService.validateMultiLevel(file, options);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      
      // Check if any validation level passed
      const allCompliant = Object.values(data.results)
        .every((result: any) => result.isCompliant);
      
      toast({
        title: allCompliant ? "All Validations Passed" : "Validation Issues Found",
        description: allCompliant ? 
          "Your document is compliant with all requested standards." : 
          "Your document has compliance issues with one or more standards.",
        variant: allCompliant ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Multi-level Validation Failed",
        description: error.message || "Failed to perform multi-level validation.",
        variant: "destructive",
      });
    }
  });
  
  // Tag structure validation mutation
  const tagStructureValidationMutation = useMutation({
    mutationFn: async (params: { file: File }) => {
      setIsProcessing(true);
      return veraPdfExtendedService.validateTagStructure(params.file);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: data.isAccessible ? "Tag Structure Validation Passed" : "Tag Structure Issues Found",
        description: data.isAccessible ? 
          "Your document's tag structure is well-formed for accessibility." : 
          `Found ${data.issues.length} issues with document tag structure.`,
        variant: data.isAccessible ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Tag Structure Validation Failed",
        description: error.message || "Failed to validate tag structure.",
        variant: "destructive",
      });
    }
  });
  
  // Accessibility enhancement mutation
  const enhanceAccessibilityMutation = useMutation({
    mutationFn: async (params: { file: File }) => {
      setIsProcessing(true);
      return veraPdfExtendedService.enhanceAccessibility(params.file);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "Accessibility Enhancement Successful",
        description: "Your document's accessibility has been improved.",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Accessibility Enhancement Failed",
        description: error.message || "Failed to enhance document accessibility.",
        variant: "destructive",
      });
    }
  });
  
  // Add language specification mutation
  const addLanguageMutation = useMutation({
    mutationFn: async (params: { file: File, language?: string }) => {
      setIsProcessing(true);
      return veraPdfExtendedService.addLanguageSpecification(params.file, params.language);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "Language Specification Added",
        description: "Language information has been added to your document.",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Language Addition Failed",
        description: error.message || "Failed to add language specification.",
        variant: "destructive",
      });
    }
  });
  
  // Multiple fixes mutation
  const applyMultipleFixesMutation = useMutation({
    mutationFn: async (params: { file: File, options: PDFFixOptions }) => {
      setIsProcessing(true);
      return veraPdfExtendedService.applyMultipleFixes(params.file, params.options);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "PDF Fixes Applied Successfully",
        description: "Multiple fixes have been applied to your document.",
      });
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "PDF Fixes Failed",
        description: error.message || "Failed to apply fixes to your document.",
        variant: "destructive",
      });
    }
  });
  
  // Accessibility summary mutation
  const accessibilitySummaryMutation = useMutation({
    mutationFn: async (params: { file: File }) => {
      setIsProcessing(true);
      return veraPdfExtendedService.getAccessibilitySummary(params.file);
    },
    onSuccess: (data) => {
      setIsProcessing(false);
    },
    onError: (error: any) => {
      setIsProcessing(false);
      toast({
        title: "Failed to Get Accessibility Summary",
        description: error.message || "Could not generate accessibility summary.",
        variant: "destructive",
      });
    }
  });
  
  return {
    // Multi-level validation
    validateMultiLevel: multiLevelValidationMutation.mutate,
    isValidatingMultiLevel: multiLevelValidationMutation.isPending,
    multiLevelValidationResult: multiLevelValidationMutation.data,
    multiLevelValidationError: multiLevelValidationMutation.error,
    
    // Tag structure validation
    validateTagStructure: tagStructureValidationMutation.mutate,
    isValidatingTagStructure: tagStructureValidationMutation.isPending,
    tagStructureValidationResult: tagStructureValidationMutation.data,
    tagStructureValidationError: tagStructureValidationMutation.error,
    
    // Accessibility enhancement
    enhanceAccessibility: enhanceAccessibilityMutation.mutate,
    isEnhancingAccessibility: enhanceAccessibilityMutation.isPending,
    accessibilityEnhancementResult: enhanceAccessibilityMutation.data,
    accessibilityEnhancementError: enhanceAccessibilityMutation.error,
    
    // Add language
    addLanguage: addLanguageMutation.mutate,
    isAddingLanguage: addLanguageMutation.isPending,
    addLanguageResult: addLanguageMutation.data,
    addLanguageError: addLanguageMutation.error,
    
    // Multiple fixes
    applyMultipleFixes: applyMultipleFixesMutation.mutate,
    isApplyingFixes: applyMultipleFixesMutation.isPending,
    applyFixesResult: applyMultipleFixesMutation.data,
    applyFixesError: applyMultipleFixesMutation.error,
    
    // Accessibility summary
    getAccessibilitySummary: accessibilitySummaryMutation.mutate,
    isGettingAccessibilitySummary: accessibilitySummaryMutation.isPending,
    accessibilitySummary: accessibilitySummaryMutation.data,
    accessibilitySummaryError: accessibilitySummaryMutation.error,
    
    // Re-export regular veraPDF hooks
    ...veraPdfHooks,
    
    // General processing state
    isProcessing: isProcessing || veraPdfHooks.isProcessing
  };
};
