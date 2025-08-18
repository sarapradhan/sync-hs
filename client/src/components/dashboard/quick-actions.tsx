import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MATERIAL_ICONS } from "@/lib/constants";
import { SpreadsheetUploader } from "@/components/assignments/spreadsheet-uploader";
import { DataManagement } from "@/components/ui/data-management";

export function QuickActions() {
  const { toast } = useToast();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const importCalendarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/google/calendar/import", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Import Started",
        description: "Google Calendar import is in progress...",
      });
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to import from Google Calendar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportSheetsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/google/sheets/export", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Export Started",
        description: "Your schedule is being exported to Google Sheets...",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export to Google Sheets. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = () => {
    setIsUploadDialogOpen(true);
  };

  const actions = [
    {
      title: "📅 Import from Google Calendar",
      description: "Sync your existing events",
      icon: MATERIAL_ICONS.calendar,
      bgColor: "bg-blue-500 bg-opacity-10",
      iconColor: "text-blue-500",
      onClick: () => importCalendarMutation.mutate(),
      testId: "button-import-calendar",
      disabled: importCalendarMutation.isPending,
    },
    {
      title: "📊 Import Assignment Files",
      description: "Upload Excel/CSV files with your assignments",
      icon: MATERIAL_ICONS.upload,
      bgColor: "bg-green-500 bg-opacity-10",
      iconColor: "text-green-500",
      onClick: handleFileUpload,
      testId: "button-upload-spreadsheet",
      disabled: false,
    },
    {
      title: "📤 Export to Google Sheets",
      description: "Download your schedule",
      icon: MATERIAL_ICONS.export,
      bgColor: "bg-orange-500 bg-opacity-10",
      iconColor: "text-orange-500",
      onClick: () => exportSheetsMutation.mutate(),
      testId: "button-export-sheets",
      disabled: exportSheetsMutation.isPending,
    },

  ];

  return (
    <>
      <Card className="shadow-material-1" data-testid="quick-actions">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900">Quick Actions - v2.0</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action) => (
              <Button
                key={action.testId}
                variant="ghost"
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors h-auto"
                onClick={action.onClick}
                disabled={action.disabled}
                data-testid={action.testId}
              >
                <div className={`p-2 ${action.bgColor} rounded-lg flex-shrink-0`}>
                  <span className={`material-icons ${action.iconColor} text-sm`}>
                    {action.icon}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            ))}
            
            {/* Data Management Section */}
            <div className="pt-3 border-t border-gray-200">
              <DataManagement />
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Spreadsheet</DialogTitle>
          </DialogHeader>
          <SpreadsheetUploader onClose={() => setIsUploadDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
