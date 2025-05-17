
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import FileUpload from '@/components/pdf/FileUpload';
import PDFViewer from '@/components/pdf/PDFViewer';
import PDFPrintOptimizer from '@/components/pdf/PDFPrintOptimizer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, RefreshCw } from 'lucide-react';

const PdfPrintOptimization: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [optimizedPdfUrl, setOptimizedPdfUrl] = useState<string | null>(null);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setOptimizedPdfUrl(null);
  };

  const handleOptimized = (pdfUrl: string) => {
    setOptimizedPdfUrl(pdfUrl);
  };

  const downloadPdf = () => {
    if (optimizedPdfUrl) {
      const a = document.createElement('a');
      a.href = optimizedPdfUrl;
      a.download = file ? 'print_ready_' + file.name : 'print_ready.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetState = () => {
    setFile(null);
    if (optimizedPdfUrl) URL.revokeObjectURL(optimizedPdfUrl);
    setOptimizedPdfUrl(null);
  };

  return (
    <Layout>
      <Helmet>
        <title>PDF Print Optimization - PrintifyCheck</title>
        <meta name="description" content="Optimize PDFs for professional printing with Ghostscript" />
      </Helmet>

      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PDF Print Optimization</h1>
            <p className="text-muted-foreground mt-2">
              Prepare PDFs for professional printing with Ghostscript {import.meta.env.VITE_GHOSTSCRIPT_VERSION}
            </p>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <FileUpload 
                onFileAccepted={handleFileUpload} 
                acceptedFileTypes={['.pdf']}
                maxSize={25 * 1024 * 1024} // 25MB
              />

              {file && (
                <div className="border rounded-lg overflow-hidden h-[500px]">
                  <PDFViewer 
                    file={file} 
                    showControls={true}
                    maxHeight="500px"
                  />
                </div>
              )}

              {optimizedPdfUrl && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Optimized PDF Preview</h3>
                  <div className="border rounded-lg overflow-hidden h-[500px]">
                    <PDFViewer 
                      file={optimizedPdfUrl} 
                      showControls={true}
                      maxHeight="500px"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <PDFPrintOptimizer 
                file={file} 
                onOptimized={handleOptimized}
              />

              {optimizedPdfUrl && (
                <div className="flex space-x-4">
                  <Button 
                    onClick={downloadPdf}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Optimized PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetState}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PdfPrintOptimization;
