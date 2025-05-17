
// We need to define the interface for the PDF service that's imported in the components
export interface RedactionParams {
  detect: {
    emails: boolean;
    phones: boolean;
    creditCards: boolean;
    socialSecurity: boolean;
  };
  customPatterns: string[];
  customTexts: string[];
}

export interface OCRParams {
  language: string;
  languages?: string[];
  ocrEngine: string;
  detectOrientation: boolean;
  enhanceImage: boolean;
  extractTables: boolean;
  quality: number;
  pdfA: boolean;
  pdfAVersion?: string;
  dpi?: number;
  imageType?: string;
  pageRanges?: string;
  ocrMode?: string;
  withLayout?: boolean;
  advanced?: {
    psmMode?: number;
    outputType?: string;
    enhanceContrast?: number;
    customParameters?: string;
  };
}

export interface ValidationParams {
  checkStructural: boolean;
  checkFonts: boolean;
  checkColor: boolean;
  checkImage: boolean;
  checkCompliance: boolean;
  checkSecurity: boolean;
  checkPrintProduction: boolean;
}

export interface OcrJobStatus {
  jobId: string;
  status: string;
  progress: number;
  outputFile?: string;
  processingTimeMs?: number;
  error?: string;
}

export interface OcrTextExtraction {
  jobId: string;
  text: string;
  pageCount: number;
  wordCount: number;
  pages?: Array<{
    pageNumber: number;
    text: string;
    words?: Array<{
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      confidence: number;
    }>;
  }>;
}

export interface PDFService {
  applyRedaction: (file: File, params: RedactionParams) => Promise<void>;
  applyFixes: (file: File, fixTypes: string[]) => Promise<void>;
  
  // Adding missing methods
  getFixedPdf: (checkId: string) => Promise<string>;
  downloadPreflightReport: (checkId: string) => Promise<string>;
  processOcr: (file: File, params: OCRParams) => Promise<any>;
  getProcessStatus: (processId: string) => Promise<any>;
  getCheckResults: (checkId: string) => Promise<any>;
  uploadForPreflightCheck: (file: File, params: any) => Promise<any>;
  cancelProcess: (processId: string) => Promise<void>;
  
  // OCR specific methods
  processOcrOnPages: (file: File, params: OCRParams, pageRanges: string) => Promise<any>;
  extractTextWithOcr: (file: File, params: OCRParams) => Promise<OcrTextExtraction>;
  getOcrJobStatus: (jobId: string) => Promise<OcrJobStatus>;
  downloadOcrPdf: (jobId: string) => Promise<Blob>;
  getSupportedOcrLanguages: () => Promise<{ languages: string[], languageNames: Record<string, string> }>;
  performAdvancedOcr: (file: File, params: OCRParams) => Promise<any>;
  
  // New validation API methods
  validatePDF: (file: File, params: ValidationParams) => Promise<any>;
  getValidationStatus: (processId: string) => Promise<any>;
  getValidationResults: (resultId: string) => Promise<any>;
  applyValidationFixes: (file: File, fixes: string[]) => Promise<any>;
  getFixStatus: (fixJobId: string) => Promise<any>;
  downloadFixedPdf: (fixJobId: string) => Promise<string>;
}

