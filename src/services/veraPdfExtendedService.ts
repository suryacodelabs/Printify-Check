
import axios, { AxiosRequestConfig } from 'axios';
import { 
  PDFIssue, 
  PDFTagIssue, 
  PDFAccessibilitySummary, 
  PdfFlavour, 
  PDFValidationOptions,
  PDFFixOptions
} from '@/types/pdf';

// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const COMPLIANCE_API = `${API_BASE_URL}/compliance`;
const EXTENDED_API = `${API_BASE_URL}/compliance/extended`;

// Request timeout settings (ms)
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const UPLOAD_TIMEOUT = 300000;  // 5 minutes for uploads

/**
 * Extended VeraPDF service with advanced validation and fixing capabilities
 */
export const veraPdfExtendedService = {
  /**
   * Validate PDF against multiple standards using VeraPDF
   * 
   * @param file PDF file to validate
   * @param options Validation options
   * @returns Promise with multi-level validation results
   */
  async validateMultiLevel(file: File, options: PDFValidationOptions = {}): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add validation levels if specified
    if (options.levels && options.levels.length > 0) {
      options.levels.forEach(level => {
        formData.append('levels', level.toString());
      });
    }
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${EXTENDED_API}/validate/multi-level`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error during multi-level validation:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Multi-level validation failed: ${errorMessage}`);
    }
  },
  
  /**
   * Validate PDF tag structure for accessibility
   * 
   * @param file PDF file to validate
   * @returns Promise with tag structure validation results
   */
  async validateTagStructure(file: File): Promise<{issues: PDFTagIssue[], isAccessible: boolean}> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${EXTENDED_API}/tag-structure`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error validating tag structure:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Tag structure validation failed: ${errorMessage}`);
    }
  },
  
  /**
   * Enhance PDF accessibility by improving tag structure
   * 
   * @param file PDF file to enhance
   * @returns Promise with enhancement result
   */
  async enhanceAccessibility(file: File): Promise<{success: boolean, message: string, outputPath: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${EXTENDED_API}/fix/enhance-accessibility`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error enhancing accessibility:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Accessibility enhancement failed: ${errorMessage}`);
    }
  },
  
  /**
   * Add language specification to PDF
   * 
   * @param file PDF file to modify
   * @param language Language code (e.g., "en-US")
   * @returns Promise with operation result
   */
  async addLanguageSpecification(file: File, language: string = 'en-US'): Promise<{success: boolean, message: string, outputPath: string}> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${EXTENDED_API}/fix/add-language`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error adding language specification:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Language addition failed: ${errorMessage}`);
    }
  },
  
  /**
   * Apply multiple PDF fixes in one operation
   * 
   * @param file PDF file to fix
   * @param options Fix options
   * @returns Promise with fix results
   */
  async applyMultipleFixes(file: File, options: PDFFixOptions): Promise<Record<string, any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add fix options as JSON string
    formData.append('options', JSON.stringify(options));
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      // In a real implementation, you would create an endpoint for this
      // For now, we'll use the basic conversion endpoint
      let response;
      
      if (options.convertToPdfA?.enabled) {
        formData.append('flavour', options.convertToPdfA.flavour);
        response = await axios.post(`${COMPLIANCE_API}/fix/convert-to-pdfa`, formData, config);
      } else if (options.addLanguage?.enabled) {
        formData.append('language', options.addLanguage.language);
        response = await axios.post(`${EXTENDED_API}/fix/add-language`, formData, config);
      } else if (options.enhanceAccessibility) {
        response = await axios.post(`${EXTENDED_API}/fix/enhance-accessibility`, formData, config);
      } else if (options.fixMetadata) {
        response = await axios.post(`${COMPLIANCE_API}/fix/sanitize-metadata`, formData, config);
      } else {
        throw new Error('No fix options selected');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error applying fixes:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Fix application failed: ${errorMessage}`);
    }
  },
  
  /**
   * Get comprehensive accessibility summary for a PDF
   * 
   * @param file PDF file to analyze
   * @returns Promise with accessibility summary
   */
  async getAccessibilitySummary(file: File): Promise<PDFAccessibilitySummary> {
    try {
      // First get tag structure validation
      const tagValidation = await this.validateTagStructure(file);
      
      // Then get PDF/UA validation
      const pdfUaValidation = await veraPdfService.validatePdfUA(file);
      
      // Combine results to create a comprehensive summary
      const allIssues = [...tagValidation.issues, ...pdfUaValidation.issues];
      
      const summary: PDFAccessibilitySummary = {
        isTagged: !tagValidation.issues.some(issue => issue.message.includes("not tagged")),
        hasLanguage: !allIssues.some(issue => issue.message.includes("language")),
        hasTitle: !allIssues.some(issue => issue.message.includes("title")),
        missingAltText: allIssues.filter(issue => issue.message.includes("alt text") || issue.message.includes("alternative text")).length,
        tableIssues: allIssues.filter(issue => issue.message.includes("table")).length,
        headingIssues: allIssues.filter(issue => issue.message.includes("heading") || issue.message.includes("H1")).length,
        totalIssues: allIssues.length,
        score: calculateAccessibilityScore(allIssues)
      };
      
      return summary;
    } catch (error: any) {
      console.error('Error getting accessibility summary:', error);
      throw new Error(`Failed to get accessibility summary: ${error.message}`);
    }
  }
};

/**
 * Calculate accessibility score based on issues
 * 
 * @param issues List of validation issues
 * @returns Score from 0-100
 */
function calculateAccessibilityScore(issues: PDFIssue[]): number {
  if (issues.length === 0) return 100;
  
  const highSeverityCount = issues.filter(issue => issue.severity === 'high').length;
  const mediumSeverityCount = issues.filter(issue => issue.severity === 'medium').length;
  const lowSeverityCount = issues.filter(issue => issue.severity === 'low').length;
  
  // Calculate score with weighted penalties
  const baseScore = 100;
  const highPenalty = 10 * highSeverityCount;
  const mediumPenalty = 5 * mediumSeverityCount;
  const lowPenalty = 2 * lowSeverityCount;
  
  const score = Math.max(0, baseScore - highPenalty - mediumPenalty - lowPenalty);
  return Math.round(score);
}

// Re-export the basic veraPDF service for convenience
import { veraPdfService } from '@/services/veraPdfService';
export { veraPdfService };
