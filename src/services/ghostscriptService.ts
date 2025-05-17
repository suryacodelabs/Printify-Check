
import axios from 'axios';

// Define the API URL constant
const API_URL = import.meta.env.VITE_API_URL || '/api';

interface GhostscriptVersionInfo {
  version: string;
  fullVersion: string;
  available: string;
  error?: string;
}

interface OptimizationOptions {
  quality: 'screen' | 'ebook' | 'printer' | 'prepress';
}

interface RenderResult {
  totalPages: number;
  renderedPages: number;
  dpi: number;
  pages: Array<{
    image: string;
    page: number;
  }>;
}

interface PrintReadyOptions {
  convertToCmyk?: boolean;
  preserveBlack?: boolean;
  flattenTransparency?: boolean;
  downsampleImages?: boolean;
  resolution?: number;
  embedAllFonts?: boolean;
  quality?: 'screen' | 'ebook' | 'printer' | 'prepress';
}

export const ghostscriptService = {
  /**
   * Get Ghostscript version information
   */
  async getVersionInfo(): Promise<GhostscriptVersionInfo> {
    const response = await axios.get(`${API_URL}/ghostscript/version`);
    return response.data;
  },

  /**
   * Optimize a PDF file
   */
  async optimizePdf(file: File, options: OptimizationOptions): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', options.quality);

    const response = await axios.post(`${API_URL}/ghostscript/optimize`, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Convert PDF to images
   */
  async convertToImages(file: File, format: 'png' | 'jpg' | 'tiff', dpi: number): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    formData.append('dpi', dpi.toString());

    const response = await axios.post(`${API_URL}/ghostscript/convert-to-images`, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Prepare a print-ready PDF
   */
  async preparePrintReady(file: File, options: PrintReadyOptions): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.convertToCmyk !== undefined) 
      formData.append('convertToCmyk', options.convertToCmyk.toString());
    if (options.preserveBlack !== undefined) 
      formData.append('preserveBlack', options.preserveBlack.toString());
    if (options.flattenTransparency !== undefined) 
      formData.append('flattenTransparency', options.flattenTransparency.toString());
    if (options.downsampleImages !== undefined) 
      formData.append('downsampleImages', options.downsampleImages.toString());
    if (options.resolution !== undefined) 
      formData.append('resolution', options.resolution.toString());
    if (options.embedAllFonts !== undefined) 
      formData.append('embedAllFonts', options.embedAllFonts.toString());
    if (options.quality !== undefined) 
      formData.append('quality', options.quality);

    const response = await axios.post(`${API_URL}/ghostscript/print-ready`, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Add bleed to a PDF
   */
  async addBleed(file: File, bleedMargin: number = 9): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bleedMargin', bleedMargin.toString());

    const response = await axios.post(`${API_URL}/ghostscript/add-bleed`, formData, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Render PDF pages to images
   */
  async renderPdfPages(file: File, dpi: number = 150, maxPages: number = 1): Promise<RenderResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dpi', dpi.toString());
    formData.append('maxPages', maxPages.toString());

    const response = await axios.post(`${API_URL}/ghostscript/render`, formData);
    return response.data;
  },
};
