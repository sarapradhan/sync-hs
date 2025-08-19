import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Link, Unlink, RotateCw, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function CalendarSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Check calendar connection status
  const { data: calendarStatus, isLoading } = useQuery({
    queryKey: ["/api/calendar/status"],
  });

  // Disconnect calendar mutation
  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("/api/calendar/disconnect", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/status"] });
      toast({
        title: "Calendar Disconnected",
        description: "Google Calendar has been disconnected successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar.",
        variant: "destructive",
      });
    },
  });

  // Sync existing assignments to calendar
  const syncMutation = useMutation({
    mutationFn: () => apiRequest("/api/assignments/sync-calendar", "POST"),
    onSuccess: (data: any) => {
      toast({
        title: "Sync Complete",
        description: `${data.syncedCount} assignments synced to Google Calendar.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync assignments to calendar.",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    // Redirect to Google OAuth
    window.location.href = "/auth/google/calendar";
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const handleSync = () => {
    syncMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading calendar status...</div>
        </CardContent>
      </Card>
    );
  }

  const isConnected = (calendarStatus as any)?.connected;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {isConnected ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {isConnected
            ? "Your assignments can be automatically synced to Google Calendar."
            : "Connect your Google Calendar to automatically sync assignments as calendar events."}
        </div>

        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button
                onClick={handleSync}
                variant="default"
                disabled={syncMutation.isPending}
                className="flex items-center gap-2"
              >
                <RotateCw className="h-4 w-4" />
                {syncMutation.isPending ? "Syncing..." : "Sync Existing Assignments"}
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                disabled={disconnectMutation.isPending}
                className="flex items-center gap-2"
              >
                <Unlink className="h-4 w-4" />
                {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Google Calendar"}
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium mb-1">How it works:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• New assignments are automatically added to your calendar</li>
              <li>• Assignment changes update the calendar event</li>
              <li>• Deleting assignments removes the calendar event</li>
              <li>• Events are set 1 hour before the due time with reminders</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}