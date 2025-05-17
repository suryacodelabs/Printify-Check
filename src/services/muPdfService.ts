
import { apiService } from './apiService';

export interface MuPdfDocumentInfo {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
  pageCount: number;
  format: string;
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

export interface MuPdfFont {
  name: string;
  type: string;
  embedded: boolean;
  subset: boolean;
}

export interface MuPdfColorSpace {
  name: string;
  type: string;
  components: number;
}

export interface MuPdfStructureNode {
  type: string;
  children?: MuPdfStructureNode[];
}

export interface MuPdfPageInfo {
  width: number;
  height: number;
  rotation: number;
  boxes?: {
    mediaBox?: number[];
    cropBox?: number[];
    bleedBox?: number[];
    trimBox?: number[];
    artBox?: number[];
  };
}

export interface MuPdfAnnotation {
  id: string;
  type: string;
  page: number;
  content?: string;
}

export interface MuPdfVersionInfo {
  version: string;
  build: string;
  date: string;
}

export const muPdfService = {
  async analyzeDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.post('/mupdf/analyze', formData);
    return response.data;
  },
  
  async repairPdf(file: File, options?: { fixXref?: boolean, fixDamage?: boolean, cleanMetadata?: boolean }): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      if (options.fixXref) formData.append('fixXref', 'true');
      if (options.fixDamage) formData.append('fixDamage', 'true');
      if (options.cleanMetadata) formData.append('cleanMetadata', 'true');
    }
    
    const response = await apiService.post('/mupdf/repair', formData, {
      responseType: 'blob'
    });
    
    return response.data;
  },
  
  async embedFonts(file: File, subset: boolean = true): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subset', subset.toString());
    
    const response = await apiService.post('/mupdf/embed-fonts', formData, {
      responseType: 'blob'
    });
    
    return response.data;
  },
  
  async convertColorSpace(file: File, targetColorSpace: string = 'cmyk', preserveBlack: boolean = true): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetColorSpace', targetColorSpace);
    formData.append('preserveBlack', preserveBlack.toString());
    
    const response = await apiService.post('/mupdf/convert-color', formData, {
      responseType: 'blob'
    });
    
    return response.data;
  },
  
  async flattenTransparency(file: File, quality: 'low' | 'medium' | 'high' = 'high'): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    
    const response = await apiService.post('/mupdf/flatten-transparency', formData, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  async renderPage(file: File, pageNumber: number, options: { dpi?: number, colorspace?: 'rgb' | 'cmyk' | 'gray' } = {}): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageNumber', pageNumber.toString());
    
    if (options.dpi) formData.append('dpi', options.dpi.toString());
    if (options.colorspace) formData.append('colorspace', options.colorspace);
    
    const response = await apiService.post('/mupdf/render-page', formData, {
      responseType: 'blob'
    });
    
    return URL.createObjectURL(response.data);
  },

  async extractText(file: File, pageRange?: string): Promise<string | Record<string, string>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (pageRange) formData.append('pageRange', pageRange);
    
    const response = await apiService.post('/mupdf/extract-text', formData);
    return response.data;
  },

  async convertDocument(file: File, options: { format: string, quality: 'low' | 'medium' | 'high', pages?: string }): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', options.format);
    formData.append('quality', options.quality);
    
    if (options.pages) formData.append('pages', options.pages);
    
    const response = await apiService.post('/mupdf/convert', formData, {
      responseType: 'blob'
    });
    
    return URL.createObjectURL(response.data);
  },

  async getAnnotations(file: File): Promise<MuPdfAnnotation[]> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiService.post('/mupdf/annotations', formData);
    return response.data;
  },

  async protectDocument(file: File, options: { 
    password?: string, 
    ownerPassword?: string, 
    permissions: {
      canPrint: boolean,
      canCopy: boolean,
      canModify: boolean,
      canAnnotate: boolean
    }
  }): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.password) formData.append('password', options.password);
    if (options.ownerPassword) formData.append('ownerPassword', options.ownerPassword);
    
    formData.append('canPrint', options.permissions.canPrint.toString());
    formData.append('canCopy', options.permissions.canCopy.toString());
    formData.append('canModify', options.permissions.canModify.toString());
    formData.append('canAnnotate', options.permissions.canAnnotate.toString());
    
    const response = await apiService.post('/mupdf/protect', formData, {
      responseType: 'blob'
    });
    
    return URL.createObjectURL(response.data);
  },

  async getVersionInfo(): Promise<MuPdfVersionInfo> {
    const response = await apiService.get('/mupdf/version');
    return response.data;
  }
};
