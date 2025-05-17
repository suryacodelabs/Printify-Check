
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import AdvancedPdfTools from '@/components/pdf/AdvancedPdfTools';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const AdvancedPdfToolsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  
  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setProcessedFileUrl(null);
    
    toast({
      title: "File selected",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    });
  };
  
  const handleProcessComplete = (url: string) => {
    setProcessedFileUrl(url);
    
    toast({
      title: "Processing complete",
      description: "Your PDF has been processed successfully.",
    });
  };
  
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Advanced PDF Tools</h1>
        <p className="text-muted-foreground mb-8">
          Professional PDF optimization, color management, and standards compliance tools
        </p>
        
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="tools">PDF Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload PDF</CardTitle>
                <CardDescription>
                  Upload a PDF file to process with advanced tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader
                  onFileSelected={handleFileSelected}
                  acceptedFileTypes={['application/pdf']}
                  maxFileSize={20 * 1024 * 1024} // 20MB
                  label="Upload PDF Document"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tools">
            <AdvancedPdfTools 
              file={selectedFile}
              onProcessComplete={handleProcessComplete}
            />
            
            {processedFileUrl && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Processed File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-6">
                    <p className="mb-4">Your PDF has been processed successfully!</p>
                    <a 
                      href={processedFileUrl} 
                      download={selectedFile?.name?.replace('.pdf', '_processed.pdf') || 'processed.pdf'}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Download Processed PDF
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdvancedPdfToolsPage;