// Implement the mock service or update the existing one
export const pdfService: PDFService = {
  applyRedaction: async (file: File, params: RedactionParams): Promise<void> => {
    // Mock implementation for now
    console.log('Mock applyRedaction called with:', file.name, params);
    return new Promise(resolve => setTimeout(resolve, 1500));
  },
  
  applyFixes: async (file: File, fixTypes: string[]): Promise<void> => {
    // Mock implementation for now
    console.log('Mock applyFixes called with:', file.name, fixTypes);
    return new Promise(resolve => setTimeout(resolve, 1500));
  },
  
  // Adding implementations for the missing methods
  getFixedPdf: async (checkId: string): Promise<string> => {
    console.log('Mock getFixedPdf called with checkId:', checkId);
    // Mock returning a URL to a fixed PDF
    return new Promise(resolve => 
      setTimeout(() => resolve(`/api/preflight/fixed/${checkId}`), 1000)
    );
  },
  
  downloadPreflightReport: async (checkId: string): Promise<string> => {
    console.log('Mock downloadPreflightReport called with checkId:', checkId);
    // Mock returning a URL to a report PDF
    return new Promise(resolve => 
      setTimeout(() => resolve(`/api/preflight/report/${checkId}`), 1000)
    );
  },
  
  processOcr: async (file: File, params: OCRParams): Promise<any> => {
    console.log('Mock processOcr called with:', file.name, params);
    
    // In a real implementation, this would call the backend API
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('userId', getCurrentUserId());
    // formData.append('languages', params.languages ? params.languages.join(',') : params.language);
    // formData.append('pdfA', String(params.pdfA));
    // formData.append('dpi', String(params.dpi || 300));
    // formData.append('quality', String(params.quality));
    // formData.append('imageType', params.imageType || 'auto');
    // formData.append('detectOrientation', String(params.detectOrientation));
    // formData.append('enhanceImage', String(params.enhanceImage));
    
    // const response = await fetch('/api/ocr/process', {
    //   method: 'POST',
    //   body: formData
    // });
    
    // if (!response.ok) {
    //   throw new Error('Failed to process OCR request');
    // }
    
    // const data = await response.json();
    // return data;
    
    // Mock OCR response
    return new Promise(resolve => 
      setTimeout(() => resolve({
        success: true,
        jobId: `ocr-${Math.random().toString(36).substring(2, 11)}`,
        text: "Sample recognized text from the document",
        pages: 1
      }), 2000)
    );
  },
  
  processOcrOnPages: async (file: File, params: OCRParams, pageRanges: string): Promise<any> => {
    console.log('Mock processOcrOnPages called with:', file.name, params, pageRanges);
    
    // Mock OCR response for specific pages
    return new Promise(resolve => 
      setTimeout(() => resolve({
        success: true,
        jobId: `ocr-pages-${Math.random().toString(36).substring(2, 11)}`,
        pageRanges: pageRanges,
        status: "processing"
      }), 1500)
    );
  },
  
  extractTextWithOcr: async (file: File, params: OCRParams): Promise<OcrTextExtraction> => {
    console.log('Mock extractTextWithOcr called with:', file.name, params);
    
    // Mock text extraction response
    return new Promise(resolve => 
      setTimeout(() => resolve({
        jobId: `ocr-text-${Math.random().toString(36).substring(2, 11)}`,
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        pageCount: 3,
        wordCount: 120,
        pages: [
          {
            pageNumber: 1,
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            words: [
              { text: "Lorem", x: 100, y: 150, width: 50, height: 20, confidence: 0.95 },
              { text: "ipsum", x: 160, y: 150, width: 55, height: 20, confidence: 0.98 }
            ]
          },
          {
            pageNumber: 2,
            text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            words: [
              { text: "Sed", x: 100, y: 150, width: 30, height: 20, confidence: 0.97 },
              { text: "do", x: 140, y: 150, width: 25, height: 20, confidence: 0.99 }
            ]
          }
        ]
      }), 2500)
    );
  },
  
  getOcrJobStatus: async (jobId: string): Promise<OcrJobStatus> => {
    console.log('Mock getOcrJobStatus called with jobId:', jobId);
    
    // Mock job status response
    return new Promise(resolve => 
      setTimeout(() => resolve({
        jobId: jobId,
        status: "completed",
        progress: 100,
        outputFile: `${jobId}_processed.pdf`,
        processingTimeMs: 15243
      }), 500)
    );
  },
  
  downloadOcrPdf: async (jobId: string): Promise<Blob> => {
    console.log('Mock downloadOcrPdf called with jobId:', jobId);
    
    // Mock returning a PDF blob
    // In a real implementation, this would make an API call to download the file
    return new Promise(resolve => 
      setTimeout(() => {
        // Create a simple PDF-like blob (not a real PDF)
        const blob = new Blob(["PDF content would be here"], { type: "application/pdf" });
        resolve(blob);
      }, 1000)
    );
  },
  
  getSupportedOcrLanguages: async (): Promise<{ languages: string[], languageNames: Record<string, string> }> => {
    console.log('Mock getSupportedOcrLanguages called');
    
    // Mock languages response
    return new Promise(resolve => 
      setTimeout(() => resolve({
        languages: [
          "eng", "fra", "deu", "spa", "ita", "chi_sim", "chi_tra", "jpn", "rus", "ara", 
          "hin", "kor", "por", "nld", "swe", "fin", "dan", "nor", "pol", "tur", 
          "ces", "slk", "ron", "bul", "hrv", "ell", "lav", "lit", "hun", "ukr"
        ],
        languageNames: {
          "eng": "English",
          "fra": "French",
          "deu": "German",
          "spa": "Spanish",
          "ita": "Italian",
          "chi_sim": "Chinese (Simplified)",
          "chi_tra": "Chinese (Traditional)",
          "jpn": "Japanese",
          "rus": "Russian",
          "ara": "Arabic",
          "hin": "Hindi",
          "kor": "Korean",
          "por": "Portuguese",
          "nld": "Dutch",
          "swe": "Swedish",
          "fin": "Finnish",
          "dan": "Danish",
          "nor": "Norwegian",
          "pol": "Polish",
          "tur": "Turkish",
          "ces": "Czech",
          "slk": "Slovak",
          "ron": "Romanian",
          "bul": "Bulgarian",
          "hrv": "Croatian",
          "ell": "Greek",
          "lav": "Latvian",
          "lit": "Lithuanian",
          "hun": "Hungarian",
          "ukr": "Ukrainian"
        }
      }), 300)
    );
  },
  
  performAdvancedOcr: async (file: File, params: OCRParams): Promise<any> => {
    console.log('Mock performAdvancedOcr called with:', file.name, params);
    
    // Mock advanced OCR response
    return new Promise(resolve => 
      setTimeout(() => resolve({
        success: true,
        jobId: `ocr-adv-${Math.random().toString(36).substring(2, 11)}`,
        outputType: params.advanced?.outputType || "pdf",
        status: "processing"
      }), 1000)
    );
  },
  
  getProcessStatus: async (processId: string): Promise<any> => {
    console.log('Mock getProcessStatus called with processId:', processId);
    // Mock process status
    return new Promise(resolve => 
      setTimeout(() => resolve({
        processId,
        status: 'completed',
        progress: 100,
        resultId: processId
      }), 500)
    );
  },
  
  getCheckResults: async (checkId: string): Promise<any> => {
    console.log('Mock getCheckResults called with checkId:', checkId);
    // Mock preflight results
    return new Promise(resolve => 
      setTimeout(() => resolve({
        id: checkId,
        fileName: "document.pdf",
        fileSize: 1024 * 1024, // 1MB
        qualityScore: 85,
        status: 'completed',
        issuesCount: 2,
        issues: [
          {
            id: "issue-1",
            severity: "medium",
            title: "Low image resolution",
            message: "Image on page 1 has resolution below 300 DPI",
            page: 1,
            autoFixable: false
          },
          {
            id: "issue-2",
            severity: "high",
            title: "RGB color space",
            message: "Document contains RGB color space instead of CMYK",
            page: 2,
            autoFixable: true
          }
        ],
        annotations: []
      }), 1000)
    );
  },
  
  uploadForPreflightCheck: async (file: File, params: any): Promise<any> => {
    console.log('Mock uploadForPreflightCheck called with:', file.name, params);
    // Mock upload response
    return new Promise(resolve => 
      setTimeout(() => resolve({
        processId: `process-${Math.random().toString(36).substring(2, 11)}`,
        status: 'processing'
      }), 1500)
    );
  },
  
  cancelProcess: async (processId: string): Promise<void> => {
    console.log('Mock cancelProcess called with processId:', processId);
    // Mock cancel operation
    return new Promise(resolve => setTimeout(resolve, 500));
  },
  
  // New validation API methods
  validatePDF: async (file: File, params: ValidationParams): Promise<any> => {
    console.log('validatePDF called with:', file.name, params);
    // Mock validation response - in real implementation this would call the backend API
    return new Promise(resolve => 
      setTimeout(() => resolve({
        processId: `validation-${Math.random().toString(36).substring(2, 11)}`,
        status: 'processing'
      }), 1000)
    );
  },
  
  getValidationStatus: async (processId: string): Promise<any> => {
    console.log('getValidationStatus called with processId:', processId);
    // Mock validation status
    return new Promise(resolve => 
      setTimeout(() => resolve({
        processId,
        status: 'completed',
        progress: 100,
        resultId: processId
      }), 800)
    );
  },
  
  getValidationResults: async (resultId: string): Promise<any> => {
    console.log('getValidationResults called with resultId:', resultId);
    // Mock validation results
    return new Promise(resolve => 
      setTimeout(() => resolve({
        id: resultId,
        fileName: "document.pdf",
        fileSize: 1024 * 1024, // 1MB
        qualityScore: 82,
        status: 'completed',
        issuesByCategory: {
          STRUCTURAL: [
            {
              id: "struct-1",
              type: "Linearization",
              severity: "MEDIUM",
              message: "PDF is not linearized for web optimization",
              autoFixable: true,
              fixDescription: "Apply linearization to optimize file for web viewing"
            }
          ],
          FONTS: [
            {
              id: "font-1",
              type: "Non-Embedded Font",
              severity: "HIGH",
              message: "Font 'Arial' on page 1 is not embedded",
              page: 1,
              autoFixable: true,
              fixDescription: "Embed all fonts"
            }
          ],
          COLOR: [
            {
              id: "color-1",
              type: "RGB in CMYK",
              severity: "HIGH", 
              message: "RGB color space found on page 2 but document has CMYK output intent",
              page: 2,
              autoFixable: true,
              fixDescription: "Convert RGB to CMYK"
            }
          ],
          IMAGE: [
            {
              id: "image-1",
              type: "Low Resolution",
              severity: "HIGH",
              message: "Image on page 1 has low resolution (approximately 150 DPI). Minimum recommended is 300 DPI",
              page: 1,
              autoFixable: false,
              fixDescription: "Replace with higher resolution image"
            }
          ],
          PRINT_PRODUCTION: [
            {
              id: "print-1",
              type: "Bleed",
              severity: "HIGH",
              message: "Insufficient bleed on page 1. Minimum 3mm bleed required.",
              page: 1,
              autoFixable: true,
              fixDescription: "Add 3mm bleed to all sides"
            }
          ]
        },
        totalIssues: 5,
        supportedFixes: {
          linearization: true,
          fontEmbedding: true,
          rgbToCmyk: true,
          addBleed: true,
          flattenTransparency: false,
          optimizeImages: false,
          pdfA: false,
          pdfX: false
        }
      }), 1200)
    );
  },
  
  applyValidationFixes: async (file: File, fixes: string[]): Promise<any> => {
    console.log('applyValidationFixes called with:', file.name, fixes);
    // Mock fix submission
    return new Promise(resolve => 
      setTimeout(() => resolve({
        fixJobId: `fix-${Math.random().toString(36).substring(2, 11)}`,
        status: 'processing'
      }), 800)
    );
  },
  
  getFixStatus: async (fixJobId: string): Promise<any> => {
    console.log('getFixStatus called with fixJobId:', fixJobId);
    // Mock fix status
    return new Promise(resolve => 
      setTimeout(() => resolve({
        fixJobId,
        status: 'completed',
        progress: 100,
        resultId: fixJobId
      }), 700)
    );
  },
  
  downloadFixedPdf: async (fixJobId: string): Promise<string> => {
    console.log('downloadFixedPdf called with fixJobId:', fixJobId);
    // Mock returning a URL to a fixed PDF
    return new Promise(resolve => 
      setTimeout(() => resolve(`/api/validation/fix/download/${fixJobId}`), 600)
    );
  }
};

// Add a proper API service for making HTTP requests
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for handling errors
apiService.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
