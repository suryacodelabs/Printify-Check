
import axios, { AxiosRequestConfig } from 'axios';
import { VeraPDFValidationResult, VeraPDFConversionResult, VeraPDFSanitizationResult } from '@/types/validation';

// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const COMPLIANCE_API = `${API_BASE_URL}/compliance`;

// Request timeout settings (ms)
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const UPLOAD_TIMEOUT = 300000;  // 5 minutes for uploads

/**
 * Service for VeraPDF validation and fix operations
 */
export const veraPdfService = {
  /**
   * Validate PDF/A compliance using VeraPDF
   * 
   * @param file PDF file to validate
   * @param flavour PDF/A flavour to validate against (e.g., "1b", "2a")
   * @returns Promise with validation result
   */
  async validatePdfA(file: File, flavour: string = '1b'): Promise<VeraPDFValidationResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('flavour', flavour);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${COMPLIANCE_API}/validate/pdfa`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error validating PDF/A:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`PDF/A validation failed: ${errorMessage}`);
    }
  },
  
  /**
   * Validate PDF/UA compliance using VeraPDF
   * 
   * @param file PDF file to validate
   * @returns Promise with validation result
   */
  async validatePdfUA(file: File): Promise<VeraPDFValidationResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${COMPLIANCE_API}/validate/pdfua`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error validating PDF/UA:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`PDF/UA validation failed: ${errorMessage}`);
    }
  },
  
  /**
   * Validate WCAG compliance using VeraPDF
   * 
   * @param file PDF file to validate
   * @returns Promise with validation result
   */
  async validateWcag(file: File): Promise<VeraPDFValidationResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${COMPLIANCE_API}/validate/wcag`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error validating WCAG:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`WCAG validation failed: ${errorMessage}`);
    }
  },
  
  /**
   * Convert PDF to PDF/A using VeraPDF
   * 
   * @param file PDF file to convert
   * @param flavour PDF/A flavour to convert to (e.g., "1b", "2a")
   * @returns Promise with conversion result
   */
  async convertToPdfA(file: File, flavour: string = '1b'): Promise<VeraPDFConversionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('flavour', flavour);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${COMPLIANCE_API}/fix/convert-to-pdfa`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error converting to PDF/A:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`PDF/A conversion failed: ${errorMessage}`);
    }
  },
  
  /**
   * Sanitize PDF metadata using VeraPDF
   * 
   * @param file PDF file to sanitize
   * @returns Promise with sanitization result
   */
  async sanitizeMetadata(file: File): Promise<VeraPDFSanitizationResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: UPLOAD_TIMEOUT
      };
      
      const response = await axios.post(`${COMPLIANCE_API}/fix/sanitize-metadata`, formData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error sanitizing metadata:', error);
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`Metadata sanitization failed: ${errorMessage}`);
    }
  }
};
