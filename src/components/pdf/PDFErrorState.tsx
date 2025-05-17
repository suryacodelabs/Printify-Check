
import React from 'react';
import { File, AlertTriangle } from 'lucide-react';

interface PDFErrorStateProps {
  error: Error | null;
  fileUrl: string | null;
}

const PDFErrorState: React.FC<PDFErrorStateProps> = ({ error, fileUrl }) => {
  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <File className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No PDF file available</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
        <p className="text-red-500 font-medium">Error loading PDF</p>
        <p className="text-muted-foreground text-sm mt-2">
          There was an issue displaying this PDF file.
        </p>
      </div>
    );
  }

  return null;
};

export default PDFErrorState;
