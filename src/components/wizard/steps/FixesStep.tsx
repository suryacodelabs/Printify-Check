
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, CircleDashed } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { pdfService } from '@/services/apiService';
import { toast } from '@/hooks/use-toast';
import { AVAILABLE_FIXES } from '@/hooks/useChecks';

const FixesStep: React.FC<FixesStepProps> = ({ file, preflightSuccess, preflightResults, isProOrTeam, onComplete }) => {
  const [selectedFixes, setSelectedFixes] = useState<Record<string, boolean>>({});
  const [applying, setApplying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Group issues by category
  const issuesByCategory = preflightResults?.reduce((acc: Record<string, any[]>, issue: any) => {
    const category = issue.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(issue);
    return acc;
  }, {}) || {};
  
  // Check if a fix is available for an issue type
  const isFixAvailable = (issueType: string): boolean => {
    // Map issue types to available fixes
    const fixMappings: Record<string, string> = {
      'missing_font': AVAILABLE_FIXES.EMBED_FONTS,
      'rgb_color': AVAILABLE_FIXES.CONVERT_RGB_TO_CMYK,
      'high_resolution': AVAILABLE_FIXES.DOWNSCALE_TO_300DPI,
      'transparency': AVAILABLE_FIXES.FLATTEN_TRANSPARENCY,
      'annotations': AVAILABLE_FIXES.REMOVE_METADATA_JAVASCRIPT,
      'metadata': AVAILABLE_FIXES.REMOVE_METADATA_JAVASCRIPT,
      'embedded_file': AVAILABLE_FIXES.REMOVE_EMBEDDED_FILES,
      'syntax_error': AVAILABLE_FIXES.SYNTAX_REPAIR,
    };
    
    return !!fixMappings[issueType];
  };
  
  // Handle fix selection change
  const handleFixSelection = (fixType: string, checked: boolean) => {
    setSelectedFixes(prev => ({
      ...prev,
      [fixType]: checked
    }));
  };
  
  // Apply selected fixes
  const applyFixes = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setApplying(true);
      setProgress(0);
      
      // Get selected fix types
      const fixTypes = Object.entries(selectedFixes)
        .filter(([_, selected]) => selected)
        .map(([fixType]) => fixType);
      
      if (fixTypes.length === 0) {
        toast({
          title: "No fixes selected",
          description: "Please select at least one fix to apply",
          variant: "destructive"
        });
        setApplying(false);
        return;
      }
      
      // Simulate progress updates (in a real app, get from API)
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 5;
        if (progressValue > 95) {
          clearInterval(interval);
        }
        setProgress(progressValue);
      }, 300);
      
      // Call API to apply fixes
      await pdfService.applyFixes(file, fixTypes);
      
      clearInterval(interval);
      setProgress(100);
      
      toast({
        title: "Fixes Applied",
        description: "PDF has been successfully optimized",
        variant: "default"
      });
      
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error Applying Fixes",
        description: error.message || "An error occurred while applying fixes",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };
  
  // Skip fixes
  const skipFixes = () => {
    if (onComplete) onComplete();
  };
  
  return (
    <div className="space-y-6">
      {preflightSuccess ? (
        <Card className="border-green-500 dark:border-green-600">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <CardTitle className="text-lg">Preflight Check Passed</CardTitle>
            </div>
            <CardDescription>
              Your PDF passed all critical preflight checks. You can still apply optimizations if desired.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-amber-500 dark:border-amber-600">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle className="text-lg">Preflight Check Found Issues</CardTitle>
            </div>
            <CardDescription>
              We found some issues that should be fixed before proceeding.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Optimizations</CardTitle>
          <CardDescription>
            Select the optimizations you want to apply
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Structural Optimizations */}
          <div>
            <h4 className="font-medium mb-2">Structural Optimizations</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="linearize" 
                  checked={selectedFixes[AVAILABLE_FIXES.LINEARIZE] || false}
                  onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.LINEARIZE, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="linearize" className="font-medium">
                    Linearize PDF
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize for web viewing and fast page loading
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="optimize-stream" 
                  checked={selectedFixes[AVAILABLE_FIXES.OPTIMIZE_STREAM] || false}
                  onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.OPTIMIZE_STREAM, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="optimize-stream" className="font-medium">
                    Optimize Content Streams
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce file size by optimizing content streams
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="remove-embedded-files" 
                  checked={selectedFixes[AVAILABLE_FIXES.REMOVE_EMBEDDED_FILES] || false}
                  onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.REMOVE_EMBEDDED_FILES, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="remove-embedded-files" className="font-medium">
                    Remove Embedded Files
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Remove attachments and embedded files to reduce size
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Font Optimizations */}
          <div>
            <h4 className="font-medium mb-2">Font Optimizations</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="embed-fonts" 
                  checked={selectedFixes[AVAILABLE_FIXES.EMBED_FONTS] || false}
                  onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.EMBED_FONTS, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="embed-fonts" className="font-medium">
                    Embed Missing Fonts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ensure all fonts are embedded for consistent display
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="subset-fonts" 
                  checked={selectedFixes[AVAILABLE_FIXES.SUBSET_FONTS] || false}
                  onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.SUBSET_FONTS, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="subset-fonts" className="font-medium">
                    Subset Fonts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce file size by including only used characters
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Image Optimizations */}
          <div>
            <h4 className="font-medium mb-2">Image Optimizations</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="downscale-images" 
                  checked={selectedFixes[AVAILABLE_FIXES.DOWNSCALE_TO_300DPI] || false}
                  onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.DOWNSCALE_TO_300DPI, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="downscale-images" className="font-medium">
                    Downsample Images to 300 DPI
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce file size while maintaining print quality
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="recompress-images" 
                  checked={selectedFixes[AVAILABLE_FIXES.RECOMPRESS_IMAGES] || false}
                  onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.RECOMPRESS_IMAGES, !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="recompress-images" className="font-medium">
                    Recompress Images
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Apply optimal compression to reduce file size
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {isProOrTeam && (
            <>
              <Separator />
              
              {/* Color Optimizations */}
              <div>
                <h4 className="font-medium mb-2">Color Optimizations</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="convert-rgb-cmyk" 
                      checked={selectedFixes[AVAILABLE_FIXES.CONVERT_RGB_TO_CMYK] || false}
                      onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.CONVERT_RGB_TO_CMYK, !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="convert-rgb-cmyk" className="font-medium">
                        Convert RGB to CMYK
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Convert colors for optimal print production
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="flatten-transparency" 
                      checked={selectedFixes[AVAILABLE_FIXES.FLATTEN_TRANSPARENCY] || false}
                      onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.FLATTEN_TRANSPARENCY, !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="flatten-transparency" className="font-medium">
                        Flatten Transparency
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Convert transparent objects for better compatibility
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Compliance */}
              <div>
                <h4 className="font-medium mb-2">Compliance</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="convert-pdfa" 
                      checked={selectedFixes[AVAILABLE_FIXES.CONVERT_TO_PDFA] || false}
                      onCheckedChange={(checked) => handleFixSelection(AVAILABLE_FIXES.CONVERT_TO_PDFA, !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="convert-pdfa" className="font-medium">
                        Convert to PDF/A
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Format for long-term archiving and preservation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Processing progress */}
      {applying && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Applying optimizations...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={skipFixes} disabled={applying}>
          Skip
        </Button>
        
        <Button onClick={applyFixes} disabled={applying}>
          {applying ? (
            <span className="flex items-center">
              <CircleDashed className="h-4 w-4 mr-2 animate-spin" /> 
              Processing...
            </span>
          ) : (
            <span>Apply Selected Optimizations</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FixesStep;
