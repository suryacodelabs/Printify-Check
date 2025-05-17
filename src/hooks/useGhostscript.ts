
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ghostscriptService } from '@/services/ghostscriptService';

export type OptimizationQuality = 'screen' | 'ebook' | 'printer' | 'prepress';
export type ImageFormat = 'png' | 'jpg' | 'tiff';

interface GhostscriptState {
  isOptimizing: boolean;
  isConverting: boolean;
  isPreparingPrintReady: boolean;
  isAddingBleed: boolean;
  isRendering: boolean;
  optimizedPdfUrl: string | null;
  convertedImagesUrl: string | null;
  printReadyPdfUrl: string | null;
  bleedPdfUrl: string | null;
  renderedPages: Array<{
    image: string;
    page: number;
  }> | null;
  totalPages: number | null;
  error: string | null;
}

export const useGhostscript = () => {
  const [state, setState] = useState<GhostscriptState>({
    isOptimizing: false,
    isConverting: false,
    isPreparingPrintReady: false,
    isAddingBleed: false,
    isRendering: false,
    optimizedPdfUrl: null,
    convertedImagesUrl: null,
    printReadyPdfUrl: null,
    bleedPdfUrl: null,
    renderedPages: null,
    totalPages: null,
    error: null,
  });

  const { toast } = useToast();

  /**
   * Optimize a PDF file
   */
  const optimizePdf = async (file: File, quality: OptimizationQuality = 'printer') => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true, error: null }));

      const result = await ghostscriptService.optimizePdf(file, { quality });
      const url = URL.createObjectURL(result);

      setState(prev => ({ 
        ...prev, 
        isOptimizing: false,
        optimizedPdfUrl: url,
      }));

      toast({
        title: "PDF Optimized",
        description: "The PDF has been successfully optimized",
      });

      return url;
    } catch (error) {
      console.error('Error optimizing PDF:', error);
      setState(prev => ({ 
        ...prev, 
        isOptimizing: false,
        error: error instanceof Error ? error.message : 'Error optimizing PDF' 
      }));

      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : 'Error optimizing PDF',
        variant: "destructive",
      });

      return null;
    }
  };

  /**
   * Convert PDF to images
   */
  const convertToImages = async (file: File, format: ImageFormat = 'png', dpi: number = 300) => {
    try {
      setState(prev => ({ ...prev, isConverting: true, error: null }));

      const result = await ghostscriptService.convertToImages(file, format, dpi);
      const url = URL.createObjectURL(result);

      setState(prev => ({ 
        ...prev, 
        isConverting: false,
        convertedImagesUrl: url,
      }));

      toast({
        title: "PDF Converted",
        description: `The PDF has been converted to ${format.toUpperCase()} images`,
      });

      return url;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      setState(prev => ({ 
        ...prev, 
        isConverting: false,
        error: error instanceof Error ? error.message : 'Error converting PDF to images' 
      }));

      toast({
        title: "Conversion Failed",
        description: error instanceof Error ? error.message : 'Error converting PDF to images',
        variant: "destructive",
      });

      return null;
    }
  };

  /**
   * Prepare a print-ready PDF
   */
  const preparePrintReady = async (file: File, options: {
    convertToCmyk?: boolean;
    preserveBlack?: boolean;
    flattenTransparency?: boolean;
    downsampleImages?: boolean;
    resolution?: number;
    embedAllFonts?: boolean;
    quality?: OptimizationQuality;
  } = {}) => {
    try {
      setState(prev => ({ ...prev, isPreparingPrintReady: true, error: null }));

      const result = await ghostscriptService.preparePrintReady(file, options);
      const url = URL.createObjectURL(result);

      setState(prev => ({ 
        ...prev, 
        isPreparingPrintReady: false,
        printReadyPdfUrl: url,
      }));

      toast({
        title: "Print-Ready PDF Created",
        description: "The PDF has been prepared for print",
      });

      return url;
    } catch (error) {
      console.error('Error preparing print-ready PDF:', error);
      setState(prev => ({ 
        ...prev, 
        isPreparingPrintReady: false,
        error: error instanceof Error ? error.message : 'Error preparing print-ready PDF' 
      }));

      toast({
        title: "Print Preparation Failed",
        description: error instanceof Error ? error.message : 'Error preparing print-ready PDF',
        variant: "destructive",
      });

      return null;
    }
  };

  /**
   * Add bleed to a PDF
   */
  const addBleed = async (file: File, bleedMargin: number = 9) => {
    try {
      setState(prev => ({ ...prev, isAddingBleed: true, error: null }));

      const result = await ghostscriptService.addBleed(file, bleedMargin);
      const url = URL.createObjectURL(result);

      setState(prev => ({ 
        ...prev, 
        isAddingBleed: false,
        bleedPdfUrl: url,
      }));

      toast({
        title: "Bleed Added",
        description: `${bleedMargin}pt bleed margin has been added to the PDF`,
      });

      return url;
    } catch (error) {
      console.error('Error adding bleed to PDF:', error);
      setState(prev => ({ 
        ...prev, 
        isAddingBleed: false,
        error: error instanceof Error ? error.message : 'Error adding bleed to PDF' 
      }));

      toast({
        title: "Adding Bleed Failed",
        description: error instanceof Error ? error.message : 'Error adding bleed to PDF',
        variant: "destructive",
      });

      return null;
    }
  };

  /**
   * Render PDF pages to images
   */
  const renderPdfPages = async (file: File, dpi: number = 150, maxPages: number = 1) => {
    try {
      setState(prev => ({ ...prev, isRendering: true, error: null }));

      const result = await ghostscriptService.renderPdfPages(file, dpi, maxPages);

      setState(prev => ({ 
        ...prev, 
        isRendering: false,
        renderedPages: result.pages,
        totalPages: result.totalPages,
      }));

      return result.pages;
    } catch (error) {
      console.error('Error rendering PDF pages:', error);
      setState(prev => ({ 
        ...prev, 
        isRendering: false,
        error: error instanceof Error ? error.message : 'Error rendering PDF pages' 
      }));

      toast({
        title: "Rendering Failed",
        description: error instanceof Error ? error.message : 'Error rendering PDF pages',
        variant: "destructive",
      });

      return null;
    }
  };

  /**
   * Clean up created object URLs
   */
  const cleanup = () => {
    if (state.optimizedPdfUrl) URL.revokeObjectURL(state.optimizedPdfUrl);
    if (state.convertedImagesUrl) URL.revokeObjectURL(state.convertedImagesUrl);
    if (state.printReadyPdfUrl) URL.revokeObjectURL(state.printReadyPdfUrl);
    if (state.bleedPdfUrl) URL.revokeObjectURL(state.bleedPdfUrl);

    setState(prev => ({
      ...prev,
      optimizedPdfUrl: null,
      convertedImagesUrl: null,
      printReadyPdfUrl: null,
      bleedPdfUrl: null,
      renderedPages: null,
      totalPages: null,
    }));
  };

  return {
    ...state,
    optimizePdf,
    convertToImages,
    preparePrintReady,
    addBleed,
    renderPdfPages,
    cleanup,
  };
};
