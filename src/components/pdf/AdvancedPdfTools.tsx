
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAdvancedPdfTools, ProcessQuality, PdfALevel, PdfXStandard } from '@/hooks/useAdvancedPdfTools';
import { useToast } from '@/hooks/use-toast';
import { 
  FileCheck2, 
  CheckCircle, 
  Download, 
  Printer, 
  FileText, 
  FileImage, 
  FileOutput,
  Layers, 
  PaintBucket, 
  Pipette, 
  Milestone
} from 'lucide-react';

interface AdvancedPdfToolsProps {
  file: File | null;
  onProcessComplete?: (resultUrl: string) => void;
}

const AdvancedPdfTools: React.FC<AdvancedPdfToolsProps> = ({ file, onProcessComplete }) => {
  const { toast } = useToast();
  const advancedTools = useAdvancedPdfTools();
  
  const [selectedTab, setSelectedTab] = useState('optimization');
  const [bleedMargin, setBleedMargin] = useState(9);
  const [quality, setQuality] = useState<ProcessQuality>('high');
  const [pdfALevel, setPdfALevel] = useState<PdfALevel>('1b');
  const [pdfXStandard, setPdfXStandard] = useState<PdfXStandard>('3');
  const [profileName, setProfileName] = useState('sRGB');
  
  // Print-ready options
  const [addBleed, setAddBleed] = useState(true);
  const [convertToCmyk, setConvertToCmyk] = useState(true);
  const [flattenTransparency, setFlattenTransparency] = useState(true);
  const [preserveBlack, setPreserveBlack] = useState(true);
  
  const handleDownload = async () => {
    if (advancedTools.resultJobId) {
      const url = await advancedTools.downloadProcessedFile(file?.name || 'processed.pdf');
      
      if (url && onProcessComplete) {
        onProcessComplete(url);
      }
    } else {
      toast({
        title: "No processed file available",
        description: "Please process the PDF first before downloading.",
        variant: "destructive",
      });
    }
  };
  
  // Check if any process is currently running
  const isProcessing = 
    advancedTools.isLinearizing || 
    advancedTools.isEmbeddingFonts ||
    advancedTools.isConvertingToCmyk ||
    advancedTools.isApplyingIccProfile ||
    advancedTools.isFlatteningTransparency ||
    advancedTools.isConvertingToPdfA ||
    advancedTools.isConvertingToPdfX ||
    advancedTools.isAddingBleed ||
    advancedTools.isPreparingPrintReady ||
    advancedTools.isGeneratingPreflightReport ||
    advancedTools.isCheckingJobStatus;
    
  const isComplete = advancedTools.resultJobId !== null;
  
  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced PDF Tools</CardTitle>
          <CardDescription>Upload a PDF file to access advanced tools</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Advanced PDF Tools</CardTitle>
        <CardDescription>
          Professional PDF modification tools powered by iText 9
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="color">Color Management</TabsTrigger>
            <TabsTrigger value="print">Print Production</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">Web Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Linearize the PDF for faster web viewing.
                </p>
                <Button 
                  onClick={() => advancedTools.linearizePdf(file)} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <FileOutput className="w-4 h-4 mr-2" />
                  Optimize for Web
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">Font Embedding</h3>
                <p className="text-sm text-muted-foreground">
                  Embed all fonts in the document to ensure consistent rendering.
                </p>
                <Button 
                  onClick={() => advancedTools.embedFonts(file)} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Embed All Fonts
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Color Management Tab */}
          <TabsContent value="color" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">RGB to CMYK Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  Convert all RGB colors to CMYK color space for print.
                </p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Switch 
                    id="preserve-black" 
                    checked={preserveBlack}
                    onCheckedChange={setPreserveBlack}
                  />
                  <Label htmlFor="preserve-black">Preserve pure black</Label>
                </div>
                
                <Button 
                  onClick={() => advancedTools.convertToCmyk({ file, preserveBlack })} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <PaintBucket className="w-4 h-4 mr-2" />
                  Convert to CMYK
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">Apply ICC Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Apply color profile to ensure consistent color appearance.
                </p>
                
                <div className="flex flex-col gap-2 mt-2">
                  <Label htmlFor="color-profile">Color Profile</Label>
                  <Select value={profileName} onValueChange={setProfileName}>
                    <SelectTrigger id="color-profile">
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sRGB">sRGB IEC61966-2.1</SelectItem>
                      <SelectItem value="AdobeRGB">Adobe RGB (1998)</SelectItem>
                      <SelectItem value="CMYK">Coated FOGRA39</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => advancedTools.applyIccProfile({ file, profileName })} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <Pipette className="w-4 h-4 mr-2" />
                  Apply ICC Profile
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">Flatten Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  Remove transparency effects for better print compatibility.
                </p>
                
                <div className="flex flex-col gap-2 mt-2">
                  <Label>Quality: {quality}</Label>
                  <Select value={quality} onValueChange={(value) => setQuality(value as ProcessQuality)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => advancedTools.flattenTransparency({ file, quality })} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Flatten Transparency
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Print Production Tab */}
          <TabsContent value="print" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">Add Bleed</h3>
                <p className="text-sm text-muted-foreground">
                  Add bleed margin to document for print production.
                </p>
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between">
                    <Label>Bleed Margin: {bleedMargin}pt</Label>
                    <span className="text-xs text-muted-foreground">
                      ({(bleedMargin / 72).toFixed(2)}in)
                    </span>
                  </div>
                  <Slider 
                    value={[bleedMargin]} 
                    min={0} 
                    max={36} 
                    step={1}
                    onValueChange={([value]) => setBleedMargin(value)} 
                  />
                </div>
                
                <Button 
                  onClick={() => advancedTools.addBleed({ file, bleedMargin })} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <Milestone className="w-4 h-4 mr-2" />
                  Add Bleed
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">Print-Ready PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Prepare document for professional printing with multiple optimizations.
                </p>
                
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="add-bleed" 
                      checked={addBleed}
                      onCheckedChange={setAddBleed}
                    />
                    <Label htmlFor="add-bleed">Add bleed (3mm)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="convert-cmyk" 
                      checked={convertToCmyk}
                      onCheckedChange={setConvertToCmyk}
                    />
                    <Label htmlFor="convert-cmyk">Convert to CMYK</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flatten-transparency" 
                      checked={flattenTransparency}
                      onCheckedChange={setFlattenTransparency}
                    />
                    <Label htmlFor="flatten-transparency">Flatten transparency</Label>
                  </div>
                </div>
                
                <Button 
                  onClick={() => advancedTools.preparePrintReady({ 
                    file, 
                    options: { 
                      addBleed, 
                      convertToCmyk, 
                      flattenTransparency 
                    } 
                  })} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Prepare for Print
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">PDF/A Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  Convert document to PDF/A standard for long-term archiving.
                </p>
                
                <div className="flex flex-col gap-2 mt-2">
                  <Label htmlFor="pdfa-level">Conformance Level</Label>
                  <Select value={pdfALevel} onValueChange={(value) => setPdfALevel(value as PdfALevel)}>
                    <SelectTrigger id="pdfa-level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1b">PDF/A-1b (Basic)</SelectItem>
                      <SelectItem value="1a">PDF/A-1a (Accessible)</SelectItem>
                      <SelectItem value="2b">PDF/A-2b</SelectItem>
                      <SelectItem value="2a">PDF/A-2a</SelectItem>
                      <SelectItem value="3b">PDF/A-3b</SelectItem>
                      <SelectItem value="3a">PDF/A-3a</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => advancedTools.convertToPdfA({ file, conformanceLevel: pdfALevel })} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <FileCheck2 className="w-4 h-4 mr-2" />
                  Convert to PDF/A
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium">PDF/X Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  Convert document to PDF/X standard for graphic exchange and printing.
                </p>
                
                <div className="flex flex-col gap-2 mt-2">
                  <Label htmlFor="pdfx-standard">Standard</Label>
                  <Select value={pdfXStandard} onValueChange={(value) => setPdfXStandard(value as PdfXStandard)}>
                    <SelectTrigger id="pdfx-standard">
                      <SelectValue placeholder="Select standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1a">PDF/X-1a</SelectItem>
                      <SelectItem value="3">PDF/X-3</SelectItem>
                      <SelectItem value="4">PDF/X-4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => advancedTools.convertToPdfX({ file, standard: pdfXStandard })} 
                  disabled={isProcessing}
                  className="mt-2"
                >
                  <FileImage className="w-4 h-4 mr-2" />
                  Convert to PDF/X
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Processing status */}
        {isProcessing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Processing...</span>
              <span className="text-sm">{advancedTools.jobStatus?.progress || 0}%</span>
            </div>
            <Progress value={advancedTools.jobStatus?.progress || 0} />
          </div>
        )}
        
        {/* Results */}
        {isComplete && !isProcessing && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
              <span>Processing complete!</span>
            </div>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => advancedTools.resetState()}
          disabled={isProcessing}
        >
          Reset
        </Button>
        
        {isComplete && !isProcessing && (
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download Result
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AdvancedPdfTools;
