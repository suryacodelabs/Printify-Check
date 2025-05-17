
import axios, { AxiosRequestConfig } from 'axios';
import { 
  ValidationParams, 
  ValidationResult, 
  ValidationJobResponse, 
  ValidationStatusResponse,
  FixParams,
  FixJobResponse,
  FixStatusResponse,
  SystemCapabilities,
  ValidationCategory
} from '@/types/validation';

// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const VALIDATION_API = `${API_BASE_URL}/validation`;

// Request timeout settings (ms)
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const UPLOAD_TIMEOUT = 300000;  // 5 minutes for uploads

/**
 * Service for PDF validation and fix operations
 */
export const validationService = {
  /**
   * Get system capabilities including available libraries and support for various operations
   */
  async getSystemCapabilities(): Promise<SystemCapabilities> {
    try {
      const response = await axios.get(`${VALIDATION_API}/capabilities`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system capabilities:', error);
      throw new Error(`Failed to retrieve system capabilities: ${error.response?.data?.message || error.message}`);
    }
  },
  
  /**
   * Submit a PDF file for validation
   * @param file PDF file to validate
   * @param userId User ID
   * @param params Validation parameters
   * @returns Promise with validation job response
   */
  async validatePDF(file: File, userId: string, params: ValidationParams): Promise<ValidationJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    // Append validation parameters
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/check`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error validating PDF:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Validation failed: ${errorMessage}`);
    }
  },
  
  /**
   * Check the status of a validation job
   * @param processId ID of the validation process
   * @returns Promise with validation status response
   */
  async getValidationStatus(processId: string): Promise<ValidationStatusResponse> {
    try {
      const response = await axios.get(`${VALIDATION_API}/status/${processId}`, {
        timeout: DEFAULT_TIMEOUT
      });
      return response.data;
    } catch (error: any) {
      console.error('Error checking validation status:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Status check failed: ${errorMessage}`);
    }
  },
  
  /**
   * Get validation results
   * @param resultId ID of the validation result
   * @returns Promise with validation result
   */
  async getValidationResults(resultId: string): Promise<ValidationResult> {
    try {
      const response = await axios.get(`${VALIDATION_API}/results/${resultId}`, {
        timeout: DEFAULT_TIMEOUT
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching validation results:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to retrieve results: ${errorMessage}`);
    }
  },
  
  /**
   * Apply fixes to a PDF based on validation results
   * @param file PDF file to fix
   * @param userId User ID
   * @param fixes List of fix types to apply
   * @param options Additional options for fixes
   * @returns Promise with fix job response
   */
  async applyFixes(
    file: File, 
    userId: string, 
    fixes: string[], 
    options?: FixParams['options']
  ): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    // Append each fix type
    fixes.forEach(fix => {
      formData.append('fixes', fix);
    });
    
    // Add fix options if provided
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`options.${key}`, value.toString());
        }
      });
    }
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error applying fixes:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Fix operation failed: ${errorMessage}`);
    }
  },
  
  /**
   * Check the status of a fix job
   * @param fixJobId ID of the fix job
   * @returns Promise with fix status response
   */
  async getFixStatus(fixJobId: string): Promise<FixStatusResponse> {
    try {
      const response = await axios.get(`${VALIDATION_API}/fix/status/${fixJobId}`, {
        timeout: DEFAULT_TIMEOUT
      });
      return response.data;
    } catch (error: any) {
      console.error('Error checking fix status:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Fix status check failed: ${errorMessage}`);
    }
  },
  
  /**
   * Download a fixed PDF
   * @param fixJobId ID of the fix job
   * @returns Promise with URL to download the fixed PDF
   */
  async getFixedPdfDownloadUrl(fixJobId: string): Promise<string> {
    try {
      const response = await axios.get(`${VALIDATION_API}/fix/download-url/${fixJobId}`, {
        timeout: DEFAULT_TIMEOUT
      });
      return response.data.downloadUrl;
    } catch (error: any) {
      console.error('Error getting fixed PDF download URL:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Failed to get download URL: ${errorMessage}`);
    }
  },

  /**
   * Download a fixed PDF directly as a blob
   * @param fixJobId ID of the fix job
   * @returns Promise with blob of the fixed PDF
   */
  async downloadFixedPdf(fixJobId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${VALIDATION_API}/fix/download/${fixJobId}`, {
        responseType: 'blob',
        timeout: UPLOAD_TIMEOUT // Large files might take time to download
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading fixed PDF:', error);
      const errorMessage = error.message;
      throw new Error(`Download failed: ${errorMessage}`);
    }
  },
  
  /**
   * Apply font embedding for non-embedded fonts
   * @param file PDF file to fix
   * @param userId User ID
   * @returns Promise with fix job response
   */
  async applyFontEmbedding(file: File, userId: string): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/fonts/embed`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error applying font embedding:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Font embedding failed: ${errorMessage}`);
    }
  },
  
  /**
   * Convert RGB colors to CMYK
   * @param file PDF file to fix
   * @param userId User ID
   * @param preserveBlack Whether to preserve pure black (K only)
   * @returns Promise with fix job response
   */
  async convertRgbToCmyk(file: File, userId: string, preserveBlack = true): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('preserveBlack', preserveBlack.toString());
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/color/rgb-to-cmyk`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error converting RGB to CMYK:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`RGB to CMYK conversion failed: ${errorMessage}`);
    }
  },
  
  /**
   * Apply ICC profile to a PDF
   * @param file PDF file to fix
   * @param userId User ID
   * @param profileName Name of the ICC profile to apply
   * @returns Promise with fix job response
   */
  async applyIccProfile(
    file: File, 
    userId: string, 
    profileName: string = 'FOGRA39'
  ): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('profileName', profileName);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/color/icc-profile`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error applying ICC profile:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`ICC profile application failed: ${errorMessage}`);
    }
  },
  
  /**
   * Flatten transparency in a PDF
   * @param file PDF file to fix
   * @param userId User ID
   * @param quality Quality level for the flattening (high, medium, low)
   * @returns Promise with fix job response
   */
  async flattenTransparency(
    file: File, 
    userId: string, 
    quality: 'high' | 'medium' | 'low' = 'high'
  ): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('quality', quality);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/color/flatten-transparency`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error flattening transparency:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Transparency flattening failed: ${errorMessage}`);
    }
  },

  /**
   * Convert PDF to PDF/A standard
   * @param file PDF file to convert
   * @param userId User ID
   * @param conformanceLevel PDF/A conformance level
   * @returns Promise with fix job response
   */
  async convertToPdfA(
    file: File,
    userId: string,
    conformanceLevel: '1b' | '1a' | '2b' | '2a' | '3b' | '3a' = '2b'
  ): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('conformanceLevel', conformanceLevel);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/compliance/pdf-a`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error converting to PDF/A:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`PDF/A conversion failed: ${errorMessage}`);
    }
  },

  /**
   * Convert PDF to PDF/X standard
   * @param file PDF file to convert
   * @param userId User ID
   * @param standard PDF/X standard
   * @returns Promise with fix job response
   */
  async convertToPdfX(
    file: File,
    userId: string,
    standard: '1a' | '3' | '4' = '4'
  ): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('standard', standard);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/compliance/pdf-x`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error converting to PDF/X:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`PDF/X conversion failed: ${errorMessage}`);
    }
  },

  /**
   * Add bleed to a PDF
   * @param file PDF file to fix
   * @param userId User ID
   * @param bleedMargin Bleed margin in mm
   * @returns Promise with fix job response
   */
  async addBleed(
    file: File,
    userId: string,
    bleedMargin: number = 3
  ): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('bleedMargin', bleedMargin.toString());
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/print-production/add-bleed`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error adding bleed:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Adding bleed failed: ${errorMessage}`);
    }
  },

  /**
   * Fix overprint settings in a PDF
   * @param file PDF file to fix
   * @param userId User ID
   * @returns Promise with fix job response
   */
  async fixOverprint(file: File, userId: string): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/color/overprint`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error fixing overprint settings:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Fixing overprint settings failed: ${errorMessage}`);
    }
  },

  /**
   * Remove JavaScript from a PDF
   * @param file PDF file to fix
   * @param userId User ID
   * @returns Promise with fix job response
   */
  async removeJavaScript(file: File, userId: string): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/security/remove-javascript`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error removing JavaScript:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Removing JavaScript failed: ${errorMessage}`);
    }
  },

  /**
   * Optimize images in a PDF
   * @param file PDF file to optimize
   * @param userId User ID
   * @param targetDpi Target DPI
   * @returns Promise with fix job response
   */
  async optimizeImages(
    file: File,
    userId: string,
    targetDpi: number = 300
  ): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('targetDpi', targetDpi.toString());
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/image/optimize`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error optimizing images:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Image optimization failed: ${errorMessage}`);
    }
  },

  /**
   * Fix XREF table in a PDF
   * @param file PDF file to fix
   * @param userId User ID
   * @returns Promise with fix job response
   */
  async fixXrefTable(file: File, userId: string): Promise<FixJobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${VALIDATION_API}/fix/structural/xref`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error fixing XREF table:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`XREF table fix failed: ${errorMessage}`);
    }
  }
};
