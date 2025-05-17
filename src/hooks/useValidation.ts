
import { useValidationProcess } from './useValidationProcess';
import { useFixProcess } from './useFixProcess';
import { useDownloadFixedPDF } from './useDownloadFixedPDF';
import { ValidationParams } from '@/types/validation';

export const useValidation = (userId: string) => {
  const validationProcess = useValidationProcess(userId);
  const fixProcess = useFixProcess(userId);
  const downloadProcess = useDownloadFixedPDF();
  
  // Reset function to clear current validation state
  const resetValidation = () => {
    validationProcess.resetValidationProcess();
    fixProcess.resetFixProcess();
  };
  
  return {
    // System capabilities
    capabilities: validationProcess.capabilities,
    isLoadingCapabilities: validationProcess.isLoadingCapabilities,
    
    // Validation
    validatePDF: (params: { file: File, params: ValidationParams }) => 
      validationProcess.validatePDF(params),
    isValidating: validationProcess.isValidating,
    validationStatus: validationProcess.validationStatus,
    isCheckingStatus: validationProcess.isCheckingStatus,
    validationResults: validationProcess.validationResults,
    isLoadingResults: validationProcess.isLoadingResults,
    validationError: validationProcess.validationError,
    
    // Fixes
    applyFixes: (params: { file: File, fixes: string[], options?: any }) => 
      fixProcess.applyFixes(params),
    isApplyingFixes: fixProcess.isApplyingFixes,
    fixStatus: fixProcess.fixStatus,
    isCheckingFixStatus: fixProcess.isCheckingFixStatus,
    downloadFixedPdf: (fixJobId: string, fileName: string) => 
      downloadProcess.downloadFixedPdf(fixJobId, fileName),
    isDownloading: downloadProcess.isDownloading,
    
    // Font Fixes
    applyFontEmbedding: (file: File) => 
      fixProcess.applyFontEmbedding(file),
    isEmbeddingFonts: fixProcess.isEmbeddingFonts,
    
    // Color Fixes
    convertRgbToCmyk: (params: { file: File, preserveBlack?: boolean }) => 
      fixProcess.convertRgbToCmyk(params),
    isConvertingRgbToCmyk: fixProcess.isConvertingRgbToCmyk,
    
    applyIccProfile: (params: { file: File, profileName?: string }) => 
      fixProcess.applyIccProfile(params),
    isApplyingIccProfile: fixProcess.isApplyingIccProfile,
    
    flattenTransparency: (params: { file: File, quality?: 'high' | 'medium' | 'low' }) => 
      fixProcess.flattenTransparency(params),
    isFlatteningTransparency: fixProcess.isFlatteningTransparency,
    
    // Compliance Fixes
    convertToPdfA: (params: { file: File, conformanceLevel?: '1b' | '1a' | '2b' | '2a' | '3b' | '3a' }) => 
      fixProcess.convertToPdfA(params),
    isConvertingToPdfA: fixProcess.isConvertingToPdfA,
    
    convertToPdfX: (params: { file: File, standard?: '1a' | '3' | '4' }) => 
      fixProcess.convertToPdfX(params),
    isConvertingToPdfX: fixProcess.isConvertingToPdfX,
    
    // Print Production Fixes
    addBleed: (params: { file: File, bleedMargin?: number }) => 
      fixProcess.addBleed(params),
    isAddingBleed: fixProcess.isAddingBleed,
    
    // Security Fixes
    removeJavaScript: (file: File) => 
      fixProcess.removeJavaScript(file),
    isRemovingJavaScript: fixProcess.isRemovingJavaScript,
    
    // Structural Fixes
    fixXrefTable: (file: File) => 
      fixProcess.fixXrefTable(file),
    isFixingXrefTable: fixProcess.isFixingXrefTable,
    
    // Image Optimization
    optimizeImages: (params: { file: File, targetDpi?: number }) => 
      fixProcess.optimizeImages(params),
    isOptimizingImages: fixProcess.isOptimizingImages,
    
    // State
    resetValidation,
    
    // Direct access to process objects for advanced usage
    _validationProcess: validationProcess,
    _fixProcess: fixProcess,
    _downloadProcess: downloadProcess
  };
};
