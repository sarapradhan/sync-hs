import { CalendarSettings } from "@/components/calendar/calendar-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, Settings as SettingsIcon } from "lucide-react";

export function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Clear all data mutation
  const clearDataMutation = useMutation({
    mutationFn: () => apiRequest("/api/data/clear", "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Data Cleared",
        description: "All assignments and data have been cleared successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear data.",
        variant: "destructive",
      });
    },
  });

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      clearDataMutation.mutate();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Google Calendar Integration */}
      <CalendarSettings />

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Manage your assignment data and application settings.
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleClearData}
              variant="destructive"
              disabled={clearDataMutation.isPending}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {clearDataMutation.isPending ? "Clearing..." : "Clear All Data"}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">What gets cleared:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All assignments and task data</li>
              <li>• User preferences and settings</li>
              <li>• Calendar sync connections (if any)</li>
              <li>• Upload history and logs</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Zoo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Zoo is a comprehensive student assignment management system designed to help high school students organize their academic workload.</p>
            <p>Features include assignment tracking, calendar integration, progress monitoring, and data export capabilities.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}