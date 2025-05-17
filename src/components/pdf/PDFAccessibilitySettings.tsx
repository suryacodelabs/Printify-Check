
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PdfFlavour, PDFFixOptions } from '@/types/pdf';
import { AlertTriangle, Check, FileCheck, Languages } from 'lucide-react';

interface PDFAccessibilitySettingsProps {
  onApplyFixes: (options: PDFFixOptions) => void;
  isProcessing: boolean;
  className?: string;
}

const PDFAccessibilitySettings: React.FC<PDFAccessibilitySettingsProps> = ({ 
  onApplyFixes, 
  isProcessing,
  className 
}) => {
  const [options, setOptions] = useState<PDFFixOptions>({
    addLanguage: {
      enabled: false,
      language: 'en-US'
    },
    enhanceAccessibility: false,
    fixMetadata: false,
    convertToPdfA: {
      enabled: false,
      flavour: PdfFlavour.PDFA_2A
    }
  });

  const handleApplyFixes = () => {
    onApplyFixes(options);
  };

  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'fr-FR', label: 'French' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'de-DE', label: 'German' },
    { value: 'it-IT', label: 'Italian' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
    { value: 'ru-RU', label: 'Russian' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' }
  ];

  const pdfaFlavours = [
    { value: PdfFlavour.PDFA_1A, label: 'PDF/A-1a (Accessible)' },
    { value: PdfFlavour.PDFA_1B, label: 'PDF/A-1b (Basic)' },
    { value: PdfFlavour.PDFA_2A, label: 'PDF/A-2a (Accessible)' },
    { value: PdfFlavour.PDFA_2B, label: 'PDF/A-2b (Basic)' },
    { value: PdfFlavour.PDFA_3A, label: 'PDF/A-3a (Accessible)' },
    { value: PdfFlavour.PDFA_3B, label: 'PDF/A-3b (Basic)' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>PDF Accessibility Enhancements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* Language Settings */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4 text-primary" />
                <Label htmlFor="language-switch" className="font-medium">Add Document Language</Label>
              </div>
              <Switch 
                id="language-switch" 
                checked={options.addLanguage?.enabled}
                onCheckedChange={(checked) => setOptions({
                  ...options,
                  addLanguage: {
                    ...options.addLanguage!,
                    enabled: checked
                  }
                })}
              />
            </div>
            
            {options.addLanguage?.enabled && (
              <div className="pl-6">
                <Label htmlFor="language-select" className="text-sm text-muted-foreground mb-2 block">
                  Select document language
                </Label>
                <Select 
                  value={options.addLanguage.language} 
                  onValueChange={(value) => setOptions({
                    ...options,
                    addLanguage: {
                      ...options.addLanguage!,
                      language: value
                    }
                  })}
                >
                  <SelectTrigger id="language-select" className="w-full">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Adding a language improves screen reader compatibility
                </p>
              </div>
            )}
          </div>
          
          {/* Enhanced Accessibility */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck className="h-4 w-4 text-primary" />
              <Label htmlFor="accessibility-switch" className="font-medium">Enhance Tag Structure</Label>
            </div>
            <Switch 
              id="accessibility-switch" 
              checked={options.enhanceAccessibility}
              onCheckedChange={(checked) => setOptions({
                ...options,
                enhanceAccessibility: checked
              })}
            />
          </div>
          
          {/* Metadata Fixing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <Label htmlFor="metadata-switch" className="font-medium">Fix Document Metadata</Label>
            </div>
            <Switch 
              id="metadata-switch" 
              checked={options.fixMetadata}
              onCheckedChange={(checked) => setOptions({
                ...options,
                fixMetadata: checked
              })}
            />
          </div>
          
          {/* PDF/A Conversion */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-4 w-4 text-primary" />
                <Label htmlFor="pdfa-switch" className="font-medium">Convert to PDF/A</Label>
              </div>
              <Switch 
                id="pdfa-switch" 
                checked={options.convertToPdfA?.enabled}
                onCheckedChange={(checked) => setOptions({
                  ...options,
                  convertToPdfA: {
                    ...options.convertToPdfA!,
                    enabled: checked
                  }
                })}
              />
            </div>
            
            {options.convertToPdfA?.enabled && (
              <div className="pl-6">
                <Label htmlFor="pdfa-select" className="text-sm text-muted-foreground mb-2 block">
                  Select PDF/A flavour
                </Label>
                <Select 
                  value={options.convertToPdfA.flavour} 
                  onValueChange={(value) => setOptions({
                    ...options,
                    convertToPdfA: {
                      ...options.convertToPdfA!,
                      flavour: value as PdfFlavour
                    }
                  })}
                >
                  <SelectTrigger id="pdfa-select" className="w-full">
                    <SelectValue placeholder="Select a PDF/A flavour" />
                  </SelectTrigger>
                  <SelectContent>
                    {pdfaFlavours.map(flavour => (
                      <SelectItem key={flavour.value} value={flavour.value}>
                        {flavour.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF/A is an archival format that ensures long-term preservation
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">About PDF Accessibility</p>
            <p className="mt-1">Enhancing accessibility makes your document usable for people with disabilities and improves compliance with regulations like ADA, Section 508, and EU Accessibility Act.</p>
          </div>
        </div>
        
        {/* Apply Button */}
        <Button
          onClick={handleApplyFixes}
          disabled={isProcessing || (
            !options.addLanguage?.enabled && 
            !options.enhanceAccessibility && 
            !options.fixMetadata && 
            !options.convertToPdfA?.enabled
          )}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Apply Accessibility Fixes"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PDFAccessibilitySettings;
