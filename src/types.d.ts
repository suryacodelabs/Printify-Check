
/// <reference types="vite/client" />


// Type definitions for react-pdf
declare module 'react-pdf' {
  import { Component, ReactElement } from 'react';

  export interface DocumentProps {
    file: string | File | ArrayBuffer;
    onLoadSuccess?: (pdf: any) => void;
    onLoadError?: (error: Error) => void;
    loading?: ReactElement | string;
    noData?: ReactElement | string;
    className?: string;
    options?: any;
    children?: React.ReactNode;
  }

  export class Document extends Component<DocumentProps> {}

  export interface PageProps {
    pageNumber: number;
    width?: number;
    scale?: number;
    rotate?: number;
    className?: string;
    onRenderSuccess?: () => void;
    onRenderError?: (error: Error) => void;
    loading?: ReactElement | string;
    noData?: ReactElement | string;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
  }

  export class Page extends Component<PageProps> {}

  export interface OutlineProps {
    className?: string;
    onLoadSuccess?: (outline: any) => void;
    onLoadError?: (error: Error) => void;
    onItemClick?: (item: any) => void;
  }

  export class Outline extends Component<OutlineProps> {}

  export const pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    version: string;
  };
}

// Define RedactionParams type for the API service
interface RedactionParams {
  detect: {
    emails: boolean;
    phones: boolean;
    creditCards: boolean;
    socialSecurity: boolean;
  };
  customPatterns: string[];
  customTexts: string[];
}

// Type definitions for wizard steps
interface UploadStepProps {
  onFileAccepted: (file: File) => void;
}

interface PreflightStepProps {
  file: File | null;
  onPreflightComplete: (results: any[]) => void;
  isProOrTeam: boolean;
}

interface ValidationStepProps {
  file: File | null;
  onBack: () => void;
  onComplete: () => void;
}

interface OCRStepProps {
  file: File | null;
  isProOrTeam: boolean;
  onBack: () => void;
  onOCRComplete: () => void;
  onComplete: () => void;
}

interface RedactionStepProps {
  file: File | null;
  isProOrTeam: boolean;
  onBack: () => void;
  onRedactionComplete: () => void;
}

interface FixesStepProps {
  file: File | null;
  preflightSuccess: boolean;
  preflightResults: any[];
  isProOrTeam: boolean;
  onComplete: () => void | Promise<void>;
}
