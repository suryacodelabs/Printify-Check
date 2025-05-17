
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import FileUpload from '@/components/pdf/FileUpload';
import PDFViewer from '@/components/pdf/PDFViewer';
import PDFImageExtractor from '@/components/pdf/PDFImageExtractor';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, RefreshCw } from 'lucide-react';

const PdfImageExtraction: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedImageUrl, setExtractedImageUrl] = useState<string | null>(null);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setExtractedImageUrl(null);
  };

  const handleImageExtracted = (imageUrl: string) => {
    setExtractedImageUrl(imageUrl);
  };

  const downloadZip = () => {
    if (extractedImageUrl) {
      const a = document.createElement('a');
      a.href = extractedImageUrl;
      a.download = file ? file.name.replace('.pdf', '') + '_images.zip' : 'images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const resetState = () => {
    setFile(null);
    if (extractedImageUrl) URL.revokeObjectURL(extractedImageUrl);
    setExtractedImageUrl(null);
  };

  return (
    <Layout>
      <Helmet>
        <title>PDF Image Extraction - Print PDF</title>
        <meta name="description" content="Extract high-quality images from PDF files using Ghostscript" />
      </Helmet>

      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PDF Image Extraction</h1>
            <p className="text-muted-foreground mt-2">
              Extract images from PDF files in various formats using Ghostscript {import.meta.env.VITE_GHOSTSCRIPT_VERSION}
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
            </div>

            <div className="space-y-6">
              <PDFImageExtractor 
                file={file} 
                onImageExtracted={handleImageExtracted}
              />

              {extractedImageUrl && (
                <div className="flex space-x-4">
                  <Button 
                    onClick={downloadZip}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Images
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

export default PdfImageExtraction;
