
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFControlsProps {
  pageNumber: number;
  numPages: number | null;
  scale: number;
  onPageChange: (newPage: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  handlePageNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PDFControls: React.FC<PDFControlsProps> = ({
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onZoomIn,
  onZoomOut,
  handlePageNumberChange
}) => {
  const goToPrevPage = () => {
    const newPage = Math.max(pageNumber - 1, 1);
    onPageChange(newPage);
  };

  const goToNextPage = () => {
    if (numPages !== null) {
      const newPage = Math.min(pageNumber + 1, numPages);
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          <Input 
            className="w-12 h-8 p-1 text-center"
            type="number"
            min={1}
            max={numPages || 1}
            value={pageNumber}
            onChange={handlePageNumberChange}
          />
          <span className="text-sm text-muted-foreground">
            / {numPages || 1}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={numPages === null || pageNumber >= numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={scale <= 0.6}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-sm">
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={scale >= 2.0}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PDFControls;
