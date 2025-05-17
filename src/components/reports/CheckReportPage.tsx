
import React from 'react';
import PDFPreflightReport from './PDFPreflightReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { FileText, Settings, Activity, FileBadge } from 'lucide-react';

// Define the literal type to match PreflightIssue interface
interface MockIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  page?: number;
  canAutoFix: boolean;
}

// Demo issues for development with correct severity types
const mockIssues: MockIssue[] = [
  {
    id: "1",
    severity: "critical",  // Using the literal string type
    title: "Low Resolution Images",
    description: "Document contains images below 300 DPI that may appear pixelated when printed.",
    page: 2,
    canAutoFix: false
  },
  {
    id: "2",
    severity: "warning",  // Using the literal string type
    title: "RGB Color Space",
    description: "Some elements use RGB color space instead of CMYK recommended for printing.",
    page: 1,
    canAutoFix: true
  },
  {
    id: "3", 
    severity: "warning",  // Using the literal string type
    title: "Missing Bleed Area",
    description: "Document lacks 3mm bleed area which may result in white edges when printed.",
    canAutoFix: false
  },
  {
    id: "4",
    severity: "info",  // Using the literal string type
    title: "Metadata Missing",
    description: "Document is missing title and author metadata.",
    canAutoFix: true
  }
];

interface CheckReportPageProps {
  checkData?: any;
}

const CheckReportPage: React.FC<CheckReportPageProps> = ({ checkData }) => {
  // In a real app, we would use the checkData
  // For now, we'll use mock data to demonstrate the UI
  
  // This calculation would come from the actual check data
  const qualityScore = checkData?.quality_score || 72;
  const fileName = checkData?.file_name || "document.pdf";
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="report" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="report" className="gap-2">
            <Activity size={16} />
            Report
          </TabsTrigger>
          <TabsTrigger value="document" className="gap-2">
            <FileText size={16} />
            Document
          </TabsTrigger>
          <TabsTrigger value="metadata" className="gap-2">
            <FileBadge size={16} />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="report">
          <PDFPreflightReport 
            issues={mockIssues} 
            qualityScore={qualityScore}
            fileName={fileName}
          />
        </TabsContent>
        
        <TabsContent value="document">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Document Properties</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">File Name</span>
                <span className="font-medium">{fileName}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-medium">{((checkData?.file_size || 0) / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Pages</span>
                <span className="font-medium">4</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">PDF Version</span>
                <span className="font-medium">1.7</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(checkData?.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Modified</span>
                <span className="font-medium">{new Date(checkData?.updated_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="metadata">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Document Metadata</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">Quarterly Report</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Author</span>
                <span className="font-medium">Marketing Team</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium">Q4 2023 Performance</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Keywords</span>
                <span className="font-medium">report, quarterly, finance</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Creator</span>
                <span className="font-medium">Adobe InDesign 2023</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Producer</span>
                <span className="font-medium">Adobe PDF Library 15.0</span>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Preflight Settings</h3>
            <p className="text-muted-foreground mb-4">
              These settings were used when analyzing your document.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Profile</span>
                <span className="font-medium">Print Production</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Minimum Image Resolution</span>
                <span className="font-medium">300 DPI</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Color Space</span>
                <span className="font-medium">CMYK</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Bleed Requirement</span>
                <span className="font-medium">3mm</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Font Embedding</span>
                <span className="font-medium">Required</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckReportPage;
