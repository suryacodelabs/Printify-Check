
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Download, FileText, Languages, Search } from 'lucide-react';
import { OcrTextExtraction } from '@/services/apiService';

interface OCRResultViewerProps {
  result: OcrTextExtraction;
  onDownload?: () => Promise<void>;
  onClose?: () => void;
}

const OCRResultViewer: React.FC<OCRResultViewerProps> = ({ 
  result, 
  onDownload,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('text');
  
  if (!result) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert>
            <AlertDescription>
              No OCR results to display.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl mb-1">OCR Results</CardTitle>
            <CardDescription>
              Text extracted from your document
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {result.pageCount} pages
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Book className="h-3 w-3" />
              {result.wordCount} words
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Extracted Text</TabsTrigger>
            <TabsTrigger value="pages">Page by Page</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/20 h-60 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm">{result.text || "No text was extracted from the document."}</pre>
            </div>
          </TabsContent>
          
          <TabsContent value="pages" className="space-y-4">
            {result.pages ? (
              <div className="space-y-4">
                {result.pages.map((page, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h4 className="text-sm font-medium mb-2">Page {page.pageNumber}</h4>
                    <div className="bg-muted/20 p-3 rounded max-h-40 overflow-auto">
                      <pre className="whitespace-pre-wrap text-xs">{page.text}</pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-md p-4 bg-muted/20">
                <p className="text-sm text-muted-foreground">No page-specific text data available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        {onDownload && (
          <Button onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OCRResultViewer;
