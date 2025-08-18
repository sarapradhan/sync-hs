import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { MATERIAL_ICONS } from "@/lib/constants";

interface SpreadsheetUploaderProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function SpreadsheetUploader({ onSuccess, onClose }: SpreadsheetUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadSpreadsheetMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/spreadsheet/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      setUploadProgress(100);
      
      if (data.assignmentsCreated > 0) {
        setProcessingStatus(`✅ Successfully imported ${data.assignmentsCreated} assignments!`);
        
        toast({
          title: "Spreadsheet Imported Successfully!",
          description: `Created ${data.assignmentsCreated} assignments from your spreadsheet.`,
        });

        // Refresh all related data to update calendar and assignments
        queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/assignments/upcoming"] });
        queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
        
        onSuccess?.();
      } else {
        // Show errors when no assignments were created
        const errorMessage = data.errors && data.errors.length > 0 
          ? data.errors.slice(0, 3).join('; ')
          : "No assignments were created. Check your spreadsheet format.";
        
        setProcessingStatus(`❌ ${errorMessage}`);
        
        toast({
          title: "Import Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setProcessingStatus("");
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel (.xlsx, .xls) or CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

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
      await uploadSpreadsheetMutation.mutateAsync(selectedFile);
    }, 3000);
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

        {/* Upload Section */}
        {!isProcessing && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:outline-none"
                disabled={isProcessing}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="w-full h-16 text-lg bg-material-blue-500 hover:bg-material-blue-600 text-white rounded-lg shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="material-icons text-2xl">cloud_upload</span>
                <span>{isProcessing ? "Processing..." : "Upload Spreadsheet"}</span>
              </div>
            </Button>
          </div>
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