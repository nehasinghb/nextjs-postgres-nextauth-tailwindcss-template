// components/bulk-upload-dialog.tsx
'use client';

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileJson, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Eye,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UploadResult {
  success: boolean;
  templateName: string;
  templateId?: string;
  error?: string;
}

interface UploadResponse {
  message: string;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: UploadResult[];
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkUploadDialog({ open, onOpenChange }: BulkUploadDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      toast({
        title: 'Invalid File',
        description: 'Please select a JSON file',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    setUploadResults(null);

    // Read and parse file
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setFileContent(json);
      
      // Basic validation
      if (!json.templates || !Array.isArray(json.templates)) {
        throw new Error('Invalid format: missing "templates" array');
      }
      
      toast({
        title: 'File Loaded',
        description: `Found ${json.templates.length} template(s) to upload`
      });
    } catch (error: any) {
      toast({
        title: 'Parse Error',
        description: error.message || 'Failed to parse JSON file',
        variant: 'destructive'
      });
      setSelectedFile(null);
      setFileContent(null);
    }
  };

  const handleUpload = async () => {
    if (!fileContent || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress (since we don't have real progress feedback)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/admin/api/learning-templates/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileContent)
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data: UploadResponse = await response.json();
      setUploadResults(data);

      // Invalidate queries to refresh the templates list
      queryClient.invalidateQueries({ queryKey: ['templates'] });

      if (data.summary.successful > 0) {
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${data.summary.successful} of ${data.summary.total} templates`
        });
      } else {
        toast({
          title: 'Upload Failed',
          description: 'All templates failed to upload. Check the results for details.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload templates',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileContent(null);
    setUploadResults(null);
    setUploadProgress(0);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const downloadExampleFile = () => {
    const exampleContent = {
      version: "1.0",
      templates: [
        {
          name: "Example Template",
          description: "This is an example template",
          icon: "book-open-page-variant",
          isActive: true,
          options: [
            {
              name: "Example Option",
              description: "Example learning approach",
              phases: [
                {
                  title: "Phase 1",
                  description: "First phase",
                  icon: "brain",
                  color: "rgba(98, 102, 241, 1)",
                  backgroundColor: "rgba(98, 102, 241, 0.1)",
                  metrics: [
                    {
                      name: "Time Spent",
                      description: "Time spent on this phase",
                      type: "time",
                      defaultValue: 0
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(exampleContent, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'example-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Progress bar component (inline since we might not have Progress component)
  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
      <div 
        className="bg-primary h-full transition-all duration-300 ease-in-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Learning Templates</DialogTitle>
          <DialogDescription>
            Upload multiple learning templates at once using a JSON file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Instructions
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Upload a JSON file containing one or more learning templates.
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400"
                    onClick={downloadExampleFile}
                    type="button"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download example JSON file
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Input */}
          {!uploadResults && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileJson className="h-12 w-12 mx-auto text-primary" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {fileContent?.templates?.length || 0} template(s) found
                    </p>
                    <div className="flex justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        type="button"
                      >
                        Choose Different File
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        disabled={isUploading}
                        type="button"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {showPreview ? 'Hide' : 'Show'} Preview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="font-medium">Choose a JSON file</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      type="button"
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>

              {/* Preview */}
              {showPreview && fileContent && (
                <div className="border rounded-lg p-4 bg-muted">
                  <p className="text-sm font-medium mb-2">File Preview:</p>
                  <pre className="text-xs overflow-x-auto max-h-48 bg-background p-2 rounded">
                    {JSON.stringify(fileContent, null, 2)}
                  </pre>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading templates...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <ProgressBar value={uploadProgress} />
                </div>
              )}
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{uploadResults.summary.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-green-50 dark:bg-green-950">
                  <p className="text-2xl font-bold text-green-600">
                    {uploadResults.summary.successful}
                  </p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
                <div className="border rounded-lg p-4 text-center bg-red-50 dark:bg-red-950">
                  <p className="text-2xl font-bold text-red-600">
                    {uploadResults.summary.failed}
                  </p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>

              {/* Individual Results */}
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <div className="space-y-2 p-4">
                  {uploadResults.results.map((result, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2 p-3 rounded-md",
                        result.success 
                          ? "bg-green-50 dark:bg-green-950" 
                          : "bg-red-50 dark:bg-red-950"
                      )}
                    >
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{result.templateName}</p>
                        {result.success && result.templateId && (
                          <p className="text-xs text-muted-foreground">
                            ID: {result.templateId}
                          </p>
                        )}
                        {!result.success && result.error && (
                          <p className="text-xs text-red-600 mt-1">{result.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {uploadResults ? (
            <>
              <Button variant="outline" onClick={handleReset} type="button">
                Upload Another File
              </Button>
              <Button onClick={handleClose} type="button">
                Done
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isUploading} type="button">
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isUploading}
                type="button"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Templates
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}