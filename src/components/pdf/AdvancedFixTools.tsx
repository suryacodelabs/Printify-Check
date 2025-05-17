
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileCheck, Paintbrush, ImageIcon, Layers } from 'lucide-react';
import { useMuPdf } from '@/hooks/useMuPdf';
import { toast } from '@/hooks/use-toast';

interface AdvancedFixToolsProps {
  file: File;
  onFixComplete: (fixedFile: Blob) => void;
}

const AdvancedFixTools: React.FC<AdvancedFixToolsProps> = ({ file, onFixComplete }) => {
  const [activeTab, setActiveTab] = useState('repair');
  const [fixXref, setFixXref] = useState(true);
  const [fixDamage, setFixDamage] = useState(true);
  const [cleanMetadata, setCleanMetadata] = useState(false);
  const [subsetFonts, setSubsetFonts] = useState(true);
  const [targetColorSpace, setTargetColorSpace] = useState('cmyk');
  const [preserveBlack, setPreserveBlack] = useState(true);
  const [transparencyQuality, setTransparencyQuality] = useState('high');
  
  const { 
    repairPdf, 
    isRepairing, 
    repairError,
    embedFonts,
    isEmbeddingFonts,
    fontError,
    convertColorSpace,
    isConvertingColors,
    colorError,
    flattenTransparency,
    isFlatteningTransparency,
    transparencyError,
    downloadPdf
  } = useMuPdf();
  
  const handleRepair = async () => {
    try {
      const fixedPdf = await repairPdf({
        file,
        options: {
          fixXref,
          fixDamage,
          cleanMetadata
        }
      });
      
      if (fixedPdf instanceof Blob) {
        onFixComplete(fixedPdf);
        toast({
          title: "PDF Repaired",
          description: "The PDF has been repaired successfully."
        });
      }
    } catch (err) {
      toast({
        title: "Repair Failed",
        description: err instanceof Error ? err.message : "Failed to repair PDF",
        variant: "destructive"
      });
    }
  };
  
  const handleEmbedFonts = async () => {
    try {
      const fixedPdf = await embedFonts({
        file,
        options: {
          subset: subsetFonts
        }
      });
      
      if (fixedPdf instanceof Blob) {
        onFixComplete(fixedPdf);
        toast({
          title: "Fonts Embedded",
          description: "All fonts have been embedded successfully."
        });
      }
    } catch (err) {
      toast({
        title: "Font Embedding Failed",
        description: err instanceof Error ? err.message : "Failed to embed fonts",
        variant: "destructive"
      });
    }
  };
  
  const handleConvertColorSpace = async () => {
    try {
      const fixedPdf = await convertColorSpace({
        file,
        options: {
          targetColorSpace: targetColorSpace,
          preserveBlack: preserveBlack
        }
      });
      
      if (fixedPdf instanceof Blob) {
        onFixComplete(fixedPdf);
        toast({
          title: "Color Space Converted",
          description: `Color space has been converted to ${targetColorSpace.toUpperCase()}.`
        });
      }
    } catch (err) {
      toast({
        title: "Color Conversion Failed",
        description: err instanceof Error ? err.message : "Failed to convert color space",
        variant: "destructive"
      });
    }
  };
  
  const handleFlattenTransparency = async () => {
    try {
      const fixedPdf = await flattenTransparency({
        file,
        quality: transparencyQuality as 'low' | 'medium' | 'high'
      });
      
      if (fixedPdf instanceof Blob) {
        onFixComplete(fixedPdf);
        toast({
          title: "Transparency Flattened",
          description: "Transparency has been flattened successfully."
        });
      }
    } catch (err) {
      toast({
        title: "Flattening Failed",
        description: err instanceof Error ? err.message : "Failed to flatten transparency",
        variant: "destructive"
      });
    }
  };
  
  const handleDownload = (blob: Blob) => {
    downloadPdf(blob, file.name);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced PDF Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="repair">
              <FileCheck className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Repair</span>
            </TabsTrigger>
            <TabsTrigger value="fonts">
              <span className="hidden sm:inline">Fonts</span>
            </TabsTrigger>
            <TabsTrigger value="color">
              <Paintbrush className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Color</span>
            </TabsTrigger>
            <TabsTrigger value="transparency">
              <Layers className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Transparency</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="repair" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="fix-xref" checked={fixXref} onCheckedChange={(checked) => setFixXref(!!checked)} />
                <Label htmlFor="fix-xref">Fix cross-references</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="fix-damage" checked={fixDamage} onCheckedChange={(checked) => setFixDamage(!!checked)} />
                <Label htmlFor="fix-damage">Fix structural damage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="clean-metadata" checked={cleanMetadata} onCheckedChange={(checked) => setCleanMetadata(!!checked)} />
                <Label htmlFor="clean-metadata">Clean metadata</Label>
              </div>
            </div>
            <Button onClick={handleRepair} disabled={isRepairing} className="w-full">
              {isRepairing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Repair PDF
            </Button>
            {repairError && (
              <p className="text-sm text-destructive mt-2">Error: {repairError.message || "Failed to repair PDF"}</p>
            )}
          </TabsContent>
          
          <TabsContent value="fonts" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="subset-fonts" checked={subsetFonts} onCheckedChange={(checked) => setSubsetFonts(!!checked)} />
                <Label htmlFor="subset-fonts">Create font subsets (smaller file size)</Label>
              </div>
            </div>
            <Button onClick={handleEmbedFonts} disabled={isEmbeddingFonts} className="w-full">
              {isEmbeddingFonts && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Embed All Fonts
            </Button>
            {fontError && (
              <p className="text-sm text-destructive mt-2">Error: {fontError.message || "Failed to embed fonts"}</p>
            )}
          </TabsContent>
          
          <TabsContent value="color" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="color-space">Target Color Space</Label>
                <Select value={targetColorSpace} onValueChange={setTargetColorSpace}>
                  <SelectTrigger id="color-space">
                    <SelectValue placeholder="Select color space" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cmyk">CMYK (Print)</SelectItem>
                    <SelectItem value="rgb">RGB (Screen)</SelectItem>
                    <SelectItem value="gray">Grayscale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="preserve-black" checked={preserveBlack} onCheckedChange={(checked) => setPreserveBlack(!!checked)} />
                <Label htmlFor="preserve-black">Preserve black elements</Label>
              </div>
            </div>
            <Button onClick={handleConvertColorSpace} disabled={isConvertingColors} className="w-full">
              {isConvertingColors && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert Color Space
            </Button>
            {colorError && (
              <p className="text-sm text-destructive mt-2">Error: {colorError.message || "Failed to convert color space"}</p>
            )}
          </TabsContent>
          
          <TabsContent value="transparency" className="space-y-4">
            <div className="space-y-2">
              <Label>Flattening Quality</Label>
              <RadioGroup value={transparencyQuality} onValueChange={setTransparencyQuality}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="r1" />
                  <Label htmlFor="r1">Low (Faster)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="r2" />
                  <Label htmlFor="r2">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="r3" />
                  <Label htmlFor="r3">High (Better quality)</Label>
                </div>
              </RadioGroup>
            </div>
            <Button onClick={handleFlattenTransparency} disabled={isFlatteningTransparency} className="w-full">
              {isFlatteningTransparency && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Flatten Transparency
            </Button>
            {transparencyError && (
              <p className="text-sm text-destructive mt-2">Error: {transparencyError.message || "Failed to flatten transparency"}</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedFixTools;
