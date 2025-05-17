
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FileText, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdvancedFixTools from "@/components/pdf/AdvancedFixTools";

const MuPdfToolbox: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      toast({
        title: "File Selected",
        description: `Selected ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`,
      });
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsUploading(false);
    
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];
      
      if (droppedFile.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please drop a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
      toast({
        title: "File Dropped",
        description: `Selected ${droppedFile.name} (${(droppedFile.size / 1024 / 1024).toFixed(2)}MB)`,
      });
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsUploading(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsUploading(false);
  };
  
  const handleFixComplete = (fixedFile: Blob) => {
    setProcessedFile(fixedFile);
  };
  
  const handleReset = () => {
    setFile(null);
    setProcessedFile(null);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advanced PDF Toolbox (MuPDF {import.meta.env.VITE_MUPDF_VERSION})
          </CardTitle>
          <CardDescription>
            Analyze and repair PDF issues with advanced tools
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!file ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isUploading ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload PDF Document</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your PDF file here or click to select
              </p>
              <div>
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Button variant="outline" className="relative">
                    Select PDF File
                    <input
                      type="file"
                      id="pdf-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </Button>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Change
                </Button>
              </div>
              
              <div className="pt-2">
                <AdvancedFixTools file={file} onFixComplete={handleFixComplete} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MuPdfToolbox;
