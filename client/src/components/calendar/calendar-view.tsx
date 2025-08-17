import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import type { Assignment } from "@shared/schema";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getAssignmentsForDate = (date: Date) => {
    return (assignments as Assignment[]).filter((assignment: Assignment) => {
      const assignmentDate = new Date(assignment.dueDate);
      return isSameDay(assignmentDate, date);
    });
  };

  const renderCalendarDay = (day: Date) => {
    const dayAssignments = getAssignmentsForDate(day);
    const formattedDate = format(day, "d");

    return (
      <div
        key={day.toString()}
        className={`min-h-[120px] p-2 border border-gray-200 ${
          !isSameMonth(day, monthStart)
            ? "bg-gray-50 text-gray-400"
            : isToday(day)
            ? "bg-blue-50"
            : "bg-white"
        }`}
        data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
      >
        <div className={`text-sm font-medium mb-1 ${
          isToday(day) ? "text-blue-600" : ""
        }`}>
          {formattedDate}
        </div>
        <div className="space-y-1">
          {dayAssignments.slice(0, 3).map((assignment: Assignment) => (
            <div
              key={assignment.id}
              className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
              title={assignment.title}
              data-testid={`calendar-assignment-${assignment.id}`}
            >
              {assignment.title}
            </div>
          ))}
          {dayAssignments.length > 3 && (
            <div className="text-xs text-gray-500">
              +{dayAssignments.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(renderCalendarDay(day));
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const onPrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <Card className="shadow-material-1" data-testid="calendar-view">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-4">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
                data-testid="button-month-view"
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
                data-testid="button-week-view"
              >
                Week
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={onPrevMonth}
              data-testid="button-prev-month"
            >
              <span className="material-icons text-sm">chevron_left</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextMonth}
              data-testid="button-next-month"
            >
              <span className="material-icons text-sm">chevron_right</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 mb-0">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-sm font-medium text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Body */}
        <div className="space-y-0">
          {renderCalendarGrid()}
        </div>
      </CardContent>
    </Card>
  );
}
