
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useChecks } from '@/hooks/useChecks';
import PDFCheckDetails from '@/components/pdf/PDFCheckDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, Download, AlertTriangle } from 'lucide-react';

const CheckDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getCheckById, 
    isLoading, 
    downloadPreflightReport, 
    error 
  } = useChecks();
  const [check, setCheck] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  // Poll for status updates if check is pending or processing
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (check && (check.status === 'pending' || check.status === 'processing')) {
      intervalId = window.setInterval(async () => {
        if (id) {
          try {
            const updatedCheck = await getCheckById(id);
            if (updatedCheck && (updatedCheck.status === 'completed' || updatedCheck.status === 'complete' || updatedCheck.status === 'failed')) {
              window.clearInterval(intervalId!);
            }
            setCheck(updatedCheck);
          } catch (err) {
            console.error("Error polling for check updates:", err);
          }
        }
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [check?.status, id, getCheckById]);
  
  // Initial load
  useEffect(() => {
    const loadCheckDetails = async () => {
      if (id) {
        try {
          const checkData = await getCheckById(id);
          setCheck(checkData);
          
          // For demo purposes, we'll simulate a PDF file
          // In production, this would come from the backend
          if (checkData) {
            try {
              // Try to get the actual PDF file from the API
              const response = await fetch(`/api/preflight/pdf/${id}`);
              if (response.ok) {
                const blob = await response.blob();
                setFileUrl(URL.createObjectURL(blob));
              } else {
                // Fallback to a placeholder
                const blob = new Blob(['PDF content'], { type: 'application/pdf' });
                setFileUrl(URL.createObjectURL(blob));
              }
            } catch (err) {
              console.error("Error fetching PDF:", err);
              // Fallback to a placeholder
              const blob = new Blob(['PDF content'], { type: 'application/pdf' });
              setFileUrl(URL.createObjectURL(blob));
            }
          }
        } catch (err) {
          console.error("Error loading check details:", err);
        }
      }
    };
    
    loadCheckDetails();
  }, [id, getCheckById]);
  
  const handleDownloadReport = async () => {
    if (id) {
      const reportUrl = await downloadPreflightReport(id);
      if (reportUrl) {
        const a = document.createElement('a');
        a.href = reportUrl;
        a.download = `${check?.fileName ? String(check.fileName).replace('.pdf', '') : 'report'}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link to="/dashboard">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-[600px] w-full mt-6" />
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link to="/dashboard">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  if (!check) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link to="/dashboard">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-2">Check not found</h1>
            <p className="text-muted-foreground mb-6">
              The PDF check you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link to="/dashboard">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadReport}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold truncate">{check.fileName}</h1>
          <p className="text-muted-foreground">
            Checked on {new Date(check.createdAt).toLocaleDateString()} • 
            {(check.fileSize / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
        
        {check && (
          <PDFCheckDetails 
            checkId={check.checkId}
            fileName={check.fileName}
            status={check.status}
            issues={check.issues || []}
            qualityScore={check.qualityScore}
            file={fileUrl}
          />
        )}
      </div>
    </Layout>
  );
};

export default CheckDetails;
