import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { formatDisplayDate } from "@/lib/dates";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: stats = { dueToday: 0, thisWeek: 0, completed: 0, totalActive: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/current"],
  });

  const handleViewAllAssignments = () => {
    setLocation("/assignments");
  };

  const handleViewFullCalendar = () => {
    setLocation("/calendar");
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 mb-2" data-testid="welcome-message">
                Welcome back, <span>{(currentUser as any)?.name || "Student"}</span>!
              </h2>
              <p className="text-gray-600" data-testid="today-date">
                Today is {formatDisplayDate(new Date())}
              </p>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <StatsCards stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upcoming Assignments */}
          <div className="lg:col-span-2">
            <UpcomingAssignments onViewAll={handleViewAllAssignments} />
          </div>

          {/* Right Column: Mini Calendar & Quick Actions */}
          <div className="space-y-6">
            <MiniCalendar onViewFull={handleViewFullCalendar} />
            <QuickActions />
          </div>
        </div>
      </div>

      <FloatingActionButton onClick={handleOpenForm} />
      
      <AssignmentForm
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}
