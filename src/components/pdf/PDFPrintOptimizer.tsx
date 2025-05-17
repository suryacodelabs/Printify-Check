
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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OptimizationQuality, useGhostscript } from '@/hooks/useGhostscript';
import { useToast } from '@/hooks/use-toast';
import { Printer, PaintBucket, Download, FileCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PDFPrintOptimizerProps {
  file: File | null;
  onOptimized?: (pdfUrl: string) => void;
}

const PDFPrintOptimizer: React.FC<PDFPrintOptimizerProps> = ({ file, onOptimized }) => {
  const { toast } = useToast();
  const gs = useGhostscript();

  // Optimization settings
  const [quality, setQuality] = useState<OptimizationQuality>('printer');
  
  // Print settings
  const [bleedMargin, setBleedMargin] = useState<number>(9);
  const [convertToCmyk, setConvertToCmyk] = useState<boolean>(true);
  const [preserveBlack, setPreserveBlack] = useState<boolean>(true);
  const [flattenTransparency, setFlattenTransparency] = useState<boolean>(true);
  const [downsampleImages, setDownsampleImages] = useState<boolean>(false);
  const [resolution, setResolution] = useState<number>(300);
  const [embedAllFonts, setEmbedAllFonts] = useState<boolean>(true);

  const handleOptimize = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    const pdfUrl = await gs.optimizePdf(file, quality);
    if (pdfUrl && onOptimized) {
      onOptimized(pdfUrl);
    }
  };

  const handleAddBleed = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    const pdfUrl = await gs.addBleed(file, bleedMargin);
    if (pdfUrl && onOptimized) {
      onOptimized(pdfUrl);
    }
  };

  const handlePreparePrintReady = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    const options = {
      convertToCmyk,
      preserveBlack,
      flattenTransparency,
      downsampleImages,
      resolution,
      embedAllFonts,
      quality,
    };

    const pdfUrl = await gs.preparePrintReady(file, options);
    if (pdfUrl && onOptimized) {
      onOptimized(pdfUrl);
    }
  };

  const handleDownload = (urlProperty: 'optimizedPdfUrl' | 'printReadyPdfUrl' | 'bleedPdfUrl') => {
    const url = gs[urlProperty];
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      const filename = file ? 
                      (urlProperty === 'optimizedPdfUrl' ? 'optimized_' : 
                       urlProperty === 'printReadyPdfUrl' ? 'print_ready_' : 'with_bleed_') + 
                      file.name : 
                      'processed.pdf';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PDF Print Optimizer</CardTitle>
          <CardDescription>
            Upload a PDF file to optimize it for printing
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>PDF Print Optimizer</CardTitle>
        <CardDescription>
          Prepare your PDF for professional printing using Ghostscript {import.meta.env.VITE_GHOSTSCRIPT_VERSION}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="optimize">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="optimize">Quick Optimize</TabsTrigger>
            <TabsTrigger value="bleed">Add Bleed</TabsTrigger>
            <TabsTrigger value="print">Print Preparation</TabsTrigger>
          </TabsList>

          <TabsContent value="optimize" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quality">Optimization Level</Label>
                <Select 
                  value={quality}
                  onValueChange={(value) => setQuality(value as OptimizationQuality)}
                >
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screen">Screen (72 dpi, lowest quality)</SelectItem>
                    <SelectItem value="ebook">eBook (150 dpi, medium quality)</SelectItem>
                    <SelectItem value="printer">Printer (300 dpi, high quality)</SelectItem>
                    <SelectItem value="prepress">Prepress (300+ dpi, highest quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleOptimize}
                disabled={gs.isOptimizing}
                className="w-full"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                {gs.isOptimizing ? 'Optimizing...' : 'Optimize PDF'}
              </Button>
              
              {gs.isOptimizing && (
                <Progress value={50} className="w-full animate-pulse" />
              )}
              
              {gs.optimizedPdfUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => handleDownload('optimizedPdfUrl')}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Optimized PDF
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bleed" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="bleed-margin">Bleed Margin: {bleedMargin}pt</Label>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(bleedMargin / 72 * 25.4)}mm)
                  </span>
                </div>
                <Slider
                  id="bleed-margin"
                  min={3}
                  max={36}
                  step={1}
                  value={[bleedMargin]}
                  onValueChange={(value) => setBleedMargin(value[0])}
                />
                <div className="text-xs text-muted-foreground">
                  Typical values: 9pt (3mm) for most print jobs, 18pt (6mm) for book covers
                </div>
              </div>

              <Button 
                onClick={handleAddBleed}
                disabled={gs.isAddingBleed}
                className="w-full"
              >
                <PaintBucket className="w-4 h-4 mr-2" />
                {gs.isAddingBleed ? 'Adding Bleed...' : 'Add Bleed to PDF'}
              </Button>
              
              {gs.isAddingBleed && (
                <Progress value={50} className="w-full animate-pulse" />
              )}
              
              {gs.bleedPdfUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => handleDownload('bleedPdfUrl')}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF with Bleed
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="print" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="convert-cmyk" className="flex-1">Convert to CMYK</Label>
                    <Switch 
                      id="convert-cmyk" 
                      checked={convertToCmyk}
                      onCheckedChange={setConvertToCmyk}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Convert RGB colors to CMYK for professional printing
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="preserve-black" className="flex-1">Preserve Black</Label>
                    <Switch 
                      id="preserve-black" 
                      checked={preserveBlack}
                      onCheckedChange={setPreserveBlack}
                      disabled={!convertToCmyk}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Preserve true black (K=100%) when converting to CMYK
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="flatten-transparency" className="flex-1">Flatten Transparency</Label>
                    <Switch 
                      id="flatten-transparency" 
                      checked={flattenTransparency}
                      onCheckedChange={setFlattenTransparency}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Remove transparency for better compatibility with print workflows
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="embed-fonts" className="flex-1">Embed All Fonts</Label>
                    <Switch 
                      id="embed-fonts" 
                      checked={embedAllFonts}
                      onCheckedChange={setEmbedAllFonts}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ensure all fonts are embedded in the document
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="downsample-images" className="flex-1">Downsample Images</Label>
                    <Switch 
                      id="downsample-images" 
                      checked={downsampleImages}
                      onCheckedChange={setDownsampleImages}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reduce image resolution to optimize file size
                  </p>
                </div>

                {downsampleImages && (
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Target Resolution: {resolution} DPI</Label>
                    <Slider
                      id="resolution"
                      min={150}
                      max={600}
                      step={5}
                      value={[resolution]}
                      onValueChange={(value) => setResolution(value[0])}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="print-quality">Output Quality</Label>
                <Select 
                  value={quality}
                  onValueChange={(value) => setQuality(value as OptimizationQuality)}
                >
                  <SelectTrigger id="print-quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="printer">Printer (Commercial printing)</SelectItem>
                    <SelectItem value="prepress">Prepress (High-end offset printing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handlePreparePrintReady}
                disabled={gs.isPreparingPrintReady}
                className="w-full"
              >
                <Printer className="w-4 h-4 mr-2" />
                {gs.isPreparingPrintReady ? 'Preparing...' : 'Prepare for Print'}
              </Button>
              
              {gs.isPreparingPrintReady && (
                <Progress value={50} className="w-full animate-pulse" />
              )}
              
              {gs.printReadyPdfUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => handleDownload('printReadyPdfUrl')}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Print-Ready PDF
                </Button>
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

export default PDFPrintOptimizer;
