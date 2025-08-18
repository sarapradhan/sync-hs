import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DataManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearDataMutation = useMutation({
    mutationFn: () => apiRequest("/api/data/clear", "DELETE"),
    onSuccess: () => {
      toast({
        title: "Data Cleared",
        description: "All assignments and data have been successfully cleared.",
      });
      
      // Invalidate all queries to refresh the UI
      queryClient.invalidateQueries();
      
      setIsAlertOpen(false);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to clear data. Please try again.",
        variant: "destructive",
      });
      console.error("Error clearing data:", error);
    },
  });

  const handleClearData = () => {
    clearDataMutation.mutate();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="button-data-management"
        >
          <Settings className="h-4 w-4" />
          Data Management
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Data Management</DialogTitle>
          <DialogDescription>
            Manage your application data and settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <h3 className="font-medium">Clear All Data</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              This will permanently delete all assignments, upload logs, and reset subjects to defaults. 
              User accounts will be preserved.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsAlertOpen(true)}
              disabled={clearDataMutation.isPending}
              data-testid="button-clear-data"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            data-testid="button-close-dialog"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All assignments and tasks</li>
                <li>All upload history and logs</li>
                <li>All custom subjects (will reset to defaults)</li>
              </ul>
              <strong className="block mt-2">User accounts will be preserved.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-clear">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              disabled={clearDataMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-clear"
            >
              {clearDataMutation.isPending ? "Clearing..." : "Yes, clear all data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}