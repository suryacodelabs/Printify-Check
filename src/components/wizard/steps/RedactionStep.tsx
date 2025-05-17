import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, CheckCircle2, Eraser, FileX, Plus, Scissors, Trash2 } from 'lucide-react';
import { useRedaction } from '@/hooks/useRedaction';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { RedactionParams, MetadataStrippingParams } from '@/services/redactionService';
import { useAuth } from '@/contexts/AuthContext';

// Define RedactionStepProps interface
interface RedactionStepProps {
  file: File | null;
  isProOrTeam: boolean;
  userId?: string; // Make userId optional
  onBack: () => void;
  onRedactionComplete: () => void;
}

// Define the color presets for redaction appearance
const redactionColorPresets = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Gray", value: "#808080" }
];

// Define the text color presets for redaction appearance
const textColorPresets = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" }
];

// Define metadata field options
const metadataFieldOptions = [
  { id: "author", label: "Author" },
  { id: "creator", label: "Creator" },
  { id: "keywords", label: "Keywords" },
  { id: "subject", label: "Subject" },
  { id: "title", label: "Title" },
  { id: "producer", label: "Producer" },
  { id: "all_custom", label: "All Custom Fields" },
  { id: "xmp", label: "XMP Metadata" }
];

const RedactionStep: React.FC<RedactionStepProps> = ({ file, isProOrTeam, userId, onBack, onRedactionComplete }) => {
  // Get userId from auth context if not provided directly
  const { user } = useAuth();
  const effectiveUserId = userId || (user?.id || 'anonymous-user');
  
  // State for each tab's content
  const [customPatterns, setCustomPatterns] = useState<string[]>(['']);
  const [customTexts, setCustomTexts] = useState<string[]>(['']);
  const [detected, setDetected] = useState({
    emails: true,
    phones: true,
    creditCards: true,
    socialSecurity: true,
    addresses: false,
    dates: false,
    passports: false,
    licenses: false,
    ip_addresses: false,
    names: false
  });
  
  // State for redaction appearance
  const [redactionColor, setRedactionColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [redactionText, setRedactionText] = useState("REDACTED");
  const [fontSize, setFontSize] = useState(12);
  const [showText, setShowText] = useState(true);
  
  // State for metadata stripping
  const [metadataFields, setMetadataFields] = useState<Record<string, boolean>>({
    author: true,
    creator: true,
    keywords: true,
    subject: true,
    title: true,
    producer: true,
    all_custom: true,
    xmp: true
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState("redaction");
  
  // Initialize the redaction hook
  const {
    applyRedaction,
    isRedacting,
    stripMetadata,
    isStrippingMetadata,
    redactionStatus,
    isCheckingStatus,
    downloadRedactedPdf,
    isDownloading,
    redactionJobId,
    resetRedaction
  } = useRedaction(effectiveUserId);
  
  // Effect to handle redaction status changes
  useEffect(() => {
    if (redactionStatus && redactionStatus.status === "completed") {
      toast({
        title: "Redaction Complete",
        description: "All sensitive information has been redacted",
        variant: "default"
      });
      
      // Offer download option
      if (redactionJobId && redactionStatus.outputFile) {
        downloadRedactedPdf({ 
          jobId: redactionJobId, 
          fileName: file?.name ? `redacted-${file.name}` : "redacted-document.pdf"
        });
      }
      
      // After a short delay, proceed to the next step
      setTimeout(onRedactionComplete, 1500);
    } else if (redactionStatus && redactionStatus.status === "error") {
      toast({
        title: "Redaction Failed",
        description: "There was an error during the redaction process",
        variant: "destructive"
      });
    }
  }, [redactionStatus, redactionJobId, file, downloadRedactedPdf, onRedactionComplete]);
  
  // Progress calculation
  const progress = redactionStatus?.status === "completed" 
    ? 100 
    : redactionStatus?.status === "processing" 
      ? Math.floor(Math.random() * 30) + 70  // Simulate progress between 70-99%
      : redactionStatus?.status === "pending" 
        ? Math.floor(Math.random() * 40) + 30  // Simulate progress between 30-69%
        : 0;
  
  // Pattern field management functions
  const addPatternField = () => {
    setCustomPatterns([...customPatterns, '']);
  };
  
  const removePatternField = (index: number) => {
    const newPatterns = [...customPatterns];
    newPatterns.splice(index, 1);
    setCustomPatterns(newPatterns);
  };
  
  const updatePatternField = (index: number, value: string) => {
    const newPatterns = [...customPatterns];
    newPatterns[index] = value;
    setCustomPatterns(newPatterns);
  };
  
  // Text field management functions
  const addTextField = () => {
    setCustomTexts([...customTexts, '']);
  };
  
  const removeTextField = (index: number) => {
    const newTexts = [...customTexts];
    newTexts.splice(index, 1);
    setCustomTexts(newTexts);
  };
  
  const updateTextField = (index: number, value: string) => {
    const newTexts = [...customTexts];
    newTexts[index] = value;
    setCustomTexts(newTexts);
  };
  
  // Apply redaction function
  const handleApplyRedaction = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Prepare categories from detected options
      const categories = Object.entries(detected)
        .filter(([_, isSelected]) => isSelected)
        .map(([category]) => category);
      
      // Prepare redaction parameters
      const params: RedactionParams = {
        patterns: customPatterns.filter(p => p.trim() !== ''),
        categories: categories.length > 0 ? categories : undefined,
        customTexts: customTexts.filter(t => t.trim() !== ''),
        redactionColor,
        textColor: showText ? textColor : undefined,
        redactionText: showText ? redactionText : "",
        fontSize: showText ? fontSize : undefined
      };
      
      // Call the redaction service
      applyRedaction({ file, params });
      
    } catch (error: any) {
      toast({
        title: "Redaction Failed",
        description: error.message || "An error occurred during redaction",
        variant: "destructive"
      });
    }
  };
  
  // Strip metadata function
  const handleStripMetadata = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Prepare fields from selected options
      const fields = Object.entries(metadataFields)
        .filter(([_, isSelected]) => isSelected)
        .map(([field]) => field);
      
      // Prepare metadata stripping parameters
      const params: MetadataStrippingParams = {
        fields: fields.length > 0 ? fields : undefined
      };
      
      // Call the metadata stripping service
      stripMetadata({ file, params });
      
    } catch (error: any) {
      toast({
        title: "Metadata Stripping Failed",
        description: error.message || "An error occurred during metadata stripping",
        variant: "destructive"
      });
    }
  };
  
  // Skip redaction
  const skipRedaction = () => {
    onRedactionComplete();
  };
  
  // Premium feature gate
  if (!isProOrTeam) {
    return (
      <Card className="text-center p-6">
        <CardHeader>
          <h3 className="text-xl font-semibold">Redaction Feature</h3>
        </CardHeader>
        <CardContent>
          <p className="mb-6">Upgrade to Pro or Team plan to access the redaction feature.</p>
          <p className="text-muted-foreground mb-6">
            Our redaction tool automatically detects and removes sensitive information like credit card numbers, 
            social security numbers, emails, and phone numbers from your documents.
          </p>
          <Button onClick={skipRedaction}>Continue Without Redaction</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Show processing state
  if (isRedacting || isStrippingMetadata || isCheckingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Document</CardTitle>
          <CardDescription>
            {isRedacting || isCheckingStatus ? "Redacting sensitive information..." : "Stripping document metadata..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="redaction">
            <Eraser className="h-4 w-4 mr-2" /> Content Redaction
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <FileX className="h-4 w-4 mr-2" /> Metadata Removal
          </TabsTrigger>
        </TabsList>
        
        {/* Redaction Tab */}
        <TabsContent value="redaction" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Automated Detection</h3>
              <CardDescription>Select the types of information to automatically detect and redact</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="emails" 
                  checked={detected.emails} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, emails: !!checked }))
                  }
                />
                <Label htmlFor="emails">Email Addresses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="phones" 
                  checked={detected.phones} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, phones: !!checked }))
                  }
                />
                <Label htmlFor="phones">Phone Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="credit-cards" 
                  checked={detected.creditCards} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, creditCards: !!checked }))
                  }
                />
                <Label htmlFor="credit-cards">Credit Card Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ssn" 
                  checked={detected.socialSecurity} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, socialSecurity: !!checked }))
                  }
                />
                <Label htmlFor="ssn">Social Security Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="addresses" 
                  checked={detected.addresses} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, addresses: !!checked }))
                  }
                />
                <Label htmlFor="addresses">Addresses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dates" 
                  checked={detected.dates} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, dates: !!checked }))
                  }
                />
                <Label htmlFor="dates">Dates (DOB)</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="passports" 
                  checked={detected.passports} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, passports: !!checked }))
                  }
                />
                <Label htmlFor="passports">Passport Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="licenses" 
                  checked={detected.licenses} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, licenses: !!checked }))
                  }
                />
                <Label htmlFor="licenses">License Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ip-addresses" 
                  checked={detected.ip_addresses} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, ip_addresses: !!checked }))
                  }
                />
                <Label htmlFor="ip-addresses">IP Addresses</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="names" 
                  checked={detected.names} 
                  onCheckedChange={(checked) => 
                    setDetected(prev => ({ ...prev, names: !!checked }))
                  }
                />
                <Label htmlFor="names">Names (Experimental)</Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Custom RegEx Patterns</h3>
              <CardDescription>Add custom regular expression patterns to detect specific information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customPatterns.map((pattern, index) => (
                <div key={`pattern-${index}`} className="flex items-center space-x-2">
                  <Input
                    value={pattern}
                    onChange={(e) => updatePatternField(index, e.target.value)}
                    placeholder="Regular expression pattern (e.g., \d{3}-\d{2}-\d{4} for SSN)"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePatternField(index)}
                    disabled={customPatterns.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" size="sm" onClick={addPatternField} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Pattern
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Custom Text</h3>
              <CardDescription>Add specific text to redact throughout the document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customTexts.map((text, index) => (
                <div key={`text-${index}`} className="flex items-center space-x-2">
                  <Input
                    value={text}
                    onChange={(e) => updateTextField(index, e.target.value)}
                    placeholder="Text to redact"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTextField(index)}
                    disabled={customTexts.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button variant="outline" size="sm" onClick={addTextField} className="mt-2">
                <Plus className="h-4 w-4 mr-2" /> Add Text
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Redaction Appearance</h3>
              <CardDescription>Customize how redacted content appears in the document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Redaction Color</Label>
                <div className="flex flex-wrap gap-2">
                  {redactionColorPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      type="button"
                      variant={redactionColor === preset.value ? "default" : "outline"}
                      className="w-20 h-8"
                      onClick={() => setRedactionColor(preset.value)}
                      style={{ 
                        backgroundColor: redactionColor === preset.value ? preset.value : undefined,
                        color: redactionColor === preset.value ? (preset.value === "#000000" ? "white" : "black") : undefined
                      }}
                    >
                      {preset.name}
                    </Button>
                  ))}
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={redactionColor}
                      onChange={(e) => setRedactionColor(e.target.value)}
                      className="w-10 h-8 p-0 border-0"
                    />
                    <Input
                      type="text"
                      value={redactionColor}
                      onChange={(e) => setRedactionColor(e.target.value)}
                      className="w-24 h-8"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="show-text" 
                  checked={showText} 
                  onCheckedChange={(checked) => setShowText(!!checked)}
                />
                <Label htmlFor="show-text">Show replacement text over redacted areas</Label>
              </div>
              
              {showText && (
                <>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="redaction-text">Replacement Text</Label>
                    <Input
                      id="redaction-text"
                      value={redactionText}
                      onChange={(e) => setRedactionText(e.target.value)}
                      placeholder="REDACTED"
                    />
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <Label>Text Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {textColorPresets.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant={textColor === preset.value ? "default" : "outline"}
                          className="w-20 h-8"
                          onClick={() => setTextColor(preset.value)}
                          style={{ 
                            backgroundColor: textColor === preset.value ? preset.value : undefined,
                            color: textColor === preset.value ? (preset.value === "#FFFFFF" ? "black" : "white") : undefined
                          }}
                        >
                          {preset.name}
                        </Button>
                      ))}
                      
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-10 h-8 p-0 border-0"
                        />
                        <Input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-24 h-8"
                          placeholder="#FFFFFF"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <Label htmlFor="font-size">Font Size: {fontSize}pt</Label>
                    </div>
                    <Slider
                      id="font-size"
                      value={[fontSize]}
                      min={6}
                      max={24}
                      step={1}
                      onValueChange={(values) => setFontSize(values[0])}
                    />
                  </div>
                </>
              )}
              
              <div className="mt-4 p-4 border rounded-md">
                <div className="text-lg font-semibold mb-2">Preview</div>
                <div 
                  className="p-2 relative w-full h-10 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: redactionColor }}
                >
                  {showText && (
                    <span style={{ color: textColor, fontSize: `${fontSize}px` }}>
                      {redactionText}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Metadata Removal</h3>
              <CardDescription>Select which metadata to remove from the document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {metadataFieldOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`metadata-${option.id}`} 
                      checked={metadataFields[option.id] || false} 
                      onCheckedChange={(checked) => 
                        setMetadataFields(prev => ({ ...prev, [option.id]: !!checked }))
                      }
                    />
                    <Label htmlFor={`metadata-${option.id}`}>{option.label}</Label>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setMetadataFields({
                    author: false,
                    creator: false,
                    keywords: false,
                    subject: false,
                    title: false,
                    producer: false,
                    all_custom: false,
                    xmp: false
                  })}
                >
                  Clear All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setMetadataFields({
                    author: true,
                    creator: true,
                    keywords: true,
                    subject: true,
                    title: true,
                    producer: true,
                    all_custom: true,
                    xmp: true
                  })}
                >
                  Select All
                </Button>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Removing metadata from your PDF helps protect sensitive information about the document's 
                  origin, creator, and other properties that could potentially identify individuals or 
                  organizations associated with the document.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-6">
              <Button onClick={handleStripMetadata} disabled={!Object.values(metadataFields).some(v => v)}>
                <Scissors className="h-4 w-4 mr-2" />
                Strip Metadata
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={skipRedaction}>
            Skip
          </Button>
          
          {activeTab === "redaction" && (
            <Button 
              onClick={handleApplyRedaction}
              disabled={!Object.values(detected).some(v => v) && 
                       customPatterns.filter(p => p.trim()).length === 0 && 
                       customTexts.filter(t => t.trim()).length === 0}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Apply Redaction
            </Button>
          )}
        </div>
      </CardFooter>
    </div>
  );
};

export default RedactionStep;
