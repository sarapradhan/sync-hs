import { useState } from "react";
import { CalendarView } from "@/components/calendar/calendar-view";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

export default function Calendar() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6" data-testid="calendar-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-6" data-testid="page-title">
            Calendar
          </h1>
          
          <CalendarView />
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
