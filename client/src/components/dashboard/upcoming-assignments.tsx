import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { MATERIAL_ICONS } from "@/lib/constants";
import type { Assignment } from "@shared/schema";

interface UpcomingAssignmentsProps {
  onViewAll: () => void;
}

export function UpcomingAssignments({ onViewAll }: UpcomingAssignmentsProps) {
  const [filter, setFilter] = useState("all");
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["/api/assignments/upcoming", { limit: 5 }],
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["/api/subjects"],
  });

  const filteredAssignments = (assignments as Assignment[]).filter((assignment: Assignment) => {
    if (filter === "all") return true;
    return assignment.subject.toLowerCase() === filter.toLowerCase();
  });

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleToggleComplete = async (assignment: Assignment) => {
    // This would be implemented with a mutation to update assignment status
    console.log("Toggle complete for:", assignment.id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(undefined);
  };

  if (isLoading) {
    return (
      <Card className="shadow-material-1">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-material-1" data-testid="upcoming-assignments-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-900">
              Upcoming Assignments
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40" data-testid="select-filter-subject">
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
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                data-testid="button-toggle-view"
              >
                <span className="material-icons text-sm">{MATERIAL_ICONS.assignment}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4" data-testid="assignments-list">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500" data-testid="no-assignments">
                No upcoming assignments found.
              </div>
            ) : (
              filteredAssignments.map((assignment: Assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEdit={handleEdit}
                  onToggleComplete={handleToggleComplete}
                />
              ))
            )}
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              className="text-material-blue-700 hover:text-material-blue-500 font-medium text-sm"
              onClick={onViewAll}
              data-testid="button-view-all"
            >
              View All Assignments
            </Button>
          </div>
        </CardContent>
      </Card>

      <AssignmentForm
        open={isFormOpen}
        onClose={handleCloseForm}
        assignment={editingAssignment}
      />
    </>
  );
}
