
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface RedactionParams {
  patterns?: string[];
  categories?: string[];
  customTexts?: string[];
  redactionColor?: string;
  redactionText?: string;
  textColor?: string;
  fontSize?: number;
}

export interface MetadataStrippingParams {
  fields?: string[];
}

export interface RedactionJobResponse {
  jobId: string;
  userId: string;
  fileName: string;
  status: string;
}

export interface RedactionJobStatus {
  jobId: string;
  status: string;
  outputFile: string;
}

export const redactionService = {
  /**
   * Apply redaction to a PDF file
   */
  async applyRedaction(file: File, userId: string, params: RedactionParams): Promise<RedactionJobResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      // Add patterns if provided
      if (params.patterns && params.patterns.length > 0) {
        params.patterns.forEach(pattern => {
          if (pattern.trim()) {
            formData.append('patterns', pattern);
          }
        });
      }
      
      // Add categories if provided
      if (params.categories && params.categories.length > 0) {
        params.categories.forEach(category => {
          formData.append('categories', category);
        });
      }
      
      // Add custom texts if provided
      if (params.customTexts && params.customTexts.length > 0) {
        params.customTexts.forEach(text => {
          if (text.trim()) {
            formData.append('texts', text);
          }
        });
      }
      
      // Add appearance options
      if (params.redactionColor) {
        formData.append('redactionColor', params.redactionColor);
      }
      
      if (params.redactionText) {
        formData.append('redactionText', params.redactionText);
      }
      
      if (params.textColor) {
        formData.append('textColor', params.textColor);
      }
      
      if (params.fontSize) {
        formData.append('fontSize', params.fontSize.toString());
      }
      
      const response = await axios.post(`${API_URL}/redaction/redact`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error applying redaction:', error);
      throw new Error(error.response?.data || 'Failed to apply redaction');
    }
  },
  
  /**
   * Strip metadata from a PDF file
   */
  async stripMetadata(file: File, userId: string, params?: MetadataStrippingParams): Promise<RedactionJobResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      // Add fields if provided
      if (params?.fields && params.fields.length > 0) {
        params.fields.forEach(field => {
          formData.append('fields', field);
        });
      }
      
      const response = await axios.post(`${API_URL}/redaction/strip-metadata`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error stripping metadata:', error);
      throw new Error(error.response?.data || 'Failed to strip metadata');
    }
  },
  
  /**
   * Get redaction job status
   */
  async getRedactionStatus(jobId: string): Promise<RedactionJobStatus> {
    try {
      const response = await axios.get(`${API_URL}/redaction/status/${jobId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching redaction status:', error);
      throw new Error(error.response?.data || 'Failed to fetch redaction status');
    }
  },
  
  /**
   * Download redacted PDF
   */
  async downloadRedactedPdf(jobId: string, fileName: string): Promise<Blob> {
    try {
      const response = await axios.get(`${API_URL}/redaction/download/${jobId}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'redacted-document.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return response.data;
    } catch (error: any) {
      console.error('Error downloading redacted PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the redacted PDF. Please try again.",
        variant: "destructive",
      });
      throw new Error(error.response?.data || 'Failed to download redacted PDF');
    }
  },
};
