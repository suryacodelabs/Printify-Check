import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, MinusCircle, FileCheck } from 'lucide-react';

const CompetitorAnalysis: React.FC = () => {
  // Define all competitors for the comparison
  const competitors = [
    { 
      id: 'printify-check', 
      name: 'Printify Check', 
      description: 'Free, open-source PDF preflight with OCR, redaction, and smart fixes.',
      pricing: 'Free / $19/mo Pro / $49/mo Enterprise',
      url: 'https://printifycheck.com'
    },
    { 
      id: 'adobe-acrobat', 
      name: 'Adobe Acrobat Preflight', 
      description: 'Professional PDF preflighting tool integrated with Adobe Acrobat Pro.',
      pricing: '$19.99/mo (with Acrobat Pro subscription)',
      url: 'https://adobe.com/acrobat'
    },
    { 
      id: 'enfocus-pitstop', 
      name: 'Enfocus PitStop Pro', 
      description: 'Advanced PDF preflight and editing software for print professionals.',
      pricing: '$999 perpetual / $299/yr subscription',
      url: 'https://www.enfocus.com/en/pitstop-pro'
    },
    { 
      id: 'callas-pdftoolbox', 
      name: 'callas pdfToolbox', 
      description: 'Comprehensive PDF preflight, correction and conversion solution.',
      pricing: '$999 - $2,499 depending on version',
      url: 'https://www.callassoftware.com/en/products/pdftoolbox'
    },
    { 
      id: 'markzware-flightcheck', 
      name: 'Markzware FlightCheck', 
      description: 'Stand-alone preflight solution for multiple file formats.',
      pricing: '$199 - $499 depending on version',
      url: 'https://markzware.com/products/flightcheck/'
    },
    { 
      id: 'pdf-checker', 
      name: 'PDF Checker', 
      description: 'Basic PDF validation and checking tool for standard compliance.',
      pricing: '$99 - $299 depending on version',
      url: 'https://www.pdf-checker.com/'
    },
    { 
      id: 'prepressure', 
      name: 'Prepressure', 
      description: 'Web-based PDF preflight service with basic checking capabilities.',
      pricing: 'Free basic / $9.99/mo premium',
      url: 'https://www.prepressure.com/'
    },
    { 
      id: 'apago-pdf-appraiser', 
      name: 'Apago PDF Appraiser', 
      description: 'Quality control tool for PDF files with detailed reporting.',
      pricing: '$599 perpetual',
      url: 'https://www.apagoinc.com/pdf-appraiser/'
    },
    { 
      id: 'axaio-madeforflight', 
      name: 'axaio MadeForFlight', 
      description: 'InDesign plugin for preflight checking and package preparation.',
      pricing: '$349 perpetual',
      url: 'https://www.axaio.com/doku.php/en:products:madeforflight'
    },
    { 
      id: 'solprint-preflight', 
      name: 'SolPrint Preflight', 
      description: 'Cloud-based PDF preflight solution for print workflows.',
      pricing: '$29.99/mo',
      url: 'https://www.solprint.com/'
    }
  ];

  // Define feature categories and features for comparison
  const featureCategories = [
    {
      id: 'core',
      name: 'Core Preflight Features',
      features: [
        { id: 'pdf-version', name: 'PDF Version Check' },
        { id: 'color-spaces', name: 'Color Space Analysis' },
        { id: 'image-resolution', name: 'Image Resolution Check' },
        { id: 'fonts', name: 'Font Embedding & Subsetting' },
        { id: 'transparency', name: 'Transparency Detection' },
        { id: 'overprint', name: 'Overprint Settings' },
        { id: 'bleed', name: 'Bleed & Trim Check' }
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Features',
      features: [
        { id: 'auto-fix', name: 'Automatic Issue Fixing' },
        { id: 'profiles', name: 'Custom Preflight Profiles' },
        { id: 'batch', name: 'Batch Processing' },
        { id: 'reporting', name: 'Detailed Reporting' },
        { id: 'visualization', name: 'Issue Visualization' },
        { id: 'integration', name: 'API/Workflow Integration' }
      ]
    },
    {
      id: 'extras',
      name: 'Extra Features',
      features: [
        { id: 'ocr', name: 'OCR Capabilities' },
        { id: 'redaction', name: 'Redaction Tools' },
        { id: 'color-conversion', name: 'Color Conversion' },
        { id: 'certification', name: 'PDF/X, PDF/A Certification' },
        { id: 'cloud', name: 'Cloud-based Processing' },
        { id: 'open-source', name: 'Open Source' }
      ]
    }
  ];

  // Define support for features by competitor
  // 2 = Full support, 1 = Partial support, 0 = No support
  const featureSupport = {
    'printify-check': {
      'pdf-version': 2, 'color-spaces': 2, 'image-resolution': 2, 'fonts': 2, 'transparency': 2, 'overprint': 2, 'bleed': 2,
      'auto-fix': 2, 'profiles': 2, 'batch': 2, 'reporting': 2, 'visualization': 2, 'integration': 2,
      'ocr': 2, 'redaction': 2, 'color-conversion': 2, 'certification': 2, 'cloud': 2, 'open-source': 2
    },
    'adobe-acrobat': {
      'pdf-version': 2, 'color-spaces': 2, 'image-resolution': 2, 'fonts': 2, 'transparency': 2, 'overprint': 2, 'bleed': 2,
      'auto-fix': 1, 'profiles': 2, 'batch': 1, 'reporting': 2, 'visualization': 2, 'integration': 1,
      'ocr': 2, 'redaction': 2, 'color-conversion': 2, 'certification': 2, 'cloud': 1, 'open-source': 0
    },
    'enfocus-pitstop': {
      'pdf-version': 2, 'color-spaces': 2, 'image-resolution': 2, 'fonts': 2, 'transparency': 2, 'overprint': 2, 'bleed': 2,
      'auto-fix': 2, 'profiles': 2, 'batch': 2, 'reporting': 2, 'visualization': 2, 'integration': 2,
      'ocr': 1, 'redaction': 0, 'color-conversion': 2, 'certification': 2, 'cloud': 0, 'open-source': 0
    },
    'callas-pdftoolbox': {
      'pdf-version': 2, 'color-spaces': 2, 'image-resolution': 2, 'fonts': 2, 'transparency': 2, 'overprint': 2, 'bleed': 2,
      'auto-fix': 2, 'profiles': 2, 'batch': 2, 'reporting': 2, 'visualization': 2, 'integration': 2,
      'ocr': 0, 'redaction': 0, 'color-conversion': 2, 'certification': 2, 'cloud': 1, 'open-source': 0
    },
    'markzware-flightcheck': {
      'pdf-version': 2, 'color-spaces': 2, 'image-resolution': 2, 'fonts': 2, 'transparency': 2, 'overprint': 2, 'bleed': 2,
      'auto-fix': 1, 'profiles': 1, 'batch': 2, 'reporting': 2, 'visualization': 1, 'integration': 1,
      'ocr': 0, 'redaction': 0, 'color-conversion': 1, 'certification': 1, 'cloud': 0, 'open-source': 0
    },
    'pdf-checker': {
      'pdf-version': 2, 'color-spaces': 1, 'image-resolution': 2, 'fonts': 2, 'transparency': 1, 'overprint': 1, 'bleed': 1,
      'auto-fix': 0, 'profiles': 1, 'batch': 1, 'reporting': 1, 'visualization': 1, 'integration': 0,
      'ocr': 0, 'redaction': 0, 'color-conversion': 0, 'certification': 1, 'cloud': 0, 'open-source': 0
    },
    'prepressure': {
      'pdf-version': 2, 'color-spaces': 1, 'image-resolution': 1, 'fonts': 1, 'transparency': 1, 'overprint': 0, 'bleed': 1,
      'auto-fix': 0, 'profiles': 0, 'batch': 0, 'reporting': 1, 'visualization': 0, 'integration': 0,
      'ocr': 0, 'redaction': 0, 'color-conversion': 0, 'certification': 0, 'cloud': 2, 'open-source': 0
    },
    'apago-pdf-appraiser': {
      'pdf-version': 2, 'color-spaces': 2, 'image-resolution': 2, 'fonts': 2, 'transparency': 2, 'overprint': 1, 'bleed': 1,
      'auto-fix': 0, 'profiles': 1, 'batch': 1, 'reporting': 2, 'visualization': 1, 'integration': 1,
      'ocr': 0, 'redaction': 0, 'color-conversion': 1, 'certification': 1, 'cloud': 0, 'open-source': 0
    },
    'axaio-madeforflight': {
      'pdf-version': 1, 'color-spaces': 2, 'image-resolution': 2, 'fonts': 2, 'transparency': 1, 'overprint': 1, 'bleed': 2,
      'auto-fix': 1, 'profiles': 1, 'batch': 0, 'reporting': 1, 'visualization': 1, 'integration': 1,
      'ocr': 0, 'redaction': 0, 'color-conversion': 1, 'certification': 0, 'cloud': 0, 'open-source': 0
    },
    'solprint-preflight': {
      'pdf-version': 2, 'color-spaces': 1, 'image-resolution': 2, 'fonts': 1, 'transparency': 1, 'overprint': 1, 'bleed': 1,
      'auto-fix': 0, 'profiles': 1, 'batch': 1, 'reporting': 1, 'visualization': 1, 'integration': 0,
      'ocr': 0, 'redaction': 0, 'color-conversion': 1, 'certification': 1, 'cloud': 2, 'open-source': 0
    }
  };

  // Helper function to render support indicator
  const renderSupport = (level: number) => {
    if (level === 2) return <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Full support" />;
    if (level === 1) return <MinusCircle className="h-5 w-5 text-amber-500" aria-label="Partial support" />;
    return <XCircle className="h-5 w-5 text-red-500" aria-label="No support" />;
  };

  const printifyFeatures = [
    { title: "Free Open Source", description: "Completely free for basic use with source code available on GitHub" },
    { title: "Advanced OCR", description: "Extract text from images and scanned PDFs with high accuracy" },
    { title: "Smart Auto-Fix", description: "Automatically fix common PDF issues with one click" },
    { title: "Cloud Processing", description: "Process PDFs in the cloud without using local resources" },
    { title: "Custom Profiles", description: "Create and save custom preflight profiles for different requirements" }
  ];

  return (
    <Layout>
      <Helmet>
        <title>PDF Preflight Tool Comparison 2025 | Printify Check vs Competitors</title>
        <meta name="description" content="Compare Printify Check with top PDF preflight tools in 2025. Side-by-side feature analysis of Adobe Acrobat, PitStop Pro, pdfToolbox and more." />
        <meta name="keywords" content="PDF preflight comparison 2025, Printify Check vs PitStop Pro, Adobe Acrobat Preflight alternatives, best PDF preflight tools 2025" />
        <link rel="canonical" href="https://printifycheck.com/competitor-analysis" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://printifycheck.com/competitor-analysis" />
        <meta property="og:title" content="PDF Preflight Tool Comparison 2025 | Printify Check vs Competitors" />
        <meta property="og:description" content="Compare Printify Check with top PDF preflight tools in 2025. Side-by-side feature analysis of Adobe Acrobat, PitStop Pro, pdfToolbox and more." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://printifycheck.com/competitor-analysis" />
        <meta property="twitter:title" content="PDF Preflight Tool Comparison 2025 | Printify Check vs Competitors" />
        <meta property="twitter:description" content="Compare Printify Check with top PDF preflight tools in 2025. Side-by-side feature analysis of Adobe Acrobat, PitStop Pro, pdfToolbox and more." />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "PDF Preflight Tool Comparison 2025",
            "description": "Compare Printify Check with top PDF preflight tools in 2025. Side-by-side feature analysis of Adobe Acrobat, PitStop Pro, pdfToolbox and more.",
            "author": {
              "@type": "Organization",
              "name": "Printify Check"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Printify Check",
              "logo": {
                "@type": "ImageObject",
                "url": "https://printifycheck.com/logo.png"
              }
            },
            "datePublished": "2025-01-15",
            "dateModified": "2025-05-14"
          })}
        </script>
      </Helmet>
      
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">2025 PDF Preflight Tool Comparison</h1>
            <p className="text-xl text-muted-foreground">
              Compare Printify Check with the top 10 PDF preflight tools available in 2025. Find the perfect solution for your print production needs.
            </p>
          </div>
          
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-6 w-6 text-primary" />
                Why Printify Check Leads in 2025
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {printifyFeatures.map((feature, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="core">Core Features</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="extras">Extras</TabsTrigger>
            </TabsList>
            
            {featureCategories.map(category => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <h2 className="text-2xl font-bold text-center mb-6">{category.name} Comparison</h2>
                
                <div className="overflow-x-auto">
                  <Table className="w-full border-collapse">
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[250px]">Feature</TableHead>
                        {competitors.map(comp => (
                          <TableHead key={comp.id} className="text-center">
                            <div className="font-medium text-nowrap">{comp.name}</div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.features.map(feature => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-medium">{feature.name}</TableCell>
                          {competitors.map(comp => (
                            <TableCell key={`${comp.id}-${feature.id}`} className="text-center">
                              {renderSupport(featureSupport[comp.id][feature.id])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex items-center justify-center gap-8 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Full support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MinusCircle className="h-4 w-4 text-amber-500" />
                    <span>Partial support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>No support</span>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Competitor Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {competitors.filter(comp => comp.id !== 'printify-check').map(competitor => (
                <Card key={competitor.id} className="h-full">
                  <CardHeader>
                    <CardTitle>{competitor.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{competitor.description}</p>
                    <div>
                      <h3 className="font-medium mb-1">Pricing:</h3>
                      <p className="text-muted-foreground">{competitor.pricing}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Key Strengths:</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {Object.entries(featureSupport[competitor.id])
                          .filter(([featureId, level]) => level === 2)
                          .slice(0, 3)
                          .map(([featureId]) => {
                            const featureName = featureCategories
                              .flatMap(cat => cat.features)
                              .find(f => f.id === featureId)?.name;
                            return (
                              <li key={featureId}>{featureName}</li>
                            );
                          })}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Weaknesses:</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {Object.entries(featureSupport[competitor.id])
                          .filter(([featureId, level]) => level === 0)
                          .slice(0, 3)
                          .map(([featureId]) => {
                            const featureName = featureCategories
                              .flatMap(cat => cat.features)
                              .find(f => f.id === featureId)?.name;
                            return (
                              <li key={featureId}>{featureName}</li>
                            );
                          })}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Try Printify Check Today</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Experience the most comprehensive, affordable PDF preflight solution of 2025. Free to use, with Pro and Enterprise options for advanced needs.
            </p>
            <div className="flex justify-center">
              <a href="/auth" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does Printify Check compare to Adobe Acrobat Preflight in 2025?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Printify Check offers comparable core preflight capabilities to Adobe Acrobat but is free and open-source. It also provides advanced features like cloud processing and OCR capabilities that come standard, while these are limited or require additional subscriptions with Adobe.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is Printify Check suitable for enterprise print workflows?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Yes, Printify Check's Enterprise tier provides all the features needed for professional print workflows, including API integration, batch processing, and custom preflight profiles. Many enterprises are switching from legacy solutions due to Printify Check's modern cloud architecture and cost-effectiveness.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What makes Printify Check's auto-fix feature better than competitors?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Printify Check's auto-fix utilizes advanced AI to intelligently correct issues while preserving design intent. Unlike competitors that apply rigid fixes, Printify Check analyzes context and makes smart corrections for color conversion, image resolution, font embedding, and more.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can Printify Check replace PitStop Pro in a production environment?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>For most workflows, yes. Printify Check has reached feature parity with PitStop Pro in 2025 for core preflight capabilities while adding cloud processing and collaborative features. The main advantage PitStop still holds is its integration with certain legacy systems.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CompetitorAnalysis;
