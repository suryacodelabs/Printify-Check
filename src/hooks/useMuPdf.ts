
import { useState } from 'react';
import { muPdfService, MuPdfDocumentInfo, MuPdfFont, MuPdfColorSpace, MuPdfStructureNode, MuPdfPageInfo, MuPdfAnnotation, MuPdfVersionInfo } from '@/services/muPdfService';

// Extended document info for additional properties
export interface ExtendedDocumentInfo extends MuPdfDocumentInfo {
  fileSize: number;
  isEncrypted: boolean;
  isLinearized: boolean;
  permissions: {
    canPrint: boolean;
    canCopy: boolean;
    canModify: boolean;
    canAnnotate: boolean;
  };
}

export const useMuPdf = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentInfo, setDocumentInfo] = useState<ExtendedDocumentInfo | null>(null);
  const [fonts, setFonts] = useState<MuPdfFont[]>([]);
  const [colorSpaces, setColorSpaces] = useState<MuPdfColorSpace[]>([]);
  const [structure, setStructure] = useState<MuPdfStructureNode[]>([]);
  const [pageInfo, setPageInfo] = useState<MuPdfPageInfo | null>(null);
  const [renderedPage, setRenderedPage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | Record<string, string> | null>(null);
  const [convertedDocumentUrl, setConvertedDocumentUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<MuPdfAnnotation[] | null>(null);
  const [protectedDocumentUrl, setProtectedDocumentUrl] = useState<string | null>(null);
  const [versionInfo, setVersionInfo] = useState<MuPdfVersionInfo | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRenderingPage, setIsRenderingPage] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [isConvertingDocument, setIsConvertingDocument] = useState(false);
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false);
  const [isProtectingDocument, setIsProtectingDocument] = useState(false);
  const [isLoadingVersionInfo, setIsLoadingVersionInfo] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isEmbeddingFonts, setIsEmbeddingFonts] = useState(false);
  const [isConvertingColors, setIsConvertingColors] = useState(false);
  const [isFlatteningTransparency, setIsFlatteningTransparency] = useState(false);
  const [isLoadingDocumentInfo, setIsLoadingDocumentInfo] = useState(false);
  
  const [analyzeError, setAnalyzeError] = useState<any>(null);
  const [repairError, setRepairError] = useState<any>(null);
  const [fontError, setFontError] = useState<any>(null);
  const [colorError, setColorError] = useState<any>(null);
  const [transparencyError, setTransparencyError] = useState<any>(null);
  const [renderError, setRenderError] = useState<any>(null);
  const [textExtractionError, setTextExtractionError] = useState<any>(null);
  const [conversionError, setConversionError] = useState<any>(null);
  const [annotationError, setAnnotationError] = useState<any>(null);
  const [protectionError, setProtectionError] = useState<any>(null);
  const [versionError, setVersionError] = useState<any>(null);
  
  const getDocumentInfo = async (file: File) => {
    setIsLoadingDocumentInfo(true);
    setAnalyzeError(null);
    
    try {
      const result = await muPdfService.analyzeDocument(file);
      setDocumentInfo(result.documentInfo);
      setFonts(result.fonts);
      setColorSpaces(result.colorSpaces);
      setStructure(result.structure);
      setPageInfo(result.pageInfo);
      return result;
    } catch (error) {
      setAnalyzeError(error);
      throw error;
    } finally {
      setIsLoadingDocumentInfo(false);
    }
  };
  
  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    
    try {
      const result = await muPdfService.analyzeDocument(file);
      setDocumentInfo(result.documentInfo);
      setFonts(result.fonts);
      setColorSpaces(result.colorSpaces);
      setStructure(result.structure);
      setPageInfo(result.pageInfo);
      return result;
    } catch (error) {
      setAnalyzeError(error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const renderPage = async ({ file, pageNumber, options }: { file: File, pageNumber: number, options?: { dpi?: number, colorspace?: 'rgb' | 'cmyk' | 'gray' } }) => {
    setIsRenderingPage(true);
    setRenderError(null);
    
    try {
      const result = await muPdfService.renderPage(file, pageNumber, options);
      setRenderedPage(result);
      return result;
    } catch (error) {
      setRenderError(error);
      throw error;
    } finally {
      setIsRenderingPage(false);
    }
  };
  
  const extractText = async ({ file, pageRange }: { file: File, pageRange?: string }) => {
    setIsExtractingText(true);
    setTextExtractionError(null);
    
    try {
      const result = await muPdfService.extractText(file, pageRange);
      setExtractedText(result);
      return result;
    } catch (error) {
      setTextExtractionError(error);
      throw error;
    } finally {
      setIsExtractingText(false);
    }
  };
  
  const convertDocument = async ({ file, options }: { file: File, options: { format: string, quality: 'low' | 'medium' | 'high', pages?: string } }) => {
    setIsConvertingDocument(true);
    setConversionError(null);
    
    try {
      const result = await muPdfService.convertDocument(file, options);
      setConvertedDocumentUrl(result);
      return result;
    } catch (error) {
      setConversionError(error);
      throw error;
    } finally {
      setIsConvertingDocument(false);
    }
  };
  
  const getAnnotations = async (file: File) => {
    setIsLoadingAnnotations(true);
    setAnnotationError(null);
    
    try {
      const result = await muPdfService.getAnnotations(file);
      setAnnotations(result);
      return result;
    } catch (error) {
      setAnnotationError(error);
      throw error;
    } finally {
      setIsLoadingAnnotations(false);
    }
  };
  
  const protectDocument = async ({ file, password, ownerPassword, permissions }: { 
    file: File, 
    password?: string, 
    ownerPassword?: string, 
    permissions: {
      canPrint: boolean,
      canCopy: boolean,
      canModify: boolean,
      canAnnotate: boolean
    }
  }) => {
    setIsProtectingDocument(true);
    setProtectionError(null);
    
    try {
      const result = await muPdfService.protectDocument(file, {
        password,
        ownerPassword,
        permissions
      });
      setProtectedDocumentUrl(result);
      return result;
    } catch (error) {
      setProtectionError(error);
      throw error;
    } finally {
      setIsProtectingDocument(false);
    }
  };
  
  const getVersionInfo = async () => {
    setIsLoadingVersionInfo(true);
    setVersionError(null);
    
    try {
      const result = await muPdfService.getVersionInfo();
      setVersionInfo(result);
      return result;
    } catch (error) {
      setVersionError(error);
      throw error;
    } finally {
      setIsLoadingVersionInfo(false);
    }
  };
  
  const repairPdf = async ({ file, options }: { file: File, options?: { fixXref?: boolean, fixDamage?: boolean, cleanMetadata?: boolean } }) => {
    setIsRepairing(true);
    setRepairError(null);
    
    try {
      const result = await muPdfService.repairPdf(file, options);
      return result;
    } catch (error) {
      setRepairError(error);
      throw error;
    } finally {
      setIsRepairing(false);
    }
  };
  
  const embedFonts = async ({ file, options }: { file: File, options?: { subset?: boolean } }) => {
    setIsEmbeddingFonts(true);
    setFontError(null);
    
    try {
      const result = await muPdfService.embedFonts(file, options?.subset);
      return result;
    } catch (error) {
      setFontError(error);
      throw error;
    } finally {
      setIsEmbeddingFonts(false);
    }
  };
  
  const convertColorSpace = async ({ file, options }: { file: File, options?: { targetColorSpace?: string, preserveBlack?: boolean } }) => {
    setIsConvertingColors(true);
    setColorError(null);
    
    try {
      const result = await muPdfService.convertColorSpace(
        file, 
        options?.targetColorSpace || 'cmyk', 
        options?.preserveBlack
      );
      return result;
    } catch (error) {
      setColorError(error);
      throw error;
    } finally {
      setIsConvertingColors(false);
    }
  };
  
  const flattenTransparency = async ({ file, quality }: { file: File, quality?: 'low' | 'medium' | 'high' }) => {
    setIsFlatteningTransparency(true);
    setTransparencyError(null);
    
    try {
      const result = await muPdfService.flattenTransparency(file, quality || 'high');
      return result;
    } catch (error) {
      setTransparencyError(error);
      throw error;
    } finally {
      setIsFlatteningTransparency(false);
    }
  };
  
  const downloadPdf = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '_fixed.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadDocument = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return {
    selectedFile,
    setSelectedFile,
    analyzeDocument,
    documentInfo,
    fonts,
    colorSpaces,
    structure,
    pageInfo,
    repairPdf,
    embedFonts,
    convertColorSpace,
    flattenTransparency,
    downloadPdf,
    isAnalyzing,
    isRepairing,
    isEmbeddingFonts,
    isConvertingColors,
    isFlatteningTransparency,
    analyzeError,
    repairError,
    fontError,
    colorError,
    transparencyError,
    getDocumentInfo, 
    isLoadingDocumentInfo,
    renderPage, 
    renderedPage, 
    isRenderingPage,
    extractText, 
    extractedText, 
    isExtractingText,
    convertDocument, 
    convertedDocumentUrl, 
    isConvertingDocument,
    getAnnotations, 
    annotations, 
    isLoadingAnnotations,
    protectDocument, 
    protectedDocumentUrl, 
    isProtectingDocument,
    getVersionInfo, 
    versionInfo, 
    isLoadingVersionInfo,
    downloadDocument,
    renderError,
    textExtractionError,
    conversionError,
    annotationError,
    protectionError,
    versionError
  };
};
