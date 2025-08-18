import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { MATERIAL_ICONS } from "@/lib/constants";
import type { Assignment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Assignments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  // Delete single assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("DELETE", `/api/assignments/${assignmentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Assignment Deleted",
        description: "Assignment has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Clear all assignments mutation
  const clearAllAssignmentsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/assignments", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "All Assignments Cleared",
        description: "All assignments have been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Clear Failed",
        description: "Failed to clear assignments. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredAssignments = (assignments as Assignment[]).filter((assignment: Assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    const matchesSubject = subjectFilter === "all" || assignment.subject.toLowerCase() === subjectFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleToggleComplete = async (assignment: Assignment) => {
    // This would be implemented with a mutation
    console.log("Toggle complete for:", assignment.id);
  };

  const handleDelete = (assignment: Assignment) => {
    deleteAssignmentMutation.mutate(assignment.id);
  };

  const handleClearAll = () => {
    clearAllAssignmentsMutation.mutate();
  };

  const handleOpenForm = () => {
    setEditingAssignment(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6" data-testid="assignments-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-6" data-testid="page-title">
            All Assignments
          </h1>

          {/* Filters */}
          <Card className="shadow-material-1 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger data-testid="select-subject-filter">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {(subjects as any[]).map((subject) => (
                      <SelectItem key={subject.id} value={subject.name.toLowerCase()}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button onClick={handleOpenForm} data-testid="button-add-assignment">
                    <span className="material-icons text-sm mr-2">{MATERIAL_ICONS.add}</span>
                    Add Assignment
                  </Button>
                  {(assignments as Assignment[]).length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          data-testid="button-clear-all-assignments"
                          disabled={clearAllAssignmentsMutation.isPending}
                        >
                          <span className="material-icons text-sm mr-2">{MATERIAL_ICONS.delete}</span>
                          Clear All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear All Assignments</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete all assignments? This action cannot be undone and will remove all {(assignments as Assignment[]).length} assignments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearAll}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Clear All Assignments
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600" data-testid="results-count">
            Showing {filteredAssignments.length} of {(assignments as Assignment[]).length} assignments
          </div>

          {/* Assignments List */}
          <div className="space-y-4" data-testid="assignments-list">
            {filteredAssignments.length === 0 ? (
              <Card className="shadow-material-1">
                <CardContent className="py-12 text-center">
                  <div className="text-gray-500" data-testid="no-assignments">
                    {searchTerm || statusFilter !== "all" || subjectFilter !== "all" 
                      ? "No assignments match your search criteria."
                      : "No assignments found. Create your first assignment to get started!"
                    }
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredAssignments.map((assignment: Assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEdit={handleEdit}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={handleOpenForm} />
      
      <AssignmentForm
        open={isFormOpen}
        onClose={handleCloseForm}
        assignment={editingAssignment}
      />
    </div>
  );
}
