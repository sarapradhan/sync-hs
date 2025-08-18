import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertTriangle, Calendar } from "lucide-react";
import type { Assignment } from "@shared/schema";

interface AssignmentSummary extends Assignment {
  daysUntilDue: number;
}

export function SummaryView() {
  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse">
              <CardContent className="flex items-center justify-center h-full">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalAssignments = assignments.length;
  const completedCount = assignments.filter(a => a.status === "completed").length;
  const inProgressCount = assignments.filter(a => a.status === "in-progress").length;
  const notStartedCount = assignments.filter(a => a.status === "pending").length;
  const completionRate = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;

  // Calculate assignments with grades
  const assignmentsWithGrades = assignments.filter(a => a.pointsEarned !== null && a.pointsPossible !== null);
  const totalPointsEarned = assignmentsWithGrades.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
  const totalPointsPossible = assignmentsWithGrades.reduce((sum, a) => sum + (a.pointsPossible || 0), 0);
  const averageGrade = totalPointsPossible > 0 ? Math.round((totalPointsEarned / totalPointsPossible) * 100) : 0;

  // Prepare assignments with days until due
  const assignmentsWithDays: AssignmentSummary[] = assignments.map(assignment => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      ...assignment,
      daysUntilDue
    };
  });

  // Sort assignments by due date
  const sortedAssignments = assignmentsWithDays.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6" data-testid="summary-view">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Percent Submitted */}
        <Card className="shadow-material-1">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Percent Submitted</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ec4899"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(completionRate * 251.2) / 100} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="shadow-material-1">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="text-sm text-gray-600">in progress</span>
                </div>
                <span className="text-sm font-medium">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                  <span className="text-sm text-gray-600">complete</span>
                </div>
                <span className="text-sm font-medium">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                  <span className="text-sm text-gray-600">not started</span>
                </div>
                <span className="text-sm font-medium">{notStartedCount}</span>
              </div>
            </div>
            
            {/* Status bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full flex">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${totalAssignments > 0 ? (inProgressCount / totalAssignments) * 100 : 0}%` }}
                ></div>
                <div 
                  className="bg-red-400 h-full" 
                  style={{ width: `${totalAssignments > 0 ? (completedCount / totalAssignments) * 100 : 0}%` }}
                ></div>
                <div 
                  className="bg-gray-300 h-full" 
                  style={{ width: `${totalAssignments > 0 ? (notStartedCount / totalAssignments) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            {/* Numbers */}
            <div className="flex justify-center space-x-8 text-xs text-gray-500 pt-2">
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </CardContent>
        </Card>

        {/* Grades */}
        <Card className="shadow-material-1">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Grades</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${(averageGrade * 251.2) / 100} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{averageGrade}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Table */}
      <Card className="shadow-material-1">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900">Assignment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Description</th>
                  <th className="text-left py-3 px-2">Due Date</th>
                  <th className="text-left py-3 px-2">Due Time</th>
                  <th className="text-left py-3 px-2">Class</th>
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Assignment</th>
                  <th className="text-left py-3 px-2">Days Until</th>
                  <th className="text-left py-3 px-2">To Do</th>
                  <th className="text-left py-3 px-2">Points Earned</th>
                  <th className="text-left py-3 px-2">Points Possible</th>
                  <th className="text-left py-3 px-2">Grade</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sortedAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-8 text-gray-500">
                      No assignments found. Upload a spreadsheet or create assignments to see them here.
                    </td>
                  </tr>
                ) : (
                  sortedAssignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`assignment-row-${assignment.id}`}>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.status)}
                          <Badge variant="secondary" className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-2 max-w-48">
                        <div className="truncate font-medium text-gray-900">{assignment.title}</div>
                        {assignment.description && (
                          <div className="text-xs text-gray-500 truncate">{assignment.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {new Date(assignment.dueDate).toLocaleTimeString('en-US', { 
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-xs">
                          {assignment.subject}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-600 capitalize">
                        {assignment.type || 'Assignment'}
                      </td>
                      <td className="py-3 px-2 max-w-32">
                        <div className="truncate text-gray-900">{assignment.title}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className={`text-sm ${assignment.daysUntilDue <= 1 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {assignment.daysUntilDue}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <input 
                          type="checkbox" 
                          checked={assignment.status === 'completed'} 
                          readOnly
                          className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        {assignment.pointsEarned ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {assignment.pointsPossible ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-center font-medium">
                        {assignment.pointsEarned && assignment.pointsPossible ? (
                          <span className={assignment.pointsEarned / assignment.pointsPossible >= 0.9 ? 'text-green-600' : assignment.pointsEarned / assignment.pointsPossible >= 0.8 ? 'text-yellow-600' : 'text-red-600'}>
                            {Math.round((assignment.pointsEarned / assignment.pointsPossible) * 100)}%
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}