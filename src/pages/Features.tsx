
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCheck, 
  Wrench, 
  Eye, 
  EyeOff, 
  FileText, 
  Users, 
  Sparkles, 
  Database,
  Zap,
  Table,
  Lock,
  Layers
} from 'lucide-react';

const Features = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/30 dark:to-background border-b">
        <div className="container py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Features</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how Printify Check helps you create perfect print-ready PDFs
          </p>
        </div>
      </div>

      <div className="container py-16">
        <Tabs defaultValue="preflight" className="w-full">
          <div className="flex justify-center mb-12 overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="preflight">Preflight Checks</TabsTrigger>
              <TabsTrigger value="fixes">Fixes</TabsTrigger>
              <TabsTrigger value="ocr">OCR</TabsTrigger>
              <TabsTrigger value="redaction">Redaction</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="preflight">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Image Resolution</CardTitle>
                  <CardDescription>Detects low-resolution images that would print poorly</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Identifies images below 300 DPI, ensuring crisp print output. Includes position data for easy correction.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Bleed Verification</CardTitle>
                  <CardDescription>Checks for proper bleed margins</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Verifies the required 3mm bleed margin exists for content that extends to the page edge.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Color Spaces</CardTitle>
                  <CardDescription>Identifies RGB and spot colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Detects RGB colors that should be CMYK for print and lists all spot colors for verification.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Font Embedding</CardTitle>
                  <CardDescription>Checks that all fonts are properly embedded</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Ensures all fonts are embedded in the PDF to prevent text reflow or substitution issues.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transparency</CardTitle>
                  <CardDescription>Identifies unflattened transparency</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Detects unflattened transparency that may cause unexpected results in print.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ink Density</CardTitle>
                  <CardDescription>Checks total ink coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Identifies areas where total ink density exceeds 300%, which can cause print issues.
                  </p>
                </CardContent>
              </Card>
              
              {/* Additional preflight checks would be listed here */}
              
              <div className="md:col-span-2 lg:col-span-3 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">+ 12 More Preflight Checks</CardTitle>
                    <CardDescription className="text-center">
                      Including PDF/X compliance, text size, hairlines, overprint, spot colors, 
                      image compression, trim/safe zones, ICC profiles, page geometry, annotations/forms, 
                      metadata, and file size checks.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="fixes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Virtual Bleed</CardTitle>
                  <CardDescription>Automatically adds 3mm bleed</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Creates a 3mm bleed by extending content at the page edges, ensuring proper printing to the edge.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Metadata Stripping</CardTitle>
                  <CardDescription>Removes sensitive metadata</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Securely removes document metadata including author information, creation tools, and other sensitive data.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Issue Annotation</CardTitle>
                  <CardDescription>Adds visual markers for issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Creates red boxes and comments highlighting areas that require attention in the PDF.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Page Box Adjustments</CardTitle>
                  <CardDescription>Fixes crop/trim boxes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Corrects improperly defined crop, trim, art, and bleed boxes for correct printing dimensions.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Manual Fix Flagging</CardTitle>
                  <CardDescription>Adds comments for non-fixable issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Clearly marks issues that require manual correction with AI-assisted recommendations.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Export Annotations</CardTitle>
                  <CardDescription>Creates PDF/SVG/JSON annotations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Exports annotation data in multiple formats for integration with other tools or review systems.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Report Generation</CardTitle>
                  <CardDescription>Creates detailed preflight reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Generates comprehensive PDF/JSON reports of all issues, with customization options for Pro users.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ocr">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Text Extraction</CardTitle>
                  <CardDescription>Makes scanned PDFs searchable</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Converts image-based text in scanned PDFs to actual text content, making documents searchable and selectable.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>PDF/A-3u Export</CardTitle>
                  <CardDescription>Creates accessible, archivable PDFs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Converts documents to the PDF/A-3u standard for long-term archiving and accessibility compliance.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Multilingual Support</CardTitle>
                  <CardDescription>Recognizes text in multiple languages</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Supports text recognition in over 100 languages using Tesseract language packs, including non-Latin scripts.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Preflight Checks</CardTitle>
                  <CardDescription>Enables text-based checks for scanned PDFs</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Allows preflight checks like text size and trim zone verification on previously inaccessible scanned documents.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="redaction">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Text Redaction</CardTitle>
                  <CardDescription>Permanently removes sensitive text</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Completely removes PII and sensitive information using regex patterns or manual selection.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Image Redaction</CardTitle>
                  <CardDescription>Removes sensitive images</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Permanently removes or blacks out sensitive images and graphics based on coordinates.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Metadata Removal</CardTitle>
                  <CardDescription>Strips hidden document metadata</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Removes document metadata including author information, creation tools, and XMP data for GDPR compliance.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>PDF/A-3u Compliance</CardTitle>
                  <CardDescription>Maintains accessibility after redaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Ensures redacted documents maintain PDF/A-3u compliance for accessibility and archiving standards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="enterprise">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Processing</CardTitle>
                  <CardDescription>Process multiple files at once</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Table className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Process multiple PDFs simultaneously with the same preflight profile and settings.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Team Collaboration</CardTitle>
                  <CardDescription>Share and collaborate on PDFs</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Enable team comments, annotations, and shared preflight profiles between team members.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                  <CardDescription>Integrate with your workflow</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Access preflight, OCR, and redaction functionality via REST API for custom integrations.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Custom Profiles</CardTitle>
                  <CardDescription>Save and reuse check settings</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Layers className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Create, save, and share JSON-based preflight profiles for consistent checking across projects.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Analytics</CardTitle>
                  <CardDescription>Track usage and performance</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Monitor usage statistics, error rates, and processing performance with detailed dashboards.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Priority Support</CardTitle>
                  <CardDescription>Get help when you need it</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Access priority support with 12-hour response time and dedicated assistance for enterprise needs.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Security & Compliance</CardTitle>
                  <CardDescription>Enterprise-grade security for your data</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-sm">
                    Enhanced security features including role-based access control, audit logs, and GDPR-compliant data handling. 
                    All processed PDFs are securely deleted after 7 days with optional immediate deletion. Team administrators 
                    can enforce custom security policies and track all user actions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bg-muted border-t">
        <div className="container py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Start using Printify Check now for free and experience the difference in your PDF workflows.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 transition-colors">
              Try It Free
            </button>
            <button className="bg-white border px-6 py-2 rounded-md hover:bg-muted/50 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Features;
