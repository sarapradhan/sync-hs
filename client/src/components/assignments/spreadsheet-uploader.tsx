import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MATERIAL_ICONS } from "@/lib/constants";
import type { UploadResult } from "@uppy/core";

interface SpreadsheetUploaderProps {
  onSuccess?: () => void;
}

export function SpreadsheetUploader({ onSuccess }: SpreadsheetUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getUploadUrlMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/spreadsheet/upload-url", {});
      const data = await response.json();
      return data;
    },
  });

  const processSpreadsheetMutation = useMutation({
    mutationFn: async (uploadData: { uploadURL: string; filename: string }) => {
      const response = await apiRequest("POST", "/api/spreadsheet/process", {
        uploadURL: uploadData.uploadURL,
        filename: uploadData.filename,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      setUploadProgress(100);
      setProcessingStatus(`✅ Successfully imported ${data.assignmentsCreated} assignments!`);
      
      toast({
        title: "Spreadsheet Imported Successfully!",
        description: `Created ${data.assignmentsCreated} assignments from your spreadsheet.`,
      });

      // Refresh assignments data
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      onSuccess?.();
    },
    onError: (error: any) => {
      setIsProcessing(false);
      setProcessingStatus(`❌ Error: ${error.message}`);
      
      toast({
        title: "Import Failed",
        description: error.message || "Failed to process spreadsheet",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const data = await getUploadUrlMutation.mutateAsync();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL as string;
      const filename = uploadedFile.name as string;

      setIsProcessing(true);
      setUploadProgress(25);
      setProcessingStatus("📄 Processing spreadsheet...");

      // Simulate processing steps for better UX
      setTimeout(() => {
        setUploadProgress(50);
        setProcessingStatus("📋 Parsing assignments...");
      }, 1000);

      setTimeout(() => {
        setUploadProgress(75);
        setProcessingStatus("📅 Creating calendar entries...");
      }, 2000);

      setTimeout(async () => {
        await processSpreadsheetMutation.mutateAsync({ uploadURL, filename });
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="material-icons text-material-blue-500">{MATERIAL_ICONS.upload}</span>
          Import Assignments from Spreadsheet
        </CardTitle>
        <CardDescription>
          Upload an Excel or CSV file to automatically create assignments and calendar entries. 
          Your spreadsheet should include columns for Title, Subject, Due Date, and optionally Description, Priority, and Teacher.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Instructions */}
        <Alert>
          <span className="material-icons mr-2">info</span>
          <AlertDescription>
            <strong>Spreadsheet Format:</strong> Include columns for Title, Subject, Due Date (YYYY-MM-DD format), 
            Description (optional), Priority (low/medium/high), and Teacher (optional).
          </AlertDescription>
        </Alert>

        {/* Upload Button */}
        {!isProcessing && (
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={5242880} // 5MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full bg-material-blue-500 hover:bg-material-blue-600 text-white"
          >
            <div className="flex items-center justify-center gap-3 py-8">
              <span className="material-icons text-2xl">cloud_upload</span>
              <div className="text-center">
                <div className="text-lg font-medium">Upload Spreadsheet</div>
                <div className="text-sm opacity-80">Click to select Excel (.xlsx) or CSV file</div>
              </div>
            </div>
          </ObjectUploader>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">{processingStatus}</div>
              <Progress value={uploadProgress} className="w-full" />
              <div className="text-sm text-gray-500 mt-2">{uploadProgress}% complete</div>
            </div>
          </div>
        )}

        {/* Success/Error Status */}
        {!isProcessing && processingStatus && (
          <div className="text-center">
            <div className="text-lg font-medium">{processingStatus}</div>
            {processingStatus.includes("✅") && (
              <Button 
                className="mt-4" 
                onClick={() => {
                  setProcessingStatus("");
                  setUploadProgress(0);
                }}
              >
                Upload Another File
              </Button>
            )}
          </div>
        )}

        {/* Sample Format */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-material-blue-500 hover:text-material-blue-600">
            View Sample Spreadsheet Format
          </summary>
          <div className="mt-3 p-4 bg-gray-50 rounded-md">
            <div className="text-sm font-mono">
              <div className="grid grid-cols-6 gap-2 mb-2 font-bold">
                <div>Title</div>
                <div>Subject</div>
                <div>Due Date</div>
                <div>Description</div>
                <div>Priority</div>
                <div>Teacher</div>
              </div>
              <div className="grid grid-cols-6 gap-2 text-xs">
                <div>Math Homework</div>
                <div>Mathematics</div>
                <div>2025-08-25</div>
                <div>Chapter 5 exercises</div>
                <div>medium</div>
                <div>Mr. Smith</div>
              </div>
              <div className="grid grid-cols-6 gap-2 text-xs">
                <div>History Essay</div>
                <div>History</div>
                <div>2025-08-30</div>
                <div>WWI research paper</div>
                <div>high</div>
                <div>Ms. Johnson</div>
              </div>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}