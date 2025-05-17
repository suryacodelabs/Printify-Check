
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Skeleton } from '@/components/ui/skeleton';
import { PDFIssue } from '@/types/pdf';
import { useToast } from '@/hooks/use-toast';
import PDFControls from './PDFControls';
import PDFAnnotations from './PDFAnnotations';
import PDFErrorState from './PDFErrorState';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file: string | File | null;
  annotations?: any[];
  issues?: PDFIssue[];
  showControls?: boolean;
  maxHeight?: string | number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  file, 
  annotations = [],
  issues = [],
  showControls = true,
  maxHeight = '100%',
  currentPage,
  onPageChange
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(currentPage || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update internal page state when currentPage prop changes
  useEffect(() => {
    if (currentPage && currentPage !== pageNumber) {
      setPageNumber(currentPage);
    }
  }, [currentPage, pageNumber]);

  // Convert File to URL if needed
  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof file === 'string') {
      setFileUrl(file);
    } else {
      setFileUrl(null);
    }
  }, [file]);

  // Function to handle document loading success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (!currentPage) {
      setPageNumber(1);
    }
    setLoading(false);
  };

  // Function to handle document loading error
  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setLoading(false);
    
    toast({
      title: "Error Loading PDF",
      description: "There was an issue loading the PDF document. Please try again.",
      variant: "destructive",
    });
  };

  // Handle page change from controls
  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Handle direct page number input
  const handlePageNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && numPages !== null) {
      const newPage = Math.min(Math.max(1, value), numPages);
      handlePageChange(newPage);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };

  // Error state or no file handling
  const errorState = <PDFErrorState error={error} fileUrl={fileUrl} />;
  if (errorState) return errorState;

  return (
    <div 
      className="pdf-viewer flex flex-col h-full"
      style={{ maxHeight }}
    >
      {showControls && (
        <PDFControls 
          pageNumber={pageNumber}
          numPages={numPages}
          scale={scale}
          onPageChange={handlePageChange}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          handlePageNumberChange={handlePageNumberChange}
        />
      )}
      
      <div 
        className="flex-1 overflow-auto relative border rounded-md"
        ref={canvasRef}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-[400px]">
              <span className="loading">Loading PDF...</span>
            </div>
          }
          className="pdf-document"
        >
          <div className="relative">
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
              loading={
                <div className="flex items-center justify-center h-[400px]">
                  <span className="loading">Loading page...</span>
                </div>
              }
            />
            <PDFAnnotations 
              issues={issues} 
              pageNumber={pageNumber} 
              scale={scale} 
            />
          </div>
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
