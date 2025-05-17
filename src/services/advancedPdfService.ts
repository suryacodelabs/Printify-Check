
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Service for advanced PDF operations using iText functionality
 */
export const advancedPdfService = {
  /**
   * Linearize a PDF for web optimization
   * @param file PDF file to linearize
   * @returns Job information
   */
  linearizePdf: async (file: File): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/pdf/advanced/linearize`, formData);
    return response.data;
  },
  
  /**
   * Embed all fonts in a PDF
   * @param file PDF file to process
   * @returns Job information
   */
  embedFonts: async (file: File): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/pdf/advanced/embed-fonts`, formData);
    return response.data;
  },
  
  /**
   * Convert RGB colors to CMYK in a PDF
   * @param file PDF file to process
   * @param preserveBlack Whether to preserve pure black
   * @returns Job information
   */
  convertToCmyk: async (file: File, preserveBlack = true): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preserveBlack', preserveBlack.toString());
    
    const response = await axios.post(`${API_URL}/pdf/advanced/convert-to-cmyk`, formData);
    return response.data;
  },
  
  /**
   * Apply an ICC profile to a PDF
   * @param file PDF file to process
   * @param profileName Name of the ICC profile to apply
   * @returns Job information
   */
  applyIccProfile: async (file: File, profileName = 'sRGB'): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('profileName', profileName);
    
    const response = await axios.post(`${API_URL}/pdf/advanced/apply-icc-profile`, formData);
    return response.data;
  },
  
  /**
   * Flatten transparency in a PDF
   * @param file PDF file to process
   * @param quality Quality level (low, medium, high)
   * @returns Job information
   */
  flattenTransparency: async (file: File, quality = 'high'): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    
    const response = await axios.post(`${API_URL}/pdf/advanced/flatten-transparency`, formData);
    return response.data;
  },
  
  /**
   * Convert a PDF to PDF/A standard
   * @param file PDF file to process
   * @param conformanceLevel PDF/A conformance level
   * @returns Job information
   */
  convertToPdfA: async (file: File, conformanceLevel = '1B'): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conformanceLevel', conformanceLevel);
    
    const response = await axios.post(`${API_URL}/pdf/advanced/convert-to-pdfa`, formData);
    return response.data;
  },
  
  /**
   * Convert a PDF to PDF/X standard
   * @param file PDF file to process
   * @param standard PDF/X standard version
   * @returns Job information
   */
  convertToPdfX: async (file: File, standard = '3'): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('standard', standard);
    
    const response = await axios.post(`${API_URL}/pdf/advanced/convert-to-pdfx`, formData);
    return response.data;
  },
  
  /**
   * Add bleed to a PDF
   * @param file PDF file to process
   * @param bleedMargin Bleed margin in points (1/72 inch)
   * @returns Job information
   */
  addBleed: async (file: File, bleedMargin = 9): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bleedMargin', bleedMargin.toString());
    
    const response = await axios.post(`${API_URL}/pdf/advanced/add-bleed`, formData);
    return response.data;
  },
  
  /**
   * Prepare a print-ready PDF with multiple optimizations
   * @param file PDF file to process
   * @param options Optimization options
   * @returns Job information
   */
  preparePrintReadyPdf: async (
    file: File, 
    options = { addBleed: true, convertToCmyk: true, flattenTransparency: true }
  ): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('addBleed', options.addBleed.toString());
    formData.append('convertToCmyk', options.convertToCmyk.toString());
    formData.append('flattenTransparency', options.flattenTransparency.toString());
    
    const response = await axios.post(`${API_URL}/pdf/advanced/prepare-print-ready`, formData);
    return response.data;
  },
  
  /**
   * Generate a preflight report for a PDF
   * @param file PDF file to process
   * @param issues List of identified issues
   * @param qualityScore Overall quality score
   * @returns Job information
   */
  generatePreflightReport: async (
    file: File, 
    issues: any[], 
    qualityScore = 100
  ): Promise<{ jobId: string; status: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('qualityScore', qualityScore.toString());
    
    // Add issues as a request parameter
    const response = await axios.post(
      `${API_URL}/pdf/advanced/generate-preflight-report?qualityScore=${qualityScore}`, 
      issues,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: { file: formData }
      }
    );
    return response.data;
  },
  
  /**
   * Check the status of a job
   * @param jobId Job ID to check
   * @returns Job status information
   */
  getJobStatus: async (jobId: string): Promise<{ jobId: string; status: string; progress: number; resultId?: string }> => {
    const response = await axios.get(`${API_URL}/pdf/advanced/job-status/${jobId}`);
    return response.data;
  },
  
  /**
   * Download a processed file
   * @param jobId Job ID to download
   * @returns URL to download the file
   */
  downloadProcessedFile: async (jobId: string): Promise<string> => {
    return `${API_URL}/pdf/advanced/download/${jobId}`;
  }
};
