
import React from "react";
import { FileCheck, Filter, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckReportPage from "@/components/reports/CheckReportPage";
import MuPdfToolbox from "@/components/dashboard/MuPdfToolbox";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">PDF Preflight Dashboard</h1>
      
      <div className="grid gap-6">
        <Tabs defaultValue="check" className="w-full">
          <TabsList>
            <TabsTrigger value="check" className="gap-2">
              <FileCheck className="h-4 w-4" /> Check Report
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Filter className="h-4 w-4" /> MuPDF Tools
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <FileText className="h-4 w-4" /> Documentation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="check" className="space-y-6">
            <CheckReportPage />
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-6">
            <MuPdfToolbox />
          </TabsContent>
          
          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PDF Preflight Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">PDF Processing Features</h3>
                <p>
                  Our comprehensive PDF validation and repair suite is built on industry-standard tools including MuPDF {import.meta.env.VITE_MUPDF_VERSION}, 
                  GhostScript {import.meta.env.VITE_GHOSTSCRIPT_VERSION}, and VeraPDF {import.meta.env.VITE_VERAPDF_VERSION}.
                </p>
                
                <h4 className="font-medium mt-4">Key Capabilities:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>PDF Structure Analysis and Repair</li>
                  <li>Font Embedding and Validation</li>
                  <li>Color Space Management (RGB to CMYK Conversion)</li>
                  <li>Transparency Flattening</li>
                  <li>Compliance Validation (PDF/A, PDF/X)</li>
                  <li>Image Resolution and Quality Optimization</li>
                  <li>Preflight Checks for Print Production</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
