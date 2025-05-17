
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageFormat, useGhostscript } from '@/hooks/useGhostscript';
import { useToast } from '@/hooks/use-toast';
import { FileImage, Download } from 'lucide-react';

interface PDFImageExtractorProps {
  file: File | null;
  onImageExtracted?: (imageUrl: string) => void;
}

const PDFImageExtractor: React.FC<PDFImageExtractorProps> = ({ file, onImageExtracted }) => {
  const [format, setFormat] = useState<ImageFormat>('png');
  const [dpi, setDpi] = useState<number>(300);
  const [renderDpi, setRenderDpi] = useState<number>(150);
  const [maxPages, setMaxPages] = useState<number>(1);
  const { toast } = useToast();
  const gs = useGhostscript();

  const handleConvertToImages = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = await gs.convertToImages(file, format, dpi);
    if (imageUrl && onImageExtracted) {
      onImageExtracted(imageUrl);
    }
  };

  const handleRenderPages = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    await gs.renderPdfPages(file, renderDpi, maxPages);
  };

  const handleDownloadImages = () => {
    if (gs.convertedImagesUrl) {
      const a = document.createElement('a');
      a.href = gs.convertedImagesUrl;
      a.download = file ? file.name.replace('.pdf', '') + '_images.zip' : 'images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PDF Image Extraction</CardTitle>
          <CardDescription>
            Upload a PDF file to extract images
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>PDF Image Extraction</CardTitle>
        <CardDescription>
          Convert PDF pages to images using Ghostscript {import.meta.env.VITE_GHOSTSCRIPT_VERSION}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="extract">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="extract">Extract All Pages</TabsTrigger>
            <TabsTrigger value="preview">Preview Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Image Format</Label>
                <Select 
                  value={format} 
                  onValueChange={(value) => setFormat(value as ImageFormat)}
                >
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (best quality)</SelectItem>
                    <SelectItem value="jpg">JPEG (smallest size)</SelectItem>
                    <SelectItem value="tiff">TIFF (for print)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="dpi">Resolution: {dpi} DPI</Label>
                  <span className="text-xs text-muted-foreground">
                    Higher = Better Quality
                  </span>
                </div>
                <Slider
                  id="dpi"
                  min={72}
                  max={600}
                  step={1}
                  value={[dpi]}
                  onValueChange={(value) => setDpi(value[0])}
                />
              </div>

              <Button 
                onClick={handleConvertToImages}
                disabled={gs.isConverting}
                className="w-full"
              >
                <FileImage className="w-4 h-4 mr-2" />
                {gs.isConverting ? 'Converting...' : 'Convert PDF to Images'}
              </Button>
              
              {gs.isConverting && (
                <Progress value={50} className="w-full animate-pulse" />
              )}
              
              {gs.convertedImagesUrl && (
                <Button 
                  variant="outline" 
                  onClick={handleDownloadImages}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All Images (ZIP)
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="render-dpi">Preview DPI</Label>
                  <Slider
                    id="render-dpi"
                    min={72}
                    max={300}
                    step={1}
                    value={[renderDpi]}
                    onValueChange={(value) => setRenderDpi(value[0])}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {renderDpi} DPI
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-pages">Max Pages</Label>
                  <Input
                    id="max-pages"
                    type="number"
                    min={1}
                    max={50}
                    value={maxPages}
                    onChange={(e) => setMaxPages(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleRenderPages}
                disabled={gs.isRendering}
                className="w-full"
              >
                <FileImage className="w-4 h-4 mr-2" />
                {gs.isRendering ? 'Rendering...' : 'Render Preview'}
              </Button>
              
              {gs.isRendering && (
                <Progress value={50} className="w-full animate-pulse" />
              )}
              
              {gs.renderedPages && gs.renderedPages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    Page Previews ({gs.renderedPages.length} of {gs.totalPages || '?'})
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gs.renderedPages.map((page) => (
                      <div key={page.page} className="border rounded-md p-2">
                        <div className="text-xs text-muted-foreground mb-1">
                          Page {page.page}
                        </div>
                        <img 
                          src={page.image} 
                          alt={`Page ${page.page}`} 
                          className="w-full h-auto" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Powered by Ghostscript {import.meta.env.VITE_GHOSTSCRIPT_VERSION}
        </div>

        {gs.error && (
          <div className="text-sm text-destructive">{gs.error}</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PDFImageExtractor;
