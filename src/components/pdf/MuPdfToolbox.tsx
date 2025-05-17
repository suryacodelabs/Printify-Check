
import React, { useState, useRef } from 'react';
import { useMuPdf } from '@/hooks/useMuPdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { toast } from '@/hooks/use-toast';
import PDFViewer from '@/components/pdf/PDFViewer';
import {
  FileSearch,
  FileText,
  FileImage,
  FileOutput,
  Shield,
  DownloadCloud,
  ChevronDown,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';

const MuPdfToolbox: React.FC = () => {
  const {
    selectedFile,
    setSelectedFile,
    getDocumentInfo,
    documentInfo,
    isLoadingDocumentInfo,
    renderPage,
    renderedPage,
    isRenderingPage,
    extractText,
    extractedText,
    isExtractingText,
    convertDocument,
    convertedDocumentUrl,
    isConvertingDocument,
    getAnnotations,
    annotations,
    isLoadingAnnotations,
    protectDocument,
    protectedDocumentUrl,
    isProtectingDocument,
    versionInfo,
    isLoadingVersionInfo,
    downloadDocument,
  } = useMuPdf();
  
  const [activeTab, setActiveTab] = useState<string>('info');
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
  const [renderDpi, setRenderDpi] = useState<number>(150);
  const [colorSpace, setColorSpace] = useState<string>('rgb');
  const [extractPageRange, setExtractPageRange] = useState<string>('all');
  const [convertFormat, setConvertFormat] = useState<string>('html');
  const [convertQuality, setConvertQuality] = useState<string>('medium');
  const [convertPageRange, setConvertPageRange] = useState<string>('all');
  const [userPassword, setUserPassword] = useState<string>('');
  const [ownerPassword, setOwnerPassword] = useState<string>('');
  const [canPrint, setCanPrint] = useState<boolean>(true);
  const [canCopy, setCanCopy] = useState<boolean>(true);
  const [canModify, setCanModify] = useState<boolean>(false);
  const [canAnnotate, setCanAnnotate] = useState<boolean>(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setCurrentPageNumber(1);
      
      // Automatically get document info when a file is selected
      getDocumentInfo(file);
    }
  };
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'info' && selectedFile && !documentInfo) {
      getDocumentInfo(selectedFile);
    } else if (tab === 'annotations' && selectedFile && !annotations) {
      getAnnotations(selectedFile);
    }
  };
  
  const handleRenderPage = () => {
    if (selectedFile) {
      renderPage({
        file: selectedFile,
        pageNumber: currentPageNumber,
        options: {
          dpi: renderDpi,
          colorspace: colorSpace as 'rgb' | 'cmyk' | 'gray',
        }
      });
    }
  };
  
  const handleExtractText = () => {
    if (selectedFile) {
      extractText({
        file: selectedFile,
        pageRange: extractPageRange === 'all' ? undefined : extractPageRange
      });
    }
  };
  
  const handleConvertDocument = () => {
    if (selectedFile) {
      convertDocument({
        file: selectedFile,
        options: {
          format: convertFormat as any,
          quality: convertQuality as 'low' | 'medium' | 'high',
          pages: convertPageRange === 'all' ? undefined : convertPageRange
        }
      });
    }
  };
  
  const handleProtectDocument = () => {
    if (selectedFile) {
      if (!userPassword && !ownerPassword) {
        toast({
          title: "Password Required",
          description: "Please enter at least one password for protection.",
          variant: "destructive",
        });
        return;
      }
      
      protectDocument({
        file: selectedFile,
        password: userPassword || undefined,
        ownerPassword: ownerPassword || undefined,
        permissions: {
          canPrint,
          canCopy,
          canModify,
          canAnnotate
        }
      });
    }
  };
  
  const handleDownload = (url: string, defaultName: string) => {
    if (url && selectedFile) {
      const filename = selectedFile.name.replace('.pdf', `_${defaultName}`);
      downloadDocument(url, filename);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            MuPDF Toolbox
            {versionInfo && <span className="text-sm font-normal text-muted-foreground ml-2">v{versionInfo.version}</span>}
          </CardTitle>
          <CardDescription>
            Powerful PDF processing tools based on MuPDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-1/3">
              <Label htmlFor="pdf-file">Select PDF File</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  ref={fileInputRef}
                  type="file"
                  id="pdf-file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button 
                  onClick={triggerFileInput} 
                  variant="outline" 
                  className="w-full"
                >
                  {selectedFile ? 'Change File' : 'Choose File'}
                </Button>
              </div>
            </div>
            <div className="w-full sm:w-2/3">
              {selectedFile ? (
                <div className="text-sm">
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No file selected. Please choose a PDF file to work with.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedFile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="info">
                  <FileSearch className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Info</span>
                </TabsTrigger>
                <TabsTrigger value="render">
                  <FileImage className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Render</span>
                </TabsTrigger>
                <TabsTrigger value="text">
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
                <TabsTrigger value="convert">
                  <FileOutput className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Convert</span>
                </TabsTrigger>
                <TabsTrigger value="annotations">
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Annotations</span>
                </TabsTrigger>
                <TabsTrigger value="protect">
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Protect</span>
                </TabsTrigger>
              </TabsList>
            
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Document Information</CardTitle>
                    <CardDescription>View metadata and properties</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDocumentInfo ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    ) : documentInfo ? (
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="font-medium">Title:</div>
                          <div>{documentInfo.title || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="font-medium">Author:</div>
                          <div>{documentInfo.author || 'N/A'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="font-medium">Pages:</div>
                          <div>{documentInfo.pageCount}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="font-medium">File Size:</div>
                          <div>{(documentInfo.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="font-medium">Encrypted:</div>
                          <div>{documentInfo.isEncrypted ? 'Yes' : 'No'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="font-medium">Linearized:</div>
                          <div>{documentInfo.isLinearized ? 'Yes' : 'No'}</div>
                        </div>
                        
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center text-sm font-medium mt-2">
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show More Details
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 mt-2">
                            <div className="grid grid-cols-2 gap-1">
                              <div className="font-medium">Creator:</div>
                              <div>{documentInfo.creator || 'N/A'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="font-medium">Producer:</div>
                              <div>{documentInfo.producer || 'N/A'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div className="font-medium">Creation Date:</div>
                              <div>{documentInfo.creationDate || 'N/A'}</div>
                            </div>
                            
                            <div className="mt-2">
                              <div className="font-medium mb-1">Permissions:</div>
                              <div className="grid grid-cols-2 text-xs">
                                <div>Print: {documentInfo.permissions?.canPrint ? 'Yes' : 'No'}</div>
                                <div>Copy: {documentInfo.permissions?.canCopy ? 'Yes' : 'No'}</div>
                                <div>Modify: {documentInfo.permissions?.canModify ? 'Yes' : 'No'}</div>
                                <div>Annotate: {documentInfo.permissions?.canAnnotate ? 'Yes' : 'No'}</div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No information</AlertTitle>
                        <AlertDescription>
                          Click the button below to load document information.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => selectedFile && getDocumentInfo(selectedFile)}
                      disabled={isLoadingDocumentInfo || !selectedFile}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isLoadingDocumentInfo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {documentInfo ? 'Refresh Info' : 'Load Info'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="render">
                <Card>
                  <CardHeader>
                    <CardTitle>Render Page</CardTitle>
                    <CardDescription>Convert PDF pages to images</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="page-number">Page Number</Label>
                          <Input
                            id="page-number"
                            type="number"
                            min={1}
                            max={documentInfo?.pageCount || 100}
                            value={currentPageNumber}
                            onChange={(e) => setCurrentPageNumber(parseInt(e.target.value) || 1)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="color-space">Color Space</Label>
                          <Select value={colorSpace} onValueChange={setColorSpace}>
                            <SelectTrigger id="color-space" className="mt-1">
                              <SelectValue placeholder="Color Space" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rgb">RGB</SelectItem>
                              <SelectItem value="cmyk">CMYK</SelectItem>
                              <SelectItem value="gray">Grayscale</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label htmlFor="dpi-slider">DPI: {renderDpi}</Label>
                        </div>
                        <Slider
                          id="dpi-slider"
                          min={72}
                          max={300}
                          step={1}
                          value={[renderDpi]}
                          onValueChange={(value) => setRenderDpi(value[0])}
                        />
                      </div>
                      
                      {renderedPage && (
                        <div className="mt-4">
                          <Label className="mb-1 block">Rendered Image</Label>
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={renderedPage}
                              alt={`Page ${currentPageNumber}`}
                              className="rounded-md object-contain h-full w-full"
                            />
                          </AspectRatio>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      onClick={handleRenderPage}
                      disabled={isRenderingPage || !selectedFile}
                      variant="outline"
                      size="sm"
                    >
                      {isRenderingPage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Render Page
                    </Button>
                    
                    {renderedPage && (
                      <Button
                        onClick={() => handleDownload(renderedPage, `page_${currentPageNumber}.png`)}
                        size="sm"
                        variant="ghost"
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="text">
                <Card>
                  <CardHeader>
                    <CardTitle>Extract Text</CardTitle>
                    <CardDescription>Extract text content from PDF</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="page-range">Page Range</Label>
                        <Input
                          id="page-range"
                          placeholder="e.g. 1,3-5,10 (leave empty for all pages)"
                          value={extractPageRange}
                          onChange={(e) => setExtractPageRange(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty or type "all" for all pages
                        </p>
                      </div>
                      
                      {isExtractingText ? (
                        <div className="p-4 border rounded flex items-center justify-center">
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Extracting text...
                        </div>
                      ) : extractedText ? (
                        <div>
                          <Label className="mb-1 block">Extracted Text</Label>
                          <div className="max-h-80 overflow-y-auto border rounded-md p-3 text-sm">
                            {typeof extractedText === 'string' ? (
                              <p className="whitespace-pre-wrap">{extractedText}</p>
                            ) : (
                              Object.entries(extractedText).map(([page, text]) => (
                                <div key={page} className="mb-4">
                                  <h3 className="font-medium mb-1">Page {page}</h3>
                                  <p className="whitespace-pre-wrap">{text}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleExtractText}
                      disabled={isExtractingText || !selectedFile}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isExtractingText && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Extract Text
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="convert">
                <Card>
                  <CardHeader>
                    <CardTitle>Convert Document</CardTitle>
                    <CardDescription>Convert PDF to other formats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="convert-format">Output Format</Label>
                        <Select value={convertFormat} onValueChange={setConvertFormat}>
                          <SelectTrigger id="convert-format" className="mt-1">
                            <SelectValue placeholder="Output Format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="svg">SVG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="jpg">JPG</SelectItem>
                            <SelectItem value="tiff">TIFF</SelectItem>
                            <SelectItem value="text">Plain Text</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="convert-quality">Quality</Label>
                        <Select value={convertQuality} onValueChange={setConvertQuality}>
                          <SelectTrigger id="convert-quality" className="mt-1">
                            <SelectValue placeholder="Quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="convert-page-range">Page Range</Label>
                        <Input
                          id="convert-page-range"
                          placeholder="e.g. 1,3-5,10 (leave empty for all pages)"
                          value={convertPageRange}
                          onChange={(e) => setConvertPageRange(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty or type "all" for all pages
                        </p>
                      </div>
                      
                      {convertedDocumentUrl && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Conversion Complete</AlertTitle>
                          <AlertDescription>
                            Your document has been converted successfully.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      onClick={handleConvertDocument}
                      disabled={isConvertingDocument || !selectedFile}
                      variant="outline"
                      size="sm"
                    >
                      {isConvertingDocument && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Convert
                    </Button>
                    
                    {convertedDocumentUrl && (
                      <Button
                        onClick={() => handleDownload(convertedDocumentUrl, `converted.${convertFormat}`)}
                        size="sm"
                        variant="ghost"
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="annotations">
                <Card>
                  <CardHeader>
                    <CardTitle>Annotations</CardTitle>
                    <CardDescription>View document annotations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnnotations ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : annotations && annotations.length > 0 ? (
                      <div className="space-y-3">
                        {annotations.map((annotation) => (
                          <div key={annotation.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">{annotation.type}</div>
                              <div className="text-xs text-muted-foreground">Page {annotation.page + 1}</div>
                            </div>
                            {annotation.content && (
                              <p className="text-sm mt-1">{annotation.content}</p>
                            )}
                            <div className="text-xs text-muted-foreground mt-2">
                              ID: {annotation.id}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No annotations found</AlertTitle>
                        <AlertDescription>
                          This document doesn't contain any annotations.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => selectedFile && getAnnotations(selectedFile)}
                      disabled={isLoadingAnnotations || !selectedFile}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isLoadingAnnotations && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {annotations ? 'Refresh Annotations' : 'Load Annotations'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="protect">
                <Card>
                  <CardHeader>
                    <CardTitle>Protect Document</CardTitle>
                    <CardDescription>Add password protection and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user-password">User Password</Label>
                        <Input
                          id="user-password"
                          type="password"
                          placeholder="Password to open document"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Required to open the document
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="owner-password">Owner Password</Label>
                        <Input
                          id="owner-password"
                          type="password"
                          placeholder="Password for full access"
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Grants full access to the document
                        </p>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">Permissions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can-print"
                              checked={canPrint}
                              onCheckedChange={(checked) => setCanPrint(!!checked)}
                            />
                            <Label htmlFor="can-print" className="text-sm">Allow printing</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can-copy"
                              checked={canCopy}
                              onCheckedChange={(checked) => setCanCopy(!!checked)}
                            />
                            <Label htmlFor="can-copy" className="text-sm">Allow content copying</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can-modify"
                              checked={canModify}
                              onCheckedChange={(checked) => setCanModify(!!checked)}
                            />
                            <Label htmlFor="can-modify" className="text-sm">Allow editing</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can-annotate"
                              checked={canAnnotate}
                              onCheckedChange={(checked) => setCanAnnotate(!!checked)}
                            />
                            <Label htmlFor="can-annotate" className="text-sm">Allow annotations</Label>
                          </div>
                        </div>
                      </div>
                      
                      {protectedDocumentUrl && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Protection Applied</AlertTitle>
                          <AlertDescription>
                            Your document has been protected successfully.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      onClick={handleProtectDocument}
                      disabled={isProtectingDocument || !selectedFile}
                      variant="outline"
                      size="sm"
                    >
                      {isProtectingDocument && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Apply Protection
                    </Button>
                    
                    {protectedDocumentUrl && (
                      <Button
                        onClick={() => handleDownload(protectedDocumentUrl, 'protected.pdf')}
                        size="sm"
                        variant="ghost"
                      >
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>PDF Preview</CardTitle>
                <CardDescription>
                  View the current document
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px]">
                {selectedFile ? (
                  <PDFViewer
                    file={selectedFile}
                    showControls={true}
                    maxHeight="500px"
                    currentPage={currentPageNumber}
                    onPageChange={setCurrentPageNumber}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Select a PDF file to preview
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuPdfToolbox;
