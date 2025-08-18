import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MATERIAL_ICONS, PRIORITY_COLORS, SUBJECT_COLORS } from "@/lib/constants";
import { formatDueDate, getDueDateColor } from "@/lib/dates";
import type { Assignment } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
  onToggleComplete: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
  onClick?: (assignment: Assignment) => void;
}

export function AssignmentCard({ assignment, onEdit, onToggleComplete, onDelete, onClick }: AssignmentCardProps) {
  const priorityStyle = PRIORITY_COLORS[assignment.priority];
  const subjectStyle = SUBJECT_COLORS[assignment.subject as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.Other;
  const dueDateColor = getDueDateColor(new Date(assignment.dueDate));

  const handleClick = () => {
    if (onClick) {
      onClick(assignment);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(assignment);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(assignment);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(assignment);
    }
  };

  return (
    <Card 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-material-2 transition-shadow cursor-pointer"
      onClick={handleClick}
      data-testid={`assignment-card-${assignment.id}`}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Badge className={`${priorityStyle.bg} ${priorityStyle.text}`}>
                {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
              </Badge>
              <Badge variant="secondary" className={subjectStyle}>
                {assignment.subject}
              </Badge>
            </div>
            <h4 
              className="text-base font-medium text-gray-900 mb-1" 
              data-testid={`assignment-title-${assignment.id}`}
            >
              {assignment.title}
            </h4>
            {assignment.description && (
              <p 
                className="text-sm text-gray-600 mb-2" 
                data-testid={`assignment-description-${assignment.id}`}
              >
                {assignment.description}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="material-icons text-xs">{MATERIAL_ICONS.schedule}</span>
                <span className={dueDateColor} data-testid={`assignment-due-date-${assignment.id}`}>
                  {formatDueDate(new Date(assignment.dueDate))}
                </span>
              </div>
              {assignment.teacher && (
                <div className="flex items-center space-x-1">
                  <span className="material-icons text-xs">{MATERIAL_ICONS.person}</span>
                  <span data-testid={`assignment-teacher-${assignment.id}`}>{assignment.teacher}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              onClick={handleEdit}
              data-testid={`button-edit-assignment-${assignment.id}`}
            >
              <span className="material-icons text-sm text-gray-400">{MATERIAL_ICONS.edit}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 hover:bg-green-100 rounded-md transition-colors"
              onClick={handleToggleComplete}
              data-testid={`button-complete-assignment-${assignment.id}`}
            >
              <span className="material-icons text-sm text-gray-400">{MATERIAL_ICONS.check}</span>
            </Button>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 hover:bg-red-100 rounded-md transition-colors"
                    data-testid={`button-delete-assignment-${assignment.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="material-icons text-sm text-red-400">{MATERIAL_ICONS.delete}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        {assignment.progress !== null && assignment.progress !== undefined && assignment.progress > 0 && (
          <div className="mt-3">
            <Progress 
              value={assignment.progress} 
              className="h-2"
              data-testid={`assignment-progress-${assignment.id}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
