
import React, { useState, useEffect } from 'react';
import FileUpload from '@/components/pdf/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadStepProps {
  onFileAccepted: (file: File) => void;
}

interface RecentFile {
  id: string;
  name: string;
  date: string;
}

const UploadStep: React.FC<UploadStepProps> = ({ onFileAccepted }) => {
  const { user } = useUser();
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch recent files when user is available
  useEffect(() => {
    async function fetchRecentFiles() {
      if (!user) return;
      
      try {
        setIsLoadingFiles(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('pdf_checks')
          .select('id, file_name, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Transform the database results into our RecentFile format
          const formattedFiles = data.map(file => ({
            id: file.id,
            name: file.file_name,
            date: new Date(file.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          }));
          
          setRecentFiles(formattedFiles);
        }
      } catch (error: any) {
        console.error('Error fetching recent files:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: "Failed to load your recent files",
          variant: "destructive"
        });
      } finally {
        setIsLoadingFiles(false);
      }
    }
    
    fetchRecentFiles();
  }, [user]);
  
  const handleRecentFileClick = async (fileId: string) => {
    try {
      setIsLoadingFiles(true);
      toast({
        title: "Loading file",
        description: "Retrieving your previously processed PDF...",
      });
      
      // Get file details from the checks table
      const { data: checkData, error: checkError } = await supabase
        .from('pdf_checks')
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (checkError) throw checkError;
      
      // For storage access, we need to get the actual file from Storage
      const storageFilePath = `${user?.id}/checks/${fileId}/original.pdf`;
      
      const { data: fileData, error: fileError } = await supabase.storage
        .from('pdf_files')
        .download(storageFilePath);
        
      if (fileError) throw fileError;
      
      // Create a File object from the blob
      const file = new File(
        [fileData], 
        checkData.file_name,
        { type: 'application/pdf' }
      );
      
      // Pass to the parent component
      onFileAccepted(file);
      
      toast({
        title: "File loaded",
        description: `${checkData.file_name} has been loaded successfully`,
      });
    } catch (error: any) {
      console.error('Error loading PDF:', error);
      setError(error.message);
      toast({
        title: "Error loading file",
        description: error.message || "Failed to load the selected PDF",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Upload PDF for Preflight</CardTitle>
          <CardDescription className="text-center">
            Upload a PDF file to check for print readiness and fix common issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload 
            onFileAccepted={onFileAccepted}
            maxSize={52428800} // 50MB
            acceptedFileTypes={[
              'application/pdf',
              'image/jpeg',
              'image/png',
              'image/tiff'
            ]}
          />
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Files</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingFiles ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recentFiles.length > 0 ? (
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center p-2 border rounded hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleRecentFileClick(file.id)}
                  >
                    <FileIcon className="h-5 w-5 mr-2 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No recent files found. Upload a PDF to get started.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadStep;
