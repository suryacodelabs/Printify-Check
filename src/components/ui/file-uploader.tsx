
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  label?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  acceptedFileTypes = ['application/pdf'],
  maxFileSize = 10 * 1024 * 1024, // 10MB by default
  label = 'Drag and drop a file here'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const validateFile = (file: File): string | null => {
    // Check file type
    if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
      return `File type not accepted. Please upload a ${acceptedFileTypes.join(' or ')} file.`;
    }
    
    // Check file size
    if (maxFileSize && file.size > maxFileSize) {
      return `File is too large. Maximum size is ${(maxFileSize / 1024 / 1024).toFixed(1)}MB.`;
    }
    
    return null;
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
      } else {
        onFileSelected(file);
      }
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
      } else {
        onFileSelected(file);
      }
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept={acceptedFileTypes.join(',')}
          className="hidden"
        />
        
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        
        <p className="mb-2 text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          Click to browse or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {acceptedFileTypes.map(type => type.replace('application/', '').toUpperCase()).join(', ')} files up to {(maxFileSize / 1024 / 1024).toFixed(0)}MB
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
