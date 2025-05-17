
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileImage, Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import { ghostscriptService } from '@/services/ghostscriptService';
import { Link } from 'react-router-dom';

interface GhostscriptVersionInfo {
  version: string;
  fullVersion: string;
  available: string;
  error?: string;
}

const GhostscriptInfo: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<GhostscriptVersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        setIsLoading(true);
        const info = await ghostscriptService.getVersionInfo();
        setVersionInfo(info);
        setError(null);
      } catch (err) {
        console.error('Error fetching Ghostscript version info:', err);
        setError('Failed to get Ghostscript information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersionInfo();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ghostscript PDF Tools</CardTitle>
        <CardDescription>
          Professional PDF processing powered by Ghostscript {import.meta.env.VITE_GHOSTSCRIPT_VERSION}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="flex items-center p-4 border rounded-md text-amber-600 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-md bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <p className="font-medium">Ghostscript {versionInfo?.version} Available</p>
                  <p className="text-sm text-muted-foreground">
                    {versionInfo?.available === 'true' 
                      ? 'All advanced PDF tools are ready to use'
                      : 'Some features might be limited'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild className="h-auto py-4 flex flex-col items-center justify-center">
                  <Link to="/pdf-image-extraction">
                    <FileImage className="h-10 w-10 mb-2" />
                    <span className="font-medium">Image Extraction</span>
                    <span className="text-xs mt-1 text-center">
                      Convert PDF pages to high-quality images
                    </span>
                  </Link>
                </Button>

                <Button asChild className="h-auto py-4 flex flex-col items-center justify-center">
                  <Link to="/pdf-print-optimization">
                    <Printer className="h-10 w-10 mb-2" />
                    <span className="font-medium">Print Optimization</span>
                    <span className="text-xs mt-1 text-center">
                      Prepare PDFs for professional printing
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div>
          {versionInfo?.available === 'true' 
            ? `Using Ghostscript ${versionInfo?.fullVersion || versionInfo?.version}`
            : 'Some Ghostscript features may not be available'}
        </div>
      </CardFooter>
    </Card>
  );
};

export default GhostscriptInfo;
