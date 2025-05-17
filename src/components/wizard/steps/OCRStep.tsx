
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, ArrowLeft, FileText, Languages, Search, Book, CheckCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { OCRParams } from '@/services/apiService';
import { useOcr } from '@/hooks/useOcr';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface OCRStepProps {
  onComplete: () => void;
  onBack: () => void;
  file: File;
  isProOrTeam: boolean;
  onOCRComplete: () => void;
}

const OCRStep: React.FC<OCRStepProps> = ({ onComplete, onBack, file, isProOrTeam, onOCRComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [ocrComplete, setOCRComplete] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["eng"]);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({});
  const [extractedText, setExtractedText] = useState<string>('');
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  
  const [ocrParams, setOcrParams] = useState<OCRParams>({
    language: 'eng',
    languages: ['eng'],
    ocrEngine: 'tesseract',
    detectOrientation: true,
    enhanceImage: true,
    extractTables: false,
    quality: 90,
    pdfA: true,
    dpi: 300,
    imageType: 'auto',
    ocrMode: 'text',
    advanced: {
      psmMode: 3,
      outputType: 'pdf',
      enhanceContrast: 0,
      customParameters: ''
    }
  });
  
  const { 
    status, 
    progress, 
    jobId, 
    result, 
    error, 
    processOcr, 
    processOcrOnPages, 
    extractText, 
    performAdvancedOcr, 
    getSupportedLanguages 
  } = useOcr();
  
  // Load supported languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoadingLanguages(true);
        const { languages, languageNames } = await getSupportedLanguages();
        setSupportedLanguages(languages);
        setLanguageNames(languageNames);
      } catch (error) {
        console.error('Failed to load supported languages:', error);
        toast({
          title: "Failed to Load Languages",
          description: "Could not retrieve the list of supported OCR languages",
          variant: "destructive"
        });
      } finally {
        setLoadingLanguages(false);
      }
    };
    
    fetchLanguages();
  }, []);
  
  // Update UI state based on OCR status
  useEffect(() => {
    setProcessing(status === 'processing');
    
    if (status === 'completed') {
      setOCRComplete(true);
      if (result?.text) {
        setExtractedText(result.text);
      }
    }
  }, [status, result]);
  
  const handleLanguageChange = (value: string) => {
    setSelectedLanguages([value]);
    setOcrParams(prev => ({ 
      ...prev, 
      language: value,
      languages: [value]
    }));
  };
  
  const handleMultiLanguageChange = (value: string) => {
    let newLanguages: string[];
    
    if (selectedLanguages.includes(value)) {
      // Remove language if it's already selected
      newLanguages = selectedLanguages.filter(lang => lang !== value);
    } else {
      // Add language if it's not already selected
      newLanguages = [...selectedLanguages, value];
    }
    
    // Ensure at least one language is selected
    if (newLanguages.length === 0) {
      newLanguages = ['eng'];
    }
    
    setSelectedLanguages(newLanguages);
    setOcrParams(prev => ({ 
      ...prev, 
      language: newLanguages[0],
      languages: newLanguages
    }));
  };
  
  const handleEngineChange = (value: string) => {
    setOcrParams(prev => ({ ...prev, ocrEngine: value }));
  };
  
  const handleOrientationChange = (checked: boolean) => {
    setOcrParams(prev => ({ ...prev, detectOrientation: checked }));
  };
  
  const handleEnhanceImageChange = (checked: boolean) => {
    setOcrParams(prev => ({ ...prev, enhanceImage: checked }));
  };
  
  const handleExtractTablesChange = (checked: boolean) => {
    setOcrParams(prev => ({ ...prev, extractTables: checked }));
  };
  
  const handleQualityChange = (value: number[]) => {
    setOcrParams(prev => ({ ...prev, quality: value[0] }));
  };
  
  const handleDpiChange = (value: number[]) => {
    setOcrParams(prev => ({ ...prev, dpi: value[0] }));
  };
  
  const handlePdfAChange = (checked: boolean) => {
    setOcrParams(prev => ({ ...prev, pdfA: checked }));
  };
  
  const handleImageTypeChange = (value: string) => {
    setOcrParams(prev => ({ ...prev, imageType: value }));
  };
  
  const handlePageRangesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOcrParams(prev => ({ ...prev, pageRanges: e.target.value }));
  };
  
  const handlePsmModeChange = (value: string) => {
    setOcrParams(prev => ({ 
      ...prev, 
      advanced: { 
        ...prev.advanced, 
        psmMode: parseInt(value, 10) 
      } 
    }));
  };
  
  const handleOutputTypeChange = (value: string) => {
    setOcrParams(prev => ({ 
      ...prev, 
      advanced: { 
        ...prev.advanced, 
        outputType: value 
      } 
    }));
  };
  
  const handleCustomParametersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOcrParams(prev => ({ 
      ...prev, 
      advanced: { 
        ...prev.advanced, 
        customParameters: e.target.value 
      } 
    }));
  };
  
  const handleOCRStart = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      if (ocrParams.pageRanges && ocrParams.pageRanges.trim() !== '') {
        // Process specific pages
        await processOcrOnPages(file, ocrParams, ocrParams.pageRanges);
      } else if (advancedMode) {
        // Use advanced OCR processing
        await performAdvancedOcr(file, ocrParams);
      } else {
        // Standard OCR processing
        await processOcr(file, ocrParams);
      }
    } catch (error: any) {
      toast({
        title: "OCR Processing Failed",
        description: error.message || "There was an error processing your document",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };
  
  const handleExtractText = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      await extractText(file, {
        ...ocrParams,
        withLayout: true
      });
      setShowExtractedText(true);
    } catch (error: any) {
      toast({
        title: "Text Extraction Failed",
        description: error.message || "There was an error extracting text from your document",
        variant: "destructive"
      });
      setProcessing(false);
    }
  };
  
  const handleToggleAdvancedMode = () => {
    setAdvancedMode(!advancedMode);
  };
  
  if (ocrComplete && !showExtractedText) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="text-center py-6">
            <FileText className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="text-xl font-semibold mb-2">OCR Processing Complete</h3>
            <p className="text-muted-foreground mb-4">
              Your document has been processed successfully.
            </p>
            <Progress value={100} className="mb-2" />
            <p className="text-sm text-muted-foreground">100%</p>
            
            {result?.jobId && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Job ID: {result.jobId}</p>
                {result.processingTimeMs && (
                  <p className="text-sm text-muted-foreground">
                    Processing Time: {(result.processingTimeMs / 1000).toFixed(2)} seconds
                  </p>
                )}
              </div>
            )}
            
            {extractedText && (
              <Button 
                variant="outline" 
                onClick={() => setShowExtractedText(true)}
                className="mt-4"
              >
                <Book className="mr-2 h-4 w-4" /> View Extracted Text
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={() => {
            if (onComplete) {
              onComplete();
            } else if (onOCRComplete) {
              onOCRComplete();
            }
          }}>
            <CheckCheck className="mr-2 h-4 w-4" /> Complete
          </Button>
        </div>
      </div>
    );
  }
  
  if (showExtractedText) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Extracted Text</CardTitle>
            <CardDescription>
              Text extracted from your document using OCR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4 bg-muted/20 h-80 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm">{extractedText || "No text was extracted from the document."}</pre>
            </div>
            
            {result?.pageCount && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Pages: {result.pageCount}</p>
                {result.wordCount && (
                  <p className="text-sm text-muted-foreground">Words: {result.wordCount}</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowExtractedText(false)}>
              Back to OCR Results
            </Button>
            <Button onClick={() => {
              if (onComplete) {
                onComplete();
              } else if (onOCRComplete) {
                onOCRComplete();
              }
            }}>
              Complete OCR
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">OCR Settings</CardTitle>
          <CardDescription>
            Configure OCR settings to extract text from your PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {processing ? (
            <div className="space-y-4">
              <div className="text-center py-6">
                <Search className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
                <h3 className="text-xl font-semibold mb-2">Processing Document</h3>
                <p className="text-muted-foreground mb-4">
                  Please wait while we extract text from your PDF...
                </p>
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">{progress}%</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Mode toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="advanced-mode">Advanced OCR Settings</Label>
                <Switch 
                  id="advanced-mode" 
                  checked={advancedMode}
                  onCheckedChange={handleToggleAdvancedMode}
                />
              </div>
              
              {/* Language selection */}
              <div className="grid gap-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" /> Recognition {advancedMode ? 'Languages' : 'Language'}
                </Label>
                
                {advancedMode ? (
                  // Multiple language selection in advanced mode
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {loadingLanguages ? (
                      <div className="col-span-full text-center py-2">Loading languages...</div>
                    ) : (
                      supportedLanguages.map(lang => (
                        <div key={lang} className="flex items-center gap-2">
                          <Checkbox 
                            id={`lang-${lang}`}
                            checked={selectedLanguages.includes(lang)}
                            onCheckedChange={() => handleMultiLanguageChange(lang)}
                          />
                          <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                            {languageNames[lang] || lang}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  // Single language selection in normal mode
                  <Select defaultValue={ocrParams.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingLanguages ? (
                        <div className="text-center py-2">Loading languages...</div>
                      ) : (
                        supportedLanguages.map(lang => (
                          <SelectItem key={lang} value={lang}>
                            {languageNames[lang] || lang}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {/* OCR Engine */}
              <div className="grid gap-2">
                <Label htmlFor="ocrEngine">OCR Engine</Label>
                <Select defaultValue={ocrParams.ocrEngine} onValueChange={handleEngineChange}>
                  <SelectTrigger id="ocrEngine">
                    <SelectValue placeholder="Select OCR engine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tesseract">Tesseract</SelectItem>
                    <SelectItem value="abbyy">ABBYY FineReader</SelectItem>
                    <SelectItem value="azure">Azure OCR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* DPI Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dpi">DPI (Resolution)</Label>
                  <span className="text-sm text-muted-foreground">{ocrParams.dpi}</span>
                </div>
                <Slider
                  id="dpi"
                  defaultValue={[ocrParams.dpi || 300]}
                  min={150}
                  max={600}
                  step={50}
                  onValueChange={handleDpiChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>150 DPI</span>
                  <span>600 DPI</span>
                </div>
              </div>
              
              {/* Page Ranges (if in advanced mode) */}
              {advancedMode && (
                <div className="grid gap-2">
                  <Label htmlFor="pageRanges">Page Ranges (e.g., 1-3,5,7-10)</Label>
                  <Input 
                    id="pageRanges" 
                    placeholder="All pages"
                    value={ocrParams.pageRanges || ''}
                    onChange={handlePageRangesChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to process all pages, or specify ranges (e.g., "1-3,5,7-10")
                  </p>
                </div>
              )}
              
              {/* Image Type */}
              <div className="grid gap-2">
                <Label htmlFor="imageType">Image Processing</Label>
                <Select defaultValue={ocrParams.imageType || 'auto'} onValueChange={handleImageTypeChange}>
                  <SelectTrigger id="imageType">
                    <SelectValue placeholder="Select image type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatic</SelectItem>
                    <SelectItem value="binary">Binary (Black & White)</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Image enhancement and orientation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="detectOrientation"
                    checked={ocrParams.detectOrientation}
                    onCheckedChange={handleOrientationChange}
                  />
                  <Label htmlFor="detectOrientation">Auto-detect orientation</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="enhanceImage"
                    checked={ocrParams.enhanceImage}
                    onCheckedChange={handleEnhanceImageChange}
                  />
                  <Label htmlFor="enhanceImage">Enhance image quality</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="extractTables"
                    checked={ocrParams.extractTables}
                    onCheckedChange={handleExtractTablesChange}
                  />
                  <Label htmlFor="extractTables">Extract tables</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="pdfA"
                    checked={ocrParams.pdfA}
                    onCheckedChange={handlePdfAChange}
                  />
                  <Label htmlFor="pdfA">PDF/A Compliance</Label>
                </div>
              </div>
              
              {/* Advanced settings */}
              {advancedMode && (
                <>
                  {/* PSM Mode */}
                  <div className="grid gap-2">
                    <Label htmlFor="psmMode">Page Segmentation Mode</Label>
                    <Select 
                      defaultValue={ocrParams.advanced?.psmMode?.toString() || "3"} 
                      onValueChange={handlePsmModeChange}
                    >
                      <SelectTrigger id="psmMode">
                        <SelectValue placeholder="Select segmentation mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Orientation and script detection only</SelectItem>
                        <SelectItem value="1">Automatic page segmentation with OSD</SelectItem>
                        <SelectItem value="3">Fully automatic page segmentation (Default)</SelectItem>
                        <SelectItem value="4">Assume a single column of text</SelectItem>
                        <SelectItem value="6">Assume a single uniform block of text</SelectItem>
                        <SelectItem value="7">Treat the image as a single text line</SelectItem>
                        <SelectItem value="8">Treat the image as a single word</SelectItem>
                        <SelectItem value="9">Treat the image as a single character</SelectItem>
                        <SelectItem value="11">Sparse text with OSD</SelectItem>
                        <SelectItem value="13">Raw line with no OSD or OCR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Output Type */}
                  <div className="grid gap-2">
                    <Label htmlFor="outputType">Output Format</Label>
                    <Select 
                      defaultValue={ocrParams.advanced?.outputType || "pdf"} 
                      onValueChange={handleOutputTypeChange}
                    >
                      <SelectTrigger id="outputType">
                        <SelectValue placeholder="Select output format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">Searchable PDF</SelectItem>
                        <SelectItem value="hocr">hOCR Format</SelectItem>
                        <SelectItem value="text">Plain Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Custom Parameters */}
                  <div className="grid gap-2">
                    <Label htmlFor="customParameters">Custom Tesseract Parameters</Label>
                    <Textarea 
                      id="customParameters"
                      placeholder="Format: param1=value1;param2=value2"
                      value={ocrParams.advanced?.customParameters || ''}
                      onChange={handleCustomParametersChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Specify custom Tesseract parameters in the format "param=value" separated by semicolons.
                    </p>
                  </div>
                </>
              )}
              
              {/* Quality slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quality">Recognition Quality</Label>
                  <span className="text-sm text-muted-foreground">{ocrParams.quality}%</span>
                </div>
                <Slider
                  id="quality"
                  defaultValue={[ocrParams.quality || 90]}
                  max={100}
                  step={1}
                  onValueChange={handleQualityChange}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Faster</span>
                  <span>More Accurate</span>
                </div>
              </div>
              
              <Alert variant="default">
                <FileText className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  Higher quality settings deliver more accurate results but take longer to process. 
                  For complex documents with small text, use higher quality settings.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 gap-3">
            <Button variant="outline" onClick={onBack} disabled={processing} className="flex-1 sm:flex-none">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleExtractText} 
              disabled={processing}
              className="flex-1 sm:flex-none"
            >
              <Book className="mr-2 h-4 w-4" /> Extract Text
            </Button>
          </div>
          <Button onClick={handleOCRStart} disabled={processing} className="flex-1 sm:flex-none">
            {processing ? 'Processing...' : 'Start OCR'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OCRStep;
