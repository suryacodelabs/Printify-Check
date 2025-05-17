
import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, X, FileIcon, Upload, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  maxSize?: number; // In bytes, default 50MB
  acceptedFileTypes?: string[];
  uploading?: boolean;
  uploadProgress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileAccepted,
  maxSize = 52428800, // 50MB default
  acceptedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff'
  ],
  uploading = false,
  uploadProgress = 0
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [internalUploading, setInternalUploading] = useState(false);
  const [internalUploadProgress, setInternalUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const progressInterval = useRef<number | null>(null);
  
  // Use either internal state or props for upload state
  const isUploading = uploading || internalUploading;
  const currentProgress = uploading ? uploadProgress : internalUploadProgress;
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const selectedFile = acceptedFiles[0];
    
    // Check file size
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds ${(maxSize/1048576).toFixed(1)}MB limit`);
      return;
    }
    
    // Check file type
    const fileType = selectedFile.type;
    if (!acceptedFileTypes.includes(fileType) && fileType !== '') {
      // Special handling for PDFs that might not have correct MIME type
      if (selectedFile.name.toLowerCase().endsWith('.pdf')) {
        // Accept it as PDF even if MIME type is incorrect
        setFile(selectedFile);
        return;
      }
      setError(`File type ${fileType || 'unknown'} is not supported`);
      return;
    }
    
    setFile(selectedFile);
  }, [maxSize, acceptedFileTypes]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tif', '.tiff']
    },
    maxFiles: 1,
    multiple: false,
    disabled: isUploading
  });
  
  const handleUpload = async () => {
    if (!file) return;
    
    setInternalUploading(true);
    setInternalUploadProgress(0);
    
    // Start simulated progress if we're using internal state
    // This will be overridden by real progress if available from parent
    if (!uploading) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      
      progressInterval.current = window.setInterval(() => {
        setInternalUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval.current!);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
    }
    
    try {
      // Pass the file to parent component
      onFileAccepted(file);
      
      // Let the parent component handle the actual upload logic
      // But if they don't control the uploading state, we'll finish our simulated progress
      if (!uploading) {
        setTimeout(() => {
          setInternalUploadProgress(100);
          
          setTimeout(() => {
            setInternalUploading(false);
            if (progressInterval.current) clearInterval(progressInterval.current);
          }, 500);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setInternalUploading(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
      
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload file",
        variant: "destructive"
      });
    }
  };
  
  const handleCancel = () => {
    setFile(null);
    setInternalUploadProgress(0);
    setInternalUploading(false);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Clean up interval on unmount
  React.useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {!file && (
        <Card 
          {...getRootProps()} 
          className={`p-6 border-2 border-dashed cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20' : 'bg-muted'}`}>
              <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isDragActive ? 'Drop your file here...' : 'Drag & drop your file here'}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                Supported files: PDF, JPEG, PNG, and TIFF up to {(maxSize/1048576).toFixed(0)}MB
              </p>
              
              <Button variant="outline" type="button" className="mt-2">
                Browse Files
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="h-auto p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {file && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-md">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              
              {isUploading && (
                <div className="mt-2">
                  <Progress value={currentProgress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </p>
                </div>
              )}
            </div>
            
            {!isUploading && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  size="sm"
                >
                  Upload
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {isUploading && (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
